import { getUserFromCookies } from '@/lib/session';
import { redirect } from 'next/navigation';
import DashboardClient from './DashboardClient';

export default async function Page() {
  const user = await getUserFromCookies();
  if (!user) redirect('/start');
  const name = (user.firstName as string | undefined) || '';
  return <DashboardClient userName={name} />;
}
