import { useAuth } from '@/context/AuthContext';
import { useEffect, useState } from 'react';
import { getScreenshotsByUserIdAndMonth } from '@/services/screenshot';
import { getContributionsByUser } from '@/services/contribution';
import { getCurrentMonth } from '@/lib/utils';
import type { Screenshot } from '@/types/screenshots';
import type { Contribution } from '@/services/contribution';
import UserContribution from './UserContribution';
import MonthlyStatusTable from './MonthlyStatusTable';

export default function Member({ refreshKey }: { refreshKey?: number }) {
  const { user } = useAuth();
  const [currentMonthScreenshot, setCurrentMonthScreenshot] =
    useState<Screenshot | null>(null);
  const [currentMonthStatus, setCurrentMonthStatus] = useState<
    'pending' | 'none' | 'verified'
  >('none');
  const [contributions, setContributions] = useState<Contribution[]>([]);

  useEffect(() => {
    if (!user) return;

    // Fetch all contributions for the logged-in user
    getContributionsByUser(user._id).then(setContributions);

    // Check for current month screenshot
    const currentMonth = getCurrentMonth();
    getScreenshotsByUserIdAndMonth(user._id, currentMonth).then(screens => {
      if (screens && screens.length > 0) {
        const shot = screens[0];
        if (shot.verified) {
          setCurrentMonthStatus('verified');
        } else {
          setCurrentMonthScreenshot(shot);
          setCurrentMonthStatus('pending');
        }
      } else {
        setCurrentMonthScreenshot(null);
        setCurrentMonthStatus('none');
      }
    });
  }, [user, refreshKey]);

  return (
    <>
      <div className="max-w-md mx-auto mt-4 px-2">
        {currentMonthStatus === 'pending' && currentMonthScreenshot && (
          <div className="mb-4 flex flex-col items-center border border-yellow-300 bg-yellow-50 dark:bg-yellow-900 rounded p-3">
            <span className="text-yellow-800 dark:text-yellow-200 font-semibold mb-2">
              Pending verification for current month
            </span>
            <img
              src={currentMonthScreenshot.url}
              alt="Current Month Screenshot"
              className="rounded shadow max-w-xs w-full h-auto object-contain"
            />
          </div>
        )}
        <UserContribution
          contributions={contributions}
          showHeader
          headerText="Your Contributions"
        />
      </div>
      <div className="mt-8 px-2">
        <MonthlyStatusTable />
      </div>
    </>
  );
}
