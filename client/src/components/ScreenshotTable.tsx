import { useEffect, useState } from "react"
import { getAllScreenshots } from "@/services/screenshot"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import type { Screenshot } from "@/types/screenshots"

export function ScreenshotTable() {
  const [data, setData] = useState<Screenshot[]>([])

  useEffect(() => {
    getAllScreenshots().then(setData).catch(console.error)
  }, [])

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
                  <TableCell>{new Date(item.uploadedAt).toLocaleString()}</TableCell>
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
  )
}
