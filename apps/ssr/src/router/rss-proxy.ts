import type { FastifyInstance } from "fastify"

export const rssProxyRoute = (app: FastifyInstance) => {
  // RSS代理端点
  app.get("/api/rss-proxy", async (req, reply) => {
    try {
      const { url } = req.query as { url?: string }
      
      if (!url) {
        return reply.status(400).send({ 
          error: "Missing URL parameter",
          message: "请提供RSS URL参数" 
        })
      }

      // 解码URL
      const targetUrl = decodeURIComponent(url)
      console.log(`🔄 RSS代理请求: ${targetUrl}`)

      // 使用Node.js内置的fetch发起请求
      const response = await fetch(targetUrl, {
        method: 'GET',
        headers: {
          'Accept': 'application/xml, text/xml, application/rss+xml, */*',
          'User-Agent': 'Follow RSS Proxy/1.0',
          'Cache-Control': 'no-cache'
        },
        signal: AbortSignal.timeout(15000)
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      const xmlText = await response.text()

      // 检查响应内容
      if (!xmlText || xmlText.trim().length < 100) {
        throw new Error('Empty or too short response')
      }

      // 检查是否是有效的RSS/XML内容
      const lowerContent = xmlText.toLowerCase()
      if (!lowerContent.includes('<rss') && 
          !lowerContent.includes('<feed') && 
          !lowerContent.includes('<?xml') && 
          !lowerContent.includes('<channel')) {
        throw new Error('Response is not valid RSS/XML format')
      }

      // 移除过于严格的错误检测，只保留基本的格式验证
      // 因为正常的RSS内容可能包含任何词汇，包括"error"等
      if (lowerContent.includes('<title>404') || 
          lowerContent.includes('<title>not found') || 
          lowerContent.includes('<title>error') ||
          lowerContent.includes('service unavailable') ||
          lowerContent.includes('internal server error') ||
          lowerContent.includes('bad gateway') ||
          (lowerContent.includes('error') && lowerContent.includes('<html')) ||
          (lowerContent.includes('404') && lowerContent.includes('<html'))) {
        throw new Error('RSS feed contains error message')
      }

      console.log(`✅ RSS代理成功: ${targetUrl} (${xmlText.length} 字符)`)

      // 设置正确的响应头
      reply.header('Content-Type', 'application/xml; charset=utf-8')
      reply.header('Access-Control-Allow-Origin', '*')
      reply.header('Access-Control-Allow-Methods', 'GET')
      reply.header('Access-Control-Allow-Headers', 'Content-Type')
      
      return reply.send(xmlText)

    } catch (error: any) {
      console.error(`❌ RSS代理失败:`, error)
      
      // 根据错误类型返回不同的状态码
      let statusCode = 500
      let errorMessage = error.message || 'RSS代理请求失败'
      
      if (error.message?.includes('timeout')) {
        statusCode = 504
        errorMessage = 'RSS服务器响应超时'
      } else if (error.message?.includes('404') || error.message?.includes('not found')) {
        statusCode = 404
        errorMessage = 'RSS源不存在'
      } else if (error.message?.includes('Invalid RSS')) {
        statusCode = 422
        errorMessage = '无效的RSS内容'
      }

      return reply.status(statusCode).send({
        error: 'RSS Proxy Error',
        message: errorMessage,
        details: error.message
      })
    }
  })

  // 预检请求支持
  app.options("/api/rss-proxy", async (req, reply) => {
    reply.header('Access-Control-Allow-Origin', '*')
    reply.header('Access-Control-Allow-Methods', 'GET, OPTIONS')
    reply.header('Access-Control-Allow-Headers', 'Content-Type')
    return reply.send()
  })
}