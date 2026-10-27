'use client';

import React, { useState } from 'react';
import { Bot, User, RotateCcw, Trophy, Save, Zap, AlertCircle, CheckCircle2 } from 'lucide-react';
import confetti from 'canvas-confetti';

export default function Scorecard({ activePlayer, onSaveScore, onResetMatch, isSaving = false }) {
  const [robotScore, setRobotScore] = useState(0);
  const [playerScore, setPlayerScore] = useState(0);
  const [lastSavedMessage, setLastSavedMessage] = useState(null);

  // Score handlers
  const handleRobotInc = () => setRobotScore(prev => prev + 1);
  const handleRobotDec = () => setRobotScore(prev => Math.max(0, prev - 1));

  const handlePlayerInc = () => setPlayerScore(prev => prev + 1);
  const handlePlayerDec = () => setPlayerScore(prev => Math.max(0, prev - 1));

  const handleReset = () => {
    setRobotScore(0);
    setPlayerScore(0);
    setLastSavedMessage(null);
    if (onResetMatch) onResetMatch();
  };

  const handleSave = async () => {
    if (!activePlayer) {
      alert('Please select a player from the waiting list first!');
      return;
    }

    // Trigger confetti celebration if player won!
    if (playerScore > robotScore) {
      try {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 }
        });
      } catch (e) {
        // Confetti non-fatal
      }
    }

    const payload = {
      playerName: activePlayer.name || `Student ${activePlayer.rollNumber}`,
      rollNumber: activePlayer.rollNumber,
      playerScore,
      robotScore
    };

    if (onSaveScore) {
      const res = await onSaveScore(payload);
      if (res && res.success) {
        setLastSavedMessage(`Saved match: ${activePlayer.name} (${playerScore}) vs Robot (${robotScore})`);
        setTimeout(() => setLastSavedMessage(null), 4000);
      }
    }
  };

  const isMatchStarted = robotScore > 0 || playerScore > 0;
  const leaderStatus = playerScore > robotScore ? 'PLAYER LEADING' : robotScore > playerScore ? 'ROBOT LEADING' : 'TIED';

  return (
    <div className="bg-arcade-card/95 border border-slate-800 rounded-2xl p-5 sm:p-6 shadow-xl flex flex-col justify-between relative overflow-hidden backdrop-blur-md">
      
      {/* Background neon ambient highlights */}
      <div className="absolute top-0 left-0 w-32 h-32 bg-pink-600/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-0 right-0 w-32 h-32 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none"></div>

      {/* Card Header */}
      <div>
        <div className="flex items-center justify-between pb-3 border-b border-slate-800/80 mb-5">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-ping"></span>
            <h2 className="text-sm font-bold tracking-widest uppercase text-cyan-400 font-tech">
              LIVE MATCH SCORECARD
            </h2>
          </div>
          <span className={`text-[10px] font-mono uppercase px-2.5 py-0.5 rounded-full border ${
            playerScore > robotScore 
              ? 'bg-cyan-950/80 text-cyan-300 border-cyan-800/70' 
              : robotScore > playerScore 
              ? 'bg-pink-950/80 text-pink-300 border-pink-800/70' 
              : 'bg-slate-800 text-slate-400 border-slate-700'
          }`}>
            {leaderStatus}
          </span>
        </div>

        {/* Selected Player Alert if none loaded */}
        {!activePlayer && (
          <div className="mb-5 bg-cyan-950/30 border border-cyan-500/30 rounded-xl p-3 flex items-start gap-2.5 text-xs text-cyan-200">
            <AlertCircle className="w-4 h-4 text-cyan-400 flex-shrink-0 mt-0.5 animate-bounce" />
            <div>
              <span className="font-semibold text-cyan-300">No student loaded for the match!</span>
              <p className="text-slate-400 text-[11px] mt-0.5">
                Click any <strong className="text-cyan-300 font-mono">Roll Number</strong> in the Waiting List on the right to load their name here.
              </p>
            </div>
          </div>
        )}

        {/* Two-Column Score Arena */}
        <div className="grid grid-cols-2 gap-4 sm:gap-6 my-2">
          
          {/* LEFT: ROBOT SIDE */}
          <div className="bg-slate-900/90 rounded-xl p-4 border border-pink-900/40 relative flex flex-col items-center shadow-lg group hover:border-pink-600/60 transition-all">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-pink-400 uppercase tracking-wider mb-1">
              <Bot className="w-4 h-4 text-pink-400" />
              <span>ROBOT</span>
            </div>
            <div className="text-[11px] font-mono text-slate-400 truncate max-w-full mb-3 text-center">
              Autonomous Bot
            </div>

            {/* Big LED Digital Score Display */}
            <div className="w-full bg-slate-950/90 rounded-lg py-5 px-3 border border-pink-950 flex items-center justify-center shadow-inner my-1">
              <span className="text-5xl sm:text-6xl font-black font-led text-pink-500 neon-glow-pink">
                {String(robotScore).padStart(2, '0')}
              </span>
            </div>

            {/* Score Buttons (+ and -) */}
            <div className="flex items-center gap-3 mt-4 w-full justify-center">
              <button
                onClick={handleRobotDec}
                disabled={robotScore <= 0}
                className="w-12 h-11 rounded-lg bg-slate-800 hover:bg-pink-950 text-slate-200 hover:text-pink-300 border border-slate-700 hover:border-pink-600 font-black text-xl flex items-center justify-center transition-all disabled:opacity-40 disabled:pointer-events-none active:scale-95"
                title="Decrease Robot Score"
              >
                -
              </button>
              <button
                onClick={handleRobotInc}
                className="w-12 h-11 rounded-lg bg-pink-600 hover:bg-pink-500 text-white font-black text-xl flex items-center justify-center shadow-neon-pink hover:shadow-lg transition-all active:scale-95"
                title="Increase Robot Score"
              >
                +
              </button>
            </div>
          </div>

          {/* RIGHT: STUDENT / PLAYER SIDE */}
          <div className="bg-slate-900/90 rounded-xl p-4 border border-cyan-900/40 relative flex flex-col items-center shadow-lg group hover:border-cyan-500/60 transition-all">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-cyan-400 uppercase tracking-wider mb-1">
              <User className="w-4 h-4 text-cyan-400" />
              <span>PLAYER</span>
            </div>

            {/* Student Name & Roll Number Details */}
            <div className="w-full text-center mb-3">
              <div 
                className="text-xs sm:text-sm font-bold text-slate-100 truncate max-w-full"
                title={activePlayer ? activePlayer.name : 'Waiting for selection'}
              >
                {activePlayer ? activePlayer.name : '— Select Player —'}
              </div>
              <div className="text-[11px] font-mono text-cyan-300 font-semibold tracking-wider">
                {activePlayer ? activePlayer.rollNumber : 'Roll No: —'}
              </div>
            </div>

            {/* Big LED Digital Score Display */}
            <div className="w-full bg-slate-950/90 rounded-lg py-5 px-3 border border-cyan-950 flex items-center justify-center shadow-inner my-1">
              <span className="text-5xl sm:text-6xl font-black font-led text-cyan-400 neon-glow-cyan">
                {String(playerScore).padStart(2, '0')}
              </span>
            </div>

            {/* Score Buttons (+ and -) */}
            <div className="flex items-center gap-3 mt-4 w-full justify-center">
              <button
                onClick={handlePlayerDec}
                disabled={playerScore <= 0}
                className="w-12 h-11 rounded-lg bg-slate-800 hover:bg-cyan-950 text-slate-200 hover:text-cyan-300 border border-slate-700 hover:border-cyan-600 font-black text-xl flex items-center justify-center transition-all disabled:opacity-40 disabled:pointer-events-none active:scale-95"
                title="Decrease Player Score"
              >
                -
              </button>
              <button
                onClick={handlePlayerInc}
                className="w-12 h-11 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black text-xl flex items-center justify-center shadow-neon-cyan hover:shadow-lg transition-all active:scale-95"
                title="Increase Player Score"
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
      <div className="mt-6 pt-4 border-t border-slate-800 flex flex-col sm:flex-row items-center gap-3">
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
          disabled={!activePlayer || isSaving}
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
