import OpenAI from "openai";

// API Configurations
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const XAI_API_URL = 'https://api.x.ai/v1/chat/completions';
const XAI_API_KEY = process.env.XAI_API_KEY;

/**
 * Primary model for GrokDoc - Grok-2 from X.AI
 * Used for general symptom analysis and medical conversations
 */
export async function queryGrok2(messages, maxTokens = 2000) {
  try {
    const response = await fetch(XAI_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${XAI_API_KEY}`,
      },
      body: JSON.stringify({
        messages,
        model: "grok-2-latest",
        max_tokens: maxTokens,
        stream: false,
      }),
    });

    if (!response.ok) {
      throw new Error(`X.AI API error: ${response.status}`);
    }

    const data = await response.json();
    return data.choices[0].message.content.trim();
  } catch (error) {
    console.error("Error querying grok-2-latest:", error);
    throw error;
  }
}

/**
 * Alternative model - OpenAI GPT-4
 * Used as fallback or for specific medical document analysis
 */
export async function queryChatGpt4o(messages, maxTokens = 2000) {
  try {
    const response = await openai.chat.completions.create({
      model: "chatgpt-4o-latest",
      messages,
      max_completion_tokens: maxTokens,
    });
    return response.choices[0].message.content.trim();
  } catch (error) {
    console.error("Error querying chatgpt-4o-latest:", error);
    throw error;
  }
}

/**
 * For advanced plan generation (O1 Preview):
 */
export async function queryO1Preview(messages, maxTokens = 2000) {
  try {
    const response = await openai.chat.completions.create({
      model: "o1-preview",
      messages,
      max_completion_tokens: maxTokens,
    });
    return response.choices[0].message.content.trim();
  } catch (error) {
    console.error("Error querying o1-preview:", error);
    throw error;
  }
}