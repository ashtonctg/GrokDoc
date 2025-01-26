// pages/symptom-checker.js

import Header from "../components/common/Header";
import MultiTurnChat from "../components/symptomChecker/MultiTurnChat";

export default function SymptomChecker() {
  return (
    <div className="home-container">
      <Header />
      <hr className="header-line" />
      <main
        style={{
          width: "100%",
          margin: "2rem auto 0 auto", // 2rem top margin
          display: "flex",
          justifyContent: "center",
        }}
      >
        {/* The entire chat container is up to 1500px wide */}
        <div style={{ width: "1500px" }}>
          <MultiTurnChat />
        </div>
      </main>
    </div>
  );
}