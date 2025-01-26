// lib/aimodels.js
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY, // from .env
});

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