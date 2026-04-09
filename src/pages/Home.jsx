import { motion } from "framer-motion";
import { Link } from "react-router-dom";

import Footer from "../components/Footer";
import Navbar from "../components/Navbar";

const features = [
  {
    title: "Find Lawyers",
    description: "Browse verified lawyers based on specialization, ratings, and availability.",
  },
  {
    title: "AI Legal Assistant",
    description: "Get fast legal research support through the connected AI assistant workflow.",
  },
  {
    title: "Case Management",
    description: "Track consultations, bookings, documents, and legal updates in one place.",
  },
];

const Home = () => {
  return (
    <div className="app-shell-dark">
      <Navbar />

      <section className="app-container flex flex-col items-center justify-between gap-12 py-24 md:flex-row lg:py-28">
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="md:w-1/2"
        >
          <p className="page-eyebrow text-slate-200">Legal Workspace</p>
          <h1 className="mt-4 text-4xl font-bold leading-tight md:text-5xl lg:text-6xl">
            Legal intelligence with a refined, production-ready workspace.
          </h1>
          <p className="mt-6 max-w-xl text-base leading-7 text-slate-200/90">
            Connect with lawyers, request advice, and use AI-powered legal research in a single streamlined platform.
          </p>

          <div className="mt-8 flex max-w-xl flex-col gap-4 sm:flex-row">
            <Link to="/login?role=client" className="btn-primary w-full text-base">
              Login as Client
            </Link>

            <Link to="/login?role=lawyer" className="btn-secondary w-full text-base">
              Login as Lawyer
            </Link>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="md:w-1/2"
        >
          <img
            src="https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=800"
            alt="Legal workspace"
            className="w-full rounded-[2rem] border border-white/10 object-cover shadow-glow"
          />
        </motion.div>
      </section>

      <section className="app-container py-8">
        <div className="mb-10 text-center">
          <h2 className="text-3xl font-bold">Core Features</h2>
          <p className="mt-3 text-slate-200">A legal-tech interface with strong contrast, clean hierarchy, and modern surfaces.</p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {features.map((feature) => (
            <div key={feature.title} className="surface-card p-8 text-left">
              <h3 className="text-2xl font-semibold text-primary">{feature.title}</h3>
              <p className="mt-4 leading-7 text-slate-600">{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="app-container py-16 text-center">
        <h2 className="text-3xl font-bold">Ready to get legal help?</h2>
        <p className="mx-auto mt-3 max-w-2xl text-slate-200">
          Start with a lawyer search, send an advice request, or log in to continue your dashboard work.
        </p>
        <Link to="/signup" className="btn-primary mt-8 inline-flex">
          Get Started
        </Link>
      </section>

      <Footer />
    </div>
  );
};

export default Home;
