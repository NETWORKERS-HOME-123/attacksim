'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { NetworkCanvas } from '@/components/NetworkCanvas';
import { Terminal } from '@/components/Terminal';
import { AlertPanel } from '@/components/AlertPanel';
import { ControlPanel } from '@/components/ControlPanel';
import { DashboardStats } from '@/components/DashboardStats';
import { useSimulationStore } from '@/store/simulationStore';
import { DefenseAction, SimulationState, SimulationEvent, Alert, Attack, Topology, Device, WinCondition, FailCondition } from '@/types';
import { Scenario } from '@/scenarios';
import { AttackPropagationEngine, attackConfigs } from '@/engines/attack/propagation';
import { DefenseEngine } from '@/engines/defense';
import { DetectionEngine } from '@/engines/detection';
import { SeededRandom } from '@/utils/random';
import { generateShortId } from '@/utils/uuid';

// ============================================
// Main Simulator Page - With Inline Simulation Engine
// ============================================

interface SimulationEngineConfig {
  tickRate: number;
  seed: number;
}

class SimulationEngine {
  private state: SimulationState;
  private scenario: Scenario;
  private random: SeededRandom;
  private propagationEngine: AttackPropagationEngine;
  private defenseEngine: DefenseEngine;
  private detectionEngine: DetectionEngine;
  private config: SimulationEngineConfig;
  private tickInterval: number | null = null;
  private startTime: number = 0;
  private onStateUpdate: (state: SimulationState) => void;
  private onGameOver: (won: boolean, reason: string) => void;

  constructor(
    scenario: Scenario, 
    config: SimulationEngineConfig,
    onStateUpdate: (state: SimulationState) => void,
    onGameOver: (won: boolean, reason: string) => void
  ) {
    this.scenario = scenario;
    this.config = config;
    this.onStateUpdate = onStateUpdate;
    this.onGameOver = onGameOver;
    this.random = new SeededRandom(config.seed);

    // Initialize state
    const initialTopology = this.deepCloneTopology(scenario.initialTopology);
    
    // Set initial infected devices
    for (const deviceId of scenario.initialInfectedDevices) {
      const device = initialTopology.devices.find(d => d.id === deviceId);
      if (device) {
        device.status = 'compromised';
      }
    }

    this.state = {
      isRunning: false,
      isPaused: false,
      currentTime: 0,
      tick: 0,
      topology: initialTopology,
      events: [],
      alerts: [],
      attacks: [],
      score: {
        timeToDetect: 0,
        timeToMitigate: 0,
        accuracyOfActions: 100,
        damagePrevented: 0,
        totalScore: 0,
      },
      scenarioId: scenario.id,
      logs: [],
    };

    // Initialize engines
    this.propagationEngine = new AttackPropagationEngine(initialTopology, this.random);
    this.defenseEngine = new DefenseEngine(initialTopology);
    this.detectionEngine = new DetectionEngine(initialTopology, this.random);

    // Initialize attacks for scenario
    this.initializeAttacks();
  }

  private deepCloneTopology(topology: Topology): Topology {
    return JSON.parse(JSON.stringify(topology));
  }

  private initializeAttacks(): void {
    // For ransomware scenario, start with lateral movement attacks
    for (const device of this.state.topology.devices) {
      if (device.status === 'compromised') {
        const attack: Attack = {
          id: generateShortId('atk-'),
          type: 'ransomware',
          sourceDevice: device.id,
          targetDevice: device.id,
          timestamp: 0,
          isActive: true,
          progress: 0,
        };
        this.state.attacks.push(attack);
      }
    }
  }

  start(): void {
    if (this.state.isRunning) return;

    this.state.isRunning = true;
    this.state.isPaused = false;
    this.startTime = Date.now();

    this.tickInterval = window.setInterval(() => {
      this.tick();
    }, this.config.tickRate);

    this.broadcastState();
  }

