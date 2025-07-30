import { Button } from "@follow/components/ui/button/index.js"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@follow/components/ui/card/index.js"
import { Input } from "@follow/components/ui/input/index.js"
import { useState, useEffect } from "react"
import { Link } from "react-router"

interface KOL {
  id: string
  name: string
  platform: 'twitter' | 'weibo' | 'zhihu' | 'bilibili'
  username: string
  avatar?: string
  followers?: number
  description?: string
  rssUrl?: string
  status: 'active' | 'inactive' | 'error'
  lastUpdate?: string
  tags?: string[]
  addedDate?: string
}

interface AddKOLForm {
  name: string
  platform: 'twitter' | 'weibo' | 'zhihu' | 'bilibili'
  username: string
  description: string
  tags: string
}

const platformColors = {
  twitter: 'bg-blue-100 text-blue-800',
  weibo: 'bg-red-100 text-red-800', 
  zhihu: 'bg-blue-100 text-blue-800',
  bilibili: 'bg-pink-100 text-pink-800'
}

const statusColors = {
  active: 'bg-green-100 text-green-800',
  inactive: 'bg-gray-100 text-gray-800',
  error: 'bg-red-100 text-red-800'
}

const platformNames = {
  twitter: 'Twitter',
  weibo: '微博',
  zhihu: '知乎',
  bilibili: 'B站'
}

