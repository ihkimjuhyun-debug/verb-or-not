export default async function handler(req, res) {
  const { word, difficulty, count } = req.query;
  if (!word) return res.status(400).json({ error: "Word is required" });

  const apiKey = process.env.OPENAI_API_KEY;

  const prompt = `Analyze the English phrase "${word}".
  1. Determine the grammar: Is it a Phrasal Verb? What form follows it (Noun, Gerund, or Base Verb)?
  2. Separability: If it's a phrasal verb, can it be separated (e.g., "give IT up")? 
  3. Generate ${count} examples for level ${difficulty}.
  4. CRITICAL: If separable, provide at least one example with a pronoun/noun in the middle (e.g., "give you up").
  
  Use 100% daily-life conversation scenarios.

  Format JSON:
  {
    "grammar_analysis": {
      "type": "type of verb",
      "following_form": "Noun / Gerund(-ing) / Base Verb / etc",
      "is_separable": "Yes/No",
      "usage_tip": "tip"
    },
    "examples": [
      {"eng": "...", "kor": "...", "structure": "normal or separated"}
    ]
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
    res.status(500).json({ error: "AI 분석 실패" });
  }
}