  pause(): void {
    this.state.isPaused = true;
    if (this.tickInterval) {
      clearInterval(this.tickInterval);
      this.tickInterval = null;
    }
    this.broadcastState();
  }

  resume(): void {
    if (!this.state.isRunning || !this.state.isPaused) return;

    this.state.isPaused = false;
    this.tickInterval = window.setInterval(() => {
      this.tick();
    }, this.config.tickRate);
    this.broadcastState();
  }

  stop(): void {
    this.state.isRunning = false;
    this.state.isPaused = false;
    if (this.tickInterval) {
      clearInterval(this.tickInterval);
      this.tickInterval = null;
    }
    this.broadcastState();
  }

  private tick(): void {
    this.state.tick++;
    this.state.currentTime = Date.now() - this.startTime;

    // Process attack propagation
    this.processAttackPropagation();

    // Process ready alerts
    this.processPendingAlerts();

    // Check win/lose conditions
    this.checkEndConditions();

    // Update score
    this.updateScore();

    this.broadcastState();
  }

  private processAttackPropagation(): void {
    // Process each active attack
    for (const attack of this.state.attacks) {
      if (!attack.isActive) continue;

      const sourceDevice = this.state.topology.devices.find(
        d => d.id === attack.sourceDevice
      );
      if (!sourceDevice || sourceDevice.status === 'isolated') continue;

      // Update attack progress
      attack.progress += attackConfigs[attack.type].spreadRate;

      // Attempt spread every 10 ticks
      if (this.state.tick % 10 === 0) {
        const results = this.propagationEngine.attemptSpread(
          sourceDevice,
          attack.type,
          this.state.tick
        );

        for (const result of results) {
          if (result.success) {
            // Infection successful
            result.device.status = 'compromised';

            // Create infection event
            const event: SimulationEvent = {
              id: generateShortId('evt-'),
              timestamp: this.state.currentTime,
              type: 'infection_success',
              source: sourceDevice.id,
              target: result.device.id,
              details: `${attack.type} spread from ${sourceDevice.name} to ${result.device.name}`,
            };
            this.state.events.push(event);

            // Create new attack for the newly infected device
            const newAttack: Attack = {
              id: generateShortId('atk-'),
              type: attack.type,
              sourceDevice: result.device.id,
              targetDevice: result.device.id,
              timestamp: this.state.currentTime,
              isActive: true,
              progress: 0,
            };
            this.state.attacks.push(newAttack);

            // Notify detection engine
            this.detectionEngine.processEvent(event, this.state.currentTime);

            // Add to logs
            this.state.logs.push({
              timestamp: this.state.currentTime,
              eventType: 'infection_success',
              source: sourceDevice.id,
              target: result.device.id,
              details: event.details,
            });
          }
        }
      }

      // Check if attack should complete
      if (attack.progress >= 100) {
        attack.isActive = false;
      }
    }
  }

  private processPendingAlerts(): void {
    const readyAlerts = this.detectionEngine.getReadyAlerts(this.state.currentTime);
    for (const alert of readyAlerts) {
      this.state.alerts.push(alert);
      
      // Log alert
      this.state.logs.push({
        timestamp: this.state.currentTime,
        eventType: 'alert_event',
        source: alert.sourceDevice,
        target: alert.sourceDevice,
        details: `[${alert.severity.toUpperCase()}] ${alert.description}`,
      });

      // Update time to detect on first alert
      if (this.state.score.timeToDetect === 0) {
        this.state.score.timeToDetect = this.state.currentTime;
      }
    }
  }

