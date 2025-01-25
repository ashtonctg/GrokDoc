import { useState } from "react";
import Header from "../components/common/Header";

export default function SymptomChecker() {
  const [symptoms, setSymptoms] = useState("");
  const [aiResponse, setAiResponse] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setAiResponse("");

    try {
      // Placeholder call to an API route
      const res = await fetch("/api/symptomChecker", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ symptoms }),
      });
      const data = await res.json();
      setAiResponse(data.advice || "No response from AI.");
    } catch (error) {
      setAiResponse("Error connecting to the AI. Please try again.");
    }

    setLoading(false);
  };

  return (
    <div className="home-container">
      <Header />
      <hr className="header-line" />
      <main className="main-section" style={{ maxWidth: "600px", margin: "0 auto" }}>
        <h2 style={{ marginBottom: "1rem" }}>Symptom Checker</h2>

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          <label htmlFor="symptomsInput">
            Describe your symptoms in detail:
          </label>
          <textarea
            id="symptomsInput"
            rows={5}
            value={symptoms}
            onChange={(e) => setSymptoms(e.target.value)}
            placeholder="E.g. I've had a sore throat for 3 days with some fever..."
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
            {loading ? "Analyzing..." : "Check Symptoms"}
          </button>
        </form>

        {aiResponse && (
          <div
            style={{
              marginTop: "1rem",
              backgroundColor: "#222",
              padding: "1rem",
              borderRadius: "6px",
            }}
          >
            <strong>AI Doctor Says:</strong>
            <p style={{ marginTop: "0.5rem" }}>{aiResponse}</p>
          </div>
        )}
      </main>
    </div>
  );
}