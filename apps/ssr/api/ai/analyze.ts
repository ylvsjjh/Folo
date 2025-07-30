// 创建 AI 分析 API
export async function POST(request: Request) {
  try {
    const { prompt, content } = await request.json()
    
    // 调用 AI 服务（可以使用 OpenAI、Claude 等）
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
            content: '你是一个专业的社交媒体内容分析师，擅长分析推文的情感、观点和影响力。'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 500,
        temperature: 0.7
      })
    })
    
    const result = await response.json()
    
    return Response.json({
      summary: result.choices[0].message.content
    })
  } catch (error) {
    return Response.json({ error: '分析失败' }, { status: 500 })
  }
}