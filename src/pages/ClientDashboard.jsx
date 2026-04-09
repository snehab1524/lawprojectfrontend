import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { MessageSquare, CalendarDays, Scale, BookOpen, ShoppingBag } from "lucide-react";

import { getCurrentUser } from "../api/authApi";
import { getDashboardStats, getClientCases } from "../api/caseApi";
import { getClientMeetings } from "../api/meetingApi";
import { getClientBookings } from "../api/bookingApi";

const formatDate = (value) => {
  if (!value) return "Not scheduled";

  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime())
    ? "Not scheduled"
    : parsed.toLocaleDateString(undefined, {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
};

/* ---------- UI COMPONENTS ---------- */

const StatCard = ({ label, value, helper, icon: Icon }) => (
  <div className="metric-card hover:-translate-y-1 hover:shadow-panel">
    <div className="flex items-center gap-3 mb-2">
      <Icon className="h-5 w-5 text-primary" />
      <p className="text-xs uppercase tracking-wider text-secondary">{label}</p>
    </div>
    <p className="text-2xl font-semibold text-primary">{value ?? 0}</p>
    <p className="mt-1 text-sm text-slate-500">{helper}</p>
  </div>
);

const SectionCard = ({ title, eyebrow, children, action }) => (
  <section className="surface-card p-6">
    <div className="mb-5 flex justify-between items-center">
      <div>
        {eyebrow && (
          <p className="text-xs uppercase tracking-wider text-secondary">{eyebrow}</p>
        )}
        <h2 className="mt-1 text-xl font-semibold text-primary">{title}</h2>
      </div>
      {action}
    </div>
    {children}
  </section>
);

/* ---------- MAIN ---------- */

const ClientDashboard = () => {
  const [stats, setStats] = useState(null);
  const [cases, setCases] = useState([]);
  const [meetings, setMeetings] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const user = getCurrentUser();
  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        const [statsData, casesData, meetingsData, bookingsData] = await Promise.all([
          getDashboardStats(),
          getClientCases(user.id),
          getClientMeetings(user.id),
          getClientBookings(user.id),
        ]);

        setStats(statsData);
        setCases(casesData.items || casesData || []);
        setMeetings(Array.isArray(meetingsData) ? meetingsData : []);
        setBookings(Array.isArray(bookingsData) ? bookingsData : []);
        setError(null);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load dashboard");
      } finally {
        setLoading(false);
      }
    };

    if (user?.id && token) fetchData();
  }, [token, user?.id]);

  const activeBookings = bookings.filter(b =>
    ["pending", "accepted", "confirmed"].includes(b.status?.toLowerCase())
  ).length;

  if (loading) {
    return (
      <div className="app-container page-section">
        <div className="space-y-6">
          <div className="skeleton h-32 w-full rounded-[2rem]" />
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="skeleton-card">
                <div className="skeleton h-4 w-24" />
                <div className="mt-4 skeleton h-8 w-16" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!user || !token) {
    return (
      <div className="app-shell flex items-center justify-center">
        <div className="text-center">
          <h1 className="mb-4 text-3xl font-semibold text-primary">Legal Client Portal</h1>
          <p className="mb-6 text-slate-600">Sign in to access your dashboard</p>
          <Link to="/login" className="btn-primary">
            Enter Dashboard
          </Link>
        </div>
      </div>
    );
  }

  const upcomingMeetings = meetings.slice(0, 3);

  return (
    <div className="app-shell">
      <div className="app-container page-section">

        {/* HEADER */}
        <header className="surface-card-muted mb-10 p-6 sm:p-8">
          <p className="text-sm uppercase tracking-widest text-secondary">
            Welcome, {user.name}
          </p>
          <h1 className="mt-1 text-3xl font-semibold text-primary">
            Legal Dashboard
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-600">
            Review your current matters, stay on top of meetings, and jump into the next legal action quickly.
          </p>
        </header>

        {/* ERROR */}
        {error && (
          <div className="surface-card mb-8 p-4 text-center">
            <p className="mb-2 text-slate-700">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="btn-primary px-4 py-2"
            >
              Retry
            </button>
          </div>
        )}

        {/* STATS (Closed Case removed) */}
        <section className="grid gap-4 mb-10 md:grid-cols-2 lg:grid-cols-4">
          <StatCard label="Active Bookings" value={activeBookings} helper="Ongoing bookings" icon={ShoppingBag} />
          <StatCard label="Total Cases" value={stats?.totalCases ?? cases.length} helper="All cases" icon={Scale} />
          <StatCard label="Active Cases" value={stats?.activeCases ?? 0} helper="In progress" icon={Scale} />
          <StatCard label="Upcoming Hearings" value={stats?.upcomingHearings ?? 0} helper="Scheduled" icon={CalendarDays} />
        </section>

        {/* ACTIONS */}
        <SectionCard title="Quick Actions" eyebrow="Workflow">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

            <Link to="/client-dashboard/cases" className="surface-card-muted p-5 hover:-translate-y-1">
              <Scale className="mb-2 h-5 w-5 text-primary" />
              <h3 className="font-medium text-primary">Manage Cases</h3>
              <p className="text-sm text-slate-500">View and manage cases</p>
            </Link>

            <Link to="/client-dashboard/chat" className="surface-card-muted p-5 hover:-translate-y-1">
              <MessageSquare className="mb-2 h-5 w-5 text-primary" />
              <h3 className="font-medium text-primary">Chat with Lawyer</h3>
              <p className="text-sm text-slate-500">Start conversation</p>
            </Link>

            <Link to="/client-dashboard/meetings" className="surface-card-muted p-5 hover:-translate-y-1">
              <CalendarDays className="mb-2 h-5 w-5 text-primary" />
              <h3 className="font-medium text-primary">Meetings</h3>
              <p className="text-sm text-slate-500">Schedule sessions</p>
            </Link>

            <Link to="/articles" className="surface-card-muted p-5 hover:-translate-y-1">
              <BookOpen className="mb-2 h-5 w-5 text-primary" />
              <h3 className="font-medium text-primary">Legal Articles</h3>
              <p className="text-sm text-slate-500">Read updates</p>
            </Link>

          </div>
        </SectionCard>

        {/* ACTIVITY */}
        <div className="mt-8">
          <SectionCard title="Recent Activity" eyebrow="Bookings & Meetings">

            <div className="space-y-3">

              

              {upcomingMeetings.map((m) => (
                <div key={m.id} className="surface-card-muted flex justify-between p-4">
                  <div>
                    <p className="font-medium text-primary">{m.meetingType}</p>
                    <p className="text-sm text-slate-500">{formatDate(m.meetingDate)}</p>
                  </div>
                  <span className="status-badge status-info">
                    SCHEDULED
                  </span>
                </div>
              ))}

            </div>

          </SectionCard>
        </div>

      </div>
    </div>
  );
};

export default ClientDashboard;
