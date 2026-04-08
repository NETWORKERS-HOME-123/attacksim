import { Device, Topology, DefenseAction, DefenseActionType, SimulationEvent } from '@/types';
import { generateShortId } from '@/utils/uuid';

// ============================================
// Defense Engine
// ============================================

export interface DefenseResult {
  success: boolean;
  affectedDevices: string[];
  events: SimulationEvent[];
  message: string;
}

export class DefenseEngine {
  private topology: Topology;

  constructor(topology: Topology) {
    this.topology = topology;
  }

  updateTopology(topology: Topology): void {
    this.topology = topology;
  }

  executeAction(action: DefenseAction): DefenseResult {
    switch (action.type) {
      case 'isolate_device':
        return this.isolateDevice(action);
      case 'block_ip':
        return this.blockIP(action);
      case 'apply_firewall_rule':
        return this.applyFirewallRule(action);
      case 'patch_system':
        return this.patchSystem(action);
      case 'reset_credentials':
        return this.resetCredentials(action);
      case 'scan_network':
        return this.scanNetwork(action);
      case 'enable_firewall':
        return this.enableFirewall(action);
      case 'disable_smb':
        return this.disableSMB(action);
      default:
        return {
          success: false,
          affectedDevices: [],
          events: [],
          message: `Unknown action type: ${action.type}`,
        };
    }
  }

  private isolateDevice(action: DefenseAction): DefenseResult {
    const device = this.getDevice(action.targetDevice);
    if (!device) {
      return {
        success: false,
        affectedDevices: [],
        events: [],
        message: `Device ${action.targetDevice} not found`,
      };
    }

    // Already isolated
    if (device.status === 'isolated') {
      return {
        success: false,
        affectedDevices: [device.id],
        events: [],
        message: `Device ${device.name} is already isolated`,
      };
    }

    device.status = 'isolated';

    const event: SimulationEvent = {
      id: generateShortId('evt-'),
      timestamp: action.timestamp,
      type: 'defense_action',
      source: 'defense_engine',
      target: device.id,
      details: `Device ${device.name} isolated from network`,
    };

    return {
      success: true,
      affectedDevices: [device.id],
      events: [event],
      message: `Successfully isolated ${device.name}`,
    };
  }

  private blockIP(action: DefenseAction): DefenseResult {
    const device = this.getDevice(action.targetDevice);
    if (!device) {
      return {
        success: false,
        affectedDevices: [],
        events: [],
        message: `Device ${action.targetDevice} not found`,
      };
    }

    const ipToBlock = action.parameters?.ip as string;
    if (!ipToBlock) {
      return {
        success: false,
        affectedDevices: [],
        events: [],
        message: 'No IP address specified to block',
      };
    }

    if (!device.blockedIPs) {
      device.blockedIPs = [];
    }

    if (device.blockedIPs.includes(ipToBlock)) {
      return {
        success: false,
        affectedDevices: [device.id],
        events: [],
        message: `IP ${ipToBlock} is already blocked on ${device.name}`,
      };
    }

    device.blockedIPs.push(ipToBlock);

    const event: SimulationEvent = {
      id: generateShortId('evt-'),
      timestamp: action.timestamp,
      type: 'defense_action',
      source: 'defense_engine',
      target: device.id,
      details: `Blocked IP ${ipToBlock} on ${device.name}`,
    };

    return {
      success: true,
      affectedDevices: [device.id],
      events: [event],
      message: `Successfully blocked ${ipToBlock} on ${device.name}`,
    };
  }

  private applyFirewallRule(action: DefenseAction): DefenseResult {
    const device = this.getDevice(action.targetDevice);
    if (!device) {
      return {
        success: false,
        affectedDevices: [],
        events: [],
        message: `Device ${action.targetDevice} not found`,
      };
    }

    device.isFirewallEnabled = true;

    const event: SimulationEvent = {
      id: generateShortId('evt-'),
      timestamp: action.timestamp,
      type: 'defense_action',
      source: 'defense_engine',
      target: device.id,
      details: `Firewall rules applied on ${device.name}`,
    };

    return {
      success: true,
      affectedDevices: [device.id],
      events: [event],
      message: `Successfully applied firewall rules on ${device.name}`,
    };
  }

