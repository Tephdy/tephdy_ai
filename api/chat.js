import Groq from 'groq-sdk';

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { messages } = req.body;

    const completion = await groq.chat.completions.create({
      messages: messages,
      model: 'llama-3.1-70b-versatile', // Updated to supported model name
    });

    return res.status(200).json({
      response: completion.choices[0]?.message?.content || '',
    });
  } catch (error) {
    return res.status(500).json({ error: error.message || 'Internal Server Error' });
  }
}