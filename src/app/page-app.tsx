'use client';

import React from 'react';

export default function Home() {
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
        borderRadius: '12px',
        boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
        padding: '32px',
        maxWidth: '400px',
        width: '100%',
        textAlign: 'center',
      }}>
        <h1 style={{
          fontSize: '32px',
          fontWeight: 'bold',
          color: 'rgb(22, 163, 74)',
          marginBottom: '24px',
        }}>
          مسجد 🕌
        </h1>

        <div style={{
          backgroundColor: 'rgb(240, 253, 244)',
          borderLeft: '4px solid rgb(22, 163, 74)',
          padding: '16px',
          marginBottom: '24px',
        }}>
          <p style={{
            fontWeight: '600',
            color: 'rgb(22, 163, 74)',
          }}>
            ✅ خوش آمدید
          </p>
        </div>

        <p style={{
          fontSize: '18px',
          color: 'rgb(55, 65, 81)',
          marginBottom: '16px',
        }}>
          برنامه مدیریت مسجد
        </p>

        <button
          onClick={() => alert('درحال توسعه...')}
          style={{
            width: '100%',
            backgroundColor: 'rgb(34, 197, 94)',
            color: 'white',
            fontWeight: 'bold',
            padding: '12px 16px',
            fontSize: '16px',
            borderRadius: '8px',
            border: 'none',
            cursor: 'pointer',
            marginTop: '24px',
            transition: 'background-color 0.2s',
          }}
          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgb(22, 163, 74)'}
          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'rgb(34, 197, 94)'}
        >
          شروع کنید 🚀
        </button>

        <p style={{
          fontSize: '12px',
          color: 'rgb(156, 163, 175)',
          marginTop: '24px',
          paddingTop: '24px',
          borderTop: '1px solid rgb(229, 231, 235)',
        }}>
          v1.0.0
        </p>
      </div>
    </div>
  );
}
