'use client';

import React, { useState } from 'react';
import { User, Users, RotateCcw, Save, AlertCircle, CheckCircle2 } from 'lucide-react';
import confetti from 'canvas-confetti';

export default function Scorecard({ 
  player1, 
  player2, 
  activeSlot = 1,
  onSelectSlot,
  onClearPlayer,
  onSaveScore, 
  onResetMatch, 
  isSaving = false 
}) {
  const [p1Score, setP1Score] = useState(0);
  const [p2Score, setP2Score] = useState(0);
  const [lastSavedMessage, setLastSavedMessage] = useState(null);

  // Score handlers
  const handleP1Inc = () => setP1Score(prev => prev + 1);
  const handleP1Dec = () => setP1Score(prev => Math.max(0, prev - 1));

  const handleP2Inc = () => setP2Score(prev => prev + 1);
  const handleP2Dec = () => setP2Score(prev => Math.max(0, prev - 1));

  const handleReset = () => {
    setP1Score(0);
    setP2Score(0);
    setLastSavedMessage(null);
    if (onResetMatch) onResetMatch();
  };

  const handleSave = async () => {
    if (!player1 || !player2) {
      alert('Please select BOTH Player 1 and Player 2 from the waiting list first!');
      return;
    }

    // Trigger confetti celebration
    try {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });
    } catch (e) {
      // Confetti non-fatal
    }

    const payload = {
      player1,
      player2,
      p1Score,
      p2Score
    };

    if (onSaveScore) {
      const res = await onSaveScore(payload);
      if (res && res.success) {
        const winner = p1Score > p2Score ? player1.name : p2Score > p1Score ? player2.name : 'Tie';
        setLastSavedMessage(`Saved match! Winner: ${winner} (${Math.max(p1Score, p2Score)} - ${Math.min(p1Score, p2Score)})`);
        setTimeout(() => setLastSavedMessage(null), 4000);
      }
    }
  };

  const leaderStatus = p1Score > p2Score 
    ? (player1 ? `${player1.name.split(' ')[0].toUpperCase()} LEADING` : 'PLAYER 1 LEADING')
    : p2Score > p1Score 
    ? (player2 ? `${player2.name.split(' ')[0].toUpperCase()} LEADING` : 'PLAYER 2 LEADING')
    : 'TIED';

  return (
    <div className="bg-arcade-card/95 border border-slate-800 rounded-2xl p-5 sm:p-6 shadow-xl flex flex-col justify-between relative overflow-hidden backdrop-blur-md">
      
      {/* Background neon ambient highlights */}
      <div className="absolute top-0 left-0 w-32 h-32 bg-pink-600/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-0 right-0 w-32 h-32 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none"></div>

      {/* Card Header */}
      <div>
        <div className="flex items-center justify-between pb-3 border-b border-slate-800/80 mb-4">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-ping"></span>
            <h2 className="text-sm font-bold tracking-widest uppercase text-cyan-400 font-tech">
              LIVE MATCH SCORECARD
            </h2>
          </div>
          <span className={`text-[10px] font-mono uppercase px-2.5 py-0.5 rounded-full border truncate max-w-[140px] ${
            p1Score > p2Score 
              ? 'bg-pink-950/80 text-pink-300 border-pink-800/70' 
              : p2Score > p1Score 
              ? 'bg-cyan-950/80 text-cyan-300 border-cyan-800/70' 
              : 'bg-slate-800 text-slate-400 border-slate-700'
          }`}>
            {leaderStatus}
          </span>
        </div>

        {/* Slot Selection Helper Buttons */}
        <div className="mb-4 grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => onSelectSlot && onSelectSlot(1)}
            className={`py-1.5 px-3 rounded-lg text-xs font-mono font-bold border transition-all flex items-center justify-center gap-1.5 ${
              activeSlot === 1
                ? 'bg-pink-600/20 text-pink-300 border-pink-500 shadow-neon-pink'
                : 'bg-slate-900/80 text-slate-400 border-slate-800 hover:text-pink-300'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-pink-400"></span>
            <span>Assign Player 1 {activeSlot === 1 && '(Selecting...)'}</span>
          </button>

          <button
            type="button"
            onClick={() => onSelectSlot && onSelectSlot(2)}
            className={`py-1.5 px-3 rounded-lg text-xs font-mono font-bold border transition-all flex items-center justify-center gap-1.5 ${
              activeSlot === 2
                ? 'bg-cyan-500/20 text-cyan-300 border-cyan-400 shadow-neon-cyan'
                : 'bg-slate-900/80 text-slate-400 border-slate-800 hover:text-cyan-300'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-cyan-400"></span>
            <span>Assign Player 2 {activeSlot === 2 && '(Selecting...)'}</span>
          </button>
        </div>

        {/* Missing Player Alert Banner */}
        {(!player1 || !player2) && (
          <div className="mb-4 bg-cyan-950/30 border border-cyan-500/30 rounded-xl p-2.5 flex items-start gap-2 text-xs text-cyan-200">
            <AlertCircle className="w-4 h-4 text-cyan-400 flex-shrink-0 mt-0.5" />
            <div className="text-[11px]">
              {!player1 && !player2 ? (
                <span>Click students from the Waiting List to assign <strong className="text-pink-400 font-mono">Player 1</strong> and <strong className="text-cyan-300 font-mono">Player 2</strong>.</span>
              ) : !player1 ? (
                <span>Select a student from the Waiting List for <strong className="text-pink-400 font-mono">Player 1</strong>.</span>
              ) : (
                <span>Select a student from the Waiting List for <strong className="text-cyan-300 font-mono">Player 2</strong>.</span>
              )}
            </div>
          </div>
        )}

        {/* Two-Column Score Arena: PLAYER 1 vs PLAYER 2 */}
        <div className="grid grid-cols-2 gap-3.5 sm:gap-5 my-1">
          
          {/* LEFT: PLAYER 1 */}
          <div 
            onClick={() => onSelectSlot && onSelectSlot(1)}
            className={`bg-slate-900/90 rounded-xl p-3.5 border relative flex flex-col items-center shadow-lg transition-all cursor-pointer ${
              activeSlot === 1
                ? 'border-pink-500 shadow-neon-pink ring-1 ring-pink-500/50'
                : 'border-pink-900/40 hover:border-pink-600/60'
            }`}
          >
            <div className="flex items-center justify-between w-full mb-1">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-pink-400 uppercase tracking-wider">
                <User className="w-3.5 h-3.5 text-pink-400" />
                <span>PLAYER 1</span>
              </div>
              {player1 && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (onClearPlayer) onClearPlayer(1);
                  }}
                  className="text-[10px] text-slate-500 hover:text-rose-400 font-mono"
                  title="Clear Player 1"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Student Name & Roll */}
            <div className="w-full text-center mb-2.5 min-h-[38px] flex flex-col justify-center">
              <div 
                className="text-xs sm:text-sm font-bold text-slate-100 truncate max-w-full"
                title={player1 ? player1.name : 'Click Waiting List to select'}
              >
                {player1 ? player1.name : '— Select Player 1 —'}
              </div>
              <div className="text-[11px] font-mono text-pink-300 font-semibold tracking-wider">
                {player1 ? player1.rollNumber : 'Roll No: —'}
              </div>
            </div>

            {/* Big LED Digital Score Display */}
            <div className="w-full bg-slate-950/90 rounded-lg py-4 px-2 border border-pink-950 flex items-center justify-center shadow-inner my-1">
              <span className="text-4xl sm:text-5xl font-black font-led text-pink-500 neon-glow-pink">
                {String(p1Score).padStart(2, '0')}
              </span>
            </div>

            {/* Score Buttons (+ and -) */}
            <div className="flex items-center gap-3 mt-3 w-full justify-center" onClick={(e) => e.stopPropagation()}>
              <button
                onClick={handleP1Dec}
                disabled={p1Score <= 0}
                className="w-11 h-10 rounded-lg bg-slate-800 hover:bg-pink-950 text-slate-200 hover:text-pink-300 border border-slate-700 hover:border-pink-600 font-black text-xl flex items-center justify-center transition-all disabled:opacity-40 disabled:pointer-events-none active:scale-95"
                title="Decrease Player 1 Score"
              >
                -
              </button>
              <button
                onClick={handleP1Inc}
                className="w-11 h-10 rounded-lg bg-pink-600 hover:bg-pink-500 text-white font-black text-xl flex items-center justify-center shadow-neon-pink hover:shadow-lg transition-all active:scale-95"
                title="Increase Player 1 Score"
              >
                +
              </button>
            </div>
          </div>

          {/* RIGHT: PLAYER 2 */}
          <div 
            onClick={() => onSelectSlot && onSelectSlot(2)}
            className={`bg-slate-900/90 rounded-xl p-3.5 border relative flex flex-col items-center shadow-lg transition-all cursor-pointer ${
              activeSlot === 2
                ? 'border-cyan-400 shadow-neon-cyan ring-1 ring-cyan-400/50'
                : 'border-cyan-900/40 hover:border-cyan-500/60'
            }`}
          >
            <div className="flex items-center justify-between w-full mb-1">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-cyan-400 uppercase tracking-wider">
                <User className="w-3.5 h-3.5 text-cyan-400" />
                <span>PLAYER 2</span>
              </div>
              {player2 && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (onClearPlayer) onClearPlayer(2);
                  }}
                  className="text-[10px] text-slate-500 hover:text-rose-400 font-mono"
                  title="Clear Player 2"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Student Name & Roll Number Details */}
            <div className="w-full text-center mb-2.5 min-h-[38px] flex flex-col justify-center">
              <div 
                className="text-xs sm:text-sm font-bold text-slate-100 truncate max-w-full"
                title={player2 ? player2.name : 'Click Waiting List to select'}
              >
                {player2 ? player2.name : '— Select Player 2 —'}
              </div>
              <div className="text-[11px] font-mono text-cyan-300 font-semibold tracking-wider">
                {player2 ? player2.rollNumber : 'Roll No: —'}
              </div>
            </div>

            {/* Big LED Digital Score Display */}
            <div className="w-full bg-slate-950/90 rounded-lg py-4 px-2 border border-cyan-950 flex items-center justify-center shadow-inner my-1">
              <span className="text-4xl sm:text-5xl font-black font-led text-cyan-400 neon-glow-cyan">
                {String(p2Score).padStart(2, '0')}
              </span>
            </div>

            {/* Score Buttons (+ and -) */}
            <div className="flex items-center gap-3 mt-3 w-full justify-center" onClick={(e) => e.stopPropagation()}>
              <button
                onClick={handleP2Dec}
                disabled={p2Score <= 0}
                className="w-11 h-10 rounded-lg bg-slate-800 hover:bg-cyan-950 text-slate-200 hover:text-cyan-300 border border-slate-700 hover:border-cyan-600 font-black text-xl flex items-center justify-center transition-all disabled:opacity-40 disabled:pointer-events-none active:scale-95"
                title="Decrease Player 2 Score"
              >
                -
              </button>
              <button
                onClick={handleP2Inc}
                className="w-11 h-10 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black text-xl flex items-center justify-center shadow-neon-cyan hover:shadow-lg transition-all active:scale-95"
                title="Increase Player 2 Score"
              >
                +
              </button>
            </div>
          </div>

        </div>
      </div>

      {/* Success Notification Bar */}
      {lastSavedMessage && (
        <div className="mt-3 py-2 px-3 bg-emerald-950/80 border border-emerald-500/40 rounded-lg flex items-center gap-2 text-xs text-emerald-300 animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
          <span className="truncate">{lastSavedMessage}</span>
        </div>
      )}

      {/* Match Actions: RESET and SAVE SCORE */}
      <div className="mt-5 pt-3.5 border-t border-slate-800 flex flex-col sm:flex-row items-center gap-3">
        <button
          onClick={handleReset}
          className="w-full sm:w-1/3 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold uppercase tracking-wider bg-slate-800/80 hover:bg-slate-700 text-slate-300 border border-slate-700 hover:border-slate-500 transition-all active:scale-95"
          title="Reset both scores to 0"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset</span>
        </button>

        <button
          onClick={handleSave}
          disabled={!player1 || !player2 || isSaving}
          className="w-full sm:w-2/3 flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider bg-gradient-to-r from-cyan-500 to-emerald-400 hover:from-cyan-400 hover:to-emerald-300 text-slate-950 shadow-neon-cyan transition-all disabled:opacity-40 disabled:cursor-not-allowed active:scale-95"
          title="Save match score to leaderboard"
        >
          <Save className="w-4 h-4" />
          <span>{isSaving ? 'Saving Match...' : 'Save Score to Leaderboard'}</span>
        </button>
      </div>

    </div>
  );
}
