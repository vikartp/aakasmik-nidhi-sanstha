import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ScreenshotTable } from "../ScreenshotTable";
import { getUsers } from "@/services/user";
import { useEffect, useState } from "react";
import type { User } from "@/types/users";

export default function Admin() {
  const [users, setUsers] = useState<User[]>([]);
  useEffect(() => {
    getUsers().then(setUsers).catch(console.error);
  }, []);

  return (
    <div>
      <p className="text-gray-600 mb-6">
        Welcome to the admin dashboard! Here you can manage users and view
        screenshots.
      </p>
      <h2 className="text-2xl font-bold mb-4">Member List</h2>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[50px]">#</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.length > 0 ? (
              users.map((user, index) => (
                <TableRow key={user._id || index}>
                  <TableCell>{index + 1}</TableCell>
                  <TableCell>{user.name}</TableCell>
                  <TableCell>{user.email}</TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={3} className="text-center">
                  No users found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <ScreenshotTable />
    </div>
  );
}
