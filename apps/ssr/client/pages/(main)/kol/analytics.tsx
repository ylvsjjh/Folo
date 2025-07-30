import { Button } from "@follow/components/ui/button/index.js"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@follow/components/ui/card/index.js"
import { useState } from "react"
import { Link } from "react-router"

interface AnalyticsData {
  totalKOLs: number
  totalPosts: number
  totalEngagement: number
  avgEngagementRate: number
  topKOLs: Array<{
    name: string
    platform: string
    followers: number
    posts: number
    engagement: number
  }>
  platformStats: Array<{
    platform: string
    kolCount: number
    postCount: number
    engagement: number
  }>
  timeSeriesData: Array<{
    date: string
    posts: number
    engagement: number
  }>
}

// 模拟数据
const mockAnalytics: AnalyticsData = {
  totalKOLs: 156,
  totalPosts: 2847,
  totalEngagement: 1250000,
  avgEngagementRate: 4.2,
  topKOLs: [
    {
      name: 'Elon Musk',
      platform: 'Twitter',
      followers: 150000000,
      posts: 45,
      engagement: 450000
    },
    {
      name: '李开复',
      platform: '微博',
      followers: 50000000,
      posts: 32,
      engagement: 280000
    },
    {
      name: '罗翔说刑法',
      platform: 'B站',
      followers: 20000000,
      posts: 12,
      engagement: 320000
    },
    {
      name: '张三丰',
      platform: '知乎',
      followers: 5000000,
      posts: 28,
      engagement: 150000
    }
  ],
  platformStats: [
    { platform: 'Twitter', kolCount: 45, postCount: 890, engagement: 520000 },
    { platform: '微博', kolCount: 38, postCount: 756, engagement: 380000 },
    { platform: 'B站', kolCount: 32, postCount: 445, engagement: 290000 },
    { platform: '知乎', kolCount: 41, postCount: 756, engagement: 260000 }
  ],
  timeSeriesData: [
    { date: '2024-01-08', posts: 45, engagement: 89000 },
    { date: '2024-01-09', posts: 52, engagement: 95000 },
    { date: '2024-01-10', posts: 38, engagement: 78000 },
    { date: '2024-01-11', posts: 61, engagement: 112000 },
    { date: '2024-01-12', posts: 48, engagement: 87000 },
    { date: '2024-01-13', posts: 55, engagement: 98000 },
    { date: '2024-01-14', posts: 43, engagement: 82000 },
    { date: '2024-01-15', posts: 67, engagement: 125000 }
  ]
}

export const Component = () => {
  const [analytics] = useState<AnalyticsData>(mockAnalytics)
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('7d')

  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1)}M`
    }
    if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}K`
    }
    return num.toString()
  }

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return `${date.getMonth() + 1}/${date.getDate()}`
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        {/* 页面头部 */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <Link to="/">
                <Button variant="outline" size="sm">
                  ← 返回首页
                </Button>
              </Link>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">数据统计</h1>
                <p className="text-gray-600 mt-2">KOL 数据分析和统计报告</p>
              </div>
            </div>
            <div className="flex gap-2">
              <select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value as '7d' | '30d' | '90d')}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="7d">最近 7 天</option>
                <option value="30d">最近 30 天</option>
                <option value="90d">最近 90 天</option>
              </select>
              <Button variant="outline">
                导出报告
              </Button>
            </div>
          </div>
        </div>

        {/* 总览统计 */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">总 KOL 数</p>
                  <p className="text-3xl font-bold text-blue-600">{analytics.totalKOLs}</p>
                </div>
                <div className="text-4xl">👥</div>
              </div>
              <p className="text-xs text-gray-500 mt-2">+12 本月新增</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">总发布数</p>
                  <p className="text-3xl font-bold text-green-600">{formatNumber(analytics.totalPosts)}</p>
                </div>
                <div className="text-4xl">📝</div>
              </div>
              <p className="text-xs text-gray-500 mt-2">+156 本周新增</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">总互动数</p>
                  <p className="text-3xl font-bold text-orange-600">{formatNumber(analytics.totalEngagement)}</p>
                </div>
                <div className="text-4xl">❤️</div>
              </div>
              <p className="text-xs text-gray-500 mt-2">+8.5% 较上周</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">平均互动率</p>
                  <p className="text-3xl font-bold text-purple-600">{analytics.avgEngagementRate}%</p>
                </div>
                <div className="text-4xl">📊</div>
              </div>
              <p className="text-xs text-gray-500 mt-2">+0.3% 较上周</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* 平台统计 */}
          <Card>
            <CardHeader>
              <CardTitle>平台分布</CardTitle>
              <CardDescription>各平台 KOL 和内容统计</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analytics.platformStats.map((platform, index) => (
                  <div key={platform.platform} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className={`w-3 h-3 rounded-full ${
                        index === 0 ? 'bg-blue-500' :
                        index === 1 ? 'bg-red-500' :
                        index === 2 ? 'bg-pink-500' : 'bg-blue-400'
                      }`}></div>
                      <span className="font-medium">{platform.platform}</span>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-gray-600">
                        {platform.kolCount} KOL · {platform.postCount} 发布
                      </div>
                      <div className="text-sm font-medium text-gray-900">
                        {formatNumber(platform.engagement)} 互动
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* 趋势图 */}
          <Card>
            <CardHeader>
              <CardTitle>发布趋势</CardTitle>
              <CardDescription>最近 7 天的发布和互动趋势</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analytics.timeSeriesData.map((data, index) => (
                  <div key={data.date} className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">{formatDate(data.date)}</span>
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        <span className="text-sm">{data.posts} 发布</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span className="text-sm">{formatNumber(data.engagement)} 互动</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 热门 KOL */}
        <Card>
          <CardHeader>
            <CardTitle>热门 KOL</CardTitle>
            <CardDescription>按互动数排序的热门 KOL</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {analytics.topKOLs.map((kol, index) => (
                <div key={kol.name} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center justify-center w-8 h-8 bg-blue-100 text-blue-600 rounded-full font-bold">
                      {index + 1}
                    </div>
                    <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                      <span className="text-sm font-semibold text-gray-600">
                        {kol.name.charAt(0)}
                      </span>
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">{kol.name}</div>
                      <div className="text-sm text-gray-600">{kol.platform}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-gray-600">
                      {formatNumber(kol.followers)} 粉丝 · {kol.posts} 发布
                    </div>
                    <div className="text-sm font-medium text-gray-900">
                      {formatNumber(kol.engagement)} 互动
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}