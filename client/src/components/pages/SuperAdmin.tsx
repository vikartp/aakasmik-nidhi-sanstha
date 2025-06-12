import { useAuth } from '@/context/AuthContext';
import { useEffect } from 'react';
import UserTable from './UserTable';
import { UploadScreenshot } from './UploadScreenshot';

/**
 * Notes:
 * SuperAdmin has the highest level of access.
 * SuperAdmin can manage all types of users and delete screenshots in bulk.
 */
export default function SuperAdmin() {
  const { user } = useAuth();
  console.log('SuperAdmin user:', user);

  useEffect(() => {}, []);

  return (
    <>
      <div className="flex justify-center items-center gap-4 m-4">
        <p className='text-green-400'>Upload QR Code</p>
        <UploadScreenshot isQrCode={true} />
      </div>
      <h2 className="text-xl font-bold">User Management</h2>
      <UserTable role={user?.role} />
      <h2 className="text-xl font-bold">Screenshots Management</h2>
    </>
  );
}
