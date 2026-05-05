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
  const autoplay = useRef(Autoplay({ delay: 5000, stopOnInteraction: false }));
  const [emblaRef] = useEmblaCarousel({ loop: true, align: 'center' }, [
    autoplay.current,
  ]);
  return (
    <section className="w-full max-w-2xl mx-auto my-4 relative">
      <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-3xl blur opacity-20 dark:opacity-40 animate-pulse"></div>
      <div
        ref={emblaRef}
        className="embla overflow-hidden rounded-3xl relative bg-white/80 dark:bg-[#1e293b]/80 backdrop-blur-xl border border-white/40 dark:border-slate-700/50 shadow-2xl"
      >
        <div className="embla__container flex">
          {aboutSlides.map((text, idx) => (
            <div
              className="embla__slide flex items-center justify-center min-h-[160px] px-8 py-8 w-full flex-[0_0_100%]"
              key={idx}
            >
              <div className="relative">
                <span className="absolute -top-4 -left-4 text-4xl text-blue-300 dark:text-blue-800 opacity-50 font-serif">
                  "
                </span>
                <p className="text-base md:text-xl text-center font-medium text-slate-700 dark:text-slate-200 leading-relaxed relative z-10">
                  {text}
                </p>
                <span className="absolute -bottom-6 -right-4 text-4xl text-blue-300 dark:text-blue-800 opacity-50 font-serif">
                  "
                </span>
              </div>
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
    <div className="flex flex-col justify-center gap-6 px-2 sm:px-0 pb-12">
      <div className="text-center mt-2 mb-4">
        <h2 className="text-2xl md:text-3xl font-extrabold bg-gradient-to-r from-teal-500 via-blue-500 to-indigo-600 bg-clip-text text-transparent drop-shadow-sm py-2 px-4 leading-tight animate-[fadeInScale_1s_ease-out]">
          आकस्मिक निधि युवा संस्था
          <span className="block text-lg md:text-xl mt-1 text-slate-500 dark:text-slate-400 font-semibold bg-none text-current bg-clip-border">
            ऑनलाइन पोर्टल में आपका स्वागत है
          </span>
        </h2>
      </div>

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
        <div className="w-full mt-10 flex flex-col gap-6">
          <div className="w-full max-w-4xl mx-auto bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-slate-800 dark:to-slate-900 rounded-3xl p-6 md:p-8 shadow-sm border border-blue-100 dark:border-slate-700 text-center">
            <h2 className="text-2xl font-bold mb-3 text-slate-800 dark:text-slate-100 flex items-center justify-center gap-2">
              <MessageCircle className="w-6 h-6 text-blue-500" />
              We'd Love to Hear From You!
            </h2>
            <p className="text-slate-600 dark:text-slate-300 leading-relaxed max-w-2xl mx-auto">
              Got suggestions, questions, or just want to say hi? Share your
              thoughts below. Every message is valued and helps us build a
              better community experience!
            </p>
          </div>
          <div className="w-full max-w-4xl mx-auto flex flex-col md:flex-row gap-6">
            {/* Feedback to Admin */}
            <div className="flex-1 bg-white dark:bg-slate-900 rounded-3xl shadow-lg shadow-blue-500/5 p-6 flex flex-col gap-4 border border-slate-100 dark:border-slate-800 transition-all hover:-translate-y-1 duration-300">
              <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                <span className="bg-blue-100 dark:bg-blue-900/50 p-2 rounded-xl text-blue-600 dark:text-blue-400">
                  👋
                </span>
                Message to Admin
              </h2>
              <textarea
                id="feedback-admin"
                className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 rounded-2xl p-4 min-h-[100px] resize-y focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-shadow"
                value={feedbackAdmin}
                onChange={e => setFeedbackAdmin(e.target.value)}
                placeholder="What's on your mind?..."
              />
              <Button
                className="self-end bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-md hover:shadow-lg transition-all px-6 font-semibold"
                onClick={handleAdminFeedbackSubmit}
              >
                Send to Admin
              </Button>
            </div>
            {/* Feedback to Creator */}
            <div className="flex-1 bg-white dark:bg-slate-900 rounded-3xl shadow-lg shadow-green-500/5 p-6 flex flex-col gap-4 border border-slate-100 dark:border-slate-800 transition-all hover:-translate-y-1 duration-300">
              <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                <span className="bg-green-100 dark:bg-green-900/50 p-2 rounded-xl text-green-600 dark:text-green-400">
                  💡
                </span>
                Message to Creator
              </h2>
              <textarea
                id="feedback-creator"
                className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 rounded-2xl p-4 min-h-[100px] resize-y focus:outline-none focus:ring-2 focus:ring-green-500/50 transition-shadow"
                value={feedbackCreator}
                onChange={e => setFeedbackCreator(e.target.value)}
                placeholder="Got an idea for a new feature?..."
              />
              <Button
                className="self-end bg-green-600 hover:bg-green-700 text-white rounded-xl shadow-md hover:shadow-lg transition-all px-6 font-semibold"
                onClick={handleCreatorFeedbackSubmit}
              >
                Send to Creator
              </Button>
            </div>
          </div>
        </div>
      )}
      {/* Admin & Creator Section */}
      <div className="w-full max-w-4xl mx-auto mt-8 flex flex-col md:flex-row gap-6">
        <div className="flex-1 bg-white dark:bg-slate-900 rounded-3xl shadow-lg shadow-indigo-500/5 p-6 flex flex-col items-center border border-slate-100 dark:border-slate-800 transition-all hover:-translate-y-1 duration-300">
          <div className="bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 text-xs font-bold uppercase tracking-widest py-1 px-3 rounded-full mb-4">
            सदस्य बनें
          </div>
          <h2 className="text-center text-slate-600 dark:text-slate-400 text-sm font-medium mb-6">
            क्या आप हमारे सदस्य बनना चाहते हैं? हमारे एडमिन से संपर्क करें। 👇🏻
          </h2>

          <div className="flex flex-wrap gap-8 justify-center w-full">
            {admins.length === 0 && (
              <div className="text-slate-400 italic">No Admins found.</div>
            )}
            {admins.map(admin => (
              <div key={admin._id} className="flex flex-col items-center group">
                <div className="relative p-1 rounded-full bg-gradient-to-tr from-blue-400 to-indigo-500 mb-3 transition-transform group-hover:scale-105">
                  <img
                    src={
                      admin.profileUrl ||
                      'https://ui-avatars.com/api/?name=' +
                        encodeURIComponent(admin.name)
                    }
                    alt={admin.name}
                    className="w-20 h-20 rounded-full object-cover border-4 border-white dark:border-slate-900"
                  />
                </div>
                <span className="font-bold text-slate-800 dark:text-slate-100 mb-2">
                  {admin.name}
                </span>
                {admin.mobile && (
                  <div className="flex gap-3">
                    <a
                      href={`tel:${admin.mobile}`}
                      title="Call"
                      className="bg-slate-100 dark:bg-slate-800 p-2.5 rounded-full text-blue-600 dark:text-blue-400 hover:bg-blue-600 hover:text-white transition-colors shadow-sm"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Phone className="w-5 h-5" />
                    </a>
                    <a
                      href={`https://wa.me/${admin.mobile}`}
                      title="WhatsApp"
                      className="bg-slate-100 dark:bg-slate-800 p-2.5 rounded-full text-green-600 dark:text-green-400 hover:bg-green-600 hover:text-white transition-colors shadow-sm"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <MessageCircle className="w-5 h-5" />
                    </a>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="flex-1 bg-white dark:bg-slate-900 rounded-3xl shadow-lg shadow-emerald-500/5 p-6 flex flex-col items-center justify-center border border-slate-100 dark:border-slate-800 transition-all hover:-translate-y-1 duration-300">
          <div className="bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 text-xs font-bold uppercase tracking-widest py-1 px-3 rounded-full mb-6">
            Portal Creator
          </div>
          {superAdmin ? (
            <div className="flex flex-col items-center group">
              <div className="relative p-1 rounded-full bg-gradient-to-tr from-emerald-400 to-teal-500 mb-3 transition-transform group-hover:scale-105">
                <img
                  src={
                    superAdmin.profileUrl ||
                    'https://ui-avatars.com/api/?name=' +
                      encodeURIComponent(superAdmin.name)
                  }
                  alt={superAdmin.name}
                  className="w-24 h-24 rounded-full object-cover border-4 border-white dark:border-slate-900"
                />
              </div>
              <span className="font-bold text-lg text-slate-800 dark:text-slate-100 mb-3">
                {superAdmin.name}
              </span>
              {superAdmin.mobile && (
                <div className="flex gap-4">
                  <a
                    href={`tel:${superAdmin.mobile}`}
                    title="Call"
                    className="bg-slate-100 dark:bg-slate-800 p-3 rounded-full text-blue-600 dark:text-blue-400 hover:bg-blue-600 hover:text-white transition-colors shadow-sm"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Phone className="w-5 h-5" />
                  </a>
                  <a
                    href={`https://wa.me/${superAdmin.mobile}`}
                    title="WhatsApp"
                    className="bg-slate-100 dark:bg-slate-800 p-3 rounded-full text-green-600 dark:text-green-400 hover:bg-green-600 hover:text-white transition-colors shadow-sm"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <MessageCircle className="w-5 h-5" />
                  </a>
                </div>
              )}
            </div>
          ) : (
            <div className="text-slate-400 italic">No Creator found.</div>
          )}
        </div>
      </div>

      {/* Fun Interactive Section */}
      <DailyFunZone />
    </div>
  );
}
