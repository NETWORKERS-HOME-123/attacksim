# E2E Wiring Summary - Cyber Attack & Defense Simulator

## Overview

This document provides a comprehensive summary of the end-to-end wiring for the Cyber Attack & Defense Simulator dashboard frontend.

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                     REACT FRONTEND (Next.js)                     │
├─────────────────────────────────────────────────────────────────┤
│  DashboardStats    ControlPanel    AlertPanel                   │
│  ├─ Live metrics   ├─ Controls     ├─ Security alerts           │
│  ├─ Device counts  ├─ Timer        ├─ Severity levels           │
│  ├─ Progress bars  ├─ Score        ├─ Acknowledge               │
│  └─ Alert summary  └─ Objectives   └─ Statistics                │
├─────────────────────────────────────────────────────────────────┤
│  NetworkCanvas (Konva.js)        Terminal (xterm.js)            │
│  ├─ Interactive topology         ├─ CLI interface               │
│  ├─ Device selection             ├─ Command parsing             │
│  ├─ Zoom/pan                     ├─ Defense actions             │
│  └─ Visual states                └─ Output display              │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    ZUSTAND STATE STORE                           │
├─────────────────────────────────────────────────────────────────┤
│  SimulationState    CurrentScenario    GameStatus               │
│  ├─ topology        ├─ id/name         ├─ isGameOver            │
│  ├─ alerts          ├─ description     ├─ gameResult            │
│  ├─ events          ├─ objectives      ├─ gameOverReason         │
│  ├─ score           ├─ win/fail                                │
│  └─ logs                                                       │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                   SIMULATION ENGINE (Inline)                     │
├─────────────────────────────────────────────────────────────────┤
│  Attack Engine    Defense Engine    Detection Engine            │
│  ├─ Propagation   ├─ Isolate        ├─ Alert generation         │
│  ├─ Probability   ├─ Block IP       ├─ Delay simulation         │
│  ├─ Spread logic  ├─ Patch          ├─ False positives          │
│  └─ Vulnerabilities ├─ Scan         └─ Correlation              │
│                   └─ Reset creds                                │
└─────────────────────────────────────────────────────────────────┘
```

## Component Wiring Details

### 1. DashboardStats Component

**Location**: `src/components/DashboardStats/index.tsx`

**Store Integration**:
```typescript
const { state, currentScenario } = useSimulationStore();
```

**Features**:
- Live metrics display (time, score, damage prevented)
- Device status grid (active, under_attack, compromised, isolated, total)
- Infection rate progress bar with color coding
- Alert summary by severity
- Event statistics
- Scenario progress tracking

**Data Flow**:
```
Store (state) → DashboardStats → Visual Display
                ↓
         Real-time updates every tick
```

### 2. NetworkCanvas Component

**Location**: `src/components/NetworkCanvas/index.tsx`

**Store Integration**:
```typescript
const { state, selectedDeviceId, selectDevice } = useSimulationStore();
```

**Props**:
```typescript
interface NetworkCanvasProps {
  width?: number;   // default: 800
  height?: number;  // default: 600
}
```

**Features**:
- Konva.js powered canvas
- Interactive device nodes
- Link visualization
- Zoom and pan support
- Device selection
- Visual state indicators (colors, pulse effects)
- Legend and stats overlay

**Event Handlers**:
- `handleDeviceClick` - Select/deselect devices
- `handleWheel` - Zoom in/out
- `handleDragMove` - Pan canvas

**Data Flow**:
```
Store (topology) → NetworkCanvas → Konva Stage → Visual Rendering
       ↑                              ↓
       └──── selectDevice ←───────────┘
```

### 3. Terminal Component

**Location**: `src/components/Terminal/index.tsx`

**Store Integration**:
```typescript
const { state, getDeviceById, getDeviceByName } = useSimulationStore();
```

**Props**:
```typescript
interface TerminalProps {
  onDefenseAction?: (action: DefenseAction) => void;
  className?: string;
}
```

**Features**:
- xterm.js terminal emulation
- Custom cyberpunk theme
- Command history
- Tab completion support
- Full CLI command set

**CLI Commands**:
```
help                          - Show available commands
show logs                     - Display security logs
show alerts                   - Show active alerts
show devices                  - List network devices
show topology                 - Display network topology
show status                   - Simulation status
show stats                    - Display score statistics
isolate <device>              - Disconnect device
block ip <ip> [on <device>]   - Block traffic
scan network [device]         - Scan for compromised nodes
patch <device>                - Apply security patch
reset credentials <device>    - Reset credentials
enable firewall [on <dev>]    - Enable firewall
disable smb [on <dev>]        - Disable SMB
mode <user|admin|config>      - Switch CLI mode
clear                         - Clear terminal
```

**Data Flow**:
```
User Input → Terminal → CLIParser → Command Handler
                              ↓
                    Defense Action → onDefenseAction (callback)
                              ↓
                         Page Component
                              ↓
                      SimulationEngine
