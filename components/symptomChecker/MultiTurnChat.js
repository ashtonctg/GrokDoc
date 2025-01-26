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
  // AI greeting - Initialize messages state first
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content: "Hey, I'm GrokDoc, your AI doctor. What are your symptoms?",
    },
  ]);

  // Add ref for chat container
  const chatContainerRef = useRef(null);

  // Add scroll to bottom function
  const scrollToBottom = useCallback(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, []);

  // Auto-scroll on new messages
  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  const [userInput, setUserInput] = useState("");
  const [loading, setLoading] = useState(false);

  // Triage state object
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

  // How many triage fields are answered
  const answeredCount = Object.values(triageState).filter(Boolean).length;
  const enoughTriage = answeredCount >= 6;

  // "thinking..." bubble
  const addThinkingBubble = (updatedMsgs) => {
    return [...updatedMsgs, { role: "assistant", content: "..." }];
  };

  // Replace bubble content
  const updateBubbleContent = (index, newContent) => {
    setMessages((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], content: newContent };
      return copy;
    });
  };

  const handleVoiceClick = () => alert("Voice integration placeholder.");
  const handleImageClick = () => alert("Image integration placeholder.");

  // MAIN function to send user text
  const sendMessage = async () => {
    if (!userInput.trim()) return;
    setLoading(true);

    const updated = [...messages, { role: "user", content: userInput }];
    setMessages(updated);

    // Attempt to parse triage from user text
    parseTriageAnswers(userInput);

    setUserInput("");

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
      console.error("Error sending message:", error);
      updateBubbleContent(thinkingIndex, "Error: Unable to get a response.");
    }

    setLoading(false);
  };

  // Press ENTER to send
  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // Minimal parse for 10 triage fields
  function parseTriageAnswers(input) {
    const lc = input.toLowerCase();
    let newTriage = { ...triageState };

    // 1) Onset
    const onsetMatch = lc.match(/(for|started)\s(\d+)\s(day|days|week|weeks|month|months)/);
    if (onsetMatch && !newTriage.onset) {
      newTriage.onset = `${onsetMatch[2]} ${onsetMatch[3]}`;
    }

    // 2) Severity
    const severityMatch = lc.match(/(\d)\/10|scale (\d)/);
    if (severityMatch && !newTriage.severity) {
      newTriage.severity = parseInt(severityMatch[1] || severityMatch[2], 10);
    }

    // 3) AssociatedSymptoms
    if (!newTriage.associatedSymptoms && lc.includes("also have")) {
      const after = lc.split("also have")[1];
      if (after) {
        newTriage.associatedSymptoms = after.trim().split(".")[0];
      }
    }

    // 4) Medical history
    if (!newTriage.medicalHistory && lc.includes("my medical history includes")) {
      const after = lc.split("my medical history includes")[1];
      if (after) {
        newTriage.medicalHistory = after.trim();
      }
    }

    // 5) Family history
    if (!newTriage.familyHistory && lc.includes("in my family")) {
      newTriage.familyHistory = "Yes";
    }

    // 6) Meds
    if (!newTriage.meds && (lc.includes("i take") || lc.includes("i'm on"))) {
      const afterTake = lc.includes("i take") ? lc.split("i take")[1] : lc.split("i'm on")[1];
      if (afterTake) {
        newTriage.meds = afterTake.trim().split(" ")[0];
      }
    }

    // 7) Allergies
    if (!newTriage.allergies && lc.includes("allerg") && !lc.includes("no allerg")) {
      newTriage.allergies = "Yes (unspecified)";
    }

    // 8) Lifestyle
    if (!newTriage.lifestyle && (lc.includes("my diet") || lc.includes("i exercise"))) {
      newTriage.lifestyle = "Some lifestyle info provided";
    }

    // 9) SubstanceUse
    if (!newTriage.substanceUse && (lc.includes("i smoke") || lc.includes("i drink"))) {
      newTriage.substanceUse = "Yes";
    }

    // 10) ImpactDaily
    if (!newTriage.impactDaily && (lc.includes("affects my") || lc.includes("can't sleep"))) {
      newTriage.impactDaily = "Yes";
    }

    setTriageState(newTriage);
  }

  // Handle severity selection from the scale
  const handleSeveritySelect = (value) => {
    setTriageState(prev => ({
      ...prev,
      severity: value
    }));
    // Add a user message with the chosen severity
    const severityMsg = `My pain level is ${value}/10.`;
    const updated = [...messages, { role: "user", content: severityMsg }];
    setMessages(updated);

    // Possibly parse triage again
    parseTriageAnswers(severityMsg);

    // Attempt another AI response
    const thinkingIndex = updated.length;
    const withThinking = addThinkingBubble(updated);
    setMessages(withThinking);

    // Call the API
    (async () => {
      setLoading(true);
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
        console.error("Error after severity select:", error);
        updateBubbleContent(thinkingIndex, "Error: Unable to get a response.");
      }
      setLoading(false);
    })();
  };

  // RENDER each message using a custom function
  const renderMessage = (msg, index) => {
    const isAi = (msg.role === "assistant");
    const contentLower = msg.content.toLowerCase();

    // Check if we show severity scale: 
    // if the AI says something like "On a scale of 1-10..."
    const shouldShowSeverity = isAi && 
      !triageState.severity &&
      (contentLower.includes("1-10") || contentLower.includes("1 to 10"));

    return (
      <div key={index} style={{ display: "flex", flexDirection: "column", marginBottom: "1rem" }}>
        {/* Bubble row */}
        <div style={{
          display: "flex",
          justifyContent: isAi ? "flex-start" : "flex-end",
          alignItems: "center",
          padding: "0 1rem",
        }}>
          {/* Avatar */}
          {isAi && (
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
          )}
          {!isAi && (
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

          {/* Bubble */}
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
            {msg.content}
          </div>
        </div>

        {/* Possibly show severity scale below the AI message */}
        {shouldShowSeverity && (
          <div style={{ marginTop: "0.5rem", paddingLeft: "52px" }}>
            {/* We pass handleSeveritySelect so the user picks a number */}
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
      {/* Chat area */}
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
        {/* Now we call renderMessage for each message */}
        {messages.map((msg, idx) => renderMessage(msg, idx))}
      </div>

      {/* Bottom Input */}
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
          {/* If enough triage answered, show Generate Plan */}
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

          {/* Textarea + icons + send */}
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