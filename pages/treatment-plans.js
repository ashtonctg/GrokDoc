// pages/treatment-plans.js
import { useState } from "react";
import Header from "../components/common/Header";

export default function TreatmentPlans() {
  const [goals, setGoals] = useState("");
  const [plan, setPlan] = useState("");
  const [loading, setLoading] = useState(false);

  const handleGeneratePlan = async (e) => {
    e.preventDefault();
    setLoading(true);
    setPlan("");

    try {
      const res = await fetch("/api/treatmentPlans", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userDetails: goals, symptoms: "N/A" }),
      });
      const data = await res.json();
      setPlan(data.treatmentPlan || "No treatment plan returned.");
    } catch (error) {
      console.error("Error generating plan:", error);
      setPlan("Error generating plan. Please try again.");
    }

    setLoading(false);
  };

  return (
    <div className="home-container">
      <Header />
      <hr className="header-line" />
      <main className="main-section" style={{ maxWidth: "600px", margin: "0 auto" }}>
        <h2 style={{ marginBottom: "1rem" }}>Personalized Treatment Plans</h2>
        <p style={{ marginBottom: "1rem" }}>
          Provide any relevant health background or goals to tailor your plan.
        </p>

        <form onSubmit={handleGeneratePlan} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          <label htmlFor="goalsInput">Your health background & goals:</label>
          <textarea
            id="goalsInput"
            rows={5}
            value={goals}
            onChange={(e) => setGoals(e.target.value)}
            placeholder="E.g. I'm trying to manage stress, lose weight, etc."
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
            className="button"
            disabled={loading}
            style={{ alignSelf: "flex-start" }}
          >
            {loading ? "Generating..." : "Get Plan"}
          </button>
        </form>

        {plan && (
          <div
            style={{
              marginTop: "1rem",
              backgroundColor: "#222",
              padding: "1rem",
              borderRadius: "6px",
            }}
          >
            <strong>Your AI-Recommended Plan:</strong>
            <p style={{ marginTop: "0.5rem" }}>{plan}</p>
          </div>
        )}
      </main>
    </div>
  );
}