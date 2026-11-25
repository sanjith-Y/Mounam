import React, { useState } from 'react';
import {
  Phone,
  Volume2,
  Square,
  Copy,
  Check,
  Plus,
  Trash2,
  Edit2,
  ShieldAlert
} from 'lucide-react';
import { Button } from './Button';
import { voiceEngine } from '../services/voiceEngine';
import { emergencyContactService, EmergencyContact } from '../services/emergencyContactService';
import { useAccessibility } from '../context/AccessibilityContext';
import { personalizationService } from '../services/personalizationService';

export const EMERGENCY_MESSAGES = [
  { id: 'em_1', label: '🚨 I need immediate help', text: 'Please help me immediately. I need urgent assistance.' },
  { id: 'em_2', label: '🏥 Medical assistance', text: 'I need medical assistance right now. Please call a doctor.' },
  { id: 'em_3', label: '🚑 Call an ambulance', text: 'Please call an ambulance immediately. This is an emergency.' },
  { id: 'em_4', label: '⚡ Experiencing pain', text: 'I am experiencing severe pain. Please help me.' },
  { id: 'em_5', label: '📞 Contact my family', text: 'Please contact my family immediately. Their number is in my emergency contacts.' },
  { id: 'em_6', label: '🤝 Stay with me', text: 'Please stay with me. Do not leave me alone.' },
  { id: 'em_7', label: '⚠️ Feeling unsafe', text: 'I am feeling unsafe. Please assist me.' },
  { id: 'em_8', label: '📢 Call for help', text: 'Please call someone nearby to help me.' },
];

