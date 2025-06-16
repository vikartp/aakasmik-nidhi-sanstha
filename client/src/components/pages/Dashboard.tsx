import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import type { User } from '@/types/users';
import { UploadScreenshot } from './UploadScreenshot';
import { useEffect, useState, useRef } from 'react';
import Admin from './Admin';
import api from '@/services/api';
import SuperAdmin from './SuperAdmin';
import Member from './Member';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'react-toastify';
import Loader from './Loader';
import type { AxiosError } from 'axios';

export default function Dashboard() {
  const { user } = useAuth();
  const [loggedInUser, setLoggedInUser] = useState<User | null>(user || null);
  const [refreshKey, setRefreshKey] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      setLoggedInUser(user);
    } else {
      setLoggedInUser(null);
    }
  }, [user]);

  const handleRefresh = () => setRefreshKey(k => k + 1);

  if (!loggedInUser) {
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
          <UploadScreenshot onUploadSuccess={handleRefresh} />
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
          <UploadScreenshot onUploadSuccess={handleRefresh} />
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
          <UploadScreenshot onUploadSuccess={handleRefresh} />
          <Member refreshKey={refreshKey} />
        </>
      );
  }
}

function DashboardHeader({ title, name }: { title: string; name: string }) {
  const navigate = useNavigate();
  const { user, setUser } = useAuth();
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleLogout = async () => {
    try {
      const res = await api.post('/auth/logout', {});
      toast.success(res.data.message, { autoClose: 1000 });
    } catch (error) {
      console.error('Logout failed:', error);
    }
    navigate('/logout');
  };

  const handleProfileClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const formData = new FormData();
    formData.append('profile', file);
    try {
      const res = await api.post('/users/upload-profile', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      toast.success('Profile image updated!', { autoClose: 1000 });
      // Refetch or update user context
      if (res.data.user) setUser(res.data.user);
    } catch (err) {
      let errorMessage = 'Failed to upload image. Please try again.';
      if (err && typeof err === 'object' && 'isAxiosError' in err) {
        const axiosError = err as AxiosError<{ message?: string }>;
        if (axiosError.response?.data?.message) {
          errorMessage = axiosError.response.data.message;
        }
        toast.error(errorMessage);
      }
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="flex justify-between items-center mb-4">
      <div className="flex items-center gap-4">
        <div
          className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center cursor-pointer overflow-hidden border-2 border-gray-300 hover:border-blue-400 transition relative"
          onClick={handleProfileClick}
          title="Change profile picture"
        >
          {uploading && (
            <div className="absolute inset-0 bg-white bg-opacity-60 flex items-center justify-center z-10">
              <span className="text-xs text-gray-500 pt-4">
                <Loader text="" />
              </span>
            </div>
          )}
          {user?.profileUrl ? (
            <img
              src={user.profileUrl}
              alt="Profile"
              className="object-cover w-full h-full rounded-full"
            />
          ) : (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-8 h-8 text-gray-400"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15.75 7.5a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.5 19.5a7.5 7.5 0 1115 0v.75A2.25 2.25 0 0117.25 22.5h-10.5A2.25 2.25 0 014.5 20.25v-.75z"
              />
            </svg>
          )}
          <input
            type="file"
            accept="image/*"
            className="hidden"
            ref={fileInputRef}
            onChange={handleFileChange}
            disabled={uploading}
          />
        </div>
        <div className="text-2xl font-bold">
          <p>{title}</p>
          <p>({name})</p>
        </div>
      </div>
      <Button onClick={handleLogout}>Logout</Button>
    </div>
  );
}
