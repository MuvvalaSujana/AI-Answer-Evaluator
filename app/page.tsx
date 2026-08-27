"use client";

import React, { useState } from "react";
import { Upload, CheckCircle2, AlertCircle, Loader2, Award } from "lucide-react";

interface Region {
  pageIndex: number;
  box2d: [number, number, number, number];
}

interface Evaluation {
  questionId: string;
  status: "ANSWERED" | "UNANSWERED" | "UNMAPPED";
  studentAnswerText: string;
  awardedMarks: number;
  feedback: string;
  regions: Region[];
}

interface Question {
  id: string;
  qNumber: string;
  questionText: string;
  maxMarks: number;
}

interface ProcessedResult {
  questions: Question[];
  evaluations: Evaluation[];
}

export default function Home() {
  const [qpFiles, setQpFiles] = useState<File[]>([]);
  const [ansFiles, setAnsFiles] = useState<File[]>([]);
  const [ansPreviews, setAnsPreviews] = useState<string[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [data, setData] = useState<ProcessedResult | null>(null);
  const [activeQId, setActiveQId] = useState<string | null>(null);

  const handleAnsFileChange = (files: FileList | null) => {
    if (!files) return;
    const fileArray = Array.from(files);
    setAnsFiles(fileArray);
    setAnsPreviews(fileArray.map((file) => URL.createObjectURL(file)));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!qpFiles.length || !ansFiles.length) return;

    setIsProcessing(true);
    const formData = new FormData();
    qpFiles.forEach((f) => formData.append("questionPaper", f));
    ansFiles.forEach((f) => formData.append("answerSheet", f));

    try {
      const res = await fetch("/api/process", { method: "POST", body: formData });
      const json = await res.json();
      
      if (res.ok && json.questions && json.evaluations) {
        setData(json);
        if (json.questions.length > 0) {
          setActiveQId(json.questions[0].id);
        }
      } else {
        console.error("API Error Response:", json);
        alert(json.error || "Failed to process assessment. Check your API route logic.");
      }
    } catch (err) {
      console.error("AI Answer Evaluator Error:", err);
      alert("An error occurred while communicating with the server.");
    } finally {
      setIsProcessing(false);
    }
  };

  const questionsList = data?.questions || [];
  const evaluationsList = data?.evaluations || [];

  const activeEval = evaluationsList.find((e) => e.questionId === activeQId);
  const activeQuestion = questionsList.find((q) => q.id === activeQId);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      <header className="px-6 py-4 bg-slate-900 border-b border-slate-800 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <Award className="w-6 h-6 text-indigo-400" />
          <h1 className="text-xl font-bold bg-gradient-to-r from-indigo-400 to-violet-400 bg-clip-text text-transparent">
            AI Answer Evaluator
          </h1>
        </div>
        {data && (
          <div className="text-sm bg-indigo-950/80 border border-indigo-800 text-indigo-200 px-4 py-1.5 rounded-full font-medium">
            Total Score: {evaluationsList.reduce((acc, c) => acc + (c.awardedMarks || 0), 0)} /{" "}
            {questionsList.reduce((acc, c) => acc + (c.maxMarks || 0), 0)}
          </div>
        )}
      </header>

      {!data ? (
        <main className="flex-1 flex items-center justify-center p-6">
          <form onSubmit={handleSubmit} className="w-full max-w-xl bg-slate-900 border border-slate-800 p-8 rounded-2xl shadow-xl flex flex-col gap-6">
            <h2 className="text-xl font-semibold text-slate-200">Upload Assessment Files</h2>
            
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-2">Question Paper (PDF/Images)</label>
              <input
                type="file"
                multiple
                onChange={(e) => setQpFiles(Array.from(e.target.files || []))}
                className="w-full text-sm text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-slate-800 file:text-slate-200 hover:file:bg-slate-700 cursor-pointer border border-slate-800 rounded-lg bg-slate-950 p-2"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-400 mb-2">Student Answer Sheet (PDF/Images)</label>
              <input
                type="file"
                multiple
                onChange={(e) => handleAnsFileChange(e.target.files)}
                className="w-full text-sm text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-slate-800 file:text-slate-200 hover:file:bg-slate-700 cursor-pointer border border-slate-800 rounded-lg bg-slate-950 p-2"
              />
            </div>

            <button
              type="submit"
              disabled={isProcessing || !qpFiles.length || !ansFiles.length}
              className="mt-4 w-full py-3 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 font-semibold rounded-lg transition flex items-center justify-center gap-2 text-white shadow-lg shadow-indigo-600/20"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" /> Processing Assessment...
                </>
              ) : (
                <>
                  <Upload className="w-5 h-5" /> Analyze & Map Answers
                </>
              )}
            </button>
          </form>
        </main>
      ) : (
        <main className="flex-1 grid grid-cols-12 overflow-hidden h-[calc(100vh-65px)]">
          <div className="col-span-5 border-r border-slate-800 flex flex-col bg-slate-900/50">
            <div className="p-4 border-b border-slate-800 font-semibold text-slate-300">
              Questions ({questionsList.length})
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {questionsList.map((q) => {
                const evalItem = evaluationsList.find((e) => e.questionId === q.id);
                const isSelected = q.id === activeQId;

                return (
                  <div
                    key={q.id}
                    onClick={() => {
                      setActiveQId(q.id);
                      if (evalItem?.regions?.[0]) {
                        document
                          .getElementById(`ans-page-${evalItem.regions[0].pageIndex}`)
                          ?.scrollIntoView({ behavior: "smooth" });
                      }
                    }}
                    className={`p-4 rounded-xl border transition cursor-pointer flex flex-col gap-2 ${
                      isSelected
                        ? "bg-indigo-950/40 border-indigo-500 shadow-md"
                        : "bg-slate-900 border-slate-800 hover:border-slate-700"
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-indigo-400">Q{q.qNumber}</span>
                        <span className="text-xs text-slate-400 font-mono">({q.maxMarks} Marks)</span>
                      </div>
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full font-medium flex items-center gap-1 ${
                          evalItem?.status === "ANSWERED"
                            ? "bg-emerald-950 text-emerald-400 border border-emerald-800"
                            : "bg-amber-950 text-amber-400 border border-amber-800"
                        }`}
                      >
                        {evalItem?.status === "ANSWERED" ? <CheckCircle2 className="w-3 h-3" /> : <AlertCircle className="w-3 h-3" />}
                        {evalItem?.status || "UNANSWERED"}
                      </span>
                    </div>

                    <p className="text-sm text-slate-300 line-clamp-2">{q.questionText}</p>

                    {evalItem && (
                      <div className="mt-2 text-xs border-t border-slate-800/80 pt-2 flex justify-between items-center text-slate-400">
                        <span>Score: <b className="text-slate-200">{evalItem.awardedMarks}</b> / {q.maxMarks}</span>
                        <span className="text-slate-300 italic max-w-[200px] truncate">{evalItem.feedback}</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="col-span-7 bg-slate-950 flex flex-col">
            <div className="p-4 border-b border-slate-800 flex justify-between items-center bg-slate-900/50">
              <span className="font-semibold text-slate-300">Answer Sheet View</span>
              {activeQuestion && (
                <span className="text-xs bg-slate-800 text-slate-300 px-3 py-1 rounded-full">
                  Highlighting Q{activeQuestion.qNumber}
                </span>
              )}
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {ansPreviews.map((url, idx) => {
                const currentPage = idx + 1;
                const pageRegions = activeEval?.regions?.filter((r) => r.pageIndex === currentPage) || [];

                return (
                  <div
                    key={idx}
                    id={`ans-page-${currentPage}`}
                    className="relative border border-slate-800 rounded-lg overflow-hidden bg-white max-w-2xl mx-auto shadow-2xl"
                  >
                    <img src={url} alt={`Page ${currentPage}`} className="w-full h-auto block" />

                    {pageRegions.map((region, rIdx) => {
                      const [ymin, xmin, ymax, xmax] = region.box2d;
                      return (
                        <div
                          key={rIdx}
                          className="absolute border-4 border-indigo-500 bg-indigo-500/20 transition-all duration-300 pointer-events-none rounded animate-pulse"
                          style={{
                            top: `${ymin / 10}%`,
                            left: `${xmin / 10}%`,
                            height: `${(ymax - ymin) / 10}%`,
                            width: `${(xmax - xmin) / 10}%`,
                          }}
                        >
                          <span className="absolute -top-7 left-0 bg-indigo-600 text-white text-xs px-2 py-0.5 rounded shadow font-sans font-medium">
                            Answer Q{activeQuestion?.qNumber}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          </div>
        </main>
      )}
    </div>
  );
}