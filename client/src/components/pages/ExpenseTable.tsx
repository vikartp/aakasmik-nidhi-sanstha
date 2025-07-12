import { useEffect, useState } from 'react';
import api from '@/services/api';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { toast } from 'react-toastify';
import { Button } from '../ui/button';
import { Wallet } from 'lucide-react';

export interface Expense {
  _id: string;
  amount: number;
  description: string;
  updatedBy: string;
}

interface ExpenseTableProps {
  showActions?: boolean;
  onEdit?: (expense: Expense) => void;
  onDelete?: (id: string) => void;
}

export default function ExpenseTable({
  showActions = false,
  onEdit,
  onDelete,
}: ExpenseTableProps) {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchExpenses();
  }, []);

  const fetchExpenses = async () => {
    setLoading(true);
    try {
      const response = await api.get<Expense[]>('/expense');
      setExpenses(response.data);
    } catch (error) {
      toast.error('Failed to fetch expenses. Please try again later.');
      console.error('Error fetching expenses:', error);
    } finally {
      setLoading(false);
    }
  };

  // Calculate total amount
  const total = expenses.reduce((sum, exp) => sum + exp.amount, 0);

  return (
    <div className="mt-8 rounded-lg overflow-x-auto shadow-lg bg-white/80 dark:bg-zinc-900/80">
      <div className="p-4 flex flex-col items-center justify-center">
        <h2 className="flex items-center gap-2 text-center text-2xl font-bold text-blue-700 dark:text-blue-200 drop-shadow-sm mb-2">
          <Wallet className="w-7 h-7 text-blue-500 dark:text-blue-300 animate-bounce-slow" />
          खर्चों की सूची
        </h2>
        {loading && (
          <div className="text-center text-blue-600 font-semibold py-8 animate-pulse">
            खर्च लोड हो रहे हैं...
          </div>
        )}
      </div>
      <Table className="min-w-full">
        <TableHeader>
          <TableRow>
            <TableHead className="text-sm font-semibold whitespace-normal break-words">
              Amount
            </TableHead>
            <TableHead className="text-sm font-semibold whitespace-normal break-words">
              Description
            </TableHead>
            <TableHead className="text-sm font-semibold whitespace-normal break-words">
              Updated By
            </TableHead>
            {showActions && (
              <TableHead className="text-sm font-semibold whitespace-normal break-words">
                Actions
              </TableHead>
            )}
          </TableRow>
        </TableHeader>
        <TableBody>
          {expenses.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={showActions ? 4 : 3}
                className="text-center py-8 text-gray-500 dark:text-gray-400"
              >
                कोई खर्च नहीं मिला.
              </TableCell>
            </TableRow>
          ) : (
            expenses.map(expense => (
              <TableRow
                key={expense._id}
                className="hover:bg-blue-50 dark:hover:bg-zinc-800 transition-colors"
              >
                <TableCell className="text-blue-700 font-bold whitespace-normal break-words">
                  ₹{expense.amount}
                </TableCell>
                <TableCell className="whitespace-normal break-words">
                  {expense.description}
                </TableCell>
                <TableCell className="italic text-gray-600 dark:text-gray-300 whitespace-normal break-words">
                  {expense.updatedBy}
                </TableCell>
                {showActions && onEdit && onDelete && (
                  <TableCell className="whitespace-normal break-words">
                    <Button
                      onClick={() => onEdit(expense)}
                      className="px-3 py-1 mr-2 mb-2 rounded bg-yellow-400 hover:bg-yellow-500 text-white font-semibold transition-colors"
                    >
                      Edit
                    </Button>
                    <Button
                      onClick={() => onDelete(expense._id)}
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
      {expenses.length > 0 && (
        <div className="mt-4 mb-2 flex justify-end">
          <span className="inline-block bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-4 py-2 rounded-lg text-lg font-bold shadow">
            कुल खर्च: ₹
            {total.toLocaleString('en-IN', { maximumFractionDigits: 2 })} रुपये
          </span>
        </div>
      )}
    </div>
  );
}
