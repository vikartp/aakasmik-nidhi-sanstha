import { useNavigate } from 'react-router-dom';
import { Button } from '../ui/button';
import { useEffect, useState, useRef } from 'react';
import { getQrCode, type Screenshot } from '@/services/screenshot';
import { downloadImage } from '@/lib/utils';
import { useAuth } from '@/context/AuthContext';
import UserTable from './UserTable';
import Loader from './Loader';
import {
  UserPlus,
  LogIn,
  LayoutDashboard,
  Phone,
  MessageCircle,
} from 'lucide-react';
import { postFeedback } from '@/services/feedback';
import { toast } from 'react-toastify';
import type { AxiosError } from 'axios';
import EngagePublic from './EngagePublic';
import { getAdminsAndSuperAdmin } from '@/services/admin';
import type { User } from '@/services/user';
import useEmblaCarousel from 'embla-carousel-react';
import Autoplay from 'embla-carousel-autoplay';
import DailyFunZone from '../DailyFunZone';

const aboutSlides = [
  'बरकनगांगो गांव के दिल में एकता, करुणा और आपसी सहयोग की एक मजबूत भावना है - ऐसे मूल्य जो बरकनगांगो के आकस्मिक निधि युवा संघ की नींव बनाते हैं।',
  'हम सैकड़ों समर्पित व्यक्तियों से बना एक समुदाय संचालित समूह हैं जो संकट के समय एक-दूसरे के साथ खड़े होने में विश्वास करते हैं।',
  'हर महीने, प्रत्येक सदस्य एक साझा निधि में एक छोटी राशि का योगदान देता है। यह सामूहिक प्रयास एक वित्तीय सुरक्षा जाल बनाता है जिसका उपयोग किसी भी सदस्य को अप्रत्याशित आपातकाल का सामना करने में मदद करने के लिए किया जा सकता है।',
  'हमारा मिशन सरल लेकिन शक्तिशाली है: "एक साथ, हम मजबूत हैं।" नियमित योगदान और पारदर्शी प्रबंधन के माध्यम से, हम सुनिश्चित करते हैं कि जब हमारे समुदाय में किसी को इसकी सबसे अधिक आवश्यकता होती है तो मदद हमेशा उपलब्ध होती है।',
  'एक साथ आकर, हम न केवल वित्तीय जिम्मेदारी साझा करते हैं बल्कि हमारे गांव के युवाओं के बीच अपनेपन, एकजुटता और आशा की गहरी भावना को भी बढ़ावा देते हैं।',
];

