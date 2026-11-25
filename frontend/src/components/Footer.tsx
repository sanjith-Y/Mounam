import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, Globe, Shield, Volume2, ArrowUpRight } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-slate-900 text-slate-300 pt-16 pb-12 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-slate-800">
          
          {/* Brand Column */}
          <div className="lg:col-span-2 space-y-4">
            <Link to="/" className="flex items-center space-x-3 group">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-brand-purple-600 via-brand-purple-500 to-brand-blue-400 flex items-center justify-center shadow-soft">
                <Volume2 className="w-5 h-5 text-white" />
              </div>
              <span className="text-2xl font-black text-white tracking-tight">MOUNAM</span>
            </Link>
            
            <p className="text-brand-purple-300 text-sm font-bold tracking-wide">
              “Every Voice Deserves to Be Heard.”
            </p>
            
            <p className="text-slate-400 text-sm leading-relaxed max-w-sm">
              An AI-powered assistive communication platform built for individuals with speech impairments, ALS, stroke recovery, and elderly seniors to express needs through touch, gestures, and natural speech.
            </p>

            <div className="flex items-center space-x-3 pt-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-800 text-emerald-400 rounded-full text-xs font-semibold">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                Web Speech Engine Active
              </span>
              <span className="text-xs text-slate-400">Offline AAC Support</span>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h4 className="text-xs uppercase tracking-wider font-bold text-white">Platform</h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link to="/" className="hover:text-brand-purple-300 transition-colors">Home</Link>
              </li>
              <li>
                <Link to="/features" className="hover:text-brand-purple-300 transition-colors">Features</Link>
              </li>
              <li>
                <Link to="/how-it-works" className="hover:text-brand-purple-300 transition-colors">How It Works</Link>
              </li>
              <li>
                <Link to="/dashboard" className="hover:text-brand-purple-300 transition-colors flex items-center gap-1 font-semibold text-brand-purple-300">
                  <span>Communication Board</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </Link>
              </li>
              <li>
                <Link to="/dashboard?mode=emergency" className="text-red-400 hover:text-red-300 transition-colors font-bold">
                  Emergency SOS Mode
                </Link>
              </li>
            </ul>
          </div>

          {/* Organization & Legal */}
          <div className="space-y-3">
            <h4 className="text-xs uppercase tracking-wider font-bold text-white">About & Legal</h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link to="/about" className="hover:text-brand-purple-300 transition-colors">About MOUNAM</Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-brand-purple-300 transition-colors">Contact Support</Link>
              </li>
              <li>
                <Link to="/privacy" className="hover:text-brand-purple-300 transition-colors">Privacy Policy</Link>
              </li>
              <li>
                <Link to="/terms" className="hover:text-brand-purple-300 transition-colors">Terms and Conditions</Link>
              </li>
              <li>
                <Link to="/login" className="hover:text-brand-purple-300 transition-colors">Login / Sign In</Link>
              </li>
            </ul>
          </div>

          {/* Regional Languages */}
          <div className="space-y-3">
            <div className="flex items-center gap-1.5 text-xs uppercase tracking-wider font-bold text-white">
              <Globe className="w-3.5 h-3.5 text-brand-blue-400" />
              <span>Voice Languages</span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs text-slate-400">
              <span className="p-1.5 bg-slate-800/80 rounded border border-slate-700/60 text-slate-200">English</span>
              <span className="p-1.5 bg-slate-800/80 rounded border border-slate-700/60 text-slate-200">தமிழ் (Tamil)</span>
              <span className="p-1.5 bg-slate-800/80 rounded border border-slate-700/60 text-slate-200">हिन्दी (Hindi)</span>
              <span className="p-1.5 bg-slate-800/80 rounded border border-slate-700/60 text-slate-200">తెలుగు (Telugu)</span>
              <span className="p-1.5 bg-slate-800/80 rounded border border-slate-700/60 text-slate-200">മലയാളം (Mal.)</span>
              <span className="p-1.5 bg-slate-800/80 rounded border border-slate-700/60 text-slate-200">ಕನ್ನಡ (Kannada)</span>
            </div>
            <p className="text-[11px] text-slate-500 pt-1">
              SpeechSynthesis and regional Indian voice support.
            </p>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>© {new Date().getFullYear()} MOUNAM Assistive Platform. All rights reserved.</p>
          
          <div className="flex items-center space-x-6">
            <Link to="/privacy" className="hover:text-slate-400 transition-colors">
              Privacy
            </Link>
            <Link to="/terms" className="hover:text-slate-400 transition-colors">
              Terms
            </Link>
            <span className="flex items-center gap-1 text-slate-400">
              <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
              <span>Dignified AAC Care</span>
            </span>
            <span className="flex items-center gap-1 text-slate-400">
              <Shield className="w-3.5 h-3.5 text-brand-purple-400" />
              <span>100% On-Device Gestures</span>
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};