```

### 4. AlertPanel Component

**Location**: `src/components/AlertPanel/index.tsx`

**Store Integration**:
```typescript
const { state, acknowledgeAlert, getUnacknowledgedAlerts } = useSimulationStore();
```

**Features**:
- Unacknowledged alerts display
- Severity-based color coding
- Sort by severity (critical first)
- Acknowledge button
- Alert count summary

**Data Flow**:
```
DetectionEngine → Store (alerts) → AlertPanel → Display
                           ↑           ↓
                           └──── acknowledgeAlert ──┘
```

### 5. ControlPanel Component

**Location**: `src/components/ControlPanel/index.tsx`

**Store Integration**:
```typescript
const { currentScenario, state, isGameOver, gameResult, gameOverReason, resetGame } = useSimulationStore();
```

**Props**:
```typescript
interface ControlPanelProps {
  onStart: () => void;
  onPause: () => void;
  onResume: () => void;
  onStop: () => void;
  isRunning: boolean;
  isPaused: boolean;
}
```

**Features**:
- Scenario information display
- Game over overlay
- Control buttons (Start/Pause/Resume/Stop)
- Live status display (timer, score, compromised count)
- Objectives list
- Win/lose conditions

**Data Flow**:
```
User Click → ControlPanel → Handler Callback → Page Component
                                              ↓
                                       SimulationEngine
```

## Store Wiring

### Zustand Store Configuration

**Location**: `src/store/simulationStore.ts`

**State Structure**:
```typescript
interface SimulationStore {
  // Core State
  state: SimulationState | null;
  currentScenario: Scenario;
  selectedDeviceId: string | null;
  
  // Game Status
  isGameOver: boolean;
  gameResult: 'won' | 'lost' | null;
  gameOverReason: string;
  
  // Actions
  setState: (state: SimulationState) => void;
  setScenario: (scenarioId: string) => void;
  selectDevice: (deviceId: string | null) => void;
  acknowledgeAlert: (alertId: string) => void;
  resetGame: () => void;
  setGameOver: (won: boolean, reason: string) => void;
  
  // Getters
  getDeviceById: (deviceId: string) => Device | undefined;
  getDeviceByName: (name: string) => Device | undefined;
  getAlerts: () => Alert[];
  getUnacknowledgedAlerts: () => Alert[];
  getCompromisedDevices: () => Device[];
}
```

**Usage Pattern**:
```typescript
// In components
const { state, setState } = useSimulationStore();

// Selective subscription (only re-renders on state changes)
const compromisedCount = useSimulationStore(
  state => state.state?.topology.devices.filter(d => d.status === 'compromised').length
);
```

## Engine Wiring

### SimulationEngine Class (Inline)

**Location**: Embedded in `src/app/page.tsx`

**Constructor**:
```typescript
constructor(
  scenario: Scenario,
  config: SimulationEngineConfig,
  onStateUpdate: (state: SimulationState) => void,
  onGameOver: (won: boolean, reason: string) => void
)
```

**Tick Cycle**:
```
setInterval (tickRate: 200ms)
    ↓
1. Process Attack Propagation
    - For each active attack
    - Calculate spread probability
    - Attempt infection of neighbors
    - Create infection events
    ↓
2. Process Pending Alerts
    - Check detection engine queue
    - Emit ready alerts
    - Log to event log
    ↓
3. Check End Conditions
    - Win conditions
    - Fail conditions
    - Time limit
    ↓
4. Update Score
    - Calculate damage prevented
    - Update total score
    ↓
broadcastState() → Store → Components
```

**Engine Integration**:
```typescript
// In Page component
const engineRef = useRef<SimulationEngine | null>(null);

useEffect(() => {
  const engine = new SimulationEngine(
    currentScenario,
    { tickRate: 200, seed: Date.now() },
    (newState) => setState(newState),  // Update store
    (won, reason) => setGameOver(won, reason)  // Game over handler
  );
  engineRef.current = engine;
}, [currentScenario]);

