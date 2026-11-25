import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  UserPlus,
  User,
  HeartHandshake,
  Lock,
  Mail,
  Phone,
  Globe,
  Eye,
  EyeOff,
  ArrowLeft,
  AlertCircle,
  CheckCircle2,
  Volume2
} from 'lucide-react';
import { Button } from '../components/Button';
import { apiService } from '../services/api';

export const Register: React.FC = () => {
  const [userType, setUserType] = useState<'individual' | 'caregiver'>('individual');
  
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phoneNumber: '',
    password: '',
    confirmPassword: '',
    preferredLanguage: 'en',
    acceptedTerms: false,
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Field errors
  const [errors, setErrors] = useState<{
    fullName?: string;
    email?: string;
    phoneNumber?: string;
    password?: string;
    confirmPassword?: string;
    acceptedTerms?: string;
  }>({});

  const [submissionFeedback, setSubmissionFeedback] = useState<{
    type: 'success' | 'info' | 'error';
    message: string;
  } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const navigate = useNavigate();

  const languages = [
    { code: 'en', name: 'English' },
    { code: 'ta', name: 'Tamil (தமிழ்)' },
    { code: 'hi', name: 'Hindi (हिन्दी)' },
    { code: 'ml', name: 'Malayalam (മലയാളം)' },
    { code: 'te', name: 'Telugu (తెలుగు)' },
    { code: 'kn', name: 'Kannada (ಕನ್ನಡ)' },
  ];

  // Password strength calculation
  const getPasswordStrength = (pwd: string) => {
    if (!pwd) return { score: 0, label: 'None', color: 'bg-slate-200' };
    let score = 0;
    if (pwd.length >= 8) score++;
    if (/[A-Z]/.test(pwd)) score++;
    if (/[0-9]/.test(pwd)) score++;
    if (/[^A-Za-z0-9]/.test(pwd)) score++;

    if (score <= 1) return { score: 1, label: 'Weak', color: 'bg-red-500' };
    if (score === 2 || score === 3) return { score: 2, label: 'Medium', color: 'bg-amber-500' };
    return { score: 3, label: 'Strong', color: 'bg-emerald-500' };
  };

  const passwordStrength = getPasswordStrength(formData.password);

  const validate = () => {
    const newErrors: {
      fullName?: string;
      email?: string;
      phoneNumber?: string;
      password?: string;
      confirmPassword?: string;
      acceptedTerms?: string;
    } = {};

    // Full name
    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Full Name is required.';
    } else if (formData.fullName.trim().length < 2) {
      newErrors.fullName = 'Full Name must be at least 2 characters.';
    }

    // Email
    if (!formData.email.trim()) {
      newErrors.email = 'Email Address is required.';
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email.trim())) {
        newErrors.email = 'Please enter a valid email address (e.g. name@example.com).';
      }
    }

    // Phone number
    if (!formData.phoneNumber.trim()) {
      newErrors.phoneNumber = 'Phone Number is required.';
    } else {
      const cleanPhone = formData.phoneNumber.replace(/[\s\-\(\)\+]/g, '');
      if (!/^\d{7,15}$/.test(cleanPhone)) {
        newErrors.phoneNumber = 'Please enter a valid phone number (at least 7 digits).';
      }
    }

    // Password
    if (!formData.password) {
      newErrors.password = 'Password is required.';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters long.';
    }

    // Confirm password
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Confirmation password is required.';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match.';
    }

    // Terms
    if (!formData.acceptedTerms) {
      newErrors.acceptedTerms = 'You must accept the Terms and Conditions to proceed.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmissionFeedback(null);

    if (!validate()) {
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await apiService.register({
        full_name: formData.fullName.trim(),
        email: formData.email.trim(),
        phone_number: formData.phoneNumber.trim(),
        password: formData.password,
        preferred_language: formData.preferredLanguage,
        user_type: userType,
        accepted_terms: formData.acceptedTerms
      });

      setSubmissionFeedback({
        type: 'info',
        message: res.message || 'Registration details validated successfully. Firebase Auth account creation activates in Step 4.'
      });

      setTimeout(() => {
        navigate('/dashboard');
      }, 1400);
    } catch {
      setSubmissionFeedback({
        type: 'error',
        message: 'Registration submission failed. Please verify the inputs and try again.'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="py-12 sm:py-20 max-w-xl mx-auto px-4 sm:px-6">
      
      {/* Top Back to Home Navigation */}
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
              Create Your Account
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Join MOUNAM — Every voice deserves to be heard
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

        {/* Status / Feedback Banner */}
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

        {/* Registration Form */}
        <form onSubmit={handleRegister} noValidate className="space-y-4">
          
          {/* Full Name */}
          <div>
            <label
              htmlFor="fullName"
              className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2"
            >
              Full Name <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5 pointer-events-none" />
              <input
                id="fullName"
                type="text"
                autoComplete="name"
                placeholder="e.g. John Doe / Priya S."
                value={formData.fullName}
                onChange={(e) => {
                  setFormData({ ...formData, fullName: e.target.value });
                  if (errors.fullName) setErrors({ ...errors, fullName: undefined });
                }}
                className={`w-full pl-10 pr-4 py-3 rounded-xl border text-sm transition-all focus:outline-none focus:ring-2 ${
                  errors.fullName
                    ? 'border-red-400 bg-red-50/30 focus:ring-red-500'
                    : 'border-slate-200 bg-white focus:ring-brand-purple-600'
                }`}
              />
            </div>
            {errors.fullName && (
              <p className="mt-1.5 text-xs text-red-600 flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                <span>{errors.fullName}</span>
              </p>
            )}
          </div>

          {/* Email Address */}
          <div>
            <label
              htmlFor="regEmail"
              className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2"
            >
              Email Address <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5 pointer-events-none" />
              <input
                id="regEmail"
                type="email"
                autoComplete="email"
                placeholder="name@example.com"
                value={formData.email}
                onChange={(e) => {
                  setFormData({ ...formData, email: e.target.value });
                  if (errors.email) setErrors({ ...errors, email: undefined });
                }}
                className={`w-full pl-10 pr-4 py-3 rounded-xl border text-sm transition-all focus:outline-none focus:ring-2 ${
                  errors.email
                    ? 'border-red-400 bg-red-50/30 focus:ring-red-500'
                    : 'border-slate-200 bg-white focus:ring-brand-purple-600'
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

          {/* Phone Number */}
          <div>
            <label
              htmlFor="phone"
              className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2"
            >
              Phone Number <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5 pointer-events-none" />
              <input
                id="phone"
                type="tel"
                autoComplete="tel"
                placeholder="+91 98765 43210 / (555) 123-4567"
                value={formData.phoneNumber}
                onChange={(e) => {
                  setFormData({ ...formData, phoneNumber: e.target.value });
                  if (errors.phoneNumber) setErrors({ ...errors, phoneNumber: undefined });
                }}
                className={`w-full pl-10 pr-4 py-3 rounded-xl border text-sm transition-all focus:outline-none focus:ring-2 ${
                  errors.phoneNumber
                    ? 'border-red-400 bg-red-50/30 focus:ring-red-500'
                    : 'border-slate-200 bg-white focus:ring-brand-purple-600'
                }`}
              />
            </div>
            {errors.phoneNumber && (
              <p className="mt-1.5 text-xs text-red-600 flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                <span>{errors.phoneNumber}</span>
              </p>
            )}
          </div>

          {/* Preferred Language for Voice Output */}
          <div>
            <label
              htmlFor="language"
              className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2"
            >
              Preferred Language for Voice Output
            </label>
            <div className="relative">
              <Globe className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5 pointer-events-none" />
              <select
                id="language"
                value={formData.preferredLanguage}
                onChange={(e) => setFormData({ ...formData, preferredLanguage: e.target.value })}
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-purple-600"
              >
                {languages.map((lang) => (
                  <option key={lang.code} value={lang.code}>
                    {lang.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Password & Confirm Password (Grid) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Password */}
            <div>
              <label
                htmlFor="regPassword"
                className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2"
              >
                Password <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5 pointer-events-none" />
                <input
                  id="regPassword"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  placeholder="At least 8 chars"
                  value={formData.password}
                  onChange={(e) => {
                    setFormData({ ...formData, password: e.target.value });
                    if (errors.password) setErrors({ ...errors, password: undefined });
                  }}
                  className={`w-full pl-10 pr-10 py-3 rounded-xl border text-sm transition-all focus:outline-none focus:ring-2 ${
                    errors.password
                      ? 'border-red-400 bg-red-50/30 focus:ring-red-500'
                      : 'border-slate-200 bg-white focus:ring-brand-purple-600'
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

              {/* Password Strength Indicator */}
              {formData.password && (
                <div className="mt-2 space-y-1">
                  <div className="flex items-center justify-between text-[10px] text-slate-500 font-bold">
                    <span>Strength: {passwordStrength.label}</span>
                  </div>
                  <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden flex gap-1">
                    <span className={`h-full flex-1 rounded-full ${passwordStrength.score >= 1 ? passwordStrength.color : 'bg-slate-200'}`} />
                    <span className={`h-full flex-1 rounded-full ${passwordStrength.score >= 2 ? passwordStrength.color : 'bg-slate-200'}`} />
                    <span className={`h-full flex-1 rounded-full ${passwordStrength.score >= 3 ? passwordStrength.color : 'bg-slate-200'}`} />
                  </div>
                </div>
              )}

              {errors.password && (
                <p className="mt-1.5 text-xs text-red-600 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>{errors.password}</span>
                </p>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label
                htmlFor="confirmPassword"
                className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2"
              >
                Confirm Password <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5 pointer-events-none" />
                <input
                  id="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  placeholder="Repeat password"
                  value={formData.confirmPassword}
                  onChange={(e) => {
                    setFormData({ ...formData, confirmPassword: e.target.value });
                    if (errors.confirmPassword) setErrors({ ...errors, confirmPassword: undefined });
                  }}
                  className={`w-full pl-10 pr-10 py-3 rounded-xl border text-sm transition-all focus:outline-none focus:ring-2 ${
                    errors.confirmPassword
                      ? 'border-red-400 bg-red-50/30 focus:ring-red-500'
                      : 'border-slate-200 bg-white focus:ring-brand-purple-600'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-3 p-1 rounded-lg text-slate-400 hover:text-slate-700 focus:outline-none"
                  aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="mt-1.5 text-xs text-red-600 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>{errors.confirmPassword}</span>
                </p>
              )}
            </div>
          </div>

          {/* Terms and Conditions Checkbox */}
          <div className="pt-2">
            <label className="flex items-start gap-2.5 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={formData.acceptedTerms}
                onChange={(e) => {
                  setFormData({ ...formData, acceptedTerms: e.target.checked });
                  if (errors.acceptedTerms) setErrors({ ...errors, acceptedTerms: undefined });
                }}
                className="w-4 h-4 rounded text-brand-purple-800 focus:ring-brand-purple-600 border-slate-300 mt-0.5 cursor-pointer"
              />
              <span className="text-xs text-slate-600 leading-relaxed">
                I agree to the{' '}
                <Link to="/terms" target="_blank" className="font-bold text-brand-purple-800 hover:underline">
                  Terms and Conditions
                </Link>{' '}
                and understand the assistive AAC usage guidelines.
              </span>
            </label>
            {errors.acceptedTerms && (
              <p className="mt-1.5 text-xs text-red-600 flex items-center gap-1 pl-6">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                <span>{errors.acceptedTerms}</span>
              </p>
            )}
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            variant="primary"
            size="lg"
            className="w-full shadow-soft hover:shadow-soft-md"
            icon={<UserPlus className="w-4 h-4" />}
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Validating Account...' : `Create Account as ${userType === 'individual' ? 'Individual' : 'Caregiver'}`}
          </Button>
        </form>

        {/* Existing Account Link */}
        <div className="pt-2 text-center text-xs text-slate-500">
          Already have an account?{' '}
          <Link
            to="/login"
            className="font-bold text-brand-purple-800 hover:text-brand-purple-900 hover:underline"
          >
            Sign In here
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
