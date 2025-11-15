import { redirect } from 'next/navigation';
import { getUserFromCookies } from './session';

export function requireAdmin() {
  const user = getUserFromCookies();
  if (!user) redirect('/start');
  if (user.role !== 'admin') redirect('/');
  return user;
}
