export interface AudioProcessingState {
  isRecording: boolean;
  currentVolume: number;
  noiseBaseline: number;
  isCalibrating: boolean;
  calibrationProgress: number;
}

export interface SleepEvent {
  type: 'apnea' | 'snoring' | 'movement' | 'stimulation';
  timestamp: number;
  duration: number;
  intensity: number;
  frequency?: number;
}

export interface RespiratoryMetrics {
  respiratoryRate: number;
  respiratoryVariability: number;
  interBreathInterval: number[];
  sampleEntropy: number;
}

export interface SnoringMetrics {
  snoreTimePercentage: number;
  episodeCount: number;
  meanDecibel: number;
  peakDecibel: number;
  peakFrequency: number;
  spectralEntropy: number;
}

export interface MovementMetrics {
  burstCountPerHour: number;
  motionIndex: number;
  fragmentationIndex: number;
  averageBurstInterval: number;
}

export interface SleepQualityMetrics {
  ahiLike: number;
  eventDurationMean: number;
  eventDurationMedian: number;
  arousalProxyCount: number;
  totalSleepTime: number;
}

export interface DepressionRiskScore {
  overall: number;
  sdbSeverity: number;
  sleepFragmentation: number;
  cardiorespiratory: number;
  riskLevel: 'Low' | 'Moderate' | 'High';
  recommendations: string[];
}

export interface SleepSession {
  id: string;
  startTime: number;
  endTime?: number;
  events: SleepEvent[];
  metrics?: {
    respiratory: RespiratoryMetrics;
    snoring: SnoringMetrics;
    movement: MovementMetrics;
    sleepQuality: SleepQualityMetrics;
  };
  riskScore?: DepressionRiskScore;
}