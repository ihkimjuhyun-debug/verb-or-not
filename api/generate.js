export default async function handler(req, res) {
  const { word, difficulty, count } = req.query;
  if (!word) return res.status(400).json({ error: "Word is required" });

  const apiKey = process.env.OPENAI_API_KEY;

  // 보편적인 일상 대화 예문을 생성하도록 지시 (사용자 수정 사항 반영)
  const prompt = `Analyze the English phrase "${word}".
  1. Determine if it's a phrasal verb and its grammar structure.
  2. If it has "to", specify if it's a Preposition or To-Infinitive.
  3. Generate ${count} examples for level ${difficulty}.
  
  CRITICAL: Use ONLY universal 100% daily-life conversation scenarios. Avoid niche topics like professional sports, powerlifting, or technical coding unless specifically asked.

  Format:
  {
    "grammar_analysis": {
      "type": "type",
      "to_type": "Preposition / To-Infinitive / N/A",
      "next_form": "form",
      "usage_tip": "tip"
    },
    "examples": [{"eng": "...", "kor": "...", "point": "..."}]
  }`;

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
        temperature: 0.7,
      }),
    });

    const data = await response.json();
    res.status(200).json(JSON.parse(data.choices[0].message.content));
  } catch (error) {
    res.status(500).json({ error: "AI Analysis Failed" });
  }
}
