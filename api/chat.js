import Groq from 'groq-sdk';

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

export async function POST(request) {
  try {
    const { messages } = await request.json();

    const completion = await groq.chat.completions.create({
      messages: messages,
      model: 'llama-3.3-70b-versatile',
    });

    return new Response(
      JSON.stringify({ response: completion.choices[0]?.message?.content }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}