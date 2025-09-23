import React from 'react';
import { useSettings } from '../contexts/SettingsContext';
import { DepressionRiskScore } from '../types';
import { AlertTriangle, CheckCircle, XCircle, Info } from 'lucide-react';

interface DepressionRiskAssessmentProps {
  riskScore?: DepressionRiskScore;
}

export const DepressionRiskAssessment: React.FC<DepressionRiskAssessmentProps> = ({ riskScore }) => {
  const { t } = useSettings();

  if (!riskScore) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">{t('risk.title')}</h3>
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
          <Info className="w-8 h-8 mx-auto mb-2 opacity-30" />
          <p>{t('risk.complete.session')}</p>
        </div>
      </div>
    );
  }

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'Low': return 'green';
      case 'Moderate': return 'yellow';
      case 'High': return 'red';
      default: return 'gray';
    }
  };

  const getRiskIcon = (level: string) => {
    switch (level) {
      case 'Low': return <CheckCircle className="w-6 h-6" />;
      case 'Moderate': return <AlertTriangle className="w-6 h-6" />;
      case 'High': return <XCircle className="w-6 h-6" />;
      default: return <Info className="w-6 h-6" />;
    }
  };

  const getRiskLevelText = (level: string) => {
    switch (level) {
      case 'Low': return t('risk.low');
      case 'Moderate': return t('risk.moderate');
      case 'High': return t('risk.high');
      default: return level;
    }
  };
  const color = getRiskColor(riskScore.riskLevel);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">{t('risk.title')}</h3>
      
      {/* Overall Risk Score */}
      <div className={`bg-${color}-50 dark:bg-${color}-900 border border-${color}-200 dark:border-${color}-700 rounded-lg p-6 mb-6`}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className={`text-${color}-600 dark:text-${color}-400`}>
              {getRiskIcon(riskScore.riskLevel)}
            </div>
            <div>
              <h4 className={`text-xl font-bold text-${color}-700 dark:text-${color}-300`}>
                {t('risk.level')}: {getRiskLevelText(riskScore.riskLevel)}
              </h4>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                {t('risk.based.on')}
              </p>
            </div>
          </div>
          <div className="text-right">
            <div className={`text-3xl font-bold text-${color}-700 dark:text-${color}-300`}>
              {riskScore.overall}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-300">/ 100</div>
          </div>
        </div>
        
        {/* Score breakdown */}
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center">
            <div className={`text-lg font-semibold text-${color}-700 dark:text-${color}-300`}>
              {riskScore.sdbSeverity}
            </div>
            <div className="text-xs text-gray-600 dark:text-gray-300">{t('risk.sdb.severity')}</div>
          </div>
          <div className="text-center">
            <div className={`text-lg font-semibold text-${color}-700 dark:text-${color}-300`}>
              {riskScore.sleepFragmentation}
            </div>
            <div className="text-xs text-gray-600 dark:text-gray-300">{t('risk.fragmentation')}</div>
          </div>
          <div className="text-center">
            <div className={`text-lg font-semibold text-${color}-700 dark:text-${color}-300`}>
              {riskScore.cardiorespiratory}
            </div>
            <div className="text-xs text-gray-600 dark:text-gray-300">{t('risk.cardiorespiratory')}</div>
          </div>
        </div>
      </div>

      {/* Recommendations */}
      <div className="space-y-4">
        <h4 className="text-md font-semibold text-gray-900 dark:text-white">{t('risk.recommendations')}</h4>
        <div className="space-y-2">
          {riskScore.recommendations.map((recommendation, index) => (
            <div key={index} className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-800 text-blue-600 dark:text-blue-300 flex items-center justify-center text-sm font-medium mt-0.5">
                {index + 1}
              </div>
              <p className="text-sm text-gray-700 dark:text-gray-300 flex-1">
                {recommendation}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Disclaimer */}
      <div className="mt-6 p-4 bg-amber-50 dark:bg-amber-900 border border-amber-200 dark:border-amber-700 rounded-lg">
        <div className="flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-amber-800 dark:text-amber-200">
            <p className="font-medium mb-1">{t('risk.disclaimer.title')}</p>
            <p>
              {t('risk.disclaimer.text')}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};