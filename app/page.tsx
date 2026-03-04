"use client";

import Link from "next/link";
import { useState, useEffect } from "react";

const features = [
  {
    icon: "📄",
    title: "Upload Any Document",
    description:
      "Support for PDF, TXT, MD and HTML files. Our AI extracts and understands your content instantly.",
    color: "#7c3aed",
  },
  {
    icon: "🧠",
    title: "AI Question Generation",
    description:
      "Generate MCQ, short answer or true/false questions at easy, medium or hard difficulty levels.",
    color: "#ec4899",
  },
  {
    icon: "⚡",
    title: "Instant Grading",
    description:
      "Get instant feedback on MCQ answers and AI-powered grading for short answers with detailed explanations.",
    color: "#3b82f6",
  },
  {
    icon: "🎯",
    title: "Smart Retrieval",
    description:
      "RAG technology finds the most relevant parts of your document to generate accurate questions.",
    color: "#06b6d4",
  },
];

const steps = [
  {
    number: "01",
    title: "Upload",
    description: "Upload your study material — PDF, TXT, MD or HTML",
  },
  {
    number: "02",
    title: "Configure",
    description: "Choose question type, difficulty and how many questions",
  },
  {
    number: "03",
    title: "Generate",
    description: "AI reads your document and generates smart questions",
  },
  {
    number: "04",
    title: "Quiz",
    description: "Answer questions and get instant AI feedback",
  },
];

