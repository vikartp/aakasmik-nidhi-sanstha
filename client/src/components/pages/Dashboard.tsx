import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import type { User } from '@/types/users';
import { UploadScreenshot } from './UploadScreenshot';
import { useState } from 'react';
import Admin from './Admin';
import api from '@/services/api';
import SuperAdmin from './SuperAdmin';
import Member from './Member';
import { useAuth } from '@/context/AuthContext';

export default function Dashboard() {
  const { user } = useAuth();
  const [loggedInUser] = useState<User | null>(user || null);

  if (!loggedInUser) {
    return (
      <div className="max-w-4xl mx-auto mt-10 px-4">
        <h1 className="text-3xl font-bold mb-6">Dashboard</h1>
        <p className="text-gray-600 mb-6">
          You are not logged in. Please log in to access your dashboard.
        </p>
      </div>
    );
  }
  if (!loggedInUser.role) {
    return (
      <div className="max-w-4xl mx-auto mt-10 px-4">
        <h1 className="text-3xl font-bold mb-6">Dashboard</h1>
        <p className="text-gray-600 mb-6">
          Your account does not have a role assigned. Please contact support.
        </p>
      </div>
    );
  }

  switch (loggedInUser?.role) {
    case 'superadmin':
      return (
        <>
          <DashboardHeader
            title="Super Admin Dashboard"
            name={loggedInUser?.name || 'Guest'}
          />
          <UploadScreenshot />
          <SuperAdmin />
        </>
      );
    case 'admin':
      return (
        <>
          <DashboardHeader
            title="Admin Dashboard"
            name={loggedInUser?.name || 'Guest'}
          />
          <UploadScreenshot />
          <Admin />
        </>
      );
    default:
      return (
        <>
          <DashboardHeader
            title="Member Dashboard"
            name={loggedInUser?.name || 'Guest'}
          />
          <UploadScreenshot />
          <Member />
        </>
      );
  }
}

function DashboardHeader({ title, name }: { title: string; name: string }) {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      const res = await api.post('/auth/logout', {});
      alert(res.data.message);
    } catch (error) {
      console.error('Logout failed:', error);
    }
    navigate('/logout');
  };

  return (
    <div className="flex justify-between items-center mb-4">
      <div className="text-2xl font-bold">
        <p>{title}</p>
        <p>({name})</p>
      </div>
      <Button onClick={handleLogout}>Logout</Button>
    </div>
  );
}
