export default async function handler(req, res) {
  const { word, difficulty, count } = req.query;
  if (!word) return res.status(400).json({ error: "Word required" });

  const apiKey = process.env.OPENAI_API_KEY;
  const prompt = `Analyze "${word}". 
  1. Grammar: Phrasal verb or not? 
  2. Following: Noun, Gerund, or Base Verb?
  3. Separable: Yes/No?
  4. Examples: ${count} daily life sentences (level ${difficulty}). 
  If separable, include "give you up" style.
  Return ONLY JSON: {"grammar_analysis":{...}, "examples":[...]}`;

  try {
    const response = await fetch("[https://api.openai.com/v1/chat/completions](https://api.openai.com/v1/chat/completions)", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.5,
      }),
    });

    const rawData = await response.json();
    let content = rawData.choices[0].message.content;
    
    // 에러 방지: AI가 ```json ... ``` 을 붙여 보낼 경우 제거
    content = content.replace(/```json|```/g, "").trim();
    
    res.status(200).json(JSON.parse(content));
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "AI Parsing Error", details: error.message });
  }
}
