import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getScreenshotById } from '@/services/screenshot';
import { getUserById } from '@/services/user';
import { Button } from '../ui/button';
import { toast } from 'react-toastify';
import type { Screenshot } from '@/types/screenshots';
import type { User } from '@/types/users';
import { createContribution } from '@/services/contribution';
import Loader from './Loader';
import { Input } from '../ui/input';

export default function ViewScreenshot() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [screenshot, setScreenshot] = useState<Screenshot | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [verifying, setVerifying] = useState(false);
  const [amount, setAmount] = useState('');

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        if (!id) throw new Error('No screenshot id');
        const screenshotData = await getScreenshotById(id);
        setScreenshot(screenshotData);
        const userData = await getUserById(screenshotData.userId);
        setUser(userData);
      } catch {
        toast.error('Failed to fetch screenshot or user details.');
      } finally {
        setLoading(false);
      }
    }
    if (id) fetchData();
  }, [id]);

  const handleVerify = async () => {
    if (!screenshot) return;
    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
      toast.error('Please enter a valid amount.');
      return;
    }
    if (
      !window.confirm(
        'Are you sure you want to verify this payment contribution?'
      )
    )
      return;
    setVerifying(true);
    try {
      await createContribution({
        userId: screenshot.userId,
        screenshotId: screenshot._id,
        amount: Number(amount),
        month: screenshot.uploadMonth,
        year: new Date(screenshot.uploadedAt).getFullYear(),
      });
      toast.success('Payment contribution verified and recorded!');
      navigate('/dashboard');
    } catch {
      toast.error('Failed to verify contribution.');
    } finally {
      setVerifying(false);
    }
  };

  if (loading) return <Loader text="Fetching screenshot details..." />;
  if (!screenshot || !user)
    return (
      <div className="p-8 text-center text-destructive dark:text-red-400">
        Not found.
      </div>
    );

  return (
    <div className="max-w-2xl mx-auto p-2 sm:p-4 bg-white dark:bg-zinc-900 rounded shadow mt-0">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-2 mb-3">
        <Button variant="outline" onClick={() => navigate('/dashboard')}>
          Back to Dashboard
        </Button>
      </div>
      <h2 className="text-lg font-bold mb-2 text-zinc-800 dark:text-zinc-100">
        Screenshot Details
      </h2>
      <div className="flex flex-col sm:flex-row sm:items-start sm:gap-6 mb-2">
        <div className="flex-1 space-y-1 text-sm">
          <div className="flex flex-row items-center gap-2">
            <span className="font-semibold text-zinc-700 dark:text-zinc-200">
              User:
            </span>
            <span className="text-zinc-900 dark:text-zinc-100 break-all">
              {user.name}
            </span>
          </div>
          <div className="flex flex-row items-center gap-2">
            <span className="font-semibold text-zinc-700 dark:text-zinc-200">
              Father's Name:
            </span>
            <span className="text-zinc-900 dark:text-zinc-100 break-all">
              {user.fatherName}
            </span>
          </div>
          <div className="flex flex-row items-center gap-2">
            <span className="font-semibold text-zinc-700 dark:text-zinc-200">
              Mobile:
            </span>
            <span className="text-zinc-900 dark:text-zinc-100 break-all">
              {user.mobile}
            </span>
          </div>
          <div className="flex flex-row items-center gap-2">
            <span className="font-semibold text-zinc-700 dark:text-zinc-200">
              Email:
            </span>
            <span className="text-zinc-900 dark:text-zinc-100 break-all">
              {user.email}
            </span>
          </div>
          <div className="flex flex-row items-center gap-2">
            <span className="font-semibold text-zinc-700 dark:text-zinc-200">
              Month:
            </span>
            <span className="text-zinc-900 dark:text-zinc-100">
              {screenshot.uploadMonth}
            </span>
          </div>
          <div className="flex flex-row items-center gap-2">
            <span className="font-semibold text-zinc-700 dark:text-zinc-200">
              Status:
            </span>
            {screenshot.verified ? (
              <span className="inline-block px-3 py-1 rounded-full bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 font-semibold text-xs ml-1">
                Verified
              </span>
            ) : (
              <span className="inline-block px-3 py-1 rounded-full bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 font-semibold text-xs ml-1">
                Not Verified
              </span>
            )}
          </div>
          <div className="flex flex-row items-center gap-2">
            <span className="font-semibold text-zinc-700 dark:text-zinc-200">
              Uploaded At:
            </span>
            <span className="text-zinc-900 dark:text-zinc-100">
              {new Date(screenshot.uploadedAt).toLocaleString()}
            </span>
          </div>
        </div>
        <div className="flex flex-col justify-center items-center mt-4 sm:mt-0 flex-shrink-0 w-full sm:w-auto">
          <Input
            type="number"
            min="1"
            step="any"
            placeholder="Enter amount"
            value={amount}
            onChange={e => setAmount(e.target.value)}
            className="mb-2 max-w-xs"
            disabled={verifying || screenshot.verified}
          />
          <Button
            className="w-auto"
            variant={screenshot.verified ? 'secondary' : 'default'}
            onClick={handleVerify}
            disabled={
              verifying ||
              screenshot.verified ||
              !amount ||
              isNaN(Number(amount)) ||
              Number(amount) <= 0
            }
          >
            {screenshot.verified ? (
              'Already Verified'
            ) : verifying ? (
              <Loader text="Verifying..." />
            ) : (
              'Verify Payment Contribution'
            )}
          </Button>
          <img
            src={screenshot.url}
            alt="Screenshot"
            className="rounded shadow max-w-xs w-full h-auto object-contain mt-4"
          />
        </div>
      </div>
    </div>
  );
}
