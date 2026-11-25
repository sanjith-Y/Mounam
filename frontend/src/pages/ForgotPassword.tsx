import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Mail,
  ArrowLeft,
  AlertCircle,
  Volume2,
  KeyRound,
  Info
} from 'lucide-react';
import { Button } from '../components/Button';
import { apiService } from '../services/api';

export const ForgotPassword: React.FC = () => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<{
    type: 'info' | 'error';
    text: string;
  } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validate = () => {
    if (!email.trim()) {
      setError('Email address is required.');
      return false;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      setError('Please enter a valid email address (e.g. name@example.com).');
      return false;
    }
    setError(null);
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatusMessage(null);

    if (!validate()) {
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await apiService.forgotPassword(email.trim());
      // Informative transparent message as required: do NOT display a fake "Email sent!" message
      setStatusMessage({
        type: 'info',
        text: res.message || `Password reset request received for ${email.trim()}. Real email dispatch requires the Firebase Authentication service credentials configured in Phase 4.`
      });
    } catch {
      setStatusMessage({
        type: 'error',
        text: 'Unable to communicate with the authentication server. Please check your network or try again later.'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="py-12 sm:py-20 max-w-lg mx-auto px-4 sm:px-6">
      
      {/* Top Back to Home navigation */}
      <div className="mb-6">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-brand-purple-900 transition-colors group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          <span>Back to Home</span>
        </Link>
      </div>

      <div className="bg-white rounded-3xl p-8 sm:p-10 border border-slate-200/90 shadow-soft-xl space-y-6">
        
        {/* Brand Header */}
        <div className="text-center space-y-3">
          <Link to="/" className="inline-flex items-center justify-center">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-brand-purple-900 via-brand-purple-700 to-brand-blue-500 flex items-center justify-center shadow-soft-sm hover:scale-105 transition-transform duration-200">
              <Volume2 className="w-7 h-7 text-white stroke-[2.5]" />
            </div>
          </Link>
          
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Reset Your Password
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-sm mx-auto">
              Enter the email address registered with your MOUNAM account to receive recovery instructions.
            </p>
          </div>
        </div>

        {/* Status notification */}
        {statusMessage && (
          <div
            className={`p-4 rounded-2xl text-xs font-medium flex items-start gap-2.5 border animate-in fade-in ${
              statusMessage.type === 'error'
                ? 'bg-red-50 text-red-800 border-red-200'
                : 'bg-brand-blue-50 text-brand-blue-900 border-brand-blue-200'
            }`}
          >
            {statusMessage.type === 'error' ? (
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
            ) : (
              <Info className="w-4 h-4 text-brand-blue-600 shrink-0 mt-0.5" />
            )}
            <p className="leading-relaxed">{statusMessage.text}</p>
          </div>
        )}

        {/* Reset Request Form */}
        <form onSubmit={handleSubmit} noValidate className="space-y-4">
          <div>
            <label
              htmlFor="resetEmail"
              className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2"
            >
              Registered Email Address <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5 pointer-events-none" />
              <input
                id="resetEmail"
                type="email"
                autoComplete="email"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (error) setError(null);
                }}
                className={`w-full pl-10 pr-4 py-3 rounded-xl border text-sm transition-all focus:outline-none focus:ring-2 ${
                  error
                    ? 'border-red-400 bg-red-50/30 focus:ring-red-500'
                    : 'border-slate-200 bg-white focus:ring-brand-purple-600'
                }`}
              />
            </div>
            {error && (
              <p className="mt-1.5 text-xs text-red-600 flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                <span>{error}</span>
              </p>
            )}
          </div>

          <Button
            type="submit"
            variant="primary"
            size="lg"
            className="w-full shadow-soft hover:shadow-soft-md"
            icon={<KeyRound className="w-4 h-4" />}
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Checking System...' : 'Send Reset Link'}
          </Button>
        </form>

        {/* Back to Login link */}
        <div className="pt-2 text-center text-xs text-slate-500">
          Remembered your password?{' '}
          <Link
            to="/login"
            className="font-bold text-brand-purple-800 hover:text-brand-purple-900 hover:underline"
          >
            Back to Login
          </Link>
        </div>

        {/* Phase 4 Note */}
        <div className="pt-3 border-t border-slate-100 text-center text-[11px] text-slate-400">
          <span>Firebase Authentication email dispatch will be configured in Phase 4</span>
        </div>

      </div>
    </div>
  );
};
