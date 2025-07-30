// 创建 AI 翻译 API
export async function POST(request: Request) {
  try {
    const { text, targetLanguage = 'zh-CN' } = await request.json()
    
    if (!text) {
      return Response.json({ error: '缺少翻译内容' }, { status: 400 })
    }
    
    // 调用 AI 服务进行翻译
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: `你是一个专业的翻译助手。请将用户提供的内容翻译成${targetLanguage === 'zh-CN' ? '简体中文' : targetLanguage}。保持原文的格式和语气，只返回翻译结果，不要添加任何解释。`
          },
          {
            role: 'user',
            content: text
          }
        ],
        max_tokens: 2000,
        temperature: 0.3
      })
    })
    
    const result = await response.json()
    
    if (!response.ok) {
      throw new Error(result.error?.message || '翻译服务错误')
    }
    
    return Response.json({
      translatedText: result.choices[0].message.content,
      originalText: text,
      targetLanguage
    })
  } catch (error) {
    console.error('翻译错误:', error)
    return Response.json({ 
      error: '翻译失败',
      details: error instanceof Error ? error.message : '未知错误'
    }, { status: 500 })
  }
}

export async function GET(request: Request) {
  const url = new URL(request.url)
  const id = url.searchParams.get('id')
  const language = url.searchParams.get('language')
  const fields = url.searchParams.get('fields')
  
  if (!id || !language || !fields) {
    return Response.json({ error: '缺少必要参数' }, { status: 400 })
  }
  
  // 这里应该从数据库获取条目内容并翻译
  // 为了演示，返回模拟数据
  return Response.json({
    data: {
      title: '翻译后的标题',
      description: '翻译后的描述',
      content: '翻译后的内容'
    }
  })
}