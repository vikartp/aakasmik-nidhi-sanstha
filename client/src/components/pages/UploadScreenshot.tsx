import { useState } from 'react';
import { uploadScreenshot } from '@/services/screenshot';
import { Button } from '@/components/ui/button';
import { useRef } from 'react';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'react-toastify';
import Loader from './Loader';
import type { AxiosError } from 'axios';
import type { User } from '@/services/user';
import { LassoSelectIcon, Upload, Info } from 'lucide-react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

export function UploadScreenshot({
  isQrCode,
  onUploadSuccess,
  status,
}: {
  isQrCode?: boolean;
  onUploadSuccess?: () => void;
  status?: 'pending' | 'none' | 'verified' | 'rejected';
}) {
  const { user } = useAuth();
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [loggedInUser] = useState<User | null>(user || null);
  const currentMonth = new Date().toLocaleString('default', {
    month: 'long',
  });
  const currentYear = new Date().getFullYear();

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUpload = async () => {
    if (!file) return toast('Please select a file first.');

    setUploading(true);
    try {
      if (!loggedInUser) {
        toast('You must be logged in to upload a screenshot.');
        return;
      }
      await uploadScreenshot(file, loggedInUser, isQrCode);
      toast('Upload successful 🕺');
      if (onUploadSuccess) onUploadSuccess();
    } catch (err) {
      console.error(err);
      let errorMessage = 'Upload failed. Please try again.';
      if (err && typeof err === 'object' && 'isAxiosError' in err) {
        const axiosError = err as AxiosError<{ message?: string }>;
        if (axiosError.response?.data?.message) {
          errorMessage = axiosError.response.data.message;
        }
        toast.error(errorMessage);
      }
    } finally {
      setUploading(false);
      setFile(null);
      if (fileInputRef.current) {
        fileInputRef.current = null;
      }
    }
  };

  return (
    <>
      <div className="flex flex-col items-center gap-4">
        <div className="w-full max-w-md mx-auto">
          <Accordion
            type="single"
            collapsible
            className="bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-800 dark:to-gray-700 rounded-xl shadow-lg border border-blue-200 dark:border-gray-600"
          >
            <AccordionItem value="instructions" className="border-0">
              <AccordionTrigger className="px-4 py-3 hover:no-underline">
                <h1 className="text-md font-bold text-blue-800 dark:text-blue-200 flex items-center gap-2">
                  <Info className="w-6 h-6 animate-pulse" />
                  स्क्रीनशॉट अपलोड प्रक्रिया (विस्तार के लिए क्लिक करें)
                </h1>
              </AccordionTrigger>
              <AccordionContent className="px-4 pb-4">
                <div className="space-y-2">
                  <div className="flex items-start gap-2 p-2 bg-white dark:bg-gray-600 rounded-lg shadow-sm border-l-4 border-green-400">
                    <span className="text-lg flex-shrink-0">1️⃣</span>
                    <p className="text-gray-700 dark:text-gray-200 font-medium text-sm">
                      कृपया QR कोड का उपयोग करके भुगतान करें
                    </p>
                  </div>
                  <div className="flex items-start gap-2 p-2 bg-white dark:bg-gray-600 rounded-lg shadow-sm border-l-4 border-blue-400">
                    <span className="text-lg flex-shrink-0">2️⃣</span>
                    <p className="text-gray-700 dark:text-gray-200 font-medium text-sm">
                      भुगतान का स्क्रीनशॉट लें
                    </p>
                  </div>
                  <div className="flex items-start gap-2 p-2 bg-white dark:bg-gray-600 rounded-lg shadow-sm border-l-4 border-purple-400">
                    <span className="text-lg flex-shrink-0">3️⃣</span>
                    <p className="text-gray-700 dark:text-gray-200 font-medium text-sm">
                      नीचे{' '}
                      <span className="bg-blue-600 px-1 py-0.5 rounded text-xs font-semibold">
                        "यहाँ क्लिक करें और स्क्रीनशॉट चुनें"
                      </span>{' '}
                      पर क्लिक करें
                    </p>
                  </div>
                  <div className="flex items-start gap-2 p-2 bg-white dark:bg-gray-600 rounded-lg shadow-sm border-l-4 border-orange-400">
                    <span className="text-lg flex-shrink-0">4️⃣</span>
                    <p className="text-gray-700 dark:text-gray-200 font-medium text-sm">
                      पॉप-अप से स्क्रीनशॉट चुनें
                    </p>
                  </div>
                  <div className="flex items-start gap-2 p-2 bg-white dark:bg-gray-600 rounded-lg shadow-sm border-l-4 border-red-400">
                    <span className="text-lg flex-shrink-0">5️⃣</span>
                    <p className="text-gray-700 dark:text-gray-200 font-medium text-sm">
                      {' '}
                      <span className="bg-green-500 px-1 py-0.5 rounded text-xs font-semibold">
                        स्क्रीनशॉट अपलोड करें
                      </span>{' '}
                      बटन पर क्लिक करें
                    </p>
                  </div>
                </div>
                <div className="mt-3 p-2 bg-amber-50 dark:bg-amber-900/30 border border-amber-200 dark:border-amber-700 rounded-lg">
                  <p className="text-amber-800 dark:text-amber-200 text-xs text-center font-medium flex items-center justify-center gap-1">
                    <span className="text-sm">⚠️</span>
                    कृपया ध्यान से पढ़ें और अनुसरण करें
                  </p>
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
        {!isQrCode && (
          <div className="w-full overflow-hidden">
            <p className="whitespace-nowrap animate-marquee font-medium text-base text-blue-700 dark:text-blue-300 px-2">
              आप इस महीने के योगदान का स्क्रीनशॉट यहाँ अपलोड कर सकते हैं। अपलोड
              करने के लिए नीचे क्लिक करें 👇🏻
            </p>
          </div>
        )}
        <div className="flex flex-col space-x-4 max-w-md mx-auto gap-4">
          {uploading ? (
            <Loader text="कृपया प्रतीक्षा करें 🙏 अपलोड हो रहा है... 🥳" />
          ) : (
            <div>
              <input
                ref={fileInputRef}
                id="file-upload"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={e => setFile(e.target.files?.[0] || null)}
                disabled={uploading || status === 'verified'}
              />
              <label
                htmlFor="file-upload"
                className={`flex items-center justify-center px-4 py-2 rounded-lg font-semibold shadow gap-2 transition cursor-pointer
    ${
      uploading || status === 'verified'
        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
        : 'bg-blue-600 text-white hover:bg-blue-700'
    }
  `}
              >
                <span className="flex items-center gap-2">
                  यहाँ क्लिक करें और स्क्रीनशॉट चुनें
                  <LassoSelectIcon className="inline-block w-5 h-5" />
                </span>
              </label>
              {file && (
                <p className="mt-1 text-green-600 text-xs font-medium">
                  चयनित फ़ाइल: {file.name}
                </p>
              )}
            </div>
          )}
          <Button
            className="bg-green-500"
            onClick={handleUpload}
            disabled={uploading || !file || status === 'verified'}
          >
            {uploading
              ? 'Uploading...'
              : isQrCode
                ? 'Upload QR Code'
                : `${currentMonth}-${currentYear} का स्क्रीनशॉट अपलोड करें`}
            <Upload />
          </Button>
        </div>
      </div>
    </>
  );
}
