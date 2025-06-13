import { useNavigate } from 'react-router-dom';
import { Button } from '../ui/button';
import { useEffect, useState } from 'react';
import type { Screenshot } from '@/types/screenshots';
import { getScreenshotsByQrCode } from '@/services/screenshot';
import { downloadImage } from '@/lib/utils';
import { useAuth } from '@/context/AuthContext';
import UserTable from './UserTable';

export function Default() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [qrCode, setQrCode] = useState<Screenshot | null>(null);

  useEffect(() => {
    const fetchQrCode = async () => {
      try {
        const response = await getScreenshotsByQrCode();
        setQrCode(response);
      } catch (error) {
        console.error('Error fetching QR code:', error);
      }
    };

    fetchQrCode();
  }, []);

  return (
    <div className="flex flex-col items-center justify-center -mt-2 gap-4">
      {user ? (
        <Button onClick={() => navigate('/dashboard')}>Go to Dashboard</Button>
      ) : (
        <div className="flex items-center space-x-4">
          <Button onClick={() => navigate('/register')}>Register</Button>
          <Button onClick={() => navigate('/login')}>Login</Button>
        </div>
      )}
      <h2 className="text-2xl font-semibold">
        Welcome to Contingency Fund Youth Association, Barkangango
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

      <p className="text-l">
        Want to contribute? Please scan 👇 and upload the screenshot 🙏
      </p>
      {qrCode ? (
        <>
          <img
            src={qrCode.url}
            alt="QR Code to scan and pay"
            className="w-auto h-auto"
          />
          <button
            onClick={() => downloadImage(qrCode.url, 'qr-code.png')}
            className="mt-2 inline-block px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Download QR Code
          </button>
        </>
      ) : (
        <p className="text-gray-500">Loading QR Code...</p>
      )}
      <p className="text-gray-500">
        (कृपया योगदान देने के लिए QR कोड स्कैन करें और स्क्रीनशॉट अपलोड करें)
      </p>
      <h1 className="text-2xl"> Our Lovely Members ❤️</h1>
      <UserTable role={user?.role} />
    </div>
  );
}
