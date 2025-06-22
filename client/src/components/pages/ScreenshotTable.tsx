import { useEffect, useState } from 'react';
import {
  deleteScreenshot,
  getAllScreenshots,
  getScreenshotsByMonth,
  type Month,
  type Screenshot,
} from '@/services/screenshot';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '../ui/button';
import { downloadImage } from '@/lib/utils';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import Loader from './Loader';
import type { UserRole } from '@/services/user';

export function ScreenshotTable({
  role,
  refreshKey,
  month,
}: {
  role: UserRole | undefined;
  refreshKey?: number;
  month?: Month;
}) {
  const [data, setData] = useState<Screenshot[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const navigate = useNavigate();

  useEffect(() => {
    setLoading(true);
    if (month) {
      // If a month is specified, filter screenshots by that month
      getScreenshotsByMonth(month)
        .then(response => {
          if (response.length === 0) {
            toast.info(`No screenshots found for ${month}.`, {
              autoClose: 2000,
            });
            setData([]);
          } else {
            setData(response);
          }
        })
        .catch(console.error)
        .finally(() => setLoading(false));
      return;
    }
    getAllScreenshots()
      .then(setData)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [refreshKey, month]);

  const handleDeleteScreenshot =
    (id: string, type: 'payment' | 'qrCode') => async () => {
      if (role !== 'superadmin') {
        toast('You do not have permission to delete screenshots.');
        return;
      }
      if (!confirm('Are you sure you want to delete this screenshot?')) {
        return;
      }
      if (type === 'qrCode') {
        toast.info('You cannot delete the QR Code screenshot.');
        return;
      }
      try {
        await deleteScreenshot(id);
        setData(data.filter(item => item._id !== id));
        toast.success('Screenshot deleted successfully.');
      } catch (error) {
        console.error('Error deleting screenshot:', error);
        toast.error('Failed to delete screenshot. Please try again later.');
      }
    };

  return (
    <div className="rounded-md border max-h-95 overflow-y-auto">
      {loading ? (
        <Loader />
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>#</TableHead>
              <TableHead>Preview</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
              <TableHead className="w-24">Download</TableHead>
              {role === 'superadmin' && (
                <TableHead className="w-24">Delete</TableHead>
              )}
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.length > 0 ? (
              data.map((item, index) => (
                <TableRow key={item._id}>
                  <TableCell>{index + 1}</TableCell>
                  <TableCell>
                    <img
                      src={item.url}
                      alt={`Screenshot ${index + 1}`}
                      className="w-32 h-auto rounded shadow"
                    />
                  </TableCell>
                  <TableCell>
                    {item.verified ? (
                      <span className="inline-block px-3 py-1 rounded-full bg-green-100 text-green-800 font-semibold text-xs">
                        Verified
                      </span>
                    ) : (
                      <span className="inline-block px-3 py-1 rounded-full bg-red-100 text-red-800 font-semibold text-xs">
                        Not Verified
                      </span>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="outline"
                      onClick={() => {
                        navigate(`/screenshot/${item._id}`);
                      }}
                    >
                      View
                    </Button>
                  </TableCell>
                  <TableCell className="text-center">
                    <Button
                      variant="outline"
                      onClick={() =>
                        downloadImage(item.url, `screenshot-${item._id}.png`)
                      }
                    >
                      Download
                    </Button>
                  </TableCell>
                  {role === 'superadmin' && (
                    <TableCell className="text-center">
                      <Button
                        variant="destructive"
                        onClick={handleDeleteScreenshot(item._id, item.type)}
                      >
                        Delete
                      </Button>
                    </TableCell>
                  )}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={role === 'superadmin' ? 6 : 5}
                  className="text-center"
                >
                  No screenshots found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
