// pages/api/symptomChecker.js
import { systemPrompt } from "../../lib/prompts";
import { queryChatGpt4o } from "../../lib/aimodels";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  try {
    const { conversation } = req.body;
    if (!conversation || !Array.isArray(conversation)) {
      return res.status(400).json({ error: "Invalid conversation array" });
    }

    // Insert system prompt
    const finalMessages = [
      systemPrompt(),
      ...conversation.map(msg => ({
        role: msg.role,
        content: msg.content
      }))
    ];

    const diagnosis = await queryChatGpt4o(finalMessages);
    return res.status(200).json({ diagnosis });
  } catch (error) {
    console.error("SymptomChecker Error:", error);
    return res.status(500).json({
      error: "Failed to analyze symptoms",
      details: error.message,
    });
  }
}