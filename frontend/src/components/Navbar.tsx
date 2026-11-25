import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Menu,
  X,
  MessageSquare,
  AlertCircle,
  ArrowRight,
  ShieldCheck,
  Volume2,
  Sparkles
} from 'lucide-react';
import { Button } from './Button';

export const Navbar: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'Home', path: '/', sectionId: 'hero' },
    { name: 'Features', path: '/features', sectionId: 'features' },
    { name: 'How It Works', path: '/how-it-works', sectionId: 'how-it-works' },
    { name: 'About', path: '/about', sectionId: 'about' },
    { name: 'Contact', path: '/contact', sectionId: 'contact' },
  ];

  const handleNavClick = (link: { name: string; path: string; sectionId: string }) => {
    setMobileMenuOpen(false);
    if (location.pathname === '/') {
      const el = document.getElementById(link.sectionId);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
        return;
      }
    }
    navigate(link.path);
  };

  const isLinkActive = (path: string) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-white/95 backdrop-blur-md shadow-soft-sm border-b border-slate-200/80 py-2'
          : 'bg-white border-b border-slate-100 py-3'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-18">
          
          {/* LEFT: MOUNAM logo with modern communication icon */}
          <Link
            to="/"
            className="flex items-center space-x-3 group shrink-0"
            onClick={() => setMobileMenuOpen(false)}
          >
            <div className="relative w-11 h-11 rounded-2xl bg-gradient-to-tr from-brand-purple-900 via-brand-purple-700 to-brand-blue-500 flex items-center justify-center shadow-soft group-hover:scale-105 transition-transform duration-200">
              {/* Modern communication soundwave icon overlay */}
              <Volume2 className="w-5 h-5 text-white stroke-[2.5]" />
              <span className="absolute -top-1 -right-1 flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-blue-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-brand-blue-500"></span>
              </span>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-2xl font-black tracking-tight text-slate-900 group-hover:text-brand-purple-800 transition-colors">
                  MOUNAM
                </span>
                <span className="hidden xl:inline-block px-2 py-0.5 text-[10px] font-bold bg-brand-purple-100 text-brand-purple-800 rounded-full">
                  AI AAC
                </span>
              </div>
              <span className="hidden sm:block text-[10px] font-semibold tracking-wider text-brand-purple-600 uppercase">
                Every Voice Deserves to Be Heard
              </span>
            </div>
          </Link>

          {/* CENTER: Navigation Links */}
          <nav className="hidden md:flex items-center space-x-1 lg:space-x-2">
            {navLinks.map((link) => (
              <button
                key={link.name}
                onClick={() => handleNavClick(link)}
                className={`px-3.5 py-2 rounded-xl text-sm font-semibold transition-all duration-150 ${
                  isLinkActive(link.path)
                    ? 'text-brand-purple-900 bg-brand-purple-50 shadow-xs'
                    : 'text-slate-600 hover:text-brand-purple-800 hover:bg-slate-50'
                }`}
              >
                {link.name}
              </button>
            ))}
          </nav>

          {/* RIGHT: Login & Get Started Buttons */}
          <div className="hidden md:flex items-center space-x-3">
            {/* Quick SOS Mode Indicator */}
            <Link
              to="/dashboard?mode=emergency"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-red-700 bg-red-50 hover:bg-red-100 rounded-xl border border-red-200 transition-colors"
              title="Quick Emergency Speech Mode"
            >
              <AlertCircle className="w-3.5 h-3.5 text-red-600 animate-pulse" />
              <span>SOS Mode</span>
            </Link>

            <Link
              to="/login"
              className="text-sm font-bold text-slate-700 hover:text-brand-purple-900 px-3.5 py-2 transition-colors rounded-xl hover:bg-slate-50"
            >
              Login
            </Link>

            <Button
              to="/dashboard"
              variant="primary"
              size="md"
              icon={<MessageSquare className="w-4 h-4" />}
            >
              Get Started
            </Button>
          </div>

          {/* Mobile menu trigger */}
          <div className="flex md:hidden items-center space-x-2">
            <Link
              to="/dashboard?mode=emergency"
              className="p-2 text-red-600 bg-red-50 rounded-xl border border-red-200"
              aria-label="Emergency Mode"
            >
              <AlertCircle className="w-5 h-5" />
            </Link>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2.5 rounded-xl text-slate-700 hover:text-brand-purple-900 hover:bg-slate-100 transition-colors focus:outline-none focus:ring-2 focus:ring-brand-purple-500"
              aria-label="Toggle Navigation Menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-b border-slate-200 px-4 pt-3 pb-6 space-y-3 shadow-soft-xl animate-in slide-in-from-top-3">
          <div className="grid grid-cols-1 gap-1">
            {navLinks.map((link) => (
              <button
                key={link.name}
                onClick={() => handleNavClick(link)}
                className={`w-full text-left px-4 py-3 rounded-xl text-base font-bold flex items-center justify-between ${
                  isLinkActive(link.path)
                    ? 'text-brand-purple-900 bg-brand-purple-50'
                    : 'text-slate-700 hover:bg-slate-50'
                }`}
              >
                <span>{link.name}</span>
                <ArrowRight className="w-4 h-4 text-slate-400" />
              </button>
            ))}
          </div>

          <div className="pt-3 border-t border-slate-100 flex flex-col gap-2.5">
            <Link
              to="/dashboard?mode=emergency"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-red-50 text-red-700 rounded-xl border border-red-200 font-bold text-sm"
            >
              <AlertCircle className="w-4 h-4 text-red-600" />
              <span>Instant Emergency SOS Alert</span>
            </Link>

            <div className="grid grid-cols-2 gap-2">
              <Button
                to="/login"
                variant="outline"
                size="md"
                className="w-full"
                onClick={() => setMobileMenuOpen(false)}
              >
                Login
              </Button>
              <Button
                to="/register"
                variant="secondary"
                size="md"
                className="w-full"
                onClick={() => setMobileMenuOpen(false)}
              >
                Register
              </Button>
            </div>

            <Button
              to="/dashboard"
              variant="primary"
              size="lg"
              className="w-full"
              icon={<Sparkles className="w-5 h-5" />}
              onClick={() => setMobileMenuOpen(false)}
            >
              Get Started Now
            </Button>
          </div>

          <div className="pt-2 text-center text-xs text-slate-400 flex items-center justify-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>Accessible • Multilingual • Privacy First</span>
          </div>
        </div>
      )}
    </header>
  );
};
