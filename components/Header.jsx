'use client';

import React from 'react';
import { Gamepad2, Radio, Database, Sparkles, Cpu, RotateCcw } from 'lucide-react';

export default function Header({ onOpenApiModal, onOpenSimulateScan, onResetEvent, totalWaiting = 0, dbConnected = false }) {
  return (
    <header className="border-b border-slate-800/80 bg-arcade-dark/80 backdrop-blur-md sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex flex-wrap items-center justify-between gap-4">
        
        {/* Left: Branding & Event Identity */}
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-cyan-500 to-fuchsia-600 p-[2px] shadow-neon-cyan flex-shrink-0">
            <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
              <Gamepad2 className="w-6 h-6 text-cyan-400 animate-pulse" />
            </div>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] sm:text-xs font-bold tracking-widest uppercase bg-fuchsia-950/70 text-fuchsia-400 px-2 py-0.5 rounded border border-fuchsia-800/60">
                TECHNOZION &apos;26
              </span>
              <span className="text-[10px] sm:text-xs font-semibold tracking-wider uppercase text-slate-400 flex items-center gap-1">
                <Cpu className="w-3 h-3 text-cyan-400" /> Robotics Club NITW
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-pink-400 to-purple-400 font-tech">
              ARCADE <span className="text-cyan-400 font-arcade text-sm sm:text-base">(AIR HOCKEY)</span>
            </h1>
          </div>
        </div>

        {/* Right: Embedded API Specs, RFID Simulator, and System Status */}
        <div className="flex items-center flex-wrap gap-2.5 sm:gap-3">
          {/* Quick RFID Simulator Button */}
          <button
            onClick={onOpenSimulateScan}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-cyan-950/40 text-cyan-300 border border-cyan-800/60 hover:bg-cyan-900/40 hover:border-cyan-400 transition-all shadow-sm"
            title="Simulate RFID card tap for testing"
          >
            <Radio className="w-3.5 h-3.5 text-cyan-400 animate-ping" />
            <span>Simulate RFID Tap</span>
          </button>

          {/* Embedded API Specs Button */}
          <button
            onClick={onOpenApiModal}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-purple-950/40 text-purple-300 border border-purple-800/60 hover:bg-purple-900/40 hover:border-purple-400 transition-all"
            title="View API specs and cURL commands for Embedded Team"
          >
            <Sparkles className="w-3.5 h-3.5 text-purple-400" />
            <span>RFID API Endpoints</span>
          </button>

          {/* Reset Event Button for Organizers */}
          <button
            onClick={onResetEvent}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-rose-950/40 text-rose-300 border border-rose-800/60 hover:bg-rose-900/40 hover:border-rose-400 transition-all"
            title="Reset Leaderboard and Waiting List for clean event start"
          >
            <RotateCcw className="w-3.5 h-3.5 text-rose-400" />
            <span>Reset Event Data</span>
          </button>

          {/* Database & Queue Status Pill */}
          <div className="hidden md:flex items-center gap-2 text-xs text-slate-400 bg-slate-900/80 px-3 py-1.5 rounded-lg border border-slate-800">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="font-mono text-slate-300">Queue: <strong className="text-cyan-400">{totalWaiting}</strong></span>
          </div>
        </div>

      </div>
    </header>
  );
}
