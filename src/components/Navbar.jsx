import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Bot, Calendar, LayoutDashboard, LogOut, Menu, Scale, Shield, UserPlus, X } from "lucide-react";
import { getCurrentUser, getRedirectPathByRole, isAuthenticated, logout } from "../api/authApi";

const Navbar = () => {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [authed, setAuthed] = useState(isAuthenticated());
  const [user, setUser] = useState(getCurrentUser());

  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);

    const syncAuthState = () => {
      setAuthed(isAuthenticated());
      setUser(getCurrentUser());
    };

    const handleLogout = () => {
      syncAuthState();
      setOpen(false);
    };

    window.addEventListener("scroll", handleScroll);
    window.addEventListener("auth:changed", syncAuthState);
    window.addEventListener("auth:logout", handleLogout);
    window.addEventListener("auth:session-expired", handleLogout);
    window.addEventListener("storage", syncAuthState);

    syncAuthState();

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("auth:changed", syncAuthState);
      window.removeEventListener("auth:logout", handleLogout);
      window.removeEventListener("auth:session-expired", handleLogout);
      window.removeEventListener("storage", syncAuthState);
    };
  }, []);

  const dashboardPath = useMemo(() => getRedirectPathByRole(user?.role), [user?.role]);

  const handleLogoutClick = () => {
    logout();
    navigate("/login", { replace: true });
  };

  const closeMenu = () => setOpen(false);
  const navLinkClass = "flex items-center gap-2 rounded-full px-3 py-2 text-sm font-medium text-slate-600 hover:bg-secondary/10 hover:text-primary";
  const buttonClass = "btn-ghost";

  if (user?.role === "lawyer") {
    return null;
  }

  return (
    <nav
      className={`fixed z-50 w-full border-b transition-all duration-300 ${
        scrolled
          ? "border-border/80 bg-white/95 shadow-float backdrop-blur"
          : "border-transparent bg-white/80 backdrop-blur"
      }`}
    >
      <div className="app-container flex items-center justify-between py-4">
        <Link to="/" className="flex items-center gap-3 text-primary" onClick={closeMenu}>
          <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary text-sm font-bold text-white shadow-glow">
            V
          </span>
          <span>
            <span className="block text-lg font-bold leading-none">VERDICTA</span>
            <span className="block text-xs font-medium uppercase tracking-[0.22em] text-secondary">Legal Services</span>
          </span>
        </Link>

        <div className="hidden items-center gap-2 md:flex">

<Link to="/lawyers" className={navLinkClass}><Scale size={18} />Lawyers</Link>
<Link to="/client-dashboard/bookings" className={navLinkClass}><Calendar size={18} />Bookings</Link>
<Link to="/ai-assistant" className={navLinkClass}><Bot size={18} />AI Assistant</Link>

          <Link to="/articles" className={navLinkClass}>
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477.943 7.5c-1.523 1.5-1.5 3.718 0 5.25L12 21l6.557-6.25c1.5-1.532 1.523-3.75 0-5.25C19.832 5.477 18.246 5 16.5 5c-.996 0-1.93.166-2.774.468z" />
            </svg>
            Articles
          </Link>


          {authed ? (
            <>
              <Link to={dashboardPath} className={navLinkClass}>
                {user?.role === "admin" ? <Shield size={18} /> : <LayoutDashboard size={18} />}
                {user?.role === "admin" ? "Admin Dashboard" : "Dashboard"}
              </Link>
              <button type="button" onClick={handleLogoutClick} className={`flex items-center gap-2 ${buttonClass}`}>
                <LogOut size={18} />Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className={buttonClass}>Login</Link>
              <Link to="/signup" className="btn-primary"><UserPlus size={18} />Sign Up</Link>
            </>
          )}
        </div>

        <button className="rounded-full border border-border bg-white p-2 text-primary shadow-sm md:hidden" onClick={() => setOpen(!open)} aria-label="Toggle menu">
          {open ? <X /> : <Menu />}
        </button>
      </div>

      {open && (
        <div className="app-container space-y-3 border-t border-border/80 bg-white pb-6 pt-4 text-sm md:hidden">

<Link to="/lawyers" className={navLinkClass} onClick={closeMenu}><Scale size={18} />Lawyers</Link>
<Link to="/client-dashboard/bookings" className={navLinkClass} onClick={closeMenu}><Calendar size={18} />Bookings</Link>
<Link to="/ai-assistant" className={navLinkClass} onClick={closeMenu}><Bot size={18} />AI Assistant</Link>

          <Link to="/articles" className={navLinkClass} onClick={closeMenu}>
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477.943 7.5c-1.523 1.5-1.5 3.718 0 5.25L12 21l6.557-6.25c1.5-1.532 1.523-3.75 0-5.25C19.832 5.477 18.246 5 16.5 5c-.996 0-1.93.166-2.774.468z" />
            </svg>
            Articles
          </Link>


          {authed ? (
            <>
              <Link to={dashboardPath} className={navLinkClass} onClick={closeMenu}>
                {user?.role === "admin" ? <Shield size={18} /> : <LayoutDashboard size={18} />}
                {user?.role === "admin" ? "Admin Dashboard" : "Dashboard"}
              </Link>
              <button type="button" onClick={handleLogoutClick} className={`flex w-full items-center gap-2 text-left ${buttonClass}`}>
                <LogOut size={18} />Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className={`flex ${buttonClass}`} onClick={closeMenu}>Login</Link>
              <Link to="/signup" className="btn-primary flex" onClick={closeMenu}>Sign Up</Link>
            </>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
