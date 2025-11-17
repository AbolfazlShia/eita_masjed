'use client';
import { useSearchParams } from 'next/navigation';
import { HomeShell } from './_components/home-shell';

export default function Home() {
  const searchParams = useSearchParams();
  const appVariant = searchParams.get('app') === 'true' ? 'miniApp' : 'default';

  return <HomeShell variant={appVariant} />;
}
