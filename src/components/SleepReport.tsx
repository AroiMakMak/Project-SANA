import React, { useState } from 'react';
import { useSettings } from '../contexts/SettingsContext';
import { SleepSession } from '../types';
import { generateSleepReport } from '../utils/sleepAnalytics';
import { Download, FileText, Share, Calendar } from 'lucide-react';

interface SleepReportProps {
  sessions: SleepSession[];
}

export const SleepReport: React.FC<SleepReportProps> = ({ sessions }) => {
  const { t } = useSettings();
  const [selectedSession, setSelectedSession] = useState<SleepSession | null>(null);
  const [showReport, setShowReport] = useState(false);

  const completedSessions = sessions.filter(s => s.endTime && s.metrics && s.riskScore);

  const handleGenerateReport = (session: SleepSession) => {
    setSelectedSession(session);
    setShowReport(true);
  };

  const handleDownload = () => {
    if (!selectedSession) return;
    
    const report = generateSleepReport(selectedSession);
    const blob = new Blob([report], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `sleep-report-${new Date(selectedSession.startTime).toISOString().split('T')[0]}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleExportData = (session: SleepSession) => {
    const data = {
      session: {
        id: session.id,
        startTime: session.startTime,
        endTime: session.endTime,
        duration: session.endTime! - session.startTime,
      },
      events: session.events,
      metrics: session.metrics,
      riskScore: session.riskScore,
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `sleep-data-${new Date(session.startTime).toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (showReport && selectedSession) {
    const report = generateSleepReport(selectedSession);
    
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{t('reports.title')}</h3>
          <div className="flex items-center gap-2">
            <button
              onClick={handleDownload}
              className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Download className="w-4 h-4" />
              {t('reports.download')}
            </button>
            <button
              onClick={() => setShowReport(false)}
              className="flex items-center gap-2 px-3 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              {t('reports.back')}
            </button>
          </div>
        </div>
        
        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 font-mono text-sm whitespace-pre-line overflow-auto max-h-96 text-gray-900 dark:text-gray-100">
          {report}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{t('reports.title')}</h3>
        <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
          <Calendar className="w-4 h-4" />
          {completedSessions.length} {t('reports.completed.sessions')}
        </div>
      </div>

      {completedSessions.length === 0 ? (
        <div className="text-center py-12 text-gray-500 dark:text-gray-400">
          <FileText className="w-12 h-12 mx-auto mb-4 opacity-30" />
          <h4 className="text-lg font-medium mb-2">{t('reports.no.reports')}</h4>
          <p className="text-sm">{t('reports.complete.session')}</p>
        </div>
      ) : (
        <div className="space-y-4">
          {completedSessions.map((session) => {
            const duration = (session.endTime! - session.startTime) / (1000 * 60 * 60);
            const startDate = new Date(session.startTime);
            
            return (
              <div key={session.id} className="border border-gray-200 dark:border-gray-600 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white">
                      {t('reports.title')} - {startDate.toLocaleDateString('th-TH')}
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      {t('reports.duration')}: {duration.toFixed(1)} {t('unit.hours')} | 
                      {t('reports.events')}: {session.events.length} | 
                      {t('reports.risk')}: {session.riskScore?.riskLevel === 'Low' ? t('risk.low') : 
                                          session.riskScore?.riskLevel === 'Moderate' ? t('risk.moderate') : 
                                          session.riskScore?.riskLevel === 'High' ? t('risk.high') : 
                                          session.riskScore?.riskLevel}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleExportData(session)}
                      className="flex items-center gap-2 px-3 py-2 bg-gray-100 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-500 transition-colors"
                    >
                      <Share className="w-4 h-4" />
                      {t('reports.export.data')}
                    </button>
                    <button
                      onClick={() => handleGenerateReport(session)}
                      className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      <FileText className="w-4 h-4" />
                      {t('reports.view.report')}
                    </button>
                  </div>
                </div>
                
                {/* Quick stats */}
                <div className="grid grid-cols-4 gap-4 text-sm">
                  <div className="text-center p-2 bg-blue-50 dark:bg-blue-900 rounded">
                    <div className="font-semibold text-blue-700 dark:text-blue-300">
                      {session.metrics?.sleepQuality.ahiLike.toFixed(1)}
                    </div>
                    <div className="text-blue-600 dark:text-blue-400">AHI-like</div>
                  </div>
                  <div className="text-center p-2 bg-yellow-50 dark:bg-yellow-900 rounded">
                    <div className="font-semibold text-yellow-700 dark:text-yellow-300">
                      {session.metrics?.snoring.snoreTimePercentage.toFixed(1)}%
                    </div>
                    <div className="text-yellow-600 dark:text-yellow-400">{t('metrics.snore.time')}</div>
                  </div>
                  <div className="text-center p-2 bg-green-50 dark:bg-green-900 rounded">
                    <div className="font-semibold text-green-700 dark:text-green-300">
                      {session.metrics?.movement.burstCountPerHour.toFixed(1)}
                    </div>
                    <div className="text-green-600 dark:text-green-400">{t('metrics.bursts.hour')}</div>
                  </div>
                  <div className={`text-center p-2 rounded ${
                    session.riskScore?.riskLevel === 'Low' ? 'bg-green-50 dark:bg-green-900' :
                    session.riskScore?.riskLevel === 'Moderate' ? 'bg-yellow-50 dark:bg-yellow-900' :
                    'bg-red-50 dark:bg-red-900'
                  }`}>
                    <div className={`font-semibold ${
                      session.riskScore?.riskLevel === 'Low' ? 'text-green-700 dark:text-green-300' :
                      session.riskScore?.riskLevel === 'Moderate' ? 'text-yellow-700 dark:text-yellow-300' :
                      'text-red-700 dark:text-red-300'
                    }`}>
                      {session.riskScore?.overall}
                    </div>
                    <div className={`${
                      session.riskScore?.riskLevel === 'Low' ? 'text-green-600 dark:text-green-400' :
                      session.riskScore?.riskLevel === 'Moderate' ? 'text-yellow-600 dark:text-yellow-400' :
                      'text-red-600 dark:text-red-400'
                    }`}>
                      {t('reports.risk.score')}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};