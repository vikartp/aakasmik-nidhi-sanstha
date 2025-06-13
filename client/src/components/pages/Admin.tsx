import { useAuth } from '@/context/AuthContext';
import { ScreenshotTable } from './ScreenshotTable';
import UserTable from './UserTable';
import { useEffect } from 'react';

/**
 * Notes: Admin has the ability to manage members and view screenshots.
 */
export default function Admin() {
  const { user } = useAuth();
  console.log('Admin user:', user);

  useEffect(() => {});
  return (
    <>
      <UserTable role={user?.role} />
      <ScreenshotTable />
    </>
  );
}
