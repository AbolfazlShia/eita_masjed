import { redirect } from 'next/navigation';
import { getUserFromCookies } from './session';

export async function requireAdmin() {
  const user = await getUserFromCookies();
  if (!user) redirect('/start');
  if (user.role !== 'admin') redirect('/');
  return user;
}