export const EmergencyMode: React.FC = () => {
  const { preferences, triggerHaptic } = useAccessibility();
  const [selectedMessage, setSelectedMessage] = useState<string>(EMERGENCY_MESSAGES[0].text);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);

  // Contacts
  const [contacts, setContacts] = useState<EmergencyContact[]>(() =>
    emergencyContactService.getContacts()
  );
  const [isAddingContact, setIsAddingContact] = useState<boolean>(false);
  const [newContactForm, setNewContactForm] = useState({
    name: '',
    phone: '',
    relationship: 'Family Member',
    priority: 'primary' as const,
    notes: '',
  });

  const handleSelectMessage = (text: string) => {
    triggerHaptic(40);
    setSelectedMessage(text);
  };

  const handleSpeak = () => {
    if (!selectedMessage.trim()) return;
    triggerHaptic(50);
    voiceEngine.speak(
      selectedMessage,
      {
        rate: 0.85, // slightly slower for maximum urgency & clarity
        pitch: 1.0,
        volume: 1.0,
        languageCode: preferences.preferredLanguage || 'en',
      },
      () => setIsSpeaking(false),
      () => setIsSpeaking(false)
    );
    setIsSpeaking(true);
    // Record usage for personalization
    const msgRecord = EMERGENCY_MESSAGES.find((m) => m.text === selectedMessage);
    personalizationService.recordUsage(
      msgRecord?.id ?? `em_custom`,
      selectedMessage,
      'emergency',
      preferences.preferredLanguage || 'en'
    );
  };

  const handleStopSpeech = () => {
    voiceEngine.stop();
    setIsSpeaking(false);
  };

  const handleCopy = () => {
    if (!selectedMessage) return;
    navigator.clipboard.writeText(selectedMessage);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleAddContact = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newContactForm.name.trim() || !newContactForm.phone.trim()) return;
    emergencyContactService.addContact(newContactForm);
    setContacts(emergencyContactService.getContacts());
    setIsAddingContact(false);
    setNewContactForm({ name: '', phone: '', relationship: 'Family Member', priority: 'primary', notes: '' });
  };

  const handleDeleteContact = (id: string) => {
    emergencyContactService.deleteContact(id);
    setContacts(emergencyContactService.getContacts());
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* High-Contrast Emergency Header */}
      <div className="bg-red-600 text-white rounded-3xl p-6 sm:p-8 shadow-xl border-4 border-red-700 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center shrink-0">
            <ShieldAlert className="w-8 h-8 text-white" />
          </div>
          <div>
            <span className="text-xs font-black tracking-widest uppercase bg-white/20 px-3 py-1 rounded-full">
              Emergency Mode Active
            </span>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight mt-1">
              Urgent Assistive SOS Communication
            </h1>
            <p className="text-xs sm:text-sm text-red-100 max-w-xl mt-1">
              Select a critical message below to immediately display in high contrast and vocalize.
            </p>
          </div>
        </div>
      </div>

      {/* Prominent Active Message Display & Speech Controls */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border-4 border-red-500 shadow-xl space-y-5">
        <div className="flex items-center justify-between text-xs font-black text-red-600 uppercase tracking-wider">
          <span>Active Emergency Broadcast</span>
          <span>High-Visibility Display</span>
        </div>

        {isEditing ? (
          <div className="space-y-2">
            <textarea
              rows={3}
              value={selectedMessage}
              onChange={(e) => setSelectedMessage(e.target.value)}
              className="w-full text-xl sm:text-2xl font-black p-4 rounded-2xl border-2 border-red-500 focus:outline-none focus:ring-4 focus:ring-red-200 bg-red-50/40 text-slate-900 resize-none"
            />
            <div className="flex justify-end">
              <Button variant="primary" size="sm" onClick={() => setIsEditing(false)}>
                Done Editing
              </Button>
            </div>
          </div>
        ) : (
          <div
            onClick={() => setIsEditing(true)}
            className="p-5 sm:p-6 rounded-2xl bg-red-50/50 border-2 border-red-300 cursor-pointer hover:bg-red-50 transition-colors"
            title="Click to edit text"
          >
            <p className="text-2xl sm:text-4xl font-black text-red-950 leading-tight">
              "{selectedMessage}"
            </p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
          <div className="flex items-center gap-3 flex-wrap">
            <button
              onClick={handleSpeak}
              className={`px-8 py-4 rounded-2xl font-black text-base sm:text-lg flex items-center gap-2.5 text-white shadow-lg transition-transform active:scale-95 ${
                isSpeaking
                  ? 'bg-red-700 animate-pulse ring-4 ring-red-300'
                  : 'bg-red-600 hover:bg-red-700'
              }`}
            >
              <Volume2 className="w-6 h-6" />
              <span>{isSpeaking ? 'Speaking Loudly...' : 'Speak Emergency Message'}</span>
            </button>

            {isSpeaking && (
              <button
                onClick={handleStopSpeech}
                className="px-5 py-4 rounded-2xl bg-slate-900 text-white font-bold text-sm flex items-center gap-2 transition-colors hover:bg-black shadow-md"
              >
                <Square className="w-4 h-4 fill-white" />
                <span>Stop</span>
              </button>
            )}

            <button
              onClick={() => setIsEditing(!isEditing)}
              className="px-4 py-4 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-sm border border-slate-200 transition-colors"
            >
              <Edit2 className="w-4 h-4" />
            </button>

            <button
              onClick={handleCopy}
              className="px-4 py-4 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-sm border border-slate-200 transition-colors flex items-center gap-1.5"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? 'Copied' : 'Copy'}</span>
            </button>
          </div>

          <span className="text-xs text-slate-400 italic">
            Message works 100% offline via local voice engine
          </span>
        </div>
      </div>

      {/* One-Tap Emergency Messages Grid */}
      <div className="space-y-3">
        <h3 className="text-base font-black text-slate-900">One-Tap Quick Emergency Phrases</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {EMERGENCY_MESSAGES.map((msg) => (
            <button
              key={msg.id}
              onClick={() => handleSelectMessage(msg.text)}
              className={`p-4 rounded-2xl border-2 text-left transition-all duration-150 flex flex-col justify-between h-28 active:scale-[0.98] ${
                selectedMessage === msg.text
                  ? 'bg-red-50 border-red-600 ring-2 ring-red-400 shadow-md'
                  : 'bg-white border-slate-200 hover:border-red-300 hover:bg-red-50/20'
              }`}
            >
              <span className="font-black text-sm text-slate-900">{msg.label}</span>
              <p className="text-xs text-slate-500 line-clamp-2">{msg.text}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Emergency Contacts Section */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-soft-sm space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div>
            <h3 className="text-lg font-black text-slate-900">Direct Emergency Contacts</h3>
            <p className="text-xs text-slate-500">Tap to call directly from your device</p>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsAddingContact(!isAddingContact)}
            icon={<Plus className="w-4 h-4" />}
          >
            {isAddingContact ? 'Cancel' : 'Add Emergency Contact'}
          </Button>
        </div>

        {/* Add Contact Modal / Form */}
        {isAddingContact && (
          <form onSubmit={handleAddContact} className="p-5 bg-slate-50 rounded-2xl border border-slate-200 space-y-4">
            <h4 className="text-sm font-black text-slate-900">New Emergency Contact Details</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <input
                type="text"
                required
                placeholder="Full Name (e.g. Dr. Rajesh / Sister Priya)"
                value={newContactForm.name}
                onChange={(e) => setNewContactForm({ ...newContactForm, name: e.target.value })}
                className="text-xs font-bold p-3 rounded-xl border border-slate-200 bg-white"
              />
              <input
                type="tel"
                required
                placeholder="Phone Number (e.g. +91 98765 43210)"
                value={newContactForm.phone}
                onChange={(e) => setNewContactForm({ ...newContactForm, phone: e.target.value })}
                className="text-xs font-bold p-3 rounded-xl border border-slate-200 bg-white"
              />
              <select
                value={newContactForm.relationship}
                onChange={(e) => setNewContactForm({ ...newContactForm, relationship: e.target.value })}
                className="text-xs font-bold p-3 rounded-xl border border-slate-200 bg-white"
              >
                <option value="Family Member">Family Member</option>
                <option value="Caregiver">Caregiver / Nurse</option>
                <option value="Doctor">Doctor</option>
                <option value="Neighbor">Neighbor</option>
              </select>
              <select
                value={newContactForm.priority}
                onChange={(e) => setNewContactForm({ ...newContactForm, priority: e.target.value as any })}
                className="text-xs font-bold p-3 rounded-xl border border-slate-200 bg-white"
              >
                <option value="primary">Primary (First to notify)</option>
                <option value="secondary">Secondary Contact</option>
                <option value="general">General Support</option>
              </select>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="primary" size="sm" type="submit">
                Save Emergency Contact
              </Button>
            </div>
          </form>
        )}

        {/* Contacts List */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {contacts.map((contact) => (
            <div
              key={contact.id}
              className="p-5 rounded-2xl border border-slate-200 bg-white shadow-soft-sm flex items-center justify-between gap-3 hover:border-brand-purple-300 transition-colors"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-black text-sm text-slate-900">{contact.name}</span>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      contact.priority === 'primary'
                        ? 'bg-red-100 text-red-800'
                        : 'bg-slate-100 text-slate-700'
                    }`}
                  >
                    {contact.relationship}
                  </span>
                </div>
                <p className="text-xs font-bold text-slate-600">{contact.phone}</p>
                {contact.notes && <p className="text-[11px] text-slate-400">{contact.notes}</p>}
              </div>

              <div className="flex items-center gap-2">
                <a
                  href={`tel:${contact.phone.replace(/\s+/g, '')}`}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-sm transition-colors"
                >
                  <Phone className="w-3.5 h-3.5" />
                  <span>Call</span>
                </a>
                <button
                  onClick={() => handleDeleteContact(contact.id)}
                  className="p-2 text-slate-400 hover:text-red-600 rounded-xl"
                  title="Remove contact"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
