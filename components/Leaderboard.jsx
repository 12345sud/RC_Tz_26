'use client';

import React, { useState, useEffect } from 'react';
import { Trophy, Flame, Users, RefreshCw, Maximize2, Minimize2, ArrowLeft, Search, X } from 'lucide-react';

export default function Leaderboard({
  leaderboard = [],
  totalPlayed = 0,
  onRefresh,
  onSearch,
  isLoading = false,
  isOnlyView = false,
  onToggleOnlyView
}) {
  const [searchQuery, setSearchQuery] = useState('');

  // When search query changes, trigger search callback if provided
  const handleSearchChange = (e) => {
    const val = e.target.value;
    setSearchQuery(val);
    if (onSearch) {
      onSearch(val);
    }
  };

  const handleClearSearch = () => {
    setSearchQuery('');
    if (onSearch) {
      onSearch('');
    }
  };

  // If onSearch is not provided by parent, fallback to client-side filtering
  const displayList = onSearch
    ? leaderboard
    : leaderboard.filter((item) => {
        const q = searchQuery.trim().toLowerCase();
        if (!q) return true;
        const matchName = item.playerName && item.playerName.toLowerCase().includes(q);
        const matchRoll = item.rollNumber && item.rollNumber.toLowerCase().includes(q);
        return matchName || matchRoll;
      });

  const isSearching = searchQuery.trim().length > 0;

  return (
    <div
      className={`bg-arcade-card/95 border border-slate-800 rounded-2xl p-5 sm:p-6 shadow-xl flex flex-col justify-between relative overflow-hidden backdrop-blur-md transition-all ${
        isOnlyView ? 'w-full max-w-5xl mx-auto border-amber-500/40 shadow-neon-gold my-4' : 'h-full'
      }`}
    >
      {/* Background glow */}
      <div className="absolute top-0 right-0 w-48 h-48 bg-amber-500/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 w-48 h-48 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none"></div>

      <div>
        {/* Header with Title, Controls, and Mode Toggle */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800/80 mb-3.5">
          <div className="flex items-center gap-2.5">
            <Trophy className="w-5 h-5 text-amber-400 animate-pulse" />
            <h2 className="text-sm sm:text-base font-bold tracking-widest uppercase text-amber-400 font-tech">
              ARCADE LEADERBOARD {isOnlyView && <span className="text-cyan-400 text-xs">(FULL VIEW)</span>}
            </h2>
          </div>

          <div className="flex items-center gap-2">
            {/* Refresh button */}
            <button
              onClick={() => onRefresh && onRefresh(searchQuery)}
              disabled={isLoading}
              className="p-1.5 rounded-lg bg-slate-800/60 hover:bg-slate-700 text-slate-400 hover:text-slate-200 transition-all active:scale-95"
              title="Refresh Leaderboard"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-cyan-400' : ''}`} />
            </button>

            {/* Button to show ONLY the leaderboard */}
            <button
              onClick={onToggleOnlyView}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-mono font-semibold transition-all border ${
                isOnlyView
                  ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-neon-gold'
                  : 'bg-amber-950/40 text-amber-300 border-amber-800/60 hover:bg-amber-900/50 hover:border-amber-400'
              }`}
              title={isOnlyView ? 'Exit Leaderboard Only View (ESC)' : 'Only Show Leaderboard (Hide Scorecard & Waiting List)'}
            >
              {isOnlyView ? (
                <>
                  <Minimize2 className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Exit Full View</span>
                </>
              ) : (
                <>
                  <Maximize2 className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Leaderboard Only</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Total Player Played Banner */}
        <div className="mb-3.5 bg-gradient-to-r from-slate-900 via-amber-950/25 to-slate-900 border border-amber-500/30 rounded-xl p-3 sm:p-4 flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center">
              <Users className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <div className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-slate-400">
                Total Players Played
              </div>
              <div className="text-xs sm:text-sm text-slate-200 font-medium">
                Matches Recorded So Far
              </div>
            </div>
          </div>

          <div className="text-right">
            <span className="text-3xl sm:text-4xl font-black font-led text-amber-400 neon-glow-gold">
              {totalPlayed}
            </span>
          </div>
        </div>

        {/* REQUIREMENT 2: Search Box on Leaderboard */}
        <div className="mb-3 relative">
          <div className="relative flex items-center">
            <Search className="w-4 h-4 text-amber-400 absolute left-3 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={handleSearchChange}
              placeholder="Search player score by name or roll number..."
              className="w-full bg-[#080d16] border border-slate-800 focus:border-amber-400 focus:ring-1 focus:ring-amber-400 rounded-xl pl-9 pr-8 py-2 text-xs text-white placeholder-slate-500 font-sans outline-none transition-all"
            />
            {searchQuery && (
              <button
                onClick={handleClearSearch}
                className="absolute right-2.5 text-slate-400 hover:text-slate-200 transition-colors"
                title="Clear search"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
          {isSearching && (
            <div className="flex items-center justify-between mt-1 px-1 text-[10px] text-amber-400/90 font-mono">
              <span>Showing search results for &ldquo;{searchQuery}&rdquo;</span>
              <button
                onClick={handleClearSearch}
                className="text-amber-400 hover:underline"
              >
                Reset to Top 10
              </button>
            </div>
          )}
        </div>

        {/* Scores List */}
        <div className={`space-y-2 overflow-y-auto pr-1 ${isOnlyView ? 'max-h-[500px]' : 'max-h-[380px]'}`}>
          {displayList.length === 0 ? (
            <div className="py-10 text-center text-slate-500 text-xs">
              <Trophy className="w-8 h-8 mx-auto mb-2 text-slate-600 opacity-60" />
              {isSearching ? (
                <div>
                  <p className="text-slate-400">No score record found for &ldquo;{searchQuery}&rdquo;</p>
                  <button
                    onClick={handleClearSearch}
                    className="mt-2 text-xs text-amber-400 hover:underline font-mono"
                  >
                    Clear search and view Top 10
                  </button>
                </div>
              ) : (
                <div>
                  <p>No matches recorded yet.</p>
                  <p className="text-[11px] text-slate-600 mt-1">Play an air hockey game & save score to rank here!</p>
                </div>
              )}
            </div>
          ) : (
            displayList.map((item, index) => {
              const rank = item.rank || index + 1;
              const isGold = rank === 1;
              const isSilver = rank === 2;
              const isBronze = rank === 3;

              let rankBadgeStyle = 'bg-slate-800 text-slate-400 border-slate-700';
              let rowBorder = 'border-slate-800/80 bg-slate-900/60';

              if (isGold) {
                rankBadgeStyle = 'bg-amber-500/20 text-amber-300 border-amber-500/50 shadow-neon-gold';
                rowBorder = 'border-amber-500/40 bg-amber-950/20 shadow-md';
              } else if (isSilver) {
                rankBadgeStyle = 'bg-slate-300/20 text-slate-200 border-slate-400/50';
                rowBorder = 'border-slate-400/30 bg-slate-800/40';
              } else if (isBronze) {
                rankBadgeStyle = 'bg-amber-700/20 text-amber-600 border-amber-700/50';
                rowBorder = 'border-amber-700/30 bg-amber-950/15';
              }

              return (
                <div
                  key={item.id || index}
                  className={`flex items-center justify-between p-3 rounded-xl border ${rowBorder} hover:border-slate-600 transition-all ${
                    isOnlyView ? 'py-3.5' : ''
                  }`}
                >
                  {/* Left: Rank & Player info */}
                  <div className="flex items-center gap-3.5 min-w-0 pr-2">
                    <div
                      className={`w-8 h-8 rounded-lg border font-mono font-bold text-sm flex items-center justify-center flex-shrink-0 ${rankBadgeStyle}`}
                    >
                      {isGold ? <Flame className="w-4 h-4 text-amber-400" /> : `#${rank}`}
                    </div>

                    <div className="min-w-0">
                      <div className={`font-bold text-slate-100 truncate ${isOnlyView ? 'text-sm sm:text-base' : 'text-xs'}`}>
                        {item.playerName}
                      </div>
                      <div className="text-[11px] font-mono text-cyan-400 truncate">
                        {item.rollNumber}
                      </div>
                    </div>
                  </div>

                  {/* Right: Scores & Status */}
                  <div className="flex items-center gap-3 flex-shrink-0 text-right">
                    <div className="text-right">
                      <div className={`font-black font-led text-slate-100 ${isOnlyView ? 'text-lg sm:text-xl' : 'text-sm'}`}>
                        <span className="text-cyan-400">{item.playerScore}</span>
                        <span className="text-slate-500 mx-1.5">-</span>
                        <span className="text-pink-400">{item.robotScore}</span>
                      </div>
                      <div className="text-[10px] font-mono text-slate-500 uppercase">
                        vs Robot
                      </div>
                    </div>

                    <span
                      className={`text-[10px] font-bold px-2 py-1 rounded font-mono ${
                        item.result === 'WON'
                          ? 'bg-emerald-950 text-emerald-400 border border-emerald-800/60'
                          : item.result === 'LOST'
                          ? 'bg-rose-950 text-rose-400 border border-rose-800/60'
                          : 'bg-amber-950 text-amber-400 border border-amber-800/60'
                      }`}
                    >
                      {item.result || (item.playerScore > item.robotScore ? 'WON' : 'LOST')}
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      <div className="mt-4 pt-3 border-t border-slate-800/60 flex items-center justify-between text-xs text-slate-500 font-mono">
        <span className="uppercase tracking-widest text-[11px]">
          {isSearching ? 'Search Results' : 'Displaying Top 10 High Scorers'}
        </span>
        {isOnlyView && (
          <button
            onClick={onToggleOnlyView}
            className="text-cyan-400 hover:underline flex items-center gap-1"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to 3-Section Control View
          </button>
        )}
      </div>
    </div>
  );
}
