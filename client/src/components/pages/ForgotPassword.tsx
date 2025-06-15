import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { toast } from 'react-toastify';
import api from '@/services/api';
import type { AxiosError } from 'axios';
import { useNavigate } from 'react-router-dom';

export default function ForgotPassword() {
  const [mobile, setMobile] = useState('');
  const [secretKey, setSecretKey] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleForgotPassword = async () => {
    setLoading(true);
    try {
      await api.post('/auth/forgot-password', {
        mobile,
        secretKey,
        newPassword,
      });
      toast.success('Password reset successful!');
      navigate('/login');
    } catch (err) {
      if (err && typeof err === 'object' && 'isAxiosError' in err) {
        const axiosError = err as AxiosError<{ message?: string }>;
        if (axiosError.response?.data?.message) {
          toast.error(axiosError.response.data.message);
        } else {
          toast.error('An unexpected error occurred. Please try again.');
        }
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto space-y-4 mt-10">
      <h2 className="text-2xl font-bold mb-4 text-center">Forgot Password</h2>
      <Input
        placeholder="Mobile Number"
        value={mobile}
        onChange={e => setMobile(e.target.value)}
      />
      <Input
        placeholder="Secret Key"
        value={secretKey}
        onChange={e => setSecretKey(e.target.value)}
      />
      <Input
        type="password"
        placeholder="New Password"
        value={newPassword}
        onChange={e => setNewPassword(e.target.value)}
      />
      <Button
        onClick={handleForgotPassword}
        disabled={!mobile || !secretKey || !newPassword || loading}
        className="w-full"
      >
        {loading ? 'Resetting...' : 'Reset Password'}
      </Button>
      <p className="text-sm text-center text-gray-500">
        Remembered your password?{' '}
        <a href="/login" className="text-blue-500 hover:underline">
          Login
        </a>
      </p>
      <p className="text-sm text-center text-gray-500">
        Don't have an account?{' '}
        <a href="/register" className="text-blue-500 hover:underline">
          Register
        </a>
      </p>
    </div>
  );
}
