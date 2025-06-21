import { useNavigate } from 'react-router-dom';
import { Button } from '../ui/button';
import { useEffect, useState } from 'react';
import type { Screenshot } from '@/types/screenshots';
import { getQrCode } from '@/services/screenshot';
import { downloadImage } from '@/lib/utils';
import { useAuth } from '@/context/AuthContext';
import UserTable from './UserTable';
import Loader from './Loader';
import { UserPlus, LogIn, LayoutDashboard,  } from 'lucide-react';

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
          Go to your Dashboard <LayoutDashboard />
        </Button>
      ) : (
        <div className="flex items-center justify-end space-x-4">
          <Button
            onClick={() => navigate('/register')}
            className="flex items-center gap-2 px-4 py-2 rounded font-semibold shadow-sm transition-all duration-150 bg-gradient-to-r from-green-500 to-green-700 text-white hover:from-green-600 hover:to-green-800 hover:scale-105 dark:from-green-400 dark:to-green-600 dark:hover:from-green-500 dark:hover:to-green-700 focus:outline-none focus:ring-2 focus:ring-green-300 dark:focus:ring-green-800"
          >
            <UserPlus className="w-5 h-5" />
            Register
          </Button>
          <Button
            onClick={() => navigate('/login')}
            className="flex items-center gap-2 px-4 py-2 rounded font-semibold shadow-sm transition-all duration-150 bg-gradient-to-r from-blue-500 to-blue-700 text-white hover:from-blue-600 hover:to-blue-800 hover:scale-105 dark:from-blue-400 dark:to-blue-600 dark:hover:from-blue-500 dark:hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-300 dark:focus:ring-blue-800"
          >
            <LogIn className="w-5 h-5" />
            Login
          </Button>
        </div>
      )}
      <h2 className="text-2xl font-semibold">
        🌍 💚 आकस्मिक निधि युवा संस्था बरकनगांगो के ऑनलाइन पोर्टल में में आपका स्वागत है 🏡🌍
      </h2>
      <p className="">
        बरकनगांगो गांव के दिल में एकता, करुणा और आपसी सहयोग की एक मजबूत भावना है - ऐसे मूल्य जो बरकनगांगो के आकस्मिक निधि युवा संघ की नींव बनाते हैं। हम सैकड़ों समर्पित व्यक्तियों से बना एक समुदाय संचालित समूह हैं जो संकट के समय एक-दूसरे के साथ खड़े होने में विश्वास करते हैं। हर महीने, प्रत्येक सदस्य एक साझा निधि में एक छोटी राशि का योगदान देता है। यह सामूहिक प्रयास एक वित्तीय सुरक्षा जाल बनाता है जिसका उपयोग किसी भी सदस्य को अप्रत्याशित आपातकाल का सामना करने में मदद करने के लिए किया जा सकता है - चाहे वह कोई चिकित्सा समस्या हो, प्राकृतिक आपदा हो या कोई तत्काल व्यक्तिगत संकट हो। हमारा मिशन सरल लेकिन शक्तिशाली है: "एक साथ, हम मजबूत हैं।" नियमित योगदान और पारदर्शी प्रबंधन के माध्यम से, हम सुनिश्चित करते हैं कि जब हमारे समुदाय में किसी को इसकी सबसे अधिक आवश्यकता होती है तो मदद हमेशा उपलब्ध होती है। एक साथ आकर, हम न केवल वित्तीय जिम्मेदारी साझा करते हैं बल्कि हमारे गांव के युवाओं के बीच अपनेपन, एकजुटता और आशा की गहरी भावना को भी बढ़ावा देते हैं।
      </p>

      <div className="max-w-md mx-auto flex flex-col justify-center">
        {loading && <Loader text="Loading QR Code..." />}
        {qrCode && (
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
        )}
      </div>
      <h1 className="text-2xl text-center"> Our Lovely Members ❤️</h1>
      <UserTable role={user?.role} defaultPage={true} />
    </div>
  );
}
