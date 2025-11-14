'use client';
import React, { useState, useEffect, Suspense } from "react";
import { useTelegramWebApp } from "@/lib/telegram";
import "react-modern-calendar-datepicker/lib/DatePicker.css";

type User = { name: string; coins: number; lastScoreChangeTime?: string; lastScoreChangeAmount?: number };

function generateCaptcha() {
  const code = Math.random().toString(36).substring(2, 7);
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='120' height='40'><rect width='100%' height='100%' fill='#e5e7eb'/><text x='50%' y='50%' dominant-baseline='middle' text-anchor='middle' font-size='24' font-family='monospace' fill='#16a34a' transform='rotate(${Math.floor(Math.random()*10-5)})'>${code}</text></svg>`;
  return { code, svg };
}

function UserRegister({ onRegister, setEntryType }: { onRegister: (user: User) => void; setEntryType: React.Dispatch<React.SetStateAction<string | null>> }) {
  const [form, setForm] = useState<{ name: string; family: string; gender: string; birth: string; captcha: string; rememberMe: boolean }>({ name: "", family: "", gender: "", birth: "", captcha: "", rememberMe: false });
  const [errors, setErrors] = useState<{ name?: string; family?: string; gender?: string; birth?: string; captcha?: string; rememberMe?: string }>({});
  const [captchaObj, setCaptchaObj] = useState(() => generateCaptcha());

  const validate = () => {
    const newErrors: typeof errors = {};
    if (!form.name) newErrors.name = "نام را وارد کنید";
    if (!form.family) newErrors.family = "فامیل را وارد کنید";
    if (!form.gender) newErrors.gender = "جنسیت را انتخاب کنید";
    if (!/^\d{4}\/\d{2}\/\d{2}$/.test(form.birth)) newErrors.birth = "تاریخ تولد را به صورت 1380/05/21 وارد کنید";
    if (form.captcha !== captchaObj.code) {
      newErrors.captcha = "کد امنیتی اشتباه است!";
    }
    if (!form.rememberMe) newErrors.rememberMe = "پذیرش 'مرا به خاطر بسپار' الزامی است.";
    return newErrors;
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-700 to-yellow-400">
      <form
        className="w-full max-w-md bg-white rounded-xl shadow-lg p-8 flex flex-col gap-4 items-center"
        onSubmit={async e => {
          e.preventDefault();
          const newErrors = validate();
          setErrors(newErrors);
          if (Object.keys(newErrors).length === 0) {
            onRegister({ name: form.name + " " + form.family, coins: 0 });
            if (form.rememberMe) {
              // remember the user locally by name (safer than relying only on IP)
              const userKey = form.name + " " + form.family;
              localStorage.setItem('masjed_current_user', userKey);
              localStorage.setItem('role_user', userKey);
            }
            setEntryType("user"); // Redirect to user view after successful registration
          } else if (newErrors.captcha) {
            setCaptchaObj(generateCaptcha());
            setForm(f => ({ ...f, captcha: "" }));
          }
        }}
      >
        <h2 className="text-2xl font-bold text-green-700 mb-4">ثبت‌نام کاربر جدید</h2>
        <input
          className={`border rounded px-3 py-2 w-full text-black text-lg ${errors.name ? 'border-red-500' : ''}`}
          type="text"
          placeholder="نام"
          value={form.name}
          onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
          required
        />
        {errors.name && <span className="text-red-600 text-sm mt-1 w-full text-right">{errors.name}</span>}
        <input
          className={`border rounded px-3 py-2 w-full text-black text-lg ${errors.family ? 'border-red-500' : ''}`}
          type="text"
          placeholder="فامیل"
          value={form.family}
          onChange={e => setForm(f => ({ ...f, family: e.target.value }))}
          required
        />
        {errors.family && <span className="text-red-600 text-sm mt-1 w-full text-right">{errors.family}</span>}
        <select
          className={`border rounded px-3 py-2 w-full text-black text-lg ${errors.gender ? 'border-red-500' : ''}`}
          value={form.gender}
          onChange={e => setForm(f => ({ ...f, gender: e.target.value }))}
          required
        >
          <option value="">جنسیت</option>
          <option value="مرد">مرد</option>
          <option value="زن">زن</option>
        </select>
        {errors.gender && <span className="text-red-600 text-sm mt-1 w-full text-right">{errors.gender}</span>}
        <input
          className={`border rounded px-3 py-2 w-full text-black text-lg ${errors.birth ? 'border-red-500' : ''}`}
          type="text"
          placeholder="تاریخ تولد (مثال: 1380/05/21)"
          value={form.birth}
          onChange={e => setForm(f => ({ ...f, birth: e.target.value }))}
          required
        />
        {errors.birth && <span className="text-red-600 text-sm mt-1 w-full text-right">{errors.birth}</span>}
        <div className="w-full flex flex-col gap-2">
          <label className="block text-green-700 font-semibold">کد امنیتی را وارد کنید:</label>
          <div className="flex items-center gap-2">
            <span className="bg-gray-200 px-2 py-1 rounded select-none">
              <div 
  dangerouslySetInnerHTML={{ __html: captchaObj.svg }}
  style={{ height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
/>
            </span>
            <button type="button" className="text-xs text-blue-600 underline" onClick={() => setCaptchaObj(generateCaptcha())}>تغییر کد</button>
          </div>
          <input
            className={`border rounded px-3 py-2 w-full text-black text-lg ${errors.captcha ? 'border-red-500' : ''}`}
            type="text"
            placeholder="کد امنیتی را وارد کنید"
            value={form.captcha}
            onChange={e => setForm(f => ({ ...f, captcha: e.target.value }))}
            required
          />
          {errors.captcha && <span className="text-red-600 text-sm mt-1">{errors.captcha}</span>}
        </div>
        <div className="flex items-center justify-center mb-3">
          <input type="checkbox" id="rememberUser" checked={form.rememberMe} onChange={e => setForm(f => ({ ...f, rememberMe: e.target.checked }))} required />
          <label htmlFor="rememberUser" className="ml-2 text-gray-700">مرا به خاطر بسپار (الزامی)</label>
        </div>
        {errors.rememberMe && <span className="text-red-600 text-sm mt-1 w-full text-right">{errors.rememberMe}</span>}
        <button className="bg-green-600 text-white px-6 py-2 rounded-lg text-lg font-bold hover:bg-green-700" type="submit">
          ثبت‌نام
        </button>
      </form>
    </div>
  );
}

type PrayerDate = { hijri?: { weekday?: { ar?: string }; date?: string } };
type PrayerTimes = { date?: PrayerDate; timings?: { [key: string]: string } };

function PrayerTimesDisplay({ isDarkMode }: { isDarkMode: boolean }) {
  const [dayOffset, setDayOffset] = useState(0); // 0 means today
  const [prayerTimes, setPrayerTimes] = useState<PrayerTimes | null>(null);
  const [loading, setLoading] = useState(false);

  React.useEffect(() => {
    async function fetchTimes() {
      setLoading(true);
      const date = new Date();
      date.setDate(date.getDate() + dayOffset);
      const year = date.getFullYear();
      const month = date.getMonth() + 1;
      const day = date.getDate();

      const response = await fetch(`http://api.aladhan.com/v1/timingsByCity?city=Mashhad&country=Iran&method=8&date=${day}-${month}-${year}`);
      const data = await response.json();
      if (data.code === 200) {
        setPrayerTimes(data.data);
      }
      setLoading(false);
    }
    fetchTimes();
  }, [dayOffset]);

  const bgColor = isDarkMode ? "bg-gray-800" : "bg-gray-900";
  const textColor = isDarkMode ? "text-cyan-300" : "text-cyan-200";
  const buttonColor = isDarkMode ? "text-cyan-300" : "text-cyan-200";
  const highlightColor = isDarkMode ? "text-yellow-300" : "text-yellow-200";

  return (
    <div className={`w-full max-w-md ${bgColor} rounded-xl shadow-lg p-6 text-center mb-6`}>
      <h2 className={`text-xl font-bold ${textColor} mb-2`}>اوقات شرعی مشهد</h2>
      <div className={`flex justify-between items-center mb-2 ${textColor}`}>
        <button className={`${buttonColor} text-lg`} onClick={() => setDayOffset(o => o - 1)}>قبل</button>
  <span className="font-semibold">{prayerTimes ? `امروز ${prayerTimes.date?.hijri?.weekday?.ar ?? ''} ${prayerTimes.date?.hijri?.date ?? ''}` : "..."}</span>
        <button className={`${buttonColor} text-lg`} onClick={() => setDayOffset(o => o + 1)}>بعد</button>
      </div>
      <button className={`text-xs ${highlightColor} mb-2`} onClick={() => setDayOffset(0)}>برگرد به امروز</button>
      {loading || !prayerTimes ? (
        <div className={textColor}>در حال دریافت...</div>
      ) : (
        <div className={`grid grid-cols-3 gap-4 mb-4 ${highlightColor}`}>
          <div>
            <span className="block text-sm">طلوع</span>
            <span className={`block text-lg font-bold ${textColor}`}>{prayerTimes?.timings?.Sunrise ?? "-"}</span>
          </div>
          <div>
            <span className="block text-sm">اذان صبح</span>
            <span className={`block text-lg font-bold ${textColor}`}>{prayerTimes?.timings?.Fajr ?? "-"}</span>
          </div>
          <div>
            <span className="block text-sm">اذان ظهر</span>
            <span className={`block text-lg font-bold ${textColor}`}>{prayerTimes?.timings?.Dhuhr ?? "-"}</span>
          </div>
          <div>
            <span className="block text-sm">غروب</span>
            <span className={`block text-lg font-bold ${textColor}`}>{prayerTimes?.timings?.Sunset ?? "-"}</span>
          </div>
          <div>
            <span className="block text-sm">اذان مغرب</span>
            <span className={`block text-lg font-bold ${textColor}`}>{prayerTimes?.timings?.Maghrib ?? "-"}</span>
          </div>
          <div>
            <span className="block text-sm">نیمه شب</span>
            <span className={`block text-lg font-bold ${textColor}`}>{prayerTimes?.timings?.Midnight ?? "-"}</span>
          </div>
        </div>
      )}
      <div className={`${isDarkMode ? 'bg-gray-700' : 'bg-gray-800'} rounded mt-4 p-4 ${highlightColor}`}>
        <div className="mb-2">تا اذان صبح</div>
        <div className={`${textColor} text-xl font-bold`}>۱ ساعت و ۴۶ دقیقه و ۴۸ ثانیه</div>
      </div>
    </div>
  );
}

