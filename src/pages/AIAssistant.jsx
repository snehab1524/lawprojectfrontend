import { useState } from "react";

import Navbar from "../components/Navbar";
import { askLegalAI } from "../api/aiApi";

const AIAssistant = () => {
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!question.trim()) {
      setError("Please describe your legal question first.");
      return;
    }

    try {
      setLoading(true);
      setError("");
      const data = await askLegalAI(question.trim());
      setAnswer(data?.answer || "No response was returned.");
    } catch (err) {
      setError(err?.response?.data?.error || "Unable to reach the AI assistant right now.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      <section className="min-h-screen bg-zinc-50 px-6 py-24 text-zinc-900">
        <div className="mx-auto max-w-5xl">
          <div className="mb-10 text-center">
            <p className="text-xs uppercase tracking-[0.28em] text-zinc-400">AI Research</p>
            <h1 className="mt-3 text-4xl font-semibold tracking-tight text-zinc-950 sm:text-5xl">
              AI Assistant
            </h1>
            <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-zinc-600 sm:text-base">
              Ask a legal question and get a backend-powered AI summary with safe guidance to continue your research.
            </p>
          </div>

          <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
            <form
              onSubmit={handleSubmit}
              className="rounded-[2rem] border border-zinc-200 bg-white p-6 shadow-[0_20px_60px_rgba(15,23,42,0.06)]"
            >
              <label className="mb-3 block text-sm font-medium text-zinc-700" htmlFor="ai-question">
                Legal question
              </label>
              <textarea
                id="ai-question"
                value={question}
                onChange={(event) => setQuestion(event.target.value)}
                placeholder="Example: What documents should I collect before a property dispute consultation?"
                className="h-56 w-full rounded-3xl border border-zinc-200 bg-zinc-50 px-5 py-4 text-sm text-zinc-900 outline-none transition focus:border-zinc-400 focus:bg-white"
              />

              {error && (
                <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {error}
                </div>
              )}

              <div className="mt-5 flex flex-wrap items-center gap-3">
                <button
                  type="submit"
                  disabled={loading}
                  className="rounded-full bg-zinc-950 px-6 py-3 text-sm font-medium text-white transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:bg-zinc-400"
                >
                  {loading ? "Analyzing..." : "Ask AI"}
                </button>
              </div>
            </form>

            <div className="rounded-[2rem] border border-zinc-200 bg-white p-6 shadow-[0_20px_60px_rgba(15,23,42,0.06)]">
              <p className="text-xs uppercase tracking-[0.22em] text-zinc-400">Response</p>
              <div className="mt-4 min-h-[18rem] rounded-3xl bg-zinc-50 p-5 text-sm leading-7 text-zinc-700 whitespace-pre-wrap">
                {answer || "Your AI response will appear here once you submit a question."}
              </div>
              <p className="mt-4 text-xs leading-6 text-zinc-500">
                This assistant is for guidance and research support. Final legal advice should still come from a qualified lawyer.
              </p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default AIAssistant;
