import React from "react";

export default function DayCards({ tasks = [], onToggleTask, currentDay = 0 }) {

  const dayTasksMap = {};
  for (let i = 0; i < 7; i++) {
    dayTasksMap[i] = [];
  }
  tasks.forEach((task) => {
    const offset = task.dayOffset ?? 0;
    if (offset >= 0 && offset < 7) {
      dayTasksMap[offset].push(task);
    }
  });

  const dayLabels = ["Day 1", "Day 2", "Day 3", "Day 4", "Day 5", "Day 6", "Day 7"];

  const containerStyle = {
    display: "flex",
    flexDirection: "row",
    gap: "1rem",
    padding: "0 1rem 1rem 1rem",
    overflowX: "auto",
    width: "100%",
  };

  return (
    <div style={containerStyle}>
      {dayLabels.map((label, d) => (
        <DayCard
          key={d}
          label={label}
          tasks={dayTasksMap[d]}
          onToggleTask={onToggleTask}
          isToday={d === currentDay}
        />
      ))}
    </div>
  );
}

function DayCard({ label, tasks, onToggleTask, isToday }) {
  return (
    <div
      style={{
        minWidth: "220px",
        backgroundColor: isToday ? "#1a5abc" : "#222",
        borderRadius: "6px",
        padding: "1rem",
        display: "flex",
        flexDirection: "column",
        gap: "0.5rem",
      }}
    >
      <h3
        style={{
          fontFamily: "countach, sans-serif",
          margin: 0,
          fontSize: "1.2rem",
          color: isToday ? "#fff" : "#ccc",
        }}
      >
        {label}
      </h3>

      {tasks.length === 0 && (
        <div style={{ fontSize: "0.9rem", color: "#999" }}>No tasks today</div>
      )}

      {tasks.map((task) => {
        const taskStyle = {
          fontSize: "1rem",
          transition: "opacity 0.3s",
          opacity: task.done ? 0.4 : 1,
          color: task.done ? "#bbb" : "#fff",
          flex: 1,
        };
        return (
          <div
            key={task.id}
            style={{ 
              display: "flex", 
              gap: "0.5rem", 
              alignItems: "flex-start",
              minHeight: "28px",
            }}
          >
            <div style={{ 
              flexShrink: 0,
              width: "1.2rem",
              height: "1.2rem",
              marginTop: "0.2rem"
            }}>
              <input
                type="checkbox"
                checked={task.done}
                onChange={() => onToggleTask(task.id)}
                style={{
                  width: "100%",
                  height: "100%",
                  margin: 0,
                  cursor: "pointer",
                }}
              />
            </div>
            <span style={taskStyle}>{task.text}</span>
          </div>
        );
      })}
    </div>
  );
}