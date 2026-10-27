'use client';

import React, { useState } from 'react';
import { X, Search, Sparkles } from 'lucide-react';

export default function ManualRegistrationModal({ isOpen, onClose, onRegisterStudent }) {
  const [rollNumber, setRollNumber] = useState('');
  const [name, setName] = useState('');
  const [mail, setMail] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  // Auto-lookup name from database when roll number is entered
  const handleRollChange = async (e) => {
    const val = e.target.value;
    setRollNumber(val);
    setErrorMsg('');

    // If looks like a valid roll number (6-12 chars), trigger auto-lookup
    const clean = val.trim().toUpperCase();
    if (clean.length >= 6) {
      setIsSearching(true);
      try {
        const res = await fetch(`/api/student/${encodeURIComponent(clean)}`);
        if (res.ok) {
          const data = await res.json();
          if (data.student && data.student.name) {
            setName(data.student.name);
            if (data.student.mail && !mail) {
              setMail(data.student.mail);
            }
          }
        }
      } catch (err) {
        // silent fallback
      } finally {
        setIsSearching(false);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!rollNumber.trim()) {
      setErrorMsg('Please enter the player roll number / college ID');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg('');

    try {
      await onRegisterStudent({
        rollNumber: rollNumber.trim().toUpperCase(),
        name: name.trim() || `Student ${rollNumber.trim().toUpperCase()}`,
        mail: mail.trim()
      });
      // Reset form and close
      setRollNumber('');
      setName('');
      setMail('');
      onClose();
    } catch (err) {
      setErrorMsg(err.message || 'Failed to register player');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      {/* Modal Box Styled Exactly Like Image 3 */}
      <div 
        className="w-full max-w-lg bg-[#0c121e] border border-[#1e293b] rounded-2xl p-6 sm:p-8 shadow-2xl relative"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Close Button Top Right */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-slate-200 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Title & Subtitle */}
        <div className="mb-6">
          <h2 className="text-xl font-black tracking-wide text-white font-sans uppercase">
            REGISTER PLAYER 1 MANUALLY
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 font-sans">
            For students who do not have their RFID card.
          </p>
        </div>

        {errorMsg && (
          <div className="mb-4 p-2.5 rounded-lg bg-rose-950/80 border border-rose-800 text-xs text-rose-300">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Roll Number / College ID Field */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-[11px] font-mono tracking-widest uppercase text-slate-300">
                PLAYER ROLL NUMBER / COLLEGE ID
              </label>
              {isSearching && (
                <span className="text-[10px] text-cyan-400 flex items-center gap-1 font-mono">
                  <Sparkles className="w-3 h-3 animate-spin" /> Auto-looking up name...
                </span>
              )}
            </div>
            <input
              type="text"
              required
              value={rollNumber}
              onChange={handleRollChange}
              placeholder="e.g. 23CEB0B10"
              className="w-full bg-[#080d16] border border-[#1e293b] focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-600 outline-none transition-all font-mono"
            />
          </div>

          {/* Player Name Field */}
          <div>
            <label className="block text-[11px] font-mono tracking-widest uppercase text-slate-300 mb-1.5">
              PLAYER NAME
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter student's full name"
              className="w-full bg-[#080d16] border border-[#1e293b] focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-600 outline-none transition-all"
            />
            <p className="text-[10px] text-slate-500 mt-1">
              (Will auto-fetch from directory if left blank and roll number matches database)
            </p>
          </div>

          {/* Email ID (Optional) */}
          <div>
            <label className="block text-[11px] font-mono tracking-widest uppercase text-slate-300 mb-1.5">
              PLAYER EMAIL ID (OPTIONAL)
            </label>
            <input
              type="email"
              value={mail}
              onChange={(e) => setMail(e.target.value)}
              placeholder="Enter student's email address"
              className="w-full bg-[#080d16] border border-[#1e293b] focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-600 outline-none transition-all font-mono text-xs"
            />
          </div>

          {/* Action Buttons: CANCEL and REGISTER PLAYER (Styled as Image 3) */}
          <div className="pt-4 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-6 py-2.5 rounded-xl text-xs font-mono font-bold tracking-wider uppercase text-slate-300 bg-[#121927] hover:bg-[#1a2336] border border-[#1e293b] transition-all"
            >
              CANCEL
            </button>

            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 rounded-xl text-xs font-mono font-bold tracking-wider uppercase text-slate-950 bg-[#00f0ff] hover:bg-[#33f3ff] shadow-neon-cyan transition-all disabled:opacity-50"
            >
              {isSubmitting ? 'REGISTERING...' : 'REGISTER PLAYER'}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}
