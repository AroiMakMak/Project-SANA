import React from 'react';
import { useSettings } from '../contexts/SettingsContext';
import { useSimulation } from '../hooks/useSimulation';
import { X, Sun, Moon, Globe, TestTube, Play, Pause, RotateCcw, Zap } from 'lucide-react';
import { SleepEvent } from '../types';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
  const { theme, language, toggleTheme, setLanguage, t } = useSettings();
  const { 
    isRunning: isSimulationRunning, 
    simulatedEvents, 
    toggleSimulation, 
    addEvents: addSimulatedEvents, 
    clearEvents: clearSimulatedEvents 
  } = useSimulation();
  const [eventIntensity, setEventIntensity] = React.useState(0.5);
  const [selectedEventTypes, setSelectedEventTypes] = React.useState({
    apnea: true,
    snoring: true,
    movement: true,
    stimulation: false,
  });

  if (!isOpen) return null;

  const generateSampleSession = () => {
    const events: SleepEvent[] = [];
    const now = Date.now();
    const sessionDuration = 8 * 60 * 60 * 1000; // 8 hours
    
    // Generate realistic sleep events over 8 hours
    for (let i = 0; i < 50; i++) {
      const timestamp = now - sessionDuration + (Math.random() * sessionDuration);
      
      // Weighted random event selection
      const eventRand = Math.random();
      let eventType: 'apnea' | 'snoring' | 'movement' | 'stimulation';
      
      if (eventRand < 0.15 && selectedEventTypes.apnea) {
        eventType = 'apnea';
      } else if (eventRand < 0.6 && selectedEventTypes.snoring) {
        eventType = 'snoring';
      } else if (eventRand < 0.9 && selectedEventTypes.movement) {
        eventType = 'movement';
      } else if (selectedEventTypes.stimulation) {
        eventType = 'stimulation';
      } else {
        eventType = 'movement'; // fallback
      }

      const baseIntensity = eventIntensity;
      const event: SleepEvent = {
        type: eventType,
        timestamp,
        duration: eventType === 'apnea' ? 
          Math.random() * 25000 + 10000 : // 10-35 seconds
          eventType === 'snoring' ?
          Math.random() * 8000 + 2000 : // 2-10 seconds
          eventType === 'stimulation' ?
          Math.random() * 200 + 50 : // 50-250ms
          Math.random() * 5000 + 500, // 0.5-5.5 seconds for movement
        intensity: Math.min(1, Math.max(0.1, baseIntensity + (Math.random() - 0.5) * 0.4)),
        frequency: eventType === 'snoring' ? Math.random() * 190 + 110 : undefined,
      };
      
      events.push(event);
    }
    
    // Sort by timestamp
    events.sort((a, b) => a.timestamp - b.timestamp);
    addSimulatedEvents(events);
  };

  const generateRealtimeEvent = () => {
    const eventTypes = Object.entries(selectedEventTypes)
      .filter(([_, enabled]) => enabled)
      .map(([type, _]) => type as 'apnea' | 'snoring' | 'movement' | 'stimulation');
    
    if (eventTypes.length === 0) return;
    
    const eventType = eventTypes[Math.floor(Math.random() * eventTypes.length)];
    const event: SleepEvent = {
      type: eventType,
      timestamp: Date.now(),
      duration: eventType === 'apnea' ? 
        Math.random() * 20000 + 10000 :
        eventType === 'snoring' ?
        Math.random() * 5000 + 2000 :
        eventType === 'stimulation' ?
        Math.random() * 150 + 50 :
        Math.random() * 3000 + 500,
      intensity: Math.min(1, Math.max(0.1, eventIntensity + (Math.random() - 0.5) * 0.3)),
      frequency: eventType === 'snoring' ? Math.random() * 190 + 110 : undefined,
    };
    
    addSimulatedEvents([event]);
  };
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            {t('settings.title')}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Theme Setting */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              {t('settings.theme')}
            </label>
            <div className="flex items-center gap-3">
              <button
                onClick={toggleTheme}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors ${
                  theme === 'light'
                    ? 'bg-blue-50 border-blue-200 text-blue-700 dark:bg-blue-900 dark:border-blue-700 dark:text-blue-300'
                    : 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-600'
                }`}
              >
                <Sun className="w-4 h-4" />
                {t('settings.light')}
              </button>
              <button
                onClick={toggleTheme}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors ${
                  theme === 'dark'
                    ? 'bg-blue-50 border-blue-200 text-blue-700 dark:bg-blue-900 dark:border-blue-700 dark:text-blue-300'
                    : 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-600'
                }`}
              >
                <Moon className="w-4 h-4" />
                {t('settings.dark')}
              </button>
            </div>
          </div>

          {/* Simulation Settings */}
          <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
            <div className="flex items-center gap-3 mb-4">
              <TestTube className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {t('sim.title')}
              </h3>
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${isSimulationRunning ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`} />
                <span className="text-sm text-gray-600 dark:text-gray-300">
                  {isSimulationRunning ? t('sim.running') : t('sim.stopped')}
                </span>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-2 gap-3 mb-4">
              <button
                onClick={generateSampleSession}
                className="flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Zap className="w-4 h-4" />
                {t('sim.generate.session')}
              </button>
              <button
                onClick={clearSimulatedEvents}
                className="flex items-center justify-center gap-2 px-4 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                <RotateCcw className="w-4 h-4" />
                {t('sim.clear.events')}
              </button>
            </div>

            {/* Real-time Controls */}
            <div className="mb-4">
              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">{t('sim.realtime')}</h4>
              <div className="flex items-center gap-3 mb-3">
                <button
                  onClick={toggleSimulation}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                    isSimulationRunning 
                      ? 'bg-red-100 text-red-700 hover:bg-red-200 dark:bg-red-900 dark:text-red-300' 
                      : 'bg-green-100 text-green-700 hover:bg-green-200 dark:bg-green-900 dark:text-green-300'
                  }`}
                >
                  {isSimulationRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                  {isSimulationRunning ? t('sim.stop') : t('sim.start')} {t('sim.auto.events')}
                </button>
                <button
                  onClick={generateRealtimeEvent}
                  className="flex items-center gap-2 px-4 py-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors dark:bg-purple-900 dark:text-purple-300"
                >
                  <Zap className="w-4 h-4" />
                  {t('sim.manual.event')}
                </button>
              </div>
            </div>

            {/* Event Type Selection */}
            <div className="mb-4">
              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">{t('sim.event.types')}</h4>
              <div className="grid grid-cols-2 gap-2">
                {Object.entries(selectedEventTypes).map(([type, enabled]) => (
                  <label key={type} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={enabled}
                      onChange={(e) => setSelectedEventTypes(prev => ({
                        ...prev,
                        [type]: e.target.checked
                      }))}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm capitalize text-gray-700 dark:text-gray-300">{type}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Intensity Control */}
            <div className="mb-4">
              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                {t('sim.intensity')}: {Math.round(eventIntensity * 100)}%
              </h4>
              <input
                type="range"
                min="0.1"
                max="1"
                step="0.1"
                value={eventIntensity}
                onChange={(e) => setEventIntensity(parseFloat(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
              />
            </div>
          </div>
          {/* Language Setting */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              {t('settings.language')}
            </label>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setLanguage('th')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors ${
                  language === 'th'
                    ? 'bg-blue-50 border-blue-200 text-blue-700 dark:bg-blue-900 dark:border-blue-700 dark:text-blue-300'
                    : 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-600'
                }`}
              >
                <Globe className="w-4 h-4" />
                {t('settings.thai')}
              </button>
              <button
                onClick={() => setLanguage('en')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors ${
                  language === 'en'
                    ? 'bg-blue-50 border-blue-200 text-blue-700 dark:bg-blue-900 dark:border-blue-700 dark:text-blue-300'
                    : 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-600'
                }`}
              >
                <Globe className="w-4 h-4" />
                {t('settings.english')}
              </button>
            </div>
          </div>
        </div>

        <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={onClose}
            className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            {language === 'th' ? 'ปิด' : 'Close'}
          </button>
        </div>
      </div>
    </div>
  );
};