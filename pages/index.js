// pages/index.js

import Header from "../components/common/Header";
import Link from "next/link";

export default function Home() {
  return (
    <div className="home-container">
      <Header />
      <hr className="header-line" />
      <main className="main-section">
        {/* Tagline only, no "Welcome to GrokDoc" heading */}
        <p style={{ fontSize: "1.25rem", maxWidth: "600px" }}>
          GrokDoc is your AI‐powered doctor, ready to analyze symptoms and provide personalized care.
        </p>

        {/* Card container */}
        <div className="card-container">
          {/* Symptom Checker Card */}
          <Link href="/symptom-checker" legacyBehavior>
            <a className="home-card">
              <h3>Symptom Checker</h3>
              <p>Get immediate insights into what might be affecting your health.</p>
            </a>
          </Link>

          {/* Treatment Plans Card */}
          <Link href="/treatment-plans" legacyBehavior>
            <a className="home-card">
              <h3>Personalized Treatment Plans</h3>
              <p>Tailored recommendations for your unique needs and goals.</p>
            </a>
          </Link>

          {/* Health Insights Card */}
          <Link href="/health-insights" legacyBehavior>
            <a className="home-card">
              <h3>Health Insights</h3>
              <p>Track trends, spot early warnings, and stay proactive about your wellbeing.</p>
            </a>
          </Link>
        </div>
      </main>
    </div>
  );
}