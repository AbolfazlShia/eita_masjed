import React from 'react';

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-green-700 to-yellow-400 p-4">
      <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full">
        <h1 className="text-3xl font-bold text-center mb-6 text-green-700">
          مسجد
        </h1>
        
        <div className="space-y-4 text-center">
          <p className="text-gray-700 text-lg">
            سلام! خوش آمدید 🌿
          </p>
          
          <p className="text-gray-600">
            این برنامه برای مدیریت مسجد طراحی شده است.
          </p>
          
          <div className="bg-green-50 border-l-4 border-green-700 p-4 mt-6">
            <p className="text-sm text-gray-700">
              ℹ️ برای استفاده از برنامه، بر روی دکمه زیر کلیک کنید.
            </p>
          </div>

          <button 
            onClick={() => {
              // Load the interactive version
              window.location.href = '/?interactive=true';
            }}
            className="w-full bg-green-700 hover:bg-green-800 text-white font-bold py-3 px-4 rounded-lg transition duration-200 mt-8"
          >
            ورود 🚪
          </button>

          <div className="pt-6 border-t">
            <p className="text-xs text-gray-500">
              v1.0.0 | {new Date().getFullYear()}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
