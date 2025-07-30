import type { FastifyInstance } from "fastify"

export const aiRoute = (app: FastifyInstance) => {
  // AI 翻译端点
  app.post("/api/ai/translate", async (req, reply) => {
    try {
      const { text, targetLanguage = 'zh-CN' } = req.body as { text?: string; targetLanguage?: string }
      
      if (!text) {
        return reply.status(400).send({ 
          error: "缺少翻译内容",
          message: "请提供要翻译的文本" 
        })
      }

      console.log(`🔄 AI翻译请求: ${text.substring(0, 100)}...`)

      // 模拟翻译服务（实际项目中应该调用真实的翻译API）
      // 这里使用简单的模拟逻辑
      const translatedText = await simulateTranslation(text, targetLanguage)

      console.log(`✅ AI翻译成功: ${translatedText.substring(0, 100)}...`)

      return reply.send({
        translatedText,
        originalText: text,
        targetLanguage
      })

    } catch (error: any) {
      console.error(`❌ AI翻译失败:`, error)
      
      return reply.status(500).send({
        error: 'AI Translation Error',
        message: '翻译失败，请稍后重试',
        details: error.message
      })
    }
  })

  // AI 分析端点
  app.post("/api/ai/analyze", async (req, reply) => {
    try {
      const { prompt, content } = req.body as { prompt?: string; content?: string }
      
      if (!content) {
        return reply.status(400).send({ 
          error: "缺少分析内容",
          message: "请提供要分析的内容" 
        })
      }

      console.log(`🔄 AI分析请求: ${content.substring(0, 100)}...`)

      // 模拟AI分析服务
      const summary = await simulateAnalysis(content, prompt)

      console.log(`✅ AI分析成功: ${summary.substring(0, 100)}...`)

      return reply.send({
        summary
      })

    } catch (error: any) {
      console.error(`❌ AI分析失败:`, error)
      
      return reply.status(500).send({
        error: 'AI Analysis Error',
        message: '分析失败，请稍后重试',
        details: error.message
      })
    }
  })

  // AI 翻译 GET 端点（兼容原有的API调用方式）
  app.get("/api/ai/translation", async (req, reply) => {
    try {
      const { id, language, fields } = req.query as { id?: string; language?: string; fields?: string }
      
      if (!id || !language || !fields) {
        return reply.status(400).send({ 
          error: "缺少必要参数",
          message: "请提供 id, language 和 fields 参数" 
        })
      }

      console.log(`🔄 AI翻译GET请求: id=${id}, language=${language}, fields=${fields}`)

      // 模拟从数据库获取条目并翻译
      const data = await simulateEntryTranslation(id, language, fields)

      console.log(`✅ AI翻译GET成功: ${JSON.stringify(data).substring(0, 100)}...`)

      return reply.send({ data })

    } catch (error: any) {
      console.error(`❌ AI翻译GET失败:`, error)
      
      return reply.status(500).send({
        error: 'AI Translation Error',
        message: '翻译失败，请稍后重试',
        details: error.message
      })
    }
  })

  // 预检请求支持
  app.options("/api/ai/*", async (req, reply) => {
    reply.header('Access-Control-Allow-Origin', '*')
    reply.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
    reply.header('Access-Control-Allow-Headers', 'Content-Type')
    return reply.send()
  })
}

// 模拟翻译函数
async function simulateTranslation(text: string, targetLanguage: string): Promise<string> {
  // 添加延迟模拟网络请求
  await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000))
  
  // 简单的模拟翻译逻辑
  if (targetLanguage === 'zh-CN') {
    return `【翻译】${text}`
  } else {
    return `[Translated to ${targetLanguage}] ${text}`
  }
}

// 模拟AI分析函数
async function simulateAnalysis(content: string, prompt?: string): Promise<string> {
  // 添加延迟模拟网络请求
  await new Promise(resolve => setTimeout(resolve, 1500 + Math.random() * 2000))
  
  // 简单的模拟分析逻辑
  const contentLength = content.length
  const hasLinks = content.includes('http')
  const hasMentions = content.includes('@')
  const hasHashtags = content.includes('#')
  
  let analysis = `【AI分析】这是一条${contentLength > 100 ? '长' : '短'}内容`
  
  if (hasLinks) analysis += '，包含链接'
  if (hasMentions) analysis += '，提及了其他用户'
  if (hasHashtags) analysis += '，使用了话题标签'
  
  analysis += '。内容看起来'
  
  // 简单的情感分析
  if (content.includes('好') || content.includes('棒') || content.includes('赞')) {
    analysis += '比较积极正面'
  } else if (content.includes('坏') || content.includes('差') || content.includes('糟')) {
    analysis += '比较消极负面'
  } else {
    analysis += '情感中性'
  }
  
  analysis += '，可能会引起一定的关注和讨论。'
  
  return analysis
}

// 模拟条目翻译函数
async function simulateEntryTranslation(id: string, language: string, fields: string): Promise<any> {
  // 添加延迟模拟网络请求
  await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 1500))
  
  const fieldArray = fields.split(',')
  const data: any = {}
  
  fieldArray.forEach(field => {
    switch (field) {
      case 'title':
        data.title = `【翻译标题】Entry ${id}`
        break
      case 'description':
        data.description = `【翻译描述】This is the translated description for entry ${id}`
        break
      case 'content':
        data.content = `【翻译内容】This is the translated content for entry ${id}. The content has been translated to ${language}.`
        break
      case 'readabilityContent':
        data.readabilityContent = `【翻译可读性内容】Readable translated content for entry ${id}.`
        break
      default:
        data[field] = `【翻译${field}】Translated ${field} for entry ${id}`
    }
  })
  
  return data
}