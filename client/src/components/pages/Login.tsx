import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';
import api from '@/services/api';
import { toast } from 'react-toastify';
import type { AxiosError } from 'axios';
import Loader from './Loader';
import { LogIn, Eye, EyeOff } from 'lucide-react';

export function Login() {
  const [mobile, setMobile] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isWaiting, setIsWaiting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleLogin = async () => {
    setError(null);
    try {
      setIsWaiting(true);
      const res = await api.post('/auth/login', { mobile, password });
      localStorage.setItem('accessToken', res.data.accessToken);
      await login(); // Await user info fetch before navigating
      navigate('/dashboard');
      toast.success(res.data.message, { autoClose: 1000 });
    } catch (err: unknown) {
      let errorMessage = 'Login failed. Please try again.';
      if (err && typeof err === 'object' && 'isAxiosError' in err) {
        const axiosError = err as AxiosError<{ message?: string }>;
        const status = axiosError.response?.status;
        if (status === 401) {
          errorMessage = axiosError.response?.data?.message ?? errorMessage;
        } else if (status === 403) {
          errorMessage =
            axiosError.response?.data?.message ??
            'You do not have permission to access this resource.';
        } else if (status === 500) {
          errorMessage = 'Server error. Please try again later.';
        } else if (axiosError.response?.data?.message) {
          errorMessage = axiosError.response.data.message;
        }
      } else if (err instanceof Error) {
        errorMessage = err.message;
      }
      setError(errorMessage);
      toast.error(errorMessage);
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
      {error && (
        <div className="bg-red-100 text-red-700 px-3 py-2 rounded text-sm border border-red-300">
          {error}
        </div>
      )}
      <Input
        placeholder="Mobile Number"
        value={mobile}
        onChange={e => {
          const val = e.target.value.replace(/\D/g, '').slice(0, 10);
          setMobile(val);
        }}
        maxLength={10}
        pattern="[0-9]{10}"
        inputMode="numeric"
        autoComplete="tel"
      />
      <div className="relative">
        <Input
          type={showPassword ? 'text' : 'password'}
          placeholder="Password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          autoComplete="current-password"
        />
        <button
          type="button"
          className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 focus:outline-none"
          onClick={() => setShowPassword(v => !v)}
          tabIndex={-1}
          aria-label={showPassword ? 'Hide password' : 'Show password'}
        >
          {showPassword ? (
            <EyeOff className="w-5 h-5" />
          ) : (
            <Eye className="w-5 h-5" />
          )}
        </button>
      </div>
      <div className="flex items-center">
        <Button
          onClick={handleLogin}
          disabled={!mobile || !password || isWaiting}
          className="flex items-center gap-2 px-5 py-2 rounded font-semibold shadow-sm transition-all duration-150 bg-gradient-to-r from-blue-500 to-blue-700 text-white hover:from-blue-600 hover:to-blue-800 hover:scale-105 dark:from-blue-400 dark:to-blue-600 dark:hover:from-blue-500 dark:hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-300 dark:focus:ring-blue-800"
        >
          <LogIn className="w-5 h-5" />
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
