# Cyber Attack & Defense Simulator - Trainer's Guide

## Comprehensive Instructor Manual for Classroom Deployment

**Version:** 1.0  
**Platform:** Cyber Attack & Defense Simulator  
**Audience:** Cybersecurity instructors, lab administrators, and course designers  
**Estimated Reading Time:** 20 minutes

---

## Table of Contents

1. [Introduction and Purpose](#1-introduction-and-purpose)
2. [System Requirements and Installation](#2-system-requirements-and-installation)
3. [Platform Architecture Overview](#3-platform-architecture-overview)
4. [Scenario Deep-Dive and Teaching Objectives](#4-scenario-deep-dive-and-teaching-objectives)
5. [Classroom Session Plans](#5-classroom-session-plans)
6. [Simulation Mechanics for Instructors](#6-simulation-mechanics-for-instructors)
7. [Grading and Assessment Framework](#7-grading-and-assessment-framework)
8. [Common Student Mistakes and Instructor Interventions](#8-common-student-mistakes-and-instructor-interventions)
9. [Extending the Simulator](#9-extending-the-simulator)
10. [Troubleshooting and FAQ](#10-troubleshooting-and-faq)

---

## 1. Introduction and Purpose

The Cyber Attack & Defense Simulator is a browser-based, client-side cybersecurity training platform designed for hands-on lab sessions. It places students in the role of a Security Operations Center (SOC) analyst who must respond to live cyberattacks on a simulated corporate network. The simulator runs entirely in the browser with no backend, no real exploits, and no external network access, making it completely safe for classroom deployment.

### What This Simulator Teaches

This platform maps directly to industry-standard frameworks and certifications:

**NIST Cybersecurity Framework Alignment:**
- **Identify:** Students learn to map network topology, discover assets, and identify vulnerabilities through the `scan network` and `show devices` commands.
- **Protect:** Defense actions like `enable firewall`, `patch`, `disable smb`, and `block ip` teach protective controls.
- **Detect:** The alert panel with severity-based color coding, confidence scores, and detection delays teaches students how real SIEM systems surface threats.
- **Respond:** Isolation, credential resets, and IP blocking teach incident response under time pressure.
- **Recover:** Post-scenario scoring and the "damage prevented" metric teach students to evaluate response effectiveness.

**CompTIA Security+ Alignment:** Threat types, vulnerability management, incident response procedures, network security controls.

**CCNA CyberOps Alignment:** SOC operations, alert triage, event correlation, CLI-based investigation.

### Why Client-Side Simulation Works

Traditional cybersecurity labs require virtual machines, complex networking, and careful isolation. This simulator achieves the same learning outcomes through mathematical modeling. The attack propagation engine uses a probability formula that accounts for network topology, defense posture, device vulnerabilities, and time decay. Students make the same decisions a real SOC analyst would — the simulation just calculates outcomes mathematically rather than executing real exploits.

The seeded random number generator (Linear Congruential Generator) ensures that every student running the same scenario with the same seed experiences identical attack patterns. This is critical for fair grading and reproducible lab exercises.

---

## 2. System Requirements and Installation

### Hardware Requirements

| Component | Minimum | Recommended |
|-----------|---------|-------------|
| CPU | Dual-core 2GHz | Quad-core 2.5GHz+ |
| RAM | 4 GB | 8 GB |
| Display | 1366x768 | 1920x1080 |
| Browser | Chrome 90+ / Firefox 88+ / Edge 90+ | Latest Chrome or Edge |

The simulator uses Konva.js for canvas rendering and xterm.js for terminal emulation. Both require a modern browser with HTML5 Canvas and WebGL support. Safari is supported but may show slight rendering differences in the canvas layer. Mobile browsers are not recommended due to the CLI interface requirement.

### Installation Steps (Lab Administrator)

**Step 1: Install Node.js**
Download and install Node.js version 18 or higher from nodejs.org. Verify installation:
```bash
node --version    # Should show v18.x.x or higher
npm --version     # Should show 9.x.x or higher
```

**Step 2: Clone or Copy the Project**
```bash
# If using Git
git clone <repository-url> cyber-simulator
cd cyber-simulator

# Or copy the project folder to each lab machine
```

**Step 3: Install Dependencies**
```bash
npm install
```
This installs 10 production dependencies and 3 development dependencies. Total install size is approximately 200MB including node_modules.

**Step 4: Start the Development Server**
```bash
npm run dev
```
The simulator launches at `http://localhost:3000`. For lab networks, students can access it from their own machines if the host machine's firewall allows port 3000.

**Step 5: Production Build (Optional)**
For permanent lab installations:
```bash
npm run build
npm start
```
The production build is optimized and serves static assets more efficiently.

### Multi-Student Lab Setup Options

**Option A: Individual Installations** — Each student machine runs its own instance. Best for take-home assignments.

**Option B: Shared Server** — One powerful machine hosts the simulator, students connect via browser. Add `--hostname 0.0.0.0` to the dev command:
```bash
npx next dev --hostname 0.0.0.0 --port 3000
```

**Option C: Static Export** — Build and serve via any web server (Apache, Nginx, IIS). Since the app is fully client-side, no Node.js runtime is needed on the serving machine after build.

---

## 3. Platform Architecture Overview

Understanding the architecture helps instructors explain what is happening "under the hood" when students ask questions.

### Three-Layer Architecture

```
┌─────────────────────────────────────────────────────────┐
│  UI LAYER (React Components)                            │
│  NetworkCanvas | Terminal | AlertPanel | ControlPanel    │
│  DashboardStats                                         │
├─────────────────────────────────────────────────────────┤
│  STATE LAYER (Zustand Store)                            │
│  SimulationState | Topology | Alerts | Attacks | Score  │
├─────────────────────────────────────────────────────────┤
│  LOGIC LAYER (TypeScript Engines)                       │
│  AttackPropagation | Defense | Detection | CLIParser    │
└─────────────────────────────────────────────────────────┘
```

**Data flows in one direction:** The simulation engine runs a game loop at 200ms intervals (5 ticks per second). Each tick processes attack propagation, generates detection alerts, checks win/lose conditions, and calculates the score. The updated state is pushed to the Zustand store, which triggers React component re-renders.

### The Game Loop (Every 200ms)

1. **Increment tick counter** and update elapsed time
2. **Process attack propagation** — every 10 ticks (2 seconds), infected devices attempt to spread to neighbors
3. **Process pending alerts** — alerts that have passed their detection delay are emitted to the alert panel
4. **Check end conditions** — evaluate win conditions, fail conditions, and time limits
5. **Update score** — recalculate damage prevented, detection speed bonus, and isolation bonus
6. **Broadcast state** — push to Zustand store, triggering UI updates

### The Attack Propagation Formula

This is the core simulation mechanic. When an infected device attempts to spread to a neighbor:

```
P(infection) = baseProbability x networkFactor x (1 - defenseFactor) x timeDecay + vulnerabilityBonus
```

| Factor | Calculation | Range |
|--------|------------|-------|
| baseProbability | Set per attack type (0.2 for c2_beaconing to 0.8 for ddos) | 0.0 - 0.8 |
| networkFactor | connectedDevices / (totalDevices - 1) | 0.0 - 1.0 |
| defenseFactor | firewall(+0.3) + isolation(+1.0) + blockedIPs(+0.05 each, max 0.3) + patched(+0.2) | 0.0 - 1.0 |
| timeDecay | max(0.3, 1 - tick x 0.001) | 0.3 - 1.0 |
| vulnerabilityBonus | Sum of matching vulnerability bonuses (+0.1 to +0.25 each) | 0.0 - 0.5+ |

**Instructor Note:** The defenseFactor of 1.0 for isolated devices means isolation completely blocks infection. This is intentional — isolation is the "nuclear option" that stops the attack but takes a device offline. Students must learn to balance network availability with security.

---

## 4. Scenario Deep-Dive and Teaching Objectives

### Scenario 1: Ransomware Outbreak - Office Network

**Duration:** 10 minutes | **Difficulty:** Medium | **Best for:** Introductory sessions

**Network Layout (9 devices):**
- Router (192.168.1.1), Firewall (192.168.1.2), Switch (192.168.1.3)
- 5 Workstations: HR (192.168.1.101, INFECTED), Finance (.102), IT (.103), Sales (.104), Manager (.105)
- File Server (192.168.1.200)

**Pre-existing Vulnerabilities:**
- HR Workstation: `unpatched_os`, `weak_credentials` (the entry point)
- Finance: `shared_credentials`
- Sales: `outdated_antivirus`
- File Server: `file_shares`

**Win Condition:** Contain infection to 2 or fewer devices.
**Fail Condition:** 60% or more devices infected (6 out of 9).

**Teaching Objectives:**
1. Identify the initial compromise through alerts and scanning
2. Prioritize which devices to protect (File Server is highest value)
3. Learn that `isolate` stops spread completely but loses the device
4. Understand vulnerability chaining — `shared_credentials` on Finance makes it a prime target for lateral movement from the infected HR workstation
5. Practice patching and credential resets as softer alternatives to isolation

**Instructor Talking Points:**
- Ask students: "Why was HR the entry point?" (Answer: phishing email + weak credentials)
- Ask students: "Which device should you protect first?" (Answer: File Server — it has `file_shares` vulnerability and is critical infrastructure)
- Point out that IT workstation (.103) has no vulnerabilities — it is the safest device and lowest priority

### Scenario 2: DDoS on Public Web Server

**Duration:** 5 minutes | **Difficulty:** High | **Best for:** Intermediate sessions

**Network Layout (9 devices):**
- Border Router (203.0.113.1), Firewall (203.0.113.2), DMZ Switch (10.0.1.3)
- Web Server (10.0.1.10) — the asset to protect
- 5 Bot nodes (198.51.100.1-5) — ALL pre-infected, external attackers

**Win Condition:** Reduce traffic load below threshold.
**Fail Condition:** Server downtime exceeds 120 seconds.

**Teaching Objectives:**
1. This scenario teaches a fundamentally different defense strategy — you cannot "patch" a DDoS
2. Students must rapidly block bot IPs at the firewall level
3. The 5-minute timer creates real pressure; students learn triage under stress
4. IP blocking stacks: each blocked IP adds 0.05 to defenseFactor (max 0.3 for 6+ IPs)
5. Students learn that DDoS has a baseProbability of 0.8 — the highest of any attack type

**Instructor Talking Points:**
- Ask: "Why can't you just isolate the web server?" (Answer: That takes it offline — the attacker wins)
- Explain the real-world parallel: rate limiting, CDN absorption, IP reputation filtering
- Note that this scenario has the shortest timer (5 minutes) because DDoS response must be immediate

### Scenario 3: Insider Data Exfiltration

**Duration:** ~8 minutes | **Difficulty:** Advanced | **Best for:** Advanced sessions

**Network Layout (9 devices):**
- Firewall (192.168.1.1), Switch (192.168.1.2)
- Database Server (.10), File Server (.11) — critical data stores
- 4 Users: Sales (.101), HR (.102), Disgruntled (.103, INFECTED), IT (.104)
- External Drop Server (185.220.101.42) — attacker's exfiltration target

**Win Condition:** Stop data transfer before 100MB leaked.
**Fail Condition:** Data leak exceeds 500MB.

**Teaching Objectives:**
1. Insider threats are the hardest to detect — data_exfiltration has a 6000ms detection delay (the longest)
2. Students must identify the compromised user through network scanning and alert correlation
3. The external drop server IP (185.220.101.42) must be blocked at the firewall
4. Students learn to monitor internal data flows, not just external attacks
5. Credential reset on the disgruntled user is critical to stop ongoing access

**Instructor Talking Points:**
- Ask: "How is this different from ransomware?" (Answer: The attacker is already inside; you cannot prevent initial access)
- Discuss real insider threat indicators: unusual data transfers, off-hours access, connections to external IPs
- Note: The 185.220.101.42 IP is from a known Tor exit node range — discuss threat intelligence

---

## 5. Classroom Session Plans

### Session Plan A: Introduction to Incident Response (90 minutes)

| Time | Activity | Details |
|------|----------|---------|
| 0-15 min | **Lecture:** What is a SOC? | Explain SOC analyst role, alert triage, incident response lifecycle |
| 15-25 min | **Demo:** Walk through Scenario 1 | Show the UI, explain each panel, demonstrate 3-4 commands |
| 25-30 min | **Setup:** Students launch simulator | Ensure all machines have the simulator running |
| 30-55 min | **Lab Exercise 1:** Scenario 1 - Ransomware | Students play through independently. Circulate and assist |
| 55-65 min | **Debrief:** Discuss strategies | Which students won? What did they do differently? |
| 65-80 min | **Lab Exercise 2:** Scenario 1 replay | Students try again applying lessons from debrief |
| 80-90 min | **Wrap-up:** Score comparison and key takeaways | Compare scores, discuss optimal response strategy |

### Session Plan B: Advanced Threat Response (120 minutes)

| Time | Activity | Details |
|------|----------|---------|
| 0-10 min | **Review:** Recap Scenario 1 strategies | Quick discussion of isolation vs. patching tradeoffs |
| 10-30 min | **Lab:** Scenario 2 - DDoS | Students face high-pressure, fast-paced DDoS attack |
| 30-45 min | **Debrief:** DDoS strategies | Discuss IP blocking, firewall rules, rate limiting |
| 45-65 min | **Lecture:** Insider threats | Discuss insider threat indicators, UEBA concepts |
| 65-90 min | **Lab:** Scenario 3 - Insider Exfiltration | Longest and most complex scenario |
| 90-110 min | **Group Exercise:** Build response playbook | Teams write a step-by-step response playbook for each scenario |
| 110-120 min | **Assessment:** Score review and Q&A | Review all three scores, discuss career paths in cybersecurity |

### Session Plan C: Timed Assessment (60 minutes)

| Time | Activity | Details |
|------|----------|---------|
| 0-5 min | **Instructions:** Assessment rules | Explain grading criteria (see Section 7) |
| 5-15 min | **Assessment 1:** Scenario 1 | Single attempt, score recorded |
| 15-20 min | **Break** | Brief pause |
| 20-25 min | **Assessment 2:** Scenario 2 | Single attempt, score recorded |
| 25-30 min | **Break** | Brief pause |
| 30-38 min | **Assessment 3:** Scenario 3 | Single attempt, score recorded |
| 38-50 min | **Written:** Post-incident report | Students write a 1-page incident report for one scenario |
| 50-60 min | **Review:** Discuss answers and scoring | Reveal optimal strategies, discuss grading |

---

## 6. Simulation Mechanics for Instructors

### Attack Type Reference Table

| Attack Type | Base Probability | Spread Rate | Detection Delay | Key Vulnerability Exploited |
|-------------|-----------------|-------------|-----------------|---------------------------|
| phishing | 0.4 | 0.2 | 5000ms | Social engineering |
| lateral_movement | 0.5 | 0.3 | 3000ms | shared_credentials, file_shares |
| ransomware | 0.6 | 0.4 | 2000ms | unpatched_os, outdated_antivirus |
| ddos | 0.8 | 0.9 | 1000ms | Volume-based |
| mitm | 0.5 | 0.3 | 4000ms | Network positioning |
| credential_stuffing | 0.3 | 0.2 | 3000ms | weak_credentials |
| dns_spoofing | 0.4 | 0.3 | 3500ms | DNS configuration |
| c2_beaconing | 0.2 | 0.1 | 5000ms | Covert channel |
| data_exfiltration | 0.3 | 0.2 | 6000ms | Data access |
| unpatched_exploit | 0.5 | 0.4 | 2500ms | unpatched_os |

### Detection Rules Reference

| Rule | Type | Accuracy | Delay | Severity | Triggered By |
|------|------|----------|-------|----------|-------------|
| Brute Force | Signature | 90% | 500ms | High | Events containing "credential" |
| Malware Signature | Signature | 95% | 800ms | Critical | Events containing "ransomware" or "malware" |
| Traffic Anomaly | Anomaly | 70% | 1500ms | High | Events containing "ddos" |
| Data Exfiltration | Anomaly | 75% | 2000ms | Critical | Events containing "exfiltrat" |
| Lateral Movement | Behavioral | 80% | 2500ms | High | Events containing "lateral" |
| C2 Beaconing | Behavioral | 85% | 3000ms | Critical | Events containing "beacon", "command", or "c2" |

**Important for Instructors:** There is a 15% false negative rate (some real attacks will not generate alerts) and a 10% false positive rate (some alerts will be noise). This mirrors real-world SIEM behavior and teaches students not to rely solely on automated detection.

### Scoring Formula Breakdown

```
totalScore = damagePrevented x 10 + detectionBonus + isolationBonus
```

| Component | Formula | Example |
|-----------|---------|---------|
| Damage Prevented | ((totalDevices - compromisedDevices) / totalDevices) x 100 | 7/9 healthy = 77.8% |
| Damage Points | damagePrevented x 10 | 77.8 x 10 = 778 |
| Detection Bonus | 1000 / (secondsToDetect + 1) | Detected at 3s = 250 points |
| Isolation Bonus | isolatedDevices x 50 | 2 isolated = 100 points |
| **Total** | Sum of all components | 778 + 250 + 100 = **1128** |

**Score Interpretation Guide:**
- **1500+:** Expert response — fast detection, minimal damage, strategic isolation
- **1000-1499:** Proficient response — good containment with minor gaps
- **500-999:** Developing skills — understood the basics but slow or missed key actions
- **Below 500:** Needs practice — significant damage occurred, review fundamentals

---

## 7. Grading and Assessment Framework

### Rubric: Per-Scenario Assessment (100 points each)

| Criteria | Points | Excellent (90-100%) | Proficient (70-89%) | Developing (50-69%) | Beginning (<50%) |
|----------|--------|--------------------|--------------------|--------------------|--------------------|
| **Containment** | 40 | Won scenario, minimal spread | Won but 1-2 extra infections | Lost but demonstrated effort | No containment attempted |
| **Speed** | 20 | First action within 10s | First action within 30s | First action within 60s | Delayed response |
| **Command Usage** | 20 | Used 5+ distinct commands | Used 3-4 commands | Used 1-2 commands | Only used help |
| **Score** | 20 | Top quartile of class | Middle 50% | Bottom quartile | Below threshold |

### Rubric: Written Incident Report (100 points)

| Section | Points | Requirements |
|---------|--------|-------------|
| **Executive Summary** | 15 | 2-3 sentence overview of what happened |
| **Timeline** | 25 | Chronological list of key events with timestamps |
| **Actions Taken** | 25 | List of commands executed and rationale for each |
| **Root Cause Analysis** | 20 | Identify the initial vector and contributing vulnerabilities |
| **Recommendations** | 15 | 2-3 preventive measures for the future |

### Portfolio Assessment (Semester-Long)

Assign students to complete all three scenarios across multiple sessions, improving their scores each time. Track progress using the scoring formula. Students submit:
1. Screenshots of their best score for each scenario
2. A comparative analysis: "What I did differently to improve"
3. A 2-page defense playbook covering all three attack types

---

## 8. Common Student Mistakes and Instructor Interventions

### Mistake 1: Isolating Everything Immediately
**What Happens:** Students isolate all devices, effectively shutting down the entire network.
**Why It's Wrong:** In a real SOC, you cannot take the entire business offline. The score penalizes this because isolated devices count as unavailable.
**Intervention:** Ask: "If you were a SOC analyst and you shut down the entire company network, what would your manager say?"

### Mistake 2: Ignoring Alert Severity
**What Happens:** Students acknowledge alerts without reading them, or treat all alerts equally.
**Why It's Wrong:** Critical alerts (ransomware detection, data exfiltration) require immediate action. Low-severity alerts can wait.
**Intervention:** Point to the color coding: red = critical, orange = high, yellow = medium, blue = low.

### Mistake 3: Not Scanning First
**What Happens:** Students start blocking and isolating without understanding which devices are compromised.
**Why It's Wrong:** Random defense actions waste time. The `scan network` command reveals which devices are already compromised.
**Intervention:** Teach: "The first command in any incident response is always: assess the situation."

### Mistake 4: Forgetting the File Server in Scenario 1
**What Happens:** Students focus on workstations and forget that the File Server has `file_shares` vulnerability, making it a high-value lateral movement target.
**Intervention:** Ask: "Which device stores the most critical data? Is it protected?"

### Mistake 5: Trying to Isolate Bot Nodes in Scenario 2
**What Happens:** Students try to isolate the external bot nodes (198.51.100.x) which are outside their network.
**Why It's Wrong:** You cannot control attacker infrastructure. Defense must happen at your perimeter.
**Intervention:** Explain: "In a real DDoS, you don't have access to the botnets. You can only filter at your firewall."

### Mistake 6: Not Using `disable smb` in Scenario 1
**What Happens:** Students don't realize that disabling SMB on the File Server removes the `file_shares` vulnerability.
**Intervention:** Teach: "SMB file sharing is one of the most common lateral movement vectors in real ransomware attacks. Disabling it is a key response action."

---

## 9. Extending the Simulator

### Creating Custom Scenarios

Instructors familiar with TypeScript can create new scenarios by adding entries to `src/scenarios/index.ts`. Each scenario requires:

1. **Unique ID** (format: `SCN-XXX`)
2. **Device definitions** with positions, IPs, types, and vulnerabilities
3. **Network links** between devices
4. **Win and fail conditions**
5. **Time limit** in seconds
6. **Initial infected devices** (array of device IDs)
7. **Attack chain description**

**Example scenario ideas:**
- **Supply Chain Attack:** Compromised update server infects multiple internal systems
- **IoT Botnet:** Smart devices on a segmented network attempt to breach the corporate LAN
- **APT Campaign:** Slow, stealthy attack with c2_beaconing (0.2 base probability) that tests patience and detection skills
- **Cloud Misconfiguration:** Exposed database server with weak credentials accessible from the internet

### Adding New Attack Types

New attack types can be added to the `attackConfigs` object in `src/engines/attack/propagation.ts`. Define:
- `baseProbability`: How likely infection succeeds (0.0-1.0)
- `spreadRate`: How fast the attack progresses (affects the progress bar)
- `detectionDelay`: How long before detection systems notice (milliseconds)

### Adding New Defense Actions

New defense actions are added in `src/engines/defense/index.ts` as cases in the `executeAction` switch statement. Each action should:
- Validate the target device exists
- Modify device state (status, vulnerabilities, blocked IPs, firewall)
- Return a `DefenseResult` with success status, affected devices, and events

---

## 10. Troubleshooting and FAQ

### Technical Issues

**Q: The canvas is blank or shows "Loading..."**
A: The Konva.js canvas requires a WebGL-capable browser. Disable hardware acceleration workarounds in Chrome: `chrome://flags/#disable-accelerated-2d-canvas` should be set to Default.

**Q: The terminal does not accept input**
A: Click directly on the terminal area to focus it. The xterm.js terminal requires DOM focus to accept keyboard input.

**Q: `npm install` fails with permission errors**
A: On Windows, run the terminal as Administrator. On Mac/Linux, avoid using `sudo npm install` — instead, fix npm permissions: `npm config set prefix ~/.npm-global`.

**Q: The simulation runs slowly on older machines**
A: The 200ms tick rate is lightweight, but the Konva.js canvas can be CPU-intensive with many visual updates. Close other browser tabs and applications.

### Pedagogical Questions

**Q: Can students cheat by reading the source code?**
A: The source code is client-side JavaScript and is accessible via browser DevTools. However, understanding the attack propagation formula by reading code is itself a valuable learning exercise. For formal assessments, use timed sessions where code inspection would consume too much time.

**Q: Should I let students retry scenarios?**
A: Yes, for practice sessions. The seeded RNG means identical scenarios on retry, which helps students develop and test specific strategies. For assessments, allow one attempt per scenario.

**Q: What if a student finishes all three scenarios quickly?**
A: Challenge them to achieve higher scores, write incident reports, or help peers. Advanced students can attempt to create a new scenario definition (see Section 9).

**Q: How does this compare to platforms like CyberRange or Hack The Box?**
A: This simulator focuses on defensive SOC operations and incident response, not offensive penetration testing. It complements platforms like Hack The Box by teaching the "blue team" perspective. The key advantage is zero infrastructure requirements — no VMs, no network isolation, no cloud costs.

---

## Appendix A: Quick Command Reference Card

Print and distribute to students:

```
┌─────────────────────────────────────────────────────────┐
│           CYBER SIMULATOR - COMMAND REFERENCE            │
├─────────────────────────────────────────────────────────┤
│  INVESTIGATION                                           │
│    help                    Show all commands              │
│    show devices            List all network devices       │
│    show alerts             View active security alerts    │
│    show logs               Display event logs             │
│    show status             Current simulation status      │
│    show stats              Detailed statistics            │
│    show topology           Network topology info          │
│    scan network [device]   Scan for compromised devices   │
│                                                           │
│  DEFENSE ACTIONS                                          │
│    isolate <device>        Disconnect device from network │
│    block ip <ip> [on dev]  Block IP at firewall           │
│    enable firewall [on d]  Enable device firewall         │
│    patch <device>          Remove all vulnerabilities     │
│    reset credentials <dev> Reset device credentials       │
│    disable smb [on dev]    Disable SMB file sharing       │
│                                                           │
│  SYSTEM                                                   │
│    mode <user|admin|config> Change CLI mode               │
│    clear                    Clear terminal screen         │
├─────────────────────────────────────────────────────────┤
│  VISUAL INDICATORS                                        │
│    Green  = Active/Healthy    Orange = Under Attack       │
│    Red    = Compromised       Gray   = Isolated           │
│    Yellow dot = Has Vulnerabilities                        │
│    Blue ring = Selected device                            │
└─────────────────────────────────────────────────────────┘
```

## Appendix B: Scenario Quick Reference

| Scenario | Attack | Time | Win | Fail | Key Defense |
|----------|--------|------|-----|------|-------------|
| 1. Ransomware | Lateral movement from HR host | 10 min | Keep infected devices to 2 or fewer | 60%+ devices infected | isolate, patch, disable smb |
| 2. DDoS | 5 external bots flood web server | 5 min | Reduce traffic below threshold | Server down >120s | block ip (all 5 bots), enable firewall |
| 3. Insider | Disgruntled user exfiltrates data | ~8 min | Stop before 100MB leaked | Data leak >500MB | reset credentials, block external IP, isolate user |

---

*This guide is maintained alongside the Cyber Attack & Defense Simulator. For technical updates, refer to the README.md and VERIFICATION_REPORT.md in the project root.*
