import { SimulationState, SimulationEvent, DefenseAction, Alert, Attack, Topology, Device, AttackType, WinCondition, FailCondition } from '@/types';
import { Scenario } from '@/scenarios';
import { AttackPropagationEngine, attackConfigs } from '@/engines/attack/propagation';
import { DefenseEngine } from '@/engines/defense';
import { DetectionEngine } from '@/engines/detection';
import { SeededRandom } from '@/utils/random';
import { generateShortId } from '@/utils/uuid';

// ============================================
// Simulation Engine (Web Worker)
// ============================================

interface SimulationConfig {
  tickRate: number; // ms between ticks
  seed: number;
}

class SimulationEngine {
  private state: SimulationState;
  private scenario: Scenario;
  private random: SeededRandom;
  private propagationEngine: AttackPropagationEngine;
  private defenseEngine: DefenseEngine;
  private detectionEngine: DetectionEngine;
  private config: SimulationConfig;
  private tickInterval: number | null = null;
  private startTime: number = 0;

  constructor(scenario: Scenario, config: SimulationConfig) {
    this.scenario = scenario;
    this.config = config;
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
        return false; // Simplified - would track data volume

      case 'data_leak':
        // For data exfiltration scenario
        return false; // Simplified

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
    
    self.postMessage({
      type: 'GAME_OVER',
      payload: {
        won,
        reason,
        finalState: this.state,
      },
    });
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

    // Calculate accuracy based on actions taken
    // (Simplified - would track correct vs incorrect actions)

    // Total score
    this.state.score.totalScore = Math.round(
      damagePrevented * 10 + 
      (this.state.score.timeToDetect > 0 ? 1000 / (this.state.score.timeToDetect / 1000 + 1) : 0) +
      isolatedDevices * 50
    );
  }

  private broadcastState(): void {
    self.postMessage({
      type: 'STATE_UPDATE',
      payload: this.state,
    });
  }

  getState(): SimulationState {
    return this.state;
  }
}

// ============================================
// Worker Message Handling
// ============================================

let engine: SimulationEngine | null = null;

self.onmessage = function(event) {
  const { type, payload } = event.data;

  switch (type) {
    case 'INIT':
      engine = new SimulationEngine(payload.scenario, {
        tickRate: payload.tickRate || 100,
        seed: payload.seed || Date.now(),
      });
      self.postMessage({ type: 'INIT_COMPLETE' });
      break;

    case 'START':
      engine?.start();
      break;

    case 'PAUSE':
      engine?.pause();
      break;

    case 'RESUME':
      engine?.resume();
      break;

    case 'STOP':
      engine?.stop();
      break;

    case 'DEFENSE_ACTION':
      engine?.executeDefenseAction(payload.action);
      break;

    case 'GET_STATE':
      self.postMessage({
        type: 'STATE_UPDATE',
        payload: engine?.getState(),
      });
      break;

    default:
      console.warn(`Unknown message type: ${type}`);
  }
};

export {};
