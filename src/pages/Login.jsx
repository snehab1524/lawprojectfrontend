import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import { getRedirectPathByRole, login } from "../api/authApi.js";

const Login = () => {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const navigate = useNavigate();
  const location = useLocation();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const data = await login(formData);
      const user = data?.user;
      const fallbackPath = getRedirectPathByRole(user?.role);
      const fromPath = location.state?.from?.pathname;
      navigate(fromPath || fallbackPath, { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app-shell-dark">
      <Navbar />
      <section className="app-container flex min-h-screen items-center justify-center py-24">
        <div className="grid w-full max-w-5xl overflow-hidden rounded-[2rem] border border-white/10 bg-white shadow-panel lg:grid-cols-[1fr_0.95fr]">
          <div className="hidden bg-legal-hero p-10 text-white lg:flex lg:flex-col lg:justify-between">
            <div>
              <p className="page-eyebrow text-slate-200">Secure Access</p>
              <h1 className="mt-4 text-4xl font-semibold leading-tight">Continue your legal workflow with confidence.</h1>
              <p className="mt-5 max-w-md text-sm leading-7 text-slate-200">
                Access dashboards, client communication, bookings, and legal research from one polished workspace.
              </p>
            </div>
            <div className="surface-card-dark p-6">
              <p className="text-sm uppercase tracking-[0.2em] text-slate-300">Why teams choose this platform</p>
              <p className="mt-3 text-lg font-medium">Reliable case visibility, faster lawyer-client coordination, and a cleaner legal-tech experience.</p>
            </div>
          </div>

          <div className="p-6 sm:p-10">
            <h2 className="mb-2 text-center text-3xl font-bold text-primary">Login</h2>
            <p className="mb-6 text-center text-sm text-slate-600">Access your legal workspace securely.</p>

            {error ? (
              <div className="mb-4 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div>
            ) : null}

            <form onSubmit={handleSubmit} className="space-y-4">
              <input
                name="email"
                type="email"
                onChange={handleChange}
                value={formData.email}
                autoComplete="email"
                className="form-input"
                placeholder="Email"
                required
              />

              <input
                name="password"
                type="password"
                onChange={handleChange}
                value={formData.password}
                autoComplete="current-password"
                className="form-input"
                placeholder="Password"
                required
              />

              <button type="submit" disabled={loading} className="btn-primary w-full disabled:opacity-50">
                {loading ? "Logging in..." : "Login"}
              </button>
            </form>

            <p className="mt-6 text-center text-slate-600">
              Do not have an account? <Link to="/signup" className="font-semibold text-secondary hover:text-primary">Sign Up</Link>
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Login;
