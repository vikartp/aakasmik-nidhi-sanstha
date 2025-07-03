import {
  deleteUser,
  getUserInfoForPublic,
  getUsers,
  type User,
  type UserRole,
} from '@/services/user';
import { useEffect, useState } from 'react';
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
import Loader from './Loader';

export default function UserTable({
  role,
  defaultPage,
}: {
  role?: UserRole | undefined;
  defaultPage?: boolean;
}) {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        let userResponse = [];
        if (defaultPage) {
          userResponse = await getUserInfoForPublic();
        } else {
          userResponse = await getUsers();
        }
        userResponse.sort((a: User, b: User) => a.name.localeCompare(b.name));
        setUsers(userResponse);
      } catch (error) {
        console.error('Error fetching users:', error);
        toast.error('Failed to fetch users. Please try again later.');
      } finally {
        setLoading(false);
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
      toast(`User ${user.name} deleted successfully.`, { autoClose: 500 });
    } catch (error) {
      console.error('Error deleting user:', error);
      toast('Failed to delete user. Please try again later.');
    }
  };

  const makeAdmin = (user: User) => async () => {
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

  // Define columns dynamically based on context
  const rawColumns = [
    {
      key: 'index',
      label: '#',
      render: (_: User, idx: number) => idx + 1,
    },
    {
      key: 'profileUrl',
      label: 'Photo',
      render: (user: User) =>
        user.profileUrl ? (
          <img
            src={user.profileUrl}
            alt={user.name}
            className="w-10 h-10 rounded-full object-cover border border-gray-300"
            style={{ minWidth: 32, minHeight: 32 }}
          />
        ) : (
          <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-6 h-6 text-gray-400"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15.75 7.5a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.5 19.5a7.5 7.5 0 1115 0v.75A2.25 2.25 0 0117.25 22.5h-10.5A2.25 2.25 0 014.5 20.25v-.75z"
              />
            </svg>
          </div>
        ),
    },
    { key: 'name', label: 'Name', render: (user: User) => user.name },
    role === 'admin' &&
      !defaultPage && {
        key: 'verify',
        label: 'Member Action',
        render: (user: User) =>
          !user.verified ? (
            <Button
              onClick={verifyMember(user)}
              variant={'default'}
              className="px-4 py-1 rounded font-semibold shadow-sm transition-all duration-150 bg-gradient-to-r from-blue-500 to-blue-700 text-white hover:from-blue-600 hover:to-blue-800 hover:scale-105 dark:from-blue-400 dark:to-blue-600 dark:hover:from-blue-500 dark:hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-300 dark:focus:ring-blue-800"
            >
              Verify Member
            </Button>
          ) : (
            <div className="flex flex-row gap-2 items-center">
              <Button
                size="sm"
                variant="outline"
                className="text-xs px-2 py-1 border-blue-400 text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900"
                onClick={() =>
                  window.location.assign(`/admin/user/${user._id}`)
                }
              >
                User Dashboard
              </Button>
            </div>
          ),
      },
    !defaultPage && {
      key: 'mobile',
      label: 'Phone Number',
      render: (user: User) => user.mobile,
    },
    {
      key: 'fatherName',
      label: 'Father Name',
      render: (user: User) => user.fatherName || '-',
    },
    {
      key: 'membershipDate',
      label: 'Memberbership',
      render: (user: User) =>
        user.membershipDate
          ? new Date(user.membershipDate).toLocaleDateString('en-IN', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })
          : '-',
    },
    role === 'superadmin' &&
      !defaultPage && {
        key: 'delete',
        label: 'Delete',
        render: (user: User) => (
          <Button
            onClick={handleDeleteUser(user)}
            variant={'destructive'}
            className="hover:underline"
          >
            Delete
          </Button>
        ),
      },
    role === 'superadmin' &&
      !defaultPage && {
        key: 'makeAdmin',
        label: 'Make Admin',
        render: (user: User) =>
          isMakeAdminRequired(user) ? (
            <Button
              onClick={makeAdmin(user)}
              variant={'default'}
              className="hover:underline text-green-500"
            >
              Make Admin
            </Button>
          ) : null,
      },
  ];
  const columns = rawColumns.filter(Boolean) as Array<{
    key: string;
    label: string;
    render: (user: User, idx: number) => React.ReactNode;
  }>;

  return (
    <div className="rounded-md border max-h-95 overflow-y-auto">
      {loading ? (
        <Loader />
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              {columns.map(col => (
                <TableHead key={col.key}>{col.label}</TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.length > 0 ? (
              users.map((user, index) => (
                <TableRow key={user._id || index}>
                  {columns.map(col => (
                    <TableCell key={col.key}>
                      {col.render(user, index)}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="text-center">
                  No users found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      )}
    </div>
  );
}

const isMakeAdminRequired = (user: User): boolean => {
  if (user.role !== 'admin' && user.role !== 'superadmin') {
    return true;
  }
  return false;
};
