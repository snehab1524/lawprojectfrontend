import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { Search, Briefcase, User, Scale } from "lucide-react";
import { getCurrentUser } from "../../api/authApi";
import { getClientCases } from "../../api/caseApi";

const statusColors = {
  open: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
  "in-progress": "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  closed: "bg-slate-500/20 text-slate-400 border-slate-500/30",
};

const priorityColors = {
  low: "bg-green-500/20 text-green-400",
  medium: "bg-yellow-500/20 text-yellow-400",
  high: "bg-red-500/20 text-red-400",
};

const MyCases = () => {
  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const user = getCurrentUser();

  const fetchCases = useCallback(async () => {
    if (!user?.id) return;
    try {
      setLoading(true);
      const { items } = await getClientCases(user.id);
      setCases(items);
    } catch (err) {
      console.error('Failed to fetch client cases:', err);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    fetchCases();
  }, [fetchCases]);

  const filteredCases = cases.filter((caseItem) =>
    caseItem.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (caseItem.lawyer?.User?.name || caseItem.lawyerName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    caseItem.caseType.toLowerCase().includes(searchTerm.toLowerCase())
  ).filter((caseItem) => !filterStatus || caseItem.status === filterStatus);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-200 flex items-center justify-center">
        <div className="text-xl text-gray-600">Loading your cases...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-200 p-8 pt-20">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-12">
          <div>
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent mb-4">
              My Cases
            </h1>
            <p className="text-xl text-gray-600">Track all your legal cases and updates</p>
          </div>
        </div>

        {/* Search & Filter */}
        <div className="bg-white/80 backdrop-blur-xl border border-gray-200 rounded-3xl p-6 mb-8 shadow-xl">
          <div className="grid md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search cases, lawyers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-2xl text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
              />
            </div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="md:col-span-2 bg-white border border-gray-200 rounded-2xl px-4 py-3 text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
            >
              <option value="">All Statuses</option>
              <option value="open">Open</option>
              <option value="in-progress">In Progress</option>
              <option value="closed">Closed</option>
            </select>
          </div>
        </div>

        {filteredCases.length === 0 ? (
          <div className="text-center py-32">
            <div className="w-32 h-32 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-3xl mx-auto mb-8 flex items-center justify-center shadow-2xl">
              <Briefcase className="w-16 h-16 text-white" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">No cases yet</h2>
            <p className="text-xl text-gray-600 mb-8">Book a lawyer consultation to create your first case.</p>
            <Link
              to="/client-dashboard/bookings"
              className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white px-8 py-4 rounded-2xl font-bold text-lg shadow-xl hover:shadow-2xl transition-all"
            >
              Find Lawyers
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredCases.map((caseItem) => (
              <Link key={caseItem.id} to={`/client-dashboard/cases/${caseItem.id}`} className="group">

                <div className="group bg-white shadow-xl hover:shadow-2xl border border-gray-200 hover:border-blue-300 rounded-3xl p-8 hover:-translate-y-2 transition-all duration-300 h-full">
                  <div className="flex justify-between items-start mb-6">
                    <h3 className="text-2xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-2">
                      {caseItem.title}
                    </h3>
                    <span className={`px-3 py-2 rounded-full text-sm font-bold ${statusColors[caseItem.status] || 'bg-gray-500/20 text-gray-400'}`}>
                      {caseItem.status?.replace('-', ' ').toUpperCase() || 'Unknown'}
                    </span>
                  </div>
                  
                  <p className="text-gray-700 mb-6 line-clamp-3 leading-relaxed">{caseItem.description}</p>
                  
<div className="space-y-3 mb-6">
                    <div className="flex items-center gap-3 text-sm">
                      <User className="w-4 h-4 text-blue-500" />
                      <span className="font-semibold text-gray-900">
                        {caseItem.lawyer?.User?.name || caseItem.lawyerName || 'Lawyer'}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-sm">
                      <Scale className="w-4 h-4 text-blue-500" />
                      <span className="font-semibold text-gray-900 capitalize">{caseItem.caseType}</span>
                    </div>
                    {caseItem.bookingId && (
                      <div className="flex items-center gap-3 text-sm text-gray-600">
                        <span className="w-4 h-4 text-gray-400">📅</span>
                        <span>From Booking #{caseItem.bookingId}</span>
                      </div>
                    )}
                  </div>

                  <div className="flex gap-3">
                    <span className={`flex-1 px-3 py-1 rounded-full text-xs font-bold ${priorityColors[caseItem.priority] || 'bg-gray-500/20 text-gray-400'}`}>
                      {caseItem.priority?.toUpperCase() || 'MED'}
                    </span>
                    <div className="ml-auto flex gap-2">
                      <span className="text-xs text-gray-500 px-3 py-1 bg-gray-100 rounded-full">
                        Updated {new Date(caseItem.updatedAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyCases;

