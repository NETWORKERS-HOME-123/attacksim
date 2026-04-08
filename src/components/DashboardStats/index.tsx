'use client';

import React from 'react';
import { useSimulationStore } from '@/store/simulationStore';

// ============================================
// Dashboard Stats Component
// ============================================

export const DashboardStats: React.FC = () => {
  const { state, currentScenario } = useSimulationStore();

  if (!state) {
    return (
      <div className="bg-gray-900 rounded-lg border border-gray-700 p-4">
        <h3 className="text-lg font-bold text-gray-300 mb-4">Simulation Statistics</h3>
        <p className="text-gray-500">No simulation data available</p>
      </div>
    );
  }

  const { topology, alerts, events, score, currentTime } = state;
  
  // Calculate statistics
  const totalDevices = topology.devices.length;
  const compromisedDevices = topology.devices.filter(d => d.status === 'compromised').length;
  const isolatedDevices = topology.devices.filter(d => d.status === 'isolated').length;
  const activeDevices = topology.devices.filter(d => d.status === 'active').length;
  const underAttackDevices = topology.devices.filter(d => d.status === 'under_attack').length;
  
  const criticalAlerts = alerts.filter(a => a.severity === 'critical' && !a.isAcknowledged).length;
  const highAlerts = alerts.filter(a => a.severity === 'high' && !a.isAcknowledged).length;
  const mediumAlerts = alerts.filter(a => a.severity === 'medium' && !a.isAcknowledged).length;
  const lowAlerts = alerts.filter(a => a.severity === 'low' && !a.isAcknowledged).length;
  
  const infectionRate = totalDevices > 0 ? (compromisedDevices / totalDevices) * 100 : 0;
  const elapsedSeconds = Math.floor(currentTime / 1000);
  const remainingSeconds = Math.max(0, currentScenario.timeLimit - elapsedSeconds);

  return (
    <div className="bg-gray-900 rounded-lg border border-gray-700 p-4">
      <h3 className="text-lg font-bold text-gray-300 mb-4">Live Dashboard</h3>
      
      {/* Main Stats Grid */}
      <div className="grid grid-cols-4 gap-3 mb-4">
        {/* Time Stats */}
        <div className="bg-gray-800 p-3 rounded-lg text-center">
          <p className="text-xs text-gray-400 uppercase tracking-wide">Elapsed</p>
          <p className="text-xl font-mono font-bold text-blue-400">
            {formatTime(elapsedSeconds)}
          </p>
        </div>
        
        <div className="bg-gray-800 p-3 rounded-lg text-center">
          <p className="text-xs text-gray-400 uppercase tracking-wide">Remaining</p>
          <p className={`text-xl font-mono font-bold ${remainingSeconds < 60 ? 'text-red-400' : 'text-green-400'}`}>
            {formatTime(remainingSeconds)}
          </p>
        </div>
        
        {/* Score Stats */}
        <div className="bg-gray-800 p-3 rounded-lg text-center">
          <p className="text-xs text-gray-400 uppercase tracking-wide">Score</p>
          <p className="text-xl font-mono font-bold text-yellow-400">
            {score.totalScore.toLocaleString()}
          </p>
        </div>
        
        <div className="bg-gray-800 p-3 rounded-lg text-center">
          <p className="text-xs text-gray-400 uppercase tracking-wide">Damage Prevented</p>
          <p className="text-xl font-mono font-bold text-purple-400">
            {score.damagePrevented.toFixed(1)}%
          </p>
        </div>
      </div>

      {/* Device Status */}
      <div className="mb-4">
        <h4 className="text-sm font-semibold text-gray-400 mb-2">Device Status</h4>
        <div className="grid grid-cols-5 gap-2">
          <div className="bg-green-900/30 border border-green-700 p-2 rounded text-center">
            <p className="text-2xl font-bold text-green-400">{activeDevices}</p>
            <p className="text-xs text-green-600">Active</p>
          </div>
          <div className="bg-yellow-900/30 border border-yellow-700 p-2 rounded text-center">
            <p className="text-2xl font-bold text-yellow-400">{underAttackDevices}</p>
            <p className="text-xs text-yellow-600">Under Attack</p>
          </div>
          <div className="bg-red-900/30 border border-red-700 p-2 rounded text-center">
            <p className="text-2xl font-bold text-red-400">{compromisedDevices}</p>
            <p className="text-xs text-red-600">Compromised</p>
          </div>
          <div className="bg-gray-800 border border-gray-600 p-2 rounded text-center">
            <p className="text-2xl font-bold text-gray-400">{isolatedDevices}</p>
            <p className="text-xs text-gray-500">Isolated</p>
          </div>
          <div className="bg-blue-900/30 border border-blue-700 p-2 rounded text-center">
            <p className="text-2xl font-bold text-blue-400">{totalDevices}</p>
            <p className="text-xs text-blue-600">Total</p>
          </div>
        </div>
      </div>

      {/* Infection Progress Bar */}
      <div className="mb-4">
        <div className="flex justify-between text-sm mb-1">
          <span className="text-gray-400">Network Infection Rate</span>
          <span className={`font-mono font-bold ${infectionRate > 50 ? 'text-red-400' : infectionRate > 20 ? 'text-yellow-400' : 'text-green-400'}`}>
            {infectionRate.toFixed(1)}%
          </span>
        </div>
        <div className="w-full bg-gray-800 rounded-full h-3 overflow-hidden">
          <div 
            className={`h-full transition-all duration-500 ${
              infectionRate > 50 ? 'bg-red-500' : infectionRate > 20 ? 'bg-yellow-500' : 'bg-green-500'
            }`}
            style={{ width: `${infectionRate}%` }}
          />
        </div>
      </div>

      {/* Alert Summary */}
      <div className="mb-4">
        <h4 className="text-sm font-semibold text-gray-400 mb-2">Active Alerts</h4>
        <div className="grid grid-cols-4 gap-2">
          <div className="bg-red-900/20 border border-red-800 p-2 rounded flex items-center justify-between">
            <span className="text-xs text-red-400">Critical</span>
            <span className="text-lg font-bold text-red-500">{criticalAlerts}</span>
          </div>
          <div className="bg-orange-900/20 border border-orange-800 p-2 rounded flex items-center justify-between">
            <span className="text-xs text-orange-400">High</span>
            <span className="text-lg font-bold text-orange-500">{highAlerts}</span>
          </div>
          <div className="bg-yellow-900/20 border border-yellow-800 p-2 rounded flex items-center justify-between">
            <span className="text-xs text-yellow-400">Medium</span>
            <span className="text-lg font-bold text-yellow-500">{mediumAlerts}</span>
          </div>
          <div className="bg-blue-900/20 border border-blue-800 p-2 rounded flex items-center justify-between">
            <span className="text-xs text-blue-400">Low</span>
            <span className="text-lg font-bold text-blue-500">{lowAlerts}</span>
          </div>
        </div>
      </div>

      {/* Event Stats */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-gray-800 p-3 rounded">
          <p className="text-xs text-gray-400">Total Events</p>
          <p className="text-lg font-mono font-bold text-white">{events.length}</p>
        </div>
        <div className="bg-gray-800 p-3 rounded">
          <p className="text-xs text-gray-400">Time to Detect</p>
          <p className="text-lg font-mono font-bold text-white">
            {score.timeToDetect > 0 ? `${(score.timeToDetect / 1000).toFixed(1)}s` : 'N/A'}
          </p>
        </div>
      </div>

      {/* Scenario Progress */}
      <div className="mt-4 pt-4 border-t border-gray-700">
        <div className="flex justify-between text-sm">
          <span className="text-gray-400">Scenario Progress</span>
          <span className="text-gray-300">
            Tick {state.tick} | 
            <span className={infectionRate > 50 ? 'text-red-400' : 'text-green-400'}>
              {' '}{compromisedDevices}/{totalDevices} infected
            </span>
          </span>
        </div>
      </div>
    </div>
  );
};

// Helper function to format seconds as MM:SS
function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

export default DashboardStats;
