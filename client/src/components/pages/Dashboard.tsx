import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import Admin from './Admin';
import SuperAdmin from './SuperAdmin';
import { useAuth } from '@/context/AuthContext';
import Loader from './Loader';
import DashboardCommonSection from './DashboardCommonSection';
import DashboardHeader from './DashboardHeader';
import type { User } from '@/services/user';

export default function Dashboard() {
  const { user, loading } = useAuth();
  const [loggedInUser, setLoggedInUser] = useState<User | null>(user || null);
  const navigate = useNavigate();

  useEffect(() => {
    setLoggedInUser(user || null);
  }, [user]);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto mt-10 px-4 flex flex-col items-center">
        <h1 className="text-3xl font-bold mb-6">Dashboard</h1>
        <Loader text="Loading your dashboard..." />
      </div>
    );
  }

  if (loggedInUser) {
    switch (loggedInUser?.role) {
      case 'superadmin':
        return (
          <>
            <DashboardHeader
              title="Super Admin Dashboard"
              name={loggedInUser?.name || 'Guest'}
            />
            <SuperAdmin />
            <DashboardCommonSection />
          </>
        );
      case 'admin':
        return (
          <>
            <DashboardHeader
              title="Admin Dashboard"
              name={loggedInUser?.name || 'Guest'}
            />
            <Admin />
            <DashboardCommonSection />
          </>
        );
      default:
        return (
          <>
            <DashboardHeader
              title="Member Dashboard"
              name={loggedInUser?.name || 'Guest'}
            />
            <DashboardCommonSection />
          </>
        );
    }
  } else {
    return (
      <div className="max-w-4xl mx-auto mt-10 px-4">
        <h1 className="text-3xl font-bold mb-6">Dashboard</h1>
        <p className="text-gray-600 mb-6">
          You are not logged in. Please log in to access your dashboard.
        </p>
        <Button onClick={() => navigate('/login')}>Login</Button>
      </div>
    );
  }
}
