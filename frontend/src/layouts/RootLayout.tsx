import React, { useState, useEffect } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import { AlertCircle, WifiOff } from 'lucide-react';

export const RootLayout: React.FC = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const location = useLocation();

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Scroll to top on route change
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  return (
    <div className="flex flex-col min-h-screen bg-white">
      {/* Offline Status Warning Banner */}
      {!isOnline && (
        <div className="bg-amber-500 text-slate-900 px-4 py-2 text-center text-xs font-semibold flex items-center justify-center gap-2 z-50">
          <WifiOff className="w-4 h-4" />
          <span>You are currently offline. Predefined communication and emergency features continue to work.</span>
        </div>
      )}

      {/* Main Global Navigation */}
      <Navbar />

      {/* Primary Page Content */}
      <main className="flex-1">
        <Outlet />
      </main>

      {/* Floating Emergency SOS Action (Accessible everywhere) */}
      <Link
        to="/dashboard?mode=emergency"
        className="fixed bottom-6 right-6 z-40 bg-red-600 hover:bg-red-700 text-white p-3.5 sm:px-5 sm:py-3.5 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 flex items-center gap-2.5 group focus:outline-none focus:ring-4 focus:ring-red-400"
        title="Instant Emergency Speech Mode"
      >
        <AlertCircle className="w-6 h-6 animate-pulse" />
        <span className="hidden sm:inline font-bold text-sm tracking-wide">EMERGENCY SOS</span>
      </Link>

      {/* Global Footer */}
      <Footer />
    </div>
  );
};
