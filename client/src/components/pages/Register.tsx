import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import api from '@/services/api';
import { toast } from 'react-toastify';
import type { AxiosError } from 'axios';
export function Register() {
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
      await api.post('/auth/register', form);
      toast.success('Registered! Please login.');
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
    }
  };

  return (
    <div className="max-w-md mx-auto space-y-4">
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
          !form['secretKey']
        }
      >
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
