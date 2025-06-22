import { useEffect, useState } from 'react';
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
import { ScanEye, Trash2 } from 'lucide-react';
import { deleteContribution as deleteContributionApi } from '@/services/contribution';
import type { AxiosError } from 'axios';
import { toast } from 'react-toastify';

interface UserContributionProps {
  contributions: Contribution[];
  showHeader?: boolean;
  headerText?: string;
  enableDelete?: boolean;
}

export default function UserContribution({
  contributions,
  showHeader = true,
  headerText = 'Your Contributions',
  enableDelete = false,
}: UserContributionProps) {
  const [selectedScreenshot, setSelectedScreenshot] = useState<string | null>(
    null
  );
  const [screenshotUrl, setScreenshotUrl] = useState<string | null>(null);
  const [screenshotLoading, setScreenshotLoading] = useState(false);
  const [contributionsList, setContributionsList] = useState<Contribution[]>(
    []
  );

  useEffect(() => {
    setContributionsList(contributions);
  }, [contributions]);

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

  const handleDelete = async (contribution: Contribution) => {
    if (!window.confirm('Are you sure you want to delete this contribution?')) {
      return;
    }
    try {
      await deleteContributionApi(contribution._id);
      setContributionsList(prev =>
        prev.filter(c => c._id !== contribution._id)
      );
      toast.success('Contribution deleted successfully.');
    } catch (err) {
      let errorMsg = 'Failed to delete contribution.';
      if (
        err &&
        typeof err === 'object' &&
        'isAxiosError' in err &&
        (err as AxiosError).isAxiosError
      ) {
        const axiosErr = err as AxiosError<{ error?: string }>;
        errorMsg =
          axiosErr.response?.data?.error || axiosErr.message || errorMsg;
      } else if (err instanceof Error) {
        errorMsg = err.message;
      }
      toast.error(errorMsg);
    }
  };

  return (
    <div>
      {showHeader && <h2 className="text-xl font-bold mb-2">{headerText}</h2>}
      <div className="rounded border overflow-hidden">
        <Table className="min-w-full">
          <TableHeader>
            <TableRow>
              <TableHead>Month</TableHead>
              <TableHead>Year</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Verified By</TableHead>
              <TableHead>View</TableHead>
              {enableDelete && <TableHead>Delete</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {contributionsList.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center">
                  No contributions found.
                </TableCell>
              </TableRow>
            ) : (
              contributionsList.map(c => (
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
                  <TableCell>{c.verifiedBy}</TableCell>
                  <TableCell>
                    {c.screenshotId ? (
                      <Button
                        className="px-3 py-1 rounded bg-blue-600 text-white text-xs hover:bg-blue-700 transition"
                        onClick={() => handleView(c)}
                        disabled={
                          screenshotLoading && selectedScreenshot === c._id
                        }
                      >
                        {screenshotLoading && selectedScreenshot === c._id ? (
                          '...'
                        ) : (
                          <ScanEye />
                        )}
                      </Button>
                    ) : (
                      <span className="text-gray-400 text-xs">-</span>
                    )}
                  </TableCell>
                  {enableDelete && (
                    <TableCell>
                      <Button
                        className="px-3 py-1 rounded bg-red-600 text-white text-xs hover:bg-red-700 transition"
                        onClick={() => handleDelete(c)}
                      >
                        <Trash2 />
                      </Button>
                    </TableCell>
                  )}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
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
