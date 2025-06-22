import { useEffect, useState } from 'react';
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from '../ui/table';
import Loader from './Loader';
import type { Contribution } from '@/services/contribution';
import { getUsers, type User } from '@/services/user';
import {
  getScreenshotsByMonth,
  type Month,
  type Screenshot,
} from '@/services/screenshot';
import { getContributionsByYearAndMonth } from '@/services/contribution';
import { getMonthList } from '@/lib/utils';
import { toast } from 'react-toastify';
import { HandCoins, IndianRupee } from 'lucide-react';

export default function MonthlyStatusTable() {
  const [users, setUsers] = useState<User[]>([]);
  const [screenshots, setScreenshots] = useState<
    Record<string, Screenshot | undefined>
  >({});
  const [contributions, setContributions] = useState<
    Record<string, Contribution | undefined>
  >({});
  const [loading, setLoading] = useState(true);

  const monthList = getMonthList();
  const currentYear = new Date().getFullYear();
  const yearList = Array.from({ length: currentYear - 2024 + 1 }, (_, i) =>
    (2024 + i).toString()
  );
  const [selectedMonth, setSelectedMonth] = useState<string>(
    monthList[new Date().getMonth()]
  );
  const [selectedYear, setSelectedYear] = useState<string>(
    currentYear.toString()
  );

  useEffect(() => {
    setLoading(true);
    Promise.all([
      getUsers(),
      getScreenshotsByMonth(selectedMonth as Month),
      getContributionsByYearAndMonth(Number(selectedYear), selectedMonth),
    ])
      .then(([userList, allScreenshots, monthContributions]) => {
        const verifiedUsers = userList.filter((u: User) => u.verified);
        // Sort users alphabetically by name
        verifiedUsers.sort((a: User, b: User) => a.name.localeCompare(b.name));
        setUsers(verifiedUsers);
        // Map screenshots by userId (one per user per month)
        const screenshotsMap: Record<string, Screenshot> = {};
        allScreenshots.forEach((shot: Screenshot) => {
          screenshotsMap[shot.userId] = shot;
        });
        setScreenshots(screenshotsMap);
        // Map contributions by userId (one per user per month)
        const contributionsMap: Record<string, Contribution> = {};
        monthContributions.forEach((contrib: Contribution) => {
          contributionsMap[contrib.userId] = contrib;
        });
        setContributions(contributionsMap);
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
        toast.error('Failed to load monthly status data.');
      });
  }, [selectedMonth, selectedYear]);

  // Helper to get status and amount for a user
  const getStatusAndAmount = (userId: string) => {
    const contrib = contributions[userId];
    if (contrib) {
      return {
        status: 'Paid',
        amount: contrib.amount,
        verifiedBy: contrib.verifiedBy || '-',
        color: 'bg-green-100 text-green-800',
      };
    }
    const userScreenshot = screenshots[userId];
    if (userScreenshot && Number(selectedYear) === new Date().getFullYear()) {
      return {
        status: 'Pending',
        amount: '-',
        verifiedBy: '-',
        color: 'bg-yellow-100 text-yellow-800',
      };
    }
    return {
      status: 'Due',
      amount: '-',
      verifiedBy: '-',
      color: 'bg-red-100 text-red-800',
    };
  };

  return (
    <div className="mt-8 flex flex-col items-center w-full">
      {/* Month/Year Selectors Row */}
      <h1 className="flex items-center justify-center text-2xl font-extrabold mb-4 text-center bg-gradient-to-r from-green-400 via-blue-500 to-indigo-500 bg-clip-text text-transparent drop-shadow-lg dark:from-green-300 dark:via-blue-400 dark:to-indigo-400 py-2 rounded-xl shadow-md gap-2 select-none">
        <span className="inline-flex items-center bg-white/70 dark:bg-gray-900/70 rounded-full px-2 py-1 mr-2 shadow-sm">
          <HandCoins className="text-green-600 dark:text-green-400 w-7 h-7" />
        </span>
        <span className="">Monthly Contribution Status</span>
        <span className="inline-flex items-center bg-white/70 dark:bg-gray-900/70 rounded-full px-2 py-1 ml-2 shadow-sm">
          <IndianRupee className="text-blue-600 dark:text-blue-400 w-7 h-7" />
        </span>
      </h1>
      <div className="flex flex-row items-center gap-6 mb-4 w-full max-w-2xl justify-center bg-gradient-to-r from-blue-50 via-white to-green-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 rounded-xl py-4 shadow-md">
        <div className="flex flex-col items-start">
          <label
            htmlFor="month-select"
            className="text-sm font-semibold mb-1 text-gray-700 dark:text-gray-200 tracking-wide drop-shadow"
          >
            Month
          </label>
          <select
            id="month-select"
            value={selectedMonth}
            onChange={e => setSelectedMonth(e.target.value)}
            className="w-48 px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-400 dark:focus:ring-blue-600 text-base bg-white dark:bg-gray-900 dark:text-white shadow-sm transition-all duration-200 hover:border-blue-400 dark:hover:border-blue-400"
          >
            {monthList.map(month => (
              <option key={month} value={month}>
                {month}
              </option>
            ))}
          </select>
        </div>
        <div className="flex flex-col items-start">
          <label
            htmlFor="year-select"
            className="text-sm font-semibold mb-1 text-gray-700 dark:text-gray-200 tracking-wide drop-shadow"
          >
            Year
          </label>
          <select
            id="year-select"
            value={selectedYear}
            onChange={e => setSelectedYear(e.target.value)}
            className="w-36 px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-green-400 dark:focus:ring-green-600 text-base bg-white dark:bg-gray-900 dark:text-white shadow-sm transition-all duration-200 hover:border-green-400 dark:hover:border-green-400"
          >
            {yearList.map(year => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="rounded border w-full max-w-full overflow-x-auto">
        {loading ? (
          <Loader />
        ) : (
          <Table className="min-w-[600px] w-full">
            <TableHeader>
              <TableRow>
                <TableHead>Photo</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Verified By</TableHead>
                <TableHead>Father's Name</TableHead>
                <TableHead>Mobile</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map(user => {
                const { status, amount, color, verifiedBy } =
                  getStatusAndAmount(user._id);
                return (
                  <TableRow key={user._id}>
                    <TableCell>
                      {user.profileUrl ? (
                        <img
                          src={user.profileUrl}
                          alt={user.name}
                          className="w-10 h-10 rounded-full object-cover border border-gray-300"
                          style={{ minWidth: 32, minHeight: 32 }}
                        />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth={1.5}
                            stroke="currentColor"
                            className="w-6 h-6 text-gray-400"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M15.75 7.5a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.5 19.5a7.5 7.5 0 1115 0v.75A2.25 2.25 0 0117.25 22.5h-10.5A2.25 2.25 0 014.5 20.25v-.75z"
                            />
                          </svg>
                        </div>
                      )}
                    </TableCell>
                    <TableCell>{user.name}</TableCell>
                    <TableCell>
                      <span
                        className={`inline-block px-3 py-1 rounded-full font-semibold text-xs ${color}`}
                      >
                        {status}
                      </span>
                    </TableCell>
                    <TableCell>{amount}</TableCell>
                    <TableCell>{verifiedBy}</TableCell>
                    <TableCell>{user.fatherName || '-'}</TableCell>
                    <TableCell>{user.mobile || '-'}</TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
      </div>
    </div>
  );
}
