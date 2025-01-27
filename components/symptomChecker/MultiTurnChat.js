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

  // Add new state for urgent care detection
  const [urgentCareNeeded, setUrgentCareNeeded] = useState(false);

  // Add state for urgent care UI
  const [showUrgentCareButton, setShowUrgentCareButton] = useState(false);

  // Add state for showing urgent care response buttons
  const [showUrgentCareButtons, setShowUrgentCareButtons] = useState(false);

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

  // When we have enough info, offer the plan more naturally
  useEffect(() => {
    if (!diagnosisOffered && enoughTriage) {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "I have a good understanding of your situation now. Would you like me to create a personalized 7-day plan to help manage your symptoms?"
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
        // Handle array content more safely
        if (Array.isArray(content)) {
          return content
            .filter(chunk => chunk && chunk.type === 'text')
            .map(chunk => chunk.text || '')
            .join(' ');
        }
        // Handle string content
        return typeof content === 'string' ? content : '';
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

    // Onset patterns
    if (aiQ.includes("when") ||
        aiQ.includes("start") ||
        aiQ.includes("onset") ||
        aiQ.includes("began") ||
        aiQ.includes("how long") ||
        aiQ.includes("first notice")) {
      return "onset";
    }

    // Severity patterns
    if (aiQ.includes("scale") ||
        aiQ.includes("severe") ||
        aiQ.includes("bad") ||
        aiQ.includes("pain") ||
        aiQ.includes("rate") ||
        aiQ.includes("intensity") ||
        aiQ.includes("how much")) {
      return "severity";
    }

    // Medical history patterns
    if (aiQ.includes("history") ||
        aiQ.includes("condition") ||
        aiQ.includes("health") ||
        aiQ.includes("diagnosed") ||
        aiQ.includes("previous") ||
        aiQ.includes("ever had") ||
        aiQ.includes("existing") ||
        aiQ.includes("chronic")) {
      return "medicalHistory";
    }

    // Medication patterns
    if (aiQ.includes("medication") ||
        aiQ.includes("medicine") ||
        aiQ.includes("prescri") ||
        aiQ.includes("taking") ||
        aiQ.includes("meds") ||
        aiQ.includes("treatment") ||
        aiQ.includes("using") ||
        aiQ.includes("ibuprofen") ||    // Common medication mentions
        aiQ.includes("drug")) {
      return "meds";
    }

    // Also check if it's a follow-up question about any of these topics
    if (aiQ.includes("anything else") || 
        aiQ.includes("tell me more") ||
        aiQ.includes("other") ||
        aiQ.includes("additional")) {
        // Look at previous messages to determine context
        return getPreviousTriageContext();
    }

    return null;
  }

  // Helper to determine context from previous messages
  function getPreviousTriageContext() {
    // If it's a follow-up, return the same field as the last triage question
    // This maintains context when the AI asks for more details
    const lastAiQuestion = getLastAssistantQuestion(messages);
    const lastAskedField = determineWhichFieldIsAsked(lastAiQuestion);
    return lastAskedField || null;
  }

  /**
   * Parse user answers for triage fields
   */
  function parseTriageAnswers(input, updatedConversation) {
    const lastAiQuestion = getLastAssistantQuestion(updatedConversation);
    const targetField = determineWhichFieldIsAsked(lastAiQuestion);

    let newTriage = { ...triageState };

    if (targetField) {
      const negativeResponses = ['no', 'nope', 'none', 'nah', 'not really'];
      const lc = input.toLowerCase().trim();
      
      if (negativeResponses.includes(lc)) {
        if (newTriage[targetField]) {
          newTriage[targetField] = `${newTriage[targetField]}; no additional info`;
        } else {
          newTriage[targetField] = 'none';
        }
      } else {
        if (newTriage[targetField]) {
          newTriage[targetField] = `${newTriage[targetField]}; ${input}`;
        } else {
          newTriage[targetField] = input;
        }
      }
    }

    const lc = input.toLowerCase();
    const matchSeverity = lc.match(/(\d+)\s*(?:\/|\s*out\s*of\s*)\s*10/);
    if (matchSeverity) {
      const sevVal = parseInt(matchSeverity[1], 10);
      if (sevVal >= 1 && sevVal <= 10) {
        newTriage.severity = sevVal;
      }
    }

    // Check for urgent symptoms and show buttons
    const urgentPatterns = [
      /chest pain/i,
      /difficulty breathing/i,
      /severe (pain|headache|bleeding)/i,
      /head injury/i,
      /emergency/i,
      /unbearable/i,
      /passed out/i,
      /unconscious/i,
    ];

    if (urgentPatterns.some(pattern => pattern.test(input)) || 
        (newTriage.severity && newTriage.severity >= 7)) {
      setUrgentCareNeeded(true);
      setShowUrgentCareButtons(true);
    }

    // Reset buttons if user responds
    if (lastAiQuestion.includes("find nearby urgent care")) {
      const agreePatterns = [/yes/i, /sure/i, /okay/i, /find/i, /show/i, /where/i];
      if (agreePatterns.some(pattern => pattern.test(input))) {
        handleUrgentCareRedirect();
      }
      setShowUrgentCareButtons(false);
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
  const handlePlanClick = async () => {
    console.log("[DEBUG] Plan Click - Triage State:", triageState);
    console.log("[DEBUG] Plan Click - Messages:", messages);

    if (!enoughTriage) {
      console.log("[DEBUG] Not enough triage info");
      const insufficientMsg = "I still need more info about your onset, severity, medical history, or medications. Could you share that?";
      setMessages(prev => [...prev, { role: "assistant", content: insufficientMsg }]);
      return;
    }

    const planContext = {
      triageState,
      conversationHistory: messages,
      symptoms: messages[1]?.content || "",
    };
    
    console.log("[DEBUG] Storing plan context:", planContext);
    localStorage.setItem('planContext', JSON.stringify(planContext));
    window.location.href = "/PlanPage";
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

  // Handle urgent care navigation with context preservation
  const handleUrgentCareRedirect = () => {
    // Store conversation context
    localStorage.setItem('chatContext', JSON.stringify({
      messages,
      triageState,
      returnPath: '/symptom-checker'
    }));
    
    window.location.href = "/urgent-care";
  };

  // Handle "No" response
  const handleDeclineUrgentCare = () => {
    setUserInput("No, I don't need urgent care right now");
    sendMessage();
    setShowUrgentCareButtons(false);
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
                  overflow: "hidden"
                }}
              >
                <Image
                  src="/GregAvatar.png"
                  alt="User"
                  width={36}
                  height={36}
                  style={{
                    objectFit: "cover"
                  }}
                />
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

        {/* Add urgent care buttons - Updated condition */}
        {isAi && 
         showUrgentCareButtons && 
         (msg.content.includes("Would you like me to help you find nearby urgent care") ||
          msg.content.includes("find nearby urgent care centers")) && (
          <div style={{
            display: 'flex',
            gap: '1rem',
            marginTop: '1rem'
          }}>
            <button
              onClick={handleUrgentCareRedirect}
              style={{
                backgroundColor: '#2a2a2a',
                color: '#fff',
                padding: '0.5rem 1rem',
                borderRadius: '4px',
                border: '1px solid #333',
                cursor: 'pointer',
                fontFamily: 'Inter, sans-serif',
                fontSize: '0.9rem',
                transition: 'all 0.3s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#3a3a3a';
                e.currentTarget.style.transform = 'scale(1.05)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#2a2a2a';
                e.currentTarget.style.transform = 'scale(1)';
              }}
            >
              Yes, find urgent care
            </button>
            <button
              onClick={handleDeclineUrgentCare}
              style={{
                backgroundColor: '#2a2a2a',
                color: '#fff',
                padding: '0.5rem 1rem',
                borderRadius: '4px',
                border: '1px solid #333',
                cursor: 'pointer',
                fontFamily: 'Inter, sans-serif',
                fontSize: '0.9rem',
                transition: 'all 0.3s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#3a3a3a';
                e.currentTarget.style.transform = 'scale(1.05)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#2a2a2a';
                e.currentTarget.style.transform = 'scale(1)';
              }}
            >
              No, continue chat
            </button>
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

            <button
              className="button"
              onClick={() => window.location.href = "/urgent-care"}
              style={{
                backgroundColor: "#666",
                fontSize: "0.9rem",
                padding: "0.4rem 0.8rem",
                marginTop: "0.5rem"
              }}
            >
              Debug: Test Urgent Care
            </button>
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