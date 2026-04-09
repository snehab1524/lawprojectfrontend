import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  BriefcaseBusiness,
  CalendarDays,
  Gavel,
  MessageSquareText,
  RefreshCw,
  Scale,
  UserRound,
} from "lucide-react";

import { getCurrentUser } from "../api/authApi";
import { getCases } from "../api/caseApi";
import { getLawyerBookings } from "../api/bookingApi";
import { getLawyerMeetings } from "../api/meetingApi";
import { getLawyerDashboardStats } from "../api/lawyerApi";

const statCards = [
  { key: "totalCases", label: "Total Cases", icon: BriefcaseBusiness },
  { key: "activeCases", label: "Active Cases", icon: Scale },
  { key: "closedCases", label: "Closed Cases", icon: Gavel },
  { key: "upcomingHearings", label: "Upcoming Hearings", icon: CalendarDays },
];

const statusClasses = {
  accepted: "bg-stone-100 text-zinc-900",
  active: "bg-stone-100 text-zinc-900",
  completed: "border border-zinc-300 bg-zinc-100 text-zinc-900",
  scheduled: "border border-zinc-300 bg-zinc-100 text-zinc-900",
  pending: "border border-zinc-300 bg-stone-200 text-zinc-900",
};

const formatStatus = (value) => {
  if (!value) return "Pending";
  return String(value).replace(/-/g, " ").replace(/\b\w/g, (match) => match.toUpperCase());
};

const formatDateTime = (value) => {
  if (!value) return "Date not available";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Date not available";
  return date.toLocaleString();
};

const cardShell = "rounded-[2rem] border border-stone-200 bg-stone-100 p-6 text-zinc-900 shadow-[0_18px_60px_rgba(0,0,0,0.12)]";

