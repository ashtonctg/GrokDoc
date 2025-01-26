// lib/o1.js
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY, // Must match the key you used in curl
});

export async function queryO1(messages, maxTokens = 2000) {
  try {
    const response = await openai.chat.completions.create({
      // Must use "o1-preview" to match your successful curl example
      model: "o1-preview",
      messages,
      max_completion_tokens: maxTokens,
    });

    console.log("Raw O1 response:", JSON.stringify(response, null, 2));
    return response.choices[0].message.content.trim();
  } catch (error) {
    console.error("Error querying O1:", error);
    // We'll throw with a more explicit error message that includes
    // the raw HTTP response, if available.
    throw new Error("Failed to get a response from O1: " + formatOpenAIError(error));
  }
}

/**
 * Attempt to parse the error response from openai package to get more detail.
 */
function formatOpenAIError(error) {
  // This is where we try to glean the actual HTTP response code or error data
  if (error.response) {
    // The openai package should store the HTTP status + data here
    return `HTTP ${error.response.status} - ${JSON.stringify(error.response.data)}`;
  } else {
    // Fallback if there's no .response
    return error.message || "Unknown error";
  }
}