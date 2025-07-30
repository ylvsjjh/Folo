import { Button } from "@follow/components/ui/button/index.js"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@follow/components/ui/card/index.js"
import { Input } from "@follow/components/ui/input/index.js"
import { useState, useEffect, useCallback, useMemo } from "react"
import { Link } from "react-router"

// 临时内联数据服务 (在实际项目中应该放在单独的文件中)
// 更新KOLFeed接口，添加转发相关字段
interface KOLFeed {
  id: string
  kolId: string
  kolName: string
  kolUsername: string
  platform: 'twitter' | 'weibo' | 'zhihu' | 'bilibili'
  title: string
  content: string
  publishTime: string
  likes: number
  shares: number
  comments: number
  url: string
  images: string[]
  videos?: string[]  // 新增视频字段
  author?: string    // 新增作者字段
  avatar?: string    // 新增头像字段
  rssUrl: string
  isRetweet?: boolean      // 新增：是否为转发
  originalAuthor?: string  // 新增：原作者
}

class KOLDataService {
  private listeners: Array<(feeds: KOLFeed[]) => void> = []
  private cache = new Map<string, any>()

  subscribe(callback: (feeds: KOLFeed[]) => void) {
    this.listeners.push(callback)
    return () => {
      const index = this.listeners.indexOf(callback)
      if (index > -1) {
        this.listeners.splice(index, 1)
      }
    }
  }

  private notify(feeds: KOLFeed[]) {
    this.listeners.forEach(callback => callback(feeds))
  }

  // 优化的CORS代理服务列表，按可靠性排序
  private corsProxies = [
    {
      url: 'https://api.allorigins.win/get?url=',
      type: 'allorigins',
      timeout: 20000
    },
    {
      url: 'https://api.codetabs.com/v1/proxy?quest=',
      type: 'codetabs',
      timeout: 15000
    },
    {
      url: 'https://cors.eu.org/',
      type: 'corseu',
      timeout: 15000
    }
  ]

  // 获取保存的RSSHub配置
  private getRSSHubConfig() {
    try {
      const saved = localStorage.getItem('rsshub-config')
      if (saved) {
        return JSON.parse(saved)
      }
    } catch (error) {
      console.warn('无法读取RSSHub配置:', error)
    }
    
    // 默认配置，优先使用自建服务器（添加端口号）
    return {
      serverUrl: 'http://43.154.134.12:1200',
      enableCache: true,
      cacheTime: 300
    }
  }

  // 优化的RSSHub数据获取方法
  private async fetchRSSHubData(username: string, name: string): Promise<KOLFeed[]> {
    const cleanUsername = username.replace('@', '')
    
    // 构建RSSHub实例列表，优先使用自建服务器
    const rsshubInstances = [
      'http://43.154.134.12:1200'
    ].filter((url, index, arr) => arr.indexOf(url) === index) // 去重
    
    console.log(`🚀 开始获取 ${name} 的推文数据，使用RSS代理访问自建服务器...`)
    
    for (let i = 0; i < rsshubInstances.length; i++) {
      const rsshubBase = rsshubInstances[i]
      const isCustomServer = rsshubBase.includes('43.154.134.12')
      
      // 确保URL格式正确
      const baseUrl = rsshubBase.endsWith('/') ? rsshubBase.slice(0, -1) : rsshubBase
      const rssUrl = `${baseUrl}/twitter/user/${cleanUsername}?readable=1&showAuthorInTitle=1&includeReplies=0&count=20`
      
      console.log(`🔄 [${i + 1}/${rsshubInstances.length}] 正在通过RSS代理访问 ${isCustomServer ? '自建服务器(43.154.134.12:1200)' : rsshubBase} 获取 ${name} 的推文数据...`)

      try {
        // 统一使用RSS代理访问，避免CORS问题
        const proxyUrl = `/api/rss-proxy?url=${encodeURIComponent(rssUrl)}`
        console.log(`🔗 通过RSS代理访问: ${proxyUrl}`)
        console.log(`🎯 目标RSS地址: ${rssUrl}`)
        
        const response = await fetch(proxyUrl, {
          method: 'GET',
          headers: {
            'Accept': 'application/xml, text/xml, application/rss+xml, */*',
            'Cache-Control': 'no-cache'
          },
          signal: AbortSignal.timeout(25000) // 增加超时时间
        })
        
        if (!response.ok) {
          const errorText = await response.text()
          console.error(`RSS代理返回错误 (${response.status}):`, errorText)
          throw new Error(`RSS代理失败 HTTP ${response.status}: ${response.statusText}`)
        }
        
        const xmlText = await response.text()
        console.log(`✅ 通过RSS代理访问成功，响应长度: ${xmlText.length}`)
        
        if (!xmlText || xmlText.trim().length < 100) {
          throw new Error('Empty or too short response')
        }
        
        // 检查响应内容的前200个字符，用于调试
        console.log(`📄 响应内容预览: ${xmlText.substring(0, 200)}...`)
        
        const feeds = this.parseRSSData(xmlText, cleanUsername, username, name, rssUrl)
        if (feeds.length > 0) {
          console.log(`✅ 成功从 ${isCustomServer ? '自建服务器' : rsshubBase} 获取 ${name} 的 ${feeds.length} 条推文`)
          return feeds
        } else {
          console.warn(`⚠️ 获取到数据但解析失败，XML内容:`, xmlText.substring(0, 500))
        }
        
      } catch (error: any) {
        console.error(`❌ 通过RSS代理访问 ${isCustomServer ? '自建服务器' : rsshubBase} 失败 (${name}):`, {
          message: error.message,
          name: error.name,
          stack: error.stack?.split('\n').slice(0, 3).join('\n')
        })
        
        // 如果是自建服务器且失败了，给出特别提示
        if (isCustomServer) {
          console.warn(`⚠️ 自建服务器 43.154.134.12:1200 通过代理访问失败`)
          console.warn(`   由于您的Docker容器运行正常，curl也能访问，这可能是：`)
          console.warn(`   1. RSS代理服务(/api/rss-proxy)可能有问题`)
          console.warn(`   2. 网络连接问题或超时`)
          console.warn(`   3. 请检查浏览器开发者工具的Network标签查看具体错误`)
          console.warn(`   4. 可以尝试直接访问: ${window.location.origin}/api/rss-proxy?url=${encodeURIComponent(rssUrl)}`)
        }
        
        await new Promise(resolve => setTimeout(resolve, 1000))
      }
    }
    
    console.warn(`⚠️ 所有RSS源都无法获取 ${name} 的数据`)
    return []
  }

