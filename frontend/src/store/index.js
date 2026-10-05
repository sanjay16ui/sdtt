import { create } from 'zustand';
import { getInitialLiveEvents, mockSystemStatus, generateMockEvent } from '@/mock/data';

let simulationInterval = null;

export const useStore = create((set, get) => ({
  events: getInitialLiveEvents(30),
  systemStatus: mockSystemStatus,
  isSimulating: false,
  
  addEvent: (event) => set((state) => ({ 
    events: [event, ...state.events].slice(0, 200)
  })),

  startSimulation: () => {
    if (get().isSimulating) return;
    set({ isSimulating: true });
    simulationInterval = setInterval(() => {
      get().addEvent(generateMockEvent());
    }, 3500);
  },

  stopSimulation: () => {
    if (simulationInterval) clearInterval(simulationInterval);
    simulationInterval = null;
    set({ isSimulating: false });
  },

  toggleSimulation: () => {
    if (get().isSimulating) {
      get().stopSimulation();
    } else {
      get().startSimulation();
    }
  }
}));

export default useStore;
