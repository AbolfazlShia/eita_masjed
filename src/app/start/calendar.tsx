'use client';

import { useState, useEffect } from 'react';
import { getShamsiEventsByMonth, formatShamsiDate } from '@/lib/shamsi-events';

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

const persianDays = ['شنبه', 'یکشنبه', 'دوشنبه', 'سه‌شنبه', 'چهارشنبه', 'پنج‌شنبه', 'جمعه'];

// تبدیل میلادی به شمسی
function gregorianToShamsi(date: Date) {
  const gy = date.getFullYear();
  const gm = date.getMonth() + 1;
  const gd = date.getDate();

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

  return { year: jy, month: jm, day: j_d_n + 1 };
}

// شمارش روزهای ماه شمسی
function getDaysInShamsiMonth(month: number, year: number): number {
  if (month <= 6) return 31;
  if (month <= 11) return 30;
  // برای ماه 12 (اسفند)
  // سال کبیسه شمسی: سال‌های 1403، 1407، 1411 و...
  const cycle = year % 2820;
  if ([1403, 1407, 1411, 1415, 1419, 1423, 1427].includes(cycle)) return 30;
  return 29;
}

// تبدیل شمسی به میلادی
function shamsiToGregorian(jy: number, jm: number, jd: number) {
  let j_d_n = 365 * jy + Math.floor(jy / 33) * 8 + Math.floor((jy % 33 + 3) / 4) + 78 + jd;

  for (let i = 1; i < jm; i++) {
    j_d_n += i <= 6 ? 31 : 30;
  }

  let gy = 400 * Math.floor(j_d_n / 146097);
  j_d_n %= 146097;

  let flag = true;
  if (j_d_n >= 36525) {
    j_d_n--;
    gy += 100 * Math.floor(j_d_n / 36524);
    j_d_n %= 36524;
    if (j_d_n >= 365) j_d_n++;
    flag = false;
  }

  gy += 4 * Math.floor(j_d_n / 1461);
  j_d_n %= 1461;

  if (flag && j_d_n >= 366) {
    j_d_n--;
    gy += Math.floor(j_d_n / 365);
    j_d_n = (j_d_n % 365) + 1;
  }

  let isLeap = (gy % 4 === 0 && gy % 100 !== 0) || (gy % 400 === 0);
  let sal_a = [0, 31, isLeap ? 60 : 59, 91, 121, 152, 182, 213, 244, 274, 305, 335, 366];

  let gm = 0;
  for (let v = 0; v < 13; v++) {
    if (j_d_n <= sal_a[v]) {
      gm = v;
      break;
    }
  }

  let gd = j_d_n - sal_a[gm - 1];

  return new Date(gy, gm - 1, gd);
}

