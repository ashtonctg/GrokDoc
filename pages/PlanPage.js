// pages/PlanPage.js

import { useState, useEffect } from "react";
import Link from "next/link";
import Calendar from "../components/plan/Calendar";

/**
 * A dynamic, immersive "Plan Page." The user can see tasks + 
 * a horizontally placed calendar at the bottom by default.
 * We also offer a toggle to shift the calendar to a vertical layout on the right.
 */

export default function PlanPage() {
  const [loading, setLoading] = useState(true);
  const [planTasks, setPlanTasks] = useState([]);
  
  // For demonstration, let's store whether the user wants horizontal or vertical layout
  const [calendarPosition, setCalendarPosition] = useState("bottom"); 
  // "bottom" (default) or "right"
  
  // Example symptoms for the AI plan
  const [userSymptoms, setUserSymptoms] = useState("Cough, mild fever");

  useEffect(() => {
    // For dev testing, we allow ?debug=1
    const urlParams = new URLSearchParams(window.location.search);
    const isDebug = urlParams.get("debug") === "1";
    
    if (isDebug) {
      console.log("DEBUG mode: using mock tasks");
      const mockTasks = [
        { id: 1, text: "Take antibiotic daily for 7 days", done: false, dayOffset: 0 },
        { id: 2, text: "Drink 8 glasses of water daily", done: false, dayOffset: 0 },
        { id: 3, text: "Check temperature each morning", done: false, dayOffset: 1 },
      ];
      setPlanTasks(mockTasks);
      setLoading(false);
    } else {
      fetchPlanFromServer();
    }
  }, []);

  const fetchPlanFromServer = async () => {
    setLoading(true);
    try {
      // Hypothetical: /api/generatePlan, pass userSymptoms
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
  };

  const handleToggleTask = (taskId) => {
    setPlanTasks(prev => prev.map(task =>
      task.id === taskId ? { ...task, done: !task.done } : task
    ));
  };

  // The user can toggle calendar position
  const handleToggleCalendarPos = () => {
    setCalendarPosition(pos => (pos === "bottom" ? "right" : "bottom"));
  };

  // A small helper to render the plan tasks
  const renderPlanTasks = () => {
    if (loading) {
      return <p>Loading your plan...</p>;
    }
    if (planTasks.length === 0) {
      return <p>No tasks found. O1 might not have suggestions.</p>;
    }
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
        {planTasks.map(task => (
          <div key={task.id} style={{
            display: "flex",
            alignItems: "center",
            backgroundColor: "#444",
            borderRadius: "4px",
            padding: "0.5rem",
            gap: "0.5rem"
          }}>
            <input
              type="checkbox"
              checked={task.done}
              onChange={() => handleToggleTask(task.id)}
              style={{
                width: "1.2rem",
                height: "1.2rem",
                cursor: "pointer",
              }}
            />
            <span style={{
              textDecoration: task.done ? "line-through" : "none",
              fontSize: "1rem",
            }}>
              {task.text}
            </span>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div style={{
      display: "flex",
      flexDirection: "column",
      minHeight: "100vh",
      backgroundColor: "#181818",
      color: "#fff",
      fontFamily: "Inter, sans-serif",
    }}>
      {/* Header area */}
      <div style={{
        padding: "1rem 1.5rem",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
      }}>
        <h1 style={{
          fontFamily: "countach, sans-serif",
          fontSize: "1.8rem",
          fontWeight: "bold",
          margin: 0,
        }}>
          Your Personalized Plan
        </h1>
        <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
          {/* Toggle button for calendar position */}
          <button
            onClick={handleToggleCalendarPos}
            style={{
              backgroundColor: "#444",
              color: "#fff",
              padding: "0.4rem 0.8rem",
              borderRadius: "4px",
              fontSize: "0.9rem",
              cursor: "pointer",
              border: "none",
            }}
          >
            {calendarPosition === "bottom" ? "Move Calendar Right" : "Move Calendar Bottom"}
          </button>
          <Link href="/symptom-checker" legacyBehavior>
            <a style={{ 
              color: "#0d8157", 
              textDecoration: "none", 
              fontSize: "1rem" 
            }}>
              Back to GrokDoc
            </a>
          </Link>
        </div>
      </div>
      
      {/* Body area */}
      <div style={{
        flex: 1,
        display: "flex",
        flexDirection: calendarPosition === "right" ? "row" : "column",
      }}>
        {/* The plan tasks area */}
        <div style={{
          flex: calendarPosition === "right" ? "1 1 0" : "0 0 auto",
          padding: "1rem",
          display: "flex",
          flexDirection: "column",
          gap: "1rem",
        }}>
          <h2 style={{
            fontFamily: "countach, sans-serif",
            fontSize: "1.4rem",
            margin: 0,
          }}>
            Action Items
          </h2>
          {renderPlanTasks()}
        </div>
        
        {/* The calendar container */}
        <div style={{
          backgroundColor: "#2a2a2a",
          borderRadius: "6px",
          padding: "1rem",
          display: "flex",
          flexDirection: "column",
          gap: "1rem",
          // If it's on the bottom, we give a specific height
          width: calendarPosition === "right" ? "300px" : "100%",
          height: calendarPosition === "right" ? "auto" : "200px",
          marginTop: calendarPosition === "bottom" ? "auto" : "0",
        }}>
          <h2 style={{
            fontFamily: "countach, sans-serif",
            fontSize: "1.4rem",
            margin: 0,
          }}>
            Weekly View
          </h2>
          <div style={{ flex: 1, display: "flex", justifyContent: "center", alignItems: "center" }}>
            <Calendar tasks={planTasks} layout={calendarPosition} />
          </div>
        </div>
      </div>
    </div>
  );
}