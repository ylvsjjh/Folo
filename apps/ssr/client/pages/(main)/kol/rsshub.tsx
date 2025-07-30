import { Button } from "@follow/components/ui/button/index.js"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@follow/components/ui/card/index.js"
import { Input } from "@follow/components/ui/input/index.js"
import { useState } from "react"
import { Link } from "react-router"

interface RSSHubConfig {
  serverUrl: string
  accessKey?: string
  enableCache: boolean
  cacheTime: number
  enableProxy: boolean
  proxyUrl?: string
  enableTwitter: boolean
  twitterBearerToken?: string
  enableWeibo: boolean
  weiboUsername?: string
  weiboPassword?: string
}

export const Component = () => {
  const [config, setConfig] = useState<RSSHubConfig>({
    serverUrl: 'http://43.154.134.12:1200', // 添加端口号
    accessKey: '',
    enableCache: true,
    cacheTime: 300,
    enableProxy: false,
    proxyUrl: '',
    enableTwitter: false,
    twitterBearerToken: '',
    enableWeibo: false,
    weiboUsername: '',
    weiboPassword: ''
  })

  const [testResult, setTestResult] = useState<{
    status: 'idle' | 'testing' | 'success' | 'error'
    message?: string
  }>({ status: 'idle' })

  const handleConfigChange = (key: keyof RSSHubConfig, value: any) => {
    setConfig(prev => ({ ...prev, [key]: value }))
  }

  const testConnection = async () => {
    setTestResult({ status: 'testing' })
    
    try {
      // 使用RSS代理来测试连接，避免CORS问题
      const testUrl = config.serverUrl.endsWith('/') ? config.serverUrl : config.serverUrl + '/'
      const testApiUrl = `${testUrl}twitter/user/elonmusk`
      
      console.log(`通过RSS代理测试连接: ${testApiUrl}`)
      
      // 通过RSS代理测试连接
      const proxyUrl = `/api/rss-proxy?url=${encodeURIComponent(testApiUrl)}`
      const response = await fetch(proxyUrl, {
        method: 'GET',
        headers: {
          'Accept': 'application/xml, text/xml, application/rss+xml, */*',
          'Cache-Control': 'no-cache'
        },
        signal: AbortSignal.timeout(15000)
      })
      
      if (response.ok) {
        const xmlText = await response.text()
        if (xmlText && xmlText.length > 100 && xmlText.toLowerCase().includes('<rss')) {
          setTestResult({ 
            status: 'success', 
            message: '连接成功！RSS服务正常运行，可以获取Twitter数据' 
          })
        } else {
          setTestResult({ 
            status: 'error', 
            message: '连接成功但返回的数据格式不正确，请检查RSSHub服务配置' 
          })
        }
      } else {
        const errorText = await response.text()
        console.error('RSS代理测试失败:', errorText)
        setTestResult({ 
          status: 'error', 
          message: `连接失败：HTTP ${response.status} - 请检查服务器状态和端口配置` 
        })
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '网络错误'
      console.error('测试连接失败:', error)
      setTestResult({ 
        status: 'error', 
        message: `连接失败：${errorMessage}。请检查服务器是否运行在正确端口，并确保防火墙允许访问` 
      })
    }
  }

  const saveConfig = () => {
    // 保存配置到localStorage
    localStorage.setItem('rsshub-config', JSON.stringify(config))
    console.log('保存配置:', config)
    alert('配置已保存！')
  }

  const resetConfig = () => {
    setConfig({
      serverUrl: 'http://43.154.134.12:1200', // 重置时也添加端口号
      accessKey: '',
      enableCache: true,
      cacheTime: 300,
      enableProxy: false,
      proxyUrl: '',
      enableTwitter: false,
      twitterBearerToken: '',
      enableWeibo: false,
      weiboUsername: '',
      weiboPassword: ''
    })
    setTestResult({ status: 'idle' })
  }

  // 预设服务器选项（添加端口号）
  const presetServers = [
    { name: '自建服务器 (43.154.134.12:1200)', url: 'http://43.154.134.12:1200' },
    { name: 'RSSHub 官方', url: 'https://rsshub.app' },
    { name: 'RSSHub 镜像1', url: 'https://rss.shab.fun' },
    { name: 'RSSHub 镜像2', url: 'https://rsshub.rssforever.com' }
  ]

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        {/* 页面头部 */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <Link to="/">
              <Button variant="outline" size="sm">
                ← 返回首页
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">RSSHub 配置</h1>
              <p className="text-gray-600 mt-2">配置 RSSHub 服务以获取各平台数据</p>
            </div>
          </div>
          
          {/* 服务器状态提示 */}
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
            <div className="flex items-center gap-2">
              <span className="text-green-600">🚀</span>
              <span className="font-medium text-green-800">自建RSS服务器已部署</span>
            </div>
            <p className="text-sm text-green-700 mt-1">
              服务器地址：<code className="bg-green-100 px-2 py-1 rounded">http://43.154.134.12:1200/</code>
              <br />
              相比公共服务器，自建服务器具有更好的稳定性和更快的响应速度
            </p>
          </div>
        </div>

        <div className="space-y-6">
          {/* 基础配置 */}
          <Card>
            <CardHeader>
              <CardTitle>基础配置</CardTitle>
              <CardDescription>
                配置 RSSHub 服务器地址和基本参数
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  RSSHub 服务器地址 *
                </label>
                
                {/* 预设服务器选择 */}
                <div className="grid grid-cols-2 gap-2 mb-3">
                  {presetServers.map((server, index) => (
                    <Button
                      key={index}
                      variant={config.serverUrl === server.url ? "default" : "outline"}
                      size="sm"
                      onClick={() => handleConfigChange('serverUrl', server.url)}
                      className="justify-start"
                    >
                      {server.name}
                      {index === 0 && <span className="ml-2 text-xs bg-green-100 text-green-800 px-2 py-1 rounded">推荐</span>}
                    </Button>
                  ))}
                </div>
                
                <Input
                  placeholder="http://43.154.134.12:1200/"
                  value={config.serverUrl}
                  onChange={(e) => handleConfigChange('serverUrl', e.target.value)}
                />
                <p className="text-xs text-gray-500 mt-1">
                  推荐使用自建服务器获得最佳性能
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  访问密钥 (可选)
                </label>
                <Input
                  type="password"
                  placeholder="输入访问密钥"
                  value={config.accessKey}
                  onChange={(e) => handleConfigChange('accessKey', e.target.value)}
                />
                <p className="text-xs text-gray-500 mt-1">
                  如果服务器需要认证，请输入访问密钥
                </p>
              </div>

              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={config.enableCache}
                    onChange={(e) => handleConfigChange('enableCache', e.target.checked)}
                    className="rounded"
                  />
                  <span className="text-sm font-medium text-gray-700">启用缓存</span>
                </label>
                {config.enableCache && (
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-600">缓存时间:</span>
                    <Input
                      type="number"
                      value={config.cacheTime}
                      onChange={(e) => handleConfigChange('cacheTime', parseInt(e.target.value))}
                      className="w-20"
                    />
                    <span className="text-sm text-gray-600">秒</span>
                  </div>
                )}
              </div>

              <div className="flex gap-3">
                <Button onClick={testConnection} disabled={testResult.status === 'testing'}>
                  {testResult.status === 'testing' ? '测试中...' : '测试连接'}
                </Button>
                {testResult.status !== 'idle' && (
                  <div className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm ${
                    testResult.status === 'success' 
                      ? 'bg-green-100 text-green-800' 
                      : testResult.status === 'error'
                      ? 'bg-red-100 text-red-800'
                      : 'bg-blue-100 text-blue-800'
                  }`}>
                    {testResult.status === 'success' && '✅'}
                    {testResult.status === 'error' && '❌'}
                    {testResult.status === 'testing' && '⏳'}
                    {testResult.message}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* 代理配置 */}
          <Card>
            <CardHeader>
              <CardTitle>代理配置</CardTitle>
              <CardDescription>
                配置代理服务器以访问被限制的平台
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={config.enableProxy}
                  onChange={(e) => handleConfigChange('enableProxy', e.target.checked)}
                  className="rounded"
                />
                <span className="text-sm font-medium text-gray-700">启用代理</span>
              </label>

              {config.enableProxy && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    代理服务器地址
                  </label>
                  <Input
                    placeholder="http://proxy.example.com:8080"
                    value={config.proxyUrl}
                    onChange={(e) => handleConfigChange('proxyUrl', e.target.value)}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    支持 HTTP/HTTPS/SOCKS5 代理
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Twitter/X 配置 */}
          <Card>
            <CardHeader>
              <CardTitle>Twitter/X 配置</CardTitle>
              <CardDescription>
                配置 Twitter API 以获取更稳定的数据
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={config.enableTwitter}
                  onChange={(e) => handleConfigChange('enableTwitter', e.target.checked)}
                  className="rounded"
                />
                <span className="text-sm font-medium text-gray-700">启用 Twitter API</span>
              </label>

              {config.enableTwitter && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Bearer Token
                  </label>
                  <Input
                    type="password"
                    placeholder="输入 Twitter API Bearer Token"
                    value={config.twitterBearerToken}
                    onChange={(e) => handleConfigChange('twitterBearerToken', e.target.value)}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    从 Twitter Developer Portal 获取 Bearer Token
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* 微博配置 */}
          <Card>
            <CardHeader>
              <CardTitle>微博配置</CardTitle>
              <CardDescription>
                配置微博账户以获取更多内容
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={config.enableWeibo}
                  onChange={(e) => handleConfigChange('enableWeibo', e.target.checked)}
                  className="rounded"
                />
                <span className="text-sm font-medium text-gray-700">启用微博登录</span>
              </label>

              {config.enableWeibo && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      用户名
                    </label>
                    <Input
                      placeholder="微博用户名"
                      value={config.weiboUsername}
                      onChange={(e) => handleConfigChange('weiboUsername', e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      密码
                    </label>
                    <Input
                      type="password"
                      placeholder="微博密码"
                      value={config.weiboPassword}
                      onChange={(e) => handleConfigChange('weiboPassword', e.target.value)}
                    />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* 操作按钮 */}
          <div className="flex gap-4">
            <Button onClick={saveConfig} className="flex-1">
              保存配置
            </Button>
            <Button onClick={resetConfig} variant="outline">
              重置配置
            </Button>
          </div>

          {/* 帮助信息 */}
          <Card>
            <CardHeader>
              <CardTitle>配置说明</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 text-sm text-gray-600">
                <div>
                  <strong>RSSHub 服务器:</strong> 推荐使用官方服务器 https://rsshub.app，也可以自建服务器
                </div>
                <div>
                  <strong>Twitter API:</strong> 需要申请 Twitter Developer 账户并创建应用获取 Bearer Token
                </div>
                <div>
                  <strong>代理配置:</strong> 如果无法直接访问某些平台，可以配置代理服务器
                </div>
                <div>
                  <strong>缓存设置:</strong> 启用缓存可以减少服务器负载，提高响应速度
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}