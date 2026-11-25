import React, { useState } from 'react';
import {
  Mail,
  Phone,
  MapPin,
  Send,
  CheckCircle,
  HelpCircle,
  HeartHandshake
} from 'lucide-react';
import { Button } from '../components/Button';
import { Card } from '../components/Card';

export const Contact: React.FC = () => {
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: 'Caregiver',
    message: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormSubmitted(true);
  };

  const faqs = [
    {
      q: "Does MOUNAM require internet to communicate?",
      a: "No! All predefined communication categories, saved vocabulary, emergency SOS alerts, and browser speech synthesis work completely offline. Internet is only required for the optional Google Gemini AI sentence-expansion engine and cloud syncing."
    },
    {
      q: "Do I need to buy special eye-tracking or assistive hardware?",
      a: "Not at all. MOUNAM runs on standard hardware you already own: Android smartphones, iPhones, iPads, Windows laptops, and MacBooks using standard web cameras and touchscreens."
    },
    {
      q: "Can caregivers configure custom words for family members?",
      a: "Yes. Caregivers can add personalized routines, favorite foods, family names, and emergency contact phone numbers through the My Vocabulary and Caregiver settings."
    },
    {
      q: "Which regional languages are currently supported?",
      a: "MOUNAM supports English, Tamil (தமிழ்), Hindi (हिन्दी), Telugu (తెలుగు), Malayalam (മലയാളം), and Kannada (ಕನ್ನಡ)."
    }
  ];

  return (
    <div className="py-12 sm:py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-20">
      
      {/* Page Header */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-purple-100 text-brand-purple-800 text-xs font-bold tracking-wide uppercase">
          Support & Partnerships
        </div>
        <h1 className="text-4xl sm:text-6xl font-black text-slate-900 tracking-tight">
          We’re Here to Help
        </h1>
        <p className="text-lg text-slate-600">
          Have questions regarding caregiver setup, hospital bedside deployment, or speech therapy integration? Reach out to our dedicated team.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
        {/* Contact Info & Details */}
        <div className="lg:col-span-5 space-y-8">
          <div className="bg-gradient-to-br from-brand-purple-900 to-slate-900 text-white rounded-3xl p-8 sm:p-10 shadow-soft-lg space-y-6">
            <h3 className="text-2xl font-black">Get in Touch</h3>
            <p className="text-sm text-brand-purple-200 leading-relaxed">
              We collaborate with disability advocates, rehabilitation centers, neurologists, and speech-language pathologists worldwide.
            </p>

            <div className="space-y-4 text-sm pt-2">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center shrink-0">
                  <Mail className="w-5 h-5 text-brand-blue-400" />
                </div>
                <div>
                  <p className="text-xs text-brand-purple-300">Email Inquiries</p>
                  <p className="font-semibold text-white">support@mounam.org</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center shrink-0">
                  <Phone className="w-5 h-5 text-emerald-400" />
                </div>
                <div>
                  <p className="text-xs text-brand-purple-300">Caregiver Assistance Helpline</p>
                  <p className="font-semibold text-white">+1 (800) 555-MOUNAM</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center shrink-0">
                  <MapPin className="w-5 h-5 text-rose-400" />
                </div>
                <div>
                  <p className="text-xs text-brand-purple-300">Initiative Headquarters</p>
                  <p className="font-semibold text-white">Assistive Tech Innovation Lab, Chennai & Global</p>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-white/10 flex items-center gap-2 text-xs text-brand-purple-200">
              <HeartHandshake className="w-4 h-4 text-brand-blue-400" />
              <span>Free and open for non-profit and personal care</span>
            </div>
          </div>
        </div>

        {/* Contact Form */}
        <div className="lg:col-span-7 bg-white rounded-3xl p-8 sm:p-10 border border-slate-200/80 shadow-soft-lg">
          {formSubmitted ? (
            <div className="text-center py-12 space-y-4">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                <CheckCircle className="w-8 h-8" />
              </div>
              <h3 className="text-2xl font-black text-slate-900">Message Received!</h3>
              <p className="text-sm text-slate-600 max-w-md mx-auto">
                Thank you for reaching out to the MOUNAM assistive team. A representative will get back to you within 24 hours.
              </p>
              <Button
                variant="outline"
                size="md"
                onClick={() => {
                  setFormSubmitted(false);
                  setFormData({ name: '', email: '', role: 'Caregiver', message: '' });
                }}
              >
                Send Another Message
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <h3 className="text-2xl font-black text-slate-900">Send an Inquiry</h3>
              <p className="text-xs text-slate-500">Fill in the details below and we will assist promptly.</p>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Dr. Aruna Kumar"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-purple-600 text-sm"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="name@example.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-purple-600 text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                    I Am A:
                  </label>
                  <select
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-purple-600 text-sm bg-white"
                  >
                    <option value="Caregiver">Caregiver / Family Member</option>
                    <option value="Individual">Individual User</option>
                    <option value="SpeechTherapist">Speech-Language Pathologist</option>
                    <option value="Hospital">Hospital / Clinical Facility</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Message or Question
                </label>
                <textarea
                  rows={4}
                  required
                  placeholder="How can we assist you or your patient?"
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-purple-600 text-sm"
                />
              </div>

              <Button
                type="submit"
                variant="primary"
                size="lg"
                className="w-full"
                icon={<Send className="w-4 h-4" />}
              >
                Send Message
              </Button>
            </form>
          )}
        </div>
      </div>

      {/* Frequently Asked Questions */}
      <div className="space-y-8 pt-8">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <h2 className="text-3xl font-black text-slate-900">
            Frequently Asked Questions
          </h2>
          <p className="text-sm text-slate-500">
            Quick answers about MOUNAM accessibility, privacy, and device support.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {faqs.map((faq, fIdx) => (
            <Card key={fIdx} className="space-y-2">
              <h3 className="text-base font-bold text-slate-900 flex items-start gap-2">
                <HelpCircle className="w-5 h-5 text-brand-purple-700 shrink-0 mt-0.5" />
                <span>{faq.q}</span>
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed pl-7">
                {faq.a}
              </p>
            </Card>
          ))}
        </div>
      </div>

    </div>
  );
};
