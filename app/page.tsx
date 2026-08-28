"use client";

import { useState } from "react";

interface QuestionResult {
  questionNumber: number | string;
  maxMarks: number;
  questionText: string;
  score: number;
  feedback: string;
}

interface EvaluationData {
  totalScore: number;
  maxScore: number;
  questions: QuestionResult[];
}

export default function Home() {
  const [qpFile, setQpFile] = useState<File | null>(null);
  const [ansFile, setAnsFile] = useState<File | null>(null);
  const [ansPreview, setAnsPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<EvaluationData | null>(null);

  const handleAnsFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setAnsFile(file);
    if (file && file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onloadend = () => setAnsPreview(reader.result as string);
      reader.readAsDataURL(file);
    } else {
      setAnsPreview(null);
    }
  };

  const handleProcess = async () => {
    if (!qpFile || !ansFile) {
      alert("Please upload both Question Paper and Answer Sheet.");
      return;
    }

    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("questionPaper", qpFile);
      formData.append("answerSheet", ansFile);

      // Calls /api directly matching app/api/route.ts
      const res = await fetch("/api", {
        method: "POST",
        body: formData,
      });

      const result = await res.json();
      if (!res.ok) throw new Error(result.error || "Evaluation failed");

      setData(result);
    } catch (err: any) {
      alert(err.message || "Something went wrong during evaluation.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main style={{ minHeight: "100vh", backgroundColor: "#090d16", color: "#f1f5f9", padding: "2rem", fontFamily: "sans-serif" }}>
      <div style={{ maxWidth: "800px", margin: "0 auto" }}>
        <h1 style={{ fontSize: "2rem", fontWeight: "bold", marginBottom: "1.5rem" }}>
          AI Answer Evaluator
        </h1>

        {/* Upload Form */}
        <div style={{ backgroundColor: "#1e293b", padding: "1.5rem", borderRadius: "12px", marginBottom: "2rem", border: "1px solid #334155" }}>
          <h2 style={{ fontSize: "1.25rem", fontWeight: "600", marginBottom: "1rem" }}>Upload Assessment Files</h2>

          <div style={{ marginBottom: "1rem" }}>
            <label style={{ display: "block", fontSize: "0.875rem", marginBottom: "0.5rem", color: "#cbd5e1" }}>
              Question Paper (PDF/Images)
            </label>
            <input
              type="file"
              onChange={(e) => setQpFile(e.target.files?.[0] || null)}
              style={{ color: "#94a3b8" }}
            />
          </div>

          <div style={{ marginBottom: "1.5rem" }}>
            <label style={{ display: "block", fontSize: "0.875rem", marginBottom: "0.5rem", color: "#cbd5e1" }}>
              Student Answer Sheet (PDF/Images)
            </label>
            <input
              type="file"
              onChange={handleAnsFileChange}
              style={{ color: "#94a3b8" }}
            />
          </div>

          <button
            onClick={handleProcess}
            disabled={loading}
            style={{
              backgroundColor: "#2563eb",
              color: "#ffffff",
              padding: "0.75rem 1.5rem",
              borderRadius: "8px",
              border: "none",
              fontWeight: "600",
              cursor: loading ? "not-allowed" : "pointer",
              opacity: loading ? 0.6 : 1,
            }}
          >
            {loading ? "Processing Assessment..." : "Process Assessment"}
          </button>
        </div>

        {/* Results Section */}
        {data && (
          <div>
            <div style={{ backgroundColor: "#1e293b", padding: "1.5rem", borderRadius: "12px", marginBottom: "1.5rem", border: "1px solid #334155" }}>
              <h2 style={{ fontSize: "1.5rem", fontWeight: "bold", margin: 0 }}>
                Total Score: {data.totalScore} / {data.maxScore || 15}
              </h2>
              <p style={{ color: "#94a3b8", marginTop: "0.5rem", marginBottom: 0 }}>
                Questions ({data.questions ? data.questions.length : 0})
              </p>
            </div>

            {/* Questions List */}
            {data.questions && data.questions.map((q, idx) => (
              <div
                key={idx}
                style={{
                  backgroundColor: "#1e293b",
                  padding: "1.25rem",
                  borderRadius: "12px",
                  marginBottom: "1rem",
                  border: "1px solid #334155",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.75rem" }}>
                  <h3 style={{ fontSize: "1.1rem", fontWeight: "600", margin: 0 }}>
                    Q{q.questionNumber || idx + 1} ({q.maxMarks || 5} Marks)
                  </h3>
                  <span style={{ backgroundColor: "rgba(16, 185, 129, 0.15)", color: "#34d399", padding: "0.25rem 0.5rem", borderRadius: "4px", fontSize: "0.75rem", fontWeight: "bold" }}>
                    ✓ ANSWERED
                  </span>
                </div>

                <p style={{ color: "#e2e8f0", marginBottom: "1rem", lineHeight: "1.5" }}>{q.questionText}</p>

                <div style={{ paddingTop: "0.75rem", borderTop: "1px solid #334155" }}>
                  <p style={{ margin: "0 0 0.5rem 0", fontWeight: "bold", color: "#ffffff" }}>
                    Score: {q.score} / {q.maxMarks || 5}
                  </p>
                  <p style={{ margin: 0, color: "#94a3b8", fontSize: "0.9rem" }}>{q.feedback}</p>
                </div>
              </div>
            ))}

            {/* Image Preview Fix */}
            <div style={{ backgroundColor: "#1e293b", padding: "1.5rem", borderRadius: "12px", marginTop: "1.5rem", border: "1px solid #334155" }}>
              <h3 style={{ fontSize: "1.1rem", fontWeight: "bold", marginBottom: "1rem" }}>Answer Sheet View</h3>
              {ansPreview ? (
                <div>
                  <p style={{ color: "#94a3b8", fontSize: "0.85rem", marginBottom: "0.5rem" }}>Page 1</p>
                  <img
                    src={ansPreview}
                    alt="Student Answer Sheet Page 1"
                    style={{ maxWidth: "100%", height: "auto", borderRadius: "8px", border: "1px solid #334155" }}
                  />
                </div>
              ) : (
                <p style={{ color: "#64748b", margin: 0 }}>Answer sheet uploaded as document/PDF (image preview omitted).</p>
              )}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}