import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useRef, useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import Loader from './Loader';
import api from '@/services/api';
import { toast } from 'react-toastify';
import { HomeIcon, LogOut } from 'lucide-react';
import EditProfile from './EditProfile';
import type { AxiosError } from 'axios';
import { getAvatarLink } from '@/lib/utils';

export default function DashboardHeader({
  title,
  name,
}: {
  title: string;
  name: string;
}) {
  const navigate = useNavigate();
  const { user, setUser } = useAuth();
  const [uploading, setUploading] = useState(false);
  const [showProfileHint, setShowProfileHint] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!user?.profileUrl) {
      setShowProfileHint(true);
      const timer = setTimeout(() => setShowProfileHint(false), 10000);
      return () => clearTimeout(timer);
    }
  }, [user?.profileUrl]);

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
    <>
      <div className="flex gap-1 mb-2">
        <Button
          className="flex items-center gap-2 px-2 py-3 text-base font-bold rounded-lg shadow-lg transition-all duration-300 bg-gradient-to-r from-green-500 via-teal-500 to-blue-500 text-white hover:from-green-600 hover:via-teal-600 hover:to-blue-600 hover:scale-105 hover:shadow-xl dark:from-green-400 dark:via-teal-400 dark:to-blue-400 dark:hover:from-green-500 dark:hover:via-teal-500 dark:hover:to-blue-500 focus:outline-none focus:ring-4 focus:ring-green-300 dark:focus:ring-green-700"
          onClick={() => navigate('/')}
        >
          <HomeIcon className="w-5 h-5" />
          होम पेज पर जाएं
        </Button>
        <EditProfile />
        <Button
          onClick={handleLogout}
          className="ml-auto flex items-center gap-2 px-4 py-2 rounded font-semibold shadow-sm transition-all duration-150 bg-gradient-to-r from-red-500 to-red-700 text-white hover:from-red-600 hover:to-red-800 hover:scale-105 dark:from-red-400 dark:to-red-600 dark:hover:from-red-500 dark:hover:to-red-700 focus:outline-none focus:ring-2 focus:ring-red-300 dark:focus:ring-red-800"
        >
          <LogOut className="w-5 h-5" />
          Logout
        </Button>
      </div>
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-4">
          <div
            className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center cursor-pointer overflow-hidden border-2 border-gray-300 hover:border-blue-400 transition relative"
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
            {
              <img
                src={user?.profileUrl || getAvatarLink(user?.name ?? 'User')}
                alt="Profile"
                className="object-cover w-full h-full rounded-full"
              />
            }
            <input
              type="file"
              accept="image/*"
              className="hidden"
              ref={fileInputRef}
              onChange={handleFileChange}
              disabled={uploading}
            />
          </div>
          <div className="text-xl font-bold">
            <p>{title}</p>
            <p>({name})</p>
          </div>
        </div>
      </div>
      {showProfileHint && (
        <div className="flex text-md px-1 py-2 rounded shadow z-20 whitespace-nowrap">
          <p>☝🏻इस आइकन पर क्लिक करके प्रोफ़ाइल चित्र अपडेट करें </p>
        </div>
      )}
    </>
  );
}
