'use client';

import React from 'react';
import { useSimulationStore } from '@/store/simulationStore';
import { AlertSeverity } from '@/types';

// ============================================
// Alert Panel Component
// ============================================

export const AlertPanel: React.FC = () => {
  const { state, acknowledgeAlert, getUnacknowledgedAlerts } = useSimulationStore();
  const alerts = getUnacknowledgedAlerts();

  const getSeverityColor = (severity: AlertSeverity): string => {
    switch (severity) {
      case 'critical':
        return 'bg-red-900/50 border-red-600 text-red-200';
      case 'high':
        return 'bg-orange-900/50 border-orange-600 text-orange-200';
      case 'medium':
        return 'bg-yellow-900/50 border-yellow-600 text-yellow-200';
      case 'low':
        return 'bg-blue-900/50 border-blue-600 text-blue-200';
      default:
        return 'bg-gray-800 border-gray-600 text-gray-200';
    }
  };

  const getSeverityIcon = (severity: AlertSeverity): string => {
    switch (severity) {
      case 'critical':
        return '🔴';
      case 'high':
        return '🟠';
      case 'medium':
        return '🟡';
      case 'low':
        return '🔵';
      default:
        return '⚪';
    }
  };

  if (!state) {
    return (
      <div className="bg-gray-900 rounded-lg border border-gray-700 p-4 h-full">
        <h3 className="text-lg font-bold text-gray-300 mb-4">Security Alerts</h3>
        <p className="text-gray-500">No simulation running</p>
      </div>
    );
  }

  return (
    <div className="bg-gray-900 rounded-lg border border-gray-700 h-full flex flex-col">
      {/* Header */}
      <div className="bg-gray-800 px-4 py-3 border-b border-gray-700">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-bold text-gray-200">Security Alerts</h3>
          <span className="text-sm text-gray-400">
            {alerts.length} unacknowledged
          </span>
        </div>
      </div>

      {/* Alert List */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {alerts.length === 0 ? (
          <div className="text-center py-8">
            <span className="text-4xl">✅</span>
            <p className="text-gray-500 mt-2">No active alerts</p>
            <p className="text-xs text-gray-600">System is secure</p>
          </div>
        ) : (
          alerts
            .sort((a, b) => {
              // Sort by severity (critical first)
              const severityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
              return severityOrder[a.severity] - severityOrder[b.severity];
            })
            .map(alert => (
              <div
                key={alert.id}
                className={`p-3 rounded-lg border ${getSeverityColor(alert.severity)} transition-all hover:opacity-90`}
              >
                <div className="flex justify-between items-start">
                  <div className="flex items-start gap-2">
                    <span className="text-lg">{getSeverityIcon(alert.severity)}</span>
                    <div>
                      <p className="font-semibold text-sm">
                        {alert.description}
                      </p>
                      <p className="text-xs opacity-80 mt-1">
                        Source: {alert.sourceDevice}
                      </p>
                      <p className="text-xs opacity-70">
                        Confidence: {(alert.confidenceScore * 100).toFixed(0)}% | 
                        Type: {alert.detectionType.replace('_', '-')}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => acknowledgeAlert(alert.id)}
                    className="text-xs bg-gray-800/50 hover:bg-gray-700/50 px-2 py-1 rounded transition-colors"
                  >
                    Ack
                  </button>
                </div>
              </div>
            ))
        )}
      </div>

      {/* Summary Stats */}
      <div className="bg-gray-800/50 px-4 py-2 border-t border-gray-700">
        <div className="flex justify-between text-xs text-gray-400">
          <span>
            🔴 Critical: {alerts.filter(a => a.severity === 'critical').length}
          </span>
          <span>
            🟠 High: {alerts.filter(a => a.severity === 'high').length}
          </span>
          <span>
            🟡 Medium: {alerts.filter(a => a.severity === 'medium').length}
          </span>
          <span>
            🔵 Low: {alerts.filter(a => a.severity === 'low').length}
          </span>
        </div>
      </div>
    </div>
  );
};

export default AlertPanel;
