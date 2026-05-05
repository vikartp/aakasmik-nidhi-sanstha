import { useAuth } from '@/context/AuthContext';
import { useEffect, useState, lazy, Suspense } from 'react';
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
import { BadgeX } from 'lucide-react';
import ExpenseTable from './ExpenseTable';
import SnakeGame from '../SnakeGame';
import QuizSection from '../QuizSection';

const MonthlyContributionChart = lazy(
  () => import('./MonthlyContributionChart')
);

export default function Member({
  refreshKey,
  onFetchStatus,
}: {
  refreshKey?: number;
  onFetchStatus: (status: 'pending' | 'none' | 'verified' | 'rejected') => void;
}) {
  const { user } = useAuth();
  const [currentMonthScreenshot, setCurrentMonthScreenshot] =
    useState<Screenshot | null>(null);
  const [currentMonthStatus, setCurrentMonthStatus] = useState<
    'pending' | 'none' | 'verified' | 'rejected'
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
        setCurrentMonthScreenshot(shot);
        if (shot.verified) {
          setCurrentMonthStatus('verified');
          onFetchStatus('verified');
        } else if (shot.rejected) {
          setCurrentMonthStatus('rejected');
          onFetchStatus('rejected');
        } else {
          setCurrentMonthStatus('pending');
          onFetchStatus('pending');
        }
      } else {
        setCurrentMonthScreenshot(null);
        setCurrentMonthStatus('none');
        onFetchStatus('none');
      }
    });
  }, [user, refreshKey]);

  return (
    <>
      <div className="max-w-md mx-auto mt-4 px-2">
        {currentMonthStatus === 'pending' && (
          <div className="mb-4 flex flex-col items-center border border-yellow-400 bg-yellow-100 dark:bg-yellow-900/60 rounded-lg p-4 shadow">
            <span className="text-yellow-800 dark:text-yellow-100 font-semibold mb-1 text-base flex items-center gap-2">
              <svg
                className="w-5 h-5 text-yellow-500"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 8v4l3 3"
                ></path>
                <circle
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="2"
                  fill="none"
                ></circle>
              </svg>
              इस महीने का सत्यापन लंबित (Pending) है
            </span>
          </div>
        )}
        {currentMonthStatus === 'rejected' && (
          <div className="mb-4 flex flex-col items-center border border-red-400 bg-red-100 dark:bg-red-900/60 rounded-lg p-4 shadow">
            <span className="text-red-800 dark:text-red-100 font-semibold mb-1 text-base flex items-center gap-2">
              आपका स्क्रीनशॉट अस्वीकार कर दिया गया है. कृपया सही को पुनः अपलोड
              करें
              <BadgeX />
            </span>
            <span>
              <span className="text-red-600 dark:text-red-300 font-medium">
                कारण:
              </span>{' '}
              {currentMonthScreenshot?.rejected}
            </span>
          </div>
        )}
        {currentMonthStatus === 'verified' && (
          <div className="mb-4 flex flex-col items-center border border-green-400 bg-green-100 dark:bg-green-900/60 rounded-lg p-4 shadow">
            <span className="text-green-800 dark:text-green-100 font-semibold mb-1 text-base flex items-center gap-2">
              <svg
                className="w-5 h-5 text-green-500"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M5 13l4 4L19 7"
                ></path>
              </svg>
              इस महीने का स्क्रीनशॉट सत्यापित (Verified) है
            </span>
          </div>
        )}
        {currentMonthScreenshot && (
          <div className="mb-4 flex flex-col items-center border border-gray-300 bg-white dark:bg-gray-800 rounded-lg p-4 shadow">
            <span className="text-blue-700 dark:text-blue-200 font-semibold mb-2 text-base">
              आपका अपलोड किया गया स्क्रीनशॉट
            </span>
            <img
              src={currentMonthScreenshot.url}
              alt="Current Month Screenshot"
              className="rounded shadow max-w-xs w-full h-auto object-contain border border-blue-200 dark:border-blue-700"
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
        <div className="text-center mt-6 px-1">
          <div className="bg-green-50/80 dark:bg-green-900/40 border border-green-100 dark:border-green-800/50 rounded-2xl p-4 shadow-sm inline-block w-full max-w-xs mx-auto backdrop-blur-sm">
            <div className="text-xs font-semibold text-green-700/80 dark:text-green-400 mb-1 uppercase tracking-wider">
              अब तक कुल योगदान राशि
            </div>
            <div className="text-3xl font-black text-green-800 dark:text-green-300 mb-1 tracking-tight">
              ₹ {total.toLocaleString('en-IN')}
            </div>
            <div className="text-[10px] text-gray-500 dark:text-gray-400 font-medium">
              (यह अब तक सभी सदस्यों द्वारा दिया गया कुल योगदान है)
            </div>
          </div>
        </div>
      )}

      <div className="px-1 mt-6">
        <Suspense
          fallback={
            <div className="w-full bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-4 mb-6 flex items-center justify-center h-[340px]">
              <div className="flex flex-col items-center gap-3">
                <div className="animate-spin rounded-full h-8 w-8 border-2 border-gray-200 border-t-blue-500"></div>
                <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                  Loading chart...
                </p>
              </div>
            </div>
          }
        >
          <MonthlyContributionChart />
        </Suspense>
      </div>

      <ExpenseTable />
      <UserSecret member={true} />
      <SnakeGame />
      <QuizSection />
    </>
  );
}
