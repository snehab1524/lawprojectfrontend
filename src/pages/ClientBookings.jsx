import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";

import { getCurrentUser } from "../api/authApi";
import { createBooking, getClientBookings } from "../api/bookingApi";
import { getAllLawyers } from "../api/lawyerApi";

/* ---------- STATUS STYLE ---------- */
const statusStyles = {
  accepted: "status-badge status-success",
  rejected: "status-badge status-danger",
  pending: "status-badge status-warning",
};

/* ---------- HELPERS ---------- */
const formatBookingDate = (value) => {
  if (!value) return "Not scheduled";

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return "Not scheduled";

  return parsed.toLocaleString(undefined, {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const toDateTimeInputValue = (value) => {
  if (!value) return "";

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return "";

  const offset = parsed.getTimezoneOffset();
  const local = new Date(parsed.getTime() - offset * 60000);
  return local.toISOString().slice(0, 16);
};

const createInitialFormState = (lawyerId = "") => ({
  lawyerId: lawyerId ? String(lawyerId) : "",
  date: "",
  caseDescription: "",
});

/* ---------- MAIN ---------- */
const ClientBookings = () => {
  const user = getCurrentUser();
  const [searchParams, setSearchParams] = useSearchParams();

  const [lawyers, setLawyers] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [submitMessage, setSubmitMessage] = useState("");

  const preselectedLawyerId = searchParams.get("lawyerId") || "";
  const [formData, setFormData] = useState(createInitialFormState(preselectedLawyerId));

  useEffect(() => {
    setFormData((current) =>
      current.lawyerId === preselectedLawyerId
        ? current
        : { ...current, lawyerId: preselectedLawyerId }
    );
  }, [preselectedLawyerId]);

  useEffect(() => {
    const fetchData = async () => {
      if (!user?.id) return setLoading(false);

      try {
        setLoading(true);

        const [lawyersData, bookingsData] = await Promise.all([
          getAllLawyers(),
          getClientBookings(user.id),
        ]);

        setLawyers(Array.isArray(lawyersData) ? lawyersData : []);
        setBookings(Array.isArray(bookingsData) ? bookingsData : []);
        setError("");
      } catch (err) {
        setError(
          err?.response?.data?.error ||
            err?.response?.data?.message ||
            "Failed to load booking workspace."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user?.id]);

  const selectedLawyer = useMemo(
    () =>
      lawyers.find(
        (l) => String(l.profileId || l.id) === String(formData.lawyerId)
      ),
    [formData.lawyerId, lawyers]
  );

  const minimumDateTime = useMemo(() => {
    const now = new Date();
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
    return now.toISOString().slice(0, 16);
  }, []);

  const handleFieldChange = (field, value) => {
    setFormData((c) => ({ ...c, [field]: value }));
    setSubmitMessage("");
  };

  const handleLawyerPick = (id) => {
    const val = String(id);
    handleFieldChange("lawyerId", val);
    setSearchParams(val ? { lawyerId: val } : {});
  };

  const refreshBookings = async () => {
    const data = await getClientBookings(user.id);
    setBookings(Array.isArray(data) ? data : []);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.lawyerId || !formData.date || !formData.caseDescription.trim()) {
      return setSubmitMessage("Please fill all fields.");
    }

    try {
      setSubmitting(true);

      await createBooking({
        lawyerId: Number(formData.lawyerId),
        date: new Date(formData.date).toISOString(),
        caseDescription: formData.caseDescription.trim(),
      });

      await refreshBookings();
      setSubmitMessage("Booking created successfully.");
      setFormData(createInitialFormState(formData.lawyerId));
    } catch (err) {
      setSubmitMessage("Failed to create booking.");
    } finally {
      setSubmitting(false);
    }
  };

  /* ---------- AUTH ---------- */
  if (!user) {
    return (
      <div className="app-shell flex items-center justify-center">
        <div className="surface-card p-8 text-center">
          <h1 className="mb-4 text-xl font-semibold text-primary">Login Required</h1>
          <Link to="/login" className="btn-primary">
            Go to Login
          </Link>
        </div>
      </div>
    );
  }

  /* ---------- UI ---------- */
  return (
    <div className="app-shell">
      <div className="app-container page-section">

        {/* HEADER */}
        <header className="surface-card-muted mb-8 flex flex-col gap-6 p-6 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs uppercase tracking-widest text-secondary">
              Client Bookings
            </p>
            <h1 className="mt-1 text-3xl font-semibold text-primary">
              Book a Lawyer
            </h1>
            <p className="mt-2 text-sm text-slate-700">
              Manage your consultations and booking requests.
            </p>
          </div>

          <div className="flex gap-4">
            <div className="metric-card px-4 py-3 text-center">
              <p className="text-xs text-slate-600">Lawyers</p>
              <p className="font-semibold text-primary">{lawyers.length}</p>
            </div>
            <div className="metric-card px-4 py-3 text-center">
              <p className="text-xs text-slate-600">Bookings</p>
              <p className="font-semibold text-primary">{bookings.length}</p>
            </div>
          </div>
        </header>

        {error && (
          <div className="surface-card mb-6 p-4 text-sm text-slate-700">
            {error}
          </div>
        )}

        {/* GRID */}
        <div className="grid gap-6 lg:grid-cols-2">

          {/* LEFT */}
          <div className="space-y-6">

            {/* LAWYERS */}
            <div className="surface-card p-5">
              <h2 className="mb-4 text-lg font-semibold text-primary">
                Choose Lawyer
              </h2>

              <div className="grid sm:grid-cols-2 gap-4">
                {lawyers.map((l) => {
                  const id = String(l.profileId || l.id);
                  const selected = id === formData.lawyerId;

                  return (
                    <button
                      key={id}
                      onClick={() => handleLawyerPick(id)}
                      className={`rounded-2xl border p-4 text-left transition ${
                        selected
                          ? "border-primary bg-primary text-white shadow-glow"
                          : "bg-white border-border hover:border-secondary"
                      }`}
                    >
                      <p className={`font-medium ${selected ? "text-white" : "text-primary"}`}>{l.name}</p>
                      <p className={`text-sm ${selected ? "text-slate-100" : "text-slate-700"}`}>
                        {l.specialization}
                      </p>
                      <p className={`mt-2 text-xs ${selected ? "text-slate-200" : "text-slate-600"}`}>
                        {l.experience} yrs experience
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* FORM */}
            <div className="surface-card p-5">
              <h2 className="mb-4 text-lg font-semibold text-primary">
                Booking Details
              </h2>

              <form onSubmit={handleSubmit} className="space-y-4">

                <select
                  value={formData.lawyerId}
                  onChange={(e) => handleLawyerPick(e.target.value)}
                  className="form-select"
                >
                  <option value="">Select Lawyer</option>
                  {lawyers.map((l) => (
                    <option key={l.profileId || l.id} value={l.profileId || l.id}>
                      {l.name} - {l.specialization}
                    </option>
                  ))}
                </select>

                <input
                  type="datetime-local"
                  min={minimumDateTime}
                  value={toDateTimeInputValue(formData.date)}
                  onChange={(e) => handleFieldChange("date", e.target.value)}
                  className="form-input"
                />

                <textarea
                  rows={5}
                  value={formData.caseDescription}
                  onChange={(e) =>
                    handleFieldChange("caseDescription", e.target.value)
                  }
                  className="form-textarea"
                  placeholder="Describe your legal issue..."
                />

                {submitMessage && (
                  <p className="text-sm text-slate-700">{submitMessage}</p>
                )}

                <button
                  type="submit"
                  disabled={submitting}
                  className="btn-primary w-full rounded-2xl"
                >
                  {submitting ? "Submitting..." : "Book Lawyer"}
                </button>
              </form>
            </div>

          </div>

          {/* RIGHT */}
          <div className="surface-card p-5">
            <h2 className="mb-4 text-lg font-semibold text-primary">
              Booking History
            </h2>

            <div className="space-y-3">
              {bookings.map((b) => {
                const tone =
                  statusStyles[(b.status || "pending").toLowerCase()] ||
                  statusStyles.pending;

                return (
                  <div key={b.id} className="surface-card-muted rounded-2xl p-4">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <p className="font-medium text-primary">
                        {b.caseDescription || "Consultation"}
                      </p>
                      <span className={tone}>
                        {b.status}
                      </span>
                    </div>

                    <p className="mt-1 text-sm text-slate-700">
                      {b.lawyerName} • {b.lawyerSpecialization}
                    </p>

                    <p className="mt-2 text-xs text-slate-600">
                      {formatBookingDate(b.date)}
                    </p>
                    {b.status === 'accepted' && b.caseId && (
                      <Link 
                        to={`/client-dashboard/cases/${b.caseId}`}
                        className="btn-secondary mt-3 flex w-full justify-center rounded-2xl text-sm"
                      >
                        View Case
                      </Link>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};


export default ClientBookings;
