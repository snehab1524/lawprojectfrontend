import { useEffect, useMemo, useState } from 'react';
import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import format from 'date-fns/format';
import parse from 'date-fns/parse';
import startOfWeek from 'date-fns/startOfWeek';
import getDay from 'date-fns/getDay';
import { enUS } from 'date-fns/locale';
import { getUpcomingHearings } from '../api/hearingApi';
import { getCurrentUser } from '../api/authApi';
import { createMeeting, getLawyerMeetings } from '../api/meetingApi';
import { getMyLawyerProfile } from '../api/lawyerProfileApi';
import 'react-big-calendar/lib/css/react-big-calendar.css';

const locales = {
  'en-US': enUS,
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

const initialFormState = {
  title: '',
  meetingDate: '',
  endTime: '',
  meetingType: 'online',
  notes: '',
};

const toDateTimeLocalValue = (date) => {
  if (!(date instanceof Date) || Number.isNaN(date.getTime())) {
    return '';
  }

  const offset = date.getTimezoneOffset();
  const localDate = new Date(date.getTime() - offset * 60 * 1000);
  return localDate.toISOString().slice(0, 16);
};

const getDefaultEndTime = (startDate) => new Date(startDate.getTime() + 60 * 60 * 1000);

const LawyerCalendar = () => {
  const user = getCurrentUser();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [lawyerProfile, setLawyerProfile] = useState(null);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [formData, setFormData] = useState(initialFormState);

  useEffect(() => {
    if (!user || user.role !== 'lawyer') {
      setLoading(false);
      return;
    }

    loadCalendarData();
  }, [user?.id, user?.role]);

  const loadCalendarData = async () => {
    try {
      setLoading(true);
      setError('');

      const [profileResult, hearings, meetings] = await Promise.all([
        getMyLawyerProfile().catch(() => null),
        getUpcomingHearings(),
        getLawyerMeetings(user.id),
      ]);

      setLawyerProfile(profileResult);

      const hearingEvents = (Array.isArray(hearings) ? hearings : []).map((hearing) => ({
        id: `hearing-${hearing.id}`,
        source: 'hearing',
        title: `Hearing: ${hearing.case?.title || 'Case'}`,
        start: new Date(hearing.date),
        end: new Date(hearing.date),
        status: hearing.status || 'scheduled',
        caseId: hearing.caseId,
      }));

      const meetingEvents = (Array.isArray(meetings) ? meetings : []).map((meeting) => ({
        id: `meeting-${meeting.id}`,
        source: 'meeting',
        title: meeting.title || meeting.client?.name || 'Meeting',
        start: meeting.start ? new Date(meeting.start) : new Date(meeting.meetingDate),
        end: meeting.end ? new Date(meeting.end) : getDefaultEndTime(new Date(meeting.meetingDate)),
        status: meeting.status || 'scheduled',
        meetingType: meeting.meetingType || 'online',
        notes: meeting.notes || '',
        clientName: meeting.client?.name || '',
      }));

      setEvents([...hearingEvents, ...meetingEvents]);
    } catch (loadError) {
      setError(loadError.response?.data?.error || 'Failed to load calendar');
    } finally {
      setLoading(false);
    }
  };

  const summary = useMemo(() => ({
    scheduled: events.filter((event) => event.status === 'scheduled').length,
    completed: events.filter((event) => event.status === 'completed').length,
    cancelled: events.filter((event) => event.status === 'cancelled').length,
  }), [events]);

  const resetForm = () => {
    setFormData(initialFormState);
    setSelectedEvent(null);
    setSuccessMessage('');
  };

  const handleSelectSlot = ({ start }) => {
    const normalizedStart = new Date(start);
    const normalizedEnd = getDefaultEndTime(normalizedStart);

    setSelectedEvent(null);
    setSuccessMessage('');
    setFormData({
      title: '',
      meetingDate: toDateTimeLocalValue(normalizedStart),
      endTime: toDateTimeLocalValue(normalizedEnd),
      meetingType: 'online',
      notes: '',
    });
  };

  const handleSelectEvent = (event) => {
    setSelectedEvent(event);
    setSuccessMessage('');
  };

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!lawyerProfile?.id) {
      setError('Complete your lawyer profile before scheduling meetings.');
      return;
    }

    if (!formData.title.trim()) {
      setError('Meeting title is required.');
      return;
    }

    if (!formData.meetingDate || !formData.endTime) {
      setError('Start and end time are required.');
      return;
    }

    if (new Date(formData.endTime) <= new Date(formData.meetingDate)) {
      setError('End time must be later than the start time.');
      return;
    }

    try {
      setSaving(true);
      setError('');

      await createMeeting({
        lawyerId: lawyerProfile.id,
        title: formData.title.trim(),
        meetingDate: formData.meetingDate,
        endTime: formData.endTime,
        meetingType: formData.meetingType,
        notes: formData.notes.trim(),
      });

      setSuccessMessage('Meeting saved to your calendar.');
      await loadCalendarData();
      setFormData(initialFormState);
    } catch (saveError) {
      setError(saveError.response?.data?.error || 'Failed to save meeting.');
    } finally {
      setSaving(false);
    }
  };

  const eventStyleGetter = (event) => {
    const paletteBySource = {
      hearing: {
        scheduled: '#2563eb',
        completed: '#059669',
        cancelled: '#dc2626',
      },
      meeting: {
        scheduled: '#7c3aed',
        completed: '#0f766e',
        cancelled: '#b91c1c',
      },
    };

    const sourcePalette = paletteBySource[event.source] || paletteBySource.meeting;

    return {
      style: {
        backgroundColor: sourcePalette[event.status] || sourcePalette.scheduled,
        borderRadius: '10px',
        color: '#fff',
        border: '0',
        display: 'block',
        opacity: 0.92,
        padding: '4px 8px',
      },
    };
  };

  if (!user || user.role !== 'lawyer') {
    return (
      <div className="flex min-h-[60vh] items-center justify-center p-8">
        <div className="surface-card max-w-md p-8 text-center text-zinc-900">
          <h1 className="mb-4 text-3xl font-bold text-primary">Access Denied</h1>
          <p className="text-slate-600">Lawyer dashboard only.</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="app-shell px-6 py-24 text-center text-slate-700">
        Loading calendar...
      </div>
    );
  }

  return (
    <div className="app-shell p-5 text-zinc-900 sm:p-8">
      <div className="app-container max-w-7xl space-y-8">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="page-eyebrow">Lawyer Calendar</p>
            <h1 className="mt-3 text-4xl font-semibold tracking-tight text-primary">Meetings & Hearings</h1>
            <p className="mt-2 max-w-2xl text-sm text-slate-500">
              Select a time slot to schedule a meeting. Saved meetings stay on your calendar and upcoming hearings remain visible.
            </p>
          </div>
          <div className="grid grid-cols-3 gap-3 text-sm">
            <div className="surface-card px-5 py-4 text-center">
              <p className="text-slate-500">Scheduled</p>
              <p className="mt-2 text-2xl font-semibold text-primary">{summary.scheduled}</p>
            </div>
            <div className="surface-card px-5 py-4 text-center">
              <p className="text-slate-500">Completed</p>
              <p className="mt-2 text-2xl font-semibold text-primary">{summary.completed}</p>
            </div>
            <div className="surface-card px-5 py-4 text-center">
              <p className="text-slate-500">Cancelled</p>
              <p className="mt-2 text-2xl font-semibold text-primary">{summary.cancelled}</p>
            </div>
          </div>
        </div>

        {error && (
          <div className="rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">
            {error}
          </div>
        )}

        {successMessage && (
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-4 text-sm text-emerald-700">
            {successMessage}
          </div>
        )}

        <div className="grid gap-8 xl:grid-cols-[1.6fr_0.8fr]">
          <div className="surface-card p-4 sm:p-6">
            <div style={{ height: '72vh' }}>
              <Calendar
                localizer={localizer}
                events={events}
                startAccessor="start"
                endAccessor="end"
                eventPropGetter={eventStyleGetter}
                selectable
                popup
                views={['month', 'week', 'day', 'agenda']}
                defaultView="week"
                onSelectSlot={handleSelectSlot}
                onSelectEvent={handleSelectEvent}
                style={{ fontSize: '14px' }}
              />
            </div>
          </div>

          <div className="space-y-6">
            <form onSubmit={handleSubmit} className="surface-card p-6 sm:p-7">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm uppercase tracking-[0.18em] text-secondary">Schedule</p>
                  <h2 className="mt-2 text-2xl font-semibold text-primary">New Meeting</h2>
                </div>
                <button
                  type="button"
                  onClick={resetForm}
                  className="rounded-full border border-slate-200 px-4 py-2 text-sm text-slate-600 hover:bg-slate-50"
                >
                  Clear
                </button>
              </div>

              <div className="mt-6 space-y-4">
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">Meeting title</label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => handleInputChange('title', e.target.value)}
                    placeholder="Case strategy review"
                    className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-secondary"
                    required
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">Start time</label>
                  <input
                    type="datetime-local"
                    value={formData.meetingDate}
                    onChange={(e) => handleInputChange('meetingDate', e.target.value)}
                    className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-secondary"
                    required
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">End time</label>
                  <input
                    type="datetime-local"
                    value={formData.endTime}
                    onChange={(e) => handleInputChange('endTime', e.target.value)}
                    className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-secondary"
                    required
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">Meeting type</label>
                  <select
                    value={formData.meetingType}
                    onChange={(e) => handleInputChange('meetingType', e.target.value)}
                    className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-secondary"
                  >
                    <option value="online">Online</option>
                    <option value="offline">Offline</option>
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">Notes</label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => handleInputChange('notes', e.target.value)}
                    rows={4}
                    placeholder="Agenda, client prep notes, or location details"
                    className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-secondary"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={saving}
                className="btn-primary mt-6 w-full rounded-2xl disabled:cursor-not-allowed disabled:opacity-70"
              >
                {saving ? 'Saving...' : 'Save Meeting'}
              </button>
            </form>

            <div className="surface-card p-6 sm:p-7">
              <p className="text-sm uppercase tracking-[0.18em] text-secondary">Details</p>
              {selectedEvent ? (
                <div className="mt-4 space-y-3 text-sm text-slate-600">
                  <h3 className="text-xl font-semibold text-primary">{selectedEvent.title}</h3>
                  <p><span className="font-semibold text-primary">Type:</span> {selectedEvent.source === 'hearing' ? 'Court Hearing' : selectedEvent.meetingType?.toUpperCase() || 'MEETING'}</p>
                  <p><span className="font-semibold text-primary">Start:</span> {selectedEvent.start?.toLocaleString() || 'Not available'}</p>
                  <p><span className="font-semibold text-primary">End:</span> {selectedEvent.end?.toLocaleString() || 'Not available'}</p>
                  <p><span className="font-semibold text-primary">Status:</span> {(selectedEvent.status || 'scheduled').toUpperCase()}</p>
                  {selectedEvent.clientName ? <p><span className="font-semibold text-primary">Client:</span> {selectedEvent.clientName}</p> : null}
                  {selectedEvent.notes ? <p><span className="font-semibold text-primary">Notes:</span> {selectedEvent.notes}</p> : null}
                </div>
              ) : (
                <p className="mt-4 text-sm text-slate-500">
                  Select a meeting or hearing to view details here.
                </p>
              )}
            </div>

            <div className="surface-card p-6 sm:p-7">
              <p className="text-sm uppercase tracking-[0.18em] text-secondary">How It Works</p>
              <div className="mt-4 space-y-3 text-sm text-slate-600">
                <p>Click or drag on the calendar to prefill a new meeting.</p>
                <p>Saved meetings are stored in the database and appear again after refresh.</p>
                <p>Hearings remain visible alongside meetings so your schedule stays in one place.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LawyerCalendar;

