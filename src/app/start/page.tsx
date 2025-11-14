import { Suspense } from 'react';

export default function Start() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-green-700 to-yellow-400 p-4">
      <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full">
        <h1 className="text-3xl font-bold text-center mb-6 text-green-700">
          مسجد 🕌
        </h1>

        <div className="space-y-4">
          <div className="bg-green-50 border-l-4 border-green-700 p-4">
            <p className="text-green-700 font-semibold">
              ✅ اتصال موفق
            </p>
          </div>

          <div className="space-y-3 text-center mt-6">
            <p className="text-gray-700 text-lg">
              درحال بارگذاری...
            </p>
            <div className="animate-spin w-8 h-8 border-4 border-green-200 border-t-green-700 rounded-full mx-auto mt-4"></div>
          </div>

          <Suspense fallback={<div>Loading...</div>}>
            <script dangerouslySetInnerHTML={{
              __html: `
                if (typeof window !== 'undefined' && window.Telegram?.WebApp) {
                  window.Telegram.WebApp.expand();
                  window.Telegram.WebApp.ready();
                }
                // Redirect to main page
                setTimeout(() => {
                  window.location.href = '/';
                }, 500);
              `
            }} />
          </Suspense>
        </div>

        <div className="pt-6 border-t mt-6">
          <p className="text-xs text-gray-500 text-center">
            v1.0.0
          </p>
        </div>
      </div>
    </div>
  );
}
