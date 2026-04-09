import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { 
  BookOpen, 
  Save, 
  Loader2, 
  AlertCircle, 
  ChevronLeft,
  FileText,
  Clock
} from 'lucide-react';
import { getCurrentUser } from '../api/authApi';
import { 
  getLawyerCases, 
  updateCase,
  getCaseById 
} from '../api/caseApi';

const CaseNotes = () => {
  const [user, setUser] = useState(null);
  const [cases, setCases] = useState([]);
  const [selectedCaseId, setSelectedCaseId] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [lastSaved, setLastSaved] = useState(null);

  const fetchUserAndCases = useCallback(async () => {
    try {
      setLoading(true);
      setError('');

      const currentUser = getCurrentUser();
      if (!currentUser || currentUser.role !== 'lawyer') {
        setError('Lawyer account required');
        setLoading(false);
        return;
      }
      setUser(currentUser);

      const casesData = await getLawyerCases(currentUser.id);
      setCases(casesData.items || []);
    } catch (_err) {
      setError('Failed to load cases');
    } finally {
      setLoading(false);
    }
  }, []);

  const loadCaseNotes = useCallback(async (caseId) => {
    if (!caseId) return;
    try {
      const caseData = await getCaseById(caseId);
      setNotes(caseData.notes || '');
      setLastSaved(new Date().toLocaleString());
    } catch (_err) {
      setError('Failed to load case notes');
    }
  }, []);

  const saveNotes = async () => {
    if (!selectedCaseId || !notes.trim()) {
      setError('Select a case and enter notes');
      return;
    }
    try {
      setSaving(true);
      setError('');
      await updateCase(selectedCaseId, { notes });
      setLastSaved(new Date().toLocaleString());
    } catch (_err) {
      setError('Failed to save notes');
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => {
    fetchUserAndCases();
  }, [fetchUserAndCases]);

  useEffect(() => {
    if (selectedCaseId) {
      loadCaseNotes(selectedCaseId);
    }
  }, [selectedCaseId, loadCaseNotes]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-700 p-8">
        <div className="flex items-center gap-2 rounded-full bg-stone-100 px-6 py-3 text-zinc-900">
          <Loader2 className="h-5 w-5 animate-spin" />
          Loading cases...
        </div>
      </div>
    );
  }

  const selectedCase = cases.find(c => c.id == selectedCaseId);

  return (
    <div className="flex-1 p-4 sm:p-8 bg-zinc-700 min-h-screen">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="flex items-center gap-4">
          <Link 
            to="/lawyer-dashboard" 
            className="inline-flex items-center gap-2 rounded-xl bg-stone-100 px-4 py-2 text-zinc-900 hover:bg-stone-200 transition-all"
          >
            <ChevronLeft size={18} />
            Back to Dashboard
          </Link>
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-white mb-1 flex items-center gap-3">
              <BookOpen size={32} />
              Case Notes
            </h1>
            <p className="text-zinc-300">Manage argument notes for your active cases</p>
          </div>
        </div>

        {error && (
          <div className="rounded-2xl bg-rose-500/20 border border-rose-500/50 p-6 text-white">
            <div className="flex items-start gap-3">
              <AlertCircle size={20} />
              <div>
                <p className="font-medium">{error}</p>
                <button 
                  onClick={fetchUserAndCases}
                  className="mt-2 inline-flex items-center gap-2 text-sm underline"
                >
                  Retry
                </button>
              </div>
            </div>
          </div>
        )}

        {cases.length === 0 ? (
          <div className="rounded-2xl bg-stone-800/50 border border-stone-700 p-8 text-center">
            <FileText size={48} className="mx-auto mb-4 text-zinc-400" />
            <h3 className="text-xl font-semibold text-white mb-2">No cases found</h3>
            <p className="text-zinc-400 mb-6">Create some cases to start taking notes</p>
            <Link 
              to="/lawyer-dashboard/cases" 
              className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-6 py-3 text-white font-medium hover:bg-emerald-700"
            >
              Manage Cases
            </Link>
          </div>
        ) : (
          <>
            <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl border border-slate-700 p-6">
              <label className="block text-sm font-medium text-white mb-3 uppercase tracking-wide">
                Select Case
              </label>
              <select 
                value={selectedCaseId} 
                onChange={(e) => setSelectedCaseId(e.target.value)}
                className="w-full p-4 bg-slate-700 border border-slate-600 rounded-xl text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              >
                <option value="">Choose a case...</option>
                {cases.map((caseItem) => (
                  <option key={caseItem.id} value={caseItem.id}>
                    {caseItem.title} ({caseItem.status})
                  </option>
                ))}
              </select>
            </div>

            {selectedCaseId && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-2xl font-bold text-white flex items-center gap-3">
                    <FileText size={24} />
                    Notes for {selectedCase?.title}
                  </h3>
                  {lastSaved && (
                    <div className="flex items-center gap-2 text-sm text-zinc-400">
                      <Clock size={16} />
                      Saved {lastSaved}
                    </div>
                  )}
                </div>
                
                <div className="bg-slate-800/50 p-6 rounded-2xl border border-slate-700">
                  <textarea 
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={12}
                    placeholder="Write your case arguments, key points, evidence notes, legal strategy... 

Pro tip: Use bullet points, bold important precedents, and timestamp key updates."
                    className="w-full p-6 bg-slate-900/50 border border-slate-600 rounded-xl text-white font-mono text-sm resize-vertical focus:ring-2 focus:ring-emerald-500 focus:border-transparent placeholder-zinc-500"
                  />
                </div>

                <div className="flex gap-4 pt-4">
                  <button
                    onClick={saveNotes}
                    disabled={saving || !notes.trim()}
                    className="flex-1 inline-flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-800 disabled:cursor-not-moving text-white px-8 py-4 rounded-2xl font-semibold transition-all shadow-lg hover:shadow-xl focus:outline-none focus:ring-4 focus:ring-emerald-500/50 disabled:opacity-50"
                  >
                    {saving ? (
                      <>
                        <Loader2 className="h-5 w-5 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save size={20} />
                        Save Notes
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default CaseNotes;

