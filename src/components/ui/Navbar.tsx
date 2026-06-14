import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { useThemeStore } from '../../store/themeStore';
import { useAuth } from '../../hooks/useAuth';
import {
  Home, Search, LogOut, User, Building2, ShieldCheck,
  LayoutDashboard, Menu, X, Sun, Moon,
} from 'lucide-react';
import { useState } from 'react';
import { AVATAR_IMAGE_FALLBACK, setImageFallback } from '../../utils/imageFallbacks';

export const Navbar = () => {
  const { user } = useAuthStore();
  const { signOut, isSignOutPending } = useAuth();
  const { theme, toggleTheme } = useThemeStore();
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  /* Smooth-scroll to a landing-page section from anywhere in the app */
  const handleHashNav = (sectionId: string) => {
    setMobileOpen(false);
    if (location.pathname === '/') {
      const el = document.getElementById(sectionId);
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    } else {
      navigate('/');
      setTimeout(() => {
        const el = document.getElementById(sectionId);
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }, 350);
    }
  };

  const roleLinks = {
    tenant: [
      { to: '/tenant/dashboard', label: 'Dashboard', icon: LayoutDashboard },
      { to: '/tenant/profile',   label: 'Profile',   icon: User },
    ],
    landlord: [
      { to: '/landlord/dashboard',      label: 'Dashboard',  icon: LayoutDashboard },
      { to: '/landlord/listings/new',   label: 'New Listing', icon: Building2 },
      { to: '/landlord/inquiries',      label: 'Inquiries',  icon: Search },
    ],
    admin: [
      { to: '/admin/dashboard', label: 'Admin Panel', icon: ShieldCheck },
    ],
  };

  const authenticatedLinks = user ? (roleLinks[user.role] || []) : [];

  const navLinkCls =
    'text-sm font-semibold text-slate-600 dark:text-slate-300 hover:text-primary transition-colors';
  const mobileNavLinkCls =
    'block px-3 py-2.5 text-sm font-medium text-slate-700 dark:text-slate-300 hover:text-primary hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg';

  return (
    <header className="sticky top-0 z-50 w-full bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border-b border-slate-200 dark:border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-20 flex items-center justify-between gap-4">

        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 shrink-0">
          <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
            <Home className="h-5 w-5 text-primary" />
          </div>
          <span className="font-bold text-slate-900 dark:text-white text-xl tracking-tight">
            Rent<span className="text-primary">Ease</span>
          </span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-6">
          <Link to="/" className={navLinkCls}>Home</Link>
          <Link to="/listings" className={navLinkCls}>Browse Properties</Link>
          <button onClick={() => handleHashNav('faq')} className={`${navLinkCls} cursor-pointer bg-transparent border-0 p-0`}>
            FAQ
          </button>
          {!user && (
            <>
              <button onClick={() => handleHashNav('how-it-works')} className={`${navLinkCls} cursor-pointer bg-transparent border-0 p-0`}>
                How it works
              </button>
              <button onClick={() => handleHashNav('about')} className={`${navLinkCls} cursor-pointer bg-transparent border-0 p-0`}>
                About
              </button>
            </>
          )}
          {authenticatedLinks.map((link) => (
            <Link key={link.to} to={link.to} className={`flex items-center gap-1.5 ${navLinkCls}`}>
              <link.icon className="h-4 w-4" />
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Right Actions */}
        <div className="hidden md:flex items-center gap-3">
          <button
            onClick={toggleTheme}
            aria-label="Toggle theme"
            className="p-2 rounded-xl text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </button>

          {!user ? (
            <>
              <Link to="/login" className="px-5 py-2.5 text-sm font-semibold text-slate-700 dark:text-slate-200 hover:text-primary transition-colors">
                Sign In
              </Link>
              <Link to="/register" className="px-6 py-2.5 text-sm font-bold border border-primary text-primary hover:bg-primary hover:text-white rounded-xl transition-colors shadow-sm">
                Get Started
              </Link>
            </>
          ) : (
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-full">
                <img
                  src={user.avatar_url || `https://api.dicebear.com/7.x/adventurer-neutral/svg?seed=${user.full_name}`}
                  alt={user.full_name || 'User'}
                  className="w-7 h-7 rounded-full bg-slate-200"
                  onError={(e) => setImageFallback(e, AVATAR_IMAGE_FALLBACK)}
                />
                <span className="text-sm font-semibold text-slate-700 dark:text-slate-200 max-w-[100px] truncate">
                  {user.full_name || 'User'}
                </span>
              </div>
              <button
                onClick={() => signOut()}
                disabled={isSignOutPending}
                className="flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-colors cursor-pointer"
              >
                <LogOut className="h-4 w-4" />
                Sign Out
              </button>
            </div>
          )}
        </div>

        {/* Mobile: theme toggle + hamburger */}
        <div className="md:hidden flex items-center gap-2">
          <button onClick={toggleTheme} aria-label="Toggle theme" className="p-2 rounded-xl text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer">
            {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </button>
          <button className="p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:text-primary hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer" onClick={() => setMobileOpen(!mobileOpen)}>
            {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="md:hidden bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 px-4 py-4 space-y-1 shadow-xl absolute w-full left-0 z-50">
          <Link to="/" onClick={() => setMobileOpen(false)} className={mobileNavLinkCls}>Home</Link>
          <Link to="/listings" onClick={() => setMobileOpen(false)} className={`flex items-center gap-2 ${mobileNavLinkCls}`}>
            <Search className="h-4 w-4" /> Browse Properties
          </Link>
          <button onClick={() => handleHashNav('faq')} className={`w-full text-left ${mobileNavLinkCls} cursor-pointer`}>FAQ</button>
          {!user && (
            <>
              <button onClick={() => handleHashNav('how-it-works')} className={`w-full text-left ${mobileNavLinkCls} cursor-pointer`}>How it works</button>
              <button onClick={() => handleHashNav('about')} className={`w-full text-left ${mobileNavLinkCls} cursor-pointer`}>About</button>
            </>
          )}
          {authenticatedLinks.map((link) => (
            <Link key={link.to} to={link.to} onClick={() => setMobileOpen(false)} className={`flex items-center gap-2 ${mobileNavLinkCls}`}>
              <link.icon className="h-4 w-4" /> {link.label}
            </Link>
          ))}
          <div className="border-t border-slate-100 dark:border-slate-800 pt-3 mt-2 space-y-2">
            {!user ? (
              <>
                <Link to="/login" onClick={() => setMobileOpen(false)} className="block w-full text-center py-2.5 text-sm font-semibold text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800">
                  Sign In
                </Link>
                <Link to="/register" onClick={() => setMobileOpen(false)} className="block w-full text-center py-2.5 text-sm font-bold bg-primary text-white rounded-xl">
                  Get Started
                </Link>
              </>
            ) : (
              <button onClick={() => { signOut(); setMobileOpen(false); }} className="w-full flex items-center justify-center gap-2 py-2.5 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl font-semibold cursor-pointer">
                <LogOut className="h-4 w-4" /> Sign Out
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
