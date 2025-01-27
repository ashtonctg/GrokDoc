import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import SeverityScale from "./SeverityScale";
import TriageProgress from "./TriageProgress";
import ConfidenceScale from "./ConfidenceScale";

// Define which fields are critical vs. optional
const CRITICAL_FIELDS = ["onset", "severity", "medicalHistory", "meds"];
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
  // Initial conversation
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content: "Hey, I'm GrokDoc, your AI doctor. What are your symptoms?",
    },
  ]);

  // UI / loading states
  const [userInput, setUserInput] = useState("");
  const [loading, setLoading] = useState(false);

  // Triage state for all 10 fields
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

  // Count only the 4 critical fields
  const criticalCount = CRITICAL_FIELDS.reduce(
    (acc, field) => (triageState[field] ? acc + 1 : acc),
    0
  );
  const enoughTriage = criticalCount >= 4;

  // For one-time animations
  const [didAnimateSeverity, setDidAnimateSeverity] = useState(false);
  const [didAnimateLabsEmr, setDidAnimateLabsEmr] = useState(false);

  // For offering diagnosis once we hit 4 critical fields
  const [diagnosisOffered, setDiagnosisOffered] = useState(false);

  // Refs for scrolling and file inputs
  const chatContainerRef = useRef(null);
  const imageInputRef = useRef(null);
  const labsInputRef = useRef(null);
  const emrInputRef = useRef(null);
  const inputAreaRef = useRef(null);
  const [inputAreaHeight, setInputAreaHeight] = useState(0);

  // Watch for input area height changes
  useEffect(() => {
    if (!inputAreaRef.current) return;

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setInputAreaHeight(entry.borderBoxSize[0].blockSize);
      }
    });

    resizeObserver.observe(inputAreaRef.current);
    return () => resizeObserver.disconnect();
  }, []);

  // Scroll to bottom whenever messages or input area changes
  useEffect(() => {
    if (chatContainerRef.current) {
      const chatContainer = chatContainerRef.current;
      setTimeout(() => {
        chatContainer.scrollTo({
          top: chatContainer.scrollHeight,
          behavior: "smooth",
        });
      }, 100);
    }
  }, [messages, inputAreaHeight]);

  // Proactively offer a diagnosis after all 4 critical fields are in
  useEffect(() => {
    if (!diagnosisOffered && enoughTriage) {
      // Append an assistant message offering a diagnosis
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            "I now have enough info to try a diagnosis. Would you like me to attempt one?",
        },
      ]);
      setDiagnosisOffered(true);
    }
  }, [enoughTriage, diagnosisOffered]);

  // Insert "thinking..." bubble
  const addThinkingBubble = (updatedMsgs) => {
    return [...updatedMsgs, { role: "assistant", content: "..." }];
  };

  // Update a bubble at index with new content (could be text or array)
  const updateBubbleContent = (index, newContent) => {
    setMessages((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], content: newContent };
      return copy;
    });
  };

  /**
   * Returns the last assistant message (the question the AI asked most recently)
   */
  function getLastAssistantQuestion(msgArray) {
    for (let i = msgArray.length - 1; i >= 0; i--) {
      if (msgArray[i].role === "assistant") {
        const content = msgArray[i].content;
        if (Array.isArray(content)) {
          return content
            .filter(chunk => chunk.type === 'text')
            .map(chunk => chunk.text)
            .join(' ');
        }
        return content || "";
      }
    }
    return "";
  }

  /**
   * Decide which critical field the AI is asking about
   */
  function determineWhichFieldIsAsked(aiQuestion) {
    if (!aiQuestion) return null;
    
    const aiQ = aiQuestion.toLowerCase();

    if (aiQ.includes("when did") ||
        aiQ.includes("when did it start") ||
        aiQ.includes("onset") ||
        aiQ.includes("began")) {
      return "onset";
    }

    if (aiQ.includes("scale of 1-10") ||
        aiQ.includes("scale of 1 to 10") ||
        aiQ.includes("how severe")) {
      return "severity";
    }

    if (aiQ.includes("medical history") ||
        aiQ.includes("previous condition") ||
        aiQ.includes("any health issues") ||
        aiQ.includes("diagnosed with")) {
      return "medicalHistory";
    }

    if (aiQ.includes("medication") ||
        aiQ.includes("medicine") ||
        aiQ.includes("prescri") ||
        aiQ.includes("taking") ||
        aiQ.includes("are you on any meds")) {
      return "meds";
    }

    return null;
  }

  /**
   * Parse user answers for triage fields
   */
  function parseTriageAnswers(input, updatedConversation) {
    const lastAiQuestion = getLastAssistantQuestion(updatedConversation);
    const targetField = determineWhichFieldIsAsked(lastAiQuestion);

    let newTriage = { ...triageState };

    if (targetField && !newTriage[targetField]) {
      newTriage[targetField] = input;
    }

    const lc = input.toLowerCase();
    const matchSeverity = lc.match(/(\d+)\s*(?:\/|\s*out\s*of\s*)\s*10/);
    if (matchSeverity) {
      const sevVal = parseInt(matchSeverity[1], 10);
      if (sevVal >= 1 && sevVal <= 10) {
        newTriage.severity = sevVal;
      }
    }

    setTriageState(newTriage);
  }

  // Minimal voice placeholder
  const handleVoiceClick = () => alert("Voice integration placeholder.");

  // Image/labs/EMR triggers
  const handleImageClick = () => imageInputRef.current?.click();
  const handleLabsClick = () => labsInputRef.current?.click();
  const handleEmrClick = () => emrInputRef.current?.click();

  // Convert file -> base64
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

  // Handle file attachments
  const handleImageFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const base64Str = await fileToBase64(file);
    const userMsgContent = [
      { type: "text", text: "Here's an image I'd like to show." },
      {
        type: "image_url",
        image_url: {
          url: `data:${file.type};base64,${base64Str}`,
          detail: "low",
        },
      },
    ];
    sendMessageWithContent(userMsgContent);
  };

  const handleLabsFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const base64Str = await fileToBase64(file);
    const userMsgContent = [
      { type: "text", text: "Here are my labs." },
      {
        type: "image_url",
        image_url: {
          url: `data:${file.type};base64,${base64Str}`,
          detail: "doc-labs",
        },
      },
    ];
    sendMessageWithContent(userMsgContent);
  };

  const handleEmrFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const base64Str = await fileToBase64(file);
    const userMsgContent = [
      { type: "text", text: "Here's my EMR doc." },
      {
        type: "image_url",
        image_url: {
          url: `data:${file.type};base64,${base64Str}`,
          detail: "doc-emr",
        },
      },
    ];
    sendMessageWithContent(userMsgContent);
  };

  // Send a typed text message
  const sendMessage = () => {
    if (!userInput.trim()) return;
    const textContent = [{ type: "text", text: userInput }];
    sendMessageWithContent(textContent);
    setUserInput("");
  };

  // Main function to handle sending user content to the AI
  const sendMessageWithContent = async (userMsgContent) => {
    setLoading(true);

    // Add the user's message to the conversation
    const updated = [...messages, { role: "user", content: userMsgContent }];
    setMessages(updated);

    // Combine text so we can parse it
    const combinedText = Array.isArray(userMsgContent)
      ? userMsgContent
          .filter((c) => c.type === "text")
          .map((c) => c.text)
          .join(" ")
      : typeof userMsgContent === "string"
      ? userMsgContent
      : "";

    // Parse for triage fields, using the last AI question as context
    if (combinedText) {
      parseTriageAnswers(combinedText, updated);
    }

    // Add a "thinking..." bubble
    const thinkingIndex = updated.length;
    const withThinking = addThinkingBubble(updated);
    setMessages(withThinking);

    try {
      // Call your symptomChecker API
      const res = await fetch("/api/symptomChecker", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          conversation: updated,
          lastUserMessage: combinedText,
        }),
      });

      const data = await res.json();
      if (data.diagnosis) {
        // Process the text for confidence
        const finalDiag = processAiDiagnosis(data.diagnosis);
        updateBubbleContent(thinkingIndex, finalDiag);
      } else {
        updateBubbleContent(
          thinkingIndex,
          "I apologize, but I'm having trouble understanding. Could you please rephrase that?"
        );
      }
    } catch (error) {
      console.error("Error sending message with content:", error);
      updateBubbleContent(
        thinkingIndex,
        "I apologize, but I'm having technical difficulties. Could we try that again?"
      );
    }

    setLoading(false);
  };

  // Replace ASCII brackets with a chunk-based approach
  function processAiDiagnosis(rawText) {
    // e.g. "I think it's likely the flu. Confidence: 70%"
    const confMatch = rawText.match(/confidence:\s*(\d{1,3})\%/i);

    if (!confMatch) {
      // No confidence line found, just return as normal text
      return [{ type: "text", text: rawText }];
    }

    const confidenceVal = parseInt(confMatch[1], 10);
    // Remove that "Confidence: XX%" piece from the text
    const textWithoutConf = rawText.replace(confMatch[0], "").trim();

    // Return an array: text portion + separate confidence portion
    return [
      { type: "text", text: textWithoutConf },
      { type: "confidence", value: confidenceVal },
    ];
  }

  // Plan button logic -- "Option B": no partial plan, just a "need more info" prompt
  const handlePlanClick = () => {
    if (!enoughTriage) {
      const insufficientMsg =
        "I still need more info about your onset, severity, medical history, or medications. Could you share that?";
      const updated = [...messages, { role: "user", content: insufficientMsg }];
      setMessages(updated);
      sendMessageWithContent(insufficientMsg);
    } else {
      // We have enough data => proceed to PlanPage
      window.location.href = "/PlanPage";
    }
  };

  // Press ENTER => send message
  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // Handle severity scale selection
  const handleSeveritySelect = (value) => {
    setTriageState((prev) => ({ ...prev, severity: value }));
    const severityMsg = `My severity level is ${value}/10.`;
    sendMessageWithContent(severityMsg);
  };

  // Render each message bubble
  const renderMessage = (msg, index) => {
    const isAi = msg.role === "assistant";
    // msg.content can be string OR array of chunks
    const contentArr = Array.isArray(msg.content)
      ? msg.content
      : [{ type: "text", text: msg.content }];

    // Merge all text from these chunks for checks
    const contentText = contentArr.map((c) => c.text || "").join(" ");
    const isInitialGreeting =
      contentText.includes("Hey, I'm GrokDoc") ||
      contentText.includes("What are your symptoms");

    // Decide if we should show the labs/emr button set
    const shouldShowLabsEmr =
      isAi &&
      !isInitialGreeting &&
      (contentText.toLowerCase().includes("medical history") ||
        contentText.toLowerCase().includes("previous") ||
        contentText.toLowerCase().includes("test results") ||
        contentText.toLowerCase().includes("lab") ||
        contentText.toLowerCase().includes("blood work") ||
        contentText.toLowerCase().includes("medical records") ||
        contentText.toLowerCase().includes("documentation") ||
        contentText.toLowerCase().includes("diagnosed") ||
        contentText.toLowerCase().includes("treatment") ||
        contentText.toLowerCase().includes("specialist") ||
        contentText.toLowerCase().includes("chronic") ||
        (contentText.toLowerCase().includes("have you") &&
          contentText.toLowerCase().includes("seen")));

    let labsEmrClass = "";
    if (shouldShowLabsEmr && !didAnimateLabsEmr) {
      labsEmrClass = "wiggle-once";
      setDidAnimateLabsEmr(true);
    }

    // Check if we should show the severity scale
    const shouldShowSeverity =
      isAi &&
      (contentText.toLowerCase().includes("scale of 1 to 10") ||
        contentText.toLowerCase().includes("scale of 1-10") ||
        contentText.toLowerCase().includes("how severe") ||
        (contentText.toLowerCase().includes("pain") &&
          contentText.toLowerCase().includes("intense")));

    let severityScaleClass = "";
    if (shouldShowSeverity && !didAnimateSeverity) {
      severityScaleClass = "wiggle-once";
      setDidAnimateSeverity(true);
    }

    // Render the bubble content
    const messageElements = contentArr.map((chunk, i) => {
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
      } else if (chunk.type === "confidence") {
        // Insert your ConfidenceScale below the text
        return (
          <div key={i} style={{ marginTop: "0.5rem" }}>
            <ConfidenceScale confidence={chunk.value} />
          </div>
        );
      } else {
        // Fallback
        return <span key={i}>{JSON.stringify(chunk)}</span>;
      }
    });

    return (
      <div
        key={index}
        style={{ display: "flex", flexDirection: "column", marginBottom: "1rem" }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: isAi ? "flex-start" : "flex-end",
            alignItems: "center",
            padding: "0 1rem",
          }}
        >
          {/* Avatar */}
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
                  fontWeight: "bold",
                }}
              >
                ME
              </div>
            </div>
          )}

          {/* Message bubble */}
          <div
            style={{
              backgroundColor: isAi ? "#E2E2E2" : "#0d8157",
              color: isAi ? "#000" : "#fff",
              padding: "0.75rem 1rem",
              borderRadius: "6px",
              maxWidth: "70%",
              lineHeight: "1.4",
              fontSize: "1rem",
              whiteSpace: "pre-wrap",
            }}
          >
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
          <div
            style={{
              marginTop: "1.5rem",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "0.25rem",
              margin: "0.5rem 0",
            }}
          >
            <div
              style={{
                fontSize: "0.9rem",
                color: "#999",
                marginBottom: "0.25rem",
              }}
            >
              Click to share your medical docs
            </div>
            <div
              style={{
                display: "flex",
                gap: "1rem",
                justifyContent: "center",
              }}
            >
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
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = "#2377E8";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "#444";
                }}
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
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = "#2377E8";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "#444";
                }}
              >
                EMR
              </button>
            </div>
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
        width: "100%",
        height: "100vh",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Chat messages container */}
      <div
        ref={chatContainerRef}
        style={{
          flex: 1,
          overflowY: "auto",
          display: "flex",
          flexDirection: "column",
          paddingTop: "60px",
          paddingBottom: "60px",
          marginBottom: `${inputAreaHeight}px`,
          scrollBehavior: "smooth",
        }}
      >
        <div
          style={{
            flex: 1,
            minHeight: "100%",
            display: "flex",
            flexDirection: "column",
            justifyContent: "flex-end",
          }}
        >
          {messages.map((msg, idx) => renderMessage(msg, idx))}
        </div>
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

      {/* Input area */}
      <div
        ref={inputAreaRef}
        style={{
          position: "fixed",
          bottom: 0,
          left: 0,
          right: 0,
          background: "#1a1a1a",
          borderTop: "1px solid #333",
          zIndex: 1000,
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            maxWidth: "500px",
            margin: "0 auto",
            padding: "1rem",
            gap: "0.75rem",
          }}
        >
          {/* Plan Button + Progress */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "0.2rem",
            }}
          >
            <button
              className="button generate-plan-button"
              onClick={handlePlanClick}
              style={{
                backgroundColor: enoughTriage ? "#0d8157" : "#666",
                cursor: enoughTriage ? "pointer" : "not-allowed",
                padding: "0.6rem 1.2rem",
                fontSize: "1.1rem",
                borderRadius: "4px",
                border: "none",
                color: "#fff",
                width: "140px",
              }}
            >
              Generate Plan
            </button>

            {/* Show how many critical fields are filled */}
            <TriageProgress completedFields={criticalCount} />

            {!enoughTriage && (
              <div
                style={{
                  fontSize: "0.8rem",
                  color: "#666",
                }}
              >
                {4 - criticalCount} more questions
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

            {/* Icon row (voice, image) */}
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