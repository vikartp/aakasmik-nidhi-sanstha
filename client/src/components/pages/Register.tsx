import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import api from '@/services/api';
import { toast } from 'react-toastify';
import type { AxiosError } from 'axios';
import Loader from './Loader';
import { UserPlus, Eye, EyeOff } from 'lucide-react';

export function Register() {
  const [isWaiting, setIsWaiting] = useState(false);
  const [form, setForm] = useState({
    name: '',
    fatherName: '',
    email: '',
    mobile: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [passwordStrength, setPasswordStrength] = useState('');
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (name === 'mobile') {
      // Only allow numeric input and max 10 digits
      setForm({ ...form, [name]: value.replace(/\D/g, '').slice(0, 10) });
    } else if (name === 'password') {
      setForm({ ...form, [name]: value });
      setPasswordStrength(getPasswordStrength(value));
    } else {
      setForm({ ...form, [name]: value });
    }
  };

  function getPasswordStrength(password: string) {
    if (password.length < 4) return 'Too short';
    if (password.length < 6) return 'Weak';
    if (/^(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*]).{6,}$/.test(password))
      return 'Strong';
    if (/^(?=.*[A-Z])(?=.*[0-9]).{6,}$/.test(password)) return 'Medium';
    return 'Weak';
  }

  const handleSubmit = async () => {
    setError(null);
    try {
      setIsWaiting(true);
      // Sanitize form data
      const sanitizedForm = {
        name: form.name.trim(),
        fatherName: form.fatherName.trim(),
        email: form.email.trim(),
        mobile: form.mobile.trim(),
        password: form.password.trim(),
      };
      await api.post('/auth/register', sanitizedForm);
      toast.success('Registered! Please login.', { autoClose: 1000 });
      navigate('/');
    } catch (err) {
      let errorMessage = 'Registration failed. Please try again.';
      if (err && typeof err === 'object' && 'isAxiosError' in err) {
        const axiosError = err as AxiosError<{ message?: string }>;
        if (axiosError.response?.data?.message) {
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
    <div className="max-w-md mx-auto space-y-4">
      {isWaiting && (
        <div className="flex justify-center">
          <Loader text="Trying to register 🏃‍♂️. Please wait..." />
        </div>
      )}
      {error && (
        <div className="bg-red-100 text-red-700 px-3 py-2 rounded text-sm border border-red-300">
          {error}
        </div>
      )}
      <div>
        <label htmlFor="name" className="block text-sm font-medium mb-1">
          NAME (नाम)
        </label>
        <Input
          id="name"
          name="name"
          placeholder="NAME"
          value={form.name}
          onChange={handleChange}
          autoComplete="name"
        />
      </div>
      <div>
        <label htmlFor="fatherName" className="block text-sm font-medium mb-1">
          FATHER NAME (पिता का नाम)
        </label>
        <Input
          id="fatherName"
          name="fatherName"
          placeholder="FATHER NAME"
          value={form.fatherName}
          onChange={handleChange}
          autoComplete="off"
        />
      </div>
      {/* <div>
      <label htmlFor="email" className="block text-sm font-medium mb-1">
        EMAIL (ईमेल)
      </label>
      <Input
        id="email"
        name="email"
        placeholder="EMAIL"
        value={form.email}
        onChange={handleChange}
        autoComplete="email"
        type="email"
      />
    </div> */}
      <div>
        <label htmlFor="mobile" className="block text-sm font-medium mb-1">
          MOBILE (मोबाइल)
        </label>
        <Input
          id="mobile"
          name="mobile"
          placeholder="MOBILE"
          value={form.mobile}
          onChange={handleChange}
          maxLength={10}
          pattern="[0-9]{10}"
          inputMode="numeric"
          autoComplete="tel"
        />
      </div>
      <div className="relative">
        <label htmlFor="password" className="block text-sm font-medium mb-1">
          PASSWORD (पासवर्ड)
        </label>
        <Input
          id="password"
          name="password"
          type={showPassword ? 'text' : 'password'}
          placeholder="PASSWORD"
          value={form.password}
          onChange={handleChange}
          autoComplete="new-password"
        />
        <button
          type="button"
          className="absolute right-3 top-10 -translate-y-1/2 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 focus:outline-none"
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
      {form.password && (
        <div
          className={`text-xs font-semibold mb-2 ${
            passwordStrength === 'Strong'
              ? 'text-green-600'
              : passwordStrength === 'Medium'
                ? 'text-yellow-600'
                : 'text-red-600'
          }`}
        >
          Password strength: {passwordStrength}
        </div>
      )}
      <Button
        onClick={handleSubmit}
        disabled={
          !form['mobile'] ||
          !form['name'] ||
          !form['fatherName'] ||
          !form['password'] ||
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
          className="text-blue-500 hover:underline cursor-pointer"
        >
          Login
        </span>
      </div>
    </div>
  );
}
