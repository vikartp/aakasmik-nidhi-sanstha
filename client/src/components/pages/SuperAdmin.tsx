import { useAuth } from '@/context/AuthContext';
import { useEffect } from 'react';
import UserTable from './UserTable';
import { UploadScreenshot } from './UploadScreenshot';
import { ScreenshotTable } from './ScreenshotTable';
import { Button } from '../ui/button';
import api from '@/services/api';
import { toast } from 'react-toastify';
import UserSecret from './UserSecret';

/**
 * Notes:
 * SuperAdmin has the highest level of access.
 * SuperAdmin can manage all types of users and delete screenshots in bulk.
 */
export default function SuperAdmin() {
  const { user } = useAuth();
  console.log('SuperAdmin user:', user);

  useEffect(() => {}, []);

  const deleteScreenshotByMonth = async (month: string) => {
    if (user?.role !== 'superadmin') {
      console.error('Only superadmin can delete screenshots by month');
      return;
    }
    try {
      const response = await api.delete(`/screenshots/month/${month}`);
      console.log('Delete response:', response.data);
      toast.success(`Screenshots for month ${month} deleted successfully`);
    } catch (error) {
      console.error('Error deleting screenshots by month:', error);
      toast.error(
        'Failed to delete screenshots for this month. Please try again later.'
      );
    }
  };

  return (
    <>
      <div className="flex flex-col justify-center m-2 gap-4">
        <div className="flex justify-center items-center gap-4 m-4">
          <p className="text-green-400">Upload QR Code</p>
          <UploadScreenshot isQrCode={true} />
        </div>
        <h2 className="text-xl font-bold">User Management</h2>
        <UserTable role={user?.role} />
        <h2 className="text-xl font-bold">Screenshots Management</h2>
        <Button
          onClick={() =>
            deleteScreenshotByMonth(
              new Date().toLocaleString('default', { month: 'long' })
            )
          }
          variant={'destructive'}
        >
          Delete this month's screenshots
        </Button>
        <ScreenshotTable role={user?.role} />
        <UserSecret />
      </div>
    </>
  );
}
