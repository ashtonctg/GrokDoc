// components/plan/Calendar.jsx

import React from "react";

const DAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

/**
 * Minimal weekly view that can lay out horizontally or vertically
 * based on `layout` prop. If layout==="bottom", we do horizontal.
 */
export default function Calendar({ tasks = [], layout = "bottom" }) {
  // Build map dayOffset -> tasks
  const dayTaskMap = {};
  tasks.forEach(task => {
    const offset = task.dayOffset ?? 0; // default 0
    if (!dayTaskMap[offset]) dayTaskMap[offset] = [];
    dayTaskMap[offset].push(task);
  });
  
  const days = Array.from({ length: 7 }, (_, i) => i);
  
  // Decide if we do row or column
  const containerStyle = {
    display: "flex",
    flexDirection: layout === "right" ? "column" : "row",
    gap: "0.5rem",
  };

  return (
    <div style={containerStyle}>
      {days.map(dayIndex => {
        const dayTasks = dayTaskMap[dayIndex] || [];
        const hasTasks = dayTasks.length > 0;

        return (
          <div key={dayIndex} style={{
            width: layout === "right" ? "100%" : "40px",
            height: layout === "right" ? "40px" : "60px",
            backgroundColor: hasTasks ? "#0d8157" : "#444",
            borderRadius: "4px",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "0.8rem",
            color: "#fff",
            cursor: hasTasks ? "pointer" : "default",
          }}>
            <div style={{ fontWeight: "bold", marginBottom: "0.2rem" }}>
              {DAY_LABELS[dayIndex % 7]}
            </div>
            {hasTasks && (
              <div style={{ fontSize: "0.7rem" }}>
                {dayTasks.length} tasks
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}