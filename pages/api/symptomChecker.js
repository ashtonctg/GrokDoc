// pages/api/symptomChecker.js

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

    // Insert system prompt
    const finalMessages = [
      systemPrompt(),
      ...conversation.map((msg) => ({
        role: msg.role,
        content: msg.content, // can be string or an array
      })),
    ];

    // Check if last user message includes doc-labs or doc-emr
    let useO1 = false;
    if (conversation.length) {
      const lastMsg = conversation[conversation.length - 1];
      if (Array.isArray(lastMsg.content)) {
        // see if any chunk has doc-labs or doc-emr
        for (let c of lastMsg.content) {
          if (c.type === "image_url" && c.image_url?.detail) {
            if (c.image_url.detail === "doc-labs" || c.image_url.detail === "doc-emr") {
              useO1 = true;
              break;
            }
          }
        }
      }
    }

    let diagnosis;
    if (useO1) {
      console.log("Using O1-preview for doc analysis");
      diagnosis = await queryO1Preview(finalMessages);
    } else {
      console.log("Using grok-2-latest for normal conversation");
      diagnosis = await queryGrok2(finalMessages);
    }

    return res.status(200).json({ diagnosis });
  } catch (error) {
    console.error("SymptomChecker Error:", error);
    return res.status(500).json({
      error: "Failed to analyze symptoms",
      details: error.message,
    });
  }
}