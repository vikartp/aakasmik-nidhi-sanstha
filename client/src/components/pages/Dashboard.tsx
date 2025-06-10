import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import type { User } from '@/types/users';
import { UploadScreenshot } from '../UploadScreenshot';
import { useState } from 'react';
import Admin from './Admin';
import api from '@/services/api';

export default function Dashboard() {
  const navigate = useNavigate();
  const [loggedInUser] = useState<User | null>(() => {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  });
  const handleLogout = async () => {
    try {
      const res = await api.post('/auth/logout', {});
      alert(res.data.message);
    } catch (error) {
      console.error('Logout failed:', error);
    }
    navigate('/logout');
  };

  switch (loggedInUser?.role) {
    case 'admin':
      return (
        <div>
          <div className="flex justify-between">
            <h1 className="text-3xl font-bold mb-4">Admin Dashboard</h1>
            <Button onClick={handleLogout}>Logout</Button>
          </div>
          <UploadScreenshot />
          <Admin />
        </div>
      );
    case 'superadmin':
      return (
        <div>
          <div className="flex justify-between">
            <h1 className="text-3xl font-bold mb-4">Superadmin Dashboard</h1>
            <Button onClick={() => navigate('/logout')}>Logout</Button>
          </div>
          <UploadScreenshot />
          <p className="text-gray-600 mb-6">Superadmin-specific content...</p>
        </div>
      );
    default:
      return (
        <div>
          <div>
            <div className="flex justify-between">
              <h1 className="text-3xl font-bold mb-4">
                Hi {loggedInUser?.name}
              </h1>
              <Button onClick={() => navigate('/logout')}>Logout</Button>
            </div>
            <p className="text-gray-600 mb-6">
              Welcome to the dashboard! Here you can upload screenshots.
            </p>
          </div>
          <UploadScreenshot />
        </div>
      );
  }
}
