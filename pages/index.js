import Header from "../components/common/Header";
import Link from "next/link";

export default function Home() {
  return (
    <div className="home-container">
      <Header />
      <hr className="header-line" />
      <main className="main-section">
        <p style={{ fontSize: "1.25rem", maxWidth: "600px" }}>
          GrokDoc is your AI‐powered doctor, ready to analyze symptoms and provide personalized care.
        </p>

        <div className="card-container" style={{ justifyContent: "center" }}>
          <Link href="/symptom-checker" legacyBehavior>
            <a className="home-card">
              <h3>Symptom Checker</h3>
              <p>Get immediate insights into what might be affecting your health.</p>
            </a>
          </Link>
        </div>
      </main>
    </div>
  );
}