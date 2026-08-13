import { useEffect, useState, useRef } from 'react';
import {
  createSahayata,
  updateSahayata,
  deleteSahayata,
  uploadSahayataProof,
  deleteSahayataProof,
  type Sahayata,
} from '@/services/sahayata';
import { getUsers, type User } from '@/services/user';
import SahayataTable from './SahayataTable';
import { Button } from '../ui/button';
import { toast } from 'react-toastify';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Check,
  ChevronsUpDown,
  Upload,
  Trash2,
  FileText,
  ImageIcon,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

interface FormData {
  memberId: string;
  memberName: string;
  amount: string;
  givenDate: string;
  description: string;
  repaymentDate: string;
  repaidAmount: string;
  status: 'pending' | 'partial' | 'repaid';
}

const initialFormData: FormData = {
  memberId: '',
  memberName: '',
  amount: '',
  givenDate: '',
  description: '',
  repaymentDate: '',
  repaidAmount: '',
  status: 'pending',
};

const MAX_PROOF_SIZE = 2 * 1024 * 1024; // 2MB
const ALLOWED_PROOF_TYPES = [
  'application/pdf',
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
];

export default function SahayataDashboard() {
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [editingRecord, setEditingRecord] = useState<Sahayata | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [users, setUsers] = useState<User[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [memberPopoverOpen, setMemberPopoverOpen] = useState(false);
  const [proofUploading, setProofUploading] = useState(false);
  const [proofDeleting, setProofDeleting] = useState(false);
  const [pendingProofFile, setPendingProofFile] = useState<File | null>(null);
  const proofInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Fetch users for the member dropdown
    getUsers()
      .then((data: User[]) => setUsers(data))
      .catch(() => toast.error('सदस्य सूची लोड करने में विफल'));
  }, []);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleMemberChange = (memberId: string) => {
    const selectedUser = users.find(u => u._id === memberId);
    setFormData(prev => ({
      ...prev,
      memberId,
      memberName: selectedUser?.name || '',
    }));
  };

  const handleStatusChange = (status: string) => {
    setFormData(prev => ({
      ...prev,
      status: status as 'pending' | 'partial' | 'repaid',
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (editingRecord) {
        // Update existing record
        await updateSahayata(editingRecord._id, {
          memberId: formData.memberId,
          memberName: formData.memberName,
          amount: parseFloat(formData.amount),
          givenDate: formData.givenDate,
          description: formData.description,
          repaymentDate: formData.repaymentDate || undefined,
          repaidAmount: formData.repaidAmount
            ? parseFloat(formData.repaidAmount)
            : 0,
          status: formData.status,
        });
        toast.success('सहायता रिकॉर्ड अपडेट किया गया');
      } else {
        // Create new record
        const newRecord = await createSahayata({
          memberId: formData.memberId,
          memberName: formData.memberName,
          amount: parseFloat(formData.amount),
          givenDate: formData.givenDate,
          description: formData.description,
          repaymentDate: formData.repaymentDate || undefined,
        });
        // Upload proof if a file was selected during creation
        if (pendingProofFile) {
          try {
            await uploadSahayataProof(newRecord._id, pendingProofFile);
          } catch {
            toast.error(
              'रिकॉर्ड बना लेकिन प्रमाण अपलोड विफल। Edit करके पुनः अपलोड करें।'
            );
          }
        }
        toast.success('नया सहायता रिकॉर्ड जोड़ा गया');
      }
      setFormData(initialFormData);
      setEditingRecord(null);
      setPendingProofFile(null);
      if (proofInputRef.current) proofInputRef.current.value = '';
      setRefreshKey(prev => prev + 1);
    } catch {
      toast.error('सहायता रिकॉर्ड सेव करने में विफल');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (record: Sahayata) => {
    setEditingRecord(record);
    setFormData({
      memberId: record.memberId,
      memberName: record.memberName,
      amount: record.amount.toString(),
      givenDate: record.givenDate
        ? new Date(record.givenDate).toISOString().split('T')[0]
        : '',
      description: record.description || '',
      repaymentDate: record.repaymentDate
        ? new Date(record.repaymentDate).toISOString().split('T')[0]
        : '',
      repaidAmount: (record.repaidAmount || 0).toString(),
      status: record.status,
    });
  };

  const handleDelete = async (id: string) => {
    const confirmDelete = window.confirm(
      'क्या आप इस सहायता रिकॉर्ड को हटाना चाहते हैं?'
    );
    if (!confirmDelete) return;
    try {
      await deleteSahayata(id);
      toast.success('सहायता रिकॉर्ड हटा दिया गया');
      setRefreshKey(prev => prev + 1);
    } catch {
      toast.error('सहायता रिकॉर्ड हटाने में विफल');
    }
  };

  const handleCancel = () => {
    setEditingRecord(null);
    setFormData(initialFormData);
    setPendingProofFile(null);
    if (proofInputRef.current) proofInputRef.current.value = '';
  };

  const handleProofUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!ALLOWED_PROOF_TYPES.includes(file.type)) {
      toast.error('केवल PDF, JPEG, PNG, या WebP फ़ाइलें अनुमत हैं');
      if (proofInputRef.current) proofInputRef.current.value = '';
      return;
    }

    // Validate file size
    if (file.size > MAX_PROOF_SIZE) {
      toast.error('फ़ाइल का आकार 2MB से कम होना चाहिए');
      if (proofInputRef.current) proofInputRef.current.value = '';
      return;
    }

    if (editingRecord) {
      // Edit mode: upload immediately
      setProofUploading(true);
      try {
        const updated = await uploadSahayataProof(editingRecord._id, file);
        setEditingRecord(updated);
        setRefreshKey(prev => prev + 1);
        toast.success('प्रमाण अपलोड हो गया');
      } catch {
        toast.error('प्रमाण अपलोड करने में विफल');
      } finally {
        setProofUploading(false);
        if (proofInputRef.current) proofInputRef.current.value = '';
      }
    } else {
      // Create mode: stage file for upload after record creation
      setPendingProofFile(file);
    }
  };

  const handleProofDelete = async () => {
    if (!editingRecord) return;
    const confirmDelete = window.confirm('क्या आप प्रमाण हटाना चाहते हैं?');
    if (!confirmDelete) return;

    setProofDeleting(true);
    try {
      const updated = await deleteSahayataProof(editingRecord._id);
      setEditingRecord(updated);
      setRefreshKey(prev => prev + 1);
      toast.success('प्रमाण हटा दिया गया');
    } catch {
      toast.error('प्रमाण हटाने में विफल');
    } finally {
      setProofDeleting(false);
    }
  };

  const isFormValid =
    formData.memberId && formData.amount && formData.givenDate;

  return (
    <>
      <div className="max-w-3xl mx-auto p-3 sm:p-6 bg-gradient-to-br from-emerald-100 via-white to-teal-200 dark:from-zinc-900 dark:via-zinc-800 dark:to-zinc-900 rounded-xl shadow-2xl">
        <h3 className="text-base sm:text-lg font-bold text-emerald-700 dark:text-emerald-300 mb-4 text-center">
          {editingRecord
            ? '✏️ सहायता रिकॉर्ड अपडेट करें'
            : '➕ नया सहायता रिकॉर्ड जोड़ें'}
        </h3>
        <form
          onSubmit={handleSubmit}
          className="flex flex-col gap-4 bg-white/80 dark:bg-zinc-900/80 p-3 sm:p-6 rounded-lg shadow"
        >
          {/* Member Selection — Autocomplete Combobox */}
          <div className="flex flex-col sm:flex-row gap-2 sm:items-center">
            <label className="font-semibold text-emerald-700 dark:text-emerald-300 sm:w-32 text-sm">
              सदस्य:
            </label>
            <Popover
              open={memberPopoverOpen}
              onOpenChange={setMemberPopoverOpen}
            >
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={memberPopoverOpen}
                  className="w-full sm:flex-1 justify-between font-normal"
                >
                  {formData.memberName || 'सदस्य खोजें...'}
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent
                className="w-[--radix-popover-trigger-width] p-0"
                align="start"
              >
                <Command>
                  <CommandInput
                    placeholder="नाम टाइप करें..."
                    className="h-9"
                  />
                  <CommandList>
                    <CommandEmpty>कोई सदस्य नहीं मिला</CommandEmpty>
                    <CommandGroup>
                      {users.map(user => (
                        <CommandItem
                          key={user._id}
                          value={user.name}
                          onSelect={() => {
                            handleMemberChange(user._id);
                            setMemberPopoverOpen(false);
                          }}
                        >
                          {user.name}
                          <Check
                            className={cn(
                              'ml-auto h-4 w-4',
                              formData.memberId === user._id
                                ? 'opacity-100'
                                : 'opacity-0'
                            )}
                          />
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          </div>

          {/* Amount */}
          <div className="flex flex-col sm:flex-row gap-2 sm:items-center">
            <label className="font-semibold text-emerald-700 dark:text-emerald-300 sm:w-32 text-sm">
              राशि (₹):
            </label>
            <input
              type="number"
              name="amount"
              value={formData.amount}
              onChange={handleInputChange}
              required
              min={1}
              step="any"
              className="flex-1 px-3 sm:px-4 py-2 border border-emerald-300 rounded focus:outline-none focus:ring-2 focus:ring-emerald-400 bg-white dark:bg-zinc-800 dark:text-white"
              placeholder="राशि दर्ज करें"
            />
          </div>

          {/* Given Date */}
          <div className="flex flex-col sm:flex-row gap-2 sm:items-center">
            <label className="font-semibold text-emerald-700 dark:text-emerald-300 sm:w-32 text-sm">
              दी गई तिथि:
            </label>
            <input
              type="date"
              name="givenDate"
              value={formData.givenDate}
              onChange={handleInputChange}
              required
              className="flex-1 px-3 sm:px-4 py-2 border border-emerald-300 rounded focus:outline-none focus:ring-2 focus:ring-emerald-400 bg-white dark:bg-zinc-800 dark:text-white"
            />
          </div>

          {/* Repayment Date */}
          <div className="flex flex-col sm:flex-row gap-2 sm:items-center">
            <label className="font-semibold text-emerald-700 dark:text-emerald-300 sm:w-32 text-sm">
              वापसी तिथि:
            </label>
            <input
              type="date"
              name="repaymentDate"
              value={formData.repaymentDate}
              onChange={handleInputChange}
              className="flex-1 px-3 sm:px-4 py-2 border border-emerald-300 rounded focus:outline-none focus:ring-2 focus:ring-emerald-400 bg-white dark:bg-zinc-800 dark:text-white"
            />
          </div>

          {/* Repaid Amount — only in edit mode */}
          {editingRecord && (
            <>
              <div className="flex flex-col sm:flex-row gap-2 sm:items-center">
                <label className="font-semibold text-emerald-700 dark:text-emerald-300 sm:w-32 text-sm">
                  वापस राशि (₹):
                </label>
                <input
                  type="number"
                  name="repaidAmount"
                  value={formData.repaidAmount}
                  onChange={handleInputChange}
                  min={0}
                  step="any"
                  className="flex-1 px-3 sm:px-4 py-2 border border-emerald-300 rounded focus:outline-none focus:ring-2 focus:ring-emerald-400 bg-white dark:bg-zinc-800 dark:text-white"
                  placeholder="वापस की गई राशि"
                />
              </div>
              <div className="flex flex-col sm:flex-row gap-2 sm:items-center">
                <label className="font-semibold text-emerald-700 dark:text-emerald-300 sm:w-32 text-sm">
                  स्थिति:
                </label>
                <Select
                  value={formData.status}
                  onValueChange={handleStatusChange}
                >
                  <SelectTrigger className="flex-1">
                    <SelectValue placeholder="स्थिति चुनें..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">लंबित (Pending)</SelectItem>
                    <SelectItem value="partial">आंशिक (Partial)</SelectItem>
                    <SelectItem value="repaid">चुकता (Repaid)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </>
          )}

          {/* Proof Upload Section — available in both create and edit modes */}
          <div className="flex flex-col gap-2">
            <label className="font-semibold text-emerald-700 dark:text-emerald-300 text-sm">
              📎 प्रमाण (PDF / Image):
            </label>
            <div className="flex flex-col gap-2 p-3 border border-dashed border-emerald-400 rounded-lg bg-emerald-50/50 dark:bg-zinc-800/50">
              {/* Edit mode: existing proof uploaded */}
              {editingRecord?.proofUrl ? (
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-2 text-sm text-emerald-700 dark:text-emerald-300">
                    {editingRecord.proofType === 'pdf' ? (
                      <FileText className="w-4 h-4" />
                    ) : (
                      <ImageIcon className="w-4 h-4" />
                    )}
                    <span className="font-medium">
                      प्रमाण अपलोड है (
                      {editingRecord.proofType === 'pdf' ? 'PDF' : 'Image'})
                    </span>
                  </div>
                  {editingRecord.proofType === 'image' && (
                    <img
                      src={editingRecord.proofUrl}
                      alt="Proof preview"
                      className="max-h-32 rounded border border-emerald-200 dark:border-emerald-700 object-contain"
                    />
                  )}
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      onClick={() => proofInputRef.current?.click()}
                      disabled={proofUploading}
                      className="flex-1 px-3 py-1.5 rounded bg-blue-500 hover:bg-blue-600 text-white font-semibold text-sm transition-colors"
                    >
                      <Upload className="w-3.5 h-3.5 mr-1.5" />
                      {proofUploading ? 'अपलोड हो रहा...' : 'बदलें'}
                    </Button>
                    <Button
                      type="button"
                      onClick={handleProofDelete}
                      disabled={proofDeleting}
                      className="px-3 py-1.5 rounded bg-red-500 hover:bg-red-600 text-white font-semibold text-sm transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5 mr-1.5" />
                      {proofDeleting ? 'हटा रहा...' : 'हटाएं'}
                    </Button>
                  </div>
                </div>
              ) : pendingProofFile ? (
                /* Create mode: file staged for upload */
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-2 text-sm text-emerald-700 dark:text-emerald-300">
                    {pendingProofFile.type === 'application/pdf' ? (
                      <FileText className="w-4 h-4" />
                    ) : (
                      <ImageIcon className="w-4 h-4" />
                    )}
                    <span className="font-medium truncate">
                      {pendingProofFile.name}
                    </span>
                    <span className="text-xs text-gray-400">
                      ({(pendingProofFile.size / 1024).toFixed(0)} KB)
                    </span>
                  </div>
                  {pendingProofFile.type.startsWith('image/') && (
                    <img
                      src={URL.createObjectURL(pendingProofFile)}
                      alt="Proof preview"
                      className="max-h-32 rounded border border-emerald-200 dark:border-emerald-700 object-contain"
                    />
                  )}
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      onClick={() => proofInputRef.current?.click()}
                      className="flex-1 px-3 py-1.5 rounded bg-blue-500 hover:bg-blue-600 text-white font-semibold text-sm transition-colors"
                    >
                      <Upload className="w-3.5 h-3.5 mr-1.5" />
                      बदलें
                    </Button>
                    <Button
                      type="button"
                      onClick={() => {
                        setPendingProofFile(null);
                        if (proofInputRef.current)
                          proofInputRef.current.value = '';
                      }}
                      className="px-3 py-1.5 rounded bg-red-500 hover:bg-red-600 text-white font-semibold text-sm transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5 mr-1.5" />
                      हटाएं
                    </Button>
                  </div>
                </div>
              ) : (
                /* No proof selected yet */
                <div className="flex flex-col items-center gap-2 py-2">
                  <Upload className="w-8 h-8 text-emerald-400 dark:text-emerald-600" />
                  <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
                    PDF, JPEG, PNG, या WebP (अधिकतम 2MB)
                  </p>
                  <Button
                    type="button"
                    onClick={() => proofInputRef.current?.click()}
                    disabled={proofUploading}
                    className="px-4 py-1.5 rounded bg-emerald-500 hover:bg-emerald-600 text-white font-semibold text-sm transition-colors"
                  >
                    <Upload className="w-3.5 h-3.5 mr-1.5" />
                    {proofUploading ? 'अपलोड हो रहा...' : 'प्रमाण अपलोड करें'}
                  </Button>
                </div>
              )}
              <input
                ref={proofInputRef}
                type="file"
                accept=".pdf,.jpg,.jpeg,.png,.webp"
                className="hidden"
                onChange={handleProofUpload}
              />
            </div>
          </div>

          {/* Description */}
          <div className="flex flex-col sm:flex-row gap-2 sm:items-start">
            <label className="font-semibold text-emerald-700 dark:text-emerald-300 sm:w-32 text-sm mt-2">
              विवरण:
            </label>
            <input
              type="text"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              className="flex-1 px-3 sm:px-4 py-2 border border-emerald-300 rounded focus:outline-none focus:ring-2 focus:ring-emerald-400 bg-white dark:bg-zinc-800 dark:text-white"
              placeholder="सहायता का कारण / विवरण (वैकल्पिक)"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 justify-end mt-2">
            {editingRecord && (
              <Button
                type="button"
                onClick={handleCancel}
                className="px-4 sm:px-6 py-2 rounded bg-gray-400 hover:bg-gray-500 text-white font-bold shadow transition-colors"
              >
                रद्द करें
              </Button>
            )}
            <Button
              type="submit"
              disabled={!isFormValid || submitting}
              className="px-4 sm:px-6 py-2 rounded bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow transition-colors"
            >
              {submitting
                ? 'सेव हो रहा है...'
                : editingRecord
                  ? 'अपडेट करें'
                  : 'जोड़ें'}
            </Button>
          </div>
        </form>
      </div>

      <div className="max-w-3xl mx-auto">
        <SahayataTable
          showActions={true}
          onEdit={handleEdit}
          onDelete={handleDelete}
          refreshKey={refreshKey}
        />
      </div>
    </>
  );
}
