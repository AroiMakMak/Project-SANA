import React from 'react';

interface AudioWaveformProps {
  volume: number;
  isRecording: boolean;
  events: Array<{
    type: 'apnea' | 'snoring' | 'movement' | 'stimulation';
    timestamp: number;
    intensity: number;
  }>;
}

export const AudioWaveform: React.FC<AudioWaveformProps> = ({ volume, isRecording, events }) => {
  const waveHeight = Math.max(2, Math.min(48, volume));
  const recentEvents = events.slice(-50); // Show last 50 events
  
  return (
    <div className="bg-gray-900 rounded-lg p-4 h-36">
      <div className="flex items-center justify-between mb-2">
        <span className="text-white text-sm font-medium">Audio Waveform</span>
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${isRecording ? 'bg-red-500 animate-pulse' : 'bg-gray-500'}`} />
          <span className="text-white text-xs">{isRecording ? 'Recording' : 'Stopped'}</span>
        </div>
      </div>
      
      <div className="relative h-16 bg-gray-800 rounded overflow-hidden">
        {/* Waveform visualization */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div 
            className={`bg-gradient-to-r from-blue-400 to-teal-400 transition-all duration-100 rounded-sm`}
            style={{
              width: '4px',
              height: `${waveHeight}px`,
              filter: isRecording ? 'brightness(1)' : 'brightness(0.3)',
            }}
          />
        </div>
        
        {/* Event markers */}
        <div className="absolute inset-0">
          {recentEvents.map((event, index) => (
            <div
              key={index}
              className={`absolute top-0 w-1 h-full opacity-75 ${
                event.type === 'apnea' ? 'bg-red-500' :
                event.type === 'snoring' ? 'bg-yellow-500' :
                event.type === 'movement' ? 'bg-green-500' :
                'bg-purple-500'
              }`}
              style={{
                left: `${(index / 50) * 100}%`,
                height: `${event.intensity * 100}%`,
              }}
            />
          ))}
        </div>
        
        {/* Center line */}
        <div className="absolute top-1/2 left-0 right-0 h-px bg-gray-600" />
      </div>
      
      {/* Volume indicator */}
      <div className="flex items-center justify-between mt-2 text-xs text-gray-400">
        <span>Volume: {Math.round(volume)}%</span>
        <span>Events: {recentEvents.length}</span>
      </div>
    </div>
  );
};