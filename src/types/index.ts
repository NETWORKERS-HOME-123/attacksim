// ============================================
// Core Types for Cyber Attack & Defense Simulator
// ============================================

// Device Types
export type DeviceType = 'router' | 'switch' | 'host' | 'firewall' | 'server';
export type DeviceStatus = 'active' | 'isolated' | 'compromised' | 'under_attack';
export type InterfaceStatus = 'up' | 'down';

// Network Interface
export interface NetworkInterface {
  name: string;
  ip: string;
  mac: string;
  status: InterfaceStatus;
}

// Network Device
export interface Device {
  id: string;
  type: DeviceType;
  name: string;
  x: number;
  y: number;
  interfaces: NetworkInterface[];
  status: DeviceStatus;
  vulnerabilities?: string[];
  isFirewallEnabled?: boolean;
  blockedIPs?: string[];
}

// Network Link
export interface Link {
  id: string;
  from: string; // deviceId/interface
  to: string;   // deviceId/interface
  latency: number;
}

// Network Topology
export interface Topology {
  devices: Device[];
  links: Link[];
}

// ============================================
// Event System
// ============================================

export type EventType = 
  | 'packet_transfer'
  | 'attack_event'
  | 'defense_action'
  | 'state_change'
  | 'alert_event'
  | 'infection_success';

export interface SimulationEvent {
  id: string;
  timestamp: number;
  type: EventType;
  source: string;
  target: string;
  details: string;
  metadata?: Record<string, unknown>;
}

// ============================================
// Attack System
// ============================================

export type AttackType = 
  | 'phishing'
  | 'lateral_movement'
  | 'ransomware'
  | 'ddos'
  | 'mitm'
  | 'credential_stuffing'
  | 'dns_spoofing'
  | 'c2_beaconing'
  | 'data_exfiltration'
  | 'unpatched_exploit';

export interface Attack {
  id: string;
  type: AttackType;
  sourceDevice: string;
  targetDevice: string;
  timestamp: number;
  isActive: boolean;
  progress: number; // 0-100
}

export interface AttackEffect {
  type: string;
  target: string;
  result: string;
}

// ============================================
// Defense System
// ============================================

export type DefenseActionType = 
  | 'block_ip'
  | 'isolate_device'
  | 'apply_firewall_rule'
  | 'patch_system'
  | 'reset_credentials'
  | 'scan_network'
  | 'enable_firewall'
  | 'disable_smb';

export interface DefenseAction {
  id: string;
  type: DefenseActionType;
  targetDevice: string;
  parameters?: Record<string, unknown>;
  timestamp: number;
}

// ============================================
// Detection System
// ============================================

export type AlertSeverity = 'low' | 'medium' | 'high' | 'critical';
export type DetectionType = 'signature_based' | 'anomaly_based' | 'behavioral';

export interface Alert {
  id: string;
  timestamp: number;
  severity: AlertSeverity;
  sourceDevice: string;
  description: string;
  confidenceScore: number;
  detectionType: DetectionType;
  isAcknowledged: boolean;
}

// ============================================
// Scoring System
// ============================================

export interface ScoreMetrics {
  timeToDetect: number;
  timeToMitigate: number;
  accuracyOfActions: number;
  damagePrevented: number;
  totalScore: number;
}

// ============================================
// Scenario System
// ============================================

export interface WinCondition {
  type: string;
  parameters: Record<string, unknown>;
  description: string;
}

export interface FailCondition {
  type: string;
  parameters: Record<string, unknown>;
  description: string;
}

export interface Scenario {
  id: string;
  name: string;
  description: string;
  initialTopology: Topology;
  initialEvents: SimulationEvent[];
  objectives: string[];
  winConditions: WinCondition[];
  failConditions: FailCondition[];
  timeLimit: number; // seconds
  initialInfectedDevices: string[];
  entryPoint: string;
  attackChain: string[];
}

// ============================================
// CLI System
// ============================================

export type CLIMode = 'user' | 'admin' | 'config';

export interface CLICommand {
  raw: string;
  command: string;
  args: string[];
  mode: CLIMode;
  isValid: boolean;
  error?: string;
  message?: string;
}

// ============================================
// Simulation State
// ============================================

export interface SimulationState {
  isRunning: boolean;
  isPaused: boolean;
  currentTime: number;
  tick: number;
  topology: Topology;
  events: SimulationEvent[];
  alerts: Alert[];
  attacks: Attack[];
  score: ScoreMetrics;
  scenarioId: string | null;
  logs: LogEntry[];
}

export interface LogEntry {
  timestamp: number;
  eventType: string;
  source: string;
  target: string;
  details: string;
}

// ============================================
// Canvas/Visual Types
// ============================================

export interface DeviceVisualState {
  color: string;
  pulse: boolean;
  blinkRateMs?: number;
  opacity: number;
}

export interface PacketAnimation {
  id: string;
  sourceX: number;
  sourceY: number;
  targetX: number;
  targetY: number;
  protocol: string;
  isAttack: boolean;
  progress: number;
}

export interface AttackSpreadAnimation {
  id: string;
  centerX: number;
  centerY: number;
  radius: number;
  maxRadius: number;
  opacity: number;
}

// ============================================
// Propagation Engine Types
// ============================================

export interface PropagationFactors {
  infectionProbability: number;
  networkFactor: number;
  defenseFactor: number;
  timeDecay: number;
}

export interface AttackConfig {
  baseProbability: number;
  spreadRate: number;
  detectionDelay: number;
}

// ============================================
// Web Worker Messages (for future use)
// ============================================

export type WorkerMessageType = 
  | 'INIT'
  | 'START'
  | 'PAUSE'
  | 'RESUME'
  | 'STOP'
  | 'TICK'
  | 'STATE_UPDATE'
  | 'EVENT'
  | 'DEFENSE_ACTION'
  | 'GAME_OVER'
  | 'ERROR';

export interface WorkerMessage {
  type: WorkerMessageType;
  payload?: unknown;
}
