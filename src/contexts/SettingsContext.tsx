import React, { createContext, useContext, useState, useEffect } from 'react';

export type Theme = 'light' | 'dark';
export type Language = 'th' | 'en';

interface SettingsContextType {
  theme: Theme;
  language: Language;
  toggleTheme: () => void;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

const translations = {
  th: {
    // Header
    'app.title': 'SANA',
    'app.subtitle': 'ระบบตรวจวัดการนอนหลับและประเมินความเสี่ยงภาวะซึมเศร้าขั้นสูง',
    'status.monitoring': 'กำลังตรวจวัด',
    'status.ready': 'ระบบพร้อม',
    
    // Navigation
    'nav.monitor': 'ตรวจวัดแบบเรียลไทม์',
    'nav.analytics': 'วิเคราะห์การนอน',
    'nav.reports': 'รายงาน',
    'nav.simulation': 'จำลองการทดสอบ',
    
    // Control Panel
    'control.title': 'แผงควบคุม',
    'control.active': 'ทำงาน',
    'control.inactive': 'หยุดทำงาน',
    'control.calibration': 'ปรับเทียบเสียงรบกวน',
    'control.baseline': 'ค่าพื้นฐาน',
    'control.calibrate': 'ปรับเทียบสภาพแวดล้อม',
    'control.recording': 'การบันทึก',
    'control.start': 'เริ่มตรวจวัดการนอน',
    'control.stop': 'หยุดการตรวจวัด',
    'control.volume': 'ระดับเสียงปัจจุบัน',
    'control.status': 'สถานะ',
    'control.calibrating': 'กำลังปรับเทียบ',
    'control.recording.status': 'กำลังบันทึก',
    'control.ready': 'พร้อม',
    
    // Event Monitor
    'events.title': 'ตรวจสอบเหตุการณ์',
    'events.realtime': 'การตรวจจับแบบเรียลไทม์',
    'events.apnea': 'หยุดหายใจ',
    'events.snoring': 'กรน',
    'events.movement': 'การเคลื่อนไหว',
    'events.stimulation': 'การกระตุ้น',
    'events.recent': 'เหตุการณ์ล่าสุด',
    'events.none': 'ยังไม่พบเหตุการณ์',
    'events.start.monitoring': 'เริ่มการตรวจวัดเพื่อดูเหตุการณ์แบบเรียลไทม์',
    
    // Sleep Metrics
    'metrics.respiratory': 'การวิเคราะห์การหายใจ',
    'metrics.snoring': 'การวิเคราะห์การกรน',
    'metrics.movement': 'การวิเคราะห์การเคลื่อนไหว',
    'metrics.sleep.quality': 'การวิเคราะห์คุณภาพการนอน',
    'metrics.respiratory.rate': 'อัตราการหายใจ',
    'metrics.variability': 'ความผันแปร',
    'metrics.sample.entropy': 'Sample Entropy',
    'metrics.ibi.count': 'จำนวน IBI',
    'metrics.snore.time': 'เวลากรน %',
    'metrics.episode.count': 'จำนวนครั้ง',
    'metrics.mean.volume': 'ระดับเสียงเฉลี่ย',
    'metrics.peak.frequency': 'ความถี่สูงสุด',
    'metrics.bursts.hour': 'การขยับ/ชั่วโมง',
    'metrics.motion.index': 'ดัชนีการเคลื่อนไหว',
    'metrics.fragmentation.index': 'ดัชนีการกระจัดกระจาย',
    'metrics.avg.interval': 'ช่วงเวลาเฉลี่ย',
    'metrics.ahi.like': 'ดัชนี AHI-like',
    'metrics.event.duration': 'ระยะเวลาเหตุการณ์ (เฉลี่ย)',
    'metrics.arousal.proxy': 'Arousal Proxy',
    'metrics.sleep.time': 'เวลานอน',
    
    // Units
    'unit.breaths.min': 'ครั้ง/นาที',
    'unit.percent': '%',
    'unit.intervals': 'ช่วง',
    'unit.events': 'เหตุการณ์',
    'unit.events.hr': 'เหตุการณ์/ชม.',
    'unit.db': 'dB',
    'unit.hz': 'Hz',
    'unit.seconds': 'วินาที',
    'unit.hours': 'ชั่วโมง',
    
    // Risk Assessment
    'risk.title': 'การประเมินความเสี่ยงภาวะซึมเศร้า',
    'risk.complete.session': 'ทำการตรวจวัดการนอนให้เสร็จสิ้นเพื่อดูการประเมินความเสี่ยง',
    'risk.low': 'ต่ำ',
    'risk.moderate': 'ปานกลาง',
    'risk.high': 'สูง',
    'risk.level': 'ระดับความเสี่ยง',
    'risk.based.on': 'จากการวิเคราะห์รูปแบบการนอน',
    'risk.sdb.severity': 'ความรุนแรง SDB',
    'risk.fragmentation': 'การกระจัดกระจาย',
    'risk.cardiorespiratory': 'หัวใจและหายใจ',
    'risk.recommendations': 'คำแนะนำ',
    'risk.disclaimer.title': 'ข้อจำกัดสำคัญ',
    'risk.disclaimer.text': 'การประเมินนี้เป็นเพียงการคัดกรองเบื้องต้นเท่านั้น และไม่ใช่การวินิจฉัยทางการแพทย์ ผลลัพธ์อิงจากการวิเคราะห์รูปแบบการนอนจากฟีเจอร์ที่มีหลักฐานทางวิทยาศาสตร์ กรุณาปรึกษาแพทย์เพื่อการประเมินที่เหมาะสมด้วยเครื่องมือประเมินสุขภาพจิตมาตรฐาน (PHQ-9, GDS) และความเชี่ยวชาญทางคลินิก',
    
    // Reports
    'reports.title': 'รายงานการนอน',
    'reports.completed.sessions': 'เซสชันที่เสร็จสิ้น',
    'reports.no.reports': 'ไม่มีรายงาน',
    'reports.complete.session': 'ทำการตรวจวัดการนอนให้เสร็จสิ้นเพื่อสร้างรายงาน',
    'reports.download': 'ดาวน์โหลด',
    'reports.back': 'กลับ',
    'reports.export.data': 'ส่งออกข้อมูล',
    'reports.view.report': 'ดูรายงาน',
    'reports.duration': 'ระยะเวลา',
    'reports.events': 'เหตุการณ์',
    'reports.risk': 'ความเสี่ยง',
    'reports.risk.score': 'คะแนนความเสี่ยง',
    
    // Simulation
    'sim.title': 'จำลองการนอน',
    'sim.running': 'กำลังทำงาน',
    'sim.stopped': 'หยุด',
    'sim.generate.session': 'สร้างเซสชัน 8 ชม.',
    'sim.clear.events': 'ล้างเหตุการณ์ทั้งหมด',
    'sim.realtime': 'จำลองแบบเรียลไทม์',
    'sim.stop': 'หยุด',
    'sim.start': 'เริ่ม',
    'sim.auto.events': 'เหตุการณ์อัตโนมัติ',
    'sim.manual.event': 'เหตุการณ์ด้วยตนเอง',
    'sim.event.types': 'ประเภทเหตุการณ์',
    'sim.intensity': 'ความรุนแรงเหตุการณ์',
    'sim.speed': 'ความเร็วจำลอง',
    'sim.presets': 'สถานการณ์ตั้งต้น',
    'sim.mild.osa': 'OSA เล็กน้อย',
    'sim.severe.osa': 'OSA รุนแรง',
    'sim.restless.sleep': 'การนอนไม่สงบ',
    'sim.normal.sleep': 'การนอนปกติ',
    'sim.instructions': 'คำแนะนำการจำลอง',
    
    // Settings
    'settings.title': 'ตั้งค่า',
    'settings.theme': 'ธีม',
    'settings.light': 'สว่าง',
    'settings.dark': 'มืด',
    'settings.language': 'ภาษา',
    'settings.thai': 'ไทย',
    'settings.english': 'อังกฤษ',
    
    // System Info
    'system.info': 'ข้อมูลระบบ SANA AI',
    'system.description': 'ระบบตรวจวัดการนอนหลับขั้นสูงนี้ใช้การประมวลผลเสียงแบบเรียลไทม์เพื่อตรวจจับรูปแบบการหายใจ เหตุการณ์การกรน และการเคลื่อนไหวของร่างกายระหว่างการนอน ระบบใช้อัลกอริทึมที่อิงหลักฐานทางวิทยาศาสตร์สำหรับการคัดกรองความเสี่ยงภาวะซึมเศร้าจากความรุนแรงของความผิดปกติของการนอน รูปแบบการกระจัดกระจายของการนอน และตัวชี้วัดระบบหัวใจและหายใจ',
    'system.features': 'คุณสมบัติระบบ: การตรวจจับเหตุการณ์ตามมาตรฐาน AASM • การปฏิบัติตามขีดจำกัดเสียงของ WHO • การให้คะแนนความเสี่ยงจากหลักฐานทางวิชาการ • การกระตุ้นแบบปิดลูปแบบเรียลไทม์ • การวิเคราะห์และรายงานที่ครอบคลุม'
  },
  en: {
    // Header
    'app.title': 'SANA AI',
    'app.subtitle': 'Advanced Sleep Monitoring & Depression Risk Analytics System',
    'status.monitoring': 'Monitoring Active',
    'status.ready': 'System Ready',
    
    // Navigation
    'nav.monitor': 'Real-time Monitor',
    'nav.analytics': 'Sleep Analytics',
    'nav.reports': 'Reports',
    'nav.simulation': 'Simulation',
    
    // Control Panel
    'control.title': 'Control Panel',
    'control.active': 'Active',
    'control.inactive': 'Inactive',
    'control.calibration': 'Noise Calibration',
    'control.baseline': 'Baseline',
    'control.calibrate': 'Calibrate Environment',
    'control.recording': 'Recording Controls',
    'control.start': 'Start Sleep Monitoring',
    'control.stop': 'Stop Monitoring',
    'control.volume': 'Current Volume',
    'control.status': 'Status',
    'control.calibrating': 'Calibrating',
    'control.recording.status': 'Recording',
    'control.ready': 'Ready',
    
    // Event Monitor
    'events.title': 'Event Monitor',
    'events.realtime': 'Real-time Detection',
    'events.apnea': 'Apnea',
    'events.snoring': 'Snoring',
    'events.movement': 'Movement',
    'events.stimulation': 'Stimulation',
    'events.recent': 'Recent Events',
    'events.none': 'No events detected yet',
    'events.start.monitoring': 'Start monitoring to see real-time events',
    
    // Sleep Metrics
    'metrics.respiratory': 'Respiratory Analysis',
    'metrics.snoring': 'Snoring Analysis',
    'metrics.movement': 'Movement Analysis',
    'metrics.sleep.quality': 'Sleep Quality Analysis',
    'metrics.respiratory.rate': 'Respiratory Rate',
    'metrics.variability': 'Variability',
    'metrics.sample.entropy': 'Sample Entropy',
    'metrics.ibi.count': 'IBI Count',
    'metrics.snore.time': 'Snore Time %',
    'metrics.episode.count': 'Episode Count',
    'metrics.mean.volume': 'Mean Volume',
    'metrics.peak.frequency': 'Peak Frequency',
    'metrics.bursts.hour': 'Bursts/Hour',
    'metrics.motion.index': 'Motion Index',
    'metrics.fragmentation.index': 'Fragmentation Index',
    'metrics.avg.interval': 'Avg Interval',
    'metrics.ahi.like': 'AHI-like Index',
    'metrics.event.duration': 'Event Duration (Mean)',
    'metrics.arousal.proxy': 'Arousal Proxy',
    'metrics.sleep.time': 'Sleep Time',
    
    // Units
    'unit.breaths.min': 'breaths/min',
    'unit.percent': '%',
    'unit.intervals': 'intervals',
    'unit.events': 'events',
    'unit.events.hr': 'events/hr',
    'unit.db': 'dB',
    'unit.hz': 'Hz',
    'unit.seconds': 'seconds',
    'unit.hours': 'hours',
    
    // Risk Assessment
    'risk.title': 'Depression Risk Assessment',
    'risk.complete.session': 'Complete a sleep session to view risk assessment',
    'risk.low': 'Low',
    'risk.moderate': 'Moderate',
    'risk.high': 'High',
    'risk.level': 'Risk',
    'risk.based.on': 'Based on sleep pattern analysis',
    'risk.sdb.severity': 'SDB Severity',
    'risk.fragmentation': 'Fragmentation',
    'risk.cardiorespiratory': 'Cardiorespiratory',
    'risk.recommendations': 'Recommendations',
    'risk.disclaimer.title': 'Important Disclaimer',
    'risk.disclaimer.text': 'This assessment is for screening purposes only and is not a medical diagnosis. The results are based on sleep pattern analysis from literature-informed features. Please consult with a healthcare professional for proper evaluation using standardized mental health assessment tools (PHQ-9, GDS) and clinical expertise.',
    
    // Reports
    'reports.title': 'Sleep Reports',
    'reports.completed.sessions': 'completed sessions',
    'reports.no.reports': 'No Reports Available',
    'reports.complete.session': 'Complete a sleep monitoring session to generate reports.',
    'reports.download': 'Download',
    'reports.back': 'Back',
    'reports.export.data': 'Export Data',
    'reports.view.report': 'View Report',
    'reports.duration': 'Duration',
    'reports.events': 'Events',
    'reports.risk': 'Risk',
    'reports.risk.score': 'Risk Score',
    
    // Simulation
    'sim.title': 'Sleep Simulation',
    'sim.running': 'Running',
    'sim.stopped': 'Stopped',
    'sim.generate.session': 'Generate 8hr Session',
    'sim.clear.events': 'Clear All Events',
    'sim.realtime': 'Real-time Simulation',
    'sim.stop': 'Stop',
    'sim.start': 'Start',
    'sim.auto.events': 'Auto Events',
    'sim.manual.event': 'Manual Event',
    'sim.event.types': 'Event Types',
    'sim.intensity': 'Event Intensity',
    'sim.speed': 'Simulation Speed',
    'sim.presets': 'Preset Scenarios',
    'sim.mild.osa': 'Mild OSA',
    'sim.severe.osa': 'Severe OSA',
    'sim.restless.sleep': 'Restless Sleep',
    'sim.normal.sleep': 'Normal Sleep',
    'sim.instructions': 'Simulation Instructions',
    
    // Settings
    'settings.title': 'Settings',
    'settings.theme': 'Theme',
    'settings.light': 'Light',
    'settings.dark': 'Dark',
    'settings.language': 'Language',
    'settings.thai': 'Thai',
    'settings.english': 'English',
    
    // System Info
    'system.info': 'SANA AI System Information',
    'system.description': 'This advanced sleep monitoring system uses real-time audio processing to detect breathing patterns, snoring events, and body movements during sleep. The system implements evidence-based algorithms for depression risk screening based on sleep disorder severity, sleep fragmentation patterns, and cardiorespiratory metrics.',
    'system.features': 'System Features: AASM-compliant event detection • WHO noise limit compliance • Literature-informed risk scoring • Real-time closed-loop stimulation • Comprehensive analytics and reporting'
  }
};

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setTheme] = useState<Theme>(() => {
    const saved = localStorage.getItem('sleepguard-theme');
    return (saved as Theme) || 'light';
  });
  
  const [language, setLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem('sleepguard-language');
    return (saved as Language) || 'en';
  });

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('sleepguard-theme', newTheme);
  };

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('sleepguard-language', lang);
  };

  const t = (key: string): string => {
    return translations[language][key] || key;
  };

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }, [theme]);

  return (
    <SettingsContext.Provider value={{ theme, language, toggleTheme, setLanguage, t }}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};