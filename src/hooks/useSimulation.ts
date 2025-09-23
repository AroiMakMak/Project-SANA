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
    
    const weights = [0.1, 0.5, 0.3, 0.1]; // Probability weights
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
        Math.random() * 20000 + 10000 : // 10-30 seconds
        selectedType === 'snoring' ?
        Math.random() * 5000 + 2000 : // 2-7 seconds
        selectedType === 'stimulation' ?
        Math.random() * 200 + 50 : // 50-250ms
        Math.random() * 3000 + 500, // 0.5-3.5 seconds for movement
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
    }, 2000); // Generate events every 2 seconds
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