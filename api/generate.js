export default async function handler(req, res) {
  const { word, difficulty, count } = req.query;
  if (!word) return res.status(400).json({ error: "Word required" });

  const apiKey = process.env.OPENAI_API_KEY;
  const prompt = `Analyze the verb/phrase "${word}". 
  Provide: 1.Grammar type 2.What follows (Noun/Gerund/Base Verb) 3.Separability.
  Generate ${count} daily life examples (${difficulty} level).
  If separable, show "give IT up" style.
  Return ONLY a JSON object. No intro, no outro.`;

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json", "Authorization": `Bearer ${apiKey}` },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.3, // 일관성을 위해 온도를 낮춤
      }),
    });

    const rawData = await response.json();
    const content = rawData.choices[0].message.content;

    // [버그 수정] JSON 외의 텍스트가 섞여있어도 정규식으로 JSON만 추출
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("JSON not found in response");
    
    res.status(200).json(JSON.parse(jsonMatch[0]));
  } catch (error) {
    res.status(500).json({ error: "Parsing Error", details: error.message });
  }
}
