# Cyber Attack & Defense Simulator

A scenario-driven cybersecurity simulator where users detect, respond to, and mitigate simulated cyber attacks using a visual network canvas and CLI interface. No real exploits - purely event-driven simulation.

![Cyber Simulator](./docs/screenshot.png)

## Features

### Core Modules

- **Scenario Engine**: Structured cybersecurity scenarios with win/lose conditions
- **Topology Engine**: Visual network representation with devices, links, and interfaces
- **Simulation Engine**: Event-driven simulation running with deterministic state transitions
- **Attack Engine**: Probabilistic attack propagation with realistic spreading models
- **Defense Engine**: CLI-based defense actions (isolate, block, scan, patch)
- **Detection Engine**: Security alerts with realistic delays and false positives
- **CLI Parser**: Security-focused terminal interface with xterm.js
- **Canvas Renderer**: Interactive network visualization with Konva.js

### Implemented Scenarios

1. **SCN-001: Ransomware Outbreak - Office Network**
   - Initial infection spreads via shared credentials
   - Objective: Contain infection to ≤2 devices
   - Time limit: 10 minutes

2. **SCN-002: DDoS on Public Web Server**
   - External botnet flooding server
   - Objective: Block malicious IPs and restore service
   - Time limit: 5 minutes

3. **SCN-003: Insider Data Exfiltration**
   - Employee leaking sensitive data
   - Objective: Detect and stop data transfer
   - Time limit: ~8 minutes

## Tech Stack

- **Frontend**: Next.js 15 + React 19 + TypeScript
- **Canvas**: Konva.js for network visualization
- **Terminal**: xterm.js for CLI interface
- **State Management**: Zustand
- **Styling**: Tailwind CSS

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

```bash
# Clone the repository
git clone <repo-url>
cd "attack cyber simulator"

# Install dependencies
npm install

# Run development server
npm run dev

# Open http://localhost:3000
```

### Building for Production

```bash
npm run build
npm start
```

## How to Play

### Starting a Simulation

1. Click "Start Simulation" to begin
2. Observe the network canvas for visual indicators of compromise
3. Watch the Alert Panel for security alerts

### Using the CLI

The terminal accepts security-focused commands:

```bash
# View help
help

# Show information
show logs              # Display security logs
show alerts            # Show active alerts
show devices           # List network devices
show status            # Simulation status

# Defense actions
isolate <device>       # Disconnect device from network
block ip <ip>          # Block traffic from IP address
scan network           # Scan for compromised nodes
patch <device>         # Apply security patch
reset credentials <device>  # Reset credentials
enable firewall        # Enable firewall protection
disable smb            # Disable SMB/file sharing
```

### Example Commands

```bash
isolate host-1
block ip 192.168.1.100 on firewall-1
scan network
patch host-2
enable firewall
```

### Visual Indicators

- **Green**: Normal device
- **Orange**: Under attack
- **Red**: Compromised
- **Gray**: Isolated
- **Yellow dot**: Device has vulnerabilities

### Win/Lose Conditions

- **Win**: Contain infection to specified threshold
- **Lose**: Too many devices infected or time expires

## Architecture

### Event-Driven System

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Attack    │────▶│ Simulation  │────▶│  Detection  │
│   Engine    │     │   Engine    │     │   Engine    │
└─────────────┘     └──────┬──────┘     └──────┬──────┘
                           │                     │
                           ▼                     ▼
                    ┌─────────────┐     ┌─────────────┐
                    │    Store    │◀────│    UI       │
                    │  (Zustand)  │     │ (React)     │
                    └──────┬──────┘     └─────────────┘
                           │
                           ▼
                    ┌─────────────┐
                    │   Defense   │
                    │   Engine    │
                    └─────────────┘
```

### Attack Propagation Model

```
P(infection) = base_prob * network_factor * (1 - defense_factor) * time_decay + vulnerability_bonus
```

- **base_prob**: Attack type inherent spread rate
- **network_factor**: Connectivity-based spread potential
- **defense_factor**: Applied security controls
- **time_decay**: Reduced spread over time
- **vulnerability_bonus**: Target-specific vulnerabilities

## Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── page.tsx           # Main simulator page
│   ├── layout.tsx
│   └── globals.css
├── components/
│   ├── NetworkCanvas/     # Konva.js visualization
│   ├── Terminal/          # xterm.js CLI
│   ├── AlertPanel/        # Security alerts display
│   └── ControlPanel/      # Game controls
├── engines/
│   ├── attack/            # Attack propagation
│   ├── defense/           # Defense actions
│   ├── detection/         # Alert generation
│   ├── cli/               # CLI parser
│   └── simulation/        # Simulation worker
├── store/                 # Zustand state
├── types/                 # TypeScript types
├── scenarios/             # Scenario definitions
└── utils/                 # Utilities (uuid, random)
```

## Development Guidelines

### Adding New Scenarios

1. Define scenario in `src/scenarios/index.ts`
2. Create topology with devices and links
3. Set win/lose conditions
4. Add to `scenarios` registry

### Adding New Attack Types

1. Add type to `AttackType` in `src/types/index.ts`
2. Add config to `attackConfigs` in `src/engines/attack/propagation.ts`
3. Implement detection rules in `DetectionEngine`

### Adding New Defense Actions

1. Add type to `DefenseActionType` in `src/types/index.ts`
2. Implement handler in `DefenseEngine`
3. Add CLI command in `CLIParser`

## Security Notice

**This simulator does NOT:**
- Execute real malware or exploits
- Use external hacking tools
- Connect to real systems
- Cause actual harm

**This simulator DOES:**
- Simulate attack logic mathematically
- Visualize attack propagation
- Log events for analysis
- Train response procedures

## License

MIT License - See LICENSE file for details

## Acknowledgments

- Built for cybersecurity education and training
- Inspired by real-world SOC (Security Operations Center) workflows
- Designed for replayability and deterministic outcomes
