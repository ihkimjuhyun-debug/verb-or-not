// Vercel Serverless Function
export default async function handler(req, res) {
  const { word, difficulty, count } = req.query;

  if (!word) {
    return res.status(400).json({ error: "Word is required" });
  }

  // Vercel Environment Variables에서 키를 가져옴
  const apiKey = process.env.OPENAI_API_KEY;

  const prompt = `Generate ${count} English sentences using the phrase "${word}" specifically as a VERB. 
  Difficulty level: ${difficulty}. 
  Provide the result in the following JSON format:
  [
    {"eng": "sentence", "kor": "translation", "desc": "short explanation why it's a verb here"}
  ]
  Respond ONLY with the JSON array.`;

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini", // 혹은 gpt-3.5-turbo
        messages: [{ role: "user", content: prompt }],
        temperature: 0.7,
      }),
    });

    const data = await response.json();
    const content = JSON.parse(data.choices[0].message.content);
    
    res.status(200).json(content);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch data from AI" });
  }
}
