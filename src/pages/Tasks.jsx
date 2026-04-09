import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';

import { getCurrentUser } from '../api/authApi';
import { getMyLawyerProfile } from '../api/lawyerProfileApi';
import { createTask, deleteTask, getPendingTasks, updateTask } from '../api/taskApi';

const emptyTaskForm = {
  title: '',
  description: '',
  caseId: '',
  dueDate: '',
};

const filterOptions = [
  { value: 'all', label: 'All tasks' },
  { value: 'pending', label: 'Pending' },
  { value: 'completed', label: 'Completed' },
];

const formatDate = (value) => {
  if (!value) return 'No due date';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'No due date';
  return date.toLocaleDateString();
};

const statusClasses = {
  pending: 'bg-amber-100 text-amber-900',
  completed: 'bg-emerald-100 text-emerald-900',
};

const Tasks = () => {
  const [user] = useState(() => getCurrentUser());
  const [tasks, setTasks] = useState([]);
  const [taskForm, setTaskForm] = useState(emptyTaskForm);
  const [lawyerProfileId, setLawyerProfileId] = useState(null);
  const [statusFilter, setStatusFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [busyTaskIds, setBusyTaskIds] = useState([]);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const setTaskBusy = useCallback((taskId, busy) => {
    setBusyTaskIds((current) => {
      if (busy) {
        return current.includes(taskId) ? current : [...current, taskId];
      }

      return current.filter((id) => id !== taskId);
    });
  }, []);

  const loadTasks = useCallback(async (nextStatus = 'all') => {
    try {
      setLoading(true);
      setError('');
      const tasksData = await getPendingTasks(nextStatus);
      setTasks(tasksData);
    } catch (err) {
      console.error('Failed to load tasks', err);
      setError(err?.response?.data?.error || err?.response?.data?.message || 'Failed to load tasks.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const initialize = async () => {
      if (!user || user.role !== 'lawyer') {
        setLoading(false);
        return;
      }

      try {
        const profile = await getMyLawyerProfile();
        setLawyerProfileId(profile.profileId || profile.id || null);
      } catch (err) {
        console.error('Failed to load lawyer profile', err);
        setError(err?.response?.data?.error || 'Create your lawyer profile before managing tasks.');
      }

      await loadTasks('all');
    };

    initialize();
  }, [loadTasks, user?.role]);

  const stats = useMemo(() => ({
    total: tasks.length,
    pending: tasks.filter((task) => task.status !== 'completed').length,
    completed: tasks.filter((task) => task.status === 'completed').length,
  }), [tasks]);

  const handleChangeFilter = async (nextFilter) => {
    setStatusFilter(nextFilter);
    await loadTasks(nextFilter);
  };

  const handleCreateTask = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setError('');
    setSuccessMessage('');

    try {
      await createTask({
        title: taskForm.title.trim(),
        description: taskForm.description.trim(),
        caseId: taskForm.caseId ? Number(taskForm.caseId) : null,
        dueDate: taskForm.dueDate || null,
        assignedLawyerId: lawyerProfileId,
      });
      setTaskForm(emptyTaskForm);
      setStatusFilter('all');
      setSuccessMessage('Task created successfully.');
      await loadTasks('all');
    } catch (err) {
      console.error('Failed to create task', err);
      setError(err?.response?.data?.error || err?.response?.data?.message || 'Failed to create task.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleStatusUpdate = async (taskId, nextStatus) => {
    setTaskBusy(taskId, true);
    setError('');
    setSuccessMessage('');

    try {
      await updateTask(taskId, { status: nextStatus });
      setSuccessMessage(nextStatus === 'completed' ? 'Task marked as completed.' : 'Task moved back to pending.');
      await loadTasks(statusFilter);
    } catch (err) {
      console.error('Failed to update task', err);
      setError(err?.response?.data?.error || err?.response?.data?.message || 'Failed to update task.');
    } finally {
      setTaskBusy(taskId, false);
    }
  };

  const handleDeleteTask = async (taskId) => {
    if (!window.confirm('Delete this task?')) return;

    setTaskBusy(taskId, true);
    setError('');
    setSuccessMessage('');

    try {
      await deleteTask(taskId);
      setSuccessMessage('Task deleted.');
      await loadTasks(statusFilter);
    } catch (err) {
      console.error('Failed to delete task', err);
      setError(err?.response?.data?.error || err?.response?.data?.message || 'Failed to delete task.');
    } finally {
      setTaskBusy(taskId, false);
    }
  };

  if (!user || user.role !== 'lawyer') {
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
          <p className="text-xs uppercase tracking-[0.28em] text-slate-300">Task Workspace</p>
          <h1 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">Tasks</h1>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-200 sm:text-base">
            Track what is due, log fresh follow-ups, and close work without leaving the lawyer dashboard.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            {filterOptions.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => handleChangeFilter(option.value)}
                className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                  statusFilter === option.value
                    ? 'bg-white text-slate-900'
                    : 'border border-white/20 bg-white/10 text-white hover:bg-white/15'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        <div className="rounded-[2rem] border border-stone-200 bg-stone-100 p-6 text-zinc-900 shadow-[0_18px_60px_rgba(0,0,0,0.12)]">
          <p className="text-xs uppercase tracking-[0.24em] text-secondary">Snapshot</p>
          <div className="mt-5 grid gap-4 sm:grid-cols-3 xl:grid-cols-1">
            <div className="rounded-[1.5rem] bg-white px-4 py-4">
              <p className="text-sm text-slate-500">Visible tasks</p>
              <p className="mt-2 text-3xl font-semibold text-primary">{stats.total}</p>
            </div>
            <div className="rounded-[1.5rem] bg-white px-4 py-4">
              <p className="text-sm text-slate-500">Pending</p>
              <p className="mt-2 text-3xl font-semibold text-primary">{stats.pending}</p>
            </div>
            <div className="rounded-[1.5rem] bg-white px-4 py-4">
              <p className="text-sm text-slate-500">Completed</p>
              <p className="mt-2 text-3xl font-semibold text-primary">{stats.completed}</p>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-8 xl:grid-cols-[0.9fr_1.1fr]">
        <form onSubmit={handleCreateTask} className="rounded-[2rem] border border-stone-200 bg-stone-100 p-6 text-zinc-900 shadow-[0_18px_60px_rgba(0,0,0,0.12)]">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="text-2xl font-semibold text-primary">Create Task</h2>
              <p className="mt-2 text-sm text-slate-600">New tasks are assigned to your lawyer profile automatically.</p>
            </div>
            <Link to="/lawyer-dashboard/cases" className="text-sm font-medium text-secondary underline underline-offset-4">
              Open cases
            </Link>
          </div>

          <div className="mt-6 space-y-4">
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">Title</label>
              <input
                value={taskForm.title}
                onChange={(event) => setTaskForm((current) => ({ ...current, title: event.target.value }))}
                placeholder="Prepare hearing notes"
                className="w-full rounded-2xl border border-stone-300 bg-white px-4 py-3 text-zinc-900 outline-none transition focus:border-secondary"
                required
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">Case ID</label>
                <input
                  type="number"
                  min="1"
                  value={taskForm.caseId}
                  onChange={(event) => setTaskForm((current) => ({ ...current, caseId: event.target.value }))}
                  placeholder="12"
                  className="w-full rounded-2xl border border-stone-300 bg-white px-4 py-3 text-zinc-900 outline-none transition focus:border-secondary"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">Due Date</label>
                <input
                  type="date"
                  value={taskForm.dueDate}
                  onChange={(event) => setTaskForm((current) => ({ ...current, dueDate: event.target.value }))}
                  className="w-full rounded-2xl border border-stone-300 bg-white px-4 py-3 text-zinc-900 outline-none transition focus:border-secondary"
                />
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">Description</label>
              <textarea
                value={taskForm.description}
                onChange={(event) => setTaskForm((current) => ({ ...current, description: event.target.value }))}
                placeholder="Add the exact filings, client follow-up, or prep needed."
                rows="5"
                className="w-full rounded-2xl border border-stone-300 bg-white px-4 py-3 text-zinc-900 outline-none transition focus:border-secondary"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting || !lawyerProfileId}
            className="mt-6 inline-flex rounded-full bg-primary px-6 py-3 text-sm font-semibold text-white transition hover:bg-primary-dark disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitting ? 'Creating...' : 'Create task'}
          </button>
        </form>

        <div className="space-y-4">
          {(error || successMessage) && (
            <div className={`rounded-[1.5rem] px-5 py-4 text-sm shadow-sm ${
              error ? 'bg-red-100 text-red-900' : 'bg-emerald-100 text-emerald-900'
            }`}>
              {error || successMessage}
            </div>
          )}

          {loading ? (
            <div className="rounded-[2rem] border border-stone-200 bg-stone-100 p-6 text-zinc-900 shadow-[0_18px_60px_rgba(0,0,0,0.12)]">
              Loading tasks...
            </div>
          ) : tasks.length === 0 ? (
            <div className="rounded-[2rem] border border-stone-200 bg-stone-100 p-8 text-zinc-900 shadow-[0_18px_60px_rgba(0,0,0,0.12)]">
              <h2 className="text-2xl font-semibold text-primary">No tasks here yet</h2>
              <p className="mt-3 text-slate-600">Switch the filter or create a new task to get started.</p>
            </div>
          ) : (
            tasks.map((task) => {
              const busy = busyTaskIds.includes(task.id);
              const isCompleted = task.status === 'completed';

              return (
                <article key={task.id} className="rounded-[2rem] border border-stone-200 bg-stone-100 p-6 text-zinc-900 shadow-[0_18px_60px_rgba(0,0,0,0.12)]">
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div>
                      <div className="flex flex-wrap items-center gap-3">
                        <h2 className="text-2xl font-semibold text-primary">{task.title}</h2>
                        <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${statusClasses[task.status] || statusClasses.pending}`}>
                          {task.status}
                        </span>
                      </div>
                      <p className="mt-3 text-sm leading-7 text-slate-600">
                        {task.description || 'No description added yet.'}
                      </p>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        disabled={busy}
                        onClick={() => handleStatusUpdate(task.id, isCompleted ? 'pending' : 'completed')}
                        className="rounded-full bg-primary px-4 py-2 text-sm font-medium text-white transition hover:bg-primary-dark disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {busy ? 'Saving...' : isCompleted ? 'Mark pending' : 'Mark complete'}
                      </button>
                      <button
                        type="button"
                        disabled={busy}
                        onClick={() => handleDeleteTask(task.id)}
                        className="rounded-full border border-stone-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-stone-200 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        Delete
                      </button>
                    </div>
                  </div>

                  <div className="mt-6 grid gap-3 sm:grid-cols-3">
                    <div className="rounded-[1.25rem] bg-white px-4 py-3">
                      <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Case</p>
                      <p className="mt-2 font-medium text-zinc-900">
                        {task.case?.title ? `${task.case.title} (#${task.case.id})` : task.caseId ? `Case #${task.caseId}` : 'Not linked'}
                      </p>
                    </div>
                    <div className="rounded-[1.25rem] bg-white px-4 py-3">
                      <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Due</p>
                      <p className="mt-2 font-medium text-zinc-900">{formatDate(task.dueDate)}</p>
                    </div>
                    <div className="rounded-[1.25rem] bg-white px-4 py-3">
                      <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Case Status</p>
                      <p className="mt-2 font-medium text-zinc-900">
                        {task.case?.status ? String(task.case.status).replace('-', ' ') : 'Unavailable'}
                      </p>
                    </div>
                  </div>
                </article>
              );
            })
          )}
        </div>
      </section>
    </div>
  );
};

export default Tasks;

