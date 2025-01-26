// components/symptomChecker/MultiTurnChat.js

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";

export default function MultiTurnChat() {
  // Start with AI greeting
  const [messages, setMessages] = useState([
    { role: "assistant", content: "Hey, I'm GrokDoc, your AI doctor. How can I help? What are your symptoms?" }
  ]);
  const [userInput, setUserInput] = useState("");
  const [loading, setLoading] = useState(false);

  // Count user messages to enable plan
  const userMessageCount = messages.filter(msg => msg.role === "user").length;
  const canGeneratePlan = userMessageCount >= 5;

  // Insert a "thinking..." bubble
  const addThinkingBubble = (updatedMsgs) => {
    return [...updatedMsgs, { role: "assistant", content: "..." }];
  };

  // Update content in the bubble
  const updateBubbleContent = (index, newContent) => {
    setMessages(prev => {
      const copy = [...prev];
      copy[index] = { ...copy[index], content: newContent };
      return copy;
    });
  };

  const handleVoiceClick = () => {
    alert("Voice integration placeholder - Realtime API or STT here.");
  };

  const handleImageClick = () => {
    alert("Image integration placeholder - choose an image, then pass to AI or vision model.");
  };

  // Send user message
  const sendMessage = async () => {
    if (!userInput.trim()) return;
    setLoading(true);

    const updated = [...messages, { role: "user", content: userInput }];
    setMessages(updated);
    setUserInput("");

    // Add "thinking..." bubble
    const thinkingIndex = updated.length;
    const withThinking = addThinkingBubble(updated);
    setMessages(withThinking);

    try {
      const res = await fetch("/api/symptomChecker", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ conversation: updated }),
      });
      const data = await res.json();
      if (data.diagnosis) {
        updateBubbleContent(thinkingIndex, data.diagnosis);
      } else {
        updateBubbleContent(thinkingIndex, "Hmm, no response. Try again?");
      }
    } catch (error) {
      console.error("Error sending message:", error);
      updateBubbleContent(thinkingIndex, "Error: Unable to get a response.");
    }
    setLoading(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "1rem",
        width: "100%",
        height: "100vh", // Take full viewport height
        position: "relative", // Add this for absolute positioning of input area
      }}
    >
      {/* Chat area - adjust bottom padding to make room for input */}
      <div
        style={{
          height: "calc(100vh - 180px)", // Adjust height to leave space for input
          overflowY: "auto",
          display: "flex",
          flexDirection: "column",
          gap: "1rem",
          paddingBottom: "2rem",
        }}
      >
        {messages.map((msg, idx) => {
          const isUser = msg.role === "user";
          const bubbleStyle = {
            backgroundColor: isUser ? "#0d8157" : "#E2E2E2",
            color: isUser ? "#fff" : "#000",
            padding: "0.9rem",
            borderRadius: "8px",
            maxWidth: "70%",
            lineHeight: "1.4",
            fontSize: "1rem",
            whiteSpace: "pre-wrap",
          };

          return (
            <div
              key={idx}
              style={{
                display: "flex",
                justifyContent: isUser ? "flex-end" : "flex-start",
                alignItems: "center",
                padding: "0 1rem",
              }}
            >
              {/* Avatar */}
              {!isUser && (
                <div style={{ marginRight: "0.5rem" }}>
                  {/* Put AgentIcon in a circular background */}
                  <div
                    style={{
                      width: "36px",
                      height: "36px",
                      borderRadius: "50%",
                      backgroundColor: "#444", // agent's circle color
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Image
                      src="/AgentIcon.png"
                      alt="AI"
                      width={24}
                      height={24}
                      style={{ borderRadius: "50%" }}
                    />
                  </div>
                </div>
              )}
              {isUser && (
                <div style={{ marginRight: "0.5rem" }}>
                  <div
                    style={{
                      width: "36px",
                      height: "36px",
                      borderRadius: "50%",
                      backgroundColor: "#666",
                    }}
                  />
                </div>
              )}

              {/* Bubble */}
              <div style={bubbleStyle}>{msg.content}</div>
            </div>
          );
        })}
      </div>

      {/* Input area - position at bottom */}
      <div
        style={{
          position: "fixed",
          bottom: 0,
          left: 0,
          right: 0,
          padding: "1rem",
          background: "#1a1a1a", // Match your dark theme
          borderTop: "1px solid #333",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            maxWidth: "500px",
            margin: "0 auto",
            gap: "0.75rem",
          }}
        >
          {/* Generate Plan button */}
          {canGeneratePlan && (
            <Link href="/treatment-plans" legacyBehavior>
              <a
                className="button"
                style={{
                  backgroundColor: "#0d8157",
                  textDecoration: "none",
                  padding: "6px 12px",
                  fontSize: "14px",
                  borderRadius: "4px",
                }}
              >
                Generate Plan
              </a>
            </Link>
          )}

          {/* Input field container */}
          <div style={{ position: "relative", width: "100%" }}>
            <textarea
              rows={4}
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              onKeyDown={handleKeyDown}
              style={{
                width: "100%",
                backgroundColor: "#2a2a2a",
                color: "#fff",
                border: "1px solid #444",
                borderRadius: "8px",
                padding: "12px 80px 40px 12px",
                resize: "none",
                fontSize: "16px",
                lineHeight: "1.5",
                outline: "none",
              }}
            />
            
            {/* Icons container */}
            <div
              style={{
                position: "absolute",
                bottom: "8px",
                left: "12px",
                display: "flex",
                gap: "0.75rem",
                alignItems: "center",
                height: "24px",
              }}
            >
              <Image
                src="/VoiceIcon.png"
                alt="Voice"
                width={16}
                height={16}
                style={{ cursor: "pointer", opacity: 0.6 }}
                onClick={handleVoiceClick}
              />
              <Image
                src="/ImageUploadIcon.png"
                alt="Image"
                width={16}
                height={16}
                style={{ cursor: "pointer", opacity: 0.6 }}
                onClick={handleImageClick}
              />
            </div>

            {/* Smaller Send button */}
            <button
              className="button"
              onClick={sendMessage}
              disabled={loading}
              style={{
                position: "absolute",
                right: "8px",
                bottom: "8px",
                minWidth: "50px",
                height: "28px",
                padding: "4px 8px",
                fontSize: "14px",
              }}
            >
              {loading ? "..." : "Send"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}