  executeDefenseAction(action: DefenseAction): void {
    const result = this.defenseEngine.executeAction(action);

    // Add events from defense action
    for (const event of result.events) {
      this.state.events.push(event);
      this.state.logs.push({
        timestamp: this.state.currentTime,
        eventType: 'defense_action',
        source: 'defense_engine',
        target: event.target,
        details: event.details,
      });

      // Detection engine processes defense events
      const alerts = this.detectionEngine.processEvent(event, this.state.currentTime);
      for (const alert of alerts) {
        this.state.alerts.push(alert);
      }
    }

    // Update detection engine topology
    this.detectionEngine.updateTopology(this.state.topology);
    this.propagationEngine.updateTopology(this.state.topology);

    this.broadcastState();
  }

  private checkEndConditions(): void {
    // Check fail conditions
    for (const condition of this.scenario.failConditions) {
      if (this.checkCondition(condition)) {
        this.triggerGameOver(false, condition.description);
        return;
      }
    }

    // Check win conditions
    for (const condition of this.scenario.winConditions) {
      if (this.checkCondition(condition)) {
        this.triggerGameOver(true, condition.description);
        return;
      }
    }

    // Check time limit
    if (this.state.currentTime >= this.scenario.timeLimit * 1000) {
      // Time's up - evaluate if player won
      const infectedCount = this.state.topology.devices.filter(
        d => d.status === 'compromised'
      ).length;
      const totalDevices = this.state.topology.devices.length;
      
      if (infectedCount / totalDevices < 0.6) {
        this.triggerGameOver(true, 'Time limit reached - infection contained');
      } else {
        this.triggerGameOver(false, 'Time limit reached - too many devices infected');
      }
    }
  }

  private checkCondition(condition: WinCondition | FailCondition): boolean {
    switch (condition.type) {
      case 'containment':
        const maxInfected = condition.parameters.maxInfectedDevices as number;
        const infectedCount = this.state.topology.devices.filter(
          d => d.status === 'compromised'
        ).length;
        return infectedCount <= maxInfected;

      case 'infection_rate':
        const threshold = condition.parameters.thresholdPercentage as number;
        const totalDevices = this.state.topology.devices.length;
        const currentInfected = this.state.topology.devices.filter(
          d => d.status === 'compromised'
        ).length;
        return (currentInfected / totalDevices) * 100 >= threshold;

      case 'traffic_reduction':
        // For DDoS scenario
        return this.state.attacks.every(a => !a.isActive);

      case 'data_protection':
        // For data exfiltration scenario
        return false;

      case 'data_leak':
        // For data exfiltration scenario
        return false;

      case 'server_downtime':
        // For DDoS scenario
        const maxDowntime = condition.parameters.maxSeconds as number;
        return this.state.currentTime > maxDowntime * 1000;

      default:
        return false;
    }
  }

  private triggerGameOver(won: boolean, reason: string): void {
    this.stop();
    this.onGameOver(won, reason);
  }

  private updateScore(): void {
    const totalDevices = this.state.topology.devices.length;
    const compromisedDevices = this.state.topology.devices.filter(
      d => d.status === 'compromised'
    ).length;
    const isolatedDevices = this.state.topology.devices.filter(
      d => d.status === 'isolated'
    ).length;

    // Calculate damage prevented
    const damagePrevented = ((totalDevices - compromisedDevices) / totalDevices) * 100;
    this.state.score.damagePrevented = damagePrevented;

    // Total score
    this.state.score.totalScore = Math.round(
      damagePrevented * 10 + 
      (this.state.score.timeToDetect > 0 ? 1000 / (this.state.score.timeToDetect / 1000 + 1) : 0) +
      isolatedDevices * 50
    );
  }

  private broadcastState(): void {
    this.onStateUpdate(this.state);
  }

  getState(): SimulationState {
    return this.state;
  }
}

// ============================================
// Main Page Component
// ============================================

