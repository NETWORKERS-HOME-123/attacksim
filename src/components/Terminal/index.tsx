'use client';

import React, { useEffect, useRef, useCallback, useState } from 'react';
import { Terminal as XTerm } from 'xterm';
import { FitAddon } from 'xterm-addon-fit';
import 'xterm/css/xterm.css';
import { CLIParser } from '@/engines/cli/parser';
import { useSimulationStore } from '@/store/simulationStore';
import { DefenseAction } from '@/types';
import { generateShortId } from '@/utils/uuid';

// ============================================
// Terminal Component Props
// ============================================

interface TerminalProps {
  onDefenseAction?: (action: DefenseAction) => void;
  className?: string;
}

// ============================================
// Terminal Component
// ============================================

export const Terminal: React.FC<TerminalProps> = ({ 
  onDefenseAction,
  className = '' 
}) => {
  const terminalRef = useRef<HTMLDivElement>(null);
  const xtermRef = useRef<XTerm | null>(null);
  const fitAddonRef = useRef<FitAddon | null>(null);
  const parserRef = useRef<CLIParser>(new CLIParser());
  const commandBufferRef = useRef('');
  
  const { state, getDeviceById, getDeviceByName } = useSimulationStore();
  const [isReady, setIsReady] = useState(false);

  // Initialize terminal
  useEffect(() => {
    if (!terminalRef.current || xtermRef.current) return;

    const term = new XTerm({
      cursorBlink: true,
      fontSize: 13,
      fontFamily: 'Consolas, "Courier New", monospace',
      theme: {
        background: '#111827',
        foreground: '#10b981',
        cursor: '#10b981',
        selectionBackground: '#065f46',
        black: '#000000',
        red: '#ef4444',
        green: '#10b981',
        yellow: '#f59e0b',
        blue: '#3b82f6',
      },
      rows: 24,
      cols: 80,
    });

    const fitAddon = new FitAddon();
    term.loadAddon(fitAddon);

    term.open(terminalRef.current);
    fitAddon.fit();

    xtermRef.current = term;
    fitAddonRef.current = fitAddon;

    // Print welcome message
    printWelcome(term);
    printPrompt(term);

    setIsReady(true);

    // Handle resize
    const handleResize = () => {
      fitAddon.fit();
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      term.dispose();
      xtermRef.current = null;
    };
  }, []);

  // Print welcome message
  const printWelcome = (term: XTerm) => {
    term.writeln('\r\n');
    term.writeln('╔══════════════════════════════════════════════════════════════╗');
    term.writeln('║          CYBER ATTACK & DEFENSE SIMULATOR v1.0               ║');
    term.writeln('╠══════════════════════════════════════════════════════════════╣');
    term.writeln('║  Type "help" for available commands                          ║');
    term.writeln('║  Detect, respond to, and mitigate cyber attacks              ║');
    term.writeln('╚══════════════════════════════════════════════════════════════╝');
    term.writeln('');
  };

  // Print prompt
  const printPrompt = (term: XTerm) => {
    const mode = parserRef.current.getMode();
    term.write(`\r\n\x1b[1;32m[${mode}]\x1b[0m > `);
  };

  // Handle command execution
  const executeCommand = useCallback((input: string) => {
    const term = xtermRef.current;
    if (!term) return;

    const parser = parserRef.current;
    const parsed = parser.parse(input);

    term.writeln('');

    if (!parsed.isValid) {
      term.writeln(`\x1b[1;31mError: ${parsed.error}\x1b[0m`);
    } else if (parsed.command === 'help') {
      term.writeln(parser.getHelpText());
    } else if (parsed.command === 'clear') {
      term.clear();
    } else if (parsed.command === 'mode') {
      if (parsed.message) {
        term.writeln(`\x1b[1;33m${parsed.message}\x1b[0m`);
      }
    } else if (parsed.command === 'show') {
      handleShowCommand(term, parsed.args);
    } else if (parsed.action) {
      // Defense action
      handleDefenseAction(term, parsed);
    } else {
      term.writeln(`\x1b[1;33m${parsed.message || 'Command executed'}\x1b[0m`);
    }

    printPrompt(term);
  }, [state]);

  // Handle show commands
  const handleShowCommand = (term: XTerm, args: string[]) => {
    if (!state) {
      term.writeln('\x1b[1;31mNo simulation running\x1b[0m');
      return;
    }

    const subcommand = args[0];

    switch (subcommand) {
      case 'logs':
        term.writeln('\x1b[1;36m═══ SECURITY LOGS ═══\x1b[0m');
        if (state.logs.length === 0) {
          term.writeln('No logs recorded yet.');
        } else {
          state.logs.slice(-20).forEach(log => {
            const time = new Date(log.timestamp).toLocaleTimeString();
            term.writeln(`[${time}] ${log.eventType}: ${log.details}`);
          });
        }
        break;

      case 'alerts':
        term.writeln('\x1b[1;36m═══ ACTIVE ALERTS ═══\x1b[0m');
        const unacknowledged = state.alerts.filter(a => !a.isAcknowledged);
        if (unacknowledged.length === 0) {
          term.writeln('No active alerts.');
        } else {
          unacknowledged.forEach(alert => {
            const severityColor = {
              low: '\x1b[1;32m',
              medium: '\x1b[1;33m',
              high: '\x1b[1;35m',
              critical: '\x1b[1;31m',
            }[alert.severity];
            term.writeln(`${severityColor}[${alert.severity.toUpperCase()}]\x1b[0m ${alert.description}`);
            term.writeln(`    Source: ${alert.sourceDevice} | Confidence: ${(alert.confidenceScore * 100).toFixed(0)}%`);
          });
        }
        break;

      case 'devices':
        term.writeln('\x1b[1;36m═══ NETWORK DEVICES ═══\x1b[0m');
        state.topology.devices.forEach(device => {
          const statusColor = {
            active: '\x1b[1;32m',
            isolated: '\x1b[1;90m',
            compromised: '\x1b[1;31m',
            under_attack: '\x1b[1;33m',
          }[device.status];
          term.writeln(`${device.id}: ${device.name}`);
          term.writeln(`    IP: ${device.interfaces[0]?.ip || 'N/A'} | Status: ${statusColor}${device.status}\x1b[0m`);
          if (device.vulnerabilities?.length) {
            term.writeln(`    Vulnerabilities: ${device.vulnerabilities.join(', ')}`);
          }
        });
        break;

      case 'topology':
        term.writeln('\x1b[1;36m═══ NETWORK TOPOLOGY ═══\x1b[0m');
        term.writeln(`Devices: ${state.topology.devices.length}`);
        term.writeln(`Links: ${state.topology.links.length}`);
        term.writeln('');
        state.topology.links.forEach(link => {
          term.writeln(`  ${link.from} <-> ${link.to}`);
        });
        break;

      case 'status':
        term.writeln('\x1b[1;36m═══ SIMULATION STATUS ═══\x1b[0m');
        term.writeln(`Running: ${state.isRunning ? 'Yes' : 'No'}`);
        term.writeln(`Paused: ${state.isPaused ? 'Yes' : 'No'}`);
        term.writeln(`Tick: ${state.tick}`);
        term.writeln(`Time: ${Math.floor(state.currentTime / 1000)}s`);
        term.writeln(`Total Events: ${state.events.length}`);
        term.writeln(`Total Alerts: ${state.alerts.length}`);
        term.writeln(`Compromised Devices: ${state.topology.devices.filter(d => d.status === 'compromised').length}`);
        break;

      case 'stats':
        term.writeln('\x1b[1;36m═══ SCORE ═══\x1b[0m');
        term.writeln(`Time to Detect: ${state.score.timeToDetect > 0 ? (state.score.timeToDetect / 1000).toFixed(1) + 's' : 'N/A'}`);
        term.writeln(`Accuracy: ${state.score.accuracyOfActions.toFixed(1)}%`);
        term.writeln(`Damage Prevented: ${state.score.damagePrevented.toFixed(1)}%`);
        term.writeln(`Total Score: ${state.score.totalScore}`);
        break;

      default:
        term.writeln(`\x1b[1;31mUnknown show command: ${subcommand}\x1b[0m`);
    }
  };

  // Handle defense action
  const handleDefenseAction = (term: XTerm, parsed: ReturnType<CLIParser['parse']>) => {
    if (!parsed.action || !onDefenseAction) return;

    // Resolve device
    let targetDevice = parsed.targetDevice || '';
    
    // Try to find device by ID or name
    const deviceById = getDeviceById(targetDevice);
    const deviceByName = getDeviceByName(targetDevice);
    const resolvedDevice = deviceById || deviceByName;

    if (!resolvedDevice && targetDevice !== 'all') {
      term.writeln(`\x1b[1;31mError: Device "${targetDevice}" not found\x1b[0m`);
      return;
    }

    const action: DefenseAction = {
      id: generateShortId('act-'),
      type: parsed.action,
      targetDevice: resolvedDevice?.id || targetDevice,
      parameters: parsed.parameters,
      timestamp: Date.now(),
    };

    onDefenseAction(action);
    term.writeln(`\x1b[1;32mExecuting ${parsed.action} on ${resolvedDevice?.name || targetDevice}...\x1b[0m`);
  };

  // Handle keyboard input
  useEffect(() => {
    const term = xtermRef.current;
    if (!term || !isReady) return;

    const disposable = term.onData((data) => {
      const code = data.charCodeAt(0);

      // Enter key
      if (code === 13) {
        executeCommand(commandBufferRef.current);
        commandBufferRef.current = '';
      }
      // Backspace
      else if (code === 127) {
        if (commandBufferRef.current.length > 0) {
          commandBufferRef.current = commandBufferRef.current.slice(0, -1);
          term.write('\b \b');
        }
      }
      // Regular character
      else if (code >= 32 && code <= 126) {
        commandBufferRef.current += data;
        term.write(data);
      }
    });

    return () => {
      disposable.dispose();
    };
  }, [executeCommand, isReady]);

  // Auto-fit on resize
  useEffect(() => {
    const fitAddon = fitAddonRef.current;
    if (fitAddon) {
      fitAddon.fit();
    }
  }, []);

  return (
    <div 
      className={`bg-gray-900 rounded-lg border border-gray-700 overflow-hidden ${className}`}
      style={{ minHeight: '400px' }}
    >
      {/* Terminal Header */}
      <div className="bg-gray-800 px-4 py-2 border-b border-gray-700 flex justify-between items-center">
        <span className="text-sm font-mono text-green-400">Security CLI</span>
        <span className="text-xs text-gray-500">xterm.js</span>
      </div>
      
      {/* Terminal Output */}
      <div 
        ref={terminalRef}
        className="p-2"
        style={{ height: 'calc(100% - 40px)' }}
      />
    </div>
  );
};

export default Terminal;
