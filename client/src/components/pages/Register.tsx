import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import api from '@/services/api';

export function Register() {
  const [form, setForm] = useState({
    name: '',
    fatherName: '',
    email: '',
    mobile: '',
    occupation: '',
    password: '',
  });
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async () => {
    try {
      await api.post('/auth/register', form);
      alert('Registered! Please login.');
      navigate('/login');
    } catch (err) {
      console.error(err);
      alert('Registration failed');
    }
  };

  return (
    <div className="max-w-md mx-auto space-y-4">
      {['name', 'fatherName', 'email', 'mobile', 'occupation', 'password'].map(
        key => (
          <Input
            key={key}
            type={key === 'password' ? 'password' : 'text'}
            placeholder={key.replace(/([A-Z])/g, ' $1').toUpperCase()}
            name={key}
            value={form[key as keyof typeof form]}
            onChange={handleChange}
          />
        )
      )}
      <Button
        onClick={handleSubmit}
        disabled={
          !form['mobile'] ||
          !form['name'] ||
          !form['fatherName'] ||
          !form['password']
        }
      >
        Register
      </Button>
    </div>
  );
}
