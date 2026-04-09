import { useState } from "react";
import { register } from "../api/authApi.js";
import { useNavigate, Link } from "react-router-dom";
import Navbar from "../components/Navbar";

const Signup = () => {
  const [formData, setFormData] = useState({ name: "", email: "", password: "", role: "client" });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await register(formData);
      alert("Signup successful!");
      navigate("/login");
    } catch (err) {
      alert("Signup failed: " + (err.response?.data || err.message));
    }
    setLoading(false);
  };

  return (
    <div className="app-shell-dark">
      <Navbar />
      <section className="app-container flex min-h-screen items-center justify-center py-24">
        <div className="grid w-full max-w-5xl overflow-hidden rounded-[2rem] border border-white/10 bg-white shadow-panel lg:grid-cols-[0.95fr_1fr]">
          <div className="p-6 sm:p-10">
            <h2 className="mb-2 text-center text-3xl font-bold text-primary">Create Account</h2>
            <p className="mb-6 text-center text-sm text-slate-600">Choose your role and set up your legal-tech workspace.</p>
            <form onSubmit={handleSubmit} className="space-y-4">
              <input name="name" onChange={handleChange} value={formData.name} className="form-input" placeholder="Full Name" required />
              <input name="email" type="email" onChange={handleChange} value={formData.email} className="form-input" placeholder="Email" required />
              <input name="password" type="password" onChange={handleChange} value={formData.password} className="form-input" placeholder="Password" required />
              <select name="role" onChange={handleChange} value={formData.role} className="form-select">
                <option value="client">Client</option>
                <option value="lawyer">Lawyer</option>
              </select>
              <button type="submit" disabled={loading} className="btn-primary w-full disabled:opacity-50">
                {loading ? "Signing up..." : "Sign Up"}
              </button>
            </form>
            <p className="mt-6 text-center text-slate-600">
              Already have an account? <Link to="/login" className="font-semibold text-secondary hover:text-primary">Login</Link>
            </p>
          </div>

          <div className="hidden bg-legal-hero p-10 text-white lg:flex lg:flex-col lg:justify-between">
            <div>
              <p className="page-eyebrow text-slate-200">Professional Theme</p>
              <h1 className="mt-4 text-4xl font-semibold leading-tight">One responsive workspace for clients and legal professionals.</h1>
              <p className="mt-5 max-w-md text-sm leading-7 text-slate-200">
                Keep bookings, chat, cases, and research in sync while preserving the existing application flows.
              </p>
            </div>
            <div className="grid gap-4">
              <div className="surface-card-dark p-5">
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-300">Clients</p>
                <p className="mt-2 text-lg">Find lawyers, manage meetings, and follow active matters.</p>
              </div>
              <div className="surface-card-dark p-5">
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-300">Lawyers</p>
                <p className="mt-2 text-lg">Coordinate cases, bookings, tasks, and communication from one dashboard.</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Signup;
