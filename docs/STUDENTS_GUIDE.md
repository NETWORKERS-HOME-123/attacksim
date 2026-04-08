# Cyber Attack & Defense Simulator - Student Guide

## Your Complete Handbook to Becoming a SOC Analyst

**Version:** 1.0  
**Platform:** Cyber Attack & Defense Simulator  
**Audience:** Students, aspiring cybersecurity professionals, and self-learners  
**Estimated Reading Time:** 20 minutes

---

## Table of Contents

1. [Welcome: Your Role as a SOC Analyst](#1-welcome-your-role-as-a-soc-analyst)
2. [Getting Started](#2-getting-started)
3. [Understanding the Interface](#3-understanding-the-interface)
4. [Command Reference with Examples](#4-command-reference-with-examples)
5. [Scenario 1 Walkthrough: Ransomware Outbreak](#5-scenario-1-walkthrough-ransomware-outbreak)
6. [Scenario 2 Walkthrough: DDoS Attack](#6-scenario-2-walkthrough-ddos-attack)
7. [Scenario 3 Walkthrough: Insider Threat](#7-scenario-3-walkthrough-insider-threat)
8. [Understanding How Attacks Spread](#8-understanding-how-attacks-spread)
9. [Defense Strategy Playbook](#9-defense-strategy-playbook)
10. [Scoring and How to Improve](#10-scoring-and-how-to-improve)
11. [Writing an Incident Report](#11-writing-an-incident-report)
12. [Cybersecurity Career Connections](#12-cybersecurity-career-connections)
13. [Practice Exercises](#13-practice-exercises)
14. [Glossary of Terms](#14-glossary-of-terms)

---

## 1. Welcome: Your Role as a SOC Analyst

Congratulations — you have just been hired as a Security Operations Center (SOC) analyst. Your job is to monitor a corporate network, detect cyberattacks in real time, and respond before the damage becomes catastrophic. You will face ransomware outbreaks, distributed denial-of-service (DDoS) floods, and insider threats. Your tools are a network map, a security alert dashboard, and a command-line terminal.

In real cybersecurity operations, SOC analysts sit in front of multiple screens watching for threats 24 hours a day, 7 days a week. They use tools called SIEMs (Security Information and Event Management systems) to correlate events from firewalls, intrusion detection systems, endpoint protection, and network monitors. This simulator recreates that experience in your browser.

**What makes a great SOC analyst?**
- **Speed:** Attacks spread fast. Every second you delay, another device could be compromised.
- **Prioritization:** Not all devices are equal. A file server with company data is more important than a workstation.
- **Judgment:** Isolation stops an attack completely, but it also takes a device offline. Sometimes a softer response (patching, firewall rules) is better.
- **Awareness:** Read your alerts carefully. They tell you what is happening and where.

This guide will walk you through everything you need to know, from launching the simulator to achieving expert-level scores.

---

## 2. Getting Started

### Launching the Simulator

**Step 1:** Open your terminal (Command Prompt, PowerShell, or Mac Terminal).

**Step 2:** Navigate to the simulator folder:
```bash
cd "path/to/cyber-simulator"
```

**Step 3:** If this is your first time, install dependencies:
```bash
npm install
```

**Step 4:** Start the simulator:
```bash
npm run dev
```

**Step 5:** Open your browser and go to `http://localhost:3000`.

You will see the simulator dashboard with five main panels: a network map on the left, a terminal at the bottom, an alert panel on the right, a control panel at the top, and a statistics dashboard.

### Starting Your First Simulation

1. Look at the **Control Panel** at the top. You will see the scenario name, description, and objectives.
2. Click the **Start** button. The timer begins counting down immediately.
3. Attacks will begin spreading across the network. You will see devices change color on the network map.
4. Your job begins now — read the alerts, investigate with commands, and take defensive action.

**Do not panic.** You have time. Read this guide before your first attempt, and you will know exactly what to do.

---

## 3. Understanding the Interface

### Panel 1: Network Canvas (Left Side)

This is your network map. It shows every device on the network as a colored circle with a label.

**Device Colors — memorize these:**

| Color | Meaning | What to Do |
|-------|---------|-----------|
| **Green** | Healthy and active | No action needed — but stay alert |
| **Orange** | Under active attack | Investigate immediately — this device may be compromised soon |
| **Red** | Compromised | The attacker controls this device. Consider isolation or patching |
| **Gray** | Isolated | You disconnected this device. It is safe but offline |

**Other visual indicators:**
- **Yellow dot** on a device means it has known vulnerabilities. These are weak points the attacker will exploit.
- **Blue ring** around a device means you have selected it (clicked on it).
- **Lines** between devices represent network connections. Attacks can only spread along these lines.

**Navigation:**
- **Scroll** to zoom in/out
- **Click and drag** on empty space to pan the view
- **Click a device** to select it and see its details

### Panel 2: Terminal (Bottom)

This is your primary tool. It works like a real security terminal where you type commands to investigate and respond to threats. The terminal uses a green-on-black cybersecurity theme.

The prompt shows your current mode:
```
[user@simulator]$ _          ← User mode (basic commands)
[admin@simulator]$ _         ← Admin mode (all commands)
[config@simulator]$ _        ← Config mode (system changes)
```

Type commands and press Enter. Results appear directly in the terminal.

### Panel 3: Alert Panel (Right Side)

Security alerts appear here as the simulation runs. Each alert has:

- **Severity icon and color:** Critical (red), High (orange), Medium (yellow), Low (blue)
- **Description:** What was detected and where
- **Confidence score:** How sure the detection system is (0-100%)
- **Detection type:** Signature-based, anomaly-based, or behavioral
- **Acknowledge button:** Click to mark an alert as reviewed

**Important:** Alerts do not appear instantly. Real detection systems have processing delays. Signature-based detections (like malware signatures) are fast (500-800ms). Behavioral detections (like lateral movement patterns) take longer (2500-3000ms). This means an attack could spread before you even see the alert.

### Panel 4: Control Panel (Top)

Shows the scenario information and game controls:
- **Scenario name and description**
- **Start / Pause / Resume / Stop buttons**
- **Timer** showing remaining time (turns red when under 60 seconds)
- **Current score** updating in real time
- **Compromised device count** (turns red when increasing)
- **Isolated device count**
- **Objectives list** — what you need to accomplish to win

### Panel 5: Dashboard Stats

Live statistics about the simulation:
- **Elapsed and remaining time**
- **Total score** with component breakdown
- **Infection progress bar** — shows what percentage of devices are compromised
- **Device status grid** — counts by status (active, under attack, compromised, isolated)
- **Alert summary** — counts by severity level

---

## 4. Command Reference with Examples

### Investigation Commands

These commands help you understand what is happening on the network. Always investigate before taking action.

**`help`** — Shows all available commands
```
[admin@simulator]$ help
```
Use this when you forget a command syntax. You can also type `?` as a shortcut.

**`show devices`** — Lists all devices on the network
```
[admin@simulator]$ show devices
```
Shows each device's name, IP address, type, status, and vulnerabilities. This is your first command in every scenario — know your network.

**`show alerts`** — Displays all active security alerts
```
[admin@simulator]$ show alerts
```
Shows unacknowledged alerts sorted by severity. Read these carefully — they tell you where attacks are happening.

**`show logs`** — Shows the event log
```
[admin@simulator]$ show logs
```
A chronological record of everything that has happened. Useful for building a timeline during incident investigation.

**`show status`** — Quick simulation overview
```
[admin@simulator]$ show status
```
Shows running state, time elapsed, device counts by status.

**`show stats`** — Detailed statistics
```
[admin@simulator]$ show stats
```
Numerical breakdown of all metrics including score components.

**`show topology`** — Network connection information
```
[admin@simulator]$ show topology
```
Shows which devices are connected to which. Critical for understanding attack paths.

**`scan network`** — Actively scan for compromised devices
```
[admin@simulator]$ scan network
[admin@simulator]$ scan network host-1
```
This is your most important investigation tool. It reveals which devices are compromised or under attack. Without scanning, you are relying solely on automated alerts, which have a 15% miss rate. Running `scan network` gives you ground truth.

You can scan a specific device by name or ID, or scan the entire network by omitting the device name.

### Defense Commands

These commands take action to stop or slow attacks. Each has tradeoffs — learn when to use which.

**`isolate <device>`** — Disconnect a device from the network
```
[admin@simulator]$ isolate host-1
```
**Effect:** The device turns gray and is completely disconnected. No attacks can spread to or from it. This is the strongest defense action — it has a 100% effectiveness against infection spread.

**Tradeoff:** The device is now offline. If you isolate a server, its services are unavailable. If you isolate too many devices, you effectively shut down the network.

**When to use:** When a device is already compromised and actively spreading infection to others. Isolate the source to stop the bleeding.

**`block ip <address> [on <device>]`** — Block an IP address at a firewall
```
[admin@simulator]$ block ip 198.51.100.1
[admin@simulator]$ block ip 198.51.100.1 on firewall-1
```
**Effect:** Adds the IP to the device's blocked list. Each blocked IP reduces the attacker's success probability by 5% (up to 30% maximum for 6+ IPs).

**Tradeoff:** Only partially effective. Multiple blocked IPs are needed for significant impact.

**When to use:** Against DDoS attacks where you know the attacker IPs. Block all bot IPs at the perimeter firewall.

**`enable firewall [on <device>]`** — Enable the firewall on a device
```
[admin@simulator]$ enable firewall
[admin@simulator]$ enable firewall on host-2
```
**Effect:** Reduces infection probability by 30%. Stacks with other defenses.

**Tradeoff:** Does not stop attacks completely — just makes them harder to succeed.

**When to use:** As a first-line defense on critical devices. Enable the firewall on your most important assets immediately.

**`patch <device>`** — Patch a device to remove all vulnerabilities
```
[admin@simulator]$ patch host-2
```
**Effect:** Removes all vulnerabilities from the device. If the device was compromised, patching restores it to active status. Also adds a 20% defense bonus.

**Tradeoff:** None for the device itself, but takes time you could spend on other actions.

**When to use:** On devices with known vulnerabilities (shown by the yellow dot on the network map). Prioritize devices that are connected to compromised devices.

**`reset credentials <device>`** — Reset login credentials on a device
```
[admin@simulator]$ reset credentials host-1
```
**Effect:** Removes `weak_credentials` and `shared_credentials` vulnerabilities specifically. Leaves other vulnerabilities intact.

**When to use:** When a device has credential-based vulnerabilities and the attack involves credential theft or lateral movement.

**`disable smb [on <device>]`** — Disable SMB file sharing
```
[admin@simulator]$ disable smb on server-1
```
**Effect:** Removes the `file_shares` vulnerability. This blocks a common lateral movement vector used by ransomware.

**When to use:** Scenario 1 (Ransomware) — the File Server has `file_shares` vulnerability. Disabling SMB stops ransomware from spreading via shared folders.

### System Commands

**`mode <user|admin|config>`** — Change the terminal mode
```
[admin@simulator]$ mode config
```
Changes the CLI prompt to reflect your privilege level. In a real network, different modes grant different permissions.

**`clear`** — Clear the terminal screen
```
[admin@simulator]$ clear
```
Clears all previous output. Useful when the terminal gets cluttered with alerts and log entries.

---

## 5. Scenario 1 Walkthrough: Ransomware Outbreak

### The Situation

You work at a small company. An employee in HR clicked a phishing link, and ransomware has infected their workstation. The ransomware will attempt to spread to other workstations and the file server through the corporate network. You have 10 minutes to contain it.

### Your Network

| Device | IP | Role | Vulnerabilities |
|--------|-----|------|----------------|
| Main Router | 192.168.1.1 | Network gateway | None |
| Edge Firewall | 192.168.1.2 | Perimeter defense | None |
| Core Switch | 192.168.1.3 | Connects all devices | None |
| **Workstation-01 (HR)** | **192.168.1.101** | **INFECTED** | **unpatched_os, weak_credentials** |
| Workstation-02 (Finance) | 192.168.1.102 | Financial data | shared_credentials |
| Workstation-03 (IT) | 192.168.1.103 | IT admin | None |
| Workstation-04 (Sales) | 192.168.1.104 | Sales team | outdated_antivirus |
| Workstation-05 (Manager) | 192.168.1.105 | Management | None |
| File Server | 192.168.1.200 | Critical data | file_shares |

### Win Condition: Keep infection to 2 or fewer devices
### Fail Condition: 60% or more devices infected (6 out of 9)
### Time Limit: 10 minutes

### Step-by-Step Strategy

**Seconds 0-15: Assess the situation**
```
scan network
show devices
```
Identify which device is compromised (Workstation-01/HR) and which devices have vulnerabilities.

**Seconds 15-30: Protect the most critical asset**
```
disable smb on server-1
enable firewall on server-1
```
The File Server is the highest-value target. It has `file_shares` — the exact vulnerability ransomware exploits for lateral movement. Disable SMB immediately and enable its firewall.

**Seconds 30-45: Contain the infection source**
```
isolate host-1
```
HR's workstation is already compromised. Isolating it stops the ransomware from spreading to other devices through the network.

**Seconds 45-60: Patch vulnerable devices**
```
patch host-2
patch host-4
```
Finance has `shared_credentials` and Sales has `outdated_antivirus`. Patching removes these vulnerabilities and adds a 20% defense bonus.

**Seconds 60-90: Reset credentials**
```
reset credentials host-2
```
Finance has `shared_credentials` specifically. Resetting credentials eliminates this attack vector.

**Remaining time: Monitor and respond**
```
show alerts
scan network
```
Continue scanning for new infections. If another device becomes compromised, isolate it immediately. Check alerts for any new attack activity.

### Why This Strategy Works

1. **Protecting the File Server first** prevents the worst outcome — ransomware encrypting shared company files
2. **Isolating the source** stops propagation at the root
3. **Patching vulnerable devices** removes the attacker's easiest targets
4. **Credential resets** close the credential theft vector specifically
5. **Continuous monitoring** catches any infections that slipped through

---

## 6. Scenario 2 Walkthrough: DDoS Attack

### The Situation

Your company's public web server is under a Distributed Denial-of-Service attack from a botnet. Five bot nodes are flooding the server with traffic. If the server goes down for more than 120 seconds, the business loses critical revenue. You have only 5 minutes.

### Your Network

| Device | IP | Role | Status |
|--------|-----|------|--------|
| Border Router | 203.0.113.1 | Internet gateway | Active |
| Perimeter Firewall | 203.0.113.2 | Traffic filter | Active |
| DMZ Switch | 10.0.1.3 | DMZ segment | Active |
| **Web Server** | **10.0.1.10** | **Your asset to protect** | **Target** |
| Bot-1 | 198.51.100.1 | Attacker | Compromised |
| Bot-2 | 198.51.100.2 | Attacker | Compromised |
| Bot-3 | 198.51.100.3 | Attacker | Compromised |
| Bot-4 | 198.51.100.4 | Attacker | Compromised |
| Bot-5 | 198.51.100.5 | Attacker | Compromised |

### Win Condition: Reduce traffic load below threshold
### Fail Condition: Server downtime exceeds 120 seconds
### Time Limit: 5 minutes

### Step-by-Step Strategy

**This scenario is fast and intense.** DDoS attacks have the highest base probability (0.8) and spread rate (0.9) of any attack type. You must act within seconds.

**Seconds 0-10: Enable firewall protection**
```
enable firewall on firewall-1
enable firewall on web-server
```
Immediately add firewall defense to both the perimeter and the target server. Each firewall adds 30% defense.

**Seconds 10-40: Block all bot IPs**
```
block ip 198.51.100.1 on firewall-1
block ip 198.51.100.2 on firewall-1
block ip 198.51.100.3 on firewall-1
block ip 198.51.100.4 on firewall-1
block ip 198.51.100.5 on firewall-1
```
Each blocked IP adds 5% defense. Five blocked IPs = 25% additional defense factor. Combined with the firewall's 30%, you now have 55% defense.

**Seconds 40-60: Block at the router too**
```
block ip 198.51.100.1 on router-1
block ip 198.51.100.2 on router-1
block ip 198.51.100.3 on router-1
block ip 198.51.100.4 on router-1
block ip 198.51.100.5 on router-1
```
Defense in depth — block at multiple points in the network.

**Remaining time: Monitor server health**
```
show status
show alerts
scan network
```
Watch the web server status. If it remains active (green), you are winning. If it turns orange or red, additional action may be needed.

### Key Lessons from This Scenario

1. **You cannot isolate the web server** — that takes it offline, which is exactly what the attacker wants
2. **You cannot isolate the bots** — they are external, outside your network
3. **IP blocking is your primary tool** — this is how real DDoS mitigation works
4. **Speed matters more than in any other scenario** — 5 minutes is very short
5. **Defense in depth** — blocking at both firewall and router creates layered protection

---

## 7. Scenario 3 Walkthrough: Insider Threat

### The Situation

A disgruntled employee (User-3) is exfiltrating company data to an external server. They have legitimate access to internal systems, making them hard to detect. You must stop the data leak before it reaches 100MB. If 500MB leaks, you have failed completely.

### Your Network

| Device | IP | Role | Notes |
|--------|-----|------|-------|
| Gateway | 192.168.1.1 | Firewall | Perimeter control |
| Core Switch | 192.168.1.2 | Internal routing | |
| Database Server | 192.168.1.10 | Critical data | High-value target |
| File Server | 192.168.1.11 | Shared files | High-value target |
| User-1 (Sales) | 192.168.1.101 | Normal user | |
| User-2 (HR) | 192.168.1.102 | Normal user | |
| **User-3 (Disgruntled)** | **192.168.1.103** | **INSIDER THREAT** | **Already compromised** |
| User-4 (IT) | 192.168.1.104 | Normal user | |
| External Server | 185.220.101.42 | Drop point | Attacker-controlled |

### Win Condition: Stop data transfer before 100MB leaked
### Fail Condition: Data leak exceeds 500MB
### Time Limit: ~8 minutes

### Step-by-Step Strategy

**Seconds 0-15: Identify the threat**
```
scan network
show alerts
```
Data exfiltration has the longest detection delay (6000ms = 6 seconds). You may not see an alert right away. The scan command gives you immediate visibility.

**Seconds 15-30: Block the external drop point**
```
block ip 185.220.101.42 on firewall-1
```
This is critical. The attacker is sending data to 185.220.101.42. Blocking this IP at the firewall disrupts the exfiltration channel.

**Seconds 30-45: Revoke the insider's access**
```
reset credentials user-3
isolate user-3
```
First reset their credentials (stops authenticated access to servers), then isolate their workstation entirely.

**Seconds 45-60: Protect the data sources**
```
enable firewall on db-server
enable firewall on file-server
```
Even after containing the insider, protect the servers in case of secondary compromise.

**Seconds 60-90: Verify containment**
```
scan network
show devices
show alerts
```
Confirm that User-3 is isolated, the external IP is blocked, and no other users have been compromised.

**Remaining time: Monitor for escalation**
The insider may have planted backdoors or compromised other user accounts. Continue scanning and monitoring alerts.

### Key Lessons from This Scenario

1. **Insider threats have legitimate access** — you cannot prevent the initial compromise because it is already done
2. **Detection is slow** — data exfiltration has a 6-second detection delay, the longest in the simulator
3. **Block the destination, not just the source** — blocking the external IP disrupts the exfiltration channel
4. **Credential reset before isolation** — remove access to sensitive systems before disconnecting the user
5. **This is the hardest scenario** because the attacker is already inside and has a head start

---

## 8. Understanding How Attacks Spread

Every 2 seconds (10 ticks at 200ms each), each compromised device rolls a probability check to spread infection to its connected neighbors. Understanding this formula helps you make smarter defense decisions.

### The Infection Probability Formula

```
Probability = Base x Network x (1 - Defense) x Time + Vulnerabilities
```

**Base Probability** — depends on the attack type:
- DDoS: 80% (very aggressive)
- Ransomware: 60% (aggressive)
- Lateral Movement: 50% (moderate)
- Phishing: 40% (targeted)
- C2 Beaconing: 20% (stealthy)

**Network Factor** — how connected the target is:
- More connections = higher probability (the attacker has more paths)
- Formula: connected devices / total devices

**Defense Factor** — your defensive actions reduce the probability:
- Firewall enabled: -30%
- Device isolated: -100% (complete block)
- Each blocked IP: -5% (max -30% for 6+ IPs)
- Fully patched: -20%

**Time Decay** — attacks slow down over time:
- Starts at 100%, decays to minimum 30%
- Represents real-world pattern: initial burst, then attacker adjusts

**Vulnerability Bonus** — matching vulnerabilities increase probability:
- `unpatched_os` + ransomware: +15%
- `shared_credentials` + lateral movement: +20%
- `file_shares` + lateral movement: +20%
- `weak_credentials` + credential stuffing: +15%

### Practical Example

Ransomware tries to spread from HR workstation to Finance workstation:
- Base: 0.6 (ransomware)
- Network: 0.5 (4 connections out of 8 other devices)
- Defense: 0.0 (no firewall, not isolated, no blocked IPs, not patched)
- Time Decay: 1.0 (early in simulation)
- Vulnerability: +0.1 (Finance has `shared_credentials`)

**Probability = 0.6 x 0.5 x (1 - 0.0) x 1.0 + 0.1 = 0.4 (40%)**

Now, if you enable the firewall on Finance:
- Defense: 0.3 (firewall)

**Probability = 0.6 x 0.5 x (1 - 0.3) x 1.0 + 0.1 = 0.31 (31%)**

And if you also patch Finance:
- Defense: 0.3 + 0.2 = 0.5 (firewall + patched)
- Vulnerability: 0 (patching removed `shared_credentials`)

**Probability = 0.6 x 0.5 x (1 - 0.5) x 1.0 + 0 = 0.15 (15%)**

You reduced the infection probability from 40% to 15% with two commands. This is why layered defense works.

---

## 9. Defense Strategy Playbook

### The Universal Incident Response Sequence

Regardless of scenario, follow this pattern:

1. **SCAN** — Know your network. `scan network` gives you ground truth.
2. **IDENTIFY** — Which devices are compromised? Which have vulnerabilities? Which are critical?
3. **CONTAIN** — Stop the bleeding. Isolate compromised devices spreading infection.
4. **PROTECT** — Enable firewalls, patch vulnerabilities, block malicious IPs on high-value assets.
5. **MONITOR** — Keep scanning and reading alerts. New threats can emerge.

### Defense Priority Matrix

| Situation | Best Action | Why |
|-----------|-------------|-----|
| Device is compromised and spreading | `isolate` | 100% effective at stopping spread |
| Critical server has vulnerabilities | `patch` then `enable firewall` | Removes attack surface and adds defense |
| Known attacker IP | `block ip` on firewall | Reduces probability per blocked IP |
| Credential-based attack | `reset credentials` | Removes specific credential vulnerabilities |
| File-share based spreading | `disable smb` | Removes file_shares vulnerability |
| Not sure what's happening | `scan network` then `show alerts` | Get situational awareness |

### What NOT to Do

- **Do not isolate everything.** You need the network to function. Isolate only compromised devices.
- **Do not ignore alerts.** Alerts with "critical" severity indicate active, dangerous attacks.
- **Do not wait for alerts before acting.** Alerts have delays (500ms to 6000ms). Scan proactively.
- **Do not forget infrastructure devices.** Enable firewalls on routers and switches, not just hosts.
- **Do not type slowly.** Every second counts. Practice your command syntax so you can type accurately under pressure.

---

## 10. Scoring and How to Improve

### How Your Score is Calculated

Your total score has three components:

**1. Damage Prevented (worth the most points)**
```
Damage % = ((total devices - compromised devices) / total devices) x 100
Points = Damage % x 10
```
If 2 out of 9 devices are compromised: (7/9) x 100 = 77.8% → 778 points

**2. Detection Speed Bonus (rewards fast response)**
```
Points = 1000 / (seconds until first alert acknowledged + 1)
```
- Acknowledged at 1 second: 500 points
- Acknowledged at 5 seconds: 167 points
- Acknowledged at 30 seconds: 32 points

This bonus rewards you for paying attention to alerts and acknowledging them quickly.

**3. Isolation Bonus (rewards strategic containment)**
```
Points = isolated devices x 50
```
Each device you isolate earns 50 bonus points. But remember: over-isolating reduces your damage prevented score because isolated devices are offline.

### Score Targets

| Score | Rating | What It Means |
|-------|--------|--------------|
| 1500+ | Expert | Fast detection, minimal damage, strategic response |
| 1000-1499 | Proficient | Good containment with minor gaps |
| 500-999 | Developing | Right ideas but too slow or missed key actions |
| Below 500 | Beginner | Significant damage — review the strategy playbook |

### Five Tips to Improve Your Score

1. **Start with `scan network` immediately** — do not wait for alerts. The scan is faster than detection.
2. **Isolate the source device within 15 seconds** — stopping the initial infection source is the highest-impact action.
3. **Protect high-value assets preemptively** — enable firewalls on servers before they are attacked, not after.
4. **Acknowledge alerts as they appear** — the detection speed bonus rewards fast acknowledgment.
5. **Layer your defenses** — firewall (30%) + patch (20%) + blocked IPs (5% each) stack together for powerful protection.

---

## 11. Writing an Incident Report

After each scenario, real SOC analysts write incident reports. Your instructor may ask you to write one. Here is the format:

### Incident Report Template

**Incident ID:** [Scenario number]  
**Date:** [Today's date]  
**Analyst:** [Your name]  
**Severity:** [Critical / High / Medium / Low]

**1. Executive Summary (2-3 sentences)**
Briefly describe what happened, what you did, and the outcome.

*Example: "A ransomware infection was detected on the HR workstation (192.168.1.101) at the start of the simulation. The infection was contained by isolating the source device and patching vulnerable workstations. The attack was limited to 2 devices out of 9, meeting the containment objective."*

**2. Timeline of Events**

| Time | Event | Source |
|------|-------|--------|
| 0:00 | Simulation started, ransomware detected on host-1 | Scan |
| 0:12 | File server protected (SMB disabled, firewall enabled) | Defense action |
| 0:18 | Source device (host-1) isolated | Defense action |
| 0:35 | Finance workstation patched, credentials reset | Defense action |
| ... | ... | ... |

**3. Actions Taken and Rationale**
List each command you executed and explain why.

**4. Root Cause Analysis**
What caused the initial compromise? What vulnerabilities were exploited? How could it have been prevented?

**5. Recommendations**
What should the organization do to prevent this in the future?

*Example recommendations:*
- *Implement mandatory security awareness training to prevent phishing (initial vector)*
- *Deploy automated patch management to eliminate `unpatched_os` vulnerabilities*
- *Enforce unique, complex passwords to prevent `shared_credentials` exploitation*
- *Segment critical servers (File Server, Database) into a separate VLAN*

---

## 12. Cybersecurity Career Connections

The skills you practice in this simulator directly map to real cybersecurity job roles:

### SOC Analyst (Tier 1)
**What they do:** Monitor security alerts, triage incidents, escalate threats.
**Simulator parallel:** Reading the alert panel, acknowledging alerts, running `show alerts` and `scan network`.
**Certifications:** CompTIA Security+, CySA+, Splunk Core Certified User.

### Incident Responder (Tier 2)
**What they do:** Investigate confirmed incidents, contain threats, coordinate response.
**Simulator parallel:** Using `isolate`, `block ip`, `patch`, and `reset credentials` to contain active threats.
**Certifications:** GCIH (GIAC Certified Incident Handler), CompTIA CySA+.

### Security Engineer
**What they do:** Design and implement security controls, configure firewalls, harden systems.
**Simulator parallel:** Using `enable firewall`, `disable smb`, understanding how defense factors reduce attack probability.
**Certifications:** CCNA CyberOps, CISSP, CompTIA CASP+.

### Threat Analyst
**What they do:** Analyze attack patterns, track threat actors, produce intelligence reports.
**Simulator parallel:** Understanding attack types, propagation mechanics, vulnerability exploitation chains.
**Certifications:** GCIA, GCTI, CompTIA CySA+.

### Forensic Analyst
**What they do:** Investigate after an incident, determine root cause, collect evidence.
**Simulator parallel:** Writing incident reports, analyzing timelines, using `show logs` for event reconstruction.
**Certifications:** GCFE, EnCE, CompTIA CySA+.

---

## 13. Practice Exercises

### Exercise 1: Speed Run (Beginner)
Play Scenario 1 three times. Record your score each time. Your goal: improve by at least 200 points between your first and third attempt. Write down what you changed in your strategy.

### Exercise 2: No Isolation Challenge (Intermediate)
Complete Scenario 1 without using the `isolate` command. You must rely on firewalls, patching, credential resets, and SMB disabling only. This teaches you that isolation is not the only tool in your toolkit.

### Exercise 3: DDoS Under Pressure (Intermediate)
Complete Scenario 2 with a self-imposed 3-minute timer (instead of 5). Can you block all 5 bot IPs and enable firewalls in under 3 minutes?

### Exercise 4: Blind Response (Advanced)
Start Scenario 3 but do not look at this guide. Respond using only the information from `scan network`, `show alerts`, and `show devices`. After the simulation ends, compare your actions to the walkthrough in Section 7.

### Exercise 5: Incident Report Portfolio (Advanced)
Complete all three scenarios and write a full incident report for each using the template in Section 11. Submit the three reports as a portfolio. This demonstrates investigation, response, and communication skills — all required for real SOC analyst positions.

### Exercise 6: Create Your Own Playbook (Expert)
Based on your experience with all three scenarios, write a one-page "Universal Incident Response Playbook" that a new SOC analyst could follow for any attack type. Include: first 30-second checklist, decision tree for choosing defense actions, and post-incident steps.

---

## 14. Glossary of Terms

| Term | Definition |
|------|-----------|
| **APT** | Advanced Persistent Threat — a prolonged, stealthy attack by a sophisticated actor |
| **Botnet** | A network of compromised computers controlled by an attacker (used in DDoS) |
| **C2 / C&C** | Command and Control — the attacker's communication channel to compromised devices |
| **Containment** | Actions taken to prevent an incident from spreading further |
| **Credential Stuffing** | Using stolen username/password combinations to gain unauthorized access |
| **DDoS** | Distributed Denial of Service — overwhelming a target with traffic from multiple sources |
| **Defense in Depth** | Layering multiple security controls so that if one fails, others still protect |
| **DMZ** | Demilitarized Zone — a network segment between the internet and internal network |
| **Exfiltration** | Unauthorized transfer of data out of an organization |
| **False Negative** | A real attack that the detection system fails to alert on |
| **False Positive** | An alert triggered when no actual attack is occurring |
| **Firewall** | A network security device that monitors and filters traffic based on rules |
| **IDS/IPS** | Intrusion Detection/Prevention System — monitors network for suspicious activity |
| **Incident Response** | The process of detecting, analyzing, containing, and recovering from security incidents |
| **Isolation** | Disconnecting a device from the network to prevent attack spread |
| **Lateral Movement** | An attacker moving from one compromised device to another within a network |
| **Mitigation** | Actions taken to reduce the impact or severity of an attack |
| **Patch** | A software update that fixes vulnerabilities |
| **Phishing** | A social engineering attack using fraudulent emails to trick users |
| **Ransomware** | Malware that encrypts files and demands payment for decryption |
| **SIEM** | Security Information and Event Management — centralized alert and log management |
| **SMB** | Server Message Block — a file sharing protocol often exploited by ransomware |
| **SOC** | Security Operations Center — the team that monitors and responds to security threats |
| **Triage** | The process of prioritizing incidents by severity and impact |
| **Vulnerability** | A weakness in a system that can be exploited by an attacker |
| **ZTNA** | Zero Trust Network Access — security model that verifies every access request |

---

## Quick Start Cheat Sheet

```
┌─────────────────────────────────────────────────────────┐
│              INCIDENT RESPONSE CHEAT SHEET               │
├─────────────────────────────────────────────────────────┤
│                                                           │
│  FIRST 30 SECONDS:                                        │
│  1. scan network              → Find compromised devices  │
│  2. show devices              → Check vulnerabilities     │
│  3. isolate <infected_host>   → Stop the source           │
│  4. enable firewall on <critical_server>                  │
│                                                           │
│  NEXT 60 SECONDS:                                         │
│  5. patch <vulnerable_devices>                            │
│  6. reset credentials <if credential attack>              │
│  7. disable smb <if ransomware>                           │
│  8. block ip <if known attacker IPs>                      │
│                                                           │
│  ONGOING:                                                 │
│  9. show alerts               → Monitor for new threats   │
│  10. scan network             → Verify containment        │
│                                                           │
│  REMEMBER:                                                │
│  • Green=Safe  Orange=Danger  Red=Compromised  Gray=Off   │
│  • Isolate stops 100% but loses the device                │
│  • Firewall reduces 30%, Patch reduces 20%                │
│  • Block IP reduces 5% each (max 30%)                     │
│  • Scan early and often — alerts have delays              │
│                                                           │
└─────────────────────────────────────────────────────────┘
```

---

*Good luck, analyst. Your network is counting on you.*
