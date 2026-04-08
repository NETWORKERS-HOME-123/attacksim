import { Scenario, Topology, Device, Link } from '@/types';

// Helper function to generate MAC address
function generateMAC(): string {
  return Array(6)
    .fill(0)
    .map(() => Math.floor(Math.random() * 256).toString(16).padStart(2, '0'))
    .join(':');
}

// Helper function to create a device
function createDevice(
  id: string,
  type: Device['type'],
  name: string,
  x: number,
  y: number,
  ip: string,
  vulnerabilities: string[] = []
): Device {
  return {
    id,
    type,
    name,
    x,
    y,
    interfaces: [
      {
        name: 'eth0',
        ip,
        mac: generateMAC(),
        status: 'up',
      },
    ],
    status: 'active',
    vulnerabilities,
    isFirewallEnabled: type === 'firewall',
    blockedIPs: [],
  };
}

// Helper function to create a link
function createLink(id: string, from: string, to: string): Link {
  return {
    id,
    from,
    to,
    latency: Math.floor(Math.random() * 10) + 1,
  };
}

// ============================================
// SCENARIO 001: Ransomware Outbreak - Office Network
// ============================================

const scenario001Topology: Topology = {
  devices: [
    // Router
    createDevice('router-1', 'router', 'Main Router', 400, 100, '192.168.1.1'),
    // Firewall
    createDevice('firewall-1', 'firewall', 'Edge Firewall', 400, 200, '192.168.1.2'),
    // Switch
    createDevice('switch-1', 'switch', 'Core Switch', 400, 300, '192.168.1.3'),
    // Workstations (host-1 is initially infected)
    createDevice('host-1', 'host', 'Workstation-01 (HR)', 200, 400, '192.168.1.101', ['unpatched_os', 'weak_credentials']),
    createDevice('host-2', 'host', 'Workstation-02 (Finance)', 300, 400, '192.168.1.102', ['shared_credentials']),
    createDevice('host-3', 'host', 'Workstation-03 (IT)', 400, 400, '192.168.1.103'),
    createDevice('host-4', 'host', 'Workstation-04 (Sales)', 500, 400, '192.168.1.104', ['outdated_antivirus']),
    createDevice('host-5', 'host', 'Workstation-05 (Manager)', 600, 400, '192.168.1.105'),
    // Server
    createDevice('server-1', 'server', 'File Server', 400, 500, '192.168.1.200', ['file_shares']),
  ],
  links: [
    createLink('link-1', 'router-1/eth0', 'firewall-1/eth0'),
    createLink('link-2', 'firewall-1/eth0', 'switch-1/eth0'),
    createLink('link-3', 'switch-1/eth0', 'host-1/eth0'),
    createLink('link-4', 'switch-1/eth0', 'host-2/eth0'),
    createLink('link-5', 'switch-1/eth0', 'host-3/eth0'),
    createLink('link-6', 'switch-1/eth0', 'host-4/eth0'),
    createLink('link-7', 'switch-1/eth0', 'host-5/eth0'),
    createLink('link-8', 'switch-1/eth0', 'server-1/eth0'),
  ],
};

export const scenario001: Scenario = {
  id: 'SCN-001',
  name: 'Ransomware Outbreak - Office Network',
  description: 'Initial infection spreads across internal network via shared credentials. A phishing email has compromised Workstation-01 (HR). The ransomware is spreading laterally through the network.',
  initialTopology: scenario001Topology,
  initialEvents: [],
  objectives: [
    'Detect infected hosts',
    'Isolate compromised devices',
    'Stop lateral movement',
  ],
  winConditions: [
    {
      type: 'containment',
      parameters: { maxInfectedDevices: 2 },
      description: 'Contain infection to 2 or fewer devices',
    },
  ],
  failConditions: [
    {
      type: 'infection_rate',
      parameters: { thresholdPercentage: 60 },
      description: '60% or more devices infected',
    },
  ],
  timeLimit: 600, // 10 minutes
  initialInfectedDevices: ['host-1'],
  entryPoint: 'phishing_email',
  attackChain: [
    'phishing -> credential theft -> lateral movement -> ransomware execution',
  ],
};

// ============================================
// SCENARIO 002: DDoS on Public Web Server
// ============================================

