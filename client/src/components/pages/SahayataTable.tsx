import { useEffect, useState } from 'react';
import {
  getSahayataRecords,
  type Sahayata,
} from '@/services/sahayata';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { toast } from 'react-toastify';
import { Button } from '../ui/button';
import { HandHeart } from 'lucide-react';

interface SahayataTableProps {
  showActions?: boolean;
  onEdit?: (record: Sahayata) => void;
  onDelete?: (id: string) => void;
  refreshKey?: number;
}

const statusConfig = {
  pending: {
    label: 'लंबित (Pending)',
    className:
      'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/60 dark:text-yellow-200 border-yellow-300 dark:border-yellow-700',
  },
  partial: {
    label: 'आंशिक (Partial)',
    className:
      'bg-orange-100 text-orange-800 dark:bg-orange-900/60 dark:text-orange-200 border-orange-300 dark:border-orange-700',
  },
  repaid: {
    label: 'चुकता (Repaid)',
    className:
      'bg-green-100 text-green-800 dark:bg-green-900/60 dark:text-green-200 border-green-300 dark:border-green-700',
  },
};

function formatDate(dateStr?: string): string {
  if (!dateStr) return '—';
  const d = new Date(dateStr);
  return d.toLocaleDateString('hi-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

export default function SahayataTable({
  showActions = false,
  onEdit,
  onDelete,
  refreshKey,
}: SahayataTableProps) {
  const [records, setRecords] = useState<Sahayata[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchRecords();
  }, [refreshKey]);

  const fetchRecords = async () => {
    setLoading(true);
    try {
      const data = await getSahayataRecords();
      setRecords(data);
    } catch (error) {
      toast.error('सहायता रिकॉर्ड लोड करने में विफल');
      console.error('Error fetching sahayata records:', error);
    } finally {
      setLoading(false);
    }
  };

  const totalGiven = records.reduce((sum, r) => sum + r.amount, 0);
  const totalRepaid = records.reduce((sum, r) => sum + (r.repaidAmount || 0), 0);
  const totalPending = totalGiven - totalRepaid;

  return (
    <div className="mt-8 rounded-xl overflow-hidden shadow-lg bg-white/80 dark:bg-zinc-900/80 border border-emerald-200 dark:border-emerald-800/50">
      {/* Header */}
      <div className="p-4 flex flex-col items-center justify-center bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-950/40 dark:to-teal-950/40">
        <h2 className="flex items-center gap-2 text-center text-2xl font-bold text-emerald-700 dark:text-emerald-300 drop-shadow-sm mb-2">
          <HandHeart className="w-7 h-7 text-emerald-500 dark:text-emerald-400 animate-pulse" />
          सहायता राशि विवरण
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          संस्था द्वारा सदस्यों को दी गई सहायता राशि का विवरण
        </p>
        {loading && (
          <div className="text-center text-emerald-600 font-semibold py-4 animate-pulse">
            रिकॉर्ड लोड हो रहे हैं...
          </div>
        )}
      </div>

      {/* Desktop Table — hidden on small screens */}
      <div className="hidden sm:block">
        <Table className="min-w-full">
          <TableHeader>
            <TableRow className="bg-emerald-50/50 dark:bg-emerald-950/30">
              <TableHead className="text-sm font-semibold whitespace-normal break-words">
                सदस्य
              </TableHead>
              <TableHead className="text-sm font-semibold whitespace-normal break-words">
                राशि (₹)
              </TableHead>
              <TableHead className="text-sm font-semibold whitespace-normal break-words">
                दी गई तिथि
              </TableHead>
              <TableHead className="text-sm font-semibold whitespace-normal break-words">
                वापसी तिथि
              </TableHead>
              <TableHead className="text-sm font-semibold whitespace-normal break-words">
                वापस राशि (₹)
              </TableHead>
              <TableHead className="text-sm font-semibold whitespace-normal break-words">
                स्थिति
              </TableHead>
              <TableHead className="text-sm font-semibold whitespace-normal break-words">
                विवरण
              </TableHead>
              {showActions && (
                <TableHead className="text-sm font-semibold whitespace-normal break-words">
                  कार्रवाई
                </TableHead>
              )}
            </TableRow>
          </TableHeader>
          <TableBody>
            {records.length === 0 && !loading ? (
              <TableRow>
                <TableCell
                  colSpan={showActions ? 8 : 7}
                  className="text-center py-8 text-gray-500 dark:text-gray-400"
                >
                  कोई सहायता रिकॉर्ड नहीं मिला.
                </TableCell>
              </TableRow>
            ) : (
              records.map(record => (
                <TableRow
                  key={record._id}
                  className="hover:bg-emerald-50/50 dark:hover:bg-zinc-800/50 transition-colors"
                >
                  <TableCell className="font-medium whitespace-normal break-words">
                    {record.memberName}
                  </TableCell>
                  <TableCell className="text-emerald-700 dark:text-emerald-300 font-bold whitespace-normal break-words">
                    ₹{record.amount.toLocaleString('en-IN')}
                  </TableCell>
                  <TableCell className="whitespace-normal break-words">
                    {formatDate(record.givenDate)}
                  </TableCell>
                  <TableCell className="whitespace-normal break-words">
                    {formatDate(record.repaymentDate)}
                  </TableCell>
                  <TableCell className="whitespace-normal break-words">
                    ₹{(record.repaidAmount || 0).toLocaleString('en-IN')}
                  </TableCell>
                  <TableCell className="whitespace-normal break-words">
                    <span
                      className={`inline-block px-2 py-1 text-xs font-semibold rounded-full border ${statusConfig[record.status].className}`}
                    >
                      {statusConfig[record.status].label}
                    </span>
                  </TableCell>
                  <TableCell className="text-gray-600 dark:text-gray-300 whitespace-normal break-words max-w-[200px]">
                    {record.description || '—'}
                  </TableCell>
                  {showActions && onEdit && onDelete && (
                    <TableCell className="whitespace-normal break-words">
                      <Button
                        onClick={() => onEdit(record)}
                        className="px-3 py-1 mr-2 mb-2 rounded bg-yellow-400 hover:bg-yellow-500 text-white font-semibold transition-colors"
                      >
                        Edit
                      </Button>
                      <Button
                        onClick={() => onDelete(record._id)}
                        className="px-3 py-1 rounded bg-red-500 hover:bg-red-600 text-white font-semibold transition-colors"
                      >
                        Delete
                      </Button>
                    </TableCell>
                  )}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Mobile Accordion — shown only on small screens */}
      <div className="block sm:hidden px-3 pb-3">
        {records.length === 0 && !loading ? (
          <p className="text-center py-8 text-gray-500 dark:text-gray-400">
            कोई सहायता रिकॉर्ड नहीं मिला.
          </p>
        ) : (
          <Accordion type="single" collapsible className="w-full">
            {records.map((record, index) => (
              <AccordionItem key={record._id} value={record._id}>
                <AccordionTrigger className="hover:no-underline">
                  <div className="flex items-center justify-between w-full pr-2">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-sm">
                        {index + 1}. {record.memberName}
                      </span>
                      <span
                        className={`inline-block px-1.5 py-0.5 text-[10px] font-semibold rounded-full border ${statusConfig[record.status].className}`}
                      >
                        {record.status === 'pending'
                          ? 'लंबित'
                          : record.status === 'partial'
                            ? 'आंशिक'
                            : 'चुकता'}
                      </span>
                    </div>
                    <span className="text-emerald-700 dark:text-emerald-300 font-bold text-sm">
                      ₹{record.amount.toLocaleString('en-IN')}
                    </span>
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="grid grid-cols-2 gap-2 text-sm px-1 py-2">
                    <div>
                      <span className="text-gray-500 dark:text-gray-400 text-xs">
                        दी गई तिथि
                      </span>
                      <p className="font-medium">
                        {formatDate(record.givenDate)}
                      </p>
                    </div>
                    <div>
                      <span className="text-gray-500 dark:text-gray-400 text-xs">
                        वापसी तिथि
                      </span>
                      <p className="font-medium">
                        {formatDate(record.repaymentDate)}
                      </p>
                    </div>
                    <div>
                      <span className="text-gray-500 dark:text-gray-400 text-xs">
                        वापस राशि
                      </span>
                      <p className="font-medium">
                        ₹{(record.repaidAmount || 0).toLocaleString('en-IN')}
                      </p>
                    </div>
                    <div>
                      <span className="text-gray-500 dark:text-gray-400 text-xs">
                        अपडेट द्वारा
                      </span>
                      <p className="font-medium italic text-gray-600 dark:text-gray-300">
                        {record.updatedBy}
                      </p>
                    </div>
                    {record.description && (
                      <div className="col-span-2">
                        <span className="text-gray-500 dark:text-gray-400 text-xs">
                          विवरण
                        </span>
                        <p className="font-medium">{record.description}</p>
                      </div>
                    )}
                    {showActions && onEdit && onDelete && (
                      <div className="col-span-2 flex gap-2 mt-2">
                        <Button
                          onClick={() => onEdit(record)}
                          className="flex-1 px-3 py-1 rounded bg-yellow-400 hover:bg-yellow-500 text-white font-semibold transition-colors"
                        >
                          Edit
                        </Button>
                        <Button
                          onClick={() => onDelete(record._id)}
                          className="flex-1 px-3 py-1 rounded bg-red-500 hover:bg-red-600 text-white font-semibold transition-colors"
                        >
                          Delete
                        </Button>
                      </div>
                    )}
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        )}
      </div>

      {/* Summary */}
      {records.length > 0 && (
        <div className="p-4 bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-950/40 dark:to-teal-950/40 border-t border-emerald-200 dark:border-emerald-800/50">
          <div className="flex flex-wrap gap-3 justify-center sm:justify-end">
            <span className="inline-block bg-emerald-100 dark:bg-emerald-900 text-emerald-800 dark:text-emerald-200 px-4 py-2 rounded-lg text-sm font-bold shadow">
              कुल दी गई: ₹{totalGiven.toLocaleString('en-IN')}
            </span>
            <span className="inline-block bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 px-4 py-2 rounded-lg text-sm font-bold shadow">
              कुल वापस: ₹{totalRepaid.toLocaleString('en-IN')}
            </span>
            <span className="inline-block bg-amber-100 dark:bg-amber-900 text-amber-800 dark:text-amber-200 px-4 py-2 rounded-lg text-sm font-bold shadow">
              शेष बकाया: ₹{totalPending.toLocaleString('en-IN')}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
