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
import CreditScoreCard from './CreditScoreCard';
import { PortalGrid, type PortalFeature } from './PortalGrid';
import {
  IndianRupee,
  CalendarCheck,
  Banknote,
  HandHeart,
  KeyRound,
  Gamepad2,
  BadgeX,
} from 'lucide-react';

const MonthlyContributionChart = lazy(
  () => import('./MonthlyContributionChart')
);
const MonthlyStatusTable = lazy(() => import('./MonthlyStatusTable'));
const ExpenseTable = lazy(() => import('./ExpenseTable'));
const SahayataTable = lazy(() => import('./SahayataTable'));
const UserSecret = lazy(() => import('./UserSecret'));
const SnakeGame = lazy(() => import('../SnakeGame'));
const QuizSection = lazy(() => import('../QuizSection'));

function SectionLoader({ text = 'लोड हो रहा है...' }: { text?: string }) {
  return (
    <div className="w-full bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-3 sm:p-4 mb-4 sm:mb-6 flex items-center justify-center min-h-[120px] sm:min-h-[200px]">
      <div className="flex flex-col items-center gap-3">
        <div className="animate-spin rounded-full h-6 w-6 sm:h-8 sm:w-8 border-2 border-gray-200 border-t-blue-500"></div>
        <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">
          {text}
        </p>
      </div>
    </div>
  );
}

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

  // Portal active tab
  const [activeTab, setActiveTab] = useState<string | null>(null);

  const handleTabChange = (tab: string | null) => {
    setActiveTab(tab);
  };

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

  const memberFeatures: PortalFeature[] = [
    {
      id: 'contribution',
      title: 'मेरा योगदान',
      description: 'अपना योगदान इतिहास देखें',
      icon: <IndianRupee />,
      colorClass: 'text-emerald-500 bg-emerald-500/10',
    },
    {
      id: 'monthly-status',
      title: 'मासिक स्थिति',
      description: 'मासिक भुगतान की स्थिति',
      icon: <CalendarCheck />,
      colorClass: 'text-blue-500 bg-blue-500/10',
    },
    {
      id: 'expenses',
      title: 'खर्च विवरण',
      description: 'संस्था के खर्चों का विवरण',
      icon: <Banknote />,
      colorClass: 'text-orange-500 bg-orange-500/10',
    },
    {
      id: 'sahayata',
      title: 'सहायता',
      description: 'सहायता निधि की जानकारी',
      icon: <HandHeart />,
      colorClass: 'text-teal-500 bg-teal-500/10',
    },
    {
      id: 'secret',
      title: 'गोपनीय जानकारी',
      description: 'आपकी गोपनीय जानकारी',
      icon: <KeyRound />,
      colorClass: 'text-purple-500 bg-purple-500/10',
    },
    {
      id: 'funzone',
      title: 'मनोरंजन',
      description: 'खेल और क्विज़',
      icon: <Gamepad2 />,
      colorClass: 'text-pink-500 bg-pink-500/10',
    },
  ];

  return (
    <>
      {/* ── Hero Section: always visible ── */}
      <div className="w-full max-w-sm sm:max-w-md mx-auto mt-2 sm:mt-4 px-2">
        {currentMonthStatus === 'pending' && (
          <div className="mb-3 sm:mb-4 flex flex-col items-center border border-yellow-400 bg-yellow-100 dark:bg-yellow-900/60 rounded-lg p-3 sm:p-4 shadow">
            <span className="text-yellow-800 dark:text-yellow-100 font-semibold mb-1 text-sm sm:text-base flex items-center gap-2">
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
          <div className="mb-3 sm:mb-4 flex flex-col items-center border border-red-400 bg-red-100 dark:bg-red-900/60 rounded-lg p-3 sm:p-4 shadow">
            <span className="text-red-800 dark:text-red-100 font-semibold mb-1 text-sm sm:text-base flex items-center gap-2">
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
          <div className="mb-3 sm:mb-4 flex flex-col items-center border border-green-400 bg-green-100 dark:bg-green-900/60 rounded-lg p-3 sm:p-4 shadow">
            <span className="text-green-800 dark:text-green-100 font-semibold mb-1 text-sm sm:text-base flex items-center gap-2">
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
          <div className="mb-3 sm:mb-4 flex flex-col items-center border border-gray-300 bg-white dark:bg-gray-800 rounded-lg p-3 sm:p-4 shadow">
            <span className="text-blue-700 dark:text-blue-200 font-semibold mb-2 text-sm sm:text-base">
              आपका अपलोड किया गया स्क्रीनशॉट
            </span>
            <img
              src={currentMonthScreenshot.url}
              alt="Current Month Screenshot"
              className="rounded shadow w-full max-w-[250px] sm:max-w-xs h-auto object-contain border border-blue-200 dark:border-blue-700"
            />
          </div>
        )}
      </div>

      {/* ── Member Portal Card Grid ── */}
      <div className="mt-4 sm:mt-6 px-2">
        <PortalGrid
          portalTitle="मेंबर पोर्टल"
          features={memberFeatures}
          activeFeature={activeTab}
          onSelectFeature={handleTabChange}
          backButtonText="मेंबर पोर्टल पर वापस जाएं"
          subtitleText="अपनी जानकारी देखने के लिए चुनें"
        >
          {activeTab === 'contribution' && (
            <UserContribution
              contributions={contributions}
              showHeader
              headerText="आपका योगदान"
            />
          )}

          {activeTab === 'monthly-status' && (
            <Suspense fallback={<SectionLoader />}>
              <MonthlyStatusTable />
            </Suspense>
          )}

          {activeTab === 'expenses' && (
            <Suspense fallback={<SectionLoader />}>
              <ExpenseTable />
            </Suspense>
          )}

          {activeTab === 'sahayata' && (
            <Suspense fallback={<SectionLoader />}>
              <SahayataTable />
            </Suspense>
          )}

          {activeTab === 'secret' && (
            <Suspense fallback={<SectionLoader />}>
              <UserSecret member={true} />
            </Suspense>
          )}

          {activeTab === 'funzone' && (
            <Suspense fallback={<SectionLoader />}>
              <SnakeGame />
              <QuizSection />
            </Suspense>
          )}
        </PortalGrid>
      </div>

      {/* ── Monthly Chart (always visible, lazy loaded) ── */}
      <div className="px-2 mt-4 sm:mt-6">
        <Suspense fallback={<SectionLoader text="चार्ट लोड हो रहा है..." />}>
          <MonthlyContributionChart />
        </Suspense>
      </div>

      {/* ── Total Amount ── */}
      {total > 0 && (
        <div className="text-center mt-4 sm:mt-6 px-2">
          <div className="bg-green-50/80 dark:bg-green-900/40 border border-green-100 dark:border-green-800/50 rounded-2xl p-3 sm:p-4 shadow-sm inline-block w-full max-w-[280px] sm:max-w-xs mx-auto backdrop-blur-sm">
            <div className="text-[10px] sm:text-xs font-semibold text-green-700/80 dark:text-green-400 mb-1 uppercase tracking-wider">
              अब तक कुल योगदान राशि
            </div>
            <div className="text-2xl sm:text-3xl font-black text-green-800 dark:text-green-300 mb-1 tracking-tight">
              ₹ {total.toLocaleString('en-IN')}
            </div>
            <div className="text-[9px] sm:text-[10px] text-gray-500 dark:text-gray-400 font-medium">
              (यह अब तक सभी सदस्यों द्वारा दिया गया कुल योगदान है)
            </div>
          </div>
        </div>
      )}

      {/* ── Credit Score Card ── */}
      <div className="w-full max-w-sm sm:max-w-md mx-auto mt-4 px-2">
        <CreditScoreCard score={user?.creditScore || 100} />
      </div>
    </>
  );
}