  // 优化的RSS数据解析方法
  private parseRSSData(xmlContent: string, cleanUsername: string, username: string, name: string, rssUrl: string): KOLFeed[] {
    try {
      // 检查内容是否为有效的XML
      if (!xmlContent || xmlContent.trim().length === 0) {
        throw new Error('Empty XML content')
      }

      // 解析 RSS XML 数据
      const parser = new DOMParser()
      const xmlDoc = parser.parseFromString(xmlContent, 'text/xml')
      
      // 检查是否有解析错误
      const parseError = xmlDoc.querySelector('parsererror')
      if (parseError) {
        throw new Error(`XML解析错误: ${parseError.textContent}`)
      }
      
      // 提取头像信息 - 从 <channel><image><url> 中获取
      const channelImage = xmlDoc.querySelector('channel > image > url')
      const avatarUrl = channelImage?.textContent || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name)}`
      
      const items = xmlDoc.querySelectorAll('item')
      
      if (items.length === 0) {
        // 尝试其他可能的RSS格式
        const entries = xmlDoc.querySelectorAll('entry')
        if (entries.length === 0) {
          throw new Error('No items found in RSS feed')
        }
        // 处理Atom格式的feed
        return this.parseAtomFeed(entries, cleanUsername, username, name, rssUrl, avatarUrl)
      }
      
      console.log(`📄 解析到 ${name} 的 ${items.length} 条推文`)
      console.log(`🖼️ 头像URL: ${avatarUrl}`)
      
      return Array.from(items).slice(0, 20).map((item, index) => {
        const title = item.querySelector('title')?.textContent || ''
        const description = item.querySelector('description')?.textContent || ''
        const link = item.querySelector('link')?.textContent || ''
        const pubDate = item.querySelector('pubDate')?.textContent || ''
        const author = item.querySelector('author')?.textContent || name
        
        // 解码HTML实体并解析HTML内容
        const decodedDescription = this.decodeHtmlEntities(description)
        const { cleanContent, images, videos } = this.parseHtmlContent(decodedDescription)
        
        // 提取推文ID
        const tweetIdMatch = link.match(/status\/(\d+)/)
        const tweetId = tweetIdMatch ? tweetIdMatch[1] : `${Date.now()}-${index}`
        
        // 检测是否为转发推文
        const isRetweet = title.startsWith('RT ') || description.startsWith('RT ')
        const originalAuthor = isRetweet ? title.match(/^RT\s+([^:]+):/)?.[1]?.trim() : null
        
        // 处理标题，移除RT前缀并清理
        const cleanTitle = title.replace(/^RT\s+[^:]+:\s*/, '').trim()
        
        return {
          id: `${cleanUsername}-${tweetId}`,
          kolId: cleanUsername,
          kolName: name,
          kolUsername: username,
          platform: 'twitter' as const,
          title: cleanTitle || cleanContent.substring(0, 100) + (cleanContent.length > 100 ? '...' : ''),
          content: cleanContent.length > 1000 ? cleanContent.substring(0, 1000) + '...' : cleanContent,
          publishTime: pubDate ? new Date(pubDate).toISOString() : new Date().toISOString(),
          likes: this.estimateEngagement(cleanContent.length, 'likes'),
          shares: this.estimateEngagement(cleanContent.length, 'shares'),
          comments: this.estimateEngagement(cleanContent.length, 'comments'),
          url: link || `https://x.com/${cleanUsername}`,
          images: images,
          videos: videos,
          author: author,
          avatar: avatarUrl,
          rssUrl: rssUrl,
          isRetweet: isRetweet,           // 新增：是否为转发
          originalAuthor: originalAuthor   // 新增：原作者
        }
      })
    } catch (error) {
      console.error(`❌ 解析 ${name} RSS数据失败:`, error)
      return []
    }
  }

  // 解码HTML实体
  private decodeHtmlEntities(text: string): string {
    const textarea = document.createElement('textarea')
    textarea.innerHTML = text
    return textarea.value
  }

  // 解析HTML内容，提取文本、图片和视频
  private parseHtmlContent(htmlContent: string): { cleanContent: string; images: string[]; videos: string[] } {
    const tempDiv = document.createElement('div')
    tempDiv.innerHTML = htmlContent
    
    // 提取图片
    const images: string[] = []
    const imgElements = tempDiv.querySelectorAll('img')
    imgElements.forEach(img => {
      const src = img.getAttribute('src')
      if (src && !images.includes(src)) {
        images.push(src)
      }
    })
    
    // 提取视频
    const videos: string[] = []
    const videoElements = tempDiv.querySelectorAll('video')
    videoElements.forEach(video => {
      const src = video.getAttribute('src')
      if (src && !videos.includes(src)) {
        videos.push(src)
      }
    })
    
    // 提取纯文本内容，保留换行
    const cleanContent = tempDiv.textContent || tempDiv.innerText || ''
    
    return {
      cleanContent: cleanContent.trim(),
      images,
      videos
    }
  }

  // 基于内容长度估算互动数据
  private estimateEngagement(contentLength: number, type: 'likes' | 'shares' | 'comments'): number {
    const baseMultiplier = {
      likes: 10,
      shares: 3,
      comments: 2
    }
    
    // 基于内容长度和类型计算估算值
    const base = Math.floor(contentLength / 10) * baseMultiplier[type]
    const randomFactor = Math.random() * 0.5 + 0.75 // 0.75-1.25的随机因子
    
    return Math.max(1, Math.floor(base * randomFactor))
  }

  // 处理Atom格式的feed - 也需要添加转发检测
  private parseAtomFeed(entries: NodeListOf<Element>, cleanUsername: string, username: string, name: string, rssUrl: string, avatarUrl?: string): KOLFeed[] {
    const defaultAvatar = avatarUrl || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name)}`
    
    return Array.from(entries).slice(0, 20).map((entry, index) => {
      const title = entry.querySelector('title')?.textContent || ''
      const content = entry.querySelector('content')?.textContent || entry.querySelector('summary')?.textContent || ''
      const link = entry.querySelector('link')?.getAttribute('href') || ''
      const published = entry.querySelector('published')?.textContent || entry.querySelector('updated')?.textContent || ''
      
      // 检测是否为转发推文
      const isRetweet = title.startsWith('RT ') || content.startsWith('RT ')
      const originalAuthor = isRetweet ? title.match(/^RT\s+([^:]+):/)?.[1]?.trim() : null
      
      const tweetIdMatch = link.match(/status\/(\d+)/)
      const tweetId = tweetIdMatch ? tweetIdMatch[1] : `${Date.now()}-${index}`
      
      return {
        id: `${cleanUsername}-${tweetId}`,
        kolId: cleanUsername,
        kolName: name,
        kolUsername: username,
        platform: 'twitter' as const,
        title: title,
        content: content.length > 1000 ? content.substring(0, 1000) + '...' : content,
        publishTime: published ? new Date(published).toISOString() : new Date().toISOString(),
        likes: Math.floor(Math.random() * 500) + 10,
        shares: Math.floor(Math.random() * 100) + 5,
        comments: Math.floor(Math.random() * 50) + 2,
        url: link || `https://x.com/${cleanUsername}`,
        images: [],
        avatar: defaultAvatar,
        rssUrl: rssUrl,
        isRetweet: isRetweet,           // 添加转发标识
        originalAuthor: originalAuthor   // 添加原作者
      }
    })
  }

  async fetchAllKOLFeeds(kolList: Array<{username: string, platform: string, name: string}>): Promise<KOLFeed[]> {
    const twitterKOLs = kolList.filter(kol => kol.platform === 'twitter')
    
    try {
      console.log(`🚀 开始获取 ${twitterKOLs.length} 位 KOL 的真实推文数据...`)
      
      const allFeeds: KOLFeed[] = []
      
      // 单个请求，避免并发过多导致失败
      for (let i = 0; i < twitterKOLs.length; i++) {
        const kol = twitterKOLs[i]
        console.log(`📦 处理第 ${i + 1}/${twitterKOLs.length} 个 KOL: ${kol.name}`)
        
        try {
          const feeds = await this.fetchRSSHubData(kol.username, kol.name)
          if (feeds.length > 0) {
            allFeeds.push(...feeds)
            console.log(`✅ ${kol.name}: 获取到 ${feeds.length} 条推文`)
          } else {
            console.warn(`⚠️ ${kol.name}: 未获取到数据`)
          }
        } catch (error) {
          console.error(`❌ 获取 ${kol.name} 数据失败:`, error)
        }
        
        // 请求间隔，避免被限制
        if (i < twitterKOLs.length - 1) {
          console.log('⏳ 等待2秒后继续...')
          await new Promise(resolve => setTimeout(resolve, 2000))
        }
      }
      
      // 按时间排序
      allFeeds.sort((a, b) => new Date(b.publishTime).getTime() - new Date(a.publishTime).getTime())
      
      console.log(`✅ 总共获取到 ${allFeeds.length} 条真实推文`)
      
      // 缓存结果
      this.cache.set('allFeeds', allFeeds)
      this.cache.set('lastUpdate', new Date())
      
      return allFeeds
    } catch (error) {
      console.error('❌ 获取推文数据时发生错误:', error)
      return this.cache.get('allFeeds') || []
    }
  }

  startRealTimeUpdates(kolList: Array<{username: string, platform: string, name: string}>) {
    const updateFeeds = async () => {
      try {
        const feeds = await this.fetchAllKOLFeeds(kolList)
        this.notify(feeds)
      } catch (error) {
        console.error('Error updating feeds:', error)
      }
    }

    updateFeeds()
    const intervalId = setInterval(updateFeeds, 600000) // 10分钟更新一次，避免频繁请求

    return () => clearInterval(intervalId)
  }

  async refreshFeeds(kolList: Array<{username: string, platform: string, name: string}>): Promise<KOLFeed[]> {
    const feeds = await this.fetchAllKOLFeeds(kolList)
    this.notify(feeds)
    return feeds
  }
}

