'use client';

import React, { useState, useEffect } from 'react';
import { X, Search, Sparkles, CheckCircle2, UserCheck } from 'lucide-react';

export default function ManualRegistrationModal({ isOpen, onClose, onRegisterStudent }) {
  const [rollNumber, setRollNumber] = useState('');
  const [name, setName] = useState('');
  const [mail, setMail] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [foundStudent, setFoundStudent] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Reset states when modal opens/closes
  useEffect(() => {
    if (!isOpen) {
      setRollNumber('');
      setName('');
      setMail('');
      setFoundStudent(null);
      setErrorMsg('');
      setIsSearching(false);
    }
  }, [isOpen]);

  // Perform lookup by roll number
  const lookupRollNumber = async (rawRoll) => {
    const clean = (rawRoll || '').trim().toUpperCase();
    if (clean.length < 5) {
      setFoundStudent(null);
      return;
    }

    setIsSearching(true);
    try {
      const res = await fetch(`/api/student/${encodeURIComponent(clean)}`);
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.student) {
          setName(data.student.name || '');
          setMail(data.student.mail || '');
          setFoundStudent(data.student);
          setErrorMsg('');
          return;
        }
      }
      setFoundStudent(null);
    } catch (err) {
      // silent fallback
    } finally {
      setIsSearching(false);
    }
  };

  const handleRollChange = (e) => {
    const val = e.target.value;
    setRollNumber(val);
    setErrorMsg('');
    lookupRollNumber(val);
  };

  const handleRollBlur = () => {
    if (rollNumber) {
      lookupRollNumber(rollNumber);
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
        name: name.trim() || (foundStudent ? foundStudent.name : `Student ${rollNumber.trim().toUpperCase()}`),
        mail: mail.trim() || (foundStudent ? foundStudent.mail : '')
      });
      // Reset form and close
      setRollNumber('');
      setName('');
      setMail('');
      setFoundStudent(null);
      onClose();
    } catch (err) {
      setErrorMsg(err.message || 'Failed to register player');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

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
              {isSearching ? (
                <span className="text-[10px] text-cyan-400 flex items-center gap-1 font-mono">
                  <Sparkles className="w-3 h-3 animate-spin" /> Looking up student...
                </span>
              ) : foundStudent ? (
                <span className="text-[10px] text-emerald-400 flex items-center gap-1 font-mono font-bold">
                  <CheckCircle2 className="w-3 h-3" /> NITW Student Verified
                </span>
              ) : null}
            </div>
            <input
              type="text"
              required
              value={rollNumber}
              onChange={handleRollChange}
              onBlur={handleRollBlur}
              placeholder="e.g. 23CEB0B10"
              className="w-full bg-[#080d16] border border-[#1e293b] focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-600 outline-none transition-all font-mono uppercase"
            />
          </div>

          {/* Player Name Field */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-[11px] font-mono tracking-widest uppercase text-slate-300">
                PLAYER NAME
              </label>
              {foundStudent && (
                <span className="text-[10px] text-cyan-400 font-mono">
                  Auto-filled from database
                </span>
              )}
            </div>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Student full name"
              className={`w-full bg-[#080d16] border rounded-xl px-4 py-3 text-sm text-white placeholder-slate-600 outline-none transition-all ${
                foundStudent
                  ? 'border-emerald-500/50 bg-emerald-950/10 text-emerald-100 font-semibold'
                  : 'border-[#1e293b] focus:border-cyan-400'
              }`}
            />
          </div>

          {/* Email ID Field */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-[11px] font-mono tracking-widest uppercase text-slate-300">
                PLAYER EMAIL ID (OPTIONAL)
              </label>
              {foundStudent && foundStudent.mail && (
                <span className="text-[10px] text-cyan-400 font-mono">
                  Auto-filled from database
                </span>
              )}
            </div>
            <input
              type="email"
              value={mail}
              onChange={(e) => setMail(e.target.value)}
              placeholder="student@student.nitw.ac.in"
              className={`w-full bg-[#080d16] border rounded-xl px-4 py-3 text-sm text-white placeholder-slate-600 outline-none transition-all font-mono text-xs ${
                foundStudent && foundStudent.mail
                  ? 'border-emerald-500/50 bg-emerald-950/10 text-emerald-200'
                  : 'border-[#1e293b] focus:border-cyan-400'
              }`}
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
