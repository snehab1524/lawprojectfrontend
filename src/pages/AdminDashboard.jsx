import { useEffect, useState } from "react"
import { getCurrentUser } from "../api/authApi"
import { getDashboardStats } from "../api/caseApi"

const AdminDashboard = () => {
  const [user, setUser] = useState(null)
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const currentUser = getCurrentUser()
    setUser(currentUser)
    if (currentUser?.role === "admin") {
      getDashboardStats().then(setStats).catch(err => {
        setError(err.response?.data?.message || 'Failed to load stats')
      }).finally(() => setLoading(false))
    }
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center">
        <div className="text-white text-xl">Loading Admin Dashboard...</div>
      </div>
    )
  }

  if (!user || user.role !== "admin") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center">
        <div className="bg-red-500/20 backdrop-blur-xl p-8 rounded-2xl border border-red-500/30 text-center max-w-md mx-4">
          <h1 className="text-4xl font-bold text-red-400 mb-4">Admin Access Denied</h1>
          <p className="text-red-200 mb-6">Admin role required</p>
          <a href="/login" className="inline-block bg-red-500 hover:bg-red-600 text-white px-6 py-3 rounded-xl font-medium transition-all">
            Login as Admin
          </a>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-gray-900 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold text-white mb-8 text-center">Admin Dashboard</h1>
        
        {error && (
          <div className="bg-red-500/20 border border-red-500/30 text-red-200 p-4 rounded-xl mb-6 text-center">
            {error}
            <button 
              onClick={() => window.location.reload()} 
              className="ml-4 bg-red-500 hover:bg-red-600 px-4 py-1 rounded text-sm"
            >
              Retry
            </button>
          </div>
        )}

        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            <div className="bg-gradient-to-br from-indigo-500 to-blue-600 text-white p-6 rounded-2xl shadow-2xl">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <p className="text-indigo-100 text-sm opacity-90">Platform Total Cases</p>
                  <p className="text-3xl font-bold">{stats.totalCases}</p>
                </div>
                <div className="p-3 bg-indigo-400/30 rounded-xl">
                  <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                  </svg>
                </div>
              </div>
            </div>
            <div className="bg-gradient-to-br from-emerald-500 to-teal-600 text-white p-6 rounded-2xl shadow-2xl">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <p className="text-emerald-100 text-sm opacity-90">Active Platform Cases</p>
                  <p className="text-3xl font-bold">{stats.activeCases}</p>
                </div>
                <div className="p-3 bg-emerald-400/30 rounded-xl">
                  <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              </div>
            </div>
            <div className="bg-gradient-to-br from-purple-500 to-pink-600 text-white p-6 rounded-2xl shadow-2xl">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <p className="text-purple-100 text-sm opacity-90">Closed Platform Cases</p>
                  <p className="text-3xl font-bold">{stats.closedCases}</p>
                </div>
                <div className="p-3 bg-purple-400/30 rounded-xl">
                  <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 102 0V6z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
            </div>
            <div className="bg-gradient-to-br from-amber-500 to-orange-600 text-white p-6 rounded-2xl shadow-2xl">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <p className="text-amber-100 text-sm opacity-90">Upcoming Platform Hearings</p>
                  <p className="text-3xl font-bold">{stats.upcomingHearings}</p>
                </div>
                <div className="p-3 bg-amber-400/30 rounded-xl">
                  <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 102 0V6z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-8">
          <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700 rounded-2xl p-8 text-center">
            <h2 className="text-2xl font-bold text-white mb-4">Admin Tools</h2>
            <a href="/admin-panel" className="text-xl text-indigo-400 hover:text-indigo-300">Manage Platform →</a>
          </div>
          <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700 rounded-2xl p-8 text-center">
            <h2 className="text-2xl font-bold text-white mb-4">Judges Management</h2>
            <a href="/admin-judges" className="text-xl text-emerald-400 hover:text-emerald-300">Manage Judges →</a>
          </div>
          <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700 rounded-2xl p-8 text-center">
            <h2 className="text-2xl font-bold text-white mb-4">Users Overview</h2>
            <p className="text-gray-400">Coming soon</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <h2 className="text-2xl font-bold text-white mb-6">Recent Platform Activity</h2>
            <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700 rounded-2xl p-8 text-gray-400">
              Activity feed coming soon...
            </div>
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white mb-6">Quick Stats</h2>
            <div className="space-y-4 text-sm">
              <div className="flex justify-between">
                <span>Clients</span>
                <span className="font-bold text-emerald-400">--</span>
              </div>
              <div className="flex justify-between">
                <span>Lawyers</span>
                <span className="font-bold text-emerald-400">--</span>
              </div>
              <div className="flex justify-between">
                <span>Bookings</span>
                <span className="font-bold text-emerald-400">--</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AdminDashboard
