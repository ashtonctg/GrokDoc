import { systemPrompt } from "../../lib/prompts";
import { queryChatGpt4o, queryO1Preview, queryGrok2 } from "../../lib/aimodels";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  try {
    const { conversation } = req.body;
    console.log("[DEBUG] API received conversation:", JSON.stringify(conversation.map(msg => ({
      role: msg.role,
      contentType: Array.isArray(msg.content) ? 'array' : typeof msg.content,
      hasImage: Array.isArray(msg.content) && msg.content.some(c => c.type === 'image_url')
    })), null, 2));

    if (!conversation || !Array.isArray(conversation)) {
      return res.status(400).json({ error: "Invalid conversation array" });
    }

    // 1) Build final messages: Keep image_url chunks instead of discarding them
    const finalMessages = [
      systemPrompt(), // The system prompt is a single text-based message
      ...conversation.map((msg) => {
        // If msg.content is an array, preserve it as-is (so we keep {type: 'image_url', ...})
        if (Array.isArray(msg.content)) {
          return {
            role: msg.role,
            content: msg.content, 
          };
        } else {
          // If it's a plain string, wrap it in a text chunk
          return {
            role: msg.role,
            content: [
              {
                type: "text",
                text: msg.content,
              },
            ],
          };
        }
      }),
    ];

    // Before model call
    console.log("[DEBUG] Sending to model:", JSON.stringify(finalMessages.map(msg => ({
      role: msg.role,
      contentType: Array.isArray(msg.content) ? 'array' : typeof msg.content,
      hasImage: Array.isArray(msg.content) && msg.content.some(c => c.type === 'image_url')
    })), null, 2));

    // 2) Decide if we should use O1 for advanced reasoning
    let useO1 = false;
    let lastUserText = "";
    const lastMessage = conversation[conversation.length - 1];

    // Extract text from the last user message
    if (lastMessage) {
      if (Array.isArray(lastMessage.content)) {
        lastUserText = lastMessage.content
          .filter((c) => c.type === "text")
          .map((c) => c.text)
          .join(" ");
      } else if (typeof lastMessage.content === "string") {
        lastUserText = lastMessage.content;
      }
    }

    // If user or AI says "diagnosis" => advanced O1
    if (/\bdiagnos(e|is|es)\b/i.test(lastUserText)) {
      useO1 = true;
    }

    // Also switch to O1 if the last user content includes labs/EMR 
    // (like doc-labs or doc-emr)
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

    // 3) Query the appropriate model
    let diagnosis;
    if (useO1) {
      console.log("[DEBUG] Using O1-preview");
      diagnosis = await queryO1Preview(finalMessages);
    } else {
      console.log("[DEBUG] Using GPT-4 with vision");
      diagnosis = await queryChatGpt4o(finalMessages);
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