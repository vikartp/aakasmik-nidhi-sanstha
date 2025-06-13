import { deleteUser, getUsers } from '@/services/user';
import { useEffect, useState } from 'react';
import type { User, UserRole } from '@/types/users';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '../ui/button';
import { toast } from 'react-toastify';

export default function UserTable({ role }: { role: UserRole | undefined }) {
  console.log('role:', role);
  const [users, setUsers] = useState<User[]>([]);
  useEffect(() => {
    getUsers().then(setUsers).catch(console.error);
  }, []);
  const handleDeleteUser = (user: User) => async () => {
    if (role !== 'superadmin') {
      toast('You do not have permission to delete users.');
      return;
    }
    if (!confirm(`Are you sure you want to delete user ${user.name}?`)) {
      return;
    }
    try {
      await deleteUser(user._id);
      setUsers(users.filter(u => u._id !== user._id));
      toast(`User ${user.name} deleted successfully.`);
    } catch (error) {
      console.error('Error deleting user:', error);
      toast('Failed to delete user. Please try again later.');
    }
  };

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[50px]">#</TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Email</TableHead>
            {role === 'superadmin' && <TableHead>Delete</TableHead>}
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.length > 0 ? (
            users.map((user, index) => (
              <TableRow key={user._id || index}>
                <TableCell>{index + 1}</TableCell>
                <TableCell>{user.name}</TableCell>
                <TableCell>{user.email}</TableCell>
                {role === 'superadmin' && (
                  <TableCell>
                    <Button
                      onClick={handleDeleteUser(user)}
                      className="text-red-500 hover:underline"
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
                No users found.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