export default function HomePage() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "0 24px" }}>
      {/* Hero Section */}
      <section
        style={{
          textAlign: "center",
          padding: "80px 0 100px",
          opacity: mounted ? 1 : 0,
          transform: mounted ? "translateY(0)" : "translateY(30px)",
          transition: "all 0.8s ease",
        }}
      >
        {/* Badge */}
        <div style={{ marginBottom: "24px" }}>
          <span className="badge badge-purple" style={{ fontSize: "13px" }}>
            ✦ AI-Powered Quiz Generation from Your Documents
          </span>
        </div>

        {/* Headline */}
        <h1
          style={{
            fontFamily: "Space Grotesk, sans-serif",
            fontSize: "clamp(40px, 7vw, 80px)",
            fontWeight: 800,
            lineHeight: 1.1,
            marginBottom: "24px",
            letterSpacing: "-2px",
          }}
        >
          Study Smarter
          <br />
          <span className="gradient-text">with AI Questions</span>
        </h1>

        {/* Subtitle */}
        <p
          style={{
            fontSize: "18px",
            color: "#94a3b8",
            maxWidth: "560px",
            margin: "0 auto 48px",
            lineHeight: 1.7,
          }}
        >
          Upload any study material and let our RAG-powered AI generate
          personalized questions to test your knowledge instantly.
        </p>

        {/* CTA Buttons */}
        <div
          style={{
            display: "flex",
            gap: "16px",
            justifyContent: "center",
            flexWrap: "wrap",
          }}
        >
          <Link href="/upload" style={{ textDecoration: "none" }}>
            <button
              className="btn-primary pulse-glow"
              style={{ padding: "16px 36px", fontSize: "16px" }}
            >
              🚀 Start Studying Free
            </button>
          </Link>
          <Link href="/generate" style={{ textDecoration: "none" }}>
            <button
              className="btn-secondary"
              style={{ padding: "16px 36px", fontSize: "16px" }}
            >
              View Demo →
            </button>
          </Link>
        </div>

        {/* Stats */}
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            gap: "48px",
            marginTop: "64px",
            flexWrap: "wrap",
          }}
        >
          {[
            { value: "4", label: "File Formats Supported" },
            { value: "3", label: "Question Types" },
            { value: "3x", label: "Faster Learning" },
          ].map((stat) => (
            <div key={stat.label} style={{ textAlign: "center" }}>
              <div
                style={{
                  fontFamily: "Space Grotesk, sans-serif",
                  fontSize: "36px",
                  fontWeight: 700,
                  backgroundImage: "linear-gradient(135deg, #7c3aed, #ec4899)",
                  WebkitBackgroundClip: "text" as const,
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text" as const,
                  color: "transparent",
                }}
              >
                {stat.value}
              </div>
              <div
                style={{ color: "#94a3b8", fontSize: "14px", marginTop: "4px" }}
              >
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Features Section */}
      <section style={{ padding: "80px 0" }}>
        <div style={{ textAlign: "center", marginBottom: "56px" }}>
          <span className="badge badge-blue" style={{ marginBottom: "16px" }}>
            Features
          </span>
          <h2
            style={{
              fontFamily: "Space Grotesk, sans-serif",
              fontSize: "clamp(28px, 4vw, 44px)",
              fontWeight: 700,
              letterSpacing: "-1px",
            }}
          >
            Everything You Need to{" "}
            <span className="gradient-text">Ace Your Exams</span>
          </h2>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
            gap: "24px",
          }}
        >
          {features.map((feature, index) => (
            <div
              key={feature.title}
              className="glass"
              style={{
                padding: "32px",
                cursor: "default",
                opacity: mounted ? 1 : 0,
                transform: mounted ? "translateY(0)" : "translateY(20px)",
                transition: `all 0.5s ease ${index * 0.1}s`,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-8px)";
                e.currentTarget.style.boxShadow = `0 20px 60px ${feature.color}33`;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "none";
              }}
            >
              <div
                style={{
                  width: "56px",
                  height: "56px",
                  borderRadius: "14px",
                  background: `${feature.color}22`,
                  border: `1px solid ${feature.color}44`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "26px",
                  marginBottom: "20px",
                }}
              >
                {feature.icon}
              </div>
              <h3
                style={{
                  fontFamily: "Space Grotesk, sans-serif",
                  fontSize: "18px",
                  fontWeight: 600,
                  marginBottom: "12px",
                  color: "#f1f5f9",
                }}
              >
                {feature.title}
              </h3>
              <p
                style={{ color: "#94a3b8", lineHeight: 1.7, fontSize: "14px" }}
              >
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* How It Works */}
      <section style={{ padding: "80px 0" }}>
        <div style={{ textAlign: "center", marginBottom: "56px" }}>
          <span className="badge badge-pink" style={{ marginBottom: "16px" }}>
            How It Works
          </span>
          <h2
            style={{
              fontFamily: "Space Grotesk, sans-serif",
              fontSize: "clamp(28px, 4vw, 44px)",
              fontWeight: 700,
              letterSpacing: "-1px",
            }}
          >
            From Document to Quiz{" "}
            <span className="gradient-text-blue">in Seconds</span>
          </h2>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            gap: "24px",
          }}
        >
          {steps.map((step, index) => (
            <div
              key={step.number}
              style={{
                textAlign: "center",
                padding: "32px 24px",
                position: "relative",
              }}
            >
              {/* Connector line */}
              {index < steps.length - 1 && (
                <div
                  style={{
                    position: "absolute",
                    top: "52px",
                    right: "-12px",
                    width: "24px",
                    height: "2px",
                    background: "linear-gradient(90deg, #7c3aed, #ec4899)",
                    opacity: 0.4,
                  }}
                />
              )}

              <div
                style={{
                  width: "64px",
                  height: "64px",
                  borderRadius: "50%",
                  border: "1px solid #7c3aed44",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  margin: "0 auto 20px",
                  fontFamily: "Space Grotesk, sans-serif",
                  fontSize: "20px",
                  fontWeight: 700,
                  backgroundImage: "linear-gradient(135deg, #7c3aed, #ec4899)",
                  WebkitBackgroundClip: "text" as const,
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text" as const,
                  color: "transparent",
                }}
              >
                {step.number}
              </div>
              <h3
                style={{
                  fontFamily: "Space Grotesk, sans-serif",
                  fontSize: "18px",
                  fontWeight: 600,
                  marginBottom: "10px",
                  color: "#f1f5f9",
                }}
              >
                {step.title}
              </h3>
              <p
                style={{ color: "#94a3b8", fontSize: "14px", lineHeight: 1.6 }}
              >
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section
        style={{
          padding: "80px 0 120px",
          textAlign: "center",
        }}
      >
        <div
          className="glass"
          style={{
            padding: "64px 48px",
            background:
              "linear-gradient(135deg, rgba(124,58,237,0.1), rgba(236,72,153,0.1))",
            border: "1px solid rgba(124,58,237,0.3)",
          }}
        >
          <h2
            style={{
              fontFamily: "Space Grotesk, sans-serif",
              fontSize: "clamp(28px, 4vw, 44px)",
              fontWeight: 700,
              marginBottom: "16px",
              letterSpacing: "-1px",
            }}
          >
            Ready to Study Smarter?
          </h2>
          <p
            style={{
              color: "#94a3b8",
              fontSize: "16px",
              marginBottom: "40px",
              maxWidth: "480px",
              margin: "0 auto 40px",
            }}
          >
            Upload your first document and generate questions in under 60
            seconds.
          </p>
          <Link href="/upload" style={{ textDecoration: "none" }}>
            <button
              className="btn-primary"
              style={{ padding: "16px 48px", fontSize: "16px" }}
            >
              🚀 Get Started Now
            </button>
          </Link>
        </div>
      </section>
    </div>
  );
}
