'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Header from '@/components/Header';
import Scorecard from '@/components/Scorecard';
import Leaderboard from '@/components/Leaderboard';
import WaitingList from '@/components/WaitingList';
import ManualRegistrationModal from '@/components/ManualRegistrationModal';
import RfidApiModal from '@/components/RfidApiModal';

export default function ArcadeDashboard() {
  const [waitingList, setWaitingList] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  const [totalPlayed, setTotalPlayed] = useState(0);
  const [activePlayer, setActivePlayer] = useState(null);
  const [isLeaderboardOnly, setIsLeaderboardOnly] = useState(false);
  
  // Modals
  const [isManualModalOpen, setIsManualModalOpen] = useState(false);
  const [isApiModalOpen, setIsApiModalOpen] = useState(false);
  
  // Loading states
  const [isLoadingQueue, setIsLoadingQueue] = useState(false);
  const [isLoadingLeaderboard, setIsLoadingLeaderboard] = useState(false);
  const [isSavingScore, setIsSavingScore] = useState(false);

  // Fetch Waiting List from API
  const fetchWaitingList = useCallback(async () => {
    try {
      const res = await fetch('/api/waiting-list');
      if (res.ok) {
        const data = await res.json();
        if (data.success && Array.isArray(data.list)) {
          setWaitingList(data.list);
        }
      }
    } catch (err) {
      console.error('Error fetching waiting list:', err);
    }
  }, []);

  // Fetch Leaderboard from API (supports optional search query)
  const fetchLeaderboard = useCallback(async (search = '') => {
    setIsLoadingLeaderboard(true);
    try {
      const url = search ? `/api/leaderboard?search=${encodeURIComponent(search)}` : '/api/leaderboard';
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setLeaderboard(data.leaderboard || []);
          setTotalPlayed(data.totalPlayed || 0);
        }
      }
    } catch (err) {
      console.error('Error fetching leaderboard:', err);
    } finally {
      setIsLoadingLeaderboard(false);
    }
  }, []);

  // Initial load and auto-polling for real-time RFID scans
  useEffect(() => {
    fetchWaitingList();
    fetchLeaderboard();

    // Poll waiting list every 3.5 seconds to detect new RFID scans from hardware automatically
    const pollInterval = setInterval(() => {
      fetchWaitingList();
    }, 3500);

    return () => clearInterval(pollInterval);
  }, [fetchWaitingList, fetchLeaderboard]);

  // Escape key listener to exit Leaderboard Only view
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isLeaderboardOnly) {
        setIsLeaderboardOnly(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isLeaderboardOnly]);

  /**
   * When a user clicks any Roll Number in the Waiting List:
   * Look up student name from database and set active player in the Scorecard!
   */
  const handleSelectPlayerFromQueue = async (item) => {
    const roll = item.rollNumber;
    
    // If name is already present on the item and not generic
    if (item.name && !item.name.startsWith('Student (') && !item.name.startsWith('Player (')) {
      setActivePlayer({
        rollNumber: roll,
        name: item.name,
        mail: item.mail || ''
      });
      return;
    }

    // Otherwise, fetch fresh student name from MongoDB / database file
    try {
      const res = await fetch(`/api/student/${encodeURIComponent(roll)}`);
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.student) {
          setActivePlayer({
            rollNumber: roll,
            name: data.student.name,
            mail: data.student.mail
          });
          return;
        }
      }
    } catch (err) {
      console.warn('Student lookup error:', err);
    }

    // Fallback if not found
    setActivePlayer({
      rollNumber: roll,
      name: item.name || `Student ${roll}`,
      mail: item.mail || ''
    });
  };

  /**
   * Remove a player from the waiting list
   */
  const handleRemoveFromQueue = async (idOrRoll) => {
    try {
      await fetch(`/api/waiting-list?id=${encodeURIComponent(idOrRoll)}`, {
        method: 'DELETE'
      });
      // If the removed player was active, clear active player
      if (activePlayer && (activePlayer.rollNumber === idOrRoll || activePlayer.id === idOrRoll)) {
        setActivePlayer(null);
      }
      fetchWaitingList();
    } catch (err) {
      console.error('Failed to remove player from queue:', err);
    }
  };

  /**
   * Handle Manual Registration from Modal
   */
  const handleRegisterManualPlayer = async ({ rollNumber, name, mail }) => {
    const res = await fetch('/api/waiting-list', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ rollNumber, name, mail })
    });
    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.error || 'Failed to register player');
    }

    await fetchWaitingList();

    // If scorecard has no player, auto-select newly registered player
    if (!activePlayer) {
      setActivePlayer({
        rollNumber,
        name: name || `Student ${rollNumber}`,
        mail: mail || ''
      });
    }

    return data;
  };

  /**
   * Save match score to Leaderboard
   */
  const handleSaveScore = async ({ playerName, rollNumber, playerScore, robotScore }) => {
    setIsSavingScore(true);
    try {
      const res = await fetch('/api/leaderboard', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          playerName,
          rollNumber,
          playerScore,
          robotScore
        })
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setLeaderboard(data.leaderboard || []);
        setTotalPlayed(data.totalPlayed || 0);

        // Remove the completed player from the waiting list queue
        if (rollNumber) {
          await handleRemoveFromQueue(rollNumber);
        }
        setActivePlayer(null);
        return { success: true };
      } else {
        alert(data.error || 'Failed to save score');
        return { success: false };
      }
    } catch (err) {
      console.error('Error saving match score:', err);
      alert('Error saving score: ' + err.message);
      return { success: false };
    } finally {
      setIsSavingScore(false);
    }
  };

  /**
   * Reset tournament data for live event (clears leaderboard & waiting list)
   */
  const handleResetEvent = async () => {
    const confirmed = window.confirm(
      '⚠️ RESET TOURNAMENT DATA?\n\nThis will clear all saved match scores, leaderboard rankings, and active waiting list queue.\n\nAll 9,933 registered student contacts will remain safe in the database.\n\nAre you sure you want to proceed?'
    );
    if (!confirmed) return;

    try {
      const res = await fetch('/api/admin/reset', { method: 'POST' });
      const data = await res.json();
      if (res.ok && data.success) {
        setActivePlayer(null);
        await fetchWaitingList();
        await fetchLeaderboard();
        alert('✅ Tournament data successfully reset to 0! Ready for the live event.');
      } else {
        alert('Failed to reset: ' + (data.error || 'Unknown error'));
      }
    } catch (err) {
      alert('Error resetting data: ' + err.message);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-between">
      
      {/* Top Header */}
      <Header
        onOpenApiModal={() => setIsApiModalOpen(true)}
        onOpenSimulateScan={() => setIsApiModalOpen(true)}
        onResetEvent={handleResetEvent}
        totalWaiting={waitingList.length}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        
        {/* If Leaderboard Only Mode is active: hide scorecard, waiting list, etc. */}
        {isLeaderboardOnly ? (
          <div className="w-full flex justify-center animate-fadeIn py-2">
            <Leaderboard
              leaderboard={leaderboard}
              totalPlayed={totalPlayed}
              onRefresh={fetchLeaderboard}
              onSearch={fetchLeaderboard}
              isLoading={isLoadingLeaderboard}
              isOnlyView={true}
              onToggleOnlyView={() => setIsLeaderboardOnly(false)}
            />
          </div>
        ) : (
          /* Normal 3-Section Grid Layout */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            
            {/* SECTION 1: SCORECARD (Left: 4 cols) */}
            <div className="lg:col-span-4 h-full">
              <Scorecard
                activePlayer={activePlayer}
                onSaveScore={handleSaveScore}
                onResetMatch={() => {}}
                isSaving={isSavingScore}
              />
            </div>

            {/* SECTION 2: LEADERBOARD (Middle: 5 cols) */}
            <div className="lg:col-span-5 h-full">
              <Leaderboard
                leaderboard={leaderboard}
                totalPlayed={totalPlayed}
                onRefresh={fetchLeaderboard}
                onSearch={fetchLeaderboard}
                isLoading={isLoadingLeaderboard}
                isOnlyView={false}
                onToggleOnlyView={() => setIsLeaderboardOnly(true)}
              />
            </div>

            {/* SECTION 3: WAITING LIST (Right: 3 cols) */}
            <div className="lg:col-span-3 h-full">
              <WaitingList
                waitingList={waitingList}
                activePlayer={activePlayer}
                onSelectPlayer={handleSelectPlayerFromQueue}
                onRemovePlayer={handleRemoveFromQueue}
                onOpenManualModal={() => setIsManualModalOpen(true)}
                isLoading={isLoadingQueue}
              />
            </div>

          </div>
        )}

      </main>

      {/* Footer info */}
      <footer className="border-t border-slate-800/80 bg-arcade-dark/80 backdrop-blur-sm py-4 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>
            Robotics Club NIT Warangal • Technozion Arcade 2026
          </span>
          <span className="font-mono text-cyan-400/80">
            Air Hockey Match Control Center
          </span>
        </div>
      </footer>

      {/* Manual Registration Modal (matches Image 3) */}
      <ManualRegistrationModal
        isOpen={isManualModalOpen}
        onClose={() => setIsManualModalOpen(false)}
        onRegisterStudent={handleRegisterManualPlayer}
      />

      {/* RFID Hardware API Specs & Simulator Modal (matches Image 1) */}
      <RfidApiModal
        isOpen={isApiModalOpen}
        onClose={() => setIsApiModalOpen(false)}
        onSimulatedScan={fetchWaitingList}
      />

    </div>
  );
}
