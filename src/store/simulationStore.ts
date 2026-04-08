import { create } from 'zustand';
import { SimulationState, Scenario, Alert, Device, SimulationEvent, DefenseAction, Attack } from '@/types';
import { defaultScenario, getScenario } from '@/scenarios';

// ============================================
// Simulation Store (Zustand)
// ============================================

interface SimulationStore {
  // Current simulation state
  state: SimulationState | null;
  
  // Current scenario
  currentScenario: Scenario;
  
  // Selected device (for CLI context)
  selectedDeviceId: string | null;
  
  // Game status
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

export const useSimulationStore = create<SimulationStore>((set, get) => ({
  // Initial state
  state: null,
  currentScenario: defaultScenario,
  selectedDeviceId: null,
  isGameOver: false,
  gameResult: null,
  gameOverReason: '',

  // Actions
  setState: (newState: SimulationState) => {
    set({ state: newState });
  },

  setScenario: (scenarioId: string) => {
    const scenario = getScenario(scenarioId);
    set({ 
      currentScenario: scenario,
      state: null,
      isGameOver: false,
      gameResult: null,
      gameOverReason: '',
    });
  },

  selectDevice: (deviceId: string | null) => {
    set({ selectedDeviceId: deviceId });
  },

  acknowledgeAlert: (alertId: string) => {
    const currentState = get().state;
    if (!currentState) return;

    const updatedAlerts = currentState.alerts.map(alert =>
      alert.id === alertId ? { ...alert, isAcknowledged: true } : alert
    );

    set({
      state: {
        ...currentState,
        alerts: updatedAlerts,
      },
    });
  },

  resetGame: () => {
    set({
      state: null,
      isGameOver: false,
      gameResult: null,
      gameOverReason: '',
      selectedDeviceId: null,
    });
  },

  setGameOver: (won: boolean, reason: string) => {
    set({
      isGameOver: true,
      gameResult: won ? 'won' : 'lost',
      gameOverReason: reason,
    });
  },

  // Getters
  getDeviceById: (deviceId: string) => {
    const state = get().state;
    if (!state) return undefined;
    return state.topology.devices.find(d => d.id === deviceId);
  },

  getDeviceByName: (name: string) => {
    const state = get().state;
    if (!state) return undefined;
    // Try exact match first, then case-insensitive, then partial
    return state.topology.devices.find(
      d => d.id === name || 
           d.name.toLowerCase() === name.toLowerCase() ||
           d.name.toLowerCase().includes(name.toLowerCase())
    );
  },

  getAlerts: () => {
    const state = get().state;
    if (!state) return [];
    return state.alerts;
  },

  getUnacknowledgedAlerts: () => {
    const state = get().state;
    if (!state) return [];
    return state.alerts.filter(a => !a.isAcknowledged);
  },

  getCompromisedDevices: () => {
    const state = get().state;
    if (!state) return [];
    return state.topology.devices.filter(d => d.status === 'compromised');
  },
}));