// Defense action handler
const handleDefenseAction = useCallback((action: DefenseAction) => {
  engineRef.current?.executeDefenseAction(action);
}, []);
```

## Data Flow Summary

### Initialization Flow
```
1. Page loads
   ↓
2. Create SimulationEngine instance
   ↓
3. Engine initializes topology
   ↓
4. Engine broadcasts initial state
   ↓
5. Store receives state
   ↓
6. Components re-render with initial data
```

### Game Loop Flow
```
1. User clicks Start
   ↓
2. engine.start() called
   ↓
3. setInterval begins ticking
   ↓
4. Each tick:
   a. Process attacks
   b. Generate alerts
   c. Check conditions
   d. Update score
   e. Broadcast state
   ↓
5. Store updates
   ↓
6. All connected components re-render
```

### Defense Action Flow
```
1. User types command in Terminal
   ↓
2. CLIParser validates command
   ↓
3. Terminal calls onDefenseAction
   ↓
4. Page receives action
   ↓
5. engine.executeDefenseAction()
   ↓
6. DefenseEngine processes action
   ↓
7. Topology updated
   ↓
8. DetectionEngine notified
   ↓
9. State broadcasted
   ↓
10. UI updates
```

### Alert Flow
```
1. Infection event occurs
   ↓
2. DetectionEngine.processEvent()
   ↓
3. Detection rules evaluated
   ↓
4. Alert added to pending queue
   ↓
5. After delay, alert emitted
   ↓
6. Added to state.alerts
   ↓
7. AlertPanel displays new alert
```

## Import/Export Structure

### Barrel Exports

**Components** (`src/components/index.ts`):
```typescript
export { NetworkCanvas } from './NetworkCanvas';
export { Terminal } from './Terminal';
export { AlertPanel } from './AlertPanel';
export { ControlPanel } from './ControlPanel';
export { DashboardStats } from './DashboardStats';
```

**Engines** (`src/engines/index.ts`):
```typescript
export { AttackPropagationEngine, attackConfigs } from './attack/propagation';
export { DefenseEngine, DefenseResult } from './defense';
export { DetectionEngine } from './detection';
export { CLIParser, ParsedCommand } from './cli/parser';
```

**Utils** (`src/utils/index.ts`):
```typescript
export { SeededRandom, setGlobalSeed, getGlobalRandom } from './random';
export { generateUUID, generateShortId } from './uuid';
```

### Path Aliases (tsconfig.json)

```json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./*"]
    }
  }
}
```

**Usage**:
```typescript
import { NetworkCanvas } from '@/components';
import { useSimulationStore } from '@/store/simulationStore';
import { DefenseAction } from '@/types';
```

## Wiring Checklist

### ✅ Component to Store
- [x] DashboardStats reads state
- [x] NetworkCanvas reads state + selectedDeviceId
- [x] Terminal reads state + device getters
- [x] AlertPanel reads state + acknowledgeAlert
- [x] ControlPanel reads state + scenario + game status

### ✅ Component to Component
- [x] Page passes handlers to ControlPanel
- [x] Page passes onDefenseAction to Terminal
- [x] All components share state via Zustand

### ✅ Component to Engine
- [x] Terminal → CLIParser (internal)
- [x] Page → SimulationEngine (via ref)
- [x] Defense actions flow: Terminal → Page → Engine

### ✅ Engine to Store
- [x] Engine broadcasts state updates
- [x] Store setState called on every tick
- [x] Game over triggers store update

### ✅ Type Safety
- [x] All props typed
- [x] All functions typed
- [x] Store interface defined
- [x] No implicit any

## Performance Optimizations

1. **Zustand Selectors**: Components subscribe only to needed state
2. **React Refs**: Engine instance stored in ref (no re-renders)
3. **useCallback**: Handlers memoized
4. **useEffect Cleanup**: Intervals cleared on unmount
5. **Tick Rate**: 200ms for smooth performance
6. **Efficient Re-renders**: State updates batched

## Summary

✅ **All components fully wired**
✅ **Complete data flow established**
✅ **Store properly integrated**
✅ **Engine connected to UI**
✅ **Type safety enforced**
✅ **Dashboard fully developed**

The Cyber Attack & Defense Simulator frontend is fully wired and ready for deployment.
