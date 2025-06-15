import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';
import api from '@/services/api';
import { toast } from 'react-toastify';
import type { AxiosError } from 'axios';
import Loader from './Loader';

export function Login() {
  const [mobile, setMobile] = useState('');
  const [password, setPassword] = useState('');
  const [isWaiting, setIsWaiting] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleLogin = async () => {
    try {
      setIsWaiting(true);
      const res = await api.post('/auth/login', { mobile, password });
      login();
      navigate('/dashboard');
      toast.success(res.data.message);
    } catch (err: unknown) {
      console.error(err);
      let errorMessage = 'Login failed. Please try again.';
      if (err && typeof err === 'object' && 'isAxiosError' in err) {
        const axiosError = err as AxiosError<{ message?: string }>;
        const status = axiosError.response?.status;
        if (status === 401) {
          toast.error(axiosError.response?.data?.message ?? errorMessage);
        } else if (status === 403) {
          toast.info(
            axiosError.response?.data?.message ??
              'You do not have permission to access this resource.'
          );
        } else if (status === 500) {
          errorMessage = 'Server error. Please try again later.';
        } else if (axiosError.response?.data?.message) {
          errorMessage = axiosError.response.data.message;
        } else {
          toast.error(errorMessage);
        }
      }
    } finally {
      setIsWaiting(false);
    }
  };

  return (
    <div
      className="max-w-md mx-auto space-y-4"
      onKeyDown={e => {
        if (e.key === 'Enter' && mobile && password) {
          handleLogin();
        }
      }}
    >
      {isWaiting && <Loader text="Logging in..." />}
      <Input
        placeholder="Mobile Number"
        value={mobile}
        onChange={e => setMobile(e.target.value)}
      />
      <Input
        type="password"
        placeholder="Password"
        value={password}
        onChange={e => setPassword(e.target.value)}
      />
      <div className="flex items-center">
        <Button
          onClick={handleLogin}
          disabled={!mobile || !password || isWaiting}
        >
          Login
        </Button>
        <span
          className="ml-4 text-blue-600 cursor-pointer hover:underline align-middle"
          onClick={() => navigate('/forgot-password')}
        >
          Forgot password?
        </span>
      </div>
      <div className="text-center">
        <p className="text-sm text-gray-500">
          Don't have an account?{' '}
          <span
            className="text-blue-600 cursor-pointer hover:underline"
            onClick={() => navigate('/register')}
          >
            Register here
          </span>
        </p>
      </div>
    </div>
  );
}
