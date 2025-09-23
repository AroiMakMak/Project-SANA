import { 
  SleepEvent, 
  SleepSession, 
  RespiratoryMetrics, 
  SnoringMetrics, 
  MovementMetrics, 
  SleepQualityMetrics,
  DepressionRiskScore 
} from '../types';

export const calculateRespiratoryMetrics = (events: SleepEvent[], duration: number): RespiratoryMetrics => {
  const breathingEvents = events.filter(e => e.type !== 'stimulation');
  const intervals = [];
  
  for (let i = 1; i < breathingEvents.length; i++) {
    intervals.push(breathingEvents[i].timestamp - breathingEvents[i-1].timestamp);
  }
  
  const meanInterval = intervals.length ? intervals.reduce((a, b) => a + b, 0) / intervals.length : 60000;
  const respiratoryRate = intervals.length ? (60000 / meanInterval) * (duration / 60000) : 15;
  
  const variance = intervals.length ? 
    intervals.reduce((sum, interval) => sum + Math.pow(interval - meanInterval, 2), 0) / intervals.length : 0;
  const respiratoryVariability = Math.sqrt(variance) / meanInterval;

  // Sample entropy calculation (simplified)
  const sampleEntropy = intervals.length > 10 ? 
    Math.log(intervals.length) * (respiratoryVariability + 0.1) : 0.5;

  return {
    respiratoryRate,
    respiratoryVariability,
    interBreathInterval: intervals,
    sampleEntropy,
  };
};

export const calculateSnoringMetrics = (events: SleepEvent[], duration: number): SnoringMetrics => {
  const snoreEvents = events.filter(e => e.type === 'snoring');
  const totalSnoreTime = snoreEvents.reduce((sum, event) => sum + event.duration, 0);
  const snoreTimePercentage = (totalSnoreTime / duration) * 100;
  
  const decibels = snoreEvents.map(e => e.intensity * 80 + 20); // Convert intensity to dB
  const frequencies = snoreEvents.map(e => e.frequency || 200);
  
  const meanDecibel = decibels.length ? decibels.reduce((a, b) => a + b, 0) / decibels.length : 0;
  const peakDecibel = decibels.length ? Math.max(...decibels) : 0;
  const peakFrequency = frequencies.length ? Math.max(...frequencies) : 0;
  
  // Spectral entropy (simplified calculation)
  const spectralEntropy = frequencies.length ? 
    Math.log(new Set(frequencies.map(f => Math.round(f / 10))).size) : 0;

  return {
    snoreTimePercentage,
    episodeCount: snoreEvents.length,
    meanDecibel,
    peakDecibel,
    peakFrequency,
    spectralEntropy,
  };
};

export const calculateMovementMetrics = (events: SleepEvent[], duration: number): MovementMetrics => {
  const movementEvents = events.filter(e => e.type === 'movement');
  const durationHours = duration / (1000 * 60 * 60);
  const burstCountPerHour = movementEvents.length / durationHours;
  
  const motionIndex = movementEvents.reduce((sum, event) => sum + event.intensity, 0) / movementEvents.length || 0;
  
  // Calculate fragmentation index (average interval between movements)
  const intervals = [];
  for (let i = 1; i < movementEvents.length; i++) {
    intervals.push(movementEvents[i].timestamp - movementEvents[i-1].timestamp);
  }
  
  const averageBurstInterval = intervals.length ? intervals.reduce((a, b) => a + b, 0) / intervals.length : 0;
  const fragmentationIndex = averageBurstInterval > 0 ? (duration / averageBurstInterval) : 0;

  return {
    burstCountPerHour,
    motionIndex,
    fragmentationIndex,
    averageBurstInterval,
  };
};

export const calculateSleepQualityMetrics = (events: SleepEvent[], duration: number): SleepQualityMetrics => {
  const apneaEvents = events.filter(e => e.type === 'apnea');
  const allEvents = events.filter(e => e.type !== 'stimulation');
  
  const durationHours = duration / (1000 * 60 * 60);
  const ahiLike = apneaEvents.length / durationHours;
  
  const eventDurations = allEvents.map(e => e.duration);
  const eventDurationMean = eventDurations.length ? eventDurations.reduce((a, b) => a + b, 0) / eventDurations.length : 0;
  
  eventDurations.sort((a, b) => a - b);
  const eventDurationMedian = eventDurations.length ? 
    eventDurations[Math.floor(eventDurations.length / 2)] : 0;
  
  // Arousal proxy: movements within 15 seconds after other events
  let arousalProxyCount = 0;
  const nonMovementEvents = events.filter(e => e.type !== 'movement' && e.type !== 'stimulation');
  const movementEvents = events.filter(e => e.type === 'movement');
  
  nonMovementEvents.forEach(event => {
    const hasSubsequentMovement = movementEvents.some(movement => 
      movement.timestamp > event.timestamp && 
      movement.timestamp - event.timestamp <= 15000
    );
    if (hasSubsequentMovement) arousalProxyCount++;
  });

  return {
    ahiLike,
    eventDurationMean,
    eventDurationMedian,
    arousalProxyCount,
    totalSleepTime: duration,
  };
};

