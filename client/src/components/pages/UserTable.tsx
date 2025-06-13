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
import { makeAdminReq, verifyMemberReq } from '@/services/approval';

export default function UserTable({ role, defaultPage }: { role?: UserRole | undefined; defaultPage?: boolean }) {
  console.log('role:', role);
  const [users, setUsers] = useState<User[]>([]);
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await getUsers();
        console.log('Fetched users:', response);
        if (defaultPage) {
          setUsers(response.filter((user: User) => user.verified));
        } else {
          setUsers(response);
        }
        
      } catch (error) {
        console.error('Error fetching users:', error);
        toast.error('Failed to fetch users. Please try again later.');
      }
    };
    fetchUsers();
  }, [role, defaultPage]);

  const handleDeleteUser = (user: User) => async () => {
    if (role !== 'superadmin') {
      toast('You do not have permission to delete users.');
      return;
    }
    if (
      !confirm(
        `Are you sure you want to delete user ${user.name}? All screenshots will be deleted as well.`
      )
    ) {
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

  const makeAdmin = (user: User) => async () => {
    console.log('makeAdmin called for user:', user);
    if (role !== 'superadmin') {
      toast('You do not have permission to make users admins.');
      return;
    }
    try {
      await makeAdminReq(user._id);
      toast.success(`User ${user.name} is now an admin.`);
      setUsers(
        users.map(u => (u._id === user._id ? { ...u, role: 'admin' } : u))
      );
    } catch (error) {
      console.error('Error making user admin:', error);
      toast.error('Failed to make user admin. Please try again later.');
    }
  };

  const verifyMember = (user: User) => async () => {
    if (role !== 'admin') {
      toast('You do not have permission to make users members.');
      return;
    }
    try {
      await verifyMemberReq(user._id);
      toast.success(`User ${user.name} is now a verified member.`);
      setUsers(
        users.map(u => (u._id === user._id ? { ...u, verified: true } : u))
      );
    } catch (error) {
      console.error('Error verifying member:', error);
      toast.error('Failed to verify member. Please try again later.');
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
            <TableHead>Father Name</TableHead>
            {role === 'superadmin' && <TableHead>Delete</TableHead>}
            {role === 'superadmin' && <TableHead>Make Admin</TableHead>}
            {role === 'admin' && !defaultPage && <TableHead>Verify Member</TableHead>}
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.length > 0 ? (
            users.map((user, index) => (
              <TableRow key={user._id || index}>
                <TableCell>{index + 1}</TableCell>
                <TableCell>{user.name}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>{user.fatherName || '-'}</TableCell>
                {role === 'superadmin' && (
                  <TableCell>
                    <Button
                      onClick={handleDeleteUser(user)}
                      variant={'destructive'}
                      className="hover:underline"
                    >
                      Delete
                    </Button>
                  </TableCell>
                )}
                {role === 'superadmin' && isMakeAdminRequired(user) && (
                  <TableCell>
                    <Button
                      onClick={makeAdmin(user)}
                      variant={'default'}
                      className="hover:underline text-green-500"
                    >
                      Make Admin
                    </Button>
                  </TableCell>
                )}
                {
                  role === 'admin' && !user.verified && (
                    <TableCell>
                      <Button
                        onClick={verifyMember(user)}
                        variant={'default'}
                        className="hover:underline text-blue-500"
                      >
                        Verify Member
                      </Button>
                    </TableCell>
                  )
                }
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell
                colSpan={role === 'superadmin' ? 6 : 4}
                className="text-center"
              >
                No users found.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}

const isMakeAdminRequired = (user: User): boolean => {
  if (user.role !== 'admin' && user.role !== 'superadmin') {
    return true;
  }
  return false;
};
