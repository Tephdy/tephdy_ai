import Groq from 'groq-sdk';

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

export default async function handler(req, res) {
  // 1. Enable CORS for GitHub Pages and local development
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  // 2. Handle HTTP preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // 3. Graceful check for GET requests (prevents 405 warnings in logs)
  if (req.method === 'GET') {
    return res.status(200).json({ status: 'Tephdy AI API is online. Send a POST request to query.' });
  }

  // 4. Reject other unsupported HTTP methods
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { messages = [] } = req.body || {};

    if (!Array.isArray(messages)) {
      return res.status(400).json({ error: 'Invalid payload format: messages must be an array.' });
    }

    // 5. Sanitize messages to avoid unexpected roles from client
    const cleanedMessages = messages
      .filter(m => m && (m.role === 'user' || m.role === 'assistant'))
      .map(m => ({ role: m.role, content: String(m.content || '') }));

    // 6. Prepend system prompt on the server side
    const fullMessages = [
      {
        role: 'system',
        content:
          'Your name is Tephdy, an AI agent on the Tephdy AI platform by TEPHDY TECH. You specialize in generating UI/UX designs. When requested, output self-contained, clean HTML with inline CSS or Tailwind CDN scripts in standard markdown code blocks.',
      },
      ...cleanedMessages,
    ];

    const completion = await groq.chat.completions.create({
      messages: fullMessages,
      model: 'llama-3.3-70b-versatile',
      temperature: 0.2,
      max_tokens: 2048,
    });

    return res.status(200).json({
      response: completion.choices[0]?.message?.content || '',
    });
  } catch (error) {
    console.error('Groq API Error:', error);
    return res.status(500).json({ error: error.message || 'Internal Server Error' });
  }
}