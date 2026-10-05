import { useEffect } from 'react';
import { useStore } from '@/store';

export function useSimulation(autoStart = true) {
  const { isSimulating, startSimulation, stopSimulation, toggleSimulation, events, systemStatus } = useStore();

  useEffect(() => {
    if (autoStart) {
      startSimulation();
    }
    return () => {
      // Optional: keep simulation running or stop on unmount
    };
  }, [autoStart, startSimulation]);

  return {
    isSimulating,
    startSimulation,
    stopSimulation,
    toggleSimulation,
    events,
    systemStatus,
  };
}

export default useSimulation;