export default function ShamsiCalendar() {
  const today = new Date();
  const todayShamsi = gregorianToShamsi(today);

  const [mounted, setMounted] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(todayShamsi.month);
  const [currentYear, setCurrentYear] = useState(todayShamsi.year);
  const [selectedDay, setSelectedDay] = useState<number | null>(todayShamsi.day);

  useEffect(() => {
    setMounted(true);
  }, []);

  const daysInMonth = getDaysInShamsiMonth(currentMonth, currentYear);
  const firstDayOfMonth = shamsiToGregorian(currentYear, currentMonth, 1).getDay();

  const events = getShamsiEventsByMonth(currentMonth);
  const selectedEvents = selectedDay ? events[selectedDay] || [] : [];

  const calendarDays: (number | null)[] = [];
  for (let i = 0; i < firstDayOfMonth; i++) {
    calendarDays.push(null);
  }
  for (let i = 1; i <= daysInMonth; i++) {
    calendarDays.push(i);
  }

  const previousMonth = () => {
    if (currentMonth === 1) {
      setCurrentMonth(12);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
    setSelectedDay(null);
  };

  const nextMonth = () => {
    if (currentMonth === 12) {
      setCurrentMonth(1);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
    setSelectedDay(null);
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(to bottom right, rgb(34, 197, 94), rgb(250, 204, 21))',
      padding: '20px',
      direction: 'rtl',
    }}>
      {!mounted ? (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100vh',
        }}>
          <div style={{ color: 'white', fontSize: '18px' }}>در حال بارگذاری...</div>
        </div>
      ) : (
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
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
            fontSize: '28px',
            fontWeight: 'bold',
            color: 'rgb(22, 163, 74)',
            marginBottom: '12px',
          }}>
            📅 تقویم شمسی
          </h1>
          <p style={{
            fontSize: '14px',
            color: 'rgb(107, 114, 128)',
          }}>
            مناسبت‌های روزهای شمسی
          </p>
        </div>

        {/* تقویم */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '16px',
          padding: '24px',
          marginBottom: '24px',
          boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
        }}>
          {/* ناوبری ماه */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '24px',
            paddingBottom: '16px',
            borderBottom: '2px solid rgb(34, 197, 94)',
          }}>
            <button
              onClick={previousMonth}
              style={{
                padding: '8px 16px',
                backgroundColor: 'rgb(240, 253, 244)',
                border: '2px solid rgb(34, 197, 94)',
                borderRadius: '8px',
                color: 'rgb(22, 163, 74)',
                fontWeight: 'bold',
                cursor: 'pointer',
                fontSize: '16px',
              }}
            >
              ◀️
            </button>

            <h2 style={{
              fontSize: '20px',
              fontWeight: 'bold',
              color: 'rgb(22, 163, 74)',
            }}>
              {shamsiMonths[currentMonth - 1]} {currentYear}
            </h2>

            <button
              onClick={nextMonth}
              style={{
                padding: '8px 16px',
                backgroundColor: 'rgb(240, 253, 244)',
                border: '2px solid rgb(34, 197, 94)',
                borderRadius: '8px',
                color: 'rgb(22, 163, 74)',
                fontWeight: 'bold',
                cursor: 'pointer',
                fontSize: '16px',
              }}
            >
              ▶️
            </button>
          </div>

          {/* روزهای هفته */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(7, 1fr)',
            gap: '8px',
            marginBottom: '12px',
          }}>
            {persianDays.map(day => (
              <div
                key={day}
                style={{
                  textAlign: 'center',
                  fontWeight: 'bold',
                  color: 'rgb(107, 114, 128)',
                  fontSize: '13px',
                  padding: '12px 0',
                  borderBottom: '2px solid rgb(229, 231, 235)',
                }}
              >
                {day}
              </div>
            ))}
          </div>

          {/* روزهای ماه */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(7, 1fr)',
            gap: '8px',
          }}>
            {calendarDays.map((day, idx) => (
              <div
                key={idx}
                onClick={() => day !== null && setSelectedDay(day)}
                style={{
                  padding: '12px 8px',
                  textAlign: 'center',
                  backgroundColor: day === null ? 'transparent' : (
                    day === todayShamsi.day && currentMonth === todayShamsi.month && currentYear === todayShamsi.year
                      ? 'rgb(34, 197, 94)'
                      : day === selectedDay
                      ? 'rgb(240, 253, 244)'
                      : 'rgb(250, 250, 250)'
                  ),
                  border: day === selectedDay ? '2px solid rgb(34, 197, 94)' : '1px solid rgb(229, 231, 235)',
                  borderRadius: '8px',
                  fontWeight: day === todayShamsi.day && currentMonth === todayShamsi.month ? 'bold' : 'normal',
                  color: day === todayShamsi.day && currentMonth === todayShamsi.month && currentYear === todayShamsi.year
                    ? 'white'
                    : 'rgb(22, 163, 74)',
                  cursor: day !== null ? 'pointer' : 'default',
                  transition: 'all 0.2s',
                  position: 'relative',
                }}
                onMouseEnter={(e) => {
                  if (day !== null && day !== todayShamsi.day) {
                    (e.currentTarget as HTMLElement).style.backgroundColor = 'rgb(230, 250, 240)';
                    (e.currentTarget as HTMLElement).style.transform = 'scale(1.05)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (day !== null) {
                    (e.currentTarget as HTMLElement).style.backgroundColor =
                      day === selectedDay
                        ? 'rgb(240, 253, 244)'
                        : 'rgb(250, 250, 250)';
                    (e.currentTarget as HTMLElement).style.transform = 'scale(1)';
                  }
                }}
              >
                {day}
                {events[day!] && events[day!].length > 0 && (
                  <div style={{
                    width: '6px',
                    height: '6px',
                    backgroundColor: 'rgb(220, 38, 38)',
                    borderRadius: '50%',
                    margin: '4px auto 0',
                  }} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* مناسبت‌های روز انتخاب‌شده */}
        {selectedDay && selectedEvents.length > 0 && (
          <div style={{
            backgroundColor: 'white',
            borderRadius: '16px',
            padding: '24px',
            boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
          }}>
            <h3 style={{
              fontSize: '18px',
              fontWeight: 'bold',
              color: 'rgb(22, 163, 74)',
              marginBottom: '16px',
              paddingBottom: '12px',
              borderBottom: '2px solid rgb(34, 197, 94)',
            }}>
              مناسبت‌های {selectedDay} {shamsiMonths[currentMonth - 1]}
            </h3>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
              gap: '12px',
            }}>
              {selectedEvents.map((event, idx) => (
                <div
                  key={idx}
                  style={{
                    backgroundColor: 'rgb(240, 253, 244)',
                    border: '2px solid rgb(34, 197, 94)',
                    borderRadius: '8px',
                    padding: '16px',
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

        {selectedDay && selectedEvents.length === 0 && (
          <div style={{
            backgroundColor: 'white',
            borderRadius: '16px',
            padding: '24px',
            textAlign: 'center',
            color: 'rgb(107, 114, 128)',
            boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
          }}>
            <p>هیچ مناسبتی برای این روز ثبت نشده است.</p>
          </div>
        )}
      </div>
      )}
    </div>
  );
}
