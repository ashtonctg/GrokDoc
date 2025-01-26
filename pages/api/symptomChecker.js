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
    console.log("\n=== API Request ===");
    console.log("Conversation received:", conversation.length, "messages");
    console.log("Last message:", conversation[conversation.length - 1]);

    const finalMessages = [
      systemPrompt(),
      ...conversation.map(msg => ({
        role: msg.role,
        content: msg.content
      }))
    ];

    console.log("\n=== Calling O1 ===");
    const diagnosis = await queryO1(finalMessages);
    console.log("\n=== API Response ===");
    console.log("Diagnosis received:", diagnosis ? "Yes" : "No");
    
    return res.status(200).json({ diagnosis });
  } catch (error) {
    console.error("\n=== API Error Details ===");
    console.error("Name:", error.name);
    console.error("Message:", error.message);
    console.error("Stack:", error.stack);
    if (error.response) {
      console.error("Response data:", error.response.data);
    }
    
    return res.status(500).json({
      error: "Failed to analyze symptoms",
      details: error.message
    });
  }
}