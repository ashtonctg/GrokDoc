// pages/PlanPage.js
import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Header from "../components/common/Header";
import DayCards from "../components/plan/DayCards";
import ProgressBar from "../components/plan/ProgressBar";

/**
 * We position the DayCards in the middle by using a "flex: 1" container,
 * and place the note box near the bottom. The user can click a chat icon
 * to go back to SymptomChecker.
 */
export default function PlanPage() {
  const [loading, setLoading] = useState(true);
  const [planTasks, setPlanTasks] = useState([]);
  const [userSymptoms, setUserSymptoms] = useState("Cough, mild fever");

  // Note feature
  const [noteText, setNoteText] = useState("");
  const [noteSent, setNoteSent] = useState(false);

  const noteInputRef = useRef(null);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const isDebug = urlParams.get("debug") === "1";
    if (isDebug) {
      console.log("DEBUG mode: using mock tasks");
      const mockTasks = generateMockTasks();
      setPlanTasks(mockTasks);
      setLoading(false);
    } else {
      fetchPlanFromServer();
    }
  }, []);

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
      // We'll add a third for every day just to test
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

  function handleToggleTask(taskId) {
    setPlanTasks((prev) =>
      prev.map((task) =>
        task.id === taskId ? { ...task, done: !task.done } : task
      )
    );
  }

  // Progress calculation
  const totalTasks = planTasks.length;
  const doneTasks = planTasks.filter((t) => t.done).length;
  const completionRatio = totalTasks > 0 ? doneTasks / totalTasks : 0;

  // Send note
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

  // Press ENTER to send note
  function handleNoteKeyDown(e) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendNote();
    }
  }

  return (
    <div className="home-container" style={{
      display: "flex",
      flexDirection: "column",
      minHeight: "100vh"
    }}>
      {/* Shared Header */}
      <Header />
      <hr className="header-line" />

      {/* Custom Top Bar with Title + Chat Icon */}
      <div
        style={{
          padding: "1rem 1.5rem 0.5rem 1.5rem",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <h1
          style={{
            fontFamily: "countach, sans-serif",
            fontSize: "1.8rem",
            margin: 0,
          }}
        >
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

      {/* Intro / Explanation */}
      <div
        style={{
          margin: "0 1.5rem",
          color: "#ccc",
          fontSize: "1rem",
          marginBottom: "2.5rem",
        }}
      >
        Here's your 7-day plan to help you manage symptoms. Check off tasks as
        you complete them. If something changes, update GrokDoc below.
      </div>

      {/* Main flex container: day cards, progress bar, then note box */}
      <div style={{
        display: "flex",
        flexDirection: "column",
        flex: 1,
        justifyContent: "flex-start",
        alignItems: "center",
        gap: "2.5rem",
      }}>
        {/* Loading state */}
        {loading && (
          <div style={{ padding: "1rem 0", fontSize: "1rem", color: "#fff" }}>
            Loading your plan...
          </div>
        )}

        {/* Day Cards */}
        {!loading && (
          <DayCards
            tasks={planTasks}
            onToggleTask={handleToggleTask}
            currentDay={0} // Day 1 is index 0
          />
        )}

        {/* Progress Bar - moved below cards */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            width: "100%",
            maxWidth: "600px",
            padding: "0 1.5rem",
            marginTop: "-1rem",  // Tighten spacing
          }}
        >
          <ProgressBar fraction={completionRatio} />
          <div style={{ marginTop: "0.5rem", color: "#999", fontSize: "0.9rem" }}>
            {doneTasks}/{totalTasks} tasks completed
          </div>
        </div>

        {/* Note box - visually anchored */}
        <div
          style={{
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
          }}
        >
          <h3
            style={{
              fontFamily: "countach, sans-serif",
              fontSize: "1.2rem",
              margin: "0 0 0.5rem 0",
              color: "#ccc",
            }}
          >
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