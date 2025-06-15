import { useAuth } from '@/context/AuthContext';
import { ScreenshotTable } from './ScreenshotTable';
import UserTable from './UserTable';
import { useEffect } from 'react';
import UserSecret from './UserSecret';

/**
 * Notes: Admin has the ability to manage members and view screenshots.
 */
export default function Admin() {
  const { user } = useAuth();

  useEffect(() => {});
  return (
    <>
      <div className="flex flex-col gap-6">
        <h2 className="text-2xl font-bold mt-2">Manage Your Users</h2>
        <UserTable role={user?.role} />
        <h2 className="text-2xl font-bold mt-2">Manage Screenshots</h2>
        <p className="text-lg">
          You can click on <strong>View</strong> to see the details.
        </p>
        <ScreenshotTable role={user?.role} />
        <UserSecret />
      </div>
    </>
  );
}
