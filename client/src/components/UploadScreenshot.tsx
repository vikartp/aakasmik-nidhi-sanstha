import { useState } from 'react';
import { uploadScreenshot } from '@/services/screenshot';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import type { User } from '@/types/users';

export function UploadScreenshot() {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [loggedInUser] = useState<User>(() => {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  });

  const handleUpload = async () => {
    if (!file) return alert('Please select a file first.');

    setUploading(true);
    try {
      const response = await uploadScreenshot(file, loggedInUser);
      alert('Upload successful: ' + response.url);
    } catch (error) {
      console.error('Upload failed:', error);
      alert('Upload failed.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="flex space-x-4 max-w-md mx-auto">
      <Input
        className="cursor-pointer"
        type="file"
        accept="image/*"
        onChange={e => setFile(e.target.files?.[0] || null)}
      />
      <Button onClick={handleUpload} disabled={uploading || !file}>
        {uploading ? 'Uploading...' : 'Upload Screenshot'}
      </Button>
    </div>
  );
}
