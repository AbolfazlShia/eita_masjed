'use client';

import React, { useEffect, useState } from 'react';
import { useTelegramWebApp } from '@/lib/telegram';

export default function Home() {

  const [mounted, setMounted] = useState(false);
  const [isTelegram, setIsTelegram] = useState(false);
  const [userData, setUserData] = useState<any>(null);

  // Only run Telegram logic after hydration
  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    useTelegramWebApp();
    if (typeof window !== 'undefined' && window.Telegram?.WebApp) {
      setIsTelegram(true);
      const webApp = window.Telegram.WebApp;
      setUserData(webApp.initData);
      console.log('Telegram WebApp User:', webApp.initData);
    }
  }, [mounted]);

  if (!mounted) {
    return <div className="min-h-screen bg-gradient-to-br from-green-700 to-yellow-400" />;
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-green-700 to-yellow-400 p-4">
      <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full">
        <h1 className="text-3xl font-bold text-center mb-6 text-green-700">
          مسجد 🕌
        </h1>

        {isTelegram ? (
          <div className="space-y-4">
            <div className="bg-green-50 border-l-4 border-green-700 p-4">
              <p className="text-green-700 font-semibold">
                ✅ اتصال موفق
              </p>
              <p className="text-sm text-green-600 mt-2">
                درحال اجرا در Telegram WebApp
              </p>
            </div>

            <div className="space-y-3 text-center">
              <p className="text-gray-700 text-lg font-semibold">
                خوش آمدید! 👋
              </p>
              <p className="text-gray-600 text-sm">
                برنامه مدیریت مسجد آماده است.
              </p>
            </div>

            <button
              onClick={() => {
                window.location.href = '/?app=true';
              }}
              className="w-full bg-green-700 hover:bg-green-800 text-white font-bold py-3 px-4 rounded-lg transition duration-200 mt-6"
            >
              ورود به برنامه 🚪
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="bg-blue-50 border-l-4 border-blue-700 p-4">
              <p className="text-blue-700 font-semibold">
                ℹ️ مرورگر معمولی
              </p>
              <p className="text-sm text-blue-600 mt-2">
                این برنامه برای استفاده در ایتا طراحی شده است.
              </p>
            </div>

            <div className="space-y-3 text-center">
              <p className="text-gray-700 text-lg">
                سلام! 👋
              </p>
              <p className="text-gray-600 text-sm">
                برنامه مدیریت مسجد شما
              </p>
              <p className="text-gray-500 text-xs mt-4">
                برای استفاده بهتر این برنامه را از طریق ایتا باز کنید.
              </p>
            </div>

            <button
              onClick={() => {
                window.location.href = '/?app=true';
              }}
              className="w-full bg-green-700 hover:bg-green-800 text-white font-bold py-3 px-4 rounded-lg transition duration-200 mt-6"
            >
              ادامه 🚀
            </button>
          </div>
        )}

        <div className="pt-6 border-t mt-6">
          <p className="text-xs text-gray-500 text-center">
            v1.0.0 | {new Date().getFullYear()}
          </p>
        </div>
      </div>
    </div>
  );
}
