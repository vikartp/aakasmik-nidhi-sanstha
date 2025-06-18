import { useAuth } from '@/context/AuthContext';
import { useEffect, useState } from 'react';
import { getContributionsByUser } from '@/services/contribution';
import {
  getScreenshotById,
  getScreenshotsByUserIdAndMonth,
} from '@/services/screenshot';
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
import type { Month } from '@/services/screenshot';
import { Button } from '../ui/button';
import { getMonthName, getYear } from '@/lib/utils';

export default function Member({ refreshKey }: { refreshKey?: number }) {
  const { user } = useAuth();
  const [contributions, setContributions] = useState<Contribution[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedScreenshot, setSelectedScreenshot] = useState<string | null>(
    null
  );
  const [screenshotUrl, setScreenshotUrl] = useState<string | null>(null);
  const [screenshotLoading, setScreenshotLoading] = useState(false);
  const [currentMonthScreenshot, setCurrentMonthScreenshot] =
    useState<Screenshot | null>(null);
  const [currentMonthStatus, setCurrentMonthStatus] = useState<
    'pending' | 'none' | 'verified'
  >('none');

  useEffect(() => {
    if (!user) return;
    setLoading(true);
    getContributionsByUser(user._id)
      .then(setContributions)
      .finally(() => setLoading(false));

    // Check for current month screenshot
    const now = new Date();
    const month = now.toLocaleString('default', { month: 'long' }) as Month;
    getScreenshotsByUserIdAndMonth(user._id, month).then(screens => {
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

  const handleView = async (contribution: Contribution) => {
    if (!contribution.screenshotId) {
      setScreenshotUrl(null);
      setSelectedScreenshot(null);
      return;
    }
    setScreenshotLoading(true);
    setSelectedScreenshot(contribution._id);
    try {
      const screenshot = await getScreenshotById(contribution.screenshotId);
      setScreenshotUrl(screenshot.url);
    } catch {
      setScreenshotUrl(null);
    } finally {
      setScreenshotLoading(false);
    }
  };

  return (
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
      <h2 className="text-xl font-bold mb-2">Your Contributions</h2>
      {loading ? (
        <Loader text="Loading your contributions..." />
      ) : (
        <div className="rounded border overflow-hidden">
          <div style={{ maxHeight: 320, overflowY: 'auto' }}>
            <Table className="min-w-full">
              <TableHeader>
                <TableRow>
                  <TableHead>Month</TableHead>
                  <TableHead>Year</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Action</TableHead>
                  <TableHead>Verified By</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {contributions.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center">
                      No contributions found.
                    </TableCell>
                  </TableRow>
                ) : (
                  contributions.map(c => (
                    <TableRow
                      key={c._id}
                      className={
                        selectedScreenshot === c._id
                          ? 'bg-blue-50 dark:bg-blue-900'
                          : ''
                      }
                    >
                      <TableCell>{getMonthName(c.contributionDate)}</TableCell>
                      <TableCell>{getYear(c.contributionDate)}</TableCell>
                      <TableCell>₹{c.amount}</TableCell>
                      <TableCell>
                        {c.screenshotId ? (
                          <Button
                            className="px-3 py-1 rounded bg-blue-600 text-white text-xs hover:bg-blue-700 transition"
                            onClick={() => handleView(c)}
                            disabled={
                              screenshotLoading && selectedScreenshot === c._id
                            }
                          >
                            {screenshotLoading && selectedScreenshot === c._id
                              ? 'Loading...'
                              : 'Screenshot'}
                          </Button>
                        ) : (
                          <span className="text-gray-400 text-xs">-</span>
                        )}
                      </TableCell>
                      <TableCell>{c.verifiedBy}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      )}
      {selectedScreenshot && (
        <div className="mt-4 flex flex-col items-center">
          {screenshotLoading ? (
            <Loader text="Loading screenshot..." />
          ) : screenshotUrl ? (
            <img
              src={screenshotUrl}
              alt="Contribution Screenshot"
              className="rounded shadow max-w-xs w-full h-auto object-contain"
            />
          ) : (
            <span className="text-gray-500">
              No screenshot available for this contribution.
            </span>
          )}
        </div>
      )}
    </div>
  );
}
