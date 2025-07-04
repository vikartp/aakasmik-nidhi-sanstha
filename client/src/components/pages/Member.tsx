import { useAuth } from '@/context/AuthContext';
import { useEffect, useState } from 'react';
import {
  getScreenshotsByUserIdAndMonth,
  type Screenshot,
} from '@/services/screenshot';
import { getContributionsByUser, getTotal } from '@/services/contribution';
import { getCurrentMonth } from '@/lib/utils';
import type { Contribution } from '@/services/contribution';
import UserContribution from './UserContribution';
import MonthlyStatusTable from './MonthlyStatusTable';
import UserSecret from './UserSecret';

export default function Member({ refreshKey }: { refreshKey?: number }) {
  const { user } = useAuth();
  const [currentMonthScreenshot, setCurrentMonthScreenshot] =
    useState<Screenshot | null>(null);
  const [currentMonthStatus, setCurrentMonthStatus] = useState<
    'pending' | 'none' | 'verified'
  >('none');
  const [contributions, setContributions] = useState<Contribution[]>([]);
  const [total, setTotal] = useState<number>(0);

  useEffect(() => {
    if (!user) return;

    // Fetch all contributions for the logged-in user
    getContributionsByUser(user._id).then(setContributions);

    // Calculate total contributions
    getTotal().then(setTotal);

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
          headerText="आपका योगदान"
        />
      </div>
      <div className="mt-8 px-2">
        <MonthlyStatusTable />
      </div>
      {total > 0 && (
        <div className="text-center mt-8 px-2">
          <div className="bg-green-50 dark:bg-green-900 rounded-lg p-4 shadow-md inline-block w-full max-w-xs mx-auto">
            <div className="text-base font-semibold text-green-700 dark:text-green-300 mb-1">
              Total Contributions Till Date
            </div>
            <div className="text-sm font-medium text-green-700 dark:text-green-300 mb-1">
              अब तक कुल योगदान राशि
            </div>
            <div className="text-2xl font-bold text-green-800 dark:text-green-200 mb-2">
              ₹ {total}
            </div>
            <div className="text-xs text-gray-700 dark:text-gray-300 leading-snug">
              (This is the total amount contributed by all members so far.)
              <br />
              (यह अब तक सभी सदस्यों द्वारा दिया गया कुल योगदान है।)
            </div>
          </div>
        </div>
      )}
      <UserSecret member={true} />
    </>
  );
}
