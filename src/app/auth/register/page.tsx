"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function RegisterPage() {
  const router = useRouter();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [gender, setGender] = useState('');
  const [birth, setBirth] = useState('');
  const [pin, setPin] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ firstName, lastName, gender, birth, pin })
      });
      const data = await res.json();
      if (data.ok) {
        // after register, redirect to login
        router.push('/auth/login');
      } else {
        setError(data.error || 'خطا');
      }
    } catch (err) {
      setError('خطا در اتصال');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>ثبت‌نام</h2>
      <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 12, maxWidth: 420 }}>
        <label>
          نام
          <input value={firstName} onChange={(e) => setFirstName(e.target.value)} required />
        </label>
        <label>
          نام خانوادگی
          <input value={lastName} onChange={(e) => setLastName(e.target.value)} />
        </label>
        <label>
          جنسیت
          <input value={gender} onChange={(e) => setGender(e.target.value)} />
        </label>
        <label>
          تولد
          <input value={birth} onChange={(e) => setBirth(e.target.value)} />
        </label>
        <label>
          پین (۴ رقم)
          <input value={pin} onChange={(e) => setPin(e.target.value)} required maxLength={16} />
        </label>
        {error && <div style={{ color: 'red' }}>{error}</div>}
        <button disabled={loading} type="submit">ثبت‌نام</button>
      </form>
    </div>
  );
}
