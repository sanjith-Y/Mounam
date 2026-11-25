import React, { useState } from 'react';
import {
  Users,
  ShieldCheck,
  KeyRound,
  Trash2,
  Copy,
  Check,
  Heart
} from 'lucide-react';
import { Button } from './Button';
import {
  caregiverService,
  CaregiverLink,
  CaregiverPermissionLevel,
  LinkingCode
} from '../services/caregiverService';
import { useAuth } from '../context/AuthContext';
import { useAccessibility } from '../context/AccessibilityContext';

export const CaregiverDashboard: React.FC = () => {
  const { user } = useAuth();
  const { preferences, settings } = useAccessibility();
  const [links, setLinks] = useState<CaregiverLink[]>(() =>
    caregiverService.getLinkedCaregivers()
  );

  // Active linking code
  const [activeCode, setActiveCode] = useState<LinkingCode | null>(() =>
    caregiverService.getActiveLinkingCode(user?.id || 'usr_guest')
  );
  const [copiedCode, setCopiedCode] = useState<boolean>(false);

  // Connect caregiver form (caregiver side simulation)
  const [connectCodeInput, setConnectCodeInput] = useState<string>('');
  const [caregiverNameInput, setCaregiverNameInput] = useState<string>('');
  const [caregiverEmailInput, setCaregiverEmailInput] = useState<string>('');
  const [connectMessage, setConnectMessage] = useState<{ text: string; error?: boolean } | null>(null);

  const handleGenerateCode = () => {
    const codeObj = caregiverService.generateLinkingCode(user?.id || 'usr_guest');
    setActiveCode(codeObj);
  };

  const handleCopyCode = () => {
    if (!activeCode) return;
    navigator.clipboard.writeText(activeCode.code);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleConnectCaregiver = (e: React.FormEvent) => {
    e.preventDefault();
    if (!connectCodeInput.trim() || !caregiverEmailInput.trim()) return;

    const res = caregiverService.connectWithCode(
      connectCodeInput.trim(),
      `cg_${Date.now()}`,
      caregiverNameInput || 'Caregiver',
      caregiverEmailInput
    );

    if (res.success) {
      setConnectMessage({ text: res.message });
      setLinks(caregiverService.getLinkedCaregivers());
      setConnectCodeInput('');
      setCaregiverNameInput('');
      setCaregiverEmailInput('');
    } else {
      setConnectMessage({ text: res.message, error: true });
    }
  };

  const handleRevoke = (linkId: string) => {
    caregiverService.revokeCaregiver(linkId);
    setLinks(caregiverService.getLinkedCaregivers());
  };

  const handleTogglePermission = (link: CaregiverLink, perm: CaregiverPermissionLevel) => {
    const nextPerms = link.permissions.includes(perm)
      ? link.permissions.filter((p) => p !== perm)
      : [...link.permissions, perm];
    caregiverService.updatePermissions(link.linkId, nextPerms);
    setLinks(caregiverService.getLinkedCaregivers());
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-soft-sm flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
              <Users className="w-5 h-5" />
            </span>
            <h2 className="text-xl font-black text-slate-900 tracking-tight">
              Caregiver Support & Authorized Family Linking
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Connect trusted caregivers or family members with explicit consent. Control permission boundaries at all times.
          </p>
        </div>
      </div>

      {/* Grid: Linking Code & Connect Flow */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* User Side: Generate Linking Code */}
        <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200 shadow-soft-sm space-y-4">
          <div className="flex items-center gap-2">
            <KeyRound className="w-5 h-5 text-brand-purple-700" />
            <h3 className="text-base font-black text-slate-900">
              Invite a Trusted Caregiver
            </h3>
          </div>
          <p className="text-xs text-slate-500 leading-relaxed">
            Generate a secure, single-use linking code. Share this code with your designated caregiver to authorize assistance.
          </p>

          {activeCode ? (
            <div className="p-4 bg-brand-purple-50 rounded-2xl border-2 border-brand-purple-200 space-y-3">
              <span className="text-[11px] font-bold text-brand-purple-700 uppercase">
                Active Linking Code (Expires in 15 mins)
              </span>
              <div className="flex items-center justify-between">
                <span className="text-3xl font-black tracking-widest text-brand-purple-950">
                  {activeCode.code}
                </span>
                <button
                  onClick={handleCopyCode}
                  className="px-3 py-1.5 bg-white border border-brand-purple-300 rounded-xl text-xs font-bold text-brand-purple-900 flex items-center gap-1 shadow-xs"
                >
                  {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedCode ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
            </div>
          ) : (
            <Button variant="primary" size="md" onClick={handleGenerateCode}>
              Generate Secure Linking Code
            </Button>
          )}
        </div>

        {/* Caregiver Side: Enter Code to Link */}
        <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200 shadow-soft-sm space-y-4">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-600" />
            <h3 className="text-base font-black text-slate-900">
              Connect to User Profile
            </h3>
          </div>
          <form onSubmit={handleConnectCaregiver} className="space-y-3">
            <input
              type="text"
              required
              placeholder="Enter Linking Code (e.g. MN-123456)"
              value={connectCodeInput}
              onChange={(e) => setConnectCodeInput(e.target.value)}
              className="w-full text-xs font-bold p-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white"
            />
            <div className="grid grid-cols-2 gap-2">
              <input
                type="text"
                placeholder="Caregiver Name"
                value={caregiverNameInput}
                onChange={(e) => setCaregiverNameInput(e.target.value)}
                className="text-xs font-bold p-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white"
              />
              <input
                type="email"
                required
                placeholder="Caregiver Email"
                value={caregiverEmailInput}
                onChange={(e) => setCaregiverEmailInput(e.target.value)}
                className="text-xs font-bold p-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white"
              />
            </div>
            <Button variant="secondary" size="md" type="submit">
              Authorize Connection
            </Button>
            {connectMessage && (
              <p className={`text-xs font-bold mt-1 ${connectMessage.error ? 'text-red-600' : 'text-emerald-700'}`}>
                {connectMessage.text}
              </p>
            )}
          </form>
        </div>
      </div>

      {/* Linked Caregivers List & Permission Controls */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-soft-sm space-y-5">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div>
            <h3 className="text-lg font-black text-slate-900">
              Active Authorized Caregivers ({links.length})
            </h3>
            <p className="text-xs text-slate-500">
              Review assigned permission boundaries. Revoke access at any moment.
            </p>
          </div>
        </div>

        {links.length === 0 ? (
          <div className="p-8 text-center text-slate-400 text-xs italic bg-slate-50 rounded-2xl border border-slate-100">
            No caregivers linked yet. Generate a linking code above to grant authorized assistance.
          </div>
        ) : (
          <div className="space-y-4">
            {links.map((link) => (
              <div
                key={link.linkId}
                className="p-5 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-4"
              >
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-black text-sm text-slate-900">{link.caregiverName}</span>
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                        Authorized Link
                      </span>
                    </div>
                    <p className="text-xs text-slate-500">{link.caregiverEmail}</p>
                  </div>

                  <button
                    onClick={() => handleRevoke(link.linkId)}
                    className="px-3.5 py-1.5 bg-red-50 hover:bg-red-100 text-red-700 rounded-xl text-xs font-bold flex items-center gap-1 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Revoke Connection</span>
                  </button>
                </div>

                {/* Granular Permissions Checkboxes */}
                <div className="space-y-2 pt-2 border-t border-slate-200/80">
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    Granted Permissions
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 text-xs">
                    {[
                      { id: 'basic_assistance', label: 'Basic Assistance & Overview' },
                      { id: 'communication_management', label: 'Add / Edit Custom Vocabulary' },
                      { id: 'accessibility_management', label: 'Configure Display & Speech' },
                      { id: 'emergency_configuration', label: 'Configure Emergency Contacts' },
                    ].map((perm) => (
                      <label
                        key={perm.id}
                        className="flex items-center gap-2 p-2 bg-white rounded-xl border border-slate-200 cursor-pointer text-slate-700"
                      >
                        <input
                          type="checkbox"
                          checked={link.permissions.includes(perm.id as CaregiverPermissionLevel)}
                          onChange={() => handleTogglePermission(link, perm.id as CaregiverPermissionLevel)}
                          className="w-4 h-4 text-brand-purple-600 rounded border-slate-300"
                        />
                        <span className="text-[11px] font-bold">{perm.label}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Linked Profile Health & Preferences Summary */}
      <div className="bg-gradient-to-br from-indigo-50/60 to-purple-50/60 border border-brand-purple-200 rounded-3xl p-6 sm:p-7 space-y-3">
        <div className="flex items-center gap-2">
          <Heart className="w-5 h-5 text-brand-purple-700" />
          <h4 className="text-sm font-black text-slate-900">
            Linked Communicator Overview
          </h4>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div className="p-3 bg-white rounded-xl border border-slate-200">
            <span className="text-slate-400 text-[10px] font-bold uppercase">Language</span>
            <p className="font-bold text-slate-800 capitalize mt-0.5">{preferences.preferredLanguage}</p>
          </div>
          <div className="p-3 bg-white rounded-xl border border-slate-200">
            <span className="text-slate-400 text-[10px] font-bold uppercase">Contrast Mode</span>
            <p className="font-bold text-slate-800 capitalize mt-0.5">{settings.contrast.replace('_', ' ')}</p>
          </div>
          <div className="p-3 bg-white rounded-xl border border-slate-200">
            <span className="text-slate-400 text-[10px] font-bold uppercase">Text Size</span>
            <p className="font-bold text-slate-800 capitalize mt-0.5">{settings.textSize.replace('_', ' ')}</p>
          </div>
          <div className="p-3 bg-white rounded-xl border border-slate-200">
            <span className="text-slate-400 text-[10px] font-bold uppercase">Speech Rate</span>
            <p className="font-bold text-slate-800 mt-0.5">{settings.speechRate}x Speed</p>
          </div>
        </div>
      </div>
    </div>
  );
};