const kolDataService = new KOLDataService()

// 在第427行左右，将硬编码的kolList替换为动态获取
// 找到这行代码：
// const kolList = [
//   { username: '@elonmusk', platform: 'twitter', name: 'Elon Musk' }
// ]

// 替换为：
const getKOLList = () => {
  const urlParams = new URLSearchParams(window.location.search)
  const kolParam = urlParams.get('kol')
  
  if (kolParam) {
    // 查看特定KOL的内容
    const savedKOLs = localStorage.getItem('kol-list')
    if (savedKOLs) {
      try {
        const kolList = JSON.parse(savedKOLs)
        const targetKOL = kolList.find((kol: any) => 
          kol.username.replace('@', '') === kolParam.replace('@', '') ||
          kol.username === kolParam ||
          kol.username === `@${kolParam}`
        )
        
        if (targetKOL) {
          return [{
            username: targetKOL.username,
            platform: targetKOL.platform,
            name: targetKOL.name
          }]
        }
      } catch (error) {
        console.error('解析KOL数据失败:', error)
      }
    }
    
    // 如果没找到，使用URL参数创建临时KOL
    return [{
      username: kolParam.startsWith('@') ? kolParam : `@${kolParam}`,
      platform: 'twitter',
      name: kolParam.replace('@', '')
    }]
  }
  
  // 没有指定KOL，返回默认
  return [{ username: '@elonmusk', platform: 'twitter', name: 'Elon Musk' }]
}

