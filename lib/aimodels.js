// lib/aimodels.js
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY, // from .env
});

// Add X.AI configuration
const XAI_API_URL = 'https://api.x.ai/v1/chat/completions';
const XAI_API_KEY = process.env.XAI_API_KEY;

/**
 * Default model for GrokDoc (faster, better reasoning):
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
 * For Symptom Checker conversation (faster, good enough reasoning):
 */
export async function queryChatGpt4o(messages, maxTokens = 2000) {
  try {
    const response = await openai.chat.completions.create({
      model: "chatgpt-4o-latest", // Using the ChatGPT-4o model
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