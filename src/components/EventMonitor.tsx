import React from 'react';
import { useSettings } from '../contexts/SettingsContext';
import { SleepEvent } from '../types';
import { Activity, Zap, Volume2, Moon } from 'lucide-react';

interface EventMonitorProps {
  events: SleepEvent[];
}

export const EventMonitor: React.FC<EventMonitorProps> = ({ events }) => {
  const { t } = useSettings();
  const recentEvents = events.slice(-10).reverse();
  const eventCounts = events.reduce((acc, event) => {
    acc[event.type] = (acc[event.type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const getEventIcon = (type: string) => {
    switch (type) {
      case 'apnea': return <Moon className="w-4 h-4" />;
      case 'snoring': return <Volume2 className="w-4 h-4" />;
      case 'movement': return <Activity className="w-4 h-4" />;
      case 'stimulation': return <Zap className="w-4 h-4" />;
      default: return <Activity className="w-4 h-4" />;
    }
  };

  const getEventColor = (type: string) => {
    switch (type) {
      case 'apnea': return 'text-red-600 bg-red-50';
      case 'snoring': return 'text-yellow-600 bg-yellow-50';
      case 'movement': return 'text-green-600 bg-green-50';
      case 'stimulation': return 'text-purple-600 bg-purple-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getEventLabel = (type: string) => {
    switch (type) {
      case 'apnea': return t('events.apnea');
      case 'snoring': return t('events.snoring');
      case 'movement': return t('events.movement');
      case 'stimulation': return t('events.stimulation');
      default: return type;
    }
  };
  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString('th-TH', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  const formatDuration = (duration: number) => {
    if (duration < 1000) return `${Math.round(duration)}ms`;
    return `${(duration / 1000).toFixed(1)}s`;
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 sm:p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">{t('events.title')}</h3>
        <span className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 hidden sm:inline">{t('events.realtime')}</span>
      </div>

      {/* Event counters */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-4 mb-4 sm:mb-6">
        {[
          { type: 'apnea', label: t('events.apnea'), color: 'red' },
          { type: 'snoring', label: t('events.snoring'), color: 'yellow' },
          { type: 'movement', label: t('events.movement'), color: 'green' },
          { type: 'stimulation', label: t('events.stimulation'), color: 'purple' },
        ].map(({ type, label, color }) => (
          <div key={type} className={`bg-${color}-50 dark:bg-${color}-900 rounded-lg p-2 sm:p-3 text-center`}>
            <div className={`text-${color}-600 text-lg sm:text-2xl font-bold`}>
              {eventCounts[type] || 0}
            </div>
            <div className={`text-${color}-700 dark:text-${color}-300 text-xs sm:text-xs font-medium mt-1`}>
              {label}
            </div>
          </div>
        ))}
      </div>

      {/* Recent events list */}
      <div className="space-y-2">
        <h4 className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">{t('events.recent')}</h4>
        <div className="max-h-32 sm:max-h-48 overflow-y-auto space-y-2">
          {recentEvents.length > 0 ? (
            recentEvents.map((event, index) => (
              <div
                key={index}
                className={`flex items-center justify-between p-2 sm:p-3 rounded-lg border ${getEventColor(event.type)} dark:bg-opacity-20`}
              >
                <div className="flex items-center gap-2 sm:gap-3">
                  {getEventIcon(event.type)}
                  <div>
                    <div className="font-medium text-xs sm:text-sm">
                      {getEventLabel(event.type)}
                    </div>
                    <div className="text-xs opacity-75">
                      {formatTime(event.timestamp)}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-medium text-xs sm:text-sm">
                    {formatDuration(event.duration)}
                  </div>
                  <div className="text-xs opacity-75">
                    {Math.round(event.intensity * 100)}%
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              <Activity className="w-6 h-6 sm:w-8 sm:h-8 mx-auto mb-2 opacity-30" />
              <p className="text-xs sm:text-sm">{t('events.none')}</p>
              <p className="text-xs mt-1 hidden sm:block">{t('events.start.monitoring')}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};