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
          margin: "2rem auto 0 auto",
          display: "flex",
          justifyContent: "center",
        }}
      >
        <div style={{ width: "1500px" }}>
          <MultiTurnChat />
        </div>
      </main>
    </div>
  );
}