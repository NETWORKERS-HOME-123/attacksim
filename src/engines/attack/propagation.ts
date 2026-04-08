import { Device, Topology, AttackConfig, PropagationFactors, AttackType } from '@/types';
import { SeededRandom } from '@/utils/random';

// ============================================
// Attack Configuration
// ============================================

export const attackConfigs: Record<AttackType, AttackConfig> = {
  phishing: {
    baseProbability: 0.4,
    spreadRate: 0.2,
    detectionDelay: 5000,
  },
  lateral_movement: {
    baseProbability: 0.5,
    spreadRate: 0.3,
    detectionDelay: 3000,
  },
  ransomware: {
    baseProbability: 0.6,
    spreadRate: 0.4,
    detectionDelay: 2000,
  },
  ddos: {
    baseProbability: 0.8,
    spreadRate: 0.9,
    detectionDelay: 1000,
  },
  mitm: {
    baseProbability: 0.5,
    spreadRate: 0.3,
    detectionDelay: 4000,
  },
  credential_stuffing: {
    baseProbability: 0.3,
    spreadRate: 0.2,
    detectionDelay: 3000,
  },
  dns_spoofing: {
    baseProbability: 0.4,
    spreadRate: 0.3,
    detectionDelay: 3500,
  },
  c2_beaconing: {
    baseProbability: 0.2,
    spreadRate: 0.1,
    detectionDelay: 5000,
  },
  data_exfiltration: {
    baseProbability: 0.3,
    spreadRate: 0.2,
    detectionDelay: 6000,
  },
  unpatched_exploit: {
    baseProbability: 0.5,
    spreadRate: 0.4,
    detectionDelay: 2500,
  },
};

// ============================================
// Propagation Engine
// ============================================

export class AttackPropagationEngine {
  private random: SeededRandom;
  private topology: Topology;

  constructor(topology: Topology, random: SeededRandom) {
    this.topology = topology;
    this.random = random;
  }

  // Calculate infection probability based on various factors
  calculateInfectionProbability(
    sourceDevice: Device,
    targetDevice: Device,
    attackType: AttackType,
    tick: number
  ): number {
    const config = attackConfigs[attackType];
    
    // Base probability from attack type
    const baseProb = config.baseProbability;
    
    // Network factor: based on connectivity
    const networkFactor = this.calculateNetworkFactor(targetDevice);
    
    // Defense factor: reduces probability based on defenses
    const defenseFactor = this.calculateDefenseFactor(targetDevice);
    
    // Time decay: reduces spread over time
    const timeDecay = Math.max(0.3, 1 - (tick * 0.001));
    
    // Vulnerability bonus: target has vulnerabilities
    const vulnerabilityBonus = this.calculateVulnerabilityBonus(targetDevice, attackType);
    
    // Formula: P(infection) = base_prob * network_factor * (1 - defense_factor) * time_decay + vulnerability_bonus
    let probability = baseProb * networkFactor * (1 - defenseFactor) * timeDecay;
    probability += vulnerabilityBonus;
    
    // Clamp between 0 and 1
    return Math.min(1, Math.max(0, probability));
  }

  private calculateNetworkFactor(device: Device): number {
    // Count connected devices
    const connectedCount = this.getConnectedDevices(device.id).length;
    const totalDevices = this.topology.devices.length;
    
    if (totalDevices <= 1) return 1;
    
    // More connected = higher spread probability
    return Math.min(1, connectedCount / (totalDevices - 1));
  }

  private calculateDefenseFactor(device: Device): number {
    let factor = 0;
    
    // Firewall reduces spread
    if (device.isFirewallEnabled) {
      factor += 0.3;
    }
    
    // Isolation completely stops spread
    if (device.status === 'isolated') {
      factor += 1.0;
    }
    
    // Blocked IPs reduce spread
    if (device.blockedIPs && device.blockedIPs.length > 0) {
      factor += Math.min(0.3, device.blockedIPs.length * 0.05);
    }
    
    // Patching reduces vulnerability
    if (!device.vulnerabilities || device.vulnerabilities.length === 0) {
      factor += 0.2;
    }
    
    return Math.min(1, factor);
  }

  private calculateVulnerabilityBonus(device: Device, attackType: AttackType): number {
    if (!device.vulnerabilities) return 0;
    
    let bonus = 0;
    
    // Check if vulnerabilities match attack type
    for (const vuln of device.vulnerabilities) {
      switch (attackType) {
        case 'ransomware':
          if (vuln === 'unpatched_os' || vuln === 'outdated_antivirus') {
            bonus += 0.15;
          }
          if (vuln === 'shared_credentials') {
            bonus += 0.1;
          }
          break;
        case 'lateral_movement':
          if (vuln === 'shared_credentials' || vuln === 'file_shares') {
            bonus += 0.2;
          }
          break;
        case 'credential_stuffing':
          if (vuln === 'weak_credentials' || vuln === 'shared_credentials') {
            bonus += 0.15;
          }
          break;
        case 'unpatched_exploit':
          if (vuln === 'unpatched_os') {
            bonus += 0.25;
          }
          break;
        default:
          break;
      }
    }
    
    return bonus;
  }

  // Get devices connected to a given device
  getConnectedDevices(deviceId: string): Device[] {
    const connectedIds = new Set<string>();
    
    for (const link of this.topology.links) {
      const [fromDevice] = link.from.split('/');
      const [toDevice] = link.to.split('/');
      
      if (fromDevice === deviceId) {
        connectedIds.add(toDevice);
      } else if (toDevice === deviceId) {
        connectedIds.add(fromDevice);
      }
    }
    
    return this.topology.devices.filter(d => connectedIds.has(d.id));
  }

  // Attempt to spread attack to neighbors
  attemptSpread(
    sourceDevice: Device,
    attackType: AttackType,
    tick: number
  ): Array<{ device: Device; success: boolean; probability: number }> {
    const neighbors = this.getConnectedDevices(sourceDevice.id);
    const results = [];
    
    for (const neighbor of neighbors) {
      // Skip already compromised or isolated devices
      if (neighbor.status === 'compromised' || neighbor.status === 'isolated') {
        continue;
      }
      
      const probability = this.calculateInfectionProbability(
        sourceDevice,
        neighbor,
        attackType,
        tick
      );
      
      // Roll for infection
      const roll = this.random.next();
      const success = roll < probability;
      
      results.push({
        device: neighbor,
        success,
        probability,
      });
    }
    
    return results;
  }

  // Update topology reference
  updateTopology(topology: Topology): void {
    this.topology = topology;
  }
}
