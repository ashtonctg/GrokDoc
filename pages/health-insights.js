import { useState } from "react";
import Header from "../components/common/Header";

export default function HealthInsights() {
  const [healthData, setHealthData] = useState("");
  const [insights, setInsights] = useState("");
  const [loading, setLoading] = useState(false);

  const handleGetInsights = async (e) => {
    e.preventDefault();
    setLoading(true);
    setInsights("");

    try {
      // Placeholder call to an API route
      const res = await fetch("/api/healthInsights", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ healthData }),
      });
      const data = await res.json();
      setInsights(data.insights || "No insights generated.");
    } catch (error) {
      setInsights("Error fetching insights. Please try again.");
    }

    setLoading(false);
  };

  return (
    <div className="home-container">
      <Header />
      <hr className="header-line" />
      <main className="main-section" style={{ maxWidth: "600px", margin: "0 auto" }}>
        <h2 style={{ marginBottom: "1rem" }}>Health Insights</h2>
        <p style={{ marginBottom: "1rem" }}>
          Enter any recent health metrics or changes to receive a summary or early warning.
        </p>

        <form onSubmit={handleGetInsights} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          <label htmlFor="healthDataInput">
            Latest health updates:
          </label>
          <textarea
            id="healthDataInput"
            rows={5}
            value={healthData}
            onChange={(e) => setHealthData(e.target.value)}
            placeholder="E.g. My blood pressure is 120/80, I walked 8k steps daily, feeling slight fatigue..."
            style={{
              padding: "0.8rem",
              borderRadius: "4px",
              border: "1px solid #444",
              backgroundColor: "#2a2a2a",
              color: "#fff",
              fontFamily: "Inter, sans-serif",
              fontSize: "1rem",
            }}
          />

          <button
            type="submit"
            className="button"
            disabled={loading}
            style={{ alignSelf: "flex-start" }}
          >
            {loading ? "Analyzing..." : "Get Insights"}
          </button>
        </form>

        {insights && (
          <div
            style={{
              marginTop: "1rem",
              backgroundColor: "#222",
              padding: "1rem",
              borderRadius: "6px",
            }}
          >
            <strong>AI Insights:</strong>
            <p style={{ marginTop: "0.5rem" }}>{insights}</p>
          </div>
        )}
      </main>
    </div>
  );
}