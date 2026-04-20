export default async function handler(req, res) {
  const { word, difficulty, count } = req.query;
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    return res.status(500).json({ error: "KEY_NOT_FOUND", message: "Vercel 설정에 API 키가 없습니다." });
  }

  const prompt = `Analyze "${word}". 
  1. Structure: Phrasal verb or standard verb?
  2. Following Form: Noun, Gerund(-ing), or Base Verb?
  3. "To" Analysis: If "to" exists, is it a Preposition or To-Infinitive?
  4. Separability: If phrasal, can it be separated (e.g., "give it up")?
  5. Examples: Generate ${count} sentences for level ${difficulty}.
  * IMPORTANT: Use 100% daily life scenarios. If separable, include one example like "${word.split(' ')[0]} you ${word.split(' ')[1] || ''}".
  
  Return ONLY JSON format:
  {
    "analysis": { "type": "", "next": "", "to_type": "", "separable": "" },
    "examples": [ {"eng": "", "kor": "", "is_sep": true/false} ]
  }`;

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json", "Authorization": `Bearer ${apiKey}` },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.4
      }),
    });

    const raw = await response.json();
    if (raw.error) return res.status(500).json({ error: "AI_ERROR", message: raw.error.message });

    let content = raw.choices[0].message.content;
    // JSON만 쏙 뽑아내는 정규식 (마크다운 무시)
    const match = content.match(/\{[\s\S]*\}/);
    if (!match) throw new Error("JSON_NOT_FOUND");
    
    res.status(200).json(JSON.parse(match[0]));
  } catch (err) {
    res.status(500).json({ error: "SYSTEM_ERROR", message: err.message });
  }
}
