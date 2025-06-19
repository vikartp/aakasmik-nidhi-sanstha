import { useState } from 'react';
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from '../ui/table';
import { Button } from '../ui/button';
import Loader from './Loader';
import type { Contribution } from '@/services/contribution';
import { getMonthName, getYear } from '@/lib/utils';
import { getScreenshotById } from '@/services/screenshot';

interface UserContributionProps {
  contributions: Contribution[];
  showHeader?: boolean;
  headerText?: string;
}

export default function UserContribution({
  contributions,
  showHeader = true,
  headerText = 'Your Contributions',
}: UserContributionProps) {
  const [selectedScreenshot, setSelectedScreenshot] = useState<string | null>(
    null
  );
  const [screenshotUrl, setScreenshotUrl] = useState<string | null>(null);
  const [screenshotLoading, setScreenshotLoading] = useState(false);

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
    <div>
      {showHeader && <h2 className="text-xl font-bold mb-2">{headerText}</h2>}
      <div className="rounded border overflow-hidden">
        <div>
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
          </Table>
        </div>
        <div style={{ maxHeight: 320, overflowY: 'auto' }}>
          <Table className="min-w-full">
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
