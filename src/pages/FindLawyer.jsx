import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import Navbar from "../components/Navbar";
import { getLawyers } from "../api/lawyerApi";

const FindLawyer = () => {
  const [lawyers, setLawyers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchLawyers = async () => {
      try {
        setLoading(true);
        const data = await getLawyers();
        setLawyers(Array.isArray(data) ? data : []);
        setError("");
      } catch (err) {
        setError(err?.response?.data?.error || "Unable to load lawyer profiles.");
      } finally {
        setLoading(false);
      }
    };

    fetchLawyers();
  }, []);

  if (loading) {
    return (
      <div className="app-shell pt-20">
        <div className="app-container page-section">
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 6 }).map((_, index) => (
              <div key={index} className="skeleton-card">
                <div className="skeleton h-6 w-1/2" />
                <div className="mt-3 skeleton h-4 w-2/3" />
                <div className="mt-6 space-y-3">
                  <div className="skeleton h-14 w-full" />
                  <div className="skeleton h-14 w-full" />
                  <div className="skeleton h-20 w-full" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <Navbar />
      <div className="app-shell pt-20">
        <div className="app-container page-section">
          <div className="mb-10 text-center">
            <p className="page-eyebrow">Legal Directory</p>
            <h1 className="mt-3 text-4xl font-semibold tracking-tight text-primary sm:text-5xl">
              Lawyers
            </h1>
            <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-slate-600 sm:text-base">
              Browse verified lawyer profiles from the backend directory and choose the right specialist for your matter.
            </p>
          </div>

          {error && (
            <div className="mb-8 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-red-700">
              {error}
            </div>
          )}

          {lawyers.length === 0 ? (
            <div className="empty-state">
              No lawyer profiles are available right now.
            </div>
          ) : (
            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {lawyers.map((lawyer) => (
                <article
                  key={lawyer.profileId || lawyer.id}
                  className="surface-card p-6 transition hover:-translate-y-1 hover:shadow-glow"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-xl font-semibold text-primary">{lawyer.name}</p>
                      <p className="mt-1 text-sm text-slate-500">{lawyer.email || "No email listed"}</p>
                    </div>
                    <div className="status-badge status-info normal-case tracking-normal">
                      {Number(lawyer.rating || 0).toFixed(1)}
                    </div>
                  </div>

                  <div className="mt-6 space-y-3">
                    <div>
                      <p className="text-xs uppercase tracking-[0.22em] text-secondary">Specialization</p>
                      <p className="mt-1 text-base text-primary">{lawyer.specialization}</p>
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-[0.22em] text-secondary">Experience</p>
                      <p className="mt-1 text-base text-primary">{lawyer.experience} years</p>
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-[0.22em] text-secondary">Profile</p>
                      <p className="mt-1 text-sm leading-6 text-slate-600">
                        {lawyer.bio || "Profile summary not available."}
                      </p>
                    </div>
                  </div>

                  <div className="mt-6">
                    <Link
                      to={`/client-dashboard/bookings?lawyerId=${lawyer.profileId || lawyer.id}`}
                      className="btn-primary inline-flex"
                    >
                      Book this lawyer
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default FindLawyer;

