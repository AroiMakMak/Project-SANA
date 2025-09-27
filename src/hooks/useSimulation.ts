import { useState, useRef, useCallback, useEffect } from 'react';
import { SleepEvent } from '../types';

export const useSimulation = () => {
  const [isRunning, setIsRunning] = useState(false);
  const [simulatedEvents, setSimulatedEvents] = useState<SleepEvent[]>([]);
  const intervalRef = useRef<NodeJS.Timeout>();

  const generateRandomEvent = useCallback((): SleepEvent => {
    const eventTypes: ('apnea' | 'snoring' | 'movement' | 'stimulation')[] = [
      'apnea', 'snoring', 'movement', 'stimulation'
    ];
    
    const weights = [0.15, 0.45, 0.35, 0.05]; // Probability weights - more realistic distribution
    const random = Math.random();
    let cumulativeWeight = 0;
    let selectedType = eventTypes[0];
    
    for (let i = 0; i < weights.length; i++) {
      cumulativeWeight += weights[i];
      if (random <= cumulativeWeight) {
        selectedType = eventTypes[i];
        break;
      }
    }

    return {
      type: selectedType,
      timestamp: Date.now(),
      duration: selectedType === 'apnea' ?
        Math.random() * 25000 + 10000 : // 10-35 seconds (AASM compliant)
        selectedType === 'snoring' ?
        Math.random() * 8000 + 2000 : // 2-10 seconds
        selectedType === 'stimulation' ?
        Math.random() * 150 + 50 : // 50-200ms
        Math.random() * 5000 + 500, // 0.5-5.5 seconds for movement
      intensity: Math.random() * 0.8 + 0.2, // 0.2-1.0
      frequency: selectedType === 'snoring' ? Math.random() * 190 + 110 : undefined,
    };
  }, []);

  const startSimulation = useCallback(() => {
    if (isRunning) return;
    
    setIsRunning(true);
    intervalRef.current = setInterval(() => {
      const shouldGenerateEvent = Math.random() < 0.3; // 30% chance every interval
      if (shouldGenerateEvent) {
        const event = generateRandomEvent();
        setSimulatedEvents(prev => [...prev, event]);
      }
    }, 3000); // Generate events every 3 seconds (more realistic)
  }, [isRunning, generateRandomEvent]);

  const stopSimulation = useCallback(() => {
    setIsRunning(false);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
  }, []);

  const toggleSimulation = useCallback(() => {
    if (isRunning) {
      stopSimulation();
    } else {
      startSimulation();
    }
  }, [isRunning, startSimulation, stopSimulation]);

  const addEvents = useCallback((events: SleepEvent[]) => {
    setSimulatedEvents(prev => [...prev, ...events]);
  }, []);

  const clearEvents = useCallback(() => {
    setSimulatedEvents([]);
  }, []);

  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  return {
    isRunning,
    simulatedEvents,
    startSimulation,
    stopSimulation,
    toggleSimulation,
    addEvents,
    clearEvents,
  };
};