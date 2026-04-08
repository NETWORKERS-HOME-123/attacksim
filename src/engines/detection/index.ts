import { Device, Topology, SimulationEvent, Alert, AlertSeverity, DetectionType } from '@/types';
import { SeededRandom } from '@/utils/random';
import { generateShortId } from '@/utils/uuid';

// ============================================
// Detection Engine
// ============================================

interface DetectionRule {
  type: DetectionType;
  name: string;
  accuracy: number;
  delayMs: number;
  match: (event: SimulationEvent, topology: Topology) => boolean;
  severity: AlertSeverity;
  description: string;
}

export class DetectionEngine {
  private random: SeededRandom;
  private topology: Topology;
  private pendingAlerts: Array<{ alert: Alert; readyTime: number }> = [];
  private lastEventCounts: Map<string, number> = new Map();
  private eventTimestamps: Map<string, number[]> = new Map();

  constructor(topology: Topology, random: SeededRandom) {
    this.topology = topology;
    this.random = random;
  }

  updateTopology(topology: Topology): void {
    this.topology = topology;
  }

  // Detection rules
  private getDetectionRules(): DetectionRule[] {
    return [
      // Signature-based: Multiple failed logins
      {
        type: 'signature_based',
        name: 'brute_force_attempt',
        accuracy: 0.9,
        delayMs: 500,
        match: (event) => {
          return event.type === 'attack_event' && 
                 event.details.toLowerCase().includes('credential');
        },
        severity: 'high',
        description: 'Multiple failed login attempts detected',
      },
      // Signature-based: Known malware signature
      {
        type: 'signature_based',
        name: 'malware_signature',
        accuracy: 0.95,
        delayMs: 800,
        match: (event) => {
          return event.type === 'attack_event' && 
                 (event.details.toLowerCase().includes('ransomware') ||
                  event.details.toLowerCase().includes('malware'));
        },
        severity: 'critical',
        description: 'Known malicious activity pattern detected',
      },
      // Anomaly-based: Traffic spike (DDOS)
      {
        type: 'anomaly_based',
        name: 'traffic_anomaly',
        accuracy: 0.7,
        delayMs: 1500,
        match: (event) => {
          return event.type === 'attack_event' && 
                 event.details.toLowerCase().includes('ddos');
        },
        severity: 'high',
        description: 'Abnormal traffic pattern detected',
      },
      // Anomaly-based: Unusual data transfer
      {
        type: 'anomaly_based',
        name: 'data_exfiltration',
        accuracy: 0.75,
        delayMs: 2000,
        match: (event) => {
          return event.type === 'attack_event' && 
                 event.details.toLowerCase().includes('exfiltrat');
        },
        severity: 'critical',
        description: 'Unusual data transfer detected',
      },
      // Behavioral: Lateral movement
      {
        type: 'behavioral',
        name: 'lateral_movement',
        accuracy: 0.8,
        delayMs: 2500,
        match: (event) => {
          return event.type === 'attack_event' && 
                 event.details.toLowerCase().includes('lateral');
        },
        severity: 'high',
        description: 'Suspicious lateral movement detected',
      },
      // Behavioral: Beaconing
      {
        type: 'behavioral',
        name: 'c2_beaconing',
        accuracy: 0.85,
        delayMs: 3000,
        match: (event) => {
          return event.type === 'attack_event' && 
                 (event.details.toLowerCase().includes('beacon') ||
                  event.details.toLowerCase().includes('command') ||
                  event.details.toLowerCase().includes('c2'));
        },
        severity: 'critical',
        description: 'Command & Control communication detected',
      },
    ];
  }

  // Process events and generate alerts
  processEvent(event: SimulationEvent, currentTime: number): Alert[] {
    const newAlerts: Alert[] = [];

    // Check against all detection rules
    for (const rule of this.getDetectionRules()) {
      if (rule.match(event, this.topology)) {
        // Calculate detection probability
        const detectionRoll = this.random.next();
        
        // Apply false negative probability (15% chance to miss)
        if (detectionRoll > rule.accuracy * 0.85) {
          continue; // Missed detection
        }

        // Calculate confidence
        const signalStrength = this.calculateSignalStrength(event);
        const confidence = rule.accuracy * signalStrength;

        // Create alert with delay
        const alert: Alert = {
          id: generateShortId('alert-'),
          timestamp: currentTime,
          severity: rule.severity,
          sourceDevice: event.target,
          description: rule.description,
          confidenceScore: confidence,
          detectionType: rule.type,
          isAcknowledged: false,
        };

        // Add to pending alerts
        this.pendingAlerts.push({
          alert,
          readyTime: currentTime + rule.delayMs,
        });
      }
    }

    // Check for correlation (combine weak signals)
    this.checkForCorrelation(event, currentTime, newAlerts);

    return newAlerts;
  }

