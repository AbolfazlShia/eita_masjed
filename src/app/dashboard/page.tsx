import { getUserFromCookies } from '@/lib/session';
import { redirect } from 'next/navigation';
import DashboardClient from './DashboardClient';

export default function Page() {
  const user = getUserFromCookies();
  if (!user) redirect('/start');
  const name = user.firstName || '';
  return <DashboardClient userName={name} />;
}
