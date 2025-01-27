// components/plan/ProgressBar.jsx
import React from "react";

export default function ProgressBar({ fraction }) {
  const boxesToFill = Math.round(fraction * 10);

  return (
    <div style={{ display: "flex", gap: "0.3rem" }}>
      {[...Array(10)].map((_, index) => {
        const filled = index < boxesToFill;
        return (
          <div
            key={index}
            style={{
              width: "30px",
              height: "35px",
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