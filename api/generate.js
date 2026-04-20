export default async function handler(req, res) {
  const { word, difficulty, count } = req.query;
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    return res.status(500).json({ error: "KEY_NOT_FOUND", message: "Vercel 설정에서 API 키를 확인하세요." });
  }

  const prompt = `Analyze the English phrase "${word}". 
  Provide analysis in both English and Korean (e.g., "Phrasal Verb (구동사)").
  1. Structure: Verb type?
  2. Following Form: What follows (Noun, Gerund, or Base Verb)?
  3. "To" Analysis: If "to" exists, is it a Preposition or To-Infinitive?
  4. Separability: Can it be separated (e.g., "give it up")?
  5. Examples: Generate ${count} sentences for level ${difficulty}.
  
  * CRITICAL: Use 100% daily-life conversation scenarios. No sports or technical jargon.
  * If separable, include an example like "${word.split(' ')[0]} you ${word.split(' ')[1] || ''}".

  Return ONLY JSON:
  {
    "analysis": { 
      "type": "English (Korean)", 
      "next": "English (Korean)", 
      "to_type": "English (Korean)", 
      "separable": "English (Korean)" 
    },
    "examples": [ {"eng": "...", "kor": "...", "is_sep": true/false} ]
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
    let content = raw.choices[0].message.content;
    const match = content.match(/\{[\s\S]*\}/);
    if (!match) throw new Error("JSON_NOT_FOUND");
    
    res.status(200).json(JSON.parse(match[0]));
  } catch (err) {
    res.status(500).json({ error: "SYSTEM_ERROR", message: err.message });
  }
}
