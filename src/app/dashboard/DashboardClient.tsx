"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { formatShamsiDate, getWeekDayNumber } from '@/lib/calendar';
import { dailyPrayers, dailyEvents } from '@/lib/prayers';

type PrayerTimes = Record<string, string>;

export default function DashboardClient({ userName }: { userName?: string }) {
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    try {
      const saved = window.localStorage.getItem('isDarkMode');
      return saved ? JSON.parse(saved) : false;
    } catch {
      return false;
    }
  });
  const [prayerTimes, setPrayerTimes] = useState<PrayerTimes | null>(null);
  const today = useMemo(() => new Date(), []);
  const weekDayNum = useMemo(() => getWeekDayNumber(today), [today]);
  const currentDate = useMemo(() => formatShamsiDate(today), [today]);
  const todayPrayer = dailyPrayers[weekDayNum as keyof typeof dailyPrayers] ?? null;
  const todayEvents = dailyEvents[weekDayNum as keyof typeof dailyEvents] ?? [];

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const response = await fetch('/api/prayer-times');
        const data = await response.json();
        if (!cancelled && data.ok) {
          setPrayerTimes(data.prayerTimes);
        }
      } catch (error) {
        console.error('خطا:', error);
      }
    };
    void load();
    return () => {
      cancelled = true;
    };
  }, []);

  const toggleDarkMode = () => {
    const newMode = !isDarkMode;
    setIsDarkMode(newMode);
    if (typeof window !== 'undefined') {
      try {
        window.localStorage.setItem('isDarkMode', JSON.stringify(newMode));
      } catch {
        // ignore
      }
    }
  };

  const bgColor = isDarkMode ? '#1a1a1a' : '#ffffff';
  const textColor = isDarkMode ? '#ffffff' : '#000000';
  const cardBg = isDarkMode ? '#2a2a2a' : '#f9fafb';
  const borderColor = isDarkMode ? '#333' : '#e5e7eb';
  const accentColor = isDarkMode ? '#4ade80' : 'rgb(22, 163, 74)';

  return (
    <div style={{ minHeight: '100vh', backgroundColor: bgColor, color: textColor, padding: '16px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', paddingBottom: '16px', borderBottom: `1px solid ${borderColor}` }}>
        <div>
          <div style={{ fontSize: '20px', color: accentColor, fontWeight: 700 }}>مسجد</div>
          {userName && <div style={{ fontSize: 14, color: borderColor, marginTop: 4 }}>سلام، {userName}</div>}
        </div>
        <button onClick={toggleDarkMode} style={{ backgroundColor: isDarkMode ? '#333' : '#f0f0f0', color: isDarkMode ? '#fbbf24' : '#000', border: 'none', padding: '8px 12px', borderRadius: '8px', cursor: 'pointer', fontSize: '20px' }}>
          {isDarkMode ? 'روز' : 'شب'}
        </button>
      </div>

      <div style={{ backgroundColor: cardBg, padding: '20px', borderRadius: '12px', marginBottom: '20px', border: `1px solid ${borderColor}` }}>
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <div style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '8px', color: accentColor }}>{currentDate}</div>
          {todayEvents.map((event, idx) => (
            <div key={idx} style={{ backgroundColor: isDarkMode ? '#333' : '#e8f5e9', padding: '8px 12px', borderRadius: '6px', marginBottom: '8px', fontSize: '14px' }}>
              • {event}
            </div>
          ))}
        </div>

        {prayerTimes && (
          <div style={{ marginTop: '24px' }}>
            <div style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '12px', color: accentColor }}>اوقات شرعی مشهد</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '12px' }}>
              {Object.entries(prayerTimes).map(([key, time]) => {
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
                  <div key={key} style={{ backgroundColor: isDarkMode ? '#333' : '#e3f2fd', padding: '12px', borderRadius: '8px', border: `1px solid ${isDarkMode ? '#444' : '#bbdefb'}` }}>
                    <div style={{ fontSize: '12px', color: isDarkMode ? '#aaa' : '#666', marginBottom: '6px' }}>{labels[key]}</div>
                    <div style={{ fontSize: '20px', fontWeight: 'bold', color: accentColor }}>{time}</div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {todayPrayer && (
          <div style={{ marginTop: '24px' }}>
            <div style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '12px', color: accentColor }}>{todayPrayer.prayer}</div>
            <div style={{ backgroundColor: isDarkMode ? '#333' : '#fff3e0', padding: '16px', borderRadius: '8px', lineHeight: '1.8', textAlign: 'right', border: `1px solid ${isDarkMode ? '#444' : '#ffe0b2'}` }}>
              {todayPrayer.text}
            </div>
          </div>
        )}

        <div style={{ display: 'flex', gap: '12px', marginTop: '20px' }}>
          <a href="/start" style={{ flex: 1, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', padding: '12px 16px', backgroundColor: accentColor, color: 'white', border: 'none', borderRadius: '8px', textDecoration: 'none', fontWeight: 'bold' }}>مهمان</a>
          <a href="/auth/register" style={{ flex: 1, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', padding: '12px 16px', backgroundColor: accentColor, color: 'white', border: 'none', borderRadius: '8px', textDecoration: 'none', fontWeight: 'bold' }}>ثبت‌نام</a>
          <a href="/auth/login" style={{ flex: 1, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', padding: '12px 16px', backgroundColor: accentColor, color: 'white', border: 'none', borderRadius: '8px', textDecoration: 'none', fontWeight: 'bold' }}>ورود</a>
        </div>
      </div>
    </div>
  );
}
