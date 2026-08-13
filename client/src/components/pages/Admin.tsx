import { useAuth } from '@/context/AuthContext';
import { ScreenshotTable } from './ScreenshotTable';
import UserTable from './UserTable';
import { useEffect, useState } from 'react';
import { Combobox } from './Combobox';
import type { ComboboxOption } from './Combobox';
import { getMonthList } from '@/lib/utils';
import type { Month } from '@/services/screenshot';
import FeedbackList from './Feedback';
import UserSecret from './UserSecret';
import ExpenseDashboard from './ExpenseDasboard';
import SahayataDashboard from './SahayataDashboard';
import { PortalGrid, type PortalFeature } from './PortalGrid';
import {
  Users,
  Image as ImageIcon,
  Banknote,
  KeyRound,
  MessageSquare,
  HandHeart,
} from 'lucide-react';

/**
 * Notes: Admin has the ability to manage members and view screenshots.
 */
export default function Admin() {
  const { user } = useAuth();
  const [selectedMonth, setSelectedMonth] = useState<Month>(
    new Date().toLocaleString('default', { month: 'long' }) as Month
  );
  const frameworks: ComboboxOption<Month>[] = getMonthList().map(month => ({
    value: month as Month,
    label: month,
    selected: month === selectedMonth,
  }));

  const handleValueChange = (newValue: Month) => {
    setSelectedMonth(newValue);
  };

  const [activeTab, setActiveTab] = useState<string | null>(null);

  const handleTabChange = (tab: string | null) => {
    setActiveTab(tab);
  };

  useEffect(() => {});

  const adminFeatures: PortalFeature[] = [
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
      description: 'Verify monthly payments',
      icon: <ImageIcon />,
      colorClass: 'text-green-500 bg-green-500/10',
    },
    {
      id: 'sahayata',
      title: 'Sahayata',
      description: 'Manage sahayata requests',
      icon: <HandHeart />,
      colorClass: 'text-teal-500 bg-teal-500/10',
    },
    {
      id: 'expenses',
      title: 'Expenses',
      description: 'Track org expenses',
      icon: <Banknote />,
      colorClass: 'text-orange-500 bg-orange-500/10',
    },
    {
      id: 'secret',
      title: 'Secrets',
      description: 'Manage user secrets',
      icon: <KeyRound />,
      colorClass: 'text-purple-500 bg-purple-500/10',
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
    <>
      <PortalGrid
        portalTitle="Admin Portal"
        features={adminFeatures}
        activeFeature={activeTab}
        onSelectFeature={handleTabChange}
      >
        {activeTab === 'users' && <UserTable role={user?.role} />}
        {activeTab === 'screenshots' && (
          <>
            <Combobox<Month>
              frameworks={frameworks}
              frameType="Month"
              onValueChange={handleValueChange}
            />
            <p className="text-lg mt-4 text-gray-700 dark:text-gray-300">
              You can click on <strong>View</strong> to see the details and
              verify that.
            </p>
            <ScreenshotTable role={user?.role} month={selectedMonth} />
          </>
        )}
        {activeTab === 'expenses' && <ExpenseDashboard />}
        {activeTab === 'secret' && <UserSecret />}
        {activeTab === 'feedback' && <FeedbackList />}
        {activeTab === 'sahayata' && <SahayataDashboard />}
      </PortalGrid>
    </>
  );
}
