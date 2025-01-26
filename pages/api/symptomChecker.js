// pages/api/symptomChecker.js
import { systemPrompt } from "../../lib/prompts";
import { queryO1 } from "../../lib/o1";

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

    // We'll create an array for the model. Insert a system message if you want strict guidelines:
    const finalMessages = [
      systemPrompt(),
      // user messages or assistant from conversation
      ...conversation.map(msg => ({
        role: msg.role,
        content: msg.content
      }))
    ];

    console.log("SymptomChecker API - finalMessages:", finalMessages);

    const diagnosis = await queryO1(finalMessages);
    console.log("Diagnosis from O1-mini:", diagnosis);

    return res.status(200).json({ diagnosis });
  } catch (error) {
    console.error("API Error Details:", {
      message: error.message,
      stack: error.stack,
      name: error.name
    });
    return res.status(500).json({
      error: "Failed to analyze symptoms",
      details: error.message
    });
  }
}