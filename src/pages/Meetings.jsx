import { useEffect, useState } from "react";

import { getCurrentUser } from "../api/authApi";
import { createMeeting, getClientMeetings, getLawyerMeetings } from "../api/meetingApi.js";
import { getLawyers } from "../api/lawyerApi";

const statusStyles = {
  scheduled: "status-badge status-info",
  completed: "status-badge status-success",
  cancelled: "status-badge status-danger",
};

const formatMeetingDate = (value) => {
  if (!value) {
    return "Not scheduled";
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return "Not scheduled";
  }

  return parsed.toLocaleString();
};

const Meetings = () => {
  const user = getCurrentUser();
  const [meetings, setMeetings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lawyers, setLawyers] = useState([]);
  const [formData, setFormData] = useState({
    lawyerId: "",
    meetingDate: "",
    meetingType: "online",
  });

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    fetchData();

    if (user.role === "client") {
      fetchLawyers();
    }
  }, [user?.id, user?.role]);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      if (user.role === "client") {
        const data = await getClientMeetings(user.id);
        setMeetings(Array.isArray(data) ? data : []);
      } else if (user.role === "lawyer") {
        const data = await getLawyerMeetings(user.id);
        setMeetings(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      setError(err.response?.data?.error || err.response?.data?.message || "Failed to load meetings");
    } finally {
      setLoading(false);
    }
  };

  const fetchLawyers = async () => {
    try {
      const data = await getLawyers();
      setLawyers(Array.isArray(data) ? data.filter((lawyer) => lawyer.profileId || lawyer.id) : []);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to load lawyers");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await createMeeting({
        lawyerId: Number(formData.lawyerId),
        meetingDate: formData.meetingDate,
        meetingType: formData.meetingType,
      });

      setFormData({ lawyerId: "", meetingDate: "", meetingType: "online" });
      setError(null);
      await fetchData();
    } catch (err) {
      setError(err.response?.data?.error || "Failed to create meeting");
    }
  };

  if (!user) {
    return <div className="app-shell px-6 py-24 text-center text-slate-700">Please login</div>;
  }

  if (loading) {
    return <div className="app-shell px-6 py-24 text-center text-slate-700">Loading meetings...</div>;
  }

  return (
    <div className="app-shell p-5 text-zinc-900 sm:p-8">
      <div className="app-container max-w-6xl">
        <div className="mb-8">
          <p className="page-eyebrow">Meetings</p>
          <h1 className="mt-3 text-4xl font-semibold tracking-tight text-primary">My Meetings</h1>
          <p className="mt-2 text-sm text-slate-500">Review scheduled consultations and manage upcoming sessions.</p>
        </div>

        {error && (
          <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-red-700">
            {error}
          </div>
        )}

        {user.role === "client" && (
          <form onSubmit={handleSubmit} className="surface-card mb-8 p-6 sm:p-8">
            <h2 className="mb-6 text-2xl font-semibold text-primary">Schedule New Meeting</h2>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
              <select
                value={formData.lawyerId}
                onChange={(e) => setFormData({ ...formData, lawyerId: e.target.value })}
                className="form-select"
                required
              >
                <option value="">Select Lawyer</option>
                {lawyers.map((lawyer) => (
                  <option key={lawyer.profileId || lawyer.id} value={lawyer.profileId || lawyer.id}>
                    {lawyer.name} - {lawyer.specialization}
                  </option>
                ))}
              </select>

              <input
                type="datetime-local"
                value={formData.meetingDate}
                onChange={(e) => setFormData({ ...formData, meetingDate: e.target.value })}
                className="form-input"
                required
              />

              <select
                value={formData.meetingType}
                onChange={(e) => setFormData({ ...formData, meetingType: e.target.value })}
                className="form-select"
              >
                <option value="online">Online</option>
                <option value="offline">Offline</option>
              </select>
            </div>

            <button
              type="submit"
              className="btn-primary mt-6 w-full rounded-2xl"
            >
              Schedule Meeting
            </button>
          </form>
        )}

        <div className="grid gap-6">
          {meetings.length === 0 ? (
            <div className="empty-state">
              <h3 className="mb-4 text-2xl font-semibold text-primary">No Meetings</h3>
              <p>{user.role === "client" ? "Schedule your first meeting!" : "No meetings scheduled."}</p>
            </div>
          ) : (
            meetings.map((meeting) => {
              const lawyerName = meeting.lawyer?.User?.name || "Lawyer";
              const clientName = meeting.client?.name || "Client";
              const currentStatus = (meeting.status || "scheduled").toLowerCase();
              const heading = meeting.title || `${clientName} - ${lawyerName}`;

              return (
                <div key={meeting.id} className="surface-card p-6 sm:p-8">
                  <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <h3 className="text-xl font-semibold text-primary">{heading}</h3>
                    <span className={statusStyles[currentStatus] || statusStyles.scheduled}>
                      {currentStatus.toUpperCase()}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 gap-4 text-slate-600 md:grid-cols-2">
                    <div>
                      <p><span className="font-semibold text-primary">Date:</span> {formatMeetingDate(meeting.meetingDate)}</p>
                      {meeting.endTime ? <p><span className="font-semibold text-primary">Ends:</span> {formatMeetingDate(meeting.endTime)}</p> : null}
                      <p><span className="font-semibold text-primary">Type:</span> {(meeting.meetingType || "online").toUpperCase()}</p>
                      {meeting.notes ? <p><span className="font-semibold text-primary">Notes:</span> {meeting.notes}</p> : null}
                    </div>
                    <div>
                      <p><span className="font-semibold text-primary">Lawyer:</span> {lawyerName}</p>
                      <p><span className="font-semibold text-primary">Client:</span> {meeting.client?.name || "Not assigned"}</p>
                      <p><span className="font-semibold text-primary">Specialization:</span> {meeting.lawyer?.specialization || "General"}</p>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

export default Meetings;
