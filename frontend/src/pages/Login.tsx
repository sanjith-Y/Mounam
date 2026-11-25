import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  LogIn,
  User,
  HeartHandshake,
  Lock,
  Mail,
  Eye,
  EyeOff,
  ArrowLeft,
  AlertCircle,
  CheckCircle2,
  Volume2
} from 'lucide-react';
import { Button } from '../components/Button';
import { apiService } from '../services/api';

export const Login: React.FC = () => {
  const [userType, setUserType] = useState<'individual' | 'caregiver'>('individual');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  // Validation errors
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [submissionFeedback, setSubmissionFeedback] = useState<{
    type: 'success' | 'info' | 'error';
    message: string;
  } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const navigate = useNavigate();

  const validate = () => {
    const newErrors: { email?: string; password?: string } = {};

    // Email validation
    if (!email.trim()) {
      newErrors.email = 'Email address is required.';
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email.trim())) {
        newErrors.email = 'Please enter a valid email address (e.g. name@example.com).';
      }
    }

    // Password validation
    if (!password) {
      newErrors.password = 'Password is required.';
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmissionFeedback(null);

    if (!validate()) {
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await apiService.login({
        email: email.trim(),
        password,
        remember_me: rememberMe
      });

      setSubmissionFeedback({
        type: 'info',
        message: res.message || 'Form validation passed. Firebase Authentication integration activates in Step 4.'
      });

      // After giving clear feedback, route to communication dashboard
      setTimeout(() => {
        navigate('/dashboard');
      }, 1200);
    } catch {
      setSubmissionFeedback({
        type: 'error',
        message: 'An error occurred during submission. Please try again.'
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
        
        {/* Brand Logo & Header */}
        <div className="text-center space-y-3">
          <Link to="/" className="inline-flex items-center justify-center">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-brand-purple-900 via-brand-purple-700 to-brand-blue-500 flex items-center justify-center shadow-soft-sm hover:scale-105 transition-transform duration-200">
              <Volume2 className="w-7 h-7 text-white stroke-[2.5]" />
            </div>
          </Link>
          
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Welcome Back
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Sign in to your MOUNAM assistive communication account
            </p>
          </div>
        </div>

        {/* User Role Switcher: Individual vs Caregiver */}
        <div className="grid grid-cols-2 p-1 bg-slate-100 rounded-2xl gap-1">
          <button
            type="button"
            onClick={() => setUserType('individual')}
            className={`py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
              userType === 'individual'
                ? 'bg-white text-brand-purple-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <User className="w-3.5 h-3.5" />
            <span>Individual</span>
          </button>

          <button
            type="button"
            onClick={() => setUserType('caregiver')}
            className={`py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
              userType === 'caregiver'
                ? 'bg-white text-brand-purple-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <HeartHandshake className="w-3.5 h-3.5" />
            <span>Caregiver</span>
          </button>
        </div>

        {/* Informational Feedback banner if active */}
        {submissionFeedback && (
          <div
            className={`p-4 rounded-2xl text-xs font-medium flex items-start gap-2.5 border animate-in fade-in ${
              submissionFeedback.type === 'error'
                ? 'bg-red-50 text-red-800 border-red-200'
                : 'bg-brand-purple-50 text-brand-purple-900 border-brand-purple-200'
            }`}
          >
            {submissionFeedback.type === 'error' ? (
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
            ) : (
              <CheckCircle2 className="w-4 h-4 text-brand-purple-700 shrink-0 mt-0.5" />
            )}
            <p className="leading-relaxed">{submissionFeedback.message}</p>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleLogin} noValidate className="space-y-4">
          
          {/* Email Address */}
          <div>
            <label
              htmlFor="email"
              className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2"
            >
              Email Address <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5 pointer-events-none" />
              <input
                id="email"
                type="email"
                autoComplete="email"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (errors.email) setErrors({ ...errors, email: undefined });
                }}
                className={`w-full pl-10 pr-4 py-3 rounded-xl border text-sm transition-all focus:outline-none focus:ring-2 ${
                  errors.email
                    ? 'border-red-400 bg-red-50/30 focus:ring-red-500 focus:border-red-500'
                    : 'border-slate-200 bg-white focus:ring-brand-purple-600 focus:border-brand-purple-600'
                }`}
              />
            </div>
            {errors.email && (
              <p className="mt-1.5 text-xs text-red-600 flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                <span>{errors.email}</span>
              </p>
            )}
          </div>

          {/* Password with Show/Hide toggle */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label
                htmlFor="password"
                className="block text-xs font-bold text-slate-700 uppercase tracking-wider"
              >
                Password <span className="text-red-500">*</span>
              </label>
              <Link
                to="/forgot-password"
                className="text-xs font-semibold text-brand-purple-700 hover:text-brand-purple-900 hover:underline"
              >
                Forgot Password?
              </Link>
            </div>
            
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5 pointer-events-none" />
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (errors.password) setErrors({ ...errors, password: undefined });
                }}
                className={`w-full pl-10 pr-11 py-3 rounded-xl border text-sm transition-all focus:outline-none focus:ring-2 ${
                  errors.password
                    ? 'border-red-400 bg-red-50/30 focus:ring-red-500 focus:border-red-500'
                    : 'border-slate-200 bg-white focus:ring-brand-purple-600 focus:border-brand-purple-600'
                }`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3 p-1 rounded-lg text-slate-400 hover:text-slate-700 focus:outline-none"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {errors.password && (
              <p className="mt-1.5 text-xs text-red-600 flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                <span>{errors.password}</span>
              </p>
            )}
          </div>

          {/* Remember Me Checkbox */}
          <div className="flex items-center pt-1">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-4 h-4 rounded text-brand-purple-800 focus:ring-brand-purple-600 border-slate-300 cursor-pointer"
              />
              <span className="text-xs text-slate-600 font-medium">Remember me on this device</span>
            </label>
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            variant="primary"
            size="lg"
            className="w-full shadow-soft hover:shadow-soft-md"
            icon={<LogIn className="w-4 h-4" />}
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Validating...' : `Sign In as ${userType === 'individual' ? 'Individual' : 'Caregiver'}`}
          </Button>
        </form>

        {/* Create Account Link */}
        <div className="pt-2 text-center text-xs text-slate-500">
          Don’t have an account yet?{' '}
          <Link
            to="/register"
            className="font-bold text-brand-purple-800 hover:text-brand-purple-900 hover:underline"
          >
            Create an Account
          </Link>
        </div>

        {/* Phase 4 Integration Note */}
        <div className="pt-3 border-t border-slate-100 flex items-center justify-center gap-1.5 text-[11px] text-slate-400 text-center">
          <span>Backend auth endpoints ready • Firebase provider scheduled for Step 4</span>
        </div>

      </div>
    </div>
  );
};
