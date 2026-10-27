'use client';

import React, { useState } from 'react';
import { Clock, Radio, UserCheck, Trash2, ChevronRight, Search, X } from 'lucide-react';

export default function WaitingList({
  waitingList = [],
  activePlayer,
  onSelectPlayer,
  onRemovePlayer,
  onOpenManualModal,
  isLoading = false
}) {
  const [searchQuery, setSearchQuery] = useState('');

  // Filter list based on roll number or name
  const filteredList = waitingList.filter((item) => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return true;
    const matchRoll = item.rollNumber && item.rollNumber.toLowerCase().includes(query);
    const matchName = item.name && item.name.toLowerCase().includes(query);
    return matchRoll || matchName;
  });

  return (
    <div className="bg-arcade-card/95 border border-slate-800 rounded-2xl p-5 sm:p-6 shadow-xl flex flex-col justify-between relative overflow-hidden backdrop-blur-md h-full">
      
      {/* Background glow */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-600/10 rounded-full blur-3xl pointer-events-none"></div>

      <div className="flex flex-col flex-1 min-h-0">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800/80 mb-3">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-cyan-400 animate-spin-slow" />
            <h2 className="text-sm font-bold tracking-widest uppercase text-cyan-400 font-tech">
              WAITING LIST QUEUE
            </h2>
          </div>
          <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-md bg-cyan-950/80 text-cyan-300 border border-cyan-800/70">
            {waitingList.length} IN QUEUE
          </span>
        </div>

        {/* Search Window in Waiting List (Requirement 1) */}
        <div className="mb-3 relative">
          <div className="relative flex items-center">
            <Search className="w-4 h-4 text-cyan-400 absolute left-3 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search roll number..."
              className="w-full bg-[#080d16] border border-slate-800 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 rounded-xl pl-9 pr-8 py-2 text-xs text-white placeholder-slate-500 font-mono uppercase outline-none transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 text-slate-400 hover:text-slate-200 transition-colors"
                title="Clear search"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
          {searchQuery && (
            <div className="flex items-center justify-between mt-1.5 px-1 text-[10px] text-slate-400 font-mono">
              <span>Showing {filteredList.length} of {waitingList.length}</span>
              <button
                onClick={() => setSearchQuery('')}
                className="text-cyan-400 hover:underline"
              >
                Reset
              </button>
            </div>
          )}
        </div>

        {/* Quick Instructions Banner */}
        <div className="mb-2.5 px-3 py-1.5 rounded-lg bg-slate-900/60 border border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
          <span>👇 Click roll number to load player</span>
        </div>

        {/* Scrollable Waiting Queue (FIFO: oldest at top, newly added appended at bottom) */}
        <div className="flex-1 overflow-y-auto space-y-2 pr-1 max-h-[340px] min-h-[220px]">
          {filteredList.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center py-10 text-center text-slate-500">
              <Clock className="w-8 h-8 mb-2 text-slate-600 opacity-50" />
              {searchQuery ? (
                <div>
                  <p className="text-xs text-slate-400 font-mono">No student matching &ldquo;{searchQuery}&rdquo;</p>
                  <button
                    onClick={() => setSearchQuery('')}
                    className="mt-2 text-xs text-cyan-400 hover:underline font-mono"
                  >
                    Clear search filter
                  </button>
                </div>
              ) : (
                <div>
                  <p className="text-xs">Queue is currently empty.</p>
                  <p className="text-[11px] text-slate-600 mt-1 max-w-[200px]">
                    Tap RFID card or click <strong className="text-cyan-400">+ MANUAL REGISTRATION</strong> below.
                  </p>
                </div>
              )}
            </div>
          ) : (
            filteredList.map((item, index) => {
              const isSelected = activePlayer && activePlayer.rollNumber === item.rollNumber;
              const queueNumber = waitingList.findIndex((w) => w.id === item.id || w.rollNumber === item.rollNumber) + 1;

              return (
                <div
                  key={item.id || index}
                  onClick={() => onSelectPlayer(item)}
                  className={`group cursor-pointer p-3 rounded-xl border transition-all flex items-center justify-between ${
                    isSelected
                      ? 'bg-cyan-950/40 border-cyan-400 shadow-neon-cyan'
                      : 'bg-slate-900/80 border-slate-800 hover:border-cyan-500/60 hover:bg-slate-850'
                  }`}
                  title="Click to load name into scorecard"
                >
                  {/* Left: Queue Number & Roll Number */}
                  <div className="flex items-center gap-3 min-w-0 pr-2">
                    <span
                      className={`w-6 h-6 rounded-md font-mono text-xs font-bold flex items-center justify-center flex-shrink-0 ${
                        isSelected
                          ? 'bg-cyan-400 text-slate-950'
                          : 'bg-slate-800 text-slate-400 group-hover:text-cyan-300'
                      }`}
                    >
                      {queueNumber || index + 1}
                    </span>

                    <div className="min-w-0">
                      {/* Prominent Roll Number as requested */}
                      <div className="text-sm font-black font-mono tracking-wider text-cyan-300 group-hover:text-cyan-200 truncate flex items-center gap-1.5">
                        <span>{item.rollNumber}</span>
                        {isSelected && (
                          <span className="text-[10px] uppercase font-sans font-bold bg-cyan-400 text-slate-950 px-1.5 py-0.2 rounded">
                            Playing
                          </span>
                        )}
                      </div>

                      {/* Source tag & indicator */}
                      <div className="flex items-center gap-2 mt-0.5 text-[10px] text-slate-400 font-mono">
                        <span className="flex items-center gap-1">
                          {item.source === 'MANUAL' ? (
                            <UserCheck className="w-3 h-3 text-purple-400" />
                          ) : (
                            <Radio className="w-3 h-3 text-emerald-400" />
                          )}
                          <span className={item.source === 'MANUAL' ? 'text-purple-300' : 'text-emerald-300'}>
                            {item.source || 'RFID'}
                          </span>
                        </span>
                        <span>•</span>
                        <span className="truncate max-w-[120px] text-slate-400">
                          {item.name ? item.name : 'Click to fetch name'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Right: Load Arrow & Remove button */}
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onRemovePlayer(item.id || item.rollNumber);
                      }}
                      className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-950/40 opacity-0 group-hover:opacity-100 transition-all"
                      title="Remove from queue"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>

                    <div className="w-6 h-6 rounded-full flex items-center justify-center text-slate-500 group-hover:text-cyan-400 transition-colors">
                      <ChevronRight className="w-4 h-4" />
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Bottom: "+ MANUAL REGISTRATION" Button */}
      <div className="mt-4 pt-3 border-t border-slate-800">
        <button
          onClick={onOpenManualModal}
          className="w-full py-3 px-4 rounded-xl font-mono text-xs font-bold tracking-widest uppercase text-cyan-400 bg-slate-900/90 hover:bg-cyan-950/40 border border-dashed border-cyan-400/80 hover:border-cyan-300 shadow-sm hover:shadow-neon-cyan transition-all flex items-center justify-center gap-2 active:scale-98"
          title="Manual registration for students without RFID card"
        >
          <span className="text-base leading-none font-bold">+</span>
          <span>MANUAL REGISTRATION</span>
        </button>
      </div>

    </div>
  );
}
