import React from 'react';
import { useSettings } from '../contexts/SettingsContext';
import { RespiratoryMetrics, SnoringMetrics, MovementMetrics, SleepQualityMetrics } from '../types';
import { Sun as Lung, Volume2, Activity, Moon } from 'lucide-react';

interface SleepMetricsDashboardProps {
  respiratory?: RespiratoryMetrics;
  snoring?: SnoringMetrics;
  movement?: MovementMetrics;
  sleepQuality?: SleepQualityMetrics;
}

export const SleepMetricsDashboard: React.FC<SleepMetricsDashboardProps> = ({
  respiratory,
  snoring,
  movement,
  sleepQuality,
}) => {
  const { t } = useSettings();

  const MetricCard: React.FC<{
    title: string;
    icon: React.ReactNode;
    metrics: Array<{ label: string; value: string; unit?: string; status?: 'normal' | 'warning' | 'alert' }>;
    color: string;
  }> = ({ title, icon, metrics, color }) => (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 sm:p-6">
      <div className={`flex items-center gap-3 mb-4 text-${color}-600`}>
        {icon}
        <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">{title}</h3>
      </div>
      <div className="space-y-3">
        {metrics.map((metric, index) => (
          <div key={index} className="flex items-center justify-between">
            <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 flex-1 pr-2">{metric.label}</span>
            <div className="flex items-center gap-2">
              <span className={`font-medium text-xs sm:text-sm ${
                metric.status === 'alert' ? 'text-red-600' :
                metric.status === 'warning' ? 'text-yellow-600' :
                'text-gray-900 dark:text-white'
              }`}>
                {metric.value}
              </span>
              {metric.unit && (
                <span className="text-xs text-gray-500 dark:text-gray-400 hidden sm:inline">{metric.unit}</span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
      {/* Respiratory Metrics */}
      <MetricCard
        title={t('metrics.respiratory')}
        icon={<Lung className="w-5 h-5" />}
        color="blue"
        metrics={[
          {
            label: t('metrics.respiratory.rate'),
            value: respiratory ? respiratory.respiratoryRate.toFixed(1) : '--',
            unit: t('unit.breaths.min'),
            status: respiratory && (respiratory.respiratoryRate < 12 || respiratory.respiratoryRate > 20) ? 'warning' : 'normal'
          },
          {
            label: t('metrics.variability'),
            value: respiratory ? (respiratory.respiratoryVariability * 100).toFixed(1) : '--',
            unit: t('unit.percent'),
            status: respiratory && respiratory.respiratoryVariability > 0.3 ? 'warning' : 'normal'
          },
          {
            label: t('metrics.sample.entropy'),
            value: respiratory ? respiratory.sampleEntropy.toFixed(2) : '--',
            status: respiratory && respiratory.sampleEntropy > 1.5 ? 'warning' : 'normal'
          },
          {
            label: t('metrics.ibi.count'),
            value: respiratory ? respiratory.interBreathInterval.length.toString() : '--',
            unit: t('unit.intervals')
          },
        ]}
      />

      {/* Snoring Metrics */}
      <MetricCard
        title={t('metrics.snoring')}
        icon={<Volume2 className="w-5 h-5" />}
        color="yellow"
        metrics={[
          {
            label: t('metrics.snore.time'),
            value: snoring ? snoring.snoreTimePercentage.toFixed(1) : '--',
            unit: t('unit.percent'),
            status: snoring && snoring.snoreTimePercentage > 20 ? 'warning' : 'normal'
          },
          {
            label: t('metrics.episode.count'),
            value: snoring ? snoring.episodeCount.toString() : '--',
            unit: t('unit.events')
          },
          {
            label: t('metrics.mean.volume'),
            value: snoring ? snoring.meanDecibel.toFixed(1) : '--',
            unit: t('unit.db'),
            status: snoring && snoring.meanDecibel > 50 ? 'warning' : 'normal'
          },
          {
            label: t('metrics.peak.frequency'),
            value: snoring ? Math.round(snoring.peakFrequency).toString() : '--',
            unit: t('unit.hz')
          },
        ]}
      />

      {/* Movement Metrics */}
      <MetricCard
        title={t('metrics.movement')}
        icon={<Activity className="w-5 h-5" />}
        color="green"
        metrics={[
          {
            label: t('metrics.bursts.hour'),
            value: movement ? movement.burstCountPerHour.toFixed(1) : '--',
            unit: t('unit.events.hr'),
            status: movement && movement.burstCountPerHour > 15 ? 'warning' : 'normal'
          },
          {
            label: t('metrics.motion.index'),
            value: movement ? movement.motionIndex.toFixed(2) : '--',
            status: movement && movement.motionIndex > 0.7 ? 'warning' : 'normal'
          },
          {
            label: t('metrics.fragmentation.index'),
            value: movement ? movement.fragmentationIndex.toFixed(2) : '--',
            status: movement && movement.fragmentationIndex > 50 ? 'warning' : 'normal'
          },
          {
            label: t('metrics.avg.interval'),
            value: movement ? Math.round(movement.averageBurstInterval / 1000).toString() : '--',
            unit: t('unit.seconds')
          },
        ]}
      />

      {/* Sleep Quality Metrics */}
      <MetricCard
        title={t('metrics.sleep.quality')}
        icon={<Moon className="w-5 h-5" />}
        color="purple"
        metrics={[
          {
            label: t('metrics.ahi.like'),
            value: sleepQuality ? sleepQuality.ahiLike.toFixed(1) : '--',
            unit: t('unit.events.hr'),
            status: sleepQuality && sleepQuality.ahiLike > 15 ? 'alert' : 
                   sleepQuality && sleepQuality.ahiLike > 5 ? 'warning' : 'normal'
          },
          {
            label: t('metrics.event.duration'),
            value: sleepQuality ? (sleepQuality.eventDurationMean / 1000).toFixed(1) : '--',
            unit: t('unit.seconds')
          },
          {
            label: t('metrics.arousal.proxy'),
            value: sleepQuality ? sleepQuality.arousalProxyCount.toString() : '--',
            unit: t('unit.events'),
            status: sleepQuality && sleepQuality.arousalProxyCount > 10 ? 'warning' : 'normal'
          },
          {
            label: t('metrics.sleep.time'),
            value: sleepQuality ? (sleepQuality.totalSleepTime / (1000 * 60 * 60)).toFixed(1) : '--',
            unit: t('unit.hours')
          },
        ]}
      />
    </div>
  );
};