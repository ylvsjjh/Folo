interface TwitterPost {
  id: string
  text: string
  created_at: string
  author: {
    name: string
    username: string
    profile_image_url?: string
  }
  public_metrics?: {
    like_count: number
    retweet_count: number
    reply_count: number
  }
  attachments?: {
    media_keys?: string[]
  }
  entities?: {
    urls?: Array<{
      url: string
      expanded_url: string
    }>
  }
}

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
  images?: string[]
  rssUrl: string
}

class KOLDataService {
  private baseUrl: string
  private updateInterval: number
  private listeners: Set<(feeds: KOLFeed[]) => void>
  private cache: Map<string, KOLFeed[]>

  constructor(baseUrl = 'https://rsshub.app', updateInterval = 300000) { // 5分钟更新一次
    this.baseUrl = baseUrl
    this.updateInterval = updateInterval
    this.listeners = new Set()
    this.cache = new Map()
  }

  // 订阅数据更新
  subscribe(callback: (feeds: KOLFeed[]) => void) {
    this.listeners.add(callback)
    return () => this.listeners.delete(callback)
  }

  // 通知所有订阅者
  private notify(feeds: KOLFeed[]) {
    this.listeners.forEach(callback => callback(feeds))
  }

  // 生成模拟数据 (在实际项目中应该从RSSHub获取真实数据)
  private generateMockFeed(username: string, name: string): KOLFeed[] {
    const topics = [
      '比特币突破新高，市场情绪高涨！🚀',
      '以太坊2.0升级进展顺利，期待更多创新',
      'DeFi生态持续发展，新项目值得关注',
      '央行数字货币CBDC的最新进展分析',
      '加密货币监管政策的最新动向',
      'NFT市场的新趋势和投资机会',
      '区块链技术在传统行业的应用案例',
      '去中心化交易所DEX的发展前景',
      '稳定币市场格局的变化分析',
      'Web3.0时代的投资策略思考'
    ]

    const feeds: KOLFeed[] = []
    const feedCount = Math.floor(Math.random() * 5) + 3 // 3-7条推文

    for (let i = 0; i < feedCount; i++) {
      const topic = topics[Math.floor(Math.random() * topics.length)]
      const publishTime = new Date(Date.now() - Math.random() * 24 * 60 * 60 * 1000) // 24小时内随机时间

      feeds.push({
        id: `${username}-${i}-${Date.now()}-${Math.random()}`,
        kolId: username,
        kolName: name,
        kolUsername: username,
        platform: 'twitter',
        title: '',
        content: topic + ' ' + this.generateRandomContent(),
        publishTime: publishTime.toISOString(),
        likes: Math.floor(Math.random() * 5000) + 100,
        shares: Math.floor(Math.random() * 1000) + 10,
        comments: Math.floor(Math.random() * 500) + 5,
        url: `https://twitter.com/${username.replace('@', '')}/status/${Date.now()}${i}`,
        images: Math.random() > 0.7 ? [`https://picsum.photos/400/300?random=${Date.now()}${i}`] : [],
        rssUrl: `${this.baseUrl}/twitter/user/${username.replace('@', '')}`
      })
    }

    return feeds.sort((a, b) => new Date(b.publishTime).getTime() - new Date(a.publishTime).getTime())
  }

  private generateRandomContent(): string {
    const contents = [
      '这是一个重要的市场信号，投资者需要密切关注。',
      '技术分析显示，这个趋势可能会持续一段时间。',
      '建议大家保持理性，不要盲目跟风。',
      '从长期来看，这对整个行业都是积极的发展。',
      '风险和机遇并存，需要谨慎评估。',
      '这个消息对市场的影响可能比预期的更大。',
      '我们正在见证历史性的时刻。',
      '技术创新正在推动行业向前发展。',
      '监管的明确化对行业发展是有利的。',
      '期待看到更多的实际应用落地。'
    ]
    return contents[Math.floor(Math.random() * contents.length)]
  }

  // 获取单个KOL的推特内容
  async fetchKOLTwitterFeed(username: string, name: string): Promise<KOLFeed[]> {
    try {
      // 在实际项目中，这里应该调用RSSHub API
      // const rssUrl = `${this.baseUrl}/twitter/user/${username.replace('@', '')}`
      // const response = await fetch(rssUrl)
      // const data = await response.text()
      // return this.parseRSSToFeeds(data, username, name)

      // 现在使用模拟数据
      await new Promise(resolve => setTimeout(resolve, Math.random() * 2000 + 500)) // 模拟网络延迟
      return this.generateMockFeed(username, name)
    } catch (error) {
      console.error(`Error fetching feed for ${username}:`, error)
      return []
    }
  }

  // 批量获取多个KOL的内容
  async fetchAllKOLFeeds(kolList: Array<{username: string, platform: string, name: string}>): Promise<KOLFeed[]> {
    const twitterKOLs = kolList.filter(kol => kol.platform === 'twitter')
    
    try {
      // 并发获取所有KOL的数据
      const feedPromises = twitterKOLs.map(kol => this.fetchKOLTwitterFeed(kol.username, kol.name))
      const results = await Promise.allSettled(feedPromises)
      
      const allFeeds: KOLFeed[] = []
      
      results.forEach((result) => {
        if (result.status === 'fulfilled') {
          allFeeds.push(...result.value)
        }
      })
      
      // 按时间排序
      allFeeds.sort((a, b) => new Date(b.publishTime).getTime() - new Date(a.publishTime).getTime())
      
      // 缓存结果
      this.cache.set('allFeeds', allFeeds)
      
      return allFeeds
    } catch (error) {
      console.error('Error fetching all KOL feeds:', error)
      // 返回缓存的数据
      return this.cache.get('allFeeds') || []
    }
  }

  // 开始实时更新
  startRealTimeUpdates(kolList: Array<{username: string, platform: string, name: string}>) {
    const updateFeeds = async () => {
      try {
        const feeds = await this.fetchAllKOLFeeds(kolList)
        this.notify(feeds)
      } catch (error) {
        console.error('Error updating feeds:', error)
      }
    }

    // 立即执行一次
    updateFeeds()

    // 设置定时更新
    const intervalId = setInterval(updateFeeds, this.updateInterval)

    // 返回停止函数
    return () => clearInterval(intervalId)
  }

  // 手动刷新数据
  async refreshFeeds(kolList: Array<{username: string, platform: string, name: string}>): Promise<KOLFeed[]> {
    const feeds = await this.fetchAllKOLFeeds(kolList)
    this.notify(feeds)
    return feeds
  }

  // 获取缓存的数据
  getCachedFeeds(): KOLFeed[] {
    return this.cache.get('allFeeds') || []
  }
}

// 创建全局实例
export const kolDataService = new KOLDataService()

// 导出类型
export type { KOLFeed }