import { useEffect, useState } from 'react';
import { deleteScreenshot, getAllScreenshots } from '@/services/screenshot';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import type { Screenshot } from '@/types/screenshots';
import { Button } from '../ui/button';
import { downloadImage } from '@/lib/utils';
import type { UserRole } from '@/types/users';
import { toast } from 'react-toastify';

export function ScreenshotTable({ role }: { role: UserRole | undefined }) {
  const [data, setData] = useState<Screenshot[]>([]);

  useEffect(() => {
    getAllScreenshots().then(setData).catch(console.error);
  }, []);

  const handleDeleteScreenshot = (id: string, type: 'payment' | 'qrCode') => async () => {
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
  }

  return (
    <div className="max-w-4xl mx-auto px-4">
      <div className="rounded-md border overflow-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>#</TableHead>
              <TableHead>Preview</TableHead>
              <TableHead>Uploaded At</TableHead>
              <TableHead className="text-right">Actions</TableHead>
              <TableHead className="w-24">Download</TableHead>
              {/* Only show Delete column for superadmin */}
              {role === 'superadmin' && <TableHead className="w-24">Delete</TableHead>}
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
                    {new Date(item.uploadedAt).toLocaleString()}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="outline"
                      onClick={() => {
                        // Handle view details action
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
                  {/* Only show Delete button for superadmin */}
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
                <TableCell colSpan={3} className="text-center">
                  No screenshots found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
