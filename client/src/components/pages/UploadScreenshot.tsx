import { useState } from 'react';
import { uploadScreenshot } from '@/services/screenshot';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import type { User } from '@/types/users';
import { useRef } from 'react';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'react-toastify';
import Loader from './Loader';

export function UploadScreenshot({
  isQrCode,
  onUploadSuccess,
}: {
  isQrCode?: boolean;
  onUploadSuccess?: () => void;
}) {
  const { user } = useAuth();
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [loggedInUser] = useState<User | null>(user || null);
  const [uploadedUrl, setUploadedUrl] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUpload = async () => {
    if (!file) return toast('Please select a file first.');

    setUploading(true);
    try {
      if (!loggedInUser) {
        toast('You must be logged in to upload a screenshot.');
        return;
      }
      const response = await uploadScreenshot(file, loggedInUser, isQrCode);
      toast('Upload successful 🕺');
      setUploadedUrl(response.url || null);
      if (onUploadSuccess) onUploadSuccess();
    } catch (error) {
      console.error('Upload failed:', error);
      toast('Upload failed.');
    } finally {
      setUploading(false);
      setFile(null);
      // TODO: Fix this, it doesn't reset the file input
      if (fileInputRef.current) {
        fileInputRef.current = null;
      }
    }
  };

  return (
    <>
      <div className="flex flex-col items-center gap-4">
        {!isQrCode && (
          <p>
            You can upload screenshot of contribution for this month here. Click
            below to choose a screenshot to upload
            <br />
            (आप इस महीने के योगदान का स्क्रीनशॉट यहाँ अपलोड कर सकते हैं। अपलोड
            करने के लिए स्क्रीनशॉट चुनने के लिए नीचे क्लिक करें)
          </p>
        )}
        <div className="flex flex-col space-x-4 max-w-md mx-auto gap-4">
          {uploading ? (
            <Loader text="कृपया प्रतीक्षा करें 🤴 अपलोड हो रहा है... 🥳" />
          ) : (
            <Input
              ref={fileInputRef}
              className="cursor-pointer"
              type="file"
              accept="image/*"
              onChange={e => setFile(e.target.files?.[0] || null)}
            />
          )}
          <Button onClick={handleUpload} disabled={uploading || !file}>
            {uploading
              ? 'Uploading...'
              : isQrCode
                ? 'Upload QR Code'
                : 'Upload Screenshot for this Month'}
          </Button>
        </div>
        {uploadedUrl && (
          <div className="mt-4 flex flex-col items-center">
            <p className="text-green-600">Uploaded Image Preview:</p>
            <img
              src={uploadedUrl}
              alt="Uploaded Screenshot"
              className="max-w-xs rounded shadow"
            />
          </div>
        )}
      </div>
    </>
  );
}
