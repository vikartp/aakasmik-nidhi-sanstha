import { useEffect, useState } from 'react';
import { getAllScreenshots } from '@/services/screenshot';
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

export function ScreenshotTable() {
  const [data, setData] = useState<Screenshot[]>([]);

  useEffect(() => {
    getAllScreenshots().then(setData).catch(console.error);
  }, []);

  return (
    <div className="max-w-4xl mx-auto mt-10 px-4">
      <h2 className="text-2xl font-bold mb-4">Uploaded Screenshots</h2>
      <div className="rounded-md border overflow-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>#</TableHead>
              <TableHead>Preview</TableHead>
              <TableHead>Uploaded At</TableHead>
              <TableHead className="text-right">Actions</TableHead>
              <TableHead className="w-24">Download</TableHead>
              <TableHead className="w-24">Delete</TableHead>
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
                  <TableCell className="text-center">
                    <Button
                      variant="destructive"
                      onClick={() => {
                        if (
                          window.confirm(
                            'Are you sure you want to delete this screenshot?'
                          )
                        ) {
                          // Call delete API here
                          console.log(`Delete screenshot with ID: ${item._id}`);
                        }
                      }}
                    >
                      Delete
                    </Button>
                  </TableCell>
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
