import React, { useState } from 'react';
import { Upload, FileText, Download, Trash2, Loader2 } from 'lucide-react';
import { uploadDocument, getDocumentsByCase, deleteDocument } from '../api/documentApi';

const CaseDocuments = ({ caseId, userId, isLawyer }) => {
  const [documents, setDocuments] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [file, setFile] = useState(null);

  const fetchDocuments = async () => {
    try {
      const { items } = await getDocumentsByCase(caseId);
      setDocuments(items);
    } catch (err) {
      console.error('Failed to fetch documents:', err);
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);
    formData.append('caseId', caseId);

    try {
      setUploading(true);
      await uploadDocument(formData);
      setFile(null);
      fetchDocuments();
    } catch (err) {
      console.error('Upload failed:', err);
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (docId) => {
    if (!confirm('Delete this document?')) return;
    try {
      await deleteDocument(docId);
      setDocuments(documents.filter(d => d.id !== docId));
    } catch (err) {
      console.error('Delete failed:', err);
    }
  };

  React.useEffect(() => {
    fetchDocuments();
  }, [caseId]);

  return (
    <div className="space-y-6">
      <h3 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
        <FileText className="w-8 h-8" />
        Case Documents
      </h3>

      {/* Upload Form */}
      <form onSubmit={handleUpload} className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-xl rounded-2xl p-6 border border-gray-200 dark:border-slate-700 shadow-xl">
        <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Upload Document (PDF, Images - max 10MB)
            </label>
            <input
              type="file"
              onChange={(e) => setFile(e.target.files[0])}
              accept="image/*,application/pdf"
              className="w-full p-3 bg-gray-50 dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-xl text-gray-900 dark:text-white file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-blue-50 dark:file:bg-slate-600 file:text-blue-700 dark:file:text-blue-300 hover:file:bg-blue-100 dark:hover:file:bg-slate-500 transition-colors"
              disabled={uploading}
            />
            {file && (
              <p className="text-sm text-gray-500 mt-1">{file.name} ({(file.size / 1024 / 1024).toFixed(1)} MB)</p>
            )}
          </div>
          <button
            type="submit"
            disabled={!file || uploading}
            className="flex items-center gap-2 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 disabled:opacity-50 text-white px-8 py-3 rounded-xl font-bold shadow-lg hover:shadow-xl transition-all whitespace-nowrap flex-shrink-0"
          >
            {uploading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Upload className="w-5 h-5" />}
            {uploading ? 'Uploading...' : 'Upload Document'}
          </button>
        </div>
      </form>

      {/* Documents List */}
      {documents.length === 0 ? (
        <div className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-slate-800/50 dark:to-slate-900/50 rounded-2xl p-8 text-center border-2 border-dashed border-gray-200 dark:border-slate-700">
          <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h4 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">No documents</h4>
          <p className="text-gray-500 dark:text-gray-400">Upload files to keep all case documents organized</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {documents.map((doc) => (
            <div key={doc.id} className="group bg-white/70 dark:bg-slate-800/70 backdrop-blur-xl rounded-2xl p-6 border border-gray-200 dark:border-slate-700 shadow-xl hover:shadow-2xl transition-all hover:-translate-y-1">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center flex-shrink-0">
                  <FileText className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-bold text-gray-900 dark:text-white truncate">{doc.filename}</h4>
                  <p className="text-sm text-gray-500 dark:text-gray-400 truncate">{doc.mimeType}</p>
                </div>
                <span className="text-xs bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-200 px-2 py-1 rounded-full font-medium">
                  {(doc.size / 1024).toFixed(0)} KB
                </span>
              </div>
              <div className="flex items-center gap-2">
                <a
                  href={`/api/documents/download/${doc.id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white px-4 py-2 rounded-xl font-medium text-center shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 group-hover:scale-105"
                >
                  <Download className="w-4 h-4" />
                  Download
                </a>
                {(doc.uploadedBy === userId || isLawyer) && (
                  <button
                    onClick={() => handleDelete(doc.id)}
                    className="p-2 hover:bg-red-500/20 hover:text-red-500 rounded-xl transition-colors"
                    title="Delete document"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CaseDocuments;

