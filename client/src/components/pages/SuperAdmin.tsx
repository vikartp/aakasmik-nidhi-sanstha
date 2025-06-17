import { useAuth } from '@/context/AuthContext';
import { useEffect, useState } from 'react';
import UserTable from './UserTable';
import { UploadScreenshot } from './UploadScreenshot';
import { ScreenshotTable } from './ScreenshotTable';
import { Button } from '../ui/button';
import api from '@/services/api';
import { toast } from 'react-toastify';
import UserSecret from './UserSecret';
import Loader from './Loader';

/**
 * Notes:
 * SuperAdmin has the highest level of access.
 * SuperAdmin can manage all types of users and delete screenshots in bulk.
 */
export default function SuperAdmin() {
  const { user } = useAuth();
  const [isDeleting, setIsDeleting] = useState(false);
  const [screenshotRefresh, setScreenshotRefresh] = useState(0);

  useEffect(() => {}, []);

  const deleteScreenshotByMonth = async (month: string) => {
    if (user?.role !== 'superadmin') {
      console.error('Only superadmin can delete screenshots by month');
      return;
    }
    // Confirm deletion
    const confirmDelete = window.confirm(
      `Are you sure you want to delete all screenshots for the month of ${month}? This action cannot be undone.`
    );
    if (!confirmDelete) {
      return;
    }
    try {
      setIsDeleting(true);
      await api.delete(`/screenshots/month/${month}`);
      toast.success(`Screenshots for month ${month} deleted successfully`);
      setScreenshotRefresh(prev => prev + 1); // trigger refresh
    } catch (error) {
      console.error('Error deleting screenshots by month:', error);
      toast.error(
        'Failed to delete screenshots for this month. Please try again later.'
      );
    } finally {
      setIsDeleting(false);
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
        {isDeleting && <Loader text="Deleting screenshots, please wait..." />}
        <Button
          onClick={() =>
            deleteScreenshotByMonth(
              new Date().toLocaleString('default', { month: 'long' })
            )
          }
          variant={'destructive'}
          className="max-w-md mx-auto"
          disabled={isDeleting}
        >
          Delete this month's screenshots
        </Button>
        <ScreenshotTable role={user?.role} refreshKey={screenshotRefresh} />
        <UserSecret />
      </div>
    </>
  );
}
