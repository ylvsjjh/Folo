import { Button } from "@follow/components/ui/button/index.js"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@follow/components/ui/card/index.js"
import { Input } from "@follow/components/ui/input/index.js"
import { useState } from "react"
import { Link } from "react-router"

interface DiscoverKOL {
  id: string
  name: string
  platform: 'twitter' | 'weibo' | 'zhihu' | 'bilibili'
  username: string
  avatar?: string
  followers: number
  description: string
  tags: string[]
  isFollowing: boolean
  recentPosts: number
  engagementRate: number
  category: string
}

// 模拟数据
const mockDiscoverKOLs: DiscoverKOL[] = [
  {
    id: '1',
    name: 'Sam Altman',
    platform: 'twitter',
    username: '@sama',
    followers: 2500000,
    description: 'CEO of OpenAI. Building AGI for the benefit of humanity.',
    tags: ['AI', 'Technology', 'Startup'],
    isFollowing: false,
    recentPosts: 15,
    engagementRate: 5.2,
    category: '科技'
  },
  {
    id: '2',
    name: '雷军',
    platform: 'weibo',
    username: '@雷军',
    followers: 25000000,
    description: '小米科技创始人、董事长兼CEO',
    tags: ['科技', '创业', '小米'],
    isFollowing: false,
    recentPosts: 8,
    engagementRate: 3.8,
    category: '科技'
  },
  {
    id: '3',
    name: '半佛仙人',
    platform: 'bilibili',
    username: '@半佛仙人',
    followers: 3200000,
    description: '财经科普UP主，专注商业分析',
    tags: ['财经', '商业', '科普'],
    isFollowing: false,
    recentPosts: 4,
    engagementRate: 8.5,
    category: '财经'
  },
  {
    id: '4',
    name: '和菜头',
    platform: 'zhihu',
    username: '@和菜头',
    followers: 1800000,
    description: '作家，自媒体人，槽边往事主理人',
    tags: ['写作', '思考', '生活'],
    isFollowing: false,
    recentPosts: 12,
    engagementRate: 6.2,
    category: '文化'
  },
  {
    id: '5',
    name: 'Naval',
    platform: 'twitter',
    username: '@naval',
    followers: 1900000,
    description: 'Entrepreneur and investor. Founder of AngelList.',
    tags: ['Investment', 'Philosophy', 'Startup'],
    isFollowing: false,
    recentPosts: 6,
    engagementRate: 7.8,
    category: '投资'
  },
  {
    id: '6',
    name: '冯大辉',
    platform: 'weibo',
    username: '@冯大辉',
    followers: 890000,
    description: '技术人，前阿里巴巴技术专家',
    tags: ['技术', '互联网', '产品'],
    isFollowing: false,
    recentPosts: 18,
    engagementRate: 4.1,
    category: '科技'
  }
]

const categories = ['全部', '科技', '财经', '文化', '投资', '娱乐', '体育', '教育']
const platforms = ['全部', 'twitter', 'weibo', 'zhihu', 'bilibili']

const platformColors = {
  twitter: 'bg-blue-100 text-blue-800',
  weibo: 'bg-red-100 text-red-800',
  zhihu: 'bg-blue-100 text-blue-800',
  bilibili: 'bg-pink-100 text-pink-800'
}

