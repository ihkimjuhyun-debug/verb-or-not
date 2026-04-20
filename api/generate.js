export default async function handler(req, res) {
  const { word, difficulty, count } = req.query;

  if (!word) return res.status(400).json({ error: "Word is required" });

  const apiKey = process.env.OPENAI_API_KEY;

  // AI에게 전치사 여부와 to의 성격(Preposition vs Infinitive)을 분석하게 시킵니다.
  const prompt = `Analyze the English phrase "${word}". 
  1. Determine if it's a phrasal verb and what follows it (Noun, Gerund, or Verb).
  2. Especially if it contains "to", specify if it's a Preposition (takes Noun/-ing) or a To-Infinitive marker (takes Base Verb).
  3. Generate ${count} example sentences for level ${difficulty}.

  Provide the result in this JSON format:
  {
    "grammar_analysis": {
      "type": "phrasal verb / transitive verb / etc",
      "to_type": "Preposition / To-Infinitive / Not Applicable",
      "next_form": "Noun, -ing, or Base Verb",
      "usage_tip": "Quick grammar rule for this word"
    },
    "examples": [
      {"eng": "sentence", "kor": "translation", "point": "why this fits the grammar rule"}
    ]
  }
  Respond ONLY with the JSON.`;

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.5, // 분석의 정확도를 위해 온도를 낮춤
      }),
    });

    const data = await response.json();
    const content = JSON.parse(data.choices[0].message.content);
    res.status(200).json(content);
  } catch (error) {
    res.status(500).json({ error: "AI 분석 중 오류가 발생했습니다." });
  }
}