export default function SimulatorPage() {
  // Store
  const { 
    currentScenario, 
    setState, 
    setGameOver,
    resetGame,
  } = useSimulationStore();

  // Engine ref
  const engineRef = useRef<SimulationEngine | null>(null);
  
  // Local state
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [showStats, setShowStats] = useState(true);

  // Initialize engine
  useEffect(() => {
    const engine = new SimulationEngine(
      currentScenario,
      {
        tickRate: 200, // 200ms between ticks for better performance
        seed: Date.now(),
      },
      (newState) => {
        setState(newState);
      },
      (won, reason) => {
        setGameOver(won, reason);
        setIsRunning(false);
        setIsPaused(false);
      }
    );

    engineRef.current = engine;
    setState(engine.getState());

    return () => {
      engine.stop();
      engineRef.current = null;
    };
  }, [currentScenario]);

  // Control handlers
  const handleStart = useCallback(() => {
    engineRef.current?.start();
    setIsRunning(true);
    setIsPaused(false);
  }, []);

  const handlePause = useCallback(() => {
    engineRef.current?.pause();
    setIsPaused(true);
  }, []);

  const handleResume = useCallback(() => {
    engineRef.current?.resume();
    setIsPaused(false);
  }, []);

  const handleStop = useCallback(() => {
    engineRef.current?.stop();
    setIsRunning(false);
    setIsPaused(false);
    resetGame();
    // Re-initialize
    const engine = new SimulationEngine(
      currentScenario,
      {
        tickRate: 200,
        seed: Date.now(),
      },
      setState,
      (won, reason) => {
        setGameOver(won, reason);
        setIsRunning(false);
        setIsPaused(false);
      }
    );
    engineRef.current = engine;
    setState(engine.getState());
  }, [currentScenario, resetGame, setState, setGameOver]);

  // Defense action handler
  const handleDefenseAction = useCallback((action: DefenseAction) => {
    engineRef.current?.executeDefenseAction(action);
  }, []);

  return (
    <main className="min-h-screen bg-gray-950 text-gray-100 p-4">
      {/* Header */}
      <header className="mb-4 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-green-400">
            Cyber Attack & Defense Simulator
          </h1>
          <p className="text-gray-400 mt-1">
            Detect, respond to, and mitigate simulated cyber attacks
          </p>
        </div>
        <button
          onClick={() => setShowStats(!showStats)}
          className="bg-gray-800 hover:bg-gray-700 px-4 py-2 rounded text-sm transition-colors"
        >
          {showStats ? 'Hide Stats' : 'Show Stats'}
        </button>
      </header>

      {/* Dashboard Stats */}
      {showStats && (
        <div className="mb-4">
          <DashboardStats />
        </div>
      )}

      {/* Main Grid Layout */}
      <div className="grid grid-cols-12 gap-4" style={{ height: showStats ? 'calc(100vh - 280px)' : 'calc(100vh - 140px)' }}>
        
        {/* Left Column - Network Canvas (8 cols) */}
        <div className="col-span-12 lg:col-span-8 flex flex-col gap-4">
          {/* Network Visualization */}
          <div className="flex-1 min-h-[300px]">
            <NetworkCanvas width={900} height={400} />
          </div>

          {/* Terminal */}
          <div className="h-[250px]">
            <Terminal 
              onDefenseAction={handleDefenseAction}
              className="h-full"
            />
          </div>
        </div>

        {/* Right Column - Controls & Alerts (4 cols) */}
        <div className="col-span-12 lg:col-span-4 flex flex-col gap-4">
          {/* Control Panel */}
          <ControlPanel
            onStart={handleStart}
            onPause={handlePause}
            onResume={handleResume}
            onStop={handleStop}
            isRunning={isRunning}
            isPaused={isPaused}
          />

          {/* Alert Panel */}
          <div className="flex-1 min-h-[200px]">
            <AlertPanel />
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="mt-4 pt-4 border-t border-gray-800 text-center text-sm text-gray-500">
        <p>
          Cyber Attack & Defense Simulator v1.0 | 
          Event-driven simulation with deterministic state transitions |
          No real exploits - Pure educational simulation
        </p>
      </footer>
    </main>
  );
}
