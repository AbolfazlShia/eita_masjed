"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const router = useRouter();
  const [firstName, setFirstName] = useState('');
  const [pin, setPin] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ firstName, pin, remember: true })
      });
      const data = await res.json();
      if (data.ok) {
        router.push('/dashboard');
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
      <h2>ورود</h2>
      <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 12, maxWidth: 420 }}>
        <label>
          نام
          <input value={firstName} onChange={(e) => setFirstName(e.target.value)} required />
        </label>
        <label>
          پین (۴ رقم)
          <input value={pin} onChange={(e) => setPin(e.target.value)} required maxLength={16} />
        </label>
        {error && <div style={{ color: 'red' }}>{error}</div>}
        <button disabled={loading} type="submit">ورود</button>
      </form>
    </div>
  );
}
