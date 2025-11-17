
import { Suspense } from 'react';
import { HomeShell } from './_components/home-shell';

function HomeClient() {
  // این بخش همان منطق قبلی را حفظ می‌کند
  const searchParams = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null;
  const appVariant = searchParams && searchParams.get('app') === 'true' ? 'miniApp' : 'default';
  return <HomeShell variant={appVariant} />;
}

export default function Home() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#030d09]" />}>
      <HomeClient />
    </Suspense>
  );
}
