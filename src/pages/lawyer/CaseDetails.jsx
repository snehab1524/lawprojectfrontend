import { useState, useEffect, useCallback } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { ArrowLeft, MessageSquare, Upload, Edit3, Check, Clock, Calendar, FileText, User } from "lucide-react";
import { getCurrentUser } from "../../api/authApi";
import { getCaseById, addUpdate, changeStatus, updateCase } from "../../api/caseApi";
import { uploadDocument, getDocumentsByCase } from "../../api/documentApi";
import { getOrCreateChat } from "../../api/chatApi";

const statusColors = {
  open: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
  "in-progress": "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  closed: "bg-slate-500/20 text-slate-400 border-slate-500/30"
};

const priorityColors = {
  low: "bg-green-500/20 text-green-400",
  medium: "bg-yellow-500/20 text-yellow-400",
  high: "bg-red-500/20 text-red-400"
};

const CaseDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const user = getCurrentUser();
  const [caseRecord, setCaseRecord] = useState(null);
  const [loading, setLoading] = useState(true);
  const [documents, setDocuments] = useState([]);
  const [updateText, setUpdateText] = useState("");
  const [currentStatus, setCurrentStatus] = useState("");
  const [currentPriority, setCurrentPriority] = useState("");
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);
  const [isLawyer, setIsLawyer] = useState(false);

  const fetchCase = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getCaseById(id);
      setCaseRecord(data);
      setCurrentStatus(data.status);
      setCurrentPriority(data.priority);
      const { items: docs } = await getDocumentsByCase(id);
      setDocuments(docs);
      
      // Check permissions
      setIsLawyer(user.role === 'lawyer' && data.lawyerId === (user.lawyerProfileId || user.id));
    } catch (err) {
      setError(err.response?.data?.error || "Failed to load case");
    } finally {
      setLoading(false);
    }
  }, [id, user]);

  useEffect(() => {
    fetchCase();
  }, [fetchCase]);

  const handleAddUpdate = async (e) => {
    e.preventDefault();
    if (!updateText.trim()) return;
    try {
      await addUpdate(id, updateText);
      setUpdateText("");
      fetchCase();
    } catch (err) {
      setError("Failed to add update");
    }
  };

  const handleChangeStatus = async () => {
    try {
      await changeStatus(id, currentStatus);
      fetchCase();
    } catch (err) {
      setError("Failed to update status");
    }
  };

  const handleUpdatePriority = async () => {
    try {
      await updateCase(id, { priority: currentPriority });
      fetchCase();
    } catch (err) {
      setError("Failed to update priority");
    }
  };

  const handleUploadDocument = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const formData = new FormData();
    formData.append('document', file);
    formData.append('caseId', id);
    formData.append('userId', user.id);
    try {
      setUploading(true);
      await uploadDocument(formData);
      fetchCase();
    } catch (err) {
      setError("Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const handleOpenChat = async () => {
    try {
      const lawyerUserId = caseRecord.lawyer?.User?.id || caseRecord.lawyerId;
      const chat = await getOrCreateChat(lawyerUserId);
      navigate('/client-dashboard/chat', { state: { chatId: chat.id, partnerName: caseRecord.lawyer?.User?.name || 'Lawyer' } });
    } catch (err) {
      setError('Failed to open chat');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 pt-20 p-8 flex items-center justify-center">
        <div className="text-white text-xl">Loading case details...</div>
      </div>
    );
  }

  if (!caseRecord) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 pt-20 p-8 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white mb-4">Case not found</h2>
          <Link to="../cases" className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-2xl font-bold">Back to Cases</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-8 pt-20">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-start justify-between mb-12">
          <Link to="../cases" className="inline-flex items-center gap-3 text-indigo-400 hover:text-indigo-300 font-medium mb-8">
            <ArrowLeft size={24} />
            Back to Cases
          </Link>
          <div className="text-right">
            <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold ${statusColors[currentStatus]}`}>
              <div className="w-3 h-3 rounded-full bg-current" /> {currentStatus.replace('-', ' ').toUpperCase()}
            </span>
            <span className={`ml-3 inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold ${priorityColors[currentPriority]}`}>
              {currentPriority.toUpperCase()}
            </span>
          </div>
        </div>

        {error && (
          <div className="bg-red-500/20 border border-red-500/30 text-red-200 p-6 rounded-3xl mb-8">
            {error}
          </div>
        )}

        <div className="grid lg:grid-cols-3 gap-8 mb-12">
          {/* Case Info */}
          <div className="lg:col-span-2">
            <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700 rounded-3xl p-8 mb-8">
              <h1 className="text-4xl font-bold text-white mb-6">{caseRecord.title}</h1>
              <div className="space-y-4 text-gray-300">
                <div><strong>Description:</strong> {caseRecord.description}</div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <User size={16} className="text-indigo-400" />
                    <span>Lawyer: {caseRecord.lawyer?.User?.name || 'Unassigned'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <FileText size={16} className="text-indigo-400" />
                    <span className="capitalize">{caseRecord.caseType}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar size={16} className="text-indigo-400" />
                    <span>{new Date(caseRecord.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Add Update */}
            <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700 rounded-3xl p-8">
              <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                <Edit3 size={24} />
                Add Case Update
              </h3>
              <form onSubmit={handleAddUpdate} className="space-y-4">
                <textarea
                  value={updateText}
                  onChange={(e) => setUpdateText(e.target.value)}
                  placeholder="Add your case update..."
                  rows={4}
                  className="w-full p-4 bg-slate-700/50 border border-slate-600 rounded-2xl text-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 resize-vertical"
                />
                <button
                  type="submit"
                  disabled={!updateText.trim()}
                  className="w-full bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 disabled:opacity-50 text-white py-4 px-6 rounded-2xl font-bold shadow-xl hover:shadow-2xl transition-all"
                >
                  Add Update
                </button>
              </form>
            </div>
          </div>

          {/* Actions */}
          <div className="space-y-6">
            {/* Chat Button */}
            <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700 rounded-3xl p-8">
              <button
                onClick={handleOpenChat}
                className="w-full bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white py-3 px-6 rounded-xl font-bold shadow-xl hover:shadow-2xl text-center transition-all flex items-center justify-center gap-2"
              >
                <MessageSquare size={20} />
                Open Chat with Lawyer
              </button>
            </div>

            {isLawyer && (
              <>
                {/* Status Change */}
                <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700 rounded-3xl p-8">
                  <h4 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                    <Check size={20} className="text-emerald-400" />
                    Change Status
                  </h4>
                  <select
                    value={currentStatus}
                    onChange={(e) => setCurrentStatus(e.target.value)}
                    className="w-full p-3 bg-slate-700/50 border border-slate-600 rounded-xl text-white mb-4"
                  >
                    <option value="open">Open</option>
                    <option value="in-progress">In Progress</option>
                    <option value="closed">Closed</option>
                  </select>
                  <button
                    onClick={handleChangeStatus}
                    className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white py-3 px-6 rounded-xl font-bold shadow-xl hover:shadow-2xl"
                  >
                    Update Status
                  </button>
                </div>

                {/* Priority Update */}
                <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700 rounded-3xl p-8">
                  <h4 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                    <Clock size={20} className="text-yellow-400" />
                    Priority
                  </h4>
                  <select
                    value={currentPriority}
                    onChange={(e) => setCurrentPriority(e.target.value)}
                    className="w-full p-3 bg-slate-700/50 border border-slate-600 rounded-xl text-white mb-4"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                  <button
                    onClick={handleUpdatePriority}
                    className="w-full bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white py-3 px-6 rounded-xl font-bold shadow-xl hover:shadow-2xl"
                  >
                    Update Priority
                  </button>
                </div>
              </>
            )}

            {/* Document Upload */}
            <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700 rounded-3xl p-8">
              <h4 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <Upload size={20} className="text-emerald-400" />
                Upload Document
              </h4>
              <input
                type="file"
                onChange={handleUploadDocument}
                className="hidden"
                id="document-upload"
                multiple
                accept=".pdf,.doc,.docx,.jpg,.png"
              />
              <label htmlFor="document-upload" className="w-full flex flex-col items-center justify-center p-8 border-2 border-dashed border-slate-600 rounded-2xl hover:border-emerald-500 cursor-pointer transition-colors">
                <Upload size={32} className="text-gray-400 mb-4" />
                <span className="text-white font-medium">Click to upload</span>
                <span className="text-sm text-gray-400 mt-1">PDF, DOC, Images (max 10MB)</span>
              </label>
              {uploading && <p className="text-emerald-400 mt-4 text-center">Uploading...</p>}
            </div>
          </div>
        </div>

        {/* Timeline */}
        {caseRecord.timeline && caseRecord.timeline.length > 0 && (
          <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700 rounded-3xl p-8 mb-8">
            <h3 className="text-2xl font-bold text-white mb-6">Case Timeline</h3>
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {caseRecord.timeline.map((update, index) => (
                <div key={index} className="flex gap-4 p-6 bg-slate-700/50 rounded-2xl border border-slate-600">
                  <div className="w-2 h-2 bg-indigo-400 rounded-full mt-4 flex-shrink-0" />
                  <div className="flex-1">
                    <p className="text-white mb-2">{update.text}</p>
                    <div className="text-xs text-gray-400">
                      {new Date(update.date).toLocaleString()}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Documents */}
        <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700 rounded-3xl p-8">
          <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
            <FileText size={24} />
            Case Documents ({documents.length})
          </h3>
          {documents.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {documents.map((doc) => (
                <div key={doc.id} className="group bg-slate-700/50 border border-slate-600 rounded-xl p-6 hover:bg-slate-700 hover:border-indigo-500 transition-all">
                  <FileText size={32} className="text-indigo-400 mb-4 group-hover:scale-110 transition-transform" />
                  <h4 className="font-bold text-white mb-2 truncate">{doc.filename}</h4>
                  <p className="text-sm text-gray-400 mb-4">{new Date(doc.createdAt).toLocaleDateString()}</p>
                  <a
                    href={`/api/documents/download/${doc.id}`}
                    download={doc.filename}
                    className="inline-flex items-center gap-2 bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-4 py-2 rounded-xl font-medium hover:from-indigo-600 hover:to-purple-700 transition-all w-full justify-center"
                  >
                    Download
                  </a>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <FileText size={64} className="mx-auto mb-4 text-gray-500" />
              <p className="text-gray-400 text-lg">No documents uploaded yet</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CaseDetails;

