import { useState } from "react";
import { Link } from "react-router-dom";

import Navbar from "../components/Navbar";
import { askAdvice } from "../api/adviceApi";
import { getCurrentUser } from "../api/authApi";

const GetAdvice = () => {
  const [question, setQuestion] = useState("");
  const [category, setCategory] = useState("");
  const [responseType, setResponseType] = useState("text");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const user = getCurrentUser();

  const submitQuestion = async (event) => {
    event.preventDefault();

    if (!user) {
      setError("Please log in first to submit an advice request.");
      return;
    }

    if (!question.trim() || !category.trim()) {
      setError("Please enter both a category and your legal question.");
      return;
    }

    setLoading(true);
    try {
      await askAdvice({ question: question.trim(), category: category.trim(), responseType });
      setSuccess("Your request has been sent to the backend advice queue.");
      setError("");
      setQuestion("");
      setCategory("");
    } catch (err) {
      setSuccess("");
      setError(err.response?.data?.error || err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-zinc-50 px-6 py-24 text-zinc-900">
        <div className="mx-auto grid max-w-5xl gap-6 lg:grid-cols-[0.95fr_1.05fr]">
          <div className="rounded-[2rem] border border-zinc-200 bg-white p-6 shadow-[0_20px_60px_rgba(15,23,42,0.06)]">
            <p className="text-xs uppercase tracking-[0.28em] text-zinc-400">Request Support</p>
            <h1 className="mt-3 text-4xl font-semibold tracking-tight text-zinc-950">
              Get Advice
            </h1>
            <p className="mt-4 text-sm leading-7 text-zinc-600">
              Send a legal question through the backend advice system and let a lawyer review it from their dashboard.
            </p>
            <div className="mt-8 space-y-4 text-sm text-zinc-600">
              <div className="rounded-3xl bg-zinc-50 px-4 py-4">
                Choose a category so the request reaches the right legal area faster.
              </div>
              <div className="rounded-3xl bg-zinc-50 px-4 py-4">
                Pick whether you prefer a text reply or a follow-up call.
              </div>
              <div className="rounded-3xl bg-zinc-50 px-4 py-4">
                Your request will appear in the lawyer advice workflow after submission.
              </div>
            </div>
          </div>

          <form
            onSubmit={submitQuestion}
            className="rounded-[2rem] border border-zinc-200 bg-white p-6 shadow-[0_20px_60px_rgba(15,23,42,0.06)]"
          >
            {!user && (
              <div className="mb-5 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
                Please <Link to="/login" className="font-medium underline underline-offset-4">log in</Link> to submit an advice request.
              </div>
            )}

            {success && (
              <div className="mb-5 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                {success}
              </div>
            )}

            {error && (
              <div className="mb-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            )}

            <label className="mb-2 block text-sm font-medium text-zinc-700" htmlFor="advice-category">
              Category
            </label>
            <input
              id="advice-category"
              placeholder="Property, Family, Criminal, Employment..."
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="mb-4 w-full rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm outline-none transition focus:border-zinc-400 focus:bg-white"
            />

            <label className="mb-2 block text-sm font-medium text-zinc-700" htmlFor="advice-response-type">
              Preferred response
            </label>
            <select
              id="advice-response-type"
              value={responseType}
              onChange={(e) => setResponseType(e.target.value)}
              className="mb-4 w-full rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm text-zinc-900 outline-none transition focus:border-zinc-400 focus:bg-white"
            >
              <option value="text">Text Response</option>
              <option value="call">Phone Call</option>
            </select>

            <label className="mb-2 block text-sm font-medium text-zinc-700" htmlFor="advice-question">
              Your question
            </label>
            <textarea
              id="advice-question"
              placeholder="Describe your legal issue clearly so the lawyer has enough context to help."
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              className="mb-5 h-40 w-full rounded-3xl border border-zinc-200 bg-zinc-50 px-4 py-4 text-sm outline-none transition focus:border-zinc-400 focus:bg-white"
            />

            <button
              type="submit"
              disabled={loading}
              className="rounded-full bg-zinc-950 px-6 py-3 text-sm font-medium text-white transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:bg-zinc-400"
            >
              {loading ? "Submitting..." : "Submit Request"}
            </button>
          </form>
        </div>
      </div>
    </>
  );
};

export default GetAdvice;
