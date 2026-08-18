import Groq from 'groq-sdk';

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

export default async function handler(req, res) {
  // Set CORS headers to allow requests from GitHub Pages or local servers
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*'); // Or replace '*' with 'https://yourusername.github.io'
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  // Handle preflight request
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const { messages } = req.body;

    const cleanedMessages = messages
      .filter(m => m.role === 'user' || m.role === 'assistant')
      .map(m => ({ role: m.role, content: m.content }));

    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: 'Your name is Tephdy, an AI agent on the Tephdy AI platform by TEPHDY TECH. Output clean HTML/Tailwind inside markdown code blocks when asked for UI/UX designs.'
        },
        ...cleanedMessages
      ],
      model: 'llama-3.3-70b-versatile',
      temperature: 0.2,
    });

    return res.status(200).json({
      response: completion.choices[0]?.message?.content || 'No response generated.'
    });
  } catch (error) {
    console.error('API Error:', error);
    return res.status(500).json({ error: error.message || 'Internal Server Error' });
  }
}