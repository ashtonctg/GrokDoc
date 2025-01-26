// lib/o1.js
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY, // Must match the key you used in curl
});

export async function queryO1(messages, maxTokens = 2000) {
  try {
    const response = await openai.chat.completions.create({
      model: "o1-preview", // revert to "o1-preview"
      messages,
      max_completion_tokens: maxTokens,
    });

    console.log("Raw O1 response:", JSON.stringify(response, null, 2));
    return response.choices[0].message.content.trim();
  } catch (error) {
    console.error("Error querying O1:", error);
    throw new Error("Failed to get a response from O1: " + formatOpenAIError(error));
  }
}

function formatOpenAIError(error) {
  if (error.response) {
    return `HTTP ${error.response.status} - ${JSON.stringify(error.response.data)}`;
  } else {
    return error.message || "Unknown error";
  }
}