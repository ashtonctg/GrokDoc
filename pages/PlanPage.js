import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Header from "../components/common/Header";
import DayCards from "../components/plan/DayCards";
import ProgressBar from "../components/plan/ProgressBar";

export default function PlanPage() {
  // State
  const [loading, setLoading] = useState(true);
  const [planTasks, setPlanTasks] = useState([]);
  const [userSymptoms, setUserSymptoms] = useState("Cough, mild fever");
  const [noteText, setNoteText] = useState("");
  const [noteSent, setNoteSent] = useState(false);

  // Refs
  const noteInputRef = useRef(null);

  // Effects
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const isDebug = urlParams.get("debug") === "1";
    
    if (isDebug) {
      const mockTasks = generateMockTasks();
      setPlanTasks(mockTasks);
      setLoading(false);
    } else {
      fetchPlanFromServer();
    }
  }, []);

  // Helper Functions
  function generateMockTasks() {
    let tasks = [];
    let idCounter = 1;
    
    for (let day = 0; day < 7; day++) {
      tasks.push({
        id: idCounter++,
        text: `Take antibiotic (Day ${day + 1})`,
        done: false,
        dayOffset: day,
      });
      tasks.push({
        id: idCounter++,
        text: "Drink 8 glasses of water",
        done: false,
        dayOffset: day,
      });
      tasks.push({
        id: idCounter++,
        text: "Check temperature in the morning",
        done: false,
        dayOffset: day,
      });
    }
    return tasks;
  }

  async function fetchPlanFromServer() {
    setLoading(true);
    try {
      const res = await fetch("/api/generatePlan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ symptoms: userSymptoms }),
      });
      const data = await res.json();
      setPlanTasks(data.tasks || []);
    } catch (err) {
      console.error("Error fetching plan:", err);
    }
    setLoading(false);
  }

  // Event Handlers
  function handleToggleTask(taskId) {
    setPlanTasks((prev) =>
      prev.map((task) =>
        task.id === taskId ? { ...task, done: !task.done } : task
      )
    );
  }

  async function handleSendNote() {
    if (!noteText.trim()) return;
    
    try {
      const conversation = [{ role: "user", content: noteText.trim() }];
      const res = await fetch("/api/symptomChecker", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ conversation }),
      });
      
      if (!res.ok) {
        console.error("Failed to send note to GrokDoc");
      } else {
        setNoteSent(true);
        setNoteText("");
      }
    } catch (error) {
      console.error("Error sending note:", error);
    }
  }

  function handleNoteKeyDown(e) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendNote();
    }
  }

  // Progress calculation
  const totalTasks = planTasks.length;
  const doneTasks = planTasks.filter((t) => t.done).length;
  const completionRatio = totalTasks > 0 ? doneTasks / totalTasks : 0;

  return (
    <div className="home-container">
      <Header />
      <hr className="header-line" />

      <div style={{
        padding: "1rem 1.5rem 0.5rem 1.5rem",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
      }}>
        <h1 style={{
          fontFamily: "countach, sans-serif",
          fontSize: "1.8rem",
          margin: 0,
        }}>
          Your Personalized Plan
        </h1>
        <Link href="/symptom-checker" legacyBehavior>
          <a style={{
            display: "inline-flex",
            alignItems: "center",
            cursor: "pointer"
          }}>
            <img
              src="/Chat.png"
              alt="Chat"
              style={{ width: "40px", height: "40px" }}
            />
          </a>
        </Link>
      </div>

      <div style={{
        margin: "0 1.5rem",
        color: "#ccc",
        fontSize: "1rem",
        marginBottom: "2.5rem",
      }}>
        Here's your 7-day plan to help you manage symptoms. Check off tasks as
        you complete them. If something changes, update GrokDoc below.
      </div>

      <div style={{
        display: "flex",
        flexDirection: "column",
        flex: 1,
        justifyContent: "flex-start",
        alignItems: "center",
        gap: "2.5rem",
      }}>
        {loading && (
          <div style={{ padding: "1rem 0", fontSize: "1rem", color: "#fff" }}>
            Loading your plan...
          </div>
        )}

        {!loading && (
          <DayCards
            tasks={planTasks}
            onToggleTask={handleToggleTask}
            currentDay={0}
          />
        )}

        <div style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          width: "100%",
          maxWidth: "600px",
          padding: "0 1.5rem",
          marginTop: "-1rem",
        }}>
          <ProgressBar fraction={completionRatio} />
          <div style={{ marginTop: "0.5rem", color: "#999", fontSize: "0.9rem" }}>
            {doneTasks}/{totalTasks} tasks completed
          </div>
        </div>

        <div style={{
          position: "fixed",
          bottom: "2rem",
          left: "50%",
          transform: "translateX(-50%)",
          width: "100%",
          maxWidth: "500px",
          backgroundColor: "#1a1a1a",
          borderRadius: "6px",
          border: "1px solid #333",
          padding: "1rem",
          margin: "0 auto",
        }}>
          <h3 style={{
            fontFamily: "countach, sans-serif",
            fontSize: "1.2rem",
            margin: "0 0 0.5rem 0",
            color: "#ccc",
          }}>
            Got questions or updates?
          </h3>
          <div style={{ display: "flex", gap: "0.5rem", alignItems: "stretch" }}>
            <textarea
              ref={noteInputRef}
              rows={2}
              value={noteText}
              onChange={(e) => {
                setNoteText(e.target.value);
                setNoteSent(false);
              }}
              onKeyDown={handleNoteKeyDown}
              style={{
                flex: 1,
                backgroundColor: "#2a2a2a",
                color: "#fff",
                border: "1px solid #444",
                borderRadius: "4px",
                padding: "0.5rem",
                resize: "none",
                fontSize: "0.9rem",
                outline: "none",
              }}
            />
            <button
              onClick={handleSendNote}
              style={{
                backgroundColor: "#0d8157",
                color: "#fff",
                padding: "0.5rem 1rem",
                fontSize: "0.9rem",
                borderRadius: "4px",
                border: "none",
                cursor: "pointer",
                fontFamily: "Inter, sans-serif",
                whiteSpace: "nowrap",
              }}
            >
              Update
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}