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
import { Combobox } from './Combobox';
import type { ComboboxOption } from './Combobox';
import { getMonthList } from '@/lib/utils';
import type { Month } from '@/services/screenshot';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function SuperAdmin() {
  const { user } = useAuth();
  const [isDeleting, setIsDeleting] = useState(false);
  const [screenshotRefresh, setScreenshotRefresh] = useState(0);
  const [selectedMonth, setSelectedMonth] = useState<Month>(
    new Date().toLocaleString('default', { month: 'long' }) as Month
  );

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

  const frameworks: ComboboxOption<Month>[] = getMonthList().map(month => ({
    value: month as Month,
    label: month,
    selected: month === selectedMonth,
  }));

  return (
    <Tabs
      defaultValue="users"
      className="w-full max-w-full px-0 sm:px-2 md:px-4"
    >
      <TabsList className="w-full bg-muted border border-border rounded-t-lg flex justify-center gap-2 p-1 dark:bg-zinc-900 dark:border-zinc-700">
        <TabsTrigger value="users" className="flex-1 min-w-0 cursor-pointer">
          Users
        </TabsTrigger>
        <TabsTrigger
          value="screenshots"
          className="flex-1 min-w-0 cursor-pointer"
        >
          Screenshots
        </TabsTrigger>
        <TabsTrigger value="secret" className="flex-1 min-w-0 cursor-pointer">
          Secrets
        </TabsTrigger>
        <TabsTrigger value="qrcode" className="flex-1 min-w-0 cursor-pointer">
          QR Code
        </TabsTrigger>
      </TabsList>
      <TabsContent
        value="users"
        className="border border-border border-t-0 rounded-b-lg bg-background shadow-sm p-4 sm:p-6 dark:bg-zinc-900 dark:border-zinc-700 w-full"
      >
        <UserTable role={user?.role} />
      </TabsContent>
      <TabsContent
        value="screenshots"
        className="border border-border border-t-0 rounded-b-lg bg-background shadow-sm p-4 sm:p-6 dark:bg-zinc-900 dark:border-zinc-700 w-full"
      >
        <div className="flex flex-col sm:flex-row flex-wrap gap-4 items-center mb-2">
          <Combobox<Month>
            frameworks={frameworks}
            frameType="Month"
            onValueChange={setSelectedMonth}
          />
          <Button
            onClick={() => deleteScreenshotByMonth(selectedMonth)}
            variant={'destructive'}
            className="max-w-md"
            disabled={isDeleting}
          >
            {`Delete ${selectedMonth} screenshots`}
          </Button>
          {isDeleting && <Loader text="Deleting screenshots, please wait..." />}
        </div>
        <div className="rounded-md border overflow-y-auto max-h-80 sm:max-h-[500px]">
          <ScreenshotTable
            role={user?.role}
            refreshKey={screenshotRefresh}
            month={selectedMonth}
          />
        </div>
      </TabsContent>
      <TabsContent
        value="secret"
        className="border border-border border-t-0 rounded-b-lg bg-background shadow-sm p-4 sm:p-6 dark:bg-zinc-900 dark:border-zinc-700 w-full"
      >
        <UserSecret />
      </TabsContent>
      <TabsContent
        value="qrcode"
        className="border border-border border-t-0 rounded-b-lg bg-background shadow-sm p-4 sm:p-6 dark:bg-zinc-900 dark:border-zinc-700 w-full flex flex-col items-center gap-4"
      >
        <p className="text-green-400">Upload QR Code</p>
        <UploadScreenshot isQrCode={true} />
      </TabsContent>
    </Tabs>
  );
}
