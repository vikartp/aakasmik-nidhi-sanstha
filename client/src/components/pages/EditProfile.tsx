import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Edit } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { updateUserInfo } from '@/services/user';
import type { AxiosError } from 'axios';
import { toast } from 'react-toastify';

export default function EditProfile() {
  const { user, setUser } = useAuth();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [fields, setFields] = useState({
    name: user?.name || '',
    fatherName: user?.fatherName || '',
    email: user?.email || '',
    occupation: user?.occupation || '',
  });

  useEffect(() => {
    setFields({
      name: user?.name || '',
      fatherName: user?.fatherName || '',
      email: user?.email || '',
      occupation: user?.occupation || '',
    });
  }, [user, open]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFields(f => ({ ...f, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await updateUserInfo(fields);
      setUser(res.user);
      setOpen(false);
    } catch (err) {
      let errorMessage = 'Failed to edit your profile. Please try again.';
      if (err && typeof err === 'object' && 'isAxiosError' in err) {
        const axiosError = err as AxiosError<{ message?: string }>;
        if (axiosError.response?.data?.message) {
          errorMessage = axiosError.response.data.message;
        }
      } else if (err instanceof Error) {
        errorMessage = err.message;
      }
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="ml-2 flex items-center gap-2">
          <Edit className="w-4 h-4" /> Edit Info
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit} className="space-y-4">
          <DialogHeader>
            <DialogTitle>Edit Info</DialogTitle>
            <DialogDescription>
              Update your profile information below.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4">
            <div className="grid gap-3">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                name="name"
                value={fields.name}
                onChange={handleChange}
                required
              />
            </div>
            <div className="grid gap-3">
              <Label htmlFor="fatherName">Father's Name</Label>
              <Input
                id="fatherName"
                name="fatherName"
                value={fields.fatherName}
                onChange={handleChange}
                required
              />
            </div>
            <div className="grid gap-3">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                value={fields.email}
                onChange={handleChange}
                type="email"
              />
            </div>
            <div className="grid gap-3">
              <Label htmlFor="occupation">Occupation</Label>
              <Input
                id="occupation"
                name="occupation"
                value={fields.occupation}
                onChange={handleChange}
              />
            </div>
          </div>
          {error && (
            <div className="text-red-600 font-semibold text-sm">{error}</div>
          )}
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline" type="button">
                Cancel
              </Button>
            </DialogClose>
            <Button type="submit" disabled={loading}>
              {loading ? 'Saving...' : 'Save changes'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
