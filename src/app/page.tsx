'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();
  const [selected, setSelected] = useState<'guest' | 'auth' | 'admin' | null>(null);

  const handleGuest = () => router.push('/start');
  const handleAuth = () => router.push('/auth/register');
  const handleAdmin = () => {
    setSelected('admin');
    setTimeout(() => router.push('/auth/login'), 300);
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(to bottom right, rgb(34, 197, 94), rgb(250, 204, 21))',
      padding: '16px',
    }}>
      <div style={{
        backgroundColor: 'white',
        borderRadius: '16px',
        boxShadow: '0 20px 50px rgba(0,0,0,0.15)',
        padding: '40px',
        maxWidth: '500px',
        width: '100%',
        textAlign: 'center',
      }}>
        <h1 style={{
          fontSize: '36px',
          fontWeight: 'bold',
          color: 'rgb(22, 163, 74)',
          marginBottom: '8px',
        }}>
          مسجد
        </h1>

        <p style={{
          fontSize: '14px',
          color: 'rgb(107, 114, 128)',
          marginBottom: '32px',
        }}>
          برنامه مدیریت مسجد
        </p>

        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr',
          gap: '16px',
          marginTop: '32px',
        }}>
          <button
            onClick={handleGuest}
            style={{
              padding: '16px 24px',
              backgroundColor: 'rgb(59, 130, 246)',
              color: 'white',
              fontWeight: '600',
              fontSize: '16px',
              borderRadius: '12px',
              border: 'none',
              cursor: 'pointer',
              transition: 'all 0.2s',
              transform: selected === 'guest' ? 'scale(0.98)' : 'scale(1)',
            }}
            onMouseDown={() => setSelected('guest')}
            onMouseUp={() => setSelected(null)}
          >
            ورود به عنوان مهمان
          </button>

          <button
            onClick={handleAuth}
            style={{
              padding: '16px 24px',
              backgroundColor: 'rgb(22, 163, 74)',
              color: 'white',
              fontWeight: '600',
              fontSize: '16px',
              borderRadius: '12px',
              border: 'none',
              cursor: 'pointer',
              transition: 'all 0.2s',
              transform: selected === 'auth' ? 'scale(0.98)' : 'scale(1)',
            }}
            onMouseDown={() => setSelected('auth')}
            onMouseUp={() => setSelected(null)}
          >
            ثبت نام یا ورود
          </button>

          <button
            onClick={handleAdmin}
            style={{
              padding: '16px 24px',
              backgroundColor: 'rgb(239, 68, 68)',
              color: 'white',
              fontWeight: '600',
              fontSize: '16px',
              borderRadius: '12px',
              border: 'none',
              cursor: 'pointer',
              transition: 'all 0.2s',
              transform: selected === 'admin' ? 'scale(0.98)' : 'scale(1)',
            }}
            onMouseDown={() => setSelected('admin')}
            onMouseUp={() => setSelected(null)}
          >
            ورود مدیر
          </button>
        </div>

        <div style={{
          marginTop: '40px',
          paddingTop: '24px',
          borderTop: '1px solid rgb(229, 231, 235)',
        }}>
          <p style={{
            fontSize: '12px',
            color: 'rgb(156, 163, 175)',
            margin: '0',
          }}>
            v1.0.0 • مسجد
          </p>
        </div>
      </div>
    </div>
  );
}
