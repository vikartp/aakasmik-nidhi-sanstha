import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useRef, useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import Loader from './Loader';
import api from '@/services/api';
import { toast } from 'react-toastify';
import { ArrowUpFromLine, LogOut } from 'lucide-react';
import EditProfile from './EditProfile';
import type { AxiosError } from 'axios';

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
      const timer = setTimeout(() => setShowProfileHint(false), 5000);
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
        <div className="flex flex-col gap-2 items-end">
          <Button
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 rounded font-semibold shadow-sm transition-all duration-150 bg-gradient-to-r from-red-500 to-red-700 text-white hover:from-red-600 hover:to-red-800 hover:scale-105 dark:from-red-400 dark:to-red-600 dark:hover:from-red-500 dark:hover:to-red-700 focus:outline-none focus:ring-2 focus:ring-red-300 dark:focus:ring-red-800"
          >
            <LogOut className="w-5 h-5" />
            Logout
          </Button>
          <EditProfile />
        </div>
      </div>
      {showProfileHint && (
        <div className="flex bg-black bg-opacity-80 text-white text-md px-3 py-1 rounded shadow z-20 whitespace-nowrap">
          <ArrowUpFromLine />
          <p>Change Profile Picture By Clicking Here ☝🏻</p>
        </div>
      )}
    </>
  );
}
