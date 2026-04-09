import { useNavigate } from "react-router-dom"
import { LayoutDashboard, Calendar, MessageCircle, Gavel, BookOpen, FileText, User, LogOut } from "lucide-react"
import { getCurrentUser, logout } from "../api/authApi"

const LawyerNavbar = () => {
  const navigate = useNavigate()
  const user = getCurrentUser()

  const navItems = [
    { icon: LayoutDashboard, label: "Dashboard", path: "/lawyer-dashboard" },
    { icon: Calendar, label: "Meetings", path: "/lawyer-dashboard/meetings" },
    { icon: FileText, label: "Cases", path: "/lawyer-dashboard/cases" },
    { icon: MessageCircle, label: "Chat", path: "/lawyer-dashboard/chat" },
    { icon: MessageCircle, label: "Pending Advice", path: "/lawyer-dashboard/advice" },
    { icon: Gavel, label: "Judges Corner", path: "/lawyer-dashboard/judges" },
    { icon: BookOpen, label: "Articles", path: "/articles" },
    { icon: User, label: "Profile", path: "/lawyer-dashboard/profile" },
  ]

  const handleLogout = () => {
    logout()
    navigate("/login")
  }

  return (
    <div className="w-64 bg-slate-900 min-h-screen p-6 space-y-6 text-white shadow-2xl">
      {/* Header */}
      <div className="text-center border-b pb-6">
        <h2 className="text-2xl font-bold">Lawyer Portal</h2>
        {user.name && <p className="text-sm opacity-75 mt-1">{user.name}</p>}
      </div>

      {/* Nav Links */}
      <nav className="space-y-2">
        {navItems.map(({ icon: Icon, label, path }) => (
          <button
            key={path}
            onClick={() => navigate(path)}
            className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-slate-800 transition-all group"
          >
            <Icon size={20} className="group-hover:text-yellow-400" />
            <span>{label}</span>
          </button>
        ))}
      </nav>

      {/* Logout */}
      <button
        onClick={handleLogout}
        className="w-full flex items-center gap-3 p-3 mt-auto rounded-xl bg-red-600/30 hover:bg-red-600 text-red-100 transition-all"
      >
        <LogOut size={20} />
        <span>Logout</span>
      </button>
    </div>
  )
}

export default LawyerNavbar
