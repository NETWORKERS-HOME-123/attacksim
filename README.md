<div align="center">

# ⚔️ AttackSim — Cyber Attack & Defense Simulator

### Browser-based scenario simulator for SOC analyst and ethical hacker training

**Detect, respond to, and mitigate ransomware, DDoS, and insider-threat scenarios — entirely in your browser. No real exploits, no compromised hosts. Pure event-driven simulation.**

[![Cybersecurity](https://img.shields.io/badge/Cybersecurity-SOC%20Training-FF0040?style=for-the-badge)](https://www.networkershome.com/best-cybersecurity-course-in-bangalore/)
[![Ethical Hacking](https://img.shields.io/badge/Ethical%20Hacking-CEH%20%2F%20OSCP-000000?style=for-the-badge)](https://www.networkershome.com/best-cybersecurity-course-in-bangalore/)
[![License: MIT](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)](LICENSE)
[![Built by Networkers Home](https://img.shields.io/badge/Built%20by-Networkers%20Home-000000?style=for-the-badge)](https://www.networkershome.com/)

</div>

---

## 🏛️ Built by Networkers Home

AttackSim was built by **[Networkers Home](https://www.networkershome.com/)** — India's leading Cisco + cybersecurity training institute (Bengaluru, since 2005). It's a free practice companion to our flagship [Cybersecurity Pro](https://www.networkershome.com/best-cybersecurity-course-in-bangalore/), [Cloud Security](https://www.networkershome.com/best-cloud-security-cybersecurity-course-in-bangalore/), and [Full-Stack Network Security](https://www.networkershome.com/best-full-stack-network-security-course-in-bangalore/) programs — where students get a **4-month paid SOC internship** at the Networkers Home Network Security Operations Division working on real customer logs, escalating real incidents, writing real Sigma rules.

> Most cybersecurity training is theoretical. **Networkers Home runs a real SOC for real customers — students do paid L1 internships writing detection rules, triaging alerts, and escalating incidents to L2 analysts.**
> [Book a demo class →](https://www.networkershome.com/networkers-home-demo-class/)

**Compare top cybersecurity institutes:**
[Top 10 Cybersecurity India](https://www.networkershome.com/top-10-cybersecurity-training-institutes-india-2026/) · [Top 10 Cloud Security India](https://www.networkershome.com/top-10-cloud-security-training-institutes-india-2026/) · [Top 10 Ethical Hacking Bangalore](https://www.networkershome.com/top-10-ethical-hacking-training-institutes-bangalore-2026/)

---

## ✨ Features

### Core Modules

- **Scenario Engine** — Structured cybersecurity scenarios with win / lose conditions
- **Topology Engine** — Visual network with devices, links, interfaces
- **Simulation Engine** — Event-driven simulation with deterministic state transitions
- **Attack Engine** — Probabilistic attack propagation with realistic spreading models
- **Defense Engine** — CLI-based defense actions: `isolate`, `block`, `scan`, `patch`
- **Detection Engine** — Security alerts with realistic delays and false positives
- **CLI Parser** — Security-focused terminal interface (xterm.js)
- **Canvas Renderer** — Interactive network visualization (Konva.js)

### Implemented Scenarios

| ID | Scenario | Objective | Time Limit |
|---|---|---|---|
| **SCN-001** | Ransomware Outbreak — Office Network (spreads via shared credentials) | Contain infection to ≤ 2 devices | 10 min |
| **SCN-002** | DDoS on Public Web Server (external botnet flood) | Block malicious IPs and restore service | 5 min |
| **SCN-003** | Insider Data Exfiltration (employee leaking data) | Detect and stop data transfer | ~8 min |

## 🎯 Who this is for

- **SOC analyst aspirants** building muscle memory for L1 → L2 escalation flows
- **CEH / OSCP / CompTIA Security+** candidates practicing scenario response
- **Security instructors** running classroom CTF-style exercises
- **Career switchers** evaluating whether SOC/Blue-Team work is for them

## 📚 Learn the underlying skills

A simulator teaches **what to click**. To learn **what threats actually look like in production telemetry, how to write Sigma rules that don't false-positive, how to escalate to L2 without burning credibility** — train with engineers who run a real SOC:

| Goal | Networkers Home program |
|---|---|
| Become SOC L1 / L2 analyst | [Cybersecurity Pro (incl. 4-month paid SOC internship)](https://www.networkershome.com/best-cybersecurity-course-in-bangalore/) |
| Cloud security specialization | [Cloud Security Cybersecurity course](https://www.networkershome.com/best-cloud-security-cybersecurity-course-in-bangalore/) |
| Full-stack network security | [Full-Stack Network Security](https://www.networkershome.com/best-full-stack-network-security-course-in-bangalore/) |
| Ethical hacking / red team path | [Cybersecurity Pro program](https://www.networkershome.com/best-cybersecurity-course-in-bangalore/) |
| Online study (anywhere in India) | [All courses](https://www.networkershome.com/networkershome-all-courses/) |

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/vikasswaminh/attacksim.git
cd attacksim

# Install dependencies
npm install

# Run development server
npm run dev
```

The app runs on http://localhost:3000.

### Production Build

```bash
npm run build
npm start
```

## 🏗️ Tech Stack

- **Frontend** — Next.js 15 + React 19 + TypeScript
- **Canvas** — Konva.js for network visualization
- **Terminal** — xterm.js for CLI interface
- **State Management** — Zustand
- **Styling** — Tailwind CSS

## 📂 Documentation

This repo includes detailed engineering docs:
- `E2E_WIRING_SUMMARY.md` — end-to-end module wiring
- `QUICKSTART.md` — runtime quickstart for new contributors
- `VERIFICATION_REPORT.md` — pre-release verification checklist
- `WIRING_DIAGRAM.md` — visual architecture diagram

## 🤝 Contributing

PRs welcome. Particularly useful contributions:
- New scenarios (lateral movement, supply-chain compromise, MFA-bypass phish, OAuth-token theft)
- More realistic attacker dwell-time models
- MITRE ATT&CK technique mapping
- Sigma-rule import / export
- Multiplayer red-vs-blue mode

## 📜 License

MIT

---

<div align="center">

### 🏛️ Want to break into SOC analyst roles?

**[Networkers Home](https://www.networkershome.com/)** — Bengaluru's leading cybersecurity training institute since 2005.
4-month paid SOC internship · Real customer logs · Sigma rule writing · MITRE ATT&CK detection engineering ·
800+ hiring partners · 100% placement guarantee.

[**Free demo class**](https://www.networkershome.com/networkers-home-demo-class/) · [**Placement record**](https://www.networkershome.com/networkers-home-placement-record-2026/) · [**Talk to a counsellor**](https://www.networkershome.com/career-counselling/)

</div>
