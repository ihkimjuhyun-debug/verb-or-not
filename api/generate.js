export default async function handler(req, res) {
  const { word, difficulty, count } = req.query;
  const apiKey = process.env.OPENAI_API_KEY;

  // 1. API 키 체크 (설정 안 되어 있으면 바로 알려줌)
  if (!apiKey) {
    return res.status(500).json({ 
      error: "API_KEY_MISSING", 
      message: "Vercel 설정에 OPENAI_API_KEY가 입력되지 않았습니다." 
    });
  }

  const prompt = `Analyze "${word}". JSON only. 1.type 2.following_form 3.is_separable 4.examples (${count} for ${difficulty}). Daily life.`;

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: { 
        "Content-Type": "application/json", 
        "Authorization": `Bearer ${apiKey}` 
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.3,
      }),
    });

    const rawData = await response.json();

    // 2. OpenAI 측 에러 발생 시 처리 (할당량 초과 등)
    if (rawData.error) {
      return res.status(response.status).json({ 
        error: "AI_SERVICE_ERROR", 
        message: rawData.error.message 
      });
    }

    let content = rawData.choices[0].message.content;
    
    // 3. JSON 추출 로직 (더 정교하게 수정)
    const jsonStart = content.indexOf('{');
    const jsonEnd = content.lastIndexOf('}') + 1;
    if (jsonStart === -1 || jsonEnd === 0) throw new Error("JSON_FORMAT_ERROR");
    
    const cleanJson = content.substring(jsonStart, jsonEnd);
    res.status(200).json(JSON.parse(cleanJson));

  } catch (error) {
    res.status(500).json({ 
      error: "PARSING_FAILED", 
      message: "AI의 응답을 해석하는 데 실패했습니다.",
      details: error.message 
    });
  }
}
