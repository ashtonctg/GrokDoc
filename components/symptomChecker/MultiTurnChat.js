// components/symptomChecker/MultiTurnChat.js

import { useState, useRef, useCallback, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import SeverityScale from "./SeverityScale";

const TEN_TRIAGE_FIELDS = [
  "onset", 
  "severity", 
  "associatedSymptoms", 
  "medicalHistory", 
  "familyHistory", 
  "meds",
  "allergies",
  "lifestyle",
  "substanceUse",
  "impactDaily",
];

export default function MultiTurnChat() {
  // The conversation messages
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content: "Hey, I'm GrokDoc, your AI doctor. What are your symptoms?",
    },
  ]);

  const chatContainerRef = useRef(null);

  // Scroll to bottom on new messages
  const scrollToBottom = useCallback(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  const [userInput, setUserInput] = useState("");
  const [loading, setLoading] = useState(false);

  // Triage tracking
  const [triageState, setTriageState] = useState({
    onset: null,
    severity: null,
    associatedSymptoms: null,
    medicalHistory: null,
    familyHistory: null,
    meds: null,
    allergies: null,
    lifestyle: null,
    substanceUse: null,
    impactDaily: null,
  });

  const answeredCount = Object.values(triageState).filter(Boolean).length;
  const enoughTriage = answeredCount >= 6;

  // Hidden file input ref
  const fileInputRef = useRef(null);

  // Insert a "thinking..." bubble
  const addThinkingBubble = (updatedMsgs) => {
    return [...updatedMsgs, { role: "assistant", content: "..." }];
  };

  // Update content of bubble at index
  const updateBubbleContent = (index, newContent) => {
    setMessages((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], content: newContent };
      return copy;
    });
  };

  // Handle voice
  const handleVoiceClick = () => alert("Voice integration placeholder - Realtime API or STT.");

  // Handle the image icon click -> triggers hidden file input
  const handleImageClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  // On file select
  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Convert file to base64
    const base64Str = await fileToBase64(file);
    // Build content array for the user message
    const userMsgContent = [
      { type: "text", text: "Here's an image I'd like to show." },
      {
        type: "image_url",
        image_url: {
          url: `data:${file.type};base64,${base64Str}`,
          detail: "low", // can also use 'high'
        },
      },
    ];

    // Send message with array content
    sendMessageWithContent(userMsgContent);
  };

  // Utility to convert file -> base64
  const fileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const dataUrl = reader.result; // e.g. "data:image/png;base64,XXX"
        const base64Part = dataUrl.split("base64,")[1]; 
        resolve(base64Part);
      };
      reader.onerror = (err) => reject(err);
      reader.readAsDataURL(file);
    });
  };

  // Send text-based message
  const sendMessage = () => {
    if (!userInput.trim()) return;
    // We'll unify everything behind a "sendMessageWithContent" approach
    const textContent = [{ type: "text", text: userInput }];
    sendMessageWithContent(textContent);
    setUserInput("");
  };

  // The main function that calls the API with conversation + new user message
  const sendMessageWithContent = async (userMsgContent) => {
    setLoading(true);

    // The user message (role: "user", content: array or string)
    const updated = [...messages, { role: "user", content: userMsgContent }];
    setMessages(updated);

    // Attempt triage parse if there's text
    if (Array.isArray(userMsgContent)) {
      const combinedText = userMsgContent
        .filter(c => c.type === "text")
        .map(c => c.text)
        .join(" ");
      parseTriageAnswers(combinedText);
    } else if (typeof userMsgContent === "string") {
      parseTriageAnswers(userMsgContent);
    }

    // "thinking..." bubble
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
      console.error("Error sending message with content:", error);
      updateBubbleContent(thinkingIndex, "Error: Unable to get a response.");
    }

    setLoading(false);
  };

  // Press ENTER to send text
  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // Minimal triage parse (same as your existing logic)
  function parseTriageAnswers(input) {
    const lc = (input || "").toLowerCase();
    let newTriage = { ...triageState };

    // Onset, severity, etc...
    // (same parse logic as you have)

    setTriageState(newTriage);
  }

  // Handle severity selection from the scale
  const handleSeveritySelect = (value) => {
    setTriageState((prev) => ({ ...prev, severity: value }));
    // We'll create a user message as though typed
    const severityMsg = `My severity level is ${value}/10.`;
    sendMessageWithContent(severityMsg);
  };

  // Render each message
  const renderMessage = (msg, index) => {
    const isAi = msg.role === "assistant";
    // content can be string or array
    let messageElements = null;

    if (Array.isArray(msg.content)) {
      // We have an array of objects (text, image_url, etc.)
      messageElements = msg.content.map((chunk, i) => {
        if (chunk.type === "text") {
          return <span key={i}>{chunk.text}</span>;
        } else if (chunk.type === "image_url") {
          return (
            <div key={i} style={{ marginTop: "0.5rem" }}>
              {/* Show a small thumbnail or full? */}
              <Image
                src={chunk.image_url.url}
                alt="User Provided"
                width={200}
                height={200}
                style={{ borderRadius: "6px" }}
              />
            </div>
          );
        } else {
          return <span key={i}>{JSON.stringify(chunk)}</span>;
        }
      });
    } else {
      // string content
      messageElements = msg.content;
    }

    // Check if we should show severity scale
    const contentStr = typeof msg.content === "string" ? msg.content.toLowerCase() : "";
    const shouldShowSeverity = isAi && 
      !triageState.severity &&
      (contentStr.includes("1-10") || contentStr.includes("1 to 10"));

    return (
      <div key={index} style={{ display: "flex", flexDirection: "column", marginBottom: "1rem" }}>
        <div style={{
          display: "flex",
          justifyContent: isAi ? "flex-start" : "flex-end",
          alignItems: "center",
          padding: "0 1rem",
        }}>
          {isAi ? (
            <div style={{ marginRight: "0.5rem" }}>
              <div
                style={{
                  width: "36px",
                  height: "36px",
                  borderRadius: "50%",
                  backgroundColor: "#444",
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
          ) : (
            <div style={{ marginRight: "0.5rem" }}>
              <div
                style={{
                  width: "36px",
                  height: "36px",
                  borderRadius: "50%",
                  backgroundColor: "#666",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#fff",
                  fontFamily: "countach, sans-serif",
                  fontSize: "20px",
                  fontWeight: "bold"
                }}
              >
                ME
              </div>
            </div>
          )}

          <div style={{
            backgroundColor: isAi ? "#E2E2E2" : "#0d8157",
            color: isAi ? "#000" : "#fff",
            padding: "0.75rem 1rem",
            borderRadius: "6px",
            maxWidth: "70%",
            lineHeight: "1.4",
            fontSize: "1rem",
            whiteSpace: "pre-wrap",
          }}>
            {messageElements}
          </div>
        </div>

        {/* Possibly show severity scale */}
        {shouldShowSeverity && (
          <div style={{ marginTop: "0.5rem", paddingLeft: "52px" }}>
            <SeverityScale onSelectSeverity={handleSeveritySelect} />
          </div>
        )}
      </div>
    );
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "1rem",
        width: "100%",
        height: "100vh",
        position: "relative",
      }}
    >
      <div
        ref={chatContainerRef}
        style={{
          height: "calc(100vh - 180px)",
          overflowY: "auto",
          display: "flex",
          flexDirection: "column",
          gap: "1rem",
          paddingBottom: "2rem",
          scrollBehavior: "smooth",
        }}
      >
        {messages.map((msg, idx) => renderMessage(msg, idx))}
      </div>

      {/* Hidden file input for images */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        style={{ display: "none" }}
        onChange={handleFileChange}
      />

      <div
        style={{
          position: "fixed",
          bottom: 0,
          left: 0,
          right: 0,
          padding: "1rem",
          background: "#1a1a1a",
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
          {enoughTriage && (
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

            {/* Send button */}
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