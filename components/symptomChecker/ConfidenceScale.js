import React from "react";

export default function ConfidenceScale({ confidence = 50 }) {
  const filled = Math.round((confidence / 100) * 10);

  return (
    <div style={{ display: "flex", gap: "0.3rem", alignItems: "center" }}>
      {[...Array(10)].map((_, i) => {
        const isFilled = i < filled;
        return (
          <div
            key={i}
            style={{
              width: "24px",
              height: "24px",
              borderRadius: "4px",
              backgroundColor: isFilled ? "#0d8157" : "#444",
              transition: "background-color 0.2s",
            }}
          />
        );
      })}
      <span
        style={{ fontSize: "0.9rem", color: "#ccc", marginLeft: "0.5rem" }}
      >
        {confidence}%
      </span>
    </div>
  );
}