import { useAuth } from '@/context/AuthContext';
import { useState } from 'react';
import api from '@/services/api';
import { Button } from '../ui/button';
import { Copy } from 'lucide-react';
import { Input } from '../ui/input';

export default function UserSecret() {
  const { user } = useAuth();
  const [mobile, setMobile] = useState('');
  const [secret, setSecret] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  const handleGetSecret = async () => {
    if (user?.role !== 'admin' && user?.role !== 'superadmin') {
      setError('Only admins can access user secrets.');
      return;
    }
    setLoading(true);
    setError('');
    setSecret('');
    setCopied(false);
    try {
      const res = await api.get(`/users/secret/${mobile}`);
      setSecret(res.data.secret);
    } catch (err: unknown) {
      if (err && typeof err === 'object' && 'response' in err) {
        const errorObj = err as { response?: { data?: { message?: string } } };
        setError(errorObj.response?.data?.message || 'Failed to fetch secret');
      } else {
        setError('Failed to fetch secret');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (secret) {
      navigator.clipboard.writeText(secret);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <h2 className="text-2xl font-bold mt-2">Manage User Secrets</h2>
      <div className="mb-2">
        <h3 className="text-lg font-semibold mb-1">Important Guidelines:</h3>
        <ul className="list-disc list-inside text-lg">
          <li>
            You can generate or retrieve a secret key for any user by entering
            their mobile number.
          </li>
          <li>Please ensure the mobile number belongs to our member.</li>
          <li>
            This key is used for secure operations and should be kept
            confidential.
          </li>
          <li>
            Our members need this secret key to register them with the Aakasmik
            Nidhi online portal.
          </li>
          <li>They can use this key to change their password as well.</li>
        </ul>
      </div>
      <div className="flex flex-col sm:flex-row gap-2 items-center mt-4 w-full">
        <Input
          type="text"
          placeholder="Enter mobile number"
          value={mobile}
          onChange={e => setMobile(e.target.value)}
          className="w-full sm:w-auto"
        />
        <Button
          className="bg-blue-600 text-white px-4 py-1 rounded hover:bg-blue-700 disabled:opacity-50 w-full sm:w-auto"
          onClick={handleGetSecret}
          disabled={!mobile || loading}
        >
          {loading ? 'Fetching...' : 'Get Secret Key'}
        </Button>
      </div>
      {error && <div className="text-red-600">{error}</div>}
      {secret && (
        <div className="flex items-center gap-2 mt-4">
          <span className="font-mono px-2 py-1 rounded text-lg">{secret}</span>
          <Button
            className="px-2 py-1 rounded hover:bg-gray-400"
            onClick={handleCopy}
          >
            {copied ? 'Copied!' : 'Copy'}
            <Copy color="red" size={48} />
          </Button>
        </div>
      )}
    </div>
  );
}
