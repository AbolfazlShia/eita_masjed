'use client';

import React, { useState, useEffect } from 'react';
import { formatShamsiDate, getWeekDayNumber } from '@/lib/calendar';
import { dailyPrayers, dailyEvents } from '@/lib/prayers';

export default function Dashboard() {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [currentDate, setCurrentDate] = useState<string>('');
  const [prayerTimes, setPrayerTimes] = useState<any>(null);
  const [todayPrayer, setTodayPrayer] = useState<any>(null);
  const [todayEvents, setTodayEvents] = useState<string[]>([]);

  useEffect(() => {
    const today = new Date();
    setCurrentDate(formatShamsiDate(today));

    const weekDayNum = getWeekDayNumber(today);
    setTodayPrayer(dailyPrayers[weekDayNum as keyof typeof dailyPrayers]);
    setTodayEvents(dailyEvents[weekDayNum as keyof typeof dailyEvents]);

    fetchPrayerTimes();

    const savedMode = localStorage.getItem('isDarkMode');
    if (savedMode) setIsDarkMode(JSON.parse(savedMode));
  }, []);

  const fetchPrayerTimes = async () => {
    try {
      const response = await fetch('/api/prayer-times');
      const data = await response.json();
      if (data.ok) {
        setPrayerTimes(data.prayerTimes);
      }
    } catch (error) {
      console.error('خطا:', error);
    }
  };

  const toggleDarkMode = () => {
    const newMode = !isDarkMode;
    setIsDarkMode(newMode);
    localStorage.setItem('isDarkMode', JSON.stringify(newMode));
  };

  const bgColor = isDarkMode ? '#1a1a1a' : '#ffffff';
  const textColor = isDarkMode ? '#ffffff' : '#000000';
  const cardBg = isDarkMode ? '#2a2a2a' : '#f9fafb';
  const borderColor = isDarkMode ? '#333' : '#e5e7eb';
  const accentColor = isDarkMode ? '#4ade80' : 'rgb(22, 163, 74)';

  return (
    <div style={{ minHeight: '100vh', backgroundColor: bgColor, color: textColor, padding: '16px' } as React.CSSProperties}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', paddingBottom: '16px', borderBottom: `1px solid ${borderColor}` } as React.CSSProperties}>
        <h1 style={{ fontSize: '28px', fontWeight: 'bold', color: accentColor } as React.CSSProperties}>🕌 مسجد</h1>
        <button onClick={toggleDarkMode} style={{ backgroundColor: isDarkMode ? '#333' : '#f0f0f0', color: isDarkMode ? '#fbbf24' : '#000', border: 'none', padding: '8px 12px', borderRadius: '8px', cursor: 'pointer', fontSize: '20px' } as React.CSSProperties}>
          {isDarkMode ? '☀️' : '🌙'}
        </button>
      </div>

      <div style={{ backgroundColor: cardBg, padding: '20px', borderRadius: '12px', marginBottom: '20px', border: `1px solid ${borderColor}` } as React.CSSProperties}>
        <div style={{ textAlign: 'center', marginBottom: '24px' } as React.CSSProperties}>
          <div style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '8px', color: accentColor } as React.CSSProperties}>{currentDate}</div>
          {todayEvents.map((event, idx) => (
            <div key={idx} style={{ backgroundColor: isDarkMode ? '#333' : '#e8f5e9', padding: '8px 12px', borderRadius: '6px', marginBottom: '8px', fontSize: '14px' } as React.CSSProperties}>
              ✨ {event}
            </div>
          ))}
        </div>

        {prayerTimes && (
          <div style={{ marginTop: '24px' } as React.CSSProperties}>
            <div style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '12px', color: accentColor } as React.CSSProperties}>⏰ اوقات شرعی مشهد</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '12px' } as React.CSSProperties}>
              {Object.entries(prayerTimes).map(([key, time]: [string, any]) => {
                const labels: { [key: string]: string } = {
                  fajr: 'اذان صبح',
                  sunrise: 'طلوع آفتاب',
                  zuhr: 'اذان ظهر',
                  asr: 'عصر',
                  sunset: 'غروب',
                  maghrib: 'اذان مغرب',
                  isha: 'عشاء',
                  midnight: 'نیمه شب',
                };
                return (
                  <div key={key} style={{ backgroundColor: isDarkMode ? '#333' : '#e3f2fd', padding: '12px', borderRadius: '8px', border: `1px solid ${isDarkMode ? '#444' : '#bbdefb'}` } as React.CSSProperties}>
                    <div style={{ fontSize: '12px', color: isDarkMode ? '#aaa' : '#666', marginBottom: '6px' } as React.CSSProperties}>{labels[key]}</div>
                    <div style={{ fontSize: '20px', fontWeight: 'bold', color: accentColor } as React.CSSProperties}>{time}</div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {todayPrayer && (
          <div style={{ marginTop: '24px' } as React.CSSProperties}>
            <div style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '12px', color: accentColor } as React.CSSProperties}>📿 {todayPrayer.prayer}</div>
            <div style={{ backgroundColor: isDarkMode ? '#333' : '#fff3e0', padding: '16px', borderRadius: '8px', lineHeight: '1.8', textAlign: 'right', border: `1px solid ${isDarkMode ? '#444' : '#ffe0b2'}` } as React.CSSProperties}>
              {todayPrayer.text}
            </div>
          </div>
        )}

        <div style={{ display: 'flex', gap: '12px', marginTop: '20px' } as React.CSSProperties}>
          <button style={{ flex: 1, padding: '12px 16px', backgroundColor: accentColor, color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' } as React.CSSProperties}>
            👤 مهمان
          </button>
          <button style={{ flex: 1, padding: '12px 16px', backgroundColor: accentColor, color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' } as React.CSSProperties}>
            📝 ثبت‌نام
          </button>
          <button style={{ flex: 1, padding: '12px 16px', backgroundColor: accentColor, color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' } as React.CSSProperties}>
            🔓 ورود
          </button>
        </div>
      </div>
    </div>
  );
}