export const Component = () => {
  const [kols, setKols] = useState<KOL[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedPlatform, setSelectedPlatform] = useState<string>('all')
  const [selectedStatus, setSelectedStatus] = useState<string>('all')
  const [sortBy, setSortBy] = useState<string>('name')
  const [showAdvancedFilter, setShowAdvancedFilter] = useState(false)
  const [showAddModal, setShowAddModal] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  
  // 添加KOL表单状态
  const [addForm, setAddForm] = useState<AddKOLForm>({
    name: '',
    platform: 'twitter',
    username: '',
    description: '',
    tags: ''
  })

  // 从localStorage加载KOL数据
  useEffect(() => {
    const savedKOLs = localStorage.getItem('kol-list')
    if (savedKOLs) {
      try {
        setKols(JSON.parse(savedKOLs))
      } catch (error) {
        console.error('加载KOL数据失败:', error)
      }
    }
  }, [])

  // 保存KOL数据到localStorage
  const saveKOLs = (newKOLs: KOL[]) => {
    setKols(newKOLs)
    localStorage.setItem('kol-list', JSON.stringify(newKOLs))
  }

  // 增强的搜索和筛选逻辑
  const filteredKOLs = kols.filter(kol => {
    const searchLower = searchTerm.toLowerCase()
    const matchesSearch = searchTerm === '' || 
      kol.name.toLowerCase().includes(searchLower) ||
      kol.username.toLowerCase().includes(searchLower) ||
      kol.description?.toLowerCase().includes(searchLower) ||
      kol.tags?.some(tag => tag.toLowerCase().includes(searchLower))
    
    const matchesPlatform = selectedPlatform === 'all' || kol.platform === selectedPlatform
    const matchesStatus = selectedStatus === 'all' || kol.status === selectedStatus
    
    return matchesSearch && matchesPlatform && matchesStatus
  }).sort((a, b) => {
    switch (sortBy) {
      case 'name':
        return a.name.localeCompare(b.name)
      case 'platform':
        return a.platform.localeCompare(b.platform)
      case 'followers':
        return (b.followers || 0) - (a.followers || 0)
      case 'addedDate':
        return new Date(b.addedDate || 0).getTime() - new Date(a.addedDate || 0).getTime()
      case 'lastUpdate':
        return new Date(b.lastUpdate || 0).getTime() - new Date(a.lastUpdate || 0).getTime()
      default:
        return 0
    }
  })

  // 添加KOL
  const handleAddKOL = async () => {
    if (!addForm.name.trim() || !addForm.username.trim()) {
      alert('请填写KOL名称和用户名')
      return
    }

    setIsLoading(true)
    
    try {
      const newKOL: KOL = {
        id: Date.now().toString(),
        name: addForm.name.trim(),
        platform: addForm.platform,
        username: addForm.username.trim(),
        description: addForm.description.trim(),
        status: 'active',
        addedDate: new Date().toISOString(),
        lastUpdate: new Date().toISOString(),
        tags: addForm.tags ? addForm.tags.split(',').map(tag => tag.trim()).filter(Boolean) : [],
        // 模拟粉丝数
        followers: Math.floor(Math.random() * 1000000) + 10000
      }

      const updatedKOLs = [...kols, newKOL]
      saveKOLs(updatedKOLs)
      
      // 重置表单
      setAddForm({
        name: '',
        platform: 'twitter',
        username: '',
        description: '',
        tags: ''
      })
      
      setShowAddModal(false)
      alert('KOL添加成功！')
    } catch (error) {
      console.error('添加KOL失败:', error)
      alert('添加失败，请重试')
    } finally {
      setIsLoading(false)
    }
  }

  // 删除KOL
  const handleDeleteKOL = (kolId: string) => {
    if (confirm('确定要删除这个KOL吗？')) {
      const updatedKOLs = kols.filter(kol => kol.id !== kolId)
      saveKOLs(updatedKOLs)
    }
  }

  // 切换KOL状态
  const toggleKOLStatus = (kolId: string) => {
    const updatedKOLs = kols.map(kol => {
      if (kol.id === kolId) {
        const newStatus = kol.status === 'active' ? 'inactive' : 'active'
        return { ...kol, status: newStatus, lastUpdate: new Date().toISOString() }
      }
      return kol
    })
    saveKOLs(updatedKOLs)
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

  const clearFilters = () => {
    setSearchTerm('')
    setSelectedPlatform('all')
    setSelectedStatus('all')
    setSortBy('name')
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        {/* 页面头部 */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">KOL 管理</h1>
              <p className="text-gray-600 mt-2">管理你关注的意见领袖账户</p>
            </div>
            <div className="flex gap-3">
              <Link to="/kol/import">
                <Button variant="outline">
                  批量导入
                </Button>
              </Link>
              <Button onClick={() => setShowAddModal(true)}>
                添加 KOL
              </Button>
            </div>
          </div>

          {/* 统计信息 */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <Card>
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-blue-600">{kols.length}</div>
                <div className="text-sm text-gray-600">总 KOL 数</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-green-600">
                  {kols.filter(k => k.status === 'active').length}
                </div>
                <div className="text-sm text-gray-600">活跃账户</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-orange-600">
                  {kols.filter(k => k.status === 'inactive').length}
                </div>
                <div className="text-sm text-gray-600">暂停账户</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-red-600">
                  {kols.filter(k => k.status === 'error').length}
                </div>
                <div className="text-sm text-gray-600">错误账户</div>
              </CardContent>
            </Card>
          </div>

          {/* 搜索和筛选 */}
          <div className="space-y-4 mb-6">
            {/* 基础搜索栏 */}
            <div className="flex gap-4">
              <div className="flex-1 relative">
                <Input
                  placeholder="搜索 KOL 名称、用户名、描述或标签..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pr-10"
                />
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm('')}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    ✕
                  </button>
                )}
              </div>
              <Button
                variant="outline"
                onClick={() => setShowAdvancedFilter(!showAdvancedFilter)}
                className={showAdvancedFilter ? 'bg-blue-50 border-blue-200' : ''}
              >
                高级筛选 {showAdvancedFilter ? '▲' : '▼'}
              </Button>
            </div>

            {/* 高级筛选面板 */}
            {showAdvancedFilter && (
              <Card className="p-4">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">平台</label>
                    <select
                      value={selectedPlatform}
                      onChange={(e) => setSelectedPlatform(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="all">所有平台</option>
                      <option value="twitter">Twitter</option>
                      <option value="weibo">微博</option>
                      <option value="zhihu">知乎</option>
                      <option value="bilibili">B站</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">状态</label>
                    <select
                      value={selectedStatus}
                      onChange={(e) => setSelectedStatus(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="all">所有状态</option>
                      <option value="active">活跃</option>
                      <option value="inactive">暂停</option>
                      <option value="error">错误</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">排序</label>
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="name">按名称</option>
                      <option value="platform">按平台</option>
                      <option value="followers">按粉丝数</option>
                      <option value="addedDate">按添加时间</option>
                      <option value="lastUpdate">按更新时间</option>
                    </select>
                  </div>
                  <div className="flex items-end">
                    <Button variant="outline" onClick={clearFilters} className="w-full">
                      清除筛选
                    </Button>
                  </div>
                </div>
                <div className="mt-4 text-sm text-gray-600">
                  找到 {filteredKOLs.length} 个匹配的 KOL
                </div>
              </Card>
            )}
          </div>
        </div>

        {/* KOL 列表 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredKOLs.map((kol) => (
            <Card key={kol.id} className="hover:shadow-lg transition-shadow duration-200">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                      {kol.avatar ? (
                        <img src={kol.avatar} alt={kol.name} className="w-12 h-12 rounded-full" />
                      ) : (
                        <span className="text-lg font-semibold text-gray-600">
                          {kol.name.charAt(0)}
                        </span>
                      )}
                    </div>
                    <div>
                      <CardTitle className="text-lg">{kol.name}</CardTitle>
                      <p className="text-sm text-gray-600">{kol.username}</p>
                    </div>
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${platformColors[kol.platform]}`}>
                      {platformNames[kol.platform]}
                    </span>
                    <button
                      onClick={() => toggleKOLStatus(kol.id)}
                      className={`px-2 py-1 rounded-full text-xs font-medium cursor-pointer hover:opacity-80 ${statusColors[kol.status]}`}
                    >
                      {kol.status === 'active' ? '活跃' : kol.status === 'inactive' ? '暂停' : '错误'}
                    </button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription className="mb-3">
                  {kol.description}
                </CardDescription>
                
                {/* 标签 */}
                {kol.tags && kol.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-3">
                    {kol.tags.map((tag, index) => (
                      <span key={index} className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
                
                <div className="space-y-2 text-sm text-gray-600 mb-4">
                  {kol.followers && (
                    <div className="flex justify-between">
                      <span>粉丝数:</span>
                      <span className="font-medium">{formatNumber(kol.followers)}</span>
                    </div>
                  )}
                  {kol.lastUpdate && (
                    <div className="flex justify-between">
                      <span>最后更新:</span>
                      <span className="font-medium">
                        {new Date(kol.lastUpdate).toLocaleDateString()}
                      </span>
                    </div>
                  )}
                </div>

                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="flex-1">
                    编辑
                  </Button>
                  <Link to={`/kol/feeds?kol=${encodeURIComponent(kol.username.replace('@', ''))}`}>
                    <Button variant="outline" size="sm" className="flex-1">
                      查看内容
                    </Button>
                  </Link>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="text-red-600 hover:text-red-700"
                    onClick={() => handleDeleteKOL(kol.id)}
                  >
                    删除
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* 空状态 */}
        {filteredKOLs.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 text-6xl mb-4">
              {kols.length === 0 ? '👥' : '🔍'}
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {kols.length === 0 ? '还没有添加任何 KOL' : '没有找到匹配的 KOL'}
            </h3>
            <p className="text-gray-600 mb-4">
              {kols.length === 0 
                ? '开始添加你关注的意见领袖，获取他们的最新动态' 
                : '尝试调整搜索条件或清除筛选器'
              }
            </p>
            <div className="flex gap-3 justify-center">
              <Button onClick={() => setShowAddModal(true)}>
                {kols.length === 0 ? '添加第一个 KOL' : '添加新 KOL'}
              </Button>
              {kols.length > 0 && (
                <Button variant="outline" onClick={clearFilters}>
                  清除筛选
                </Button>
              )}
            </div>
          </div>
        )}

        {/* 添加KOL模态框 */}
        {showAddModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold text-gray-900">添加新 KOL</h2>
                  <button
                    onClick={() => setShowAddModal(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    ✕
                  </button>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      KOL 名称 *
                    </label>
                    <Input
                      placeholder="例如: Elon Musk"
                      value={addForm.name}
                      onChange={(e) => setAddForm({...addForm, name: e.target.value})}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      平台 *
                    </label>
                    <select
                      value={addForm.platform}
                      onChange={(e) => setAddForm({...addForm, platform: e.target.value as any})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="twitter">Twitter</option>
                      <option value="weibo">微博</option>
                      <option value="zhihu">知乎</option>
                      <option value="bilibili">B站</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      用户名 *
                    </label>
                    <Input
                      placeholder="例如: @elonmusk"
                      value={addForm.username}
                      onChange={(e) => setAddForm({...addForm, username: e.target.value})}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      描述
                    </label>
                    <Input
                      placeholder="简短描述这个 KOL"
                      value={addForm.description}
                      onChange={(e) => setAddForm({...addForm, description: e.target.value})}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      标签
                    </label>
                    <Input
                      placeholder="用逗号分隔，例如: 科技,创业,AI"
                      value={addForm.tags}
                      onChange={(e) => setAddForm({...addForm, tags: e.target.value})}
                    />
                  </div>
                </div>
                
                <div className="flex gap-3 mt-6">
                  <Button
                    variant="outline"
                    onClick={() => setShowAddModal(false)}
                    className="flex-1"
                    disabled={isLoading}
                  >
                    取消
                  </Button>
                  <Button
                    onClick={handleAddKOL}
                    className="flex-1"
                    disabled={isLoading || !addForm.name.trim() || !addForm.username.trim()}
                  >
                    {isLoading ? '添加中...' : '添加 KOL'}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}