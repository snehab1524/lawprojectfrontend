import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getCurrentUser } from '../api/authApi';
import { getCaseById, addUpdate, changeStatus, updateCase } from '../api/caseApi';
import { getLawyers } from '../api/lawyerApi';
import CaseTimeline from '../components/CaseTimeline';
import CaseDocuments from '../components/CaseDocuments';
import { User, Scale, Clock, MessageCircle, AlertCircle, Edit3 } from 'lucide-react';
import { Loader2 } from 'lucide-react';

const statusColors = {
  open: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-200 border-emerald-200 dark:border-emerald-800/50',
  'in-progress': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-200 border-yellow-200 dark:border-yellow-800/50',
  closed: 'bg-slate-100 text-slate-800 dark:bg-slate-900/50 dark:text-slate-200 border-slate-200 dark:border-slate-800/50'
};

const priorityColors = {
  low: 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-200',
  medium: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-200',
  high: 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-200'
};

const CasePage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const user = getCurrentUser();
  const [caseData, setCaseData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [newUpdateText, setNewUpdateText] = useState('');
  const [status, setStatus] = useState('');
  const [editing, setEditing] = useState(false);
  const [savingEdit, setSavingEdit] = useState(false);
  const [lawyers, setLawyers] = useState([]);
  const [editForm, setEditForm] = useState({
    title: '',
    description: '',
    caseType: 'other',
    priority: 'medium',
    notes: '',
    lawyerId: ''
  });
  const [error, setError] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const fetchCase = async () => {
    try {
      setLoading(true);
      const data = await getCaseById(id);
      setCaseData(data);
      setStatus(data.status);
      setEditForm({
        title: data.title || '',
        description: data.description || '',
        caseType: data.caseType || 'other',
        priority: data.priority || 'medium',
        notes: data.notes || '',
        lawyerId: data.lawyerId || ''
      });
      setError(null);
    } catch (err) {
      setError('Failed to load case details');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) fetchCase();
  }, [id, refreshKey]);

  useEffect(() => {
    const fetchLawyerOptions = async () => {
      if (user?.role !== 'client') {
        return;
      }

      try {
        const data = await getLawyers();
        setLawyers(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error('Failed to load lawyers:', err);
      }
    };

    fetchLawyerOptions();
  }, [user?.role]);

  const handleAddUpdate = async (e) => {
    e.preventDefault();
    if (!newUpdateText.trim()) return;

    try {
      setUpdating(true);
      await addUpdate(id, newUpdateText.trim());
      setNewUpdateText('');
      setRefreshKey(prev => prev + 1);
    } catch (err) {
      setError('Failed to add update');
    } finally {
      setUpdating(false);
    }
  };

  const handleStatusChange = async (e) => {
    e.preventDefault();
    if (!status || status === caseData.status) return;

    try {
      setUpdating(true);
      await changeStatus(id, status);
      setRefreshKey(prev => prev + 1);
    } catch (err) {
      setError('Failed to update status');
    } finally {
      setUpdating(false);
    }
  };

  const isLawyer = user?.role === 'lawyer';
  const isClient = user?.role === 'client';
  const basePath = user?.role === 'lawyer' ? '/lawyer-dashboard' : '/client-dashboard';
  const canEditCase = isClient || isLawyer;

  const handleEditCase = async (event) => {
    event.preventDefault();

    try {
      setSavingEdit(true);
      await updateCase(id, {
        title: editForm.title,
        description: editForm.description,
        caseType: editForm.caseType,
        priority: editForm.priority,
        notes: editForm.notes,
        ...(isClient ? { lawyerId: editForm.lawyerId || null } : {})
      });
      setEditing(false);
      setRefreshKey((prev) => prev + 1);
    } catch (err) {
      setError(err?.response?.data?.error || 'Failed to update case');
    } finally {
      setSavingEdit(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 dark:from-slate-900 to-slate-200 dark:to-slate-800 flex items-center justify-center p-8">
        <Loader2 className="w-12 h-12 animate-spin text-indigo-600 dark:text-indigo-400 mx-auto mb-4" />
        <div className="text-xl text-gray-600 dark:text-gray-300">Loading case details...</div>
      </div>
    );
  }

  if (!caseData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 dark:from-slate-900 p-8">
        <div className="max-w-4xl mx-auto text-center py-32">
          <AlertCircle className="w-24 h-24 text-red-400 mx-auto mb-8" />
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">Case not found</h1>
          <Link to={`${basePath}/cases`} className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-4 rounded-2xl font-bold text-lg shadow-xl hover:shadow-2xl transition-all inline-flex items-center gap-2">
            ← Back to Cases
          </Link>
        </div>
      </div>
    );
  }

  const chatLink = `${basePath}/chat?caseId=${caseData.id}`;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 dark:from-slate-900 to-slate-200 dark:to-slate-800 pt-6 pb-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-xl rounded-3xl p-8 mb-8 border border-gray-200 dark:border-slate-700 shadow-2xl">
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6 mb-6">
            <div>
              <h1 className="text-4xl lg:text-5xl font-bold bg-gradient-to-r from-gray-900 to-slate-800 dark:from-white dark:to-slate-200 bg-clip-text text-transparent mb-3">
                {caseData.title}
              </h1>
              <div className="flex items-center gap-4">
                <span className={`px-4 py-2 rounded-2xl font-bold text-sm border ${statusColors[caseData.status]}`}>
                  {caseData.status.replace('-', ' ').toUpperCase()}
                </span>
                <span className={`px-3 py-1 rounded-full font-bold text-xs ${priorityColors[caseData.priority]}`}>
                  {caseData.priority.toUpperCase()}
                </span>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              {canEditCase && (
                <button
                  onClick={() => setEditing((prev) => !prev)}
                  className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-2xl font-bold shadow-lg hover:shadow-xl transition-all whitespace-nowrap"
                >
                  <Edit3 className="w-5 h-5" />
                  {editing ? 'Cancel Edit' : 'Edit Case'}
                </button>
              )}
              <Link
                to={chatLink}
                className="flex items-center gap-2 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white px-6 py-3 rounded-2xl font-bold shadow-lg hover:shadow-xl transition-all whitespace-nowrap"
              >
                <MessageCircle className="w-5 h-5" />
                Open Chat
              </Link>
              <button
                onClick={() => navigate(-1)}
                className="flex items-center gap-2 bg-slate-500 hover:bg-slate-600 text-white px-6 py-3 rounded-2xl font-medium shadow-lg hover:shadow-xl transition-all"
              >
                ← Back
              </button>
            </div>
          </div>
        </div>

        {error && (
          <div className="bg-red-100 dark:bg-red-900/50 border border-red-200 dark:border-red-800 rounded-2xl p-6 mb-8 text-red-800 dark:text-red-200">
            <AlertCircle className="w-6 h-6 inline mr-2" />
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          {/* Case Details */}
          <div className="lg:col-span-2">
            <div className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-xl rounded-3xl p-8 border border-gray-200 dark:border-slate-700 shadow-2xl">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-3">
                <Scale className="w-8 h-8 text-indigo-600" />
                Case Details
              </h2>
              {editing ? (
                <form onSubmit={handleEditCase} className="space-y-6">
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-gray-900 dark:text-gray-100">Title</label>
                    <input
                      type="text"
                      value={editForm.title}
                      onChange={(event) => setEditForm((prev) => ({ ...prev, title: event.target.value }))}
                      className="w-full rounded-2xl border border-gray-300 bg-white px-4 py-3 text-gray-900 outline-none transition focus:border-indigo-500 dark:border-slate-600 dark:bg-slate-700 dark:text-white"
                      required
                    />
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-gray-900 dark:text-gray-100">Description</label>
                    <textarea
                      value={editForm.description}
                      onChange={(event) => setEditForm((prev) => ({ ...prev, description: event.target.value }))}
                      rows="5"
                      className="w-full rounded-2xl border border-gray-300 bg-white px-4 py-3 text-gray-900 outline-none transition focus:border-indigo-500 dark:border-slate-600 dark:bg-slate-700 dark:text-white"
                      required
                    />
                  </div>
                  <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                    <div>
                      <label className="mb-2 block text-sm font-semibold text-gray-900 dark:text-gray-100">Case Type</label>
                      <select
                        value={editForm.caseType}
                        onChange={(event) => setEditForm((prev) => ({ ...prev, caseType: event.target.value }))}
                        className="w-full rounded-2xl border border-gray-300 bg-white px-4 py-3 text-gray-900 outline-none transition focus:border-indigo-500 dark:border-slate-600 dark:bg-slate-700 dark:text-white"
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
                      <label className="mb-2 block text-sm font-semibold text-gray-900 dark:text-gray-100">Priority</label>
                      <select
                        value={editForm.priority}
                        onChange={(event) => setEditForm((prev) => ({ ...prev, priority: event.target.value }))}
                        className="w-full rounded-2xl border border-gray-300 bg-white px-4 py-3 text-gray-900 outline-none transition focus:border-indigo-500 dark:border-slate-600 dark:bg-slate-700 dark:text-white"
                      >
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                      </select>
                    </div>
                  </div>
                  {isClient && (
                    <div>
                      <label className="mb-2 block text-sm font-semibold text-gray-900 dark:text-gray-100">Assigned Lawyer</label>
                      <select
                        value={editForm.lawyerId}
                        onChange={(event) => setEditForm((prev) => ({ ...prev, lawyerId: event.target.value }))}
                        className="w-full rounded-2xl border border-gray-300 bg-white px-4 py-3 text-gray-900 outline-none transition focus:border-indigo-500 dark:border-slate-600 dark:bg-slate-700 dark:text-white"
                      >
                        <option value="">Unassigned</option>
                        {lawyers.map((lawyer) => (
                          <option key={lawyer.id} value={lawyer.id}>
                            {lawyer.name} {lawyer.specialization ? `(${lawyer.specialization})` : ''}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-gray-900 dark:text-gray-100">Notes</label>
                    <textarea
                      value={editForm.notes}
                      onChange={(event) => setEditForm((prev) => ({ ...prev, notes: event.target.value }))}
                      rows="4"
                      className="w-full rounded-2xl border border-gray-300 bg-white px-4 py-3 text-gray-900 outline-none transition focus:border-indigo-500 dark:border-slate-600 dark:bg-slate-700 dark:text-white"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={savingEdit}
                    className="inline-flex items-center gap-2 rounded-2xl bg-emerald-600 px-6 py-3 font-bold text-white shadow-lg transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {savingEdit ? <Loader2 className="w-5 h-5 animate-spin" /> : <Edit3 className="w-5 h-5" />}
                    Save Case Changes
                  </button>
                </form>
              ) : (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">Description</h3>
                    <p className="text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">{caseData.description}</p>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-2 flex items-center gap-2">
                        <User className="w-5 h-5 text-blue-600" />
                        Client
                      </h4>
                      <p className="text-gray-700 dark:text-gray-300">{caseData.client?.name || 'N/A'}</p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-2 flex items-center gap-2">
                        <User className="w-5 h-5 text-indigo-600" />
                        Lawyer
                      </h4>
                      <p className="text-gray-700 dark:text-gray-300">{caseData.lawyer?.User?.name || 'Not assigned'}</p>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">Case Type</h4>
                    <span className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-100 dark:bg-indigo-900/50 text-indigo-800 dark:text-indigo-200 rounded-xl font-medium">
                      <Scale className="w-4 h-4" />
                      {caseData.caseType}
                    </span>
                  </div>
                  {caseData.notes && (
                    <div>
                      <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">Notes</h4>
                      <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{caseData.notes}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Actions Panel */}
          <div>
            <div className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-xl rounded-3xl p-6 border border-gray-200 dark:border-slate-700 shadow-2xl sticky top-24">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Quick Actions</h3>
              <div className="space-y-4">
                {isLawyer && (
                  <form onSubmit={handleStatusChange} className="space-y-3">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Case Status
                    </label>
                    <select
                      value={status}
                      onChange={(e) => setStatus(e.target.value)}
                      disabled={updating}
                      className="w-full p-3 bg-gray-50 dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-xl text-gray-900 dark:text-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                    >
                      <option value="open">Open</option>
                      <option value="in-progress">In Progress</option>
                      <option value="closed">Closed</option>
                    </select>
                    <button
                      type="submit"
                      disabled={updating || status === caseData.status}
                      className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 disabled:opacity-50 text-white py-3 px-4 rounded-xl font-bold shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2"
                    >
                      {updating ? <Loader2 className="w-5 h-5 animate-spin" /> : <Edit3 className="w-5 h-5" />}
                      Update Status
                    </button>
                  </form>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Add Update */}
        <div className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-xl rounded-3xl p-8 border border-gray-200 dark:border-slate-700 shadow-2xl mb-8">
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-3">
            <Clock className="w-8 h-8" />
            Add Update
          </h3>
          <form onSubmit={handleAddUpdate} className="space-y-4">
            <div>
              <textarea
                value={newUpdateText}
                onChange={(e) => setNewUpdateText(e.target.value)}
                placeholder="Describe the latest development in this case..."
                rows="4"
                className="w-full p-4 bg-gray-50 dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-2xl text-gray-900 dark:text-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 resize-vertical transition-all"
                disabled={updating}
              />
            </div>
            <button
              type="submit"
              disabled={!newUpdateText.trim() || updating}
              className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 disabled:opacity-50 text-white py-4 px-6 rounded-2xl font-bold shadow-xl hover:shadow-2xl transition-all flex items-center justify-center gap-3 text-lg"
            >
              {updating ? <Loader2 className="w-5 h-5 animate-spin" /> : <MessageCircle className="w-6 h-6" />}
              Add Timeline Update
            </button>
          </form>
        </div>

        {/* Timeline */}
        <CaseTimeline timeline={caseData.timeline} />

        {/* Documents */}
        <CaseDocuments caseId={caseData.id} userId={user?.id} isLawyer={isLawyer} />
      </div>
    </div>
  );
};

export default CasePage;

