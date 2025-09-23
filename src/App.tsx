import React, { useState, useEffect } from 'react';
import { useSettings } from './contexts/SettingsContext';
import { useAudioProcessing } from './hooks/useAudioProcessing';
import { useSimulation } from './hooks/useSimulation';
import { AudioWaveform } from './components/AudioWaveform';
import { EventMonitor } from './components/EventMonitor';
import { SleepMetricsDashboard } from './components/SleepMetricsDashboard';
import { DepressionRiskAssessment } from './components/DepressionRiskAssessment';
import { SleepReport } from './components/SleepReport';
import { SettingsModal } from './components/SettingsModal';
import { 
  calculateRespiratoryMetrics,
  calculateSnoringMetrics,
  calculateMovementMetrics,
  calculateSleepQualityMetrics,
  calculateDepressionRiskScore
} from './utils/sleepAnalytics';
import { SleepSession } from './types';
import { Brain, Moon, Activity, BarChart3, FileText, Settings } from 'lucide-react';

type TabType = 'monitor' | 'analytics' | 'reports';

function App() {
  const { t } = useSettings();
  const { state, events } = useAudioProcessing();
  const { 
    isRunning: isSimulationRunning, 
    simulatedEvents, 
  } = useSimulation();
  const [currentSession, setCurrentSession] = useState<SleepSession | null>(null);
  const [sessions, setSessions] = useState<SleepSession[]>([]);
  const [activeTab, setActiveTab] = useState<TabType>('monitor');
  const [showSettings, setShowSettings] = useState(false);

  // Combine real and simulated events
  const allEvents = [...events, ...simulatedEvents].sort((a, b) => a.timestamp - b.timestamp);

  // Start new session when recording begins
  useEffect(() => {
    if (isSimulationRunning && !currentSession) {
      const newSession: SleepSession = {
        id: Date.now().toString(),
        startTime: Date.now(),
        events: [],
      };
      setCurrentSession(newSession);
    }
  }, [isSimulationRunning, currentSession]);

  // Update current session with events
  useEffect(() => {
    if (currentSession && isSimulationRunning) {
      setCurrentSession(prev => prev ? { ...prev, events: allEvents } : null);
    }
  }, [allEvents, currentSession, isSimulationRunning]);

  // End session and calculate metrics when recording stops
  useEffect(() => {
    if (!isSimulationRunning && currentSession && allEvents.length > 0) {
      const endTime = Date.now();
      const duration = endTime - currentSession.startTime;
      
      if (duration > 60000) { // At least 1 minute
        const respiratory = calculateRespiratoryMetrics(allEvents, duration);
        const snoring = calculateSnoringMetrics(allEvents, duration);
        const movement = calculateMovementMetrics(allEvents, duration);
        const sleepQuality = calculateSleepQualityMetrics(allEvents, duration);
        const riskScore = calculateDepressionRiskScore(respiratory, snoring, movement, sleepQuality);
        
        const completedSession: SleepSession = {
          ...currentSession,
          endTime,
          events: allEvents,
          metrics: {
            respiratory,
            snoring,
            movement,
            sleepQuality,
          },
          riskScore,
        };
        
        setSessions(prev => [completedSession, ...prev]);
        setActiveTab('analytics');
      }
      
      setCurrentSession(null);
    }
  }, [isSimulationRunning, currentSession, allEvents]);

  const latestSession = sessions.length > 0 ? sessions[0] : null;

  const tabs = [
    { id: 'monitor' as TabType, label: t('nav.monitor'), icon: Activity },
    { id: 'analytics' as TabType, label: t('nav.analytics'), icon: BarChart3 },
    { id: 'reports' as TabType, label: t('nav.reports'), icon: FileText },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-teal-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 transition-colors">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className=" rounded-lg">
                {/* <Brain className="w-6 h-6 text-white" /> */}
                <img src="/sana.png" alt="SANA Logo" className="w-14 h-14 rounded-md" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900 dark:text-white">{t('app.title')}</h1>
                <p className="text-sm text-gray-600 dark:text-gray-300">{t('app.subtitle')}</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={() => setShowSettings(true)}
                className="p-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <Settings className="w-5 h-5" />
              </button>
              <div className={`flex items-center gap-2 px-3 py-2 rounded-full text-sm font-medium ${
                isSimulationRunning
                  ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300' 
                  : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300'
              }`}>
                <Moon className="w-4 h-4" />
                {isSimulationRunning ? t('status.monitoring') : t('status.ready')}
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Navigation Tabs */}
        <div className="flex space-x-1 mb-8 bg-gray-100 dark:bg-gray-700 p-1 rounded-lg">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${
                activeTab === tab.id
                  ? 'bg-white dark:bg-gray-600 text-blue-600 dark:text-blue-400 shadow-sm'
                  : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {activeTab === 'monitor' && (
          <div className="space-y-6">
            <AudioWaveform
              volume={state.currentVolume}
              isRecording={isSimulationRunning}
              events={allEvents}
            />
            <EventMonitor events={allEvents} />
          </div>
        )}

        {activeTab === 'analytics' && (
          <div className="space-y-6">
            <SleepMetricsDashboard
              respiratory={latestSession?.metrics?.respiratory}
              snoring={latestSession?.metrics?.snoring}
              movement={latestSession?.metrics?.movement}
              sleepQuality={latestSession?.metrics?.sleepQuality}
            />
            <DepressionRiskAssessment riskScore={latestSession?.riskScore} />
          </div>
        )}

        {activeTab === 'reports' && (
          <SleepReport sessions={sessions} />
        )}


        
      </div>

      <SettingsModal isOpen={showSettings} onClose={() => setShowSettings(false)} />
    </div>
  );
}

export default App;