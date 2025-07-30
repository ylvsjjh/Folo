import { Button } from "@follow/components/ui/button/index.js"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@follow/components/ui/card/index.js"
import { Link } from "react-router"
import { useState, useEffect } from "react"

export const Component = () => {
  const [serverStatus, setServerStatus] = useState<'checking' | 'online' | 'offline'>('checking')

  // 检查自建RSS服务器状态
  useEffect(() => {
    const checkServerStatus = async () => {
      try {
        const response = await fetch('http://43.154.134.12:1200/', {
          method: 'GET',
          mode: 'no-cors',
          signal: AbortSignal.timeout(5000)
        })
        setServerStatus('online')
      } catch (error) {
        console.log('RSS服务器检测失败:', error)
        setServerStatus('offline')
      }
    }

    checkServerStatus()
  }, [])

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 头部区域 */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-3">
              KOL 聚合平台
            </h1>
            <p className="text-lg text-gray-600 mb-6">
              管理和追踪你关注的意见领袖，聚合多平台内容
            </p>
            
            {/* RSS服务器状态 */}
            <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm ${
              serverStatus === 'online' 
                ? 'bg-green-50 text-green-700 border border-green-200' 
                : serverStatus === 'offline'
                ? 'bg-red-50 text-red-700 border border-red-200'
                : 'bg-yellow-50 text-yellow-700 border border-yellow-200'
            }`}>
              <div className={`w-2 h-2 rounded-full ${
                serverStatus === 'online' ? 'bg-green-500' 
                : serverStatus === 'offline' ? 'bg-red-500'
                : 'bg-yellow-500 animate-pulse'
              }`}></div>
              {serverStatus === 'checking' && '检查服务器状态...'}
              {serverStatus === 'online' && 'RSS服务器运行正常'}
              {serverStatus === 'offline' && 'RSS服务器离线，使用备用服务器'}
            </div>
          </div>
        </div>
      </div>

      {/* 主要内容区域 */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        {/* 主要功能 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {/* KOL 管理 */}
          <Card className="hover:shadow-md transition-shadow duration-200 flex flex-col">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <span className="text-blue-600 text-lg">👥</span>
                </div>
                <div>
                  <div className="font-semibold text-gray-900">KOL 管理</div>
                  <div className="text-sm text-gray-500">核心功能</div>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col">
              <CardDescription className="text-gray-600 mb-4 flex-1">
                添加、管理和组织你关注的 KOL 账户
              </CardDescription>
              <Link to="/kol">
                <Button variant="outline" className="w-full">
                  进入管理
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* 内容聚合 */}
          <Card className="hover:shadow-md transition-shadow duration-200 flex flex-col">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <span className="text-green-600 text-lg">📰</span>
                </div>
                <div>
                  <div className="font-semibold text-gray-900">内容聚合</div>
                  <div className="text-sm text-gray-500">实时动态</div>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col">
              <CardDescription className="text-gray-600 mb-4 flex-1">
                查看所有 KOL 的最新动态和内容
              </CardDescription>
              <Link to="/kol/feeds">
                <Button variant="outline" className="w-full">
                  查看动态
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* RSSHub 配置 */}
          <Card className="hover:shadow-md transition-shadow duration-200 flex flex-col">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-3">
                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                  <span className="text-purple-600 text-lg">⚙️</span>
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-gray-900">RSSHub 配置</span>
                    {serverStatus === 'online' && (
                      <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">
                        已优化
                      </span>
                    )}
                  </div>
                  <div className="text-sm text-gray-500">数据源配置</div>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col">
              <CardDescription className="text-gray-600 mb-4 flex-1">
                配置 RSSHub 服务，支持 Twitter/X 数据获取
              </CardDescription>
              <Link to="/kol/rsshub">
                <Button variant="outline" className="w-full">
                  配置服务
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        {/* 辅助功能 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* 批量导入 */}
          <Card className="hover:shadow-md transition-shadow duration-200 flex flex-col">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-3">
                <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                  <span className="text-orange-600 text-lg">📥</span>
                </div>
                <div>
                  <div className="font-semibold text-gray-900">批量导入</div>
                  <div className="text-sm text-gray-500">数据导入</div>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col">
              <CardDescription className="text-gray-600 mb-4 flex-1">
                通过 OPML、CSV 或 JSON 批量导入 KOL 列表
              </CardDescription>
              <Link to="/kol/import">
                <Button variant="outline" className="w-full">
                  开始导入
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* 数据统计 */}
          <Card className="hover:shadow-md transition-shadow duration-200 flex flex-col">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-3">
                <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
                  <span className="text-indigo-600 text-lg">📊</span>
                </div>
                <div>
                  <div className="font-semibold text-gray-900">数据统计</div>
                  <div className="text-sm text-gray-500">分析报告</div>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col">
              <CardDescription className="text-gray-600 mb-4 flex-1">
                查看 KOL 数据统计和分析报告
              </CardDescription>
              <Link to="/kol/analytics">
                <Button variant="outline" className="w-full">
                  查看统计
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* 搜索发现 */}
          <Card className="hover:shadow-md transition-shadow duration-200 flex flex-col">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-3">
                <div className="w-10 h-10 bg-teal-100 rounded-lg flex items-center justify-center">
                  <span className="text-teal-600 text-lg">🔍</span>
                </div>
                <div>
                  <div className="font-semibold text-gray-900">搜索发现</div>
                  <div className="text-sm text-gray-500">内容探索</div>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col">
              <CardDescription className="text-gray-600 mb-4 flex-1">
                发现新的 KOL 和热门内容
              </CardDescription>
              <Link to="/kol/discover">
                <Button variant="outline" className="w-full">
                  开始探索
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        {/* 底部信息 */}
        <div className="mt-16 text-center">
          <p className="text-gray-500 text-sm">
            支持 Twitter/X、微博、知乎等多平台 KOL 内容聚合
          </p>
        </div>
      </div>
    </div>
  )
}