  // Get alerts that are ready to be emitted
  getReadyAlerts(currentTime: number): Alert[] {
    const readyAlerts: Alert[] = [];
    const stillPending: Array<{ alert: Alert; readyTime: number }> = [];

    for (const pending of this.pendingAlerts) {
      if (pending.readyTime <= currentTime) {
        // Apply false positive check (10% chance)
        if (this.random.next() > 0.1) {
          readyAlerts.push(pending.alert);
        }
      } else {
        stillPending.push(pending);
      }
    }

    this.pendingAlerts = stillPending;
    return readyAlerts;
  }

  private calculateSignalStrength(event: SimulationEvent): number {
    let strength = 0.5;

    // More events from same source = stronger signal
    const sourceCount = this.lastEventCounts.get(event.source) || 0;
    this.lastEventCounts.set(event.source, sourceCount + 1);
    
    if (sourceCount > 5) {
      strength += 0.2;
    }

    // Check frequency
    const now = event.timestamp;
    const timestamps = this.eventTimestamps.get(event.source) || [];
    timestamps.push(now);
    
    // Keep only last 10 seconds
    const recentTimestamps = timestamps.filter(t => now - t < 10000);
    this.eventTimestamps.set(event.source, recentTimestamps);

    // High frequency = stronger signal
    if (recentTimestamps.length > 5) {
      strength += 0.15;
    }

    return Math.min(1, strength);
  }

  private checkForCorrelation(
    event: SimulationEvent,
    currentTime: number,
    newAlerts: Alert[]
  ): void {
    // Get alerts for this device in last 30 seconds
    const deviceAlerts = this.pendingAlerts.filter(
      p => p.alert.sourceDevice === event.target &&
           currentTime - p.alert.timestamp < 30000
    );

    // Rule: 3+ low/medium alerts on same device -> escalate to high
    const lowMediumCount = deviceAlerts.filter(
      p => p.alert.severity === 'low' || p.alert.severity === 'medium'
    ).length;

    if (lowMediumCount >= 3) {
      // Escalate to high severity
      newAlerts.push({
        id: generateShortId('alert-'),
        timestamp: currentTime,
        severity: 'high',
        sourceDevice: event.target,
        description: 'Multiple suspicious activities correlated - possible active compromise',
        confidenceScore: 0.85,
        detectionType: 'behavioral',
        isAcknowledged: false,
      });
    }

    // Rule: Lateral movement + failed logins -> critical
    const hasLateral = deviceAlerts.some(p => 
      p.alert.description.toLowerCase().includes('lateral')
    );
    const hasFailedLogins = deviceAlerts.some(p => 
      p.alert.description.toLowerCase().includes('login')
    );

    if (hasLateral && hasFailedLogins) {
      newAlerts.push({
        id: generateShortId('alert-'),
        timestamp: currentTime,
        severity: 'critical',
        sourceDevice: event.target,
        description: 'Active attack chain detected: credential compromise + lateral movement',
        confidenceScore: 0.92,
        detectionType: 'behavioral',
        isAcknowledged: false,
      });
    }
  }

  // Manual scan detection (improves detection)
  performScan(deviceId: string, currentTime: number): Alert[] {
    const device = this.topology.devices.find(d => d.id === deviceId);
    if (!device) return [];

    const alerts: Alert[] = [];

    // If device is compromised, scan detects it with high probability
    if (device.status === 'compromised') {
      alerts.push({
        id: generateShortId('alert-'),
        timestamp: currentTime,
        severity: 'high',
        sourceDevice: device.id,
        description: `Manual scan confirmed compromise on ${device.name}`,
        confidenceScore: 0.95,
        detectionType: 'signature_based',
        isAcknowledged: false,
      });
    }

    // Check for vulnerabilities
    if (device.vulnerabilities && device.vulnerabilities.length > 0) {
      alerts.push({
        id: generateShortId('alert-'),
        timestamp: currentTime,
        severity: 'medium',
        sourceDevice: device.id,
        description: `Vulnerabilities detected on ${device.name}: ${device.vulnerabilities.join(', ')}`,
        confidenceScore: 0.9,
        detectionType: 'signature_based',
        isAcknowledged: false,
      });
    }

    return alerts;
  }
}
