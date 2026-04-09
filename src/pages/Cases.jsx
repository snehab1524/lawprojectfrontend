import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { getCurrentUser } from "../api/authApi";
import { createCase, getCases } from "../api/caseApi";
import { getLawyerBookings } from "../api/bookingApi";

const emptyForm = {
  title: "",
  description: "",
  caseType: "other",
  priority: "medium",
};

const statusOptions = ["", "open", "in-progress", "closed"];

const getHeading = (role) => {
  if (role === "admin") return "All Cases";
  if (role === "lawyer") return "Assigned Cases";
  return "My Cases";
};

const getRouteBase = (role) => {
  if (role === "lawyer") return "/lawyer-dashboard/cases";
  if (role === "client") return "/client-dashboard/cases";
  return "/admin";
};

export default function CasesPage() {
  const user = getCurrentUser();
  const routeBase = getRouteBase(user?.role);
  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [formData, setFormData] = useState(emptyForm);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    fetchCases();
  }, []);

  const fetchCases = async () => {
    try {
      setLoading(true);
      setError("");
      const { items } = await getCases();
      const baseCases = Array.isArray(items) ? items : [];

      if (user?.role === "lawyer" && user?.id) {
        const lawyerBookings = await getLawyerBookings(user.id);
        const acceptedBookingCases = lawyerBookings
          .filter((booking) => booking.status === "accepted" && booking.caseId)
          .map((booking) => ({
            id: booking.caseId,
            bookingId: booking.id,
            title: booking.case?.title || `Case from Booking #${booking.id}`,
            description: booking.case?.description || booking.caseDescription || "Legal consultation booking",
            status: booking.case?.status || "open",
            priority: booking.case?.priority || "medium",
            caseType: booking.case?.caseType || "other",
            createdAt: booking.case?.updatedAt || booking.createdAt,
            client: booking.client || { name: booking.clientName || "Client" },
            lawyer: booking.lawyer || null,
          }));

        const mergedCases = [...baseCases];
        const existingIds = new Set(baseCases.map((caseItem) => caseItem.id));

        acceptedBookingCases.forEach((caseItem) => {
          if (!existingIds.has(caseItem.id)) {
            mergedCases.push(caseItem);
          }
        });

        setCases(mergedCases);
      } else {
        setCases(baseCases);
      }
    } catch (err) {
      console.error("Failed to fetch cases:", err);
      if (err?.response?.status === 401) {
        setError("Your session has expired. Please log in again.");
      } else {
        setError(err?.response?.data?.error || "Failed to load cases.");
      }
    } finally {
      setLoading(false);
    }
  };

  const filteredCases = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();

    return cases.filter((caseItem) => {
      const matchesSearch =
        !query ||
        caseItem.title?.toLowerCase().includes(query) ||
        caseItem.description?.toLowerCase().includes(query) ||
        caseItem.caseType?.toLowerCase().includes(query) ||
        caseItem.client?.name?.toLowerCase().includes(query) ||
        caseItem.lawyer?.User?.name?.toLowerCase().includes(query);

      const matchesStatus = !statusFilter || caseItem.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [cases, searchTerm, statusFilter]);

  const handleCreateCase = async (event) => {
    event.preventDefault();

    try {
      await createCase(formData);
      setShowCreateModal(false);
      setFormData(emptyForm);
      await fetchCases();
    } catch (err) {
      alert(err?.response?.data?.error || err.message || "Failed to create case.");
    }
  };

  if (loading) {
    return <div className="app-shell p-8 text-center text-slate-700">Loading cases...</div>;
  }

  return (
    <div className="app-shell p-8">
      <div className="app-container max-w-6xl">
        <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="page-eyebrow">Case Workspace</p>
            <h1 className="mt-2 text-4xl font-bold text-primary">{getHeading(user?.role)}</h1>
            <p className="mt-3 text-slate-500">
              {filteredCases.length} of {cases.length} cases visible
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <input
              type="text"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Search title, description, client, lawyer..."
              className="form-input min-w-[16rem]"
            />
            <select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
              className="form-select min-w-[11rem]"
            >
              {statusOptions.map((status) => (
                <option key={status || "all"} value={status}>
                  {status ? status.replace("-", " ").toUpperCase() : "All statuses"}
                </option>
              ))}
            </select>
            {user?.role === "client" && (
              <button onClick={() => setShowCreateModal(true)} className="btn-primary self-start sm:self-auto">
                + New Case
              </button>
            )}
          </div>
        </div>

        {error && (
          <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-red-700">
            {error}
          </div>
        )}

        {filteredCases.length > 0 ? (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredCases.map((caseItem) => (
              <Link key={caseItem.id} to={`${routeBase}/${caseItem.id}`} className="group">
                <div className="surface-card h-full p-8 transition-all duration-300 hover:-translate-y-1 hover:shadow-glow">
                  <div className="mb-4 flex items-start justify-between gap-4">
                    <h3 className="text-xl font-bold text-primary transition-colors group-hover:text-secondary">
                      {caseItem.title || "Untitled Case"}
                    </h3>
                    <span
                      className={`status-badge ${
                        caseItem.status === "open"
                          ? "status-info"
                          : caseItem.status === "in-progress"
                            ? "status-warning"
                            : "status-success"
                      }`}
                    >
                      {(caseItem.status || "open").replace("-", " ").toUpperCase()}
                    </span>
                  </div>

                  <p className="mb-4 line-clamp-3 text-slate-500">{caseItem.description || "No description provided."}</p>

                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <span className="text-slate-500">Type:</span>
                      <span className="font-medium capitalize text-primary">{caseItem.caseType || "other"}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-slate-500">Priority:</span>
                      <span
                        className={`status-badge capitalize tracking-normal ${
                          caseItem.priority === "high"
                            ? "status-danger"
                            : caseItem.priority === "medium"
                              ? "status-warning"
                              : "status-success"
                        }`}
                      >
                        {caseItem.priority || "medium"}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-slate-500">Created:</span>
                      <span className="font-medium text-primary">
                        {caseItem.createdAt ? new Date(caseItem.createdAt).toLocaleDateString() : "N/A"}
                      </span>
                    </div>
                    {caseItem.bookingId && (
                      <div className="flex items-center gap-2">
                        <span className="text-slate-500">Booking:</span>
                        <span className="font-medium text-primary">#{caseItem.bookingId}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2">
                      <span className="text-slate-500">Case ID:</span>
                      <span className="font-medium text-primary">#{caseItem.id}</span>
                    </div>
                  </div>

                  <div className="mt-6 rounded-2xl bg-slate-50 p-4 text-sm text-slate-600">
                    <p className="font-medium text-primary">Client: {caseItem.client?.name || "N/A"}</p>
                    <p className="mt-2">Lawyer: {caseItem.lawyer?.User?.name || "Unassigned"}</p>
                    {caseItem.bookingId && (
                      <p className="mt-2">This case was created from booking #{caseItem.bookingId}.</p>
                    )}
                    <p className="mt-3 font-medium text-secondary">Click this card to open and update the case</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="empty-state py-20">
            <div className="mb-4 text-6xl opacity-20">Case</div>
            <h2 className="mb-2 text-2xl font-bold text-primary">No cases found</h2>
            <p className="mb-8 text-slate-500">
              {cases.length === 0 ? "No case has been created yet." : "Try a different search or status filter."}
            </p>
            {user?.role === "client" && cases.length === 0 && (
              <button onClick={() => setShowCreateModal(true)} className="btn-primary text-lg">
                Create First Case
              </button>
            )}
          </div>
        )}

        {showCreateModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
            <div className="surface-card max-h-[90vh] w-full max-w-md overflow-y-auto p-8">
              <div className="mb-6 flex items-center justify-between">
                <h2 className="text-2xl font-bold text-primary">New Case</h2>
                <button onClick={() => setShowCreateModal(false)} className="text-2xl text-slate-400 hover:text-primary">
                  &times;
                </button>
              </div>
              <form onSubmit={handleCreateCase} className="space-y-4">
                <div>
                  <label className="mb-2 block font-medium text-primary">Title</label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(event) => setFormData({ ...formData, title: event.target.value })}
                    className="form-input"
                    placeholder="Case title"
                    required
                  />
                </div>
                <div>
                  <label className="mb-2 block font-medium text-primary">Description</label>
                  <textarea
                    value={formData.description}
                    onChange={(event) => setFormData({ ...formData, description: event.target.value })}
                    rows="3"
                    className="form-textarea"
                    placeholder="Case details"
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="mb-2 block font-medium text-primary">Case Type</label>
                    <select
                      value={formData.caseType}
                      onChange={(event) => setFormData({ ...formData, caseType: event.target.value })}
                      className="form-select"
                    >
                      <option value="criminal">Criminal</option>
                      <option value="family">Family</option>
                      <option value="corporate">Corporate</option>
                      <option value="property">Property</option>
                      <option value="contract">Contract</option>
                      <option value="estate">Estate</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="mb-2 block font-medium text-primary">Priority</label>
                    <select
                      value={formData.priority}
                      onChange={(event) => setFormData({ ...formData, priority: event.target.value })}
                      className="form-select"
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                    </select>
                  </div>
                </div>
                <button type="submit" className="btn-primary w-full rounded-2xl">
                  Create Case
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
