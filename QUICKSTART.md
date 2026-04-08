# Quick Start Guide

## Running the Simulator

### 1. Install Dependencies

```bash
npm install
```

### 2. Run Development Server

```bash
npm run dev
```

### 3. Open in Browser

Navigate to `http://localhost:3000`

## First Steps

### 1. Start the Simulation
Click the **"Start Simulation"** button in the Control Panel.

### 2. Observe the Network
- Watch the **Network Canvas** for devices turning red (compromised)
- Green = Normal, Orange = Under Attack, Red = Compromised, Gray = Isolated

### 3. Monitor Alerts
Check the **Alert Panel** on the right for security alerts.

### 4. Take Action via CLI
Click in the terminal and use commands:

```bash
# See all commands
help

# Show infected devices
show devices

# Isolate a compromised device
isolate host-1

# Scan the network
scan network

# Patch vulnerabilities
patch host-2
```

### 5. Win the Game
- **Win**: Keep infected devices ≤ 2
- **Lose**: 60%+ devices get infected

## Tips

1. **React quickly** - Infection spreads fast!
2. **Isolate first** - Stops spread immediately
3. **Scan regularly** - Find compromised devices
4. **Patch vulnerabilities** - Prevents re-infection
5. **Watch alerts** - They have delays like real SOC

## Troubleshooting

### Build Errors
```bash
rm -rf node_modules .next
npm install
npm run dev
```

### Canvas Not Rendering
- Check browser console for errors
- Ensure WebGL is enabled
- Try refreshing the page

### Terminal Not Responding
- Click inside the terminal first
- Type `help` to test
- Check for JavaScript errors
