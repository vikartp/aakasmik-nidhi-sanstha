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
      <div className="flex flex-col items-center justify-center gap-6">
        <h2 className='text-2xl font-bold mt-2'>Manage Your Users here</h2>
        <UserTable role={user?.role} />
        <h2 className='text-2xl font-bold mt-2'>Manage Screenshots here</h2>
        <p className='text-lg'>You can click on <strong>View</strong> to see the details.</p>
        <ScreenshotTable role={user?.role} />
      </div>
    </>
  );
}