const scenario002Topology: Topology = {
  devices: [
    createDevice('router-1', 'router', 'Border Router', 400, 100, '203.0.113.1'),
    createDevice('firewall-1', 'firewall', 'Perimeter Firewall', 400, 200, '203.0.113.2'),
    createDevice('switch-1', 'switch', 'DMZ Switch', 400, 300, '10.0.1.3'),
    createDevice('web-server', 'server', 'Web Server', 400, 400, '10.0.1.10'),
    createDevice('host-ext-1', 'host', 'Bot-1', 100, 100, '198.51.100.1'),
    createDevice('host-ext-2', 'host', 'Bot-2', 100, 200, '198.51.100.2'),
    createDevice('host-ext-3', 'host', 'Bot-3', 100, 300, '198.51.100.3'),
    createDevice('host-ext-4', 'host', 'Bot-4', 100, 400, '198.51.100.4'),
    createDevice('host-ext-5', 'host', 'Bot-5', 100, 500, '198.51.100.5'),
  ],
  links: [
    createLink('link-1', 'router-1/eth0', 'firewall-1/eth0'),
    createLink('link-2', 'firewall-1/eth0', 'switch-1/eth0'),
    createLink('link-3', 'switch-1/eth0', 'web-server/eth0'),
    createLink('link-ext-1', 'host-ext-1/eth0', 'router-1/eth0'),
    createLink('link-ext-2', 'host-ext-2/eth0', 'router-1/eth0'),
    createLink('link-ext-3', 'host-ext-3/eth0', 'router-1/eth0'),
    createLink('link-ext-4', 'host-ext-4/eth0', 'router-1/eth0'),
    createLink('link-ext-5', 'host-ext-5/eth0', 'router-1/eth0'),
  ],
};

export const scenario002: Scenario = {
  id: 'SCN-002',
  name: 'DDoS on Public Web Server',
  description: 'External botnet flooding web server with traffic. Identify and block malicious IPs to restore service.',
  initialTopology: scenario002Topology,
  initialEvents: [],
  objectives: [
    'Identify traffic spike',
    'Block malicious IP ranges',
    'Restore service availability',
  ],
  winConditions: [
    {
      type: 'traffic_reduction',
      parameters: { threshold: 100 },
      description: 'Reduce traffic load below threshold',
    },
  ],
  failConditions: [
    {
      type: 'server_downtime',
      parameters: { maxSeconds: 120 },
      description: 'Server downtime exceeds 120 seconds',
    },
  ],
  timeLimit: 300, // 5 minutes
  initialInfectedDevices: ['host-ext-1', 'host-ext-2', 'host-ext-3', 'host-ext-4', 'host-ext-5'],
  entryPoint: 'botnet',
  attackChain: ['ddos_flood -> service_degradation -> complete_outage'],
};

// ============================================
// SCENARIO 003: Insider Data Exfiltration
// ============================================

const scenario003Topology: Topology = {
  devices: [
    createDevice('firewall-1', 'firewall', 'Gateway', 400, 100, '192.168.1.1'),
    createDevice('switch-1', 'switch', 'Core Switch', 400, 200, '192.168.1.2'),
    createDevice('db-server', 'server', 'Database Server', 300, 300, '192.168.1.10'),
    createDevice('file-server', 'server', 'File Server', 500, 300, '192.168.1.11'),
    createDevice('user-1', 'host', 'User-1 (Sales)', 200, 400, '192.168.1.101'),
    createDevice('user-2', 'host', 'User-2 (HR)', 300, 400, '192.168.1.102'),
    createDevice('user-3', 'host', 'User-3 (Disgruntled)', 400, 400, '192.168.1.103'),
    createDevice('user-4', 'host', 'User-4 (IT)', 500, 400, '192.168.1.104'),
    createDevice('external-drop', 'host', 'External Server', 700, 400, '185.220.101.42'),
  ],
  links: [
    createLink('link-1', 'firewall-1/eth0', 'switch-1/eth0'),
    createLink('link-2', 'switch-1/eth0', 'db-server/eth0'),
    createLink('link-3', 'switch-1/eth0', 'file-server/eth0'),
    createLink('link-4', 'switch-1/eth0', 'user-1/eth0'),
    createLink('link-5', 'switch-1/eth0', 'user-2/eth0'),
    createLink('link-6', 'switch-1/eth0', 'user-3/eth0'),
    createLink('link-7', 'switch-1/eth0', 'user-4/eth0'),
    createLink('link-ext', 'firewall-1/eth0', 'external-drop/eth0'),
  ],
};

export const scenario003: Scenario = {
  id: 'SCN-003',
  name: 'Insider Data Exfiltration',
  description: 'Employee leaking sensitive data to external server. Detect abnormal data transfer and revoke access.',
  initialTopology: scenario003Topology,
  initialEvents: [],
  objectives: [
    'Detect abnormal data transfer',
    'Revoke access',
    'Secure endpoints',
  ],
  winConditions: [
    {
      type: 'data_protection',
      parameters: { maxDataMB: 100 },
      description: 'Stop data transfer before 100MB limit',
    },
  ],
  failConditions: [
    {
      type: 'data_leak',
      parameters: { thresholdMB: 500 },
      description: 'Data leak exceeds 500MB',
    },
  ],
  timeLimit: 500, // ~8 minutes
  initialInfectedDevices: ['user-3'],
  entryPoint: 'compromised_user',
  attackChain: ['access_sensitive_data -> compress -> exfiltrate'],
};

// ============================================
// Scenario Registry
// ============================================

export const scenarios: Record<string, Scenario> = {
  'SCN-001': scenario001,
  'SCN-002': scenario002,
  'SCN-003': scenario003,
};

export const defaultScenario = scenario001;

export function getScenario(id: string): Scenario {
  return scenarios[id] || defaultScenario;
}

export function getAllScenarios(): Scenario[] {
  return Object.values(scenarios);
}
