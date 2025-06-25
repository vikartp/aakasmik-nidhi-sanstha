import { useNavigate } from 'react-router-dom';
import { Button } from '../ui/button';
import { useEffect, useState } from 'react';
import { getQrCode, type Screenshot } from '@/services/screenshot';
import { downloadImage } from '@/lib/utils';
import { useAuth } from '@/context/AuthContext';
import UserTable from './UserTable';
import Loader from './Loader';
import { UserPlus, LogIn, LayoutDashboard } from 'lucide-react';
import { postFeedback } from '@/services/feedback';
import { toast } from 'react-toastify';
import type { AxiosError } from 'axios';
import EngagePublic from './EngagePublic';
import { getAdminsAndSuperAdmin } from '@/services/admin';
import type { User } from '@/services/user';

export function Default() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [qrCode, setQrCode] = useState<Screenshot | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [feedbackAdmin, setFeedbackAdmin] = useState<string>('');
  const [feedbackCreator, setFeedbackCreator] = useState<string>('');
  const [admins, setAdmins] = useState<User[]>([]);
  const [superAdmin, setSuperAdmin] = useState<User | null>(null);

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

  useEffect(() => {
    // Fetch admins and superadmin
    getAdminsAndSuperAdmin().then(data => {
      setAdmins(data.filter((u: User) => u.role === 'admin'));
      const superAdminUser = data.find((u: User) => u.role === 'superadmin');
      setSuperAdmin(superAdminUser || null);
    });
  }, []);

  const handleFeedbackSubmit = async (
    content: string,
    target: 'admin' | 'superadmin',
    clear: () => void
  ) => {
    try {
      await postFeedback({ content, target });
      toast.success('Feedback submitted successfully!', { autoClose: 1200 });
      clear();
    } catch (err) {
      let errorMessage = 'Failed to submit feedback. Please try again.';
      if (err && typeof err === 'object' && 'isAxiosError' in err) {
        const axiosError = err as AxiosError<{ message?: string }>;
        if (axiosError.response?.data?.message) {
          errorMessage = axiosError.response.data.message;
        }
      } else if (err instanceof Error) {
        errorMessage = err.message;
      }
      toast.error(errorMessage);
    }
  };

  const handleAdminFeedbackSubmit = () => {
    handleFeedbackSubmit(feedbackAdmin, 'admin', () => setFeedbackAdmin(''));
  };

  const handleCreatorFeedbackSubmit = () => {
    handleFeedbackSubmit(feedbackCreator, 'superadmin', () =>
      setFeedbackCreator('')
    );
  };

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
      {!user && <EngagePublic />}
      <h2 className="text-2xl text-center font-semibold">
        🌍 💚 आकस्मिक निधि युवा संस्था बरकनगांगो के ऑनलाइन पोर्टल में में आपका
        स्वागत है 🏡🌍
      </h2>
      <p className="">
        बरकनगांगो गांव के दिल में एकता, करुणा और आपसी सहयोग की एक मजबूत भावना है
        - ऐसे मूल्य जो बरकनगांगो के आकस्मिक निधि युवा संघ की नींव बनाते हैं। हम
        सैकड़ों समर्पित व्यक्तियों से बना एक समुदाय संचालित समूह हैं जो संकट के
        समय एक-दूसरे के साथ खड़े होने में विश्वास करते हैं। हर महीने, प्रत्येक
        सदस्य एक साझा निधि में एक छोटी राशि का योगदान देता है। यह सामूहिक प्रयास
        एक वित्तीय सुरक्षा जाल बनाता है जिसका उपयोग किसी भी सदस्य को अप्रत्याशित
        आपातकाल का सामना करने में मदद करने के लिए किया जा सकता है - चाहे वह कोई
        चिकित्सा समस्या हो, प्राकृतिक आपदा हो या कोई तत्काल व्यक्तिगत संकट हो।
        हमारा मिशन सरल लेकिन शक्तिशाली है: "एक साथ, हम मजबूत हैं।" नियमित योगदान
        और पारदर्शी प्रबंधन के माध्यम से, हम सुनिश्चित करते हैं कि जब हमारे
        समुदाय में किसी को इसकी सबसे अधिक आवश्यकता होती है तो मदद हमेशा उपलब्ध
        होती है। एक साथ आकर, हम न केवल वित्तीय जिम्मेदारी साझा करते हैं बल्कि
        हमारे गांव के युवाओं के बीच अपनेपन, एकजुटता और आशा की गहरी भावना को भी
        बढ़ावा देते हैं।
      </p>

      <div className="max-w-md mx-auto flex flex-col justify-center">
        {loading && <Loader text="Loading QR Code..." />}
        {qrCode && (
          <>
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

      {/* Feedback Section */}
      {user && (
        <div className="w-full mt-8 flex flex-col gap-6">
          <div className="w-full max-w-4xl mx-auto bg-blue-50 dark:bg-zinc-800 border border-blue-200 dark:border-zinc-700 rounded p-5 shadow text-zinc-800 dark:text-zinc-100 text-center">
            <h2 className="text-xl font-bold mb-2">
              We'd Love to Hear From You!
            </h2>
            <p className="text-base">
              If you have any suggestions, questions, feedback, or words of
              appreciation for the Admin or the Creator of this portal, please
              share them below. Your input helps us improve and motivates us to
              keep building a better community experience. Every message is
              valued and will be read with care. Thank you for helping us grow
              together!
            </p>
          </div>
          <div className="w-full flex flex-col md:flex-row gap-8">
            {/* Feedback to Admin */}
            <div className="flex-1 bg-white dark:bg-zinc-900 rounded shadow p-6 flex flex-col gap-4 border border-zinc-200 dark:border-zinc-700">
              <h2 className="text-lg font-semibold text-zinc-800 dark:text-zinc-100 text-center">
                Feedback to Admin
              </h2>
              <textarea
                id="feedback-admin"
                className="border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 rounded p-3 min-h-[80px] resize-y focus:outline-none focus:ring-2 focus:ring-blue-400 dark:focus:ring-blue-600"
                value={feedbackAdmin}
                onChange={e => setFeedbackAdmin(e.target.value)}
                placeholder="Write your feedback for the Admin..."
              />
              <Button
                className="self-end bg-blue-600 hover:bg-blue-700 text-white rounded shadow"
                onClick={handleAdminFeedbackSubmit}
              >
                Submit to Admin
              </Button>
            </div>
            {/* Feedback to Creator */}
            <div className="flex-1 bg-white dark:bg-zinc-900 rounded shadow p-6 flex flex-col gap-4 border border-zinc-200 dark:border-zinc-700">
              <h2 className="text-lg font-semibold text-zinc-800 dark:text-zinc-100 text-center">
                Feedback to Creator of the portal
              </h2>
              <textarea
                id="feedback-creator"
                className="border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 rounded p-3 min-h-[80px] resize-y focus:outline-none focus:ring-2 focus:ring-green-400 dark:focus:ring-green-600"
                value={feedbackCreator}
                onChange={e => setFeedbackCreator(e.target.value)}
                placeholder="Write your feedback for the Creator..."
              />
              <Button
                className="self-end bg-green-600 hover:bg-green-700 text-white rounded shadow"
                onClick={handleCreatorFeedbackSubmit}
              >
                Submit to Creator
              </Button>
            </div>
          </div>
        </div>
      )}
      {/* Admin & Creator Section */}
      <div className="w-full max-w-4xl mx-auto mt-2 flex flex-col md:flex-row gap-8">
        <div className="flex-1 rounded shadow p-3 flex flex-col gap-4 items-center">
          <h2 className="text-lg font-bold text-blue-700 dark:text-blue-300 mb-4 text-center">
            Admin
          </h2>
          <div className="flex flex-wrap gap-6 justify-center">
            {admins.length === 0 && (
              <div className="text-gray-500">No Admins found.</div>
            )}
            {admins.map(admin => (
              <div key={admin._id} className="flex flex-col items-center gap-2">
                <img
                  src={
                    admin.profileUrl ||
                    'https://ui-avatars.com/api/?name=' +
                      encodeURIComponent(admin.name)
                  }
                  alt={admin.name}
                  className="w-20 h-20 rounded-full object-cover border border-gray-300 dark:border-gray-700"
                />
                <span className="font-semibold text-gray-800 dark:text-gray-100">
                  {admin.name}
                </span>
              </div>
            ))}
          </div>
        </div>
        <div className="flex-1 rounded shadow p-3 flex flex-col gap-4 items-center">
          <h2 className="text-lg font-bold text-green-700 dark:text-green-300 mb-4 text-center">
            Creator
          </h2>
          {superAdmin ? (
            <div className="flex flex-col items-center gap-2">
              <img
                src={
                  superAdmin.profileUrl ||
                  'https://ui-avatars.com/api/?name=' +
                    encodeURIComponent(superAdmin.name)
                }
                alt={superAdmin.name}
                className="w-20 h-20 rounded-full object-cover border border-gray-300 dark:border-gray-700"
              />
              <span className="font-semibold text-gray-800 dark:text-gray-100">
                {superAdmin.name}
              </span>
            </div>
          ) : (
            <div className="text-gray-500">No Creator found.</div>
          )}
        </div>
      </div>
    </div>
  );
}
