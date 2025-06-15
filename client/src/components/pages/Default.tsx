import { useNavigate } from 'react-router-dom';
import { Button } from '../ui/button';
import { useEffect, useState } from 'react';
import type { Screenshot } from '@/types/screenshots';
import { getQrCode } from '@/services/screenshot';
import { downloadImage } from '@/lib/utils';
import { useAuth } from '@/context/AuthContext';
import UserTable from './UserTable';
import Loader from './Loader';

export function Default() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [qrCode, setQrCode] = useState<Screenshot | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchQrCode = async () => {
      try {
        setLoading(true);
        const response = await getQrCode();
        setQrCode(response);
      } catch (error) {
        console.error('Error fetching QR code:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchQrCode();
  }, []);

  return (
    <div className="flex flex-col justify-center -mt-2 gap-4">
      {user ? (
        <Button
          className="max-w-md mx-auto"
          onClick={() => navigate('/dashboard')}
        >
          Go to your Dashboard ❤️
        </Button>
      ) : (
        <div className="flex items-center justify-end space-x-4">
          <Button onClick={() => navigate('/register')}>Register</Button>
          <Button onClick={() => navigate('/login')}>Login</Button>
        </div>
      )}
      <h2 className="text-2xl font-semibold">
        🌍 Welcome to Contingency Fund Youth Association, Barkangango 🏡
      </h2>
      <p className="">
        At the heart of Barkangango village lies a strong spirit of unity,
        compassion, and mutual support — values that form the foundation of the
        Contingency Fund Youth Association, Barkangango. We are a
        community-driven group made up of hundreds of dedicated individuals who
        believe in standing by each other during times of crisis. Every month,
        each member contributes a small amount to a shared fund. This collective
        effort builds a financial safety net that can be used to support any
        member facing an unexpected emergency — be it a medical issue, natural
        disaster, or any urgent personal crisis. Our mission is simple yet
        powerful: "Together, we are stronger." Through regular contributions and
        transparent management, we ensure that help is always available when
        someone in our community needs it the most. By coming together, we not
        only share financial responsibility but also foster a deep sense of
        belonging, solidarity, and hope among the youth of our village.
      </p>

      <div className="max-w-md mx-auto flex flex-col justify-center">
        {loading && <Loader text="Loading QR Code..." />}
        {qrCode ? (
          <>
            <p className="text-lg text-center mb-4">
              Please scan the QR code below to contribute to our community fund
              💚.
            </p>
            <img
              src={qrCode.url}
              alt="QR Code to scan and pay"
              className="w-auto h-auto"
            />
            <Button
              onClick={() => downloadImage(qrCode.url, 'qr-code.png')}
              className="mt-2 bg-blue-600 text-white rounded"
            >
              Download QR Code
            </Button>
          </>
        ) : (
          <p> We'll update our payment QR Code very soon. 🌍</p>
        )}
      </div>
      <h1 className="text-2xl text-center"> Our Lovely Members ❤️</h1>
      <UserTable role={user?.role} defaultPage={true} />
    </div>
  );
}
