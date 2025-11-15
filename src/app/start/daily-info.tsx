'use client';

import { useState, useEffect } from 'react';
import { formatShamsiDate } from '@/lib/shamsi-events';

interface PrayerTimes {
  fajr: string;
  sunrise: string;
  zuhr: string;
  asr: string;
  sunset: string;
  maghrib: string;
  isha: string;
  midnight: string;
}

interface TodayData {
  date: string;
  shamsiDate: string;
  city: string;
  prayerTimes: PrayerTimes;
  events: string[];
}

export default function DailyInfo() {
  const [data, setData] = useState<TodayData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted) {
      fetchTodayData();
    }
  }, [mounted]);

  const fetchTodayData = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/prayer-times');
      if (!response.ok) throw new Error('Failed to fetch data');
      const result = await response.json();
      if (result.ok) {
        setData(result);
        setError(null);
      } else {
        throw new Error(result.error || 'Unknown error');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      setData(null);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(to bottom right, rgb(34, 197, 94), rgb(250, 204, 21))',
      }}>
        <div style={{ color: 'white', fontSize: '18px', fontWeight: 'bold' }}>
          در حال بارگذاری اطلاعات...
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(to bottom right, rgb(34, 197, 94), rgb(250, 204, 21))',
      }}>
        <div style={{
          backgroundColor: 'rgba(255, 255, 255, 0.9)',
          borderRadius: '12px',
          padding: '24px',
          textAlign: 'center',
          maxWidth: '400px',
        }}>
          <p style={{ color: 'rgb(220, 38, 38)', fontSize: '16px', marginBottom: '16px' }}>
            خطا: {error || 'اطلاعات قابل دسترسی نیست'}
          </p>
          <button
            onClick={fetchTodayData}
            style={{
              padding: '10px 20px',
              backgroundColor: 'rgb(59, 130, 246)',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: '600',
            }}
          >
            تلاش دوباره
          </button>
        </div>
      </div>
    );
  }

  const prayerLabels = {
    fajr: 'طلوع فجر',
    sunrise: 'طلوع خورشید',
    zuhr: 'اذان ظهر',
    asr: 'اذان عصر',
    sunset: 'غروب خورشید',
    maghrib: 'اذان مغرب',
    isha: 'اذان عشاء',
    midnight: 'نیمه شب',
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(to bottom right, rgb(34, 197, 94), rgb(250, 204, 21))',
      padding: '20px',
      direction: 'rtl',
    }}>
      <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
        {/* هدر */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '16px',
          padding: '32px 24px',
          marginBottom: '24px',
          boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
          textAlign: 'center',
        }}>
          <h1 style={{
            fontSize: '32px',
            fontWeight: 'bold',
            color: 'rgb(22, 163, 74)',
            marginBottom: '8px',
          }}>
            مسجد مشهد
          </h1>
          <p style={{
            fontSize: '18px',
            color: 'rgb(107, 114, 128)',
            marginBottom: '16px',
          }}>
            {data.shamsiDate}
          </p>
          <p style={{
            fontSize: '13px',
            color: 'rgb(156, 163, 175)',
          }}>
            {data.date}
          </p>
        </div>

        {/* مناسبت های روز */}
        {data.events.length > 0 && (
          <div style={{
            backgroundColor: 'white',
            borderRadius: '16px',
            padding: '24px',
            marginBottom: '24px',
            boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
          }}>
            <h2 style={{
              fontSize: '20px',
              fontWeight: 'bold',
              color: 'rgb(22, 163, 74)',
              marginBottom: '16px',
              paddingBottom: '12px',
              borderBottom: '2px solid rgb(34, 197, 94)',
            }}>
              مناسبت‌های امروز
            </h2>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '12px',
            }}>
              {data.events.map((event, idx) => (
                <div
                  key={idx}
                  style={{
                    backgroundColor: 'rgb(240, 253, 244)',
                    border: '2px solid rgb(34, 197, 94)',
                    borderRadius: '8px',
                    padding: '12px',
                    textAlign: 'center',
                    fontSize: '15px',
                    fontWeight: '600',
                    color: 'rgb(22, 163, 74)',
                  }}
                >
                  ✨ {event}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* اوقات شرعی */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '16px',
          padding: '24px',
          boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
        }}>
          <h2 style={{
            fontSize: '20px',
            fontWeight: 'bold',
            color: 'rgb(22, 163, 74)',
            marginBottom: '24px',
            paddingBottom: '12px',
            borderBottom: '2px solid rgb(34, 197, 94)',
          }}>
            اوقات شرعی مشهد
          </h2>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
            gap: '16px',
          }}>
            {Object.entries(data.prayerTimes).map(([key, time]) => (
              <div
                key={key}
                style={{
                  backgroundColor: 'rgb(240, 253, 244)',
                  border: '2px solid rgb(34, 197, 94)',
                  borderRadius: '12px',
                  padding: '16px',
                  textAlign: 'center',
                  transition: 'all 0.3s ease',
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLElement).style.backgroundColor = 'rgb(34, 197, 94)';
                  (e.currentTarget as HTMLElement).style.transform = 'translateY(-4px)';
                  (e.currentTarget as HTMLElement).style.boxShadow = '0 8px 20px rgba(34, 197, 94, 0.3)';
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.backgroundColor = 'rgb(240, 253, 244)';
                  (e.currentTarget as HTMLElement).style.transform = 'translateY(0)';
                  (e.currentTarget as HTMLElement).style.boxShadow = 'none';
                }}
              >
                <p style={{
                  fontSize: '13px',
                  color: 'rgb(107, 114, 128)',
                  marginBottom: '8px',
                  fontWeight: '500',
                }}>
                  {prayerLabels[key as keyof typeof prayerLabels]}
                </p>
                <p style={{
                  fontSize: '24px',
                  fontWeight: 'bold',
                  color: 'rgb(22, 163, 74)',
                  fontFamily: 'monospace',
                }}>
                  {time}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* دکمه جدید بارگذاری */}
        <div style={{
          marginTop: '24px',
          textAlign: 'center',
        }}>
          <button
            onClick={fetchTodayData}
            style={{
              padding: '12px 24px',
              backgroundColor: 'white',
              color: 'rgb(22, 163, 74)',
              fontWeight: '600',
              borderRadius: '8px',
              border: 'none',
              cursor: 'pointer',
              fontSize: '14px',
              boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
              transition: 'all 0.2s',
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.transform = 'scale(1.05)';
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.transform = 'scale(1)';
            }}
          >
            🔄 بروزرسانی
          </button>
        </div>
      </div>
    </div>
  );
}