export const Component = () => {
  const [kols, setKols] = useState<DiscoverKOL[]>(mockDiscoverKOLs)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('全部')
  const [selectedPlatform, setSelectedPlatform] = useState('全部')
  const [sortBy, setSortBy] = useState<'followers' | 'engagement' | 'recent'>('followers')

  const filteredKOLs = kols
    .filter(kol => {
      const matchesSearch = kol.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           kol.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           kol.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      const matchesCategory = selectedCategory === '全部' || kol.category === selectedCategory
      const matchesPlatform = selectedPlatform === '全部' || kol.platform === selectedPlatform
      return matchesSearch && matchesCategory && matchesPlatform
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'followers':
          return b.followers - a.followers
        case 'engagement':
          return b.engagementRate - a.engagementRate
        case 'recent':
          return b.recentPosts - a.recentPosts
        default:
          return 0
      }
    })

  const handleFollow = (kolId: string) => {
    setKols(prev => prev.map(kol => 
      kol.id === kolId ? { ...kol, isFollowing: !kol.isFollowing } : kol
    ))
  }

  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1)}M`
    }
    if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}K`
    }
    return num.toString()
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        {/* 页面头部 */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <Link to="/">
              <Button variant="outline" size="sm">
                ← 返回首页
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">搜索发现</h1>
              <p className="text-gray-600 mt-2">发现新的 KOL 和热门内容</p>
            </div>
          </div>

          {/* 搜索和筛选 */}
          <div className="space-y-4">
            <div className="flex gap-4">
              <div className="flex-1">
                <Input
                  placeholder="搜索 KOL 名称、描述或标签..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full"
                />
              </div>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as 'followers' | 'engagement' | 'recent')}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="followers">按粉丝数排序</option>
                <option value="engagement">按互动率排序</option>
                <option value="recent">按活跃度排序</option>
              </select>
            </div>

            {/* 分类筛选 */}
            <div className="flex gap-2 flex-wrap">
              <span className="text-sm font-medium text-gray-700 py-2">分类:</span>
              {categories.map(category => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                    selectedCategory === category
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>

            {/* 平台筛选 */}
            <div className="flex gap-2 flex-wrap">
              <span className="text-sm font-medium text-gray-700 py-2">平台:</span>
              {platforms.map(platform => (
                <button
                  key={platform}
                  onClick={() => setSelectedPlatform(platform)}
                  className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                    selectedPlatform === platform
                      ? 'bg-green-500 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  {platform === '全部' ? '全部' : platform}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* 推荐 KOL 列表 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredKOLs.map((kol) => (
            <Card key={kol.id} className="hover:shadow-lg transition-shadow duration-200">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                      <span className="text-lg font-semibold text-gray-600">
                        {kol.name.charAt(0)}
                      </span>
                    </div>
                    <div>
                      <CardTitle className="text-lg">{kol.name}</CardTitle>
                      <p className="text-sm text-gray-600">{kol.username}</p>
                    </div>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${platformColors[kol.platform]}`}>
                    {kol.platform}
                  </span>
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription className="mb-3 line-clamp-2">
                  {kol.description}
                </CardDescription>

                {/* 标签 */}
                <div className="flex flex-wrap gap-1 mb-3">
                  {kol.tags.map(tag => (
                    <span key={tag} className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
                      {tag}
                    </span>
                  ))}
                </div>

                {/* 统计信息 */}
                <div className="grid grid-cols-3 gap-2 mb-4 text-center">
                  <div>
                    <div className="text-sm font-semibold text-gray-900">
                      {formatNumber(kol.followers)}
                    </div>
                    <div className="text-xs text-gray-500">粉丝</div>
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-gray-900">
                      {kol.recentPosts}
                    </div>
                    <div className="text-xs text-gray-500">近期发布</div>
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-gray-900">
                      {kol.engagementRate}%
                    </div>
                    <div className="text-xs text-gray-500">互动率</div>
                  </div>
                </div>

                {/* 操作按钮 */}
                <div className="flex gap-2">
                  <Button
                    onClick={() => handleFollow(kol.id)}
                    variant={kol.isFollowing ? "outline" : "default"}
                    className="flex-1"
                    size="sm"
                  >
                    {kol.isFollowing ? '已关注' : '关注'}
                  </Button>
                  <Button variant="outline" size="sm">
                    预览
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredKOLs.length === 0 && (
          <div className="text-center py-12">
            <div className="text-4xl mb-4">🔍</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">没有找到相关 KOL</h3>
            <p className="text-gray-600">尝试调整搜索条件或筛选选项</p>
          </div>
        )}

        {/* 热门标签 */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>热门标签</CardTitle>
            <CardDescription>发现更多相关内容</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {['AI', '创业', '投资', '科技', '财经', '区块链', '元宇宙', '新能源', '教育', '健康', '旅行', '美食'].map(tag => (
                <button
                  key={tag}
                  onClick={() => setSearchTerm(tag)}
                  className="px-3 py-1 bg-blue-50 text-blue-600 text-sm rounded-full hover:bg-blue-100 transition-colors"
                >
                  #{tag}
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}