function AboutCarousel() {
  const autoplay = useRef(Autoplay({ delay: 4000, stopOnInteraction: false }));
  const [emblaRef] = useEmblaCarousel({ loop: true, align: 'center' }, [
    autoplay.current,
  ]);
  return (
    <section className="w-full max-w-2xl mx-auto">
      <div
        ref={emblaRef}
        className="embla overflow-hidden rounded-2xl shadow-2xl border border-blue-200 dark:border-blue-900 bg-gradient-to-br from-green-50 via-white to-blue-50 dark:from-[#0f172a] dark:via-[#1e293b] dark:to-[#0e2235]"
      >
        <div className="embla__container flex">
          {aboutSlides.map((text, idx) => (
            <div
              className="embla__slide flex items-center justify-center min-h-[140px] px-6 py-10 md:py-14 w-full flex-[0_0_100%]"
              key={idx}
            >
              <p className="text-lg md:text-2xl text-center font-semibold text-gray-800 dark:text-blue-100 leading-relaxed drop-shadow-lg dark:drop-shadow-xl">
                {text}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

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
    <div className="flex flex-col justify-center gap-2">
      <h2 className="text-2xl text-center font-semibold bg-gradient-to-r from-green-400 via-blue-500 to-indigo-500 bg-clip-text text-transparent drop-shadow-lg dark:from-green-300 dark:via-blue-400 dark:to-indigo-400 py-2 rounded-xl shadow-md gap-2 animate-[fadeInScale_1s_ease-out] hover:scale-105 transition-transform duration-300">
        आकस्मिक निधि युवा संस्था के ऑनलाइन पोर्टल में आपका स्वागत है
      </h2>

      <AboutCarousel />

      {user ? (
        <div className="flex flex-col items-center gap-2">
          <p className="text-base font-semibold text-blue-700 dark:text-blue-300 animate-bounce">
            👇 अपने डैशबोर्ड देखने के लिए यहाँ क्लिक करें 👇
          </p>
          <Button
            className="max-w-md mx-auto flex items-center gap-3 px-6 py-6 text-lg font-bold rounded-xl shadow-2xl transition-all duration-300 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white hover:from-indigo-700 hover:via-purple-700 hover:to-pink-700 hover:scale-110 hover:shadow-[0_0_30px_rgba(168,85,247,0.6)] dark:from-indigo-500 dark:via-purple-500 dark:to-pink-500 dark:hover:from-indigo-600 dark:hover:via-purple-600 dark:hover:to-pink-600 animate-pulse focus:outline-none focus:ring-4 focus:ring-purple-400 dark:focus:ring-purple-700"
            onClick={() => navigate('/dashboard')}
          >
            अपने डैशबोर्ड पर जाएं <LayoutDashboard className="w-6 h-6" />
          </Button>
        </div>
      ) : (
        <div className="flex items-center justify-between space-x-4">
          <Button
            onClick={() => navigate('/register')}
            className="flex items-center gap-2 px-4 py-2 rounded font-semibold shadow-sm transition-all duration-150 bg-gradient-to-r from-green-500 to-green-700 text-white hover:from-green-600 hover:to-green-800 hover:scale-105 dark:from-green-400 dark:to-green-600 dark:hover:from-green-500 dark:hover:to-green-700 focus:outline-none focus:ring-2 focus:ring-green-300 dark:focus:ring-green-800"
          >
            <UserPlus className="w-5 h-5" />
            Register/खाता बनाएं
          </Button>
          <Button
            onClick={() => navigate('/login')}
            className="flex items-center gap-2 px-4 py-2 rounded font-semibold shadow-sm transition-all duration-150 bg-gradient-to-r from-blue-500 to-blue-700 text-white hover:from-blue-600 hover:to-blue-800 hover:scale-105 dark:from-blue-400 dark:to-blue-600 dark:hover:from-blue-500 dark:hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-300 dark:focus:ring-blue-800"
          >
            <LogIn className="w-5 h-5" />
            Login/लॉग इन करें
          </Button>
        </div>
      )}

      {!user && <EngagePublic />}

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
      <div className="w-full max-w-4xl mx-auto mt-2 flex flex-col md:flex-row gap-2">
        <div className="flex-1 rounded shadow p-3 flex flex-col gap-4 items-center">
          <h2 className="font-bold">
            {' '}
            क्या आप हमारे सदस्य बनना चाहते हैं? हमारे एडमिन से संपर्क करें।
            👇🏻{' '}
          </h2>
          <h2 className="text-lg font-bold text-blue-700 dark:text-blue-300 text-center">
            Admins
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
                {admin.mobile && (
                  <div className="flex gap-6 mt-1">
                    <a
                      href={`tel:${admin.mobile}`}
                      title="Call"
                      className="text-green-600 hover:text-green-800"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Phone className="w-7 h-7" />
                    </a>
                    <a
                      href={`https://wa.me/${admin.mobile}`}
                      title="WhatsApp"
                      className="text-green-500 hover:text-green-700"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <MessageCircle className="w-7 h-7" />
                    </a>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
        <div className="flex-1 rounded shadow p-3 flex flex-col gap-4 items-center">
          <h2 className="text-lg font-bold text-green-700 dark:text-green-300 text-center">
            Creator of the portal
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
              {superAdmin.mobile && (
                <div className="flex gap-6 mt-1">
                  <a
                    href={`tel:${superAdmin.mobile}`}
                    title="Call"
                    className="text-green-600 hover:text-green-800"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Phone className="w-7 h-7" />
                  </a>
                  <a
                    href={`https://wa.me/${superAdmin.mobile}`}
                    title="WhatsApp"
                    className="text-green-500 hover:text-green-700"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <MessageCircle className="w-7 h-7" />
                  </a>
                </div>
              )}
            </div>
          ) : (
            <div className="text-gray-500">No Creator found.</div>
          )}
        </div>
      </div>

      {/* Fun Interactive Section */}
      <DailyFunZone />
    </div>
  );
}