  private patchSystem(action: DefenseAction): DefenseResult {
    const device = this.getDevice(action.targetDevice);
    if (!device) {
      return {
        success: false,
        affectedDevices: [],
        events: [],
        message: `Device ${action.targetDevice} not found`,
      };
    }

    // Clear vulnerabilities
    const hadVulns = device.vulnerabilities && device.vulnerabilities.length > 0;
    device.vulnerabilities = [];

    // If compromised, patching might clean it (with some probability)
    if (device.status === 'compromised') {
      device.status = 'active';
    }

    const event: SimulationEvent = {
      id: generateShortId('evt-'),
      timestamp: action.timestamp,
      type: 'defense_action',
      source: 'defense_engine',
      target: device.id,
      details: `System patched on ${device.name}. ${hadVulns ? 'Vulnerabilities removed.' : ''}`,
    };

    return {
      success: true,
      affectedDevices: [device.id],
      events: [event],
      message: `Successfully patched ${device.name}`,
    };
  }

  private resetCredentials(action: DefenseAction): DefenseResult {
    const device = this.getDevice(action.targetDevice);
    if (!device) {
      return {
        success: false,
        affectedDevices: [],
        events: [],
        message: `Device ${action.targetDevice} not found`,
      };
    }

    // Remove credential-related vulnerabilities
    if (device.vulnerabilities) {
      device.vulnerabilities = device.vulnerabilities.filter(
        v => v !== 'weak_credentials' && v !== 'shared_credentials'
      );
    }

    const event: SimulationEvent = {
      id: generateShortId('evt-'),
      timestamp: action.timestamp,
      type: 'defense_action',
      source: 'defense_engine',
      target: device.id,
      details: `Credentials reset on ${device.name}`,
    };

    return {
      success: true,
      affectedDevices: [device.id],
      events: [event],
      message: `Successfully reset credentials on ${device.name}`,
    };
  }

  private scanNetwork(action: DefenseAction): DefenseResult {
    const events: SimulationEvent[] = [];
    const affectedDevices: string[] = [];

    // Scan all devices and identify compromised/under_attack ones
    for (const device of this.topology.devices) {
      if (device.status === 'compromised' || device.status === 'under_attack') {
        affectedDevices.push(device.id);
        events.push({
          id: generateShortId('evt-'),
          timestamp: action.timestamp,
          type: 'defense_action',
          source: 'defense_engine',
          target: device.id,
          details: `Scan detected ${device.status} state on ${device.name}`,
        });
      }
    }

    return {
      success: true,
      affectedDevices,
      events,
      message: `Network scan complete. Found ${affectedDevices.length} compromised/attacked devices.`,
    };
  }

  private enableFirewall(action: DefenseAction): DefenseResult {
    const device = this.getDevice(action.targetDevice);
    if (!device) {
      return {
        success: false,
        affectedDevices: [],
        events: [],
        message: `Device ${action.targetDevice} not found`,
      };
    }

    device.isFirewallEnabled = true;

    const event: SimulationEvent = {
      id: generateShortId('evt-'),
      timestamp: action.timestamp,
      type: 'defense_action',
      source: 'defense_engine',
      target: device.id,
      details: `Firewall enabled on ${device.name}`,
    };

    return {
      success: true,
      affectedDevices: [device.id],
      events: [event],
      message: `Successfully enabled firewall on ${device.name}`,
    };
  }

  private disableSMB(action: DefenseAction): DefenseResult {
    const device = this.getDevice(action.targetDevice);
    if (!device) {
      return {
        success: false,
        affectedDevices: [],
        events: [],
        message: `Device ${action.targetDevice} not found`,
      };
    }

    // Remove file_shares vulnerability
    if (device.vulnerabilities) {
      device.vulnerabilities = device.vulnerabilities.filter(v => v !== 'file_shares');
    }

    const event: SimulationEvent = {
      id: generateShortId('evt-'),
      timestamp: action.timestamp,
      type: 'defense_action',
      source: 'defense_engine',
      target: device.id,
      details: `SMB/file sharing disabled on ${device.name}`,
    };

    return {
      success: true,
      affectedDevices: [device.id],
      events: [event],
      message: `Successfully disabled SMB on ${device.name}`,
    };
  }

  private getDevice(deviceId: string): Device | undefined {
    return this.topology.devices.find(d => d.id === deviceId);
  }
}
