// lib/o1.js
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY, // Must match the key you used in curl
});

export async function queryO1(messages, maxTokens = 2000) {
  try {
    console.log("\n=== O1 Query ===");
    
    // Filter out system messages and only keep user/assistant messages
    const validMessages = messages.filter(msg => msg.role !== 'system');
    console.log("Attempting query with", validMessages.length, "messages");
    
    const response = await openai.chat.completions.create({
      model: "o1-preview",
      messages: validMessages,
      max_completion_tokens: maxTokens,
    });

    console.log("O1 response received:", response.choices[0].message.content ? "Yes" : "No");
    return response.choices[0].message.content.trim();
  } catch (error) {
    console.error("\n=== O1 Error ===");
    console.error("Error type:", error.name);
    console.error("Error message:", error.message);
    throw error;
  }
}

function formatOpenAIError(error) {
  if (error.response) {
    return `HTTP ${error.response.status} - ${JSON.stringify(error.response.data)}`;
  } else {
    return error.message || "Unknown error";
  }
}