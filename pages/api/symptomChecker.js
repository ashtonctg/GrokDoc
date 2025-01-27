import { systemPrompt } from "../../lib/prompts";
import { queryChatGpt4o, queryO1Preview, queryGrok2 } from "../../lib/aimodels";

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

    // Build the final messages
    const finalMessages = [
      systemPrompt(),
      ...conversation.map((msg) => ({
        role: msg.role,
        content: Array.isArray(msg.content)
          ? msg.content.map((c) => (c.type === "text" ? c.text : "")).join("\n")
          : msg.content,
      })),
    ];

    // Check if we should use O1 for advanced reasoning, specifically for diagnosis
    let useO1 = false;
    let lastUserText = "";
    const lastMessage = conversation[conversation.length - 1];
    if (lastMessage) {
      if (Array.isArray(lastMessage.content)) {
        // Combine text chunks
        lastUserText = lastMessage.content
          .filter((c) => c.type === "text")
          .map((c) => c.text)
          .join(" ");
      } else if (typeof lastMessage.content === "string") {
        lastUserText = lastMessage.content;
      }
    }

    // 1) If the user or AI specifically says "diagnosis" or synonyms, we use O1
    // 2) If the user has labs or EMR
    // 3) If we do advanced triage
    if (/\bdiagnos(e|is|es)\b/i.test(lastUserText)) {
      useO1 = true;
    }

    // Also check if the last user message includes doc-labs or doc-emr
    if (conversation.length) {
      const lastMsg = conversation[conversation.length - 1];
      if (Array.isArray(lastMsg.content)) {
        for (let c of lastMsg.content) {
          if (c.type === "image_url" && c.image_url?.detail) {
            if (
              c.image_url.detail === "doc-labs" ||
              c.image_url.detail === "doc-emr"
            ) {
              useO1 = true;
              break;
            }
          }
        }
      }
    }

    // Now decide which model
    let diagnosis;
    if (useO1) {
      console.log("Using O1-preview for advanced reasoning (diagnosis/docs).");
      diagnosis = await queryO1Preview(finalMessages);
    } else {
      console.log("Using grok-2-latest for normal conversation");
      diagnosis = await queryGrok2(finalMessages);
    }

    // Return the AI's message
    return res.status(200).json({ diagnosis });
  } catch (error) {
    console.error("SymptomChecker Error:", error);
    return res.status(500).json({
      error: "Failed to analyze symptoms",
      details: error.message,
    });
  }
}