function GuestView({ users, isDarkMode }: { users: User[]; isDarkMode: boolean }) {
  const bgColor = isDarkMode ? "bg-gray-700" : "bg-white";
  const textColor = isDarkMode ? "text-green-200" : "text-green-700";
  const itemBg = isDarkMode ? "bg-gray-600" : "bg-green-50";
  const itemTextColor = isDarkMode ? "text-green-100" : "text-green-800";
  const itemCoinColor = isDarkMode ? "text-yellow-300" : "text-yellow-700";

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-green-700 to-yellow-400 p-4">
      <PrayerTimesDisplay isDarkMode={isDarkMode} />
      <div className={`w-full max-w-md ${bgColor} rounded-xl shadow-lg p-6 text-center`}>
        <h2 className={`text-xl font-bold ${textColor} mb-2`}>لیست کاربران و امتیازها</h2>
        <ul className="space-y-2">
          {users.map((u, i) => (
            <li key={i} className={`${itemBg} rounded p-2 flex justify-between`}>
              <span className={`font-semibold ${itemTextColor}`}>{u.name}</span>
              <span className={`${itemCoinColor} font-bold`}>{u.coins} سکه</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function AdminLogin({ users, setUsers, setEntryType, isDarkMode }: { users: User[]; setUsers: React.Dispatch<React.SetStateAction<User[]>>; setEntryType: React.Dispatch<React.SetStateAction<string | null>>; isDarkMode: boolean }) {
  const [password, setPassword] = useState("");
  const [logged, setLogged] = useState(false);
  const [remember, setRemember] = useState(false);
  const [showGuest, setShowGuest] = useState(false);

  React.useEffect(() => {
    async function checkRemembered() {
      const ip = await fetch('https://api.ipify.org?format=json').then(r => r.json()).then(d => d.ip).catch(() => null);
      if (ip) {
        const role = localStorage.getItem('role_' + ip);
        if (role === 'admin') setLogged(true);
      }
    }
    checkRemembered();
  }, []);

  const bgColor = isDarkMode ? "bg-gray-700" : "bg-white";
  const textColor = isDarkMode ? "text-green-200" : "text-green-700";
  const inputColor = isDarkMode ? "text-white bg-gray-600 border-gray-500" : "text-black border-gray-300";
  const labelColor = isDarkMode ? "text-gray-300" : "text-gray-700";
  const buttonBg = isDarkMode ? "bg-gray-600 hover:bg-gray-700" : "bg-gray-700 hover:bg-gray-800";
  const deleteButtonBg = isDarkMode ? "bg-red-600 hover:bg-red-700" : "bg-red-600 hover:bg-red-700";
  const itemBg = isDarkMode ? "bg-gray-600" : "bg-green-50";
  const itemTextColor = isDarkMode ? "text-green-100" : "text-green-800";
  const itemCoinColor = isDarkMode ? "text-yellow-300" : "text-yellow-700";
  // local edit buffer for coins to avoid immediate per-keystroke updates
  const [editValues, setEditValues] = useState<number[]>(users.map(u => u.coins));
  React.useEffect(() => {
    setEditValues(users.map(u => u.coins));
  }, [users]);

  if (!logged) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-700 to-yellow-400">
        <div className={`w-full max-w-xs ${bgColor} rounded-xl shadow-lg p-6 text-center`}>
          <h2 className={`text-xl font-bold ${textColor} mb-4`}>ورود مدیر</h2>
          <input
            className={`border rounded px-2 py-1 w-full mb-3 ${inputColor}`}
            type="password"
            placeholder="رمز ورود"
            value={password}
            onChange={e => setPassword(e.target.value)}
          />
          <div className="flex items-center justify-center mb-3">
            <input type="checkbox" id="remember" checked={remember} onChange={e => setRemember(e.target.checked)} />
            <label htmlFor="remember" className={`ml-2 ${labelColor}`}>مرا به خاطر بسپار</label>
          </div>
          <button
            className={`w-full text-white py-2 rounded ${buttonBg}`}
            onClick={async () => {
              if (password === "Emam5") {
                setLogged(true);
                if (remember) {
                  const ip = await fetch('https://api.ipify.org?format=json').then(r => r.json()).then(d => d.ip).catch(() => null);
                  if (ip) localStorage.setItem('role_' + ip, 'admin');
                }
              } else {
                alert("رمز اشتباه است");
              }
            }}
          >ورود</button>
        </div>
      </div>
    );
  }
  if (showGuest) return <GuestView users={users} isDarkMode={isDarkMode} />;
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-green-700 to-yellow-400 p-4">
      <PrayerTimesDisplay isDarkMode={isDarkMode} />
      <div className={`w-full max-w-md ${bgColor} rounded-xl shadow-lg p-6 text-center`}>
        <h2 className={`text-xl font-bold ${textColor} mb-2`}>مدیریت کاربران</h2>
        <ul className="space-y-2">
          {users.map((u, i) => (
            <li key={i} className={`${itemBg} rounded p-2 flex flex-col items-start w-full`}>
              <div className="flex justify-between items-center w-full">
                <span className={`font-semibold ${itemTextColor}`}>{u.name}</span>
                <div className="flex items-center">
                  <span className={`${itemCoinColor} font-bold`}>{u.coins} سکه</span>
                  <input
                    type="number"
                    value={typeof editValues[i] === 'number' ? editValues[i] : u.coins}
                    onChange={(e) => {
                      const v = parseInt(e.target.value || '0');
                      setEditValues(ev => {
                        const copy = [...ev];
                        copy[i] = Number.isNaN(v) ? 0 : v;
                        return copy;
                      });
                    }}
                    className={`w-20 text-center border rounded mx-2 ${inputColor}`}
                  />
                  <button
                    className={`bg-green-500 text-white px-2 py-1 rounded ml-1 hover:bg-green-600`}
                    onClick={() => {
                      const newCoins = editValues[i] ?? u.coins;
                      if (newCoins === u.coins) return;
                      const changeAmount = newCoins - u.coins;
                      setUsers(users.map((user, index) => index === i ? { ...user, coins: newCoins, lastScoreChangeTime: new Date().toLocaleString('fa-IR'), lastScoreChangeAmount: changeAmount } : user));
                    }}
                  >ذخیره</button>
                  <button
                    className={`${deleteButtonBg} text-white px-2 py-1 rounded hover:bg-red-600 ml-2`}
                    onClick={() => {
                      if (confirm(`آیا از حذف کاربر «${u.name}» مطمئن هستید؟`)) {
                        setUsers(users.filter((_, index) => index !== i));
                      }
                    }}
                  >حذف</button>
                </div>
              </div>
              {u.lastScoreChangeTime && (
                <div className={`text-xs ${labelColor} mt-1 w-full text-right`}>
                  آخرین تغییر: {u.lastScoreChangeTime} (مقدار تغییر: {u.lastScoreChangeAmount})
                </div>
              )}
            </li>
          ))}
        </ul>
        <button
          className={`mt-6 w-full text-white py-2 rounded-lg text-lg font-bold ${deleteButtonBg}`}
          onClick={async () => {
            const ip = await fetch('https://api.ipify.org?format=json').then(r => r.json()).then(d => d.ip).catch(() => null);
            if (ip) localStorage.removeItem('role_' + ip);
            setLogged(false);
            setShowGuest(false);
            setEntryType(null);
          }}
        >خروج</button>
      </div>
    </div>
  );
}

function UserView({ isDarkMode }: { isDarkMode: boolean }) {
  const [modal, setModal] = useState<{ title: string; text: string } | null>(null);

  const prayersList = [
    { prayer: "دعای یا من ارجوه...", ziyarat: "زیارت امام حسین (ع)" },
    { prayer: "دعای یا من یملک...", ziyarat: "زیارت امام رضا (ع)" },
    { prayer: "دعای کمیل", ziyarat: "زیارت امام حسن عسکری (ع)" },
    { prayer: "دعای توسل", ziyarat: "زیارت امام علی (ع)" },
    { prayer: "دعای عهد", ziyarat: "زیارت حضرت زهرا (س)" }
  ];
  const todayPrayer = prayersList[new Date().getDay() % prayersList.length];

  const bgColor = isDarkMode ? "bg-gray-700" : "bg-white";
  const textColor = isDarkMode ? "text-green-200" : "text-green-700";
  const itemBg = isDarkMode ? "bg-gray-600" : "bg-green-50";
  const itemTextColor = isDarkMode ? "text-green-100" : "text-green-800";
  const itemHighlightColor = isDarkMode ? "text-yellow-300" : "text-yellow-700";

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-green-700 to-yellow-400 p-4">
      <PrayerTimesDisplay isDarkMode={isDarkMode} />
      <div className={`w-full max-w-md ${bgColor} rounded-xl shadow-lg p-6 text-center`}>
        <h2 className={`text-xl font-bold ${textColor} mb-2`}>دعا و زیارت روز</h2>
        <div className="mb-2">
          <span className={`text-base ${itemTextColor} font-semibold`}>دعای امروز: </span>
          <span className={`text-base ${itemHighlightColor}`}>{todayPrayer.prayer}</span>
        </div>
        <div>
          <span className={`text-base ${itemTextColor} font-semibold`}>زیارت امروز: </span>
          <span className={`text-base ${itemHighlightColor}`}>{todayPrayer.ziyarat}</span>
        </div>
      </div>
      <div className={`w-full max-w-md ${bgColor} rounded-xl shadow-lg p-6 text-center mt-6`}>
        <h2 className={`text-xl font-bold ${textColor} mb-2`}>ادعیه معروف</h2>
        <ul className="space-y-2">
          <li className={`${itemBg} rounded p-2 cursor-pointer`} onClick={() => setModal({ title: 'دعای کمیل', text: 'متن کامل دعای کمیل...' })}>
            <span className={`font-semibold ${itemTextColor}`}>دعای کمیل</span>
          </li>
          <li className={`${itemBg} rounded p-2 cursor-pointer`} onClick={() => setModal({ title: 'دعای عهد', text: 'متن کامل دعای عهد...' })}>
            <span className={`font-semibold ${itemTextColor}`}>دعای عهد</span>
          </li>
          <li className={`${itemBg} rounded p-2 cursor-pointer`} onClick={() => setModal({ title: 'دعای توسل', text: 'متن کامل دعای توسل...' })}>
            <span className={`font-semibold ${itemTextColor}`}>دعای توسل</span>
          </li>
        </ul>
      </div>
      <div className={`w-full max-w-md ${bgColor} rounded-xl shadow-lg p-6 text-center mt-6`}>
        <h2 className={`text-xl font-bold ${itemHighlightColor} mb-2`}>وصیت شهدا</h2>
        <ul className="space-y-2">
          <li className={`${itemBg} rounded p-2 cursor-pointer`} onClick={() => setModal({ title: 'شهید محمدرضا شفیعی', text: 'متن وصیت شهید محمدرضا شفیعی...' })}>
            <span className={`font-semibold ${itemHighlightColor}`}>شهید محمدرضا شفیعی</span>
          </li>
          <li className={`${itemBg} rounded p-2 cursor-pointer`} onClick={() => setModal({ title: 'شهید عباس بابایی', text: 'متن وصیت شهید عباس بابایی...' })}>
            <span className={`font-semibold ${itemHighlightColor}`}>شهید عباس بابایی</span>
          </li>
          <li className={`${itemBg} rounded p-2 cursor-pointer`} onClick={() => setModal({ title: 'شهید حسن باقری', text: 'متن وصیت شهید حسن باقری...' })}>
            <span className={`font-semibold ${itemHighlightColor}`}>شهید حسن باقری</span>
          </li>
        </ul>
      </div>
      {modal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className={`${bgColor} rounded-xl shadow-lg p-6 w-full max-w-md text-center relative`}>
            <button className="absolute top-2 left-2 text-gray-700" onClick={() => setModal(null)}>×</button>
            <h3 className={`text-xl font-bold ${textColor} mb-4`}>{modal.title}</h3>
            <div className={`${itemTextColor} text-base`}>{modal.text || 'متن کامل بعدا اضافه می‌شود.'}</div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function Home() {
  const [entryType, setEntryType] = useState<string | null>(null);
  const [showRegister, setShowRegister] = useState(false);
  const [isTelegram, setIsTelegram] = useState(false);
  const [users, setUsers] = useState<User[]>([
    { name: "علی رضایی", coins: 12, lastScoreChangeTime: new Date().toLocaleString('fa-IR'), lastScoreChangeAmount: 0 },
    { name: "زهرا احمدی", coins: 8, lastScoreChangeTime: new Date().toLocaleString('fa-IR'), lastScoreChangeAmount: 0 },
    { name: "محمد موسوی", coins: 5, lastScoreChangeTime: new Date().toLocaleString('fa-IR'), lastScoreChangeAmount: 0 },
  ]);
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Initialize Telegram WebApp
  useTelegramWebApp();

  React.useEffect(() => {
    // Detect if running in Telegram
    if (typeof window !== 'undefined' && window.Telegram?.WebApp) {
      setIsTelegram(true);
      console.log('Running in Telegram WebApp');
    }
  }, []);

  // Load users and dark mode from localStorage on mount
  React.useEffect(() => {
    try {
      const raw = localStorage.getItem('masjed_users');
      if (raw) {
        const parsed = JSON.parse(raw) as User[];
        if (Array.isArray(parsed) && parsed.length) setUsers(parsed);
      }
    } catch {
      // ignore
    }
    const dm = localStorage.getItem('masjed_dark');
    if (dm) setIsDarkMode(dm === '1');
    const currentUser = localStorage.getItem('masjed_current_user');
    if (currentUser) setEntryType('user');
  }, []);

  // Persist users and dark mode
  React.useEffect(() => {
    try {
      localStorage.setItem('masjed_users', JSON.stringify(users));
  } catch {}
  }, [users]);

  React.useEffect(() => {
    try {
      localStorage.setItem('masjed_dark', isDarkMode ? '1' : '0');
  } catch {}
  }, [isDarkMode]);

  const toggleDarkMode = () => {
    setIsDarkMode(prevMode => !prevMode);
  };

  const containerClasses = `min-h-screen flex items-center justify-center p-4 ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-gradient-to-br from-green-700 to-yellow-400 text-black'}`;
  const cardClasses = `w-full max-w-md rounded-xl shadow-lg p-8 text-center ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`;
  const titleClasses = `text-3xl font-extrabold mb-4 ${isDarkMode ? 'text-green-300' : 'text-green-700'}`;
  const textClasses = `text-lg mb-6 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`;
  const buttonYellowClasses = `w-full py-3 rounded-lg text-lg font-bold ${isDarkMode ? 'bg-yellow-600 hover:bg-yellow-700 text-white' : 'bg-yellow-500 hover:bg-yellow-600 text-white'}`;
  const buttonGreenClasses = `w-full py-3 rounded-lg text-lg font-bold ${isDarkMode ? 'bg-green-600 hover:bg-green-700 text-white' : 'bg-green-600 hover:bg-green-700 text-white'}`;
  const adminButtonClasses = `underline ${isDarkMode ? 'text-gray-400 hover:text-gray-300' : 'text-gray-600 hover:text-gray-700'}`;
  const darkModeToggleClasses = `absolute top-4 right-4 p-2 rounded-full ${isDarkMode ? 'bg-gray-700 text-white' : 'bg-gray-200 text-gray-800'}`;


  if (!entryType && !showRegister) {
    return (
      <div className={containerClasses}>
        <button className={darkModeToggleClasses} onClick={toggleDarkMode}>
          {isDarkMode ? '☀️' : '🌙'}
        </button>
        <div className={cardClasses}>
          <h1 className={titleClasses}>به سایت مسجد خوش آمدید</h1>
          <p className={textClasses}>در اینجا می‌توانید اوقات شرعی، دعاها، زیارات و وصیت شهدا را مشاهده کنید و در برنامه‌های مسجد شرکت کنید.</p>
          <div className="flex flex-col gap-4">
            <button className={buttonYellowClasses} onClick={() => setEntryType("guest")}>ورود مهمان</button>
            <button className={buttonGreenClasses} onClick={() => setShowRegister(true)}>ثبت‌نام کاربر</button>
          </div>
          <div className="mt-6">
            <button className={adminButtonClasses} onClick={() => setEntryType("admin")}>ورود مدیر</button>
          </div>
        </div>
      </div>
    );
  }
  if (showRegister) {
    return <UserRegister onRegister={user => { setUsers([...users, { name: user.name, coins: 0 }]); setShowRegister(false); setEntryType("user"); }} setEntryType={setEntryType} />;
  }
  if (entryType === "guest") {
    return <GuestView users={users} isDarkMode={isDarkMode} />;
  }
  if (entryType === "admin") {
    return <AdminLogin users={users} setUsers={setUsers} setEntryType={setEntryType} isDarkMode={isDarkMode} />;
  }
  if (entryType === "user") {
    return <UserView isDarkMode={isDarkMode} />;
  }
  return <UserView isDarkMode={isDarkMode} />;
}
