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
import type { Screenshot } from '@/types/screenshots';
import type { User } from '@/types/users';
import { getUsers } from '@/services/user';
import { getScreenshotsByMonth } from '@/services/screenshot';
import { getContributionsByYearAndMonth } from '@/services/contribution';
import { getCurrentMonth } from '@/lib/utils';
import { toast } from 'react-toastify';

export default function MonthlyStatusTable() {
  const [users, setUsers] = useState<User[]>([]);
  const [screenshots, setScreenshots] = useState<
    Record<string, Screenshot | undefined>
  >({});
  const [contributions, setContributions] = useState<
    Record<string, Contribution | undefined>
  >({});
  const [loading, setLoading] = useState(true);
  const month = getCurrentMonth();
  const year = new Date().getFullYear();

  useEffect(() => {
    setLoading(true);
    Promise.all([
      getUsers(),
      getScreenshotsByMonth(month),
      getContributionsByYearAndMonth(year, month),
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
  }, [month, year]);

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
    if (userScreenshot) {
      return {
        status: 'Pending',
        amount: '-',
        verifiedBy: '-',
        color: 'bg-yellow-100 text-yellow-800',
      };
    }
    return { status: 'Due', amount: '-', verifiedBy: '-', color: 'bg-red-100 text-red-800' };
  };

  return (
    <div className="mt-8 flex flex-col items-center w-full">
      <h2 className="text-xl font-bold mb-2 text-center">
        Monthly Status{' '}
        <span className="font-normal text-base">
          ({month} {year})
        </span>
      </h2>
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
                const { status, amount, color, verifiedBy } = getStatusAndAmount(user._id);
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
