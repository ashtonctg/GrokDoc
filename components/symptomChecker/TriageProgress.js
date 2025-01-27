import React from "react";

export default function TriageProgress({ completedFields }) {
  const totalFields = 4;
  const boxWidth = 30;

  return (
    <div style={{ 
      display: "flex", 
      gap: "0.3rem",
      justifyContent: "center",
      margin: "0.2rem 0",
      opacity: 0.8
    }}>
      {[...Array(totalFields)].map((_, index) => {
        const filled = index < completedFields;
        return (
          <div
            key={index}
            style={{
              width: `${boxWidth}px`,
              height: "24px",
              borderRadius: "4px",
              backgroundColor: filled ? "#2377E8" : "#444",
              transition: "background-color 0.3s ease",
            }}
          />
        );
      })}
    </div>
  );
} 