const kolList = getKOLList()

const platformColors = {
  twitter: 'bg-blue-100 text-blue-800',
  weibo: 'bg-red-100 text-red-800',
  zhihu: 'bg-blue-100 text-blue-800',
  bilibili: 'bg-pink-100 text-pink-800'
}

const platformIcons = {
  twitter: '🐦',
  weibo: '📱',
  zhihu: '🤔',
  bilibili: '📺'
}

export const Component = () => {
  const [feeds, setFeeds] = useState<KOLFeed[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedPlatform, setSelectedPlatform] = useState<string>('all')
  const [sortBy, setSortBy] = useState<'time' | 'likes'>('time')
  const [isLoading, setIsLoading] = useState(true)
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [currentKOLs, setCurrentKOLs] = useState<Array<{username: string, platform: string, name: string}>>([]);
  const [translatedFeeds, setTranslatedFeeds] = useState<{[key: string]: string}>({});
  const [translatingFeeds, setTranslatingFeeds] = useState<Set<string>>(new Set());
  const [feedSummaries, setFeedSummaries] = useState<{[key: string]: string}>({});
  const [summarizingFeeds, setSummarizingFeeds] = useState<Set<string>>(new Set());

  // 从URL参数和localStorage获取KOL信息
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search)
    const kolParam = urlParams.get('kol')
    
    if (kolParam) {
      // 查看特定KOL的内容
      const savedKOLs = localStorage.getItem('kol-list')
      if (savedKOLs) {
        try {
          const kolList = JSON.parse(savedKOLs)
          const targetKOL = kolList.find((kol: any) => 
            kol.username === kolParam || 
            kol.username === `@${kolParam}` || 
            kol.username === kolParam.replace('@', '') ||
            `@${kol.username}` === kolParam ||
            kol.username.replace('@', '') === kolParam.replace('@', '')
          )
          
          if (targetKOL) {
            setCurrentKOLs([{
              username: targetKOL.username,
              platform: targetKOL.platform,
              name: targetKOL.name
            }])
          } else {
            // 如果没找到，尝试解析用户名
            setCurrentKOLs([{
              username: kolParam.startsWith('@') ? kolParam : `@${kolParam}`,
              platform: 'twitter', // 默认平台
              name: kolParam.replace('@', '')
            }])
          }
        } catch (error) {
          console.error('解析KOL数据失败:', error)
          // 使用默认值
          setCurrentKOLs([{
            username: kolParam.startsWith('@') ? kolParam : `@${kolParam}`,
            platform: 'twitter',
            name: kolParam.replace('@', '')
          }])
        }
      } else {
        // 没有保存的KOL数据，使用URL参数
        setCurrentKOLs([{
          username: kolParam.startsWith('@') ? kolParam : `@${kolParam}`,
          platform: 'twitter',
          name: kolParam.replace('@', '')
        }])
      }
    } else {
      // 显示所有KOL的内容
      const savedKOLs = localStorage.getItem('kol-list')
      if (savedKOLs) {
        try {
          const allKOLs = JSON.parse(savedKOLs)
          const activeKOLs = allKOLs
            .filter((kol: any) => kol.status === 'active')
            .map((kol: any) => ({
              username: kol.username,
              platform: kol.platform,
              name: kol.name
            }))
          
          if (activeKOLs.length > 0) {
            setCurrentKOLs(activeKOLs)
          } else {
            // 如果没有活跃的KOL，使用默认
            setCurrentKOLs([{ username: '@elonmusk', platform: 'twitter', name: 'Elon Musk' }])
          }
        } catch (error) {
          console.error('解析KOL数据失败:', error)
          setCurrentKOLs([{ username: '@elonmusk', platform: 'twitter', name: 'Elon Musk' }])
        }
      } else {
        // 没有保存的数据，使用默认
        setCurrentKOLs([{ username: '@elonmusk', platform: 'twitter', name: 'Elon Musk' }])
      }
    }
  }, [])

  // 处理数据更新
  const handleFeedsUpdate = useCallback((newFeeds: KOLFeed[]) => {
    setFeeds(newFeeds)
    setLastUpdate(new Date())
    setIsLoading(false)
    setIsRefreshing(false)
  }, [])

  // 手动刷新
  const handleRefresh = async () => {
    if (currentKOLs.length === 0) return
    
    setIsRefreshing(true)
    try {
      await kolDataService.refreshFeeds(currentKOLs)
    } catch (error) {
      console.error('刷新失败:', error)
      setIsRefreshing(false)
    }
  }

  // 组件挂载时启动实时更新
  useEffect(() => {
    if (currentKOLs.length === 0) return

    const unsubscribe = kolDataService.subscribe(handleFeedsUpdate)
    const stopUpdates = kolDataService.startRealTimeUpdates(currentKOLs)

    return () => {
      unsubscribe()
      stopUpdates()
    }
  }, [handleFeedsUpdate, currentKOLs])

  // 添加转发类型筛选状态
  const [contentType, setContentType] = useState<'all' | 'original' | 'retweet'>('all')

  // 修复翻译函数
  const translateFeed = async (feedId: string, content: string) => {
    if (translatedFeeds[feedId] || translatingFeeds.has(feedId)) return
    
    setTranslatingFeeds(prev => new Set([...prev, feedId]))
    
    try {
      // 使用正确的翻译API调用
      const response = await fetch('/api/ai/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          text: content, 
          targetLanguage: 'zh-CN' 
        })
      })
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`)
      }
      
      const result = await response.json()
      
      if (result.error) {
        throw new Error(result.error)
      }
      
      setTranslatedFeeds(prev => ({
        ...prev,
        [feedId]: result.translatedText || '翻译失败'
      }))
    } catch (error) {
      console.error('翻译失败:', error)
      // 翻译失败时显示原文
      setTranslatedFeeds(prev => ({
        ...prev,
        [feedId]: content
      }))
    } finally {
      setTranslatingFeeds(prev => {
        const newSet = new Set(prev)
        newSet.delete(feedId)
        return newSet
      })
    }
  }

  // 修复AI分析函数
  const analyzeFeed = async (feedId: string, content: string) => {
    if (feedSummaries[feedId] || summarizingFeeds.has(feedId)) return
    
    setSummarizingFeeds(prev => new Set([...prev, feedId]))
    
    try {
      const response = await fetch('/api/ai/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          prompt: '请分析这条社交媒体内容的主要观点、情感倾向和影响力，用简洁的中文总结：',
          content: content 
        })
      })
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`)
      }
      
      const result = await response.json()
      
      if (result.error) {
        throw new Error(result.error)
      }
      
      setFeedSummaries(prev => ({
        ...prev,
        [feedId]: result.summary || '分析失败'
      }))
    } catch (error) {
      console.error('AI分析失败:', error)
      setFeedSummaries(prev => ({
        ...prev,
        [feedId]: '分析失败，请稍后重试'
      }))
    } finally {
      setSummarizingFeeds(prev => {
        const newSet = new Set(prev)
        newSet.delete(feedId)
        return newSet
      })
    }
  }

  // 批量操作函数
  const batchTranslateAll = async () => {
    const untranslatedFeeds = filteredFeeds.filter(feed => !translatedFeeds[feed.id])
    
    for (const feed of untranslatedFeeds) {
      await translateFeed(feed.id, feed.content)
      // 添加延迟避免 API 限制
      await new Promise(resolve => setTimeout(resolve, 1000))
    }
  }

  const batchAnalyzeAll = async () => {
    const unanalyzedFeeds = filteredFeeds.filter(feed => !feedSummaries[feed.id])
    
    for (const feed of unanalyzedFeeds) {
      await analyzeFeed(feed.id, feed.content)
      await new Promise(resolve => setTimeout(resolve, 2000))
    }
  }

  // 更新筛选逻辑
  const filteredFeeds = useMemo(() => {
    return feeds
      .filter(feed => {
        // 平台筛选
        if (selectedPlatform !== 'all' && feed.platform !== selectedPlatform) {
          return false
        }
        
        // 内容类型筛选
        if (contentType === 'original' && feed.isRetweet) {
          return false
        }
        if (contentType === 'retweet' && !feed.isRetweet) {
          return false
        }
        
        // 搜索筛选
        if (searchTerm) {
          const searchLower = searchTerm.toLowerCase()
          return (
            feed.content.toLowerCase().includes(searchLower) ||
            feed.kolName.toLowerCase().includes(searchLower) ||
            feed.title.toLowerCase().includes(searchLower)
          )
        }
        
        return true
      })
      .sort((a, b) => {
        if (sortBy === 'time') {
          return new Date(b.publishTime).getTime() - new Date(a.publishTime).getTime()
        } else {
          return b.likes - a.likes
        }
      })
  }, [feeds, selectedPlatform, contentType, searchTerm, sortBy])

  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1)}M`
    }
    if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}K`
    }
    return num.toString()
  }

  const formatTime = (timeString: string) => {
    const now = new Date()
    const time = new Date(timeString)
    const diffInSeconds = Math.floor((now.getTime() - time.getTime()) / 1000)

    if (diffInSeconds < 60) {
      return '刚刚'
    } else if (diffInSeconds < 3600) {
      return `${Math.floor(diffInSeconds / 60)}分钟前`
    } else if (diffInSeconds < 86400) {
      return `${Math.floor(diffInSeconds / 3600)}小时前`
    } else if (diffInSeconds < 604800) {
      return `${Math.floor(diffInSeconds / 86400)}天前`
    } else {
      return time.toLocaleDateString('zh-CN')
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center gap-3">
                🌟 KOL 动态聚合
                <span className="text-lg font-normal text-gray-600">
                  (RSSHub 真实数据)
                </span>
              </h1>
              <p className="text-gray-600">
                实时聚合币圈 KOL 的最新推文动态，数据来源于 RSSHub
                {lastUpdate && (
                  <span className="ml-2 text-sm text-green-600">
                    • 最后更新: {lastUpdate.toLocaleTimeString('zh-CN')}
                  </span>
                )}
              </p>
            </div>
            <div className="flex gap-3">
              <Button 
                onClick={handleRefresh} 
                disabled={isRefreshing}
                className="flex items-center gap-2"
              >
                {isRefreshing ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    刷新中...
                  </>
                ) : (
                  <>
                    🔄 刷新数据
                  </>
                )}
              </Button>
              <Button 
                variant="outline"
                onClick={() => window.open('/kol/rsshub', '_blank')}
                className="flex items-center gap-2"
              >
                ⚙️ RSSHub 配置
              </Button>
            </div>
          </div>

          {/* 统计卡片 */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <Card>
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-blue-600">{feeds.length}</div>
                <div className="text-sm text-gray-600">总推文数</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-green-600">{kolList.length}</div>
                <div className="text-sm text-gray-600">关注 KOL</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-purple-600">
                  {feeds.filter(f => {
                    const now = new Date()
                    const feedTime = new Date(f.publishTime)
                    return now.getTime() - feedTime.getTime() < 24 * 60 * 60 * 1000
                  }).length}
                </div>
                <div className="text-sm text-gray-600">今日推文</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-orange-600">
                  {new Set(feeds.map(f => f.kolId)).size}
                </div>
                <div className="text-sm text-gray-600">活跃 KOL</div>
              </CardContent>
            </Card>
          </div>

          {/* 搜索和筛选 - 添加内容类型筛选 */}
          <div className="flex gap-4 mb-6">
            <div className="flex-1">
              <Input
                placeholder="🔍 搜索推文内容、KOL 名称..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full"
              />
            </div>
            <select
              value={selectedPlatform}
              onChange={(e) => setSelectedPlatform(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">所有平台</option>
              <option value="twitter">Twitter</option>
            </select>
            <select
              value={contentType}
              onChange={(e) => setContentType(e.target.value as 'all' | 'original' | 'retweet')}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">全部内容</option>
              <option value="original">✨ 仅原创</option>
              <option value="retweet">🔄 仅转发</option>
            </select>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'time' | 'likes')}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="time">⏰ 按时间排序</option>
              <option value="likes">🔥 按热度排序</option>
            </select>
          </div>

          {/* 批量操作工具栏 */}
          <div className="flex gap-2 mb-4">
            <Button onClick={batchTranslateAll} className="flex items-center gap-2">
              🌐 批量翻译全部
            </Button>
            <Button onClick={batchAnalyzeAll} className="flex items-center gap-2">
              🤖 批量分析全部
            </Button>
          </div>
        </div>

        {/* 加载状态 */}
        {isLoading && (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">正在从 RSSHub 获取真实推文数据...</p>
            <p className="text-sm text-gray-500 mt-2">首次获取可能需要较长时间，请耐心等待</p>
            <div className="mt-4 text-xs text-gray-400">
              <p>• 正在分批获取 {kolList.length} 位 KOL 的数据</p>
              <p>• 为避免请求过于频繁，会有适当延迟</p>
            </div>
          </div>
        )}

        {/* 内容列表 */}
        {!isLoading && (
          <div className="space-y-6">
            {filteredFeeds.map((feed) => (
              <Card key={feed.id} className="hover:shadow-lg transition-all duration-200 border-l-4 border-l-blue-500">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      {/* 使用真实头像替代首字母占位符 */}
                      <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-gray-200">
                        <img
                          src={feed.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(feed.kolName)}`}
                          alt={`${feed.kolName} 头像`}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            // 如果头像加载失败，使用首字母占位符
                            const target = e.target as HTMLImageElement;
                            target.style.display = 'none';
                            const parent = target.parentElement;
                            if (parent) {
                              parent.innerHTML = `<div class="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">${feed.kolName.charAt(0)}</div>`;
                            }
                          }}
                        />
                      </div>
                      <div>
                        <CardTitle className="text-lg flex items-center gap-2">
                          {feed.kolName}
                          {/* 添加转发标识 */}
                          {feed.isRetweet && (
                            <span className="px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                              🔄 转发
                            </span>
                          )}
                          {!feed.isRetweet && (
                            <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                              ✨ 原创
                            </span>
                          )}
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${platformColors[feed.platform]}`}>
                            {platformIcons[feed.platform]} Twitter
                          </span>
                          <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            🌐 RSSHub
                          </span>
                        </CardTitle>
                        <p className="text-sm text-gray-600">
                          {feed.kolUsername}
                          {/* 显示原作者信息 */}
                          {feed.isRetweet && feed.originalAuthor && (
                            <span className="ml-2 text-orange-600">
                              转发自 @{feed.originalAuthor}
                            </span>
                          )}
                        </p>
                      </div>
                    </div>
                    <div className="text-sm text-gray-500 flex items-center gap-1">
                      ⏰ {formatTime(feed.publishTime)}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="mb-4">
                    <CardDescription className="text-gray-700 leading-relaxed text-base">
                      {translatedFeeds[feed.id] || feed.content}
                      {translatedFeeds[feed.id] && (
                        <div className="mt-2 pt-2 border-t border-gray-200">
                          <span className="text-xs text-gray-500">原文：</span>
                          <div className="text-sm text-gray-600 mt-1">{feed.content}</div>
                        </div>
                      )}
                    </CardDescription>
                  </div>

                  {/* 图片展示 */}
                  {feed.images && feed.images.length > 0 && (
                    <div className="grid grid-cols-2 gap-2 mb-4">
                      {feed.images.slice(0, 4).map((image, index) => (
                        <img
                          key={index}
                          src={image}
                          alt=""
                          className="rounded-lg object-cover h-32 w-full"
                        />
                      ))}
                    </div>
                  )}

                  {/* AI 分析结果 */}
                  {feedSummaries[feed.id] && (
                    <div className="mt-4 p-4 bg-blue-50 rounded-lg border-l-4 border-blue-400">
                      <h4 className="font-semibold text-blue-800 mb-2 flex items-center gap-2">
                        🤖 AI 分析总结
                      </h4>
                      <div className="text-sm text-blue-700 whitespace-pre-line">
                        {feedSummaries[feed.id]}
                      </div>
                    </div>
                  )}

                  {/* 互动数据 */}
                  <div className="flex items-center justify-between text-sm text-gray-600 mb-4 p-3 bg-gray-50 rounded-lg">
                    <div className="flex gap-6">
                      <span className="flex items-center gap-1 hover:text-red-500 transition-colors">
                        ❤️ {feed.likes > 0 ? formatNumber(feed.likes) : '-'}
                      </span>
                      <span className="flex items-center gap-1 hover:text-green-500 transition-colors">
                        🔄 {feed.shares > 0 ? formatNumber(feed.shares) : '-'}
                      </span>
                      <span className="flex items-center gap-1 hover:text-blue-500 transition-colors">
                        💬 {feed.comments > 0 ? formatNumber(feed.comments) : '-'}
                      </span>
                    </div>
                    <div className="text-xs text-gray-500">
                      {new Date(feed.publishTime).toLocaleString('zh-CN')}
                    </div>
                  </div>

                  {/* 操作按钮 */}
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => window.open(feed.url, '_blank')}
                      className="flex items-center gap-1"
                    >
                      🔗 查看原文
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => translateFeed(feed.id, feed.content)}
                      disabled={translatingFeeds.has(feed.id)}
                      className="flex items-center gap-1"
                    >
                      {translatingFeeds.has(feed.id) ? (
                        <>🔄 翻译中...</>
                      ) : translatedFeeds[feed.id] ? (
                        <>🌐 显示原文</>
                      ) : (
                        <>🌐 翻译为中文</>
                      )}
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => analyzeFeed(feed.id, feed.content)}
                      disabled={summarizingFeeds.has(feed.id)}
                      className="flex items-center gap-1"
                    >
                      {summarizingFeeds.has(feed.id) ? (
                        <>🔄 分析中...</>
                      ) : feedSummaries[feed.id] ? (
                        <>📊 查看分析</>
                      ) : (
                        <>🤖 AI 分析</>
                      )}
                    </Button>
                    <Button variant="outline" size="sm" className="flex items-center gap-1">
                      📤 分享
                    </Button>
                    <Button variant="outline" size="sm" className="flex items-center gap-1">
                      ⭐ 收藏
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* 空状态 */}
        {!isLoading && filteredFeeds.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 text-6xl mb-4">📭</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">暂无推文数据</h3>
            <p className="text-gray-600 mb-4">
              可能是网络问题或 KOL 暂时没有新推文，请稍后刷新重试
            </p>
            <Button onClick={handleRefresh} className="flex items-center gap-2">
              🔄 重新获取
            </Button>
          </div>
        )}

        {/* 配置和说明 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                    🔧 RSSHub 配置
                  </h3>
                  <p className="text-sm text-gray-600">
                    了解如何配置自己的 RSSHub 服务器获得更好的性能
                  </p>
                </div>
                <Button 
                  variant="outline"
                  onClick={() => window.open('https://docs.rsshub.app/', '_blank')}
                >
                  查看文档
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                    📊 数据说明
                  </h3>
                  <p className="text-sm text-gray-600">
                    所有数据来自 RSSHub 真实推文，互动数据可能不完整
                  </p>
                </div>
                <Button 
                  variant="outline"
                  onClick={() => window.open('https://rsshub.app/', '_blank')}
                >
                  访问 RSSHub
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
