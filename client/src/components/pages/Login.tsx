import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';
import api from '@/services/api';
import { toast } from 'react-toastify';
import type { AxiosError } from 'axios';

export function Login() {
  const [mobile, setMobile] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleLogin = async () => {
    try {
      const res = await api.post('/auth/login', { mobile, password });
      toast.success(res.data.message);
      login(res.data.accessToken);
      navigate('/dashboard');
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
      <Button onClick={handleLogin} disabled={!mobile || !password}>
        Login
      </Button>
    </div>
  );
}
