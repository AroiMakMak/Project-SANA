import { useState, useRef, useCallback, useEffect } from 'react';
import { AudioProcessingState, SleepEvent } from '../types';

export const useAudioProcessing = () => {
  const [state, setState] = useState<AudioProcessingState>({
    isRecording: false,
    currentVolume: 0,
    noiseBaseline: 0,
    isCalibrating: false,
    calibrationProgress: 0,
  });

  const [events, setEvents] = useState<SleepEvent[]>([]);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animationFrameRef = useRef<number>();
  const lastEventTimeRef = useRef<number>(0);

  // Simulate audio data for demo purposes
  const simulateAudioData = useCallback(() => {
    if (!state.isRecording) return;

    const now = Date.now();
    const timeSinceLastEvent = now - lastEventTimeRef.current;

    // Simulate breathing pattern with occasional events
    const volume = Math.random() * 100 + Math.sin(now / 1000) * 30;
    setState(prev => ({ ...prev, currentVolume: volume }));

    // Simulate events based on probability
    if (timeSinceLastEvent > 5000) { // At least 5 seconds between events
      const eventChance = Math.random();
      
      if (eventChance < 0.02) { // 2% chance of apnea
        const event: SleepEvent = {
          type: 'apnea',
          timestamp: now,
          duration: Math.random() * 20000 + 10000, // 10-30 seconds
          intensity: Math.random() * 0.8 + 0.2,
        };
        setEvents(prev => [...prev, event]);
        lastEventTimeRef.current = now;
      } else if (eventChance < 0.08) { // 6% chance of snoring
        const event: SleepEvent = {
          type: 'snoring',
          timestamp: now,
          duration: Math.random() * 5000 + 2000, // 2-7 seconds
          intensity: Math.random() * 0.9 + 0.1,
          frequency: Math.random() * 190 + 110, // 110-300 Hz
        };
        setEvents(prev => [...prev, event]);
        lastEventTimeRef.current = now;
      } else if (eventChance < 0.12) { // 4% chance of movement
        const event: SleepEvent = {
          type: 'movement',
          timestamp: now,
          duration: Math.random() * 3000 + 500, // 0.5-3.5 seconds
          intensity: Math.random() * 0.7 + 0.3,
        };
        setEvents(prev => [...prev, event]);
        lastEventTimeRef.current = now;
      }
    }

    animationFrameRef.current = requestAnimationFrame(simulateAudioData);
  }, [state.isRecording]);

  const startCalibration = useCallback(async () => {
    setState(prev => ({ ...prev, isCalibrating: true, calibrationProgress: 0 }));
    
    // Simulate calibration process
    let progress = 0;
    const calibrationInterval = setInterval(() => {
      progress += 10;
      setState(prev => ({ ...prev, calibrationProgress: progress }));
      
      if (progress >= 100) {
        clearInterval(calibrationInterval);
        const baseline = Math.random() * 20 + 15; // Random baseline noise
        setState(prev => ({ 
          ...prev, 
          isCalibrating: false, 
          calibrationProgress: 100,
          noiseBaseline: baseline 
        }));
      }
    }, 200);
  }, []);

  const startRecording = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, isRecording: true }));
      lastEventTimeRef.current = Date.now();
      simulateAudioData();
    } catch (error) {
      console.error('Error starting recording:', error);
      setState(prev => ({ ...prev, isRecording: false }));
    }
  }, [simulateAudioData]);

  const stopRecording = useCallback(() => {
    setState(prev => ({ ...prev, isRecording: false }));
    
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
    }
    
    if (audioContextRef.current) {
      audioContextRef.current.close();
    }
    
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
  }, []);

  useEffect(() => {
    return () => {
      stopRecording();
    };
  }, [stopRecording]);

  return {
    state,
    events,
    startCalibration,
    startRecording,
    stopRecording,
  };
};