const LawyerDashboard = () => {
  const [user, setUser] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [stats, setStats] = useState(null);
  const [cases, setCases] = useState([]);
  const [meetings, setMeetings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const currentUser = getCurrentUser();
      if (!currentUser || currentUser.role !== "lawyer") {
        setLoading(false);
        return;
      }

      const [bookingsData, statsData, casesData, meetingsData] = await Promise.all([
        getLawyerBookings(currentUser.id),
        getLawyerDashboardStats(currentUser.id),
        getCases(),

        getLawyerMeetings(currentUser.id),
      ]);

      setBookings(Array.isArray(bookingsData) ? bookingsData : []);
      setStats(statsData || null);
      setCases(casesData?.items || casesData || []);
      setMeetings(Array.isArray(meetingsData) ? meetingsData : []);
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to load dashboard");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const currentUser = getCurrentUser();
    setUser(currentUser);
    if (currentUser?.role === "lawyer") {
      fetchData();
    } else {
      setLoading(false);
    }
  }, [fetchData]);

  const recentBookings = useMemo(() => bookings.slice(0, 3), [bookings]);
  const recentCases = useMemo(() => cases.slice(0, 3), [cases]);
  const recentMeetings = useMemo(() => meetings.slice(0, 3), [meetings]);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="skeleton h-44 w-full rounded-[2rem]" />
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="skeleton-card">
              <div className="skeleton h-5 w-28" />
              <div className="mt-5 skeleton h-10 w-16" />
            </div>
          ))}
        </div>
        <div className="grid gap-6 xl:grid-cols-2">
          <div className="skeleton h-72 w-full rounded-[2rem]" />
          <div className="skeleton h-72 w-full rounded-[2rem]" />
        </div>
      </div>
    );
  }

  if (!user || user.role !== "lawyer") {
    return (
      <div className="flex min-h-[60vh] items-center justify-center p-8 text-white">
        <div className="surface-card max-w-md p-8 text-center text-zinc-900">
          <h1 className="mb-4 text-4xl font-bold">Access Denied</h1>
          <p className="mb-6 text-zinc-600">Lawyer account required</p>
          <Link to="/login" className="btn-primary inline-flex">
            Login as Lawyer
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 text-white">
        <section className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
          <div className="surface-card-dark rounded-[2.5rem] p-7 text-white sm:p-8">
            <p className="text-xs uppercase tracking-[0.28em] text-slate-300">Lawyer Workspace</p>
            <div className="mt-4 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">Lawyer Dashboard</h1>
                <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-200 sm:text-base">
                  A calmer, more focused command center for your cases, meetings, bookings, and active client work.
                </p>
              </div>
              <div className="flex flex-wrap gap-3">
                <Link to="/lawyer-dashboard/chat" className="btn-primary">
                  Open Chat
                </Link>
                <Link to="/lawyer-dashboard/cases" className="btn-ghost border-white/20 bg-white text-primary hover:bg-white/90">
                  Manage Cases
                </Link>
              </div>
            </div>
          </div>

          <div className={`${cardShell} flex flex-col justify-between`}>
            <div>
              <p className="text-xs uppercase tracking-[0.24em] text-secondary">Profile</p>
              <div className="mt-5 flex items-center gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary text-white shadow-sm">
                  <UserRound size={24} />
                </div>
                <div>
                  <p className="text-xl font-semibold text-primary">{user.name || "Lawyer"}</p>
                  <p className="text-sm text-slate-500">{user.email || "Lawyer account"}</p>
                </div>
              </div>
            </div>
            <div className="mt-6 space-y-3 text-sm text-slate-600">
              <div className="flex items-center justify-between rounded-2xl bg-surface-alt px-4 py-3">
                <span>Role</span>
                <span className="font-medium text-primary">Lawyer</span>
              </div>
              <div className="flex items-center justify-between rounded-2xl bg-surface-alt px-4 py-3">
                <span>Quick Access</span>
                <Link to="/lawyer-dashboard/profile" className="font-medium text-secondary underline underline-offset-4">
                  View Profile
                </Link>
              </div>
            </div>
          </div>
        </section>

        {error && (
          <div className="surface-card rounded-[1.75rem] px-5 py-4 text-zinc-900">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-slate-600">{error}</p>
              <button onClick={fetchData} className="btn-primary px-4 py-2">
                <RefreshCw size={16} />
                Retry
              </button>
            </div>
          </div>
        )}

        {stats && (
          <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {statCards.map(({ key, label, icon: Icon }) => (
              <div key={key} className={cardShell}>
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-sm uppercase tracking-[0.18em] text-secondary">{label}</p>
                    <p className="mt-4 text-4xl font-semibold text-primary">{stats[key] ?? 0}</p>
                  </div>
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary text-white shadow-sm">
                    <Icon size={22} />
                  </div>
                </div>
              </div>
            ))}
          </section>
        )}

        <section className="grid gap-8 xl:grid-cols-2">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-semibold">Recent Meetings</h2>
              <Link to="/lawyer-dashboard/meetings" className="text-sm font-medium text-slate-200 underline underline-offset-4">View all</Link>
            </div>
            {recentMeetings.length > 0 ? recentMeetings.map((meeting) => (
              <article key={meeting.id} className={cardShell}>
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <h3 className="text-xl font-semibold text-primary">{meeting.title || meeting.client?.name || "Meeting"}</h3>
                    <p className="mt-2 text-sm text-slate-600">{formatDateTime(meeting.meetingDate)}</p>
                  </div>
                  <span className={`inline-flex w-fit rounded-full px-3 py-1 text-xs font-semibold ${statusClasses[meeting.status] || statusClasses.scheduled}`}>
                    {formatStatus(meeting.status || "scheduled")}
                  </span>
                </div>
              </article>
            )) : <div className={cardShell}><p className="text-slate-600">No recent meetings found.</p></div>}
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-semibold">Recent Cases</h2>
              <Link to="/lawyer-dashboard/cases" className="text-sm font-medium text-slate-200 underline underline-offset-4">View all</Link>
            </div>
            {recentCases.length > 0 ? recentCases.map((caseItem) => (
              <article key={caseItem.id} className={cardShell}>
                <h3 className="text-xl font-semibold text-primary">{caseItem.title || "Untitled Case"}</h3>
                <div className="mt-4 flex items-center justify-between gap-3">
                  <p className="text-sm text-slate-600">Status: {formatStatus(caseItem.status || "active")}</p>
                  <Link to="/lawyer-dashboard/cases" className="btn-primary px-4 py-2 text-sm">Open</Link>
                </div>
              </article>
            )) : <div className={cardShell}><p className="text-slate-600">No recent cases found.</p></div>}
          </div>
        </section>

        <section className="grid gap-8 lg:grid-cols-3">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-semibold">Recent Bookings</h2>
              <Link to="/lawyer-dashboard/bookings" className="text-sm font-medium text-slate-200 underline underline-offset-4">View all</Link>
            </div>
            {recentBookings.length > 0 ? recentBookings.map((booking) => (
              <article key={booking.id} className={cardShell}>
                <h3 className="text-lg font-semibold text-primary">{booking.caseDescription || "Consultation Booking"}</h3>
                <p className="mt-2 text-sm text-slate-600">Client: {booking.clientName || "Client"}</p>
                <span className={`mt-4 inline-flex rounded-full px-3 py-1 text-xs font-semibold ${statusClasses[booking.status] || statusClasses.pending}`}>
                  {formatStatus(booking.status)}
                </span>
              </article>
            )) : <div className={cardShell}><p className="text-slate-600">No recent bookings found.</p></div>}
          </div>

          <div className="space-y-4">
            <h2 className="text-2xl font-semibold">Quick Actions</h2>
            <div className={`${cardShell} flex h-full flex-col gap-4`}>
              <Link to="/lawyer-dashboard/chat" className="flex items-center justify-between rounded-[1.5rem] bg-primary px-5 py-4 text-white hover:bg-primary-dark">
                <span className="flex items-center gap-3 font-medium"><MessageSquareText size={18} /> Open Chat</span>
                <ArrowRight size={16} />
              </Link>
              <Link to="/lawyer-dashboard/advice" className="flex items-center justify-between rounded-[1.5rem] bg-secondary px-5 py-4 text-white hover:bg-secondary-dark">
                <span className="flex items-center gap-3 font-medium"><Scale size={18} /> Pending Advice</span>
                <ArrowRight size={16} />
              </Link>
              <Link to="/lawyer-dashboard/calendar" className="flex items-center justify-between rounded-[1.5rem] bg-primary px-5 py-4 text-white hover:bg-primary-dark">
                <span className="flex items-center gap-3 font-medium"><CalendarDays size={18} /> Calendar</span>
                <ArrowRight size={16} />
              </Link>
            </div>
          </div>

          <div className="space-y-4">
            <h2 className="text-2xl font-semibold">Performance Snapshot</h2>
            <div className={`${cardShell} h-full space-y-4`}>
              <div className="rounded-[1.5rem] bg-surface-alt px-4 py-4">
                <p className="text-sm uppercase tracking-[0.18em] text-secondary">Meetings</p>
                <p className="mt-2 text-2xl font-semibold text-primary">{meetings.length}</p>
              </div>
              <div className="rounded-[1.5rem] bg-surface-alt px-4 py-4">
                <p className="text-sm uppercase tracking-[0.18em] text-secondary">Bookings</p>
                <p className="mt-2 text-2xl font-semibold text-primary">{bookings.length}</p>
              </div>
              <div className="rounded-[1.5rem] bg-surface-alt px-4 py-4">
                <p className="text-sm uppercase tracking-[0.18em] text-secondary">Cases In View</p>
                <p className="mt-2 text-2xl font-semibold text-primary">{cases.length}</p>
              </div>
            </div>
          </div>
        </section>
    </div>
  );
};

export default LawyerDashboard;
