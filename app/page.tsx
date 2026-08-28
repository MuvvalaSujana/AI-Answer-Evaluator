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

  // Convert uploaded image file to previewable Base64
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

      const res = await fetch("/api/evaluate", {
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
    <main className="min-h-screen bg-slate-950 text-slate-100 p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6 tracking-tight text-white">
        AI Answer Evaluator
      </h1>

      {/* File Upload Section */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 mb-8 space-y-4">
        <h2 className="text-xl font-semibold text-slate-200">Upload Assessment Files</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1 text-slate-300">
              Question Paper (PDF/Images)
            </label>
            <input
              type="file"
              onChange={(e) => setQpFile(e.target.files?.[0] || null)}
              className="block w-full text-sm text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-500 cursor-pointer"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1 text-slate-300">
              Student Answer Sheet (PDF/Images)
            </label>
            <input
              type="file"
              onChange={handleAnsFileChange}
              className="block w-full text-sm text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-500 cursor-pointer"
            />
          </div>
        </div>

        <button
          onClick={handleProcess}
          disabled={loading}
          className="mt-4 w-full md:w-auto px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-medium rounded-lg transition disabled:opacity-50"
        >
          {loading ? "Processing Assessment..." : "Process Assessment"}
        </button>
      </div>

      {/* Results Display Section */}
      {data && (
        <div className="space-y-6">
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl">
            <h2 className="text-2xl font-bold text-white mb-2">
              Total Score: {data.totalScore} / {data.maxScore || 15}
            </h2>
            <p className="text-slate-400">Questions ({data.questions.length})</p>
          </div>

          <div className="space-y-4">
            {data.questions.map((q, idx) => (
              <div
                key={idx}
                className="bg-slate-900 border border-slate-800 p-6 rounded-xl space-y-3"
              >
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-lg text-white">
                    Q{q.questionNumber || idx + 1} ({q.maxMarks || 5} Marks)
                  </h3>
                  <span className="px-2.5 py-0.5 rounded text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    ✓ ANSWERED
                  </span>
                </div>

                <p className="text-slate-300">{q.questionText}</p>

                <div className="pt-2 border-t border-slate-800 flex flex-col sm:flex-row sm:items-center gap-2">
                  <span className="font-bold text-white min-w-[100px]">
                    Score: {q.score} / {q.maxMarks || 5}
                  </span>
                  <span className="text-slate-400 text-sm">{q.feedback}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Answer Sheet View & Highlighting */}
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl space-y-4 mt-8">
            <h2 className="text-xl font-bold text-white">Answer Sheet View</h2>
            
            {ansPreview ? (
              <div className="space-y-2">
                <span className="text-sm text-slate-400 block font-medium">Page 1</span>
                <img
                  src={ansPreview}
                  alt="Student Answer Sheet Page 1"
                  className="w-full max-w-2xl rounded-lg border border-slate-800 object-contain max-h-[600px]"
                />
              </div>
            ) : (
              <div className="p-6 border border-dashed border-slate-800 rounded-lg text-center text-slate-500">
                Uploaded document format is PDF or image preview unavailable.
              </div>
            )}
          </div>
        </div>
      )}
    </main>
  );
}