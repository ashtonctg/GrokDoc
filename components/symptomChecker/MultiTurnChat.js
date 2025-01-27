import { useState, useRef, useCallback, useEffect } from "react";
import Image from "next/image";
import SeverityScale from "./SeverityScale";
import TriageProgress from "./TriageProgress";

/** Triage fields we track */
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

  // UI state
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

  // For plan generation
  const answeredCount = Object.values(triageState).filter(Boolean).length;
  const enoughTriage = answeredCount >= 4; // lowered from 6 to 4

  // For one-time animations
  const [didAnimateSeverity, setDidAnimateSeverity] = useState(false);
  const [didAnimateLabsEmr, setDidAnimateLabsEmr] = useState(false);

  // Refs
  const chatContainerRef = useRef(null);
  const imageInputRef = useRef(null);
  const labsInputRef = useRef(null);
  const emrInputRef = useRef(null);

  // Scroll to bottom on new messages
  const scrollToBottom = useCallback(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  // Insert "thinking..." bubble
  const addThinkingBubble = (updatedMsgs) => {
    return [...updatedMsgs, { role: "assistant", content: "..." }];
  };

  // Update bubble content at index
  const updateBubbleContent = (index, newContent) => {
    setMessages((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], content: newContent };
      return copy;
    });
  };

  // Minimal triage parse
  function parseTriageAnswers(input) {
    const lc = (input || "").toLowerCase();
    let newTriage = { ...triageState };

    // Example: if user says "Started 2 days ago"
    if (lc.includes("day") && !newTriage.onset) {
      newTriage.onset = "some day info";
    }
    // Implement your parse logic, similarly for severity, etc.
    setTriageState(newTriage);
  }

  // Voice placeholder
  const handleVoiceClick = () => alert("Voice integration placeholder.");

  // Trigger image input
  const handleImageClick = () => {
    if (imageInputRef.current) {
      imageInputRef.current.click();
    }
  };
  // Trigger labs input
  const handleLabsClick = () => {
    if (labsInputRef.current) {
      labsInputRef.current.click();
    }
  };
  // Trigger emr input
  const handleEmrClick = () => {
    if (emrInputRef.current) {
      emrInputRef.current.click();
    }
  };

  // On file select for image
  const handleImageFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const base64Str = await fileToBase64(file);
    const userMsgContent = [
      { type: "text", text: "Here's an image I'd like to show." },
      {
        type: "image_url",
        image_url: { url: `data:${file.type};base64,${base64Str}`, detail: "low" },
      },
    ];
    sendMessageWithContent(userMsgContent);
  };

  // On file select for labs
  const handleLabsFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const base64Str = await fileToBase64(file);
    const userMsgContent = [
      { type: "text", text: "Here are my labs." },
      {
        type: "image_url",
        image_url: { url: `data:${file.type};base64,${base64Str}`, detail: "doc-labs" },
      },
    ];
    sendMessageWithContent(userMsgContent);
  };

  // On file select for emr
  const handleEmrFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const base64Str = await fileToBase64(file);
    const userMsgContent = [
      { type: "text", text: "Here's my EMR doc." },
      {
        type: "image_url",
        image_url: { url: `data:${file.type};base64,${base64Str}`, detail: "doc-emr" },
      },
    ];
    sendMessageWithContent(userMsgContent);
  };

  const fileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const dataUrl = reader.result;
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
    const textContent = [{ type: "text", text: userInput }];
    sendMessageWithContent(textContent);
    setUserInput("");
  };

  // The main function to call the API
  const sendMessageWithContent = async (userMsgContent) => {
    setLoading(true);

    const updated = [...messages, { role: "user", content: userMsgContent }];
    setMessages(updated);

    // Attempt triage parse
    if (Array.isArray(userMsgContent)) {
      const combinedText = userMsgContent
        .filter((c) => c.type === "text")
        .map((c) => c.text)
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
        const processed = processAiDiagnosis(data.diagnosis);
        updateBubbleContent(thinkingIndex, processed);
      } else {
        updateBubbleContent(thinkingIndex, "Hmm, no response. Try again?");
      }
    } catch (error) {
      console.error("Error sending message with content:", error);
      updateBubbleContent(thinkingIndex, "Error: Unable to get a response.");
    }

    setLoading(false);
  };

  // This function checks if the AI's message includes "Possible Diagnoses"
  // or "Confidence: XX%" lines, then appends a dynamic UI or clarifies it
  function processAiDiagnosis(rawText) {
    // For example, if rawText is "Possible Diagnoses: 1) Flu (70% confidence), 2) Cold (20%), 3) Unknown (10%). Confidence: 70% overall"
    let finalText = rawText;

    // Look for a "Confidence: XX%" pattern
    const confMatch = rawText.match(/confidence:\s*(\d{1,3})\%/i);
    if (confMatch) {
      const confidenceValue = parseInt(confMatch[1], 10);
      // We'll display a line of boxes. E.g. if 70% => that might be 7/10
      const boxesFilled = Math.round((confidenceValue / 100) * 10);
      // We'll produce something like: [Confidence Scale: X boxes]

      // Create a custom bracket to show the boxes
      let confidenceScale = "";
      for (let i = 1; i <= 10; i++) {
        confidenceScale += i <= boxesFilled ? "[■]" : "[ ]";
      }
      // We'll embed that after the text or at the end
      finalText += `\n\nConfidence Scale:\n${confidenceScale}  (${confidenceValue}%)`;
    }

    return finalText;
  }

  // Press ENTER
  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // The plan button logic
  const handlePlanClick = () => {
    if (!enoughTriage) {
      const userMsgContent = "Generate a plan for me.";
      const updated = [...messages, { role: "user", content: userMsgContent }];
      setMessages(updated);

      // Instead of manually setting a response, let's send this to the AI
      sendMessageWithContent(userMsgContent);
    } else {
      window.location.href = "/treatment-plans";
    }
  };

  // Renders each message bubble
  const renderMessage = (msg, index) => {
    const isAi = msg.role === "assistant";

    let messageElements = null;
    if (Array.isArray(msg.content)) {
      messageElements = msg.content.map((chunk, i) => {
        if (chunk.type === "text") {
          return <span key={i}>{chunk.text}</span>;
        } else if (chunk.type === "image_url") {
          return (
            <div key={i} style={{ marginTop: "0.5rem" }}>
              <Image
                src={chunk.image_url.url}
                alt="User Provided Doc"
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
      messageElements = msg.content; // string
    }

    // Check if we should show severity scale
    const contentStr = typeof msg.content === "string" ? msg.content.toLowerCase() : "";
    const shouldShowSeverity = isAi && !triageState.severity && (contentStr.includes("1-10") || contentStr.includes("1 to 10"));
    // Check if we should show labs/emr
    const shouldShowLabsEmr = isAi && (contentStr.includes("medical record") || contentStr.includes("lab result") || contentStr.includes("test result") || contentStr.includes("health record") || contentStr.includes("upload") || contentStr.includes("do you have any"));
    
    // *** For one-time button animation
    let severityScaleClass = "";
    if (shouldShowSeverity && !didAnimateSeverity) {
      severityScaleClass = "wiggle-once"; // We'll define CSS
      // Mark that we've animated once
      setDidAnimateSeverity(true);
    }

    let labsEmrClass = "";
    if (shouldShowLabsEmr && !didAnimateLabsEmr) {
      labsEmrClass = "wiggle-once";
      setDidAnimateLabsEmr(true);
    }

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
            <div className={severityScaleClass}>
              <SeverityScale onSelectSeverity={handleSeveritySelect} />
            </div>
          </div>
        )}

        {/* Possibly show labs/emr buttons */}
        {shouldShowLabsEmr && (
          <div style={{ 
            marginTop: "1.5rem",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "0.25rem",
            margin: "0.5rem 0"
          }}>
            <div style={{
              fontSize: "0.9rem",
              color: "#999",
              marginBottom: "0.25rem",
            }}>
              Share your medical docs
            </div>
            <div style={{
              display: "flex",
              gap: "1rem",
              justifyContent: "center"
            }}>
              <button
                className={labsEmrClass + " button"}
                onClick={handleLabsClick}
                style={{
                  backgroundColor: "#444",
                  color: "#fff",
                  padding: "1.8rem 1rem",
                  fontSize: "1.2rem",
                  borderRadius: "4px",
                  cursor: "pointer",
                  width: "100px",
                  fontFamily: "countach, sans-serif",
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                }}
                onMouseEnter={(e) => { e.currentTarget.style.backgroundColor="#2377E8"; }}
                onMouseLeave={(e) => { e.currentTarget.style.backgroundColor="#444"; }}
              >
                LABS
              </button>
              <button
                className={labsEmrClass + " button"}
                onClick={handleEmrClick}
                style={{
                  backgroundColor: "#444",
                  color: "#fff",
                  padding: "1.8rem 1rem",
                  fontSize: "1.2rem",
                  borderRadius: "4px",
                  cursor: "pointer",
                  width: "100px",
                  fontFamily: "countach, sans-serif",
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                }}
                onMouseEnter={(e) => { e.currentTarget.style.backgroundColor="#2377E8"; }}
                onMouseLeave={(e) => { e.currentTarget.style.backgroundColor="#444"; }}
              >
                EMR
              </button>
            </div>
          </div>
        )}
      </div>
    );
  };

  // Handle severity scale
  const handleSeveritySelect = (value) => {
    setTriageState((prev) => ({ ...prev, severity: value }));
    const severityMsg = `My severity level is ${value}/10.`;
    sendMessageWithContent(severityMsg);
  };

  return (
    <div style={{
      display: "flex",
      flexDirection: "column",
      gap: "1rem",
      width: "100%",
      height: "100vh",
      position: "relative",
    }}>
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

      {/* Hidden file inputs */}
      <input
        ref={imageInputRef}
        type="file"
        accept="image/*"
        style={{ display: "none" }}
        onChange={handleImageFileChange}
      />
      <input
        ref={labsInputRef}
        type="file"
        accept="application/pdf,image/*"
        style={{ display: "none" }}
        onChange={handleLabsFileChange}
      />
      <input
        ref={emrInputRef}
        type="file"
        accept="application/pdf,image/*"
        style={{ display: "none" }}
        onChange={handleEmrFileChange}
      />

      {/* Chat input area + Plan button */}
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
          {/* The Plan Button + Progress section */}
          <div style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "0.2rem"
          }}>
            <button
              className="button generate-plan-button"
              onClick={handlePlanClick}
              style={{
                backgroundColor: enoughTriage ? "#0d8157" : "#666",
                cursor: enoughTriage ? "pointer" : "not-allowed",
                textDecoration: "none",
                padding: "0.6rem 1.2rem",
                fontSize: "1.1rem",
                borderRadius: "4px",
                border: "none",
                color: "#fff",
                width: "140px"
              }}
            >
              Generate Plan
            </button>
            
            <TriageProgress completedFields={answeredCount} />
            
            {!enoughTriage && (
              <div style={{
                fontSize: "0.8rem",
                color: "#666",
                marginTop: "-0.2rem"
              }}>
                {4 - answeredCount} more questions
              </div>
            )}
          </div>

          {/* Chat input box */}
          <div style={{ position: "relative", width: "100%" }}>
            <textarea
              rows={3}
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              onKeyDown={handleKeyDown}
              style={{
                width: "100%",
                backgroundColor: "#2a2a2a",
                color: "#fff",
                border: "1px solid #444",
                borderRadius: "8px",
                padding: "10px 80px 35px 12px",
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