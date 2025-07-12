import { useState } from 'react';
import api from '@/services/api';
import ExpenseTable from './ExpenseTable';
import type { Expense } from './ExpenseTable';
import { Button } from '../ui/button';
import { toast } from 'react-toastify';

export default function ExpenseDashboard() {
  const [formData, setFormData] = useState<{
    amount: string;
    description: string;
  }>({
    amount: '',
    description: '',
  });
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  // Handlers for form
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        ...formData,
        amount: parseFloat(formData.amount),
      };
      if (editingExpense) {
        await api.put(`/expense/${editingExpense._id}`, payload);
      } else {
        await api.post('/expense', payload);
      }
      setFormData({ amount: '', description: '' });
      setEditingExpense(null);
      setRefreshKey(prev => prev + 1); // trigger table refresh
    } catch {
      toast.error('Failed to save expense. Please try again later.');
    }
  };

  const handleEdit = (expense: Expense) => {
    setEditingExpense(expense);
    setFormData({
      amount: expense.amount.toString(),
      description: expense.description,
    });
  };

  const handleDelete = async (id: string) => {
    try {
      await api.delete(`/expense/${id}`);
      setRefreshKey(prev => prev + 1);
    } catch {
      toast.error('Failed to delete expense. Please try again later.');
    }
  };

  return (
    <>
      <div className="max-w-2xl mx-auto p-6 bg-gradient-to-br from-blue-100 via-white to-blue-200 dark:from-zinc-900 dark:via-zinc-800 dark:to-zinc-900 rounded-xl shadow-2xl">
        <form
          onSubmit={handleSubmit}
          className="flex flex-col gap-4 bg-white/80 dark:bg-zinc-900/80 p-6 rounded-lg shadow mb-8"
        >
          <div className="flex flex-col sm:flex-row gap-4 items-center">
            <label className="font-semibold text-blue-700 dark:text-blue-300 w-28">
              Amount:
            </label>
            <input
              type="number"
              name="amount"
              value={formData.amount}
              onChange={handleInputChange}
              required
              min={0.01}
              step="any"
              className="flex-1 px-4 py-2 border border-blue-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white dark:bg-zinc-800 dark:text-white"
              placeholder="Enter amount"
            />
          </div>
          <div className="flex flex-col sm:flex-row gap-4 items-center">
            <label className="font-semibold text-blue-700 dark:text-blue-300 w-28">
              Description:
            </label>
            <input
              type="text"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              required
              className="flex-1 px-4 py-2 border border-blue-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white dark:bg-zinc-800 dark:text-white"
              placeholder="Expense description"
            />
          </div>
          <Button
            type="submit"
            disabled={!formData.amount || !formData.description}
            className="mt-2 px-6 py-2 rounded bg-blue-600 hover:bg-blue-700 text-white font-bold shadow transition-colors self-end"
          >
            {editingExpense ? 'Update' : 'Add'} Expense
          </Button>
        </form>
      </div>
      <div className="max-w-2xl mx-auto">
        <ExpenseTable
          showActions={true}
          onEdit={handleEdit}
          onDelete={handleDelete}
          key={refreshKey}
        />
      </div>
    </>
  );
}
