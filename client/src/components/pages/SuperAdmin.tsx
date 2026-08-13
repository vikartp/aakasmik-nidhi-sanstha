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
import FeedbackList from './Feedback';
import { PortalGrid, type PortalFeature } from './PortalGrid';
import {
  Users,
  Image as ImageIcon,
  KeyRound,
  MessageSquare,
  QrCode,
} from 'lucide-react';

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

  const [activeTab, setActiveTab] = useState<string | null>(null);

  const handleTabChange = (tab: string | null) => {
    setActiveTab(tab);
  };

  const superAdminFeatures: PortalFeature[] = [
    {
      id: 'users',
      title: 'Users',
      description: 'Manage members and roles',
      icon: <Users />,
      colorClass: 'text-blue-500 bg-blue-500/10',
    },
    {
      id: 'screenshots',
      title: 'Screenshots',
      description: 'Verify payments & bulk delete',
      icon: <ImageIcon />,
      colorClass: 'text-green-500 bg-green-500/10',
    },
    {
      id: 'secret',
      title: 'Secrets',
      description: 'Manage user secrets',
      icon: <KeyRound />,
      colorClass: 'text-purple-500 bg-purple-500/10',
    },
    {
      id: 'qrcode',
      title: 'QR Code',
      description: 'Upload payment QR code',
      icon: <QrCode />,
      colorClass: 'text-teal-500 bg-teal-500/10',
    },
    {
      id: 'feedback',
      title: 'Feedback',
      description: 'View member feedback',
      icon: <MessageSquare />,
      colorClass: 'text-pink-500 bg-pink-500/10',
    },
  ];

  return (
    <PortalGrid
      portalTitle="Super Admin Portal"
      features={superAdminFeatures}
      activeFeature={activeTab}
      onSelectFeature={handleTabChange}
    >
      {activeTab === 'users' && <UserTable role={user?.role} />}

      {activeTab === 'screenshots' && (
        <>
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
            {isDeleting && (
              <Loader text="Deleting screenshots, please wait..." />
            )}
          </div>
          <div className="rounded-md border overflow-y-auto max-h-80 sm:max-h-[500px]">
            <ScreenshotTable
              role={user?.role}
              refreshKey={screenshotRefresh}
              month={selectedMonth}
            />
          </div>
        </>
      )}

      {activeTab === 'secret' && <UserSecret />}

      {activeTab === 'qrcode' && (
        <div className="flex flex-col items-center gap-4">
          <p className="text-green-400">Upload QR Code</p>
          <UploadScreenshot isQrCode={true} />
        </div>
      )}

      {activeTab === 'feedback' && <FeedbackList />}
    </PortalGrid>
  );
}
