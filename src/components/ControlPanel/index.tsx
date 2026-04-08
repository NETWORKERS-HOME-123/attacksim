'use client';

import React from 'react';
import { useSimulationStore } from '@/store/simulationStore';

// ============================================
// Control Panel Component
// ============================================

interface ControlPanelProps {
  onStart: () => void;
  onPause: () => void;
  onResume: () => void;
  onStop: () => void;
  isRunning: boolean;
  isPaused: boolean;
}

export const ControlPanel: React.FC<ControlPanelProps> = ({
  onStart,
  onPause,
  onResume,
  onStop,
  isRunning,
  isPaused,
}) => {
  const { currentScenario, state, isGameOver, gameResult, gameOverReason, resetGame } = useSimulationStore();

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getRemainingTime = (): number => {
    if (!state) return currentScenario.timeLimit;
    return Math.max(0, currentScenario.timeLimit - Math.floor(state.currentTime / 1000));
  };

  return (
    <div className="bg-gray-900 rounded-lg border border-gray-700 p-4">
      {/* Scenario Info */}
      <div className="mb-4">
        <h2 className="text-xl font-bold text-gray-100">{currentScenario.name}</h2>
        <p className="text-sm text-gray-400 mt-1">{currentScenario.description}</p>
      </div>

      {/* Game Over Overlay */}
      {isGameOver && (
        <div className={`mb-4 p-4 rounded-lg border-2 ${
          gameResult === 'won' 
            ? 'bg-green-900/30 border-green-500 text-green-200' 
            : 'bg-red-900/30 border-red-500 text-red-200'
        }`}>
          <h3 className="text-lg font-bold">
            {gameResult === 'won' ? '🎉 MISSION ACCOMPLISHED' : '💀 MISSION FAILED'}
          </h3>
          <p className="text-sm mt-1">{gameOverReason}</p>
          <button
            onClick={resetGame}
            className="mt-3 px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded text-sm font-medium transition-colors"
          >
            Play Again
          </button>
        </div>
      )}

      {/* Control Buttons */}
      <div className="flex gap-2 mb-4">
        {!isRunning && !isGameOver && (
          <button
            onClick={onStart}
            className="flex-1 bg-green-600 hover:bg-green-500 text-white px-4 py-2 rounded font-medium transition-colors"
          >
            ▶ Start Simulation
          </button>
        )}
        
        {isRunning && !isPaused && (
          <button
            onClick={onPause}
            className="flex-1 bg-yellow-600 hover:bg-yellow-500 text-white px-4 py-2 rounded font-medium transition-colors"
          >
            ⏸ Pause
          </button>
        )}
        
        {isRunning && isPaused && (
          <>
            <button
              onClick={onResume}
              className="flex-1 bg-green-600 hover:bg-green-500 text-white px-4 py-2 rounded font-medium transition-colors"
            >
              ▶ Resume
            </button>
            <button
              onClick={onStop}
              className="flex-1 bg-red-600 hover:bg-red-500 text-white px-4 py-2 rounded font-medium transition-colors"
            >
              ⏹ Stop
            </button>
          </>
        )}
      </div>

      {/* Status Display */}
      {state && (
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="bg-gray-800 p-3 rounded">
            <span className="text-gray-400">Time Remaining</span>
            <p className={`text-lg font-mono font-bold ${
              getRemainingTime() < 60 ? 'text-red-400' : 'text-white'
            }`}>
              {formatTime(getRemainingTime())}
            </p>
          </div>

          <div className="bg-gray-800 p-3 rounded">
            <span className="text-gray-400">Score</span>
            <p className="text-lg font-mono font-bold text-white">
              {state.score.totalScore.toLocaleString()}
            </p>
          </div>

          <div className="bg-gray-800 p-3 rounded">
            <span className="text-gray-400">Compromised</span>
            <p className={`text-lg font-mono font-bold ${
              state.topology.devices.filter(d => d.status === 'compromised').length > 2
                ? 'text-red-400' : 'text-white'
            }`}>
              {state.topology.devices.filter(d => d.status === 'compromised').length}
              <span className="text-gray-500 text-sm">/{state.topology.devices.length}</span>
            </p>
          </div>

          <div className="bg-gray-800 p-3 rounded">
            <span className="text-gray-400">Isolated</span>
            <p className="text-lg font-mono font-bold text-white">
              {state.topology.devices.filter(d => d.status === 'isolated').length}
            </p>
          </div>
        </div>
      )}

      {/* Objectives */}
      <div className="mt-4 pt-4 border-t border-gray-700">
        <h4 className="text-sm font-semibold text-gray-300 mb-2">Objectives</h4>
        <ul className="space-y-1">
          {currentScenario.objectives.map((objective, idx) => (
            <li key={idx} className="text-sm text-gray-400 flex items-start gap-2">
              <span className="text-gray-500">•</span>
              {objective}
            </li>
          ))}
        </ul>
      </div>

      {/* Win/Lose Conditions */}
      <div className="mt-4 pt-4 border-t border-gray-700">
        <h4 className="text-sm font-semibold text-gray-300 mb-2">Win Condition</h4>
        <p className="text-sm text-green-400">
          ✓ {currentScenario.winConditions[0]?.description}
        </p>
        
        <h4 className="text-sm font-semibold text-gray-300 mt-3 mb-2">Fail Condition</h4>
        <p className="text-sm text-red-400">
          ✗ {currentScenario.failConditions[0]?.description}
        </p>
      </div>
    </div>
  );
};

export default ControlPanel;
