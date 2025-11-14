import { useEffect } from 'react';

export function useTelegramWebApp() {
  useEffect(() => {
    // اطمینان از دسترس‌پذیری Telegram Web App
    if (typeof window !== 'undefined' && window.Telegram?.WebApp) {
      const webApp = window.Telegram.WebApp;
      
      // Expand WebApp to full height
      webApp.expand();
      
      // Enable closing button
      webApp.enableClosingConfirmation();
      
      // Set theme
      webApp.setHeaderColor('transparent');
      
      console.log('Telegram WebApp initialized');
    }
  }, []);
}

declare global {
  interface Window {
    Telegram?: {
      WebApp: {
        expand: () => void;
        enableClosingConfirmation: () => void;
        setHeaderColor: (color: string) => void;
        ready: () => void;
        [key: string]: any;
      };
    };
  }
}
