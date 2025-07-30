import { Button } from "@follow/components/ui/button/index.js"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@follow/components/ui/card/index.js"
import { Input } from "@follow/components/ui/input/index.js"
import { useState } from "react"
import { Link } from "react-router"

export const Component = () => {
  const [importMethod, setImportMethod] = useState<'single' | 'batch' | 'opml'>('single')
  const [singleKOL, setSingleKOL] = useState({
    name: '',
    platform: 'twitter',
    username: '',
    description: ''
  })

  const handleSingleImport = () => {
    // 处理单个 KOL 添加逻辑
    console.log('添加单个 KOL:', singleKOL)
  }

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      // 处理文件上传逻辑
      console.log('上传文件:', file.name)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        {/* 页面头部 */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <Link to="/kol">
              <Button variant="outline" size="sm">
                ← 返回列表
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">导入 KOL</h1>
              <p className="text-gray-600 mt-2">添加新的 KOL 账户到你的管理列表</p>
            </div>
          </div>
        </div>

        {/* 导入方式选择 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card 
            className={`cursor-pointer transition-all ${importMethod === 'single' ? 'ring-2 ring-blue-500' : ''}`}
            onClick={() => setImportMethod('single')}
          >
            <CardHeader className="text-center">
              <div className="text-4xl mb-2">👤</div>
              <CardTitle>单个添加</CardTitle>
              <CardDescription>手动添加单个 KOL 账户</CardDescription>
            </CardHeader>
          </Card>

          <Card 
            className={`cursor-pointer transition-all ${importMethod === 'batch' ? 'ring-2 ring-blue-500' : ''}`}
            onClick={() => setImportMethod('batch')}
          >
            <CardHeader className="text-center">
              <div className="text-4xl mb-2">📋</div>
              <CardTitle>批量导入</CardTitle>
              <CardDescription>通过 CSV/JSON 文件批量导入</CardDescription>
            </CardHeader>
          </Card>

          <Card 
            className={`cursor-pointer transition-all ${importMethod === 'opml' ? 'ring-2 ring-blue-500' : ''}`}
            onClick={() => setImportMethod('opml')}
          >
            <CardHeader className="text-center">
              <div className="text-4xl mb-2">📄</div>
              <CardTitle>OPML 导入</CardTitle>
              <CardDescription>从 OPML 文件导入订阅列表</CardDescription>
            </CardHeader>
          </Card>
        </div>

        {/* 导入表单 */}
        <Card>
          <CardHeader>
            <CardTitle>
              {importMethod === 'single' && '添加单个 KOL'}
              {importMethod === 'batch' && '批量导入 KOL'}
              {importMethod === 'opml' && 'OPML 文件导入'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {importMethod === 'single' && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      KOL 名称
                    </label>
                    <Input
                      placeholder="例如: Elon Musk"
                      value={singleKOL.name}
                      onChange={(e) => setSingleKOL({...singleKOL, name: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      平台
                    </label>
                    <select
                      value={singleKOL.platform}
                      onChange={(e) => setSingleKOL({...singleKOL, platform: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="twitter">Twitter</option>
                      <option value="weibo">微博</option>
                      <option value="zhihu">知乎</option>
                      <option value="bilibili">B站</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    用户名
                  </label>
                  <Input
                    placeholder="例如: @elonmusk"
                    value={singleKOL.username}
                    onChange={(e) => setSingleKOL({...singleKOL, username: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    描述 (可选)
                  </label>
                  <Input
                    placeholder="简短描述这个 KOL"
                    value={singleKOL.description}
                    onChange={(e) => setSingleKOL({...singleKOL, description: e.target.value})}
                  />
                </div>
                <Button onClick={handleSingleImport} className="w-full">
                  添加 KOL
                </Button>
              </div>
            )}

            {importMethod === 'batch' && (
              <div className="space-y-4">
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                  <div className="text-4xl mb-4">📁</div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">上传 CSV 或 JSON 文件</h3>
                  <p className="text-gray-600 mb-4">支持包含 KOL 信息的 CSV 或 JSON 格式文件</p>
                  <input
                    type="file"
                    accept=".csv,.json"
                    onChange={handleFileUpload}
                    className="hidden"
                    id="batch-upload"
                  />
                  <label htmlFor="batch-upload">
                    <Button variant="outline" className="cursor-pointer">
                      选择文件
                    </Button>
                  </label>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-2">文件格式示例:</h4>
                  <pre className="text-sm text-gray-600 bg-white p-3 rounded border overflow-x-auto">
{`CSV 格式:
name,platform,username,description
Elon Musk,twitter,@elonmusk,CEO of Tesla and SpaceX
李开复,weibo,@李开复,创新工场董事长兼CEO

JSON 格式:
[
  {
    "name": "Elon Musk",
    "platform": "twitter", 
    "username": "@elonmusk",
    "description": "CEO of Tesla and SpaceX"
  }
]`}
                  </pre>
                </div>
              </div>
            )}

            {importMethod === 'opml' && (
              <div className="space-y-4">
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                  <div className="text-4xl mb-4">📄</div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">上传 OPML 文件</h3>
                  <p className="text-gray-600 mb-4">从 RSS 阅读器导出的 OPML 订阅文件</p>
                  <input
                    type="file"
                    accept=".opml,.xml"
                    onChange={handleFileUpload}
                    className="hidden"
                    id="opml-upload"
                  />
                  <label htmlFor="opml-upload">
                    <Button variant="outline" className="cursor-pointer">
                      选择 OPML 文件
                    </Button>
                  </label>
                </div>
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="font-medium text-blue-900 mb-2">💡 提示:</h4>
                  <p className="text-blue-800 text-sm">
                    OPML 文件通常可以从 Feedly、Inoreader 等 RSS 阅读器导出。
                    我们会自动识别其中的 RSSHub 链接并转换为 KOL 订阅。
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* RSSHub 配置提示 */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span className="text-2xl">⚙️</span>
              RSSHub 配置
            </CardTitle>
            <CardDescription>
              为了获取 KOL 的最新内容，你需要配置 RSSHub 服务
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-2">
                  RSSHub 可以将社交媒体内容转换为 RSS 订阅，支持 Twitter、微博、知乎等平台
                </p>
                <p className="text-sm text-gray-500">
                  配置后可以自动获取 KOL 的最新动态和内容
                </p>
              </div>
              <Link to="/kol/rsshub">
                <Button variant="outline">
                  配置 RSSHub
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}