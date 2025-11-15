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
  midnight?: string;
}

interface PrayerData {
  date: string;
  shamsiDate: string;
  gregorianDate: string;
  shamsiDate_parts: { year: number; month: number; day: number };
  city: string;
  prayerTimes: PrayerTimes;
  events: string[];
  cache: string;
}

const shamsiMonths = [
  'فروردین',
  'اردیبهشت',
  'خرداد',
  'تیر',
  'مرداد',
  'شهریور',
  'مهر',
  'آبان',
  'آذر',
  'دی',
  'بهمن',
  'اسفند',
];

export default function PrayerTimesSelector() {
  const [data, setData] = useState<PrayerData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  // تاریخ شمسی
  const [shamsiYear, setShamsiYear] = useState(1403);
  const [shamsiMonth, setShamsiMonth] = useState(8);
  const [shamsiDay, setShamsiDay] = useState(24);

  useEffect(() => {
    setMounted(true);
    // دریافت اطلاعات امروز هنگام بارگذاری
    const today = new Date();
    const gy = today.getFullYear();
    const gm = today.getMonth() + 1;
    const gd = today.getDate();

    let g_d_n = 365 * gy + Math.floor((gy + 3) / 4) - Math.floor((gy + 99) / 100) + Math.floor((gy + 399) / 400) + gd;
    let j_d_n = g_d_n - 79;
    let j_np = Math.floor(j_d_n / 12053);
    j_d_n %= 12053;

    let jy = 979 + 33 * j_np + 4 * Math.floor(j_d_n / 1461);
    j_d_n %= 1461;

    if (j_d_n >= 366) {
      jy += Math.floor((j_d_n - 1) / 365);
      j_d_n = (j_d_n - 1) % 365;
    }

    let jm = 1;
    for (let i = 0; i < 12; i++) {
      let v = i < 6 ? 31 : 30;
      if (i === 11) v = 29;
      if (j_d_n < v) break;
      j_d_n -= v;
      jm++;
    }

    let jd = j_d_n + 1;

    setShamsiYear(jy);
    setShamsiMonth(jm);
    setShamsiDay(jd);

    fetchPrayerTimes(jy, jm, jd);
  }, []);

  const fetchPrayerTimes = async (year: number, month: number, day: number) => {
    try {
      setLoading(true);
      setError(null);
      
      const shamsiDate = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const response = await fetch(`/api/prayer-by-date?shamsiDate=${shamsiDate}`);
      
      if (!response.ok) throw new Error('Failed to fetch');
      const result = await response.json();
      
      if (result.ok) {
        setData(result);
      } else {
        throw new Error(result.error || 'Unknown error');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const handleDateChange = () => {
    fetchPrayerTimes(shamsiYear, shamsiMonth, shamsiDay);
  };

  const handleToday = () => {
    const today = new Date();
    const gy = today.getFullYear();
    const gm = today.getMonth() + 1;
    const gd = today.getDate();

    let g_d_n = 365 * gy + Math.floor((gy + 3) / 4) - Math.floor((gy + 99) / 100) + Math.floor((gy + 399) / 400) + gd;
    let j_d_n = g_d_n - 79;
    let j_np = Math.floor(j_d_n / 12053);
    j_d_n %= 12053;

    let jy = 979 + 33 * j_np + 4 * Math.floor(j_d_n / 1461);
    j_d_n %= 1461;

    if (j_d_n >= 366) {
      jy += Math.floor((j_d_n - 1) / 365);
      j_d_n = (j_d_n - 1) % 365;
    }

    let jm = 1;
    for (let i = 0; i < 12; i++) {
      let v = i < 6 ? 31 : 30;
      if (i === 11) v = 29;
      if (j_d_n < v) break;
      j_d_n -= v;
      jm++;
    }

    let jd = j_d_n + 1;

    setShamsiYear(jy);
    setShamsiMonth(jm);
    setShamsiDay(jd);
    fetchPrayerTimes(jy, jm, jd);
  };

  if (!mounted) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(to bottom right, rgb(34, 197, 94), rgb(250, 204, 21))',
      }}>
        <div style={{ color: 'white', fontSize: '18px' }}>در حال بارگذاری...</div>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(to bottom right, rgb(34, 197, 94), rgb(250, 204, 21))',
      padding: '20px',
      direction: 'rtl',
    }}>
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        {/* انتخاب تاریخ */}
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
            marginBottom: '20px',
            textAlign: 'center',
          }}>
            📅 انتخاب تاریخ
          </h2>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '12px',
            marginBottom: '16px',
          }}>
            {/* سال */}
            <div>
              <label style={{
                display: 'block',
                marginBottom: '8px',
                fontWeight: '600',
                color: 'rgb(107, 114, 128)',
                fontSize: '13px',
              }}>
                سال
              </label>
              <input
                type="number"
                value={shamsiYear}
                onChange={(e) => setShamsiYear(Number(e.target.value))}
                style={{
                  width: '100%',
                  padding: '10px',
                  border: '2px solid rgb(34, 197, 94)',
                  borderRadius: '8px',
                  fontSize: '16px',
                  fontWeight: 'bold',
                  textAlign: 'center',
                  direction: 'ltr',
                }}
              />
            </div>

            {/* ماه */}
            <div>
              <label style={{
                display: 'block',
                marginBottom: '8px',
                fontWeight: '600',
                color: 'rgb(107, 114, 128)',
                fontSize: '13px',
              }}>
                ماه
              </label>
              <select
                value={shamsiMonth}
                onChange={(e) => setShamsiMonth(Number(e.target.value))}
                style={{
                  width: '100%',
                  padding: '10px',
                  border: '2px solid rgb(34, 197, 94)',
                  borderRadius: '8px',
                  fontSize: '16px',
                  fontWeight: 'bold',
                }}
              >
                {shamsiMonths.map((month, idx) => (
                  <option key={idx} value={idx + 1}>
                    {month}
                  </option>
                ))}
              </select>
            </div>

            {/* روز */}
            <div>
              <label style={{
                display: 'block',
                marginBottom: '8px',
                fontWeight: '600',
                color: 'rgb(107, 114, 128)',
                fontSize: '13px',
              }}>
                روز
              </label>
              <input
                type="number"
                min="1"
                max="31"
                value={shamsiDay}
                onChange={(e) => setShamsiDay(Math.min(31, Math.max(1, Number(e.target.value))))}
                style={{
                  width: '100%',
                  padding: '10px',
                  border: '2px solid rgb(34, 197, 94)',
                  borderRadius: '8px',
                  fontSize: '16px',
                  fontWeight: 'bold',
                  textAlign: 'center',
                  direction: 'ltr',
                }}
              />
            </div>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '12px',
          }}>
            <button
              onClick={handleToday}
              style={{
                padding: '12px 16px',
                backgroundColor: 'rgb(168, 85, 247)',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontWeight: '600',
                cursor: 'pointer',
                fontSize: '14px',
              }}
            >
              📍 امروز
            </button>
            <button
              onClick={handleDateChange}
              disabled={loading}
              style={{
                padding: '12px 16px',
                backgroundColor: loading ? 'rgb(156, 163, 175)' : 'rgb(34, 197, 94)',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontWeight: '600',
                cursor: loading ? 'not-allowed' : 'pointer',
                fontSize: '14px',
              }}
            >
              {loading ? '⏳ درحال بارگذاری...' : '🔍 جستجو'}
            </button>
          </div>
        </div>

        {/* نتایج */}
        {error && (
          <div style={{
            backgroundColor: 'rgb(254, 242, 242)',
            border: '2px solid rgb(220, 38, 38)',
            borderRadius: '16px',
            padding: '24px',
            marginBottom: '24px',
            textAlign: 'center',
          }}>
            <p style={{ color: 'rgb(220, 38, 38)', fontSize: '16px', margin: 0 }}>
              ❌ {error}
            </p>
          </div>
        )}

        {data && !loading && (
          <>
            {/* هدر */}
            <div style={{
              backgroundColor: 'white',
              borderRadius: '16px',
              padding: '24px',
              marginBottom: '24px',
              boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
              textAlign: 'center',
            }}>
              <h1 style={{
                fontSize: '24px',
                fontWeight: 'bold',
                color: 'rgb(22, 163, 74)',
                margin: '0 0 12px',
              }}>
                🕌 اوقات شرعی مشهد
              </h1>
              <p style={{
                fontSize: '16px',
                color: 'rgb(107, 114, 128)',
                margin: '0 0 8px',
              }}>
                {data.shamsiDate}
              </p>
              <p style={{
                fontSize: '13px',
                color: 'rgb(156, 163, 175)',
                margin: 0,
              }}>
                {data.gregorianDate}
              </p>
            </div>

            {/* مناسبت‌ها */}
            {data.events.length > 0 && (
              <div style={{
                backgroundColor: 'white',
                borderRadius: '16px',
                padding: '24px',
                marginBottom: '24px',
                boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
              }}>
                <h2 style={{
                  fontSize: '18px',
                  fontWeight: 'bold',
                  color: 'rgb(22, 163, 74)',
                  marginBottom: '16px',
                }}>
                  مناسبت‌های این روز
                </h2>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
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
                        fontSize: '14px',
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
                fontSize: '18px',
                fontWeight: 'bold',
                color: 'rgb(22, 163, 74)',
                marginBottom: '20px',
                textAlign: 'center',
              }}>
                ⏰ اوقات شرعی
              </h2>

              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
                gap: '16px',
              }}>
                {Object.entries({
                  fajr: 'طلوع فجر',
                  sunrise: 'طلوع خورشید',
                  zuhr: 'اذان ظهر',
                  asr: 'اذان عصر',
                  sunset: 'غروب خورشید',
                  maghrib: 'اذان مغرب',
                  isha: 'اذان عشاء',
                }).map(([key, label]) => (
                  <div
                    key={key}
                    style={{
                      backgroundColor: 'rgb(240, 253, 244)',
                      border: '2px solid rgb(34, 197, 94)',
                      borderRadius: '12px',
                      padding: '16px',
                      textAlign: 'center',
                      transition: 'all 0.2s',
                    }}
                    onMouseEnter={(e) => {
                      (e.currentTarget as HTMLElement).style.backgroundColor = 'rgb(34, 197, 94)';
                      (e.currentTarget as HTMLElement).style.color = 'white';
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLElement).style.backgroundColor = 'rgb(240, 253, 244)';
                      (e.currentTarget as HTMLElement).style.color = 'inherit';
                    }}
                  >
                    <p style={{
                      fontSize: '12px',
                      color: 'rgb(107, 114, 128)',
                      marginBottom: '8px',
                      fontWeight: '500',
                    }}>
                      {label}
                    </p>
                    <p style={{
                      fontSize: '20px',
                      fontWeight: 'bold',
                      color: 'rgb(22, 163, 74)',
                      fontFamily: 'monospace',
                      margin: 0,
                    }}>
                      {data.prayerTimes[key as keyof PrayerTimes]}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