export const calculateDepressionRiskScore = (
  respiratory: RespiratoryMetrics,
  snoring: SnoringMetrics,
  movement: MovementMetrics,
  sleepQuality: SleepQualityMetrics
): DepressionRiskScore => {
  // SDB Severity Block (40% weight)
  const sdbScore = Math.min(100, 
    (sleepQuality.ahiLike * 2) + 
    (snoring.snoreTimePercentage * 0.8) + 
    (snoring.peakDecibel * 0.5)
  );
  
  // Sleep Fragmentation Block (30% weight)
  const fragmentationScore = Math.min(100,
    (movement.burstCountPerHour * 8) +
    (movement.fragmentationIndex * 0.2) +
    (sleepQuality.arousalProxyCount * 5)
  );
  
  // Cardiorespiratory Block (30% weight) - simplified without HRV
  const cardioScore = Math.min(100,
    (respiratory.respiratoryVariability * 200) +
    (respiratory.sampleEntropy * 40) +
    ((respiratory.respiratoryRate < 12 || respiratory.respiratoryRate > 20) ? 30 : 0)
  );
  
  // Combined score with weights
  const overallScore = Math.round(
    (sdbScore * 0.4) + 
    (fragmentationScore * 0.3) + 
    (cardioScore * 0.3)
  );
  
  let riskLevel: 'Low' | 'Moderate' | 'High';
  let recommendations: string[] = [];
  
  if (overallScore < 40) {
    riskLevel = 'Low';
    recommendations = [
      'แนะนำให้รักษาระเบียบการนอนที่ดี',
      'ออกกำลังกายสม่ำเสมอเพื่อสุขภาพการนอนที่ดี',
      'หลีกเลี่ยงแอลกอฮอล์และคาเฟอีนก่อนนอน'
    ];
  } else if (overallScore < 70) {
    riskLevel = 'Moderate';
    recommendations = [
      'แนะนำให้ปรึกษาแพทย์เพื่อการประเมินเพิ่มเติม',
      'พิจารณาทำแบบประเมิน PHQ-9 หรือ GDS',
      'ควรปรับปรุงสภาพแวดล้อมการนอน',
      'เฝ้าระวังอาการซึมเศร้าและความเครียด'
    ];
  } else {
    riskLevel = 'High';
    recommendations = [
      'แนะนำให้พบแพทย์โดยเร็วที่สุดเพื่อการประเมินครอบคลุม',
      'อาจจำเป็นต้องตรวจสอบความผิดปกติของการนอนหลับ',
      'ควรทำแบบประเมินสุขภาพจิต PHQ-9 หรือ GDS',
      'พิจารณาปรึกษาจิตแพทย์หรือแพทย์ผู้เชี่ยวชาญ',
      'เฝ้าระวังอาการซึมเศร้าและความคิดทำร้ายตนเองอย่างใกล้ชิด'
    ];
  }

  return {
    overall: overallScore,
    sdbSeverity: Math.round(sdbScore),
    sleepFragmentation: Math.round(fragmentationScore),
    cardiorespiratory: Math.round(cardioScore),
    riskLevel,
    recommendations,
  };
};

export const generateSleepReport = (session: SleepSession): string => {
  if (!session.metrics || !session.riskScore) return 'ไม่สามารถสร้างรายงานได้';
  
  const duration = (session.endTime! - session.startTime) / (1000 * 60 * 60);
  
  return `
รายงานการนอนหลับและการประเมินความเสี่ยงภาวะซึมเศร้า

ระยะเวลาการตรวจวัด: ${duration.toFixed(1)} ชั่วโมง
เวลาเริ่ม: ${new Date(session.startTime).toLocaleString('th-TH')}
เวลาสิ้นสุด: ${new Date(session.endTime!).toLocaleString('th-TH')}

ตัวชี้วัดการหายใจ:
- อัตราการหายใจเฉลี่ย: ${session.metrics.respiratory.respiratoryRate.toFixed(1)} ครั้ง/นาที
- ความผันแปรของการหายใจ: ${(session.metrics.respiratory.respiratoryVariability * 100).toFixed(1)}%

ตัวชี้วัดการกรน:
- เวลากรนต่อชั่วโมง: ${session.metrics.snoring.snoreTimePercentage.toFixed(1)}%
- จำนวนครั้งที่กรน: ${session.metrics.snoring.episodeCount} ครั้ง
- ระดับเสียงเฉลี่ย: ${session.metrics.snoring.meanDecibel.toFixed(1)} dB

ตัวชี้วัดการเคลื่อนไหว:
- การขยับตัวต่อชั่วโมง: ${session.metrics.movement.burstCountPerHour.toFixed(1)} ครั้ง
- ดัชนีการกระจัดกระจาย: ${session.metrics.movement.fragmentationIndex.toFixed(2)}

คะแนนความเสี่ยงภาวะซึมเศร้า:
- คะแนนรวม: ${session.riskScore.overall}/100
- ระดับความเสี่ยง: ${session.riskScore.riskLevel}
- ความรุนแรงของ SDB: ${session.riskScore.sdbSeverity}/100
- การกระจัดกระจายของการนอน: ${session.riskScore.sleepFragmentation}/100
- ระบบหัวใจและหายใจ: ${session.riskScore.cardiorespiratory}/100

คำแนะนำ:
${session.riskScore.recommendations.map((rec, index) => `${index + 1}. ${rec}`).join('\n')}

ข้อจำกัด: การประเมินนี้เป็นเพียงการคัดกรองเบื้องต้นเท่านั้น ไม่ใช่การวินิจฉัยทางการแพทย์
สำหรับการวินิจฉัยที่แม่นยำ กรุณาปรึกษาแพทย์ผู้เชี่ยวชาญ
  `.trim();
};