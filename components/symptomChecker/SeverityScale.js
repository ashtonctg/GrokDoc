import { useState, useEffect } from "react";

const SEVERITY_COLORS = [
  "#0d8157",
  "#12916a",
  "#17a17d",
  "#d4b100",
  "#d49600",
  "#d47b00",
  "#d46100",
  "#cc3300",
  "#c20000",
  "#b30000"
];

function SeverityBox({ number, color, selected, onSelect }) {
  return (
    <div
      onClick={() => onSelect(number)}
      style={{
        width: "35px",
        height: "45px",
        backgroundColor: selected ? color : "#444",
        color: "#fff",
        fontFamily: "countach, sans-serif",
        fontSize: "1.4rem",
        fontWeight: "bold",
        borderRadius: "6px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        margin: "0.2rem",
        cursor: "pointer",
        transition: "background-color 0.3s, transform 0.2s",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "scale(1.05)";
        if (!selected) e.currentTarget.style.backgroundColor = color;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "scale(1)";
        if (!selected) e.currentTarget.style.backgroundColor = "#444";
      }}
    >
      {number}
    </div>
  );
}

export default function SeverityScale({ onSelectSeverity }) {
  const [selectedValue, setSelectedValue] = useState(null);
  const [shouldAnimate, setShouldAnimate] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setShouldAnimate(false), 700);
    return () => clearTimeout(timer);
  }, []);

  const handleSelect = (value) => {
    setSelectedValue(value);
    onSelectSeverity(value);
  };

  return (
    <div style={{
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      gap: "0.5rem",
      margin: "0.5rem 0",
    }}>
      <div style={{
        fontSize: "0.9rem",
        color: "#999",
        marginBottom: "0.25rem",
      }}>
        Click to select severity (1 = mild, 10 = severe)
      </div>
      <div className={shouldAnimate ? "wiggle-once" : ""} style={{
        display: "flex",
        gap: "0.2rem",
        justifyContent: "center",
      }}>
        {SEVERITY_COLORS.map((color, index) => (
          <SeverityBox
            key={index}
            number={index + 1}
            color={color}
            selected={selectedValue === index + 1}
            onSelect={handleSelect}
          />
        ))}
      </div>
    </div>
  );
} 