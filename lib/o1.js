import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  baseURL: "https://api.openai.com/v1",
});

export async function queryO1(messages, maxTokens = 2000, temperature = 0.7) {
  try {
    const response = await openai.chat.completions.create({
      model: "o1-2024-12-17",
      messages,
      temperature,
      max_tokens: maxTokens,
    });
    return response.choices[0].message.content.trim();
  } catch (error) {
    console.error("Error querying O1:", error);
    throw new Error("Failed to get a response from O1: " + error.message);
  }
}