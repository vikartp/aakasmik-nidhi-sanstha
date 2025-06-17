import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import api from '@/services/api';
import { toast } from 'react-toastify';
import type { AxiosError } from 'axios';
import Loader from './Loader';
import { UserPlus } from 'lucide-react';

export function Register() {
  const [isWaiting, setIsWaiting] = useState(false);
  const [form, setForm] = useState({
    name: '',
    fatherName: '',
    email: '',
    mobile: '',
    occupation: '',
    password: '',
    secretKey: '',
  });
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async () => {
    try {
      setIsWaiting(true);
      await api.post('/auth/register', form);
      toast.success('Registered! Please login.', { autoClose: 1000 });
      navigate('/');
    } catch (err) {
      console.error(err);
      let errorMessage = 'Registration failed. Please try again.';
      if (err && typeof err === 'object' && 'isAxiosError' in err) {
        const axiosError = err as AxiosError<{ message?: string }>;
        if (axiosError.response?.data?.message) {
          errorMessage = axiosError.response.data.message;
        }
        toast.error(errorMessage);
      }
    } finally {
      setIsWaiting(false);
    }
  };

  return (
    <div className="max-w-md mx-auto space-y-4">
      {isWaiting && (
        <div className="flex justify-center">
          <Loader text="Trying to register 🏃‍♂️. Please wait..." />
        </div>
      )}
      {[
        'name',
        'fatherName',
        'email',
        'mobile',
        'occupation',
        'password',
        'secretKey',
      ].map(key => (
        <Input
          key={key}
          type={key === 'password' ? 'password' : 'text'}
          placeholder={key.replace(/([A-Z])/g, ' $1').toUpperCase()}
          name={key}
          value={form[key as keyof typeof form]}
          onChange={handleChange}
        />
      ))}
      <Button
        onClick={handleSubmit}
        disabled={
          !form['mobile'] ||
          !form['name'] ||
          !form['fatherName'] ||
          !form['password'] ||
          !form['secretKey'] ||
          isWaiting
        }
        className="flex items-center gap-2 px-5 py-2 rounded font-semibold shadow-sm transition-all duration-150 bg-gradient-to-r from-green-500 to-green-700 text-white hover:from-green-600 hover:to-green-800 hover:scale-105 dark:from-green-400 dark:to-green-600 dark:hover:from-green-500 dark:hover:to-green-700 focus:outline-none focus:ring-2 focus:ring-green-300 dark:focus:ring-green-800"
      >
        <UserPlus className="w-5 h-5" />
        Register
      </Button>
      <div className="text-center text-sm text-gray-500">
        Already have an account?{' '}
        <span
          onClick={() => navigate('/login')}
          className="text-blue-500 hover:underline"
        >
          Login
        </span>
      </div>
    </div>
  );
}
