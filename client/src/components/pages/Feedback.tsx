import { useEffect, useState } from 'react';
import {
  getFeedbacks,
  deleteFeedback,
  type Feedback,
} from '@/services/feedback';
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from '@/components/ui/accordion';
import { Button } from '../ui/button';
import { toast } from 'react-toastify';
import Loader from './Loader';

export default function FeedbackList() {
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [loading, setLoading] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchFeedbacks = async () => {
    setLoading(true);
    try {
      const data = await getFeedbacks();
      setFeedbacks(data);
    } catch {
      toast.error('Failed to fetch feedbacks.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFeedbacks();
  }, []);

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this feedback?'))
      return;
    setDeletingId(id);
    try {
      await deleteFeedback(id);
      toast.success('Feedback deleted');
      setFeedbacks(prev => prev.filter(f => f._id !== id));
    } catch {
      toast.error('Failed to delete feedback.');
    } finally {
      setDeletingId(null);
    }
  };

  if (loading) return <Loader text="Loading feedbacks..." />;
  if (!feedbacks.length)
    return (
      <div className="text-center text-zinc-500 py-8">No feedbacks found.</div>
    );

  return (
    <div className="rounded-md border max-h-80 sm:max-h-96 overflow-y-auto bg-white/60 dark:bg-black/40 w-full">
      <Accordion type="single" collapsible className="w-full no-underline">
        {feedbacks.map(fb => (
          <AccordionItem value={fb._id} key={fb._id}>
            <AccordionTrigger>
              <div className="flex justify-center items-center gap-4 px-4">
                <div className="flex flex-col w-full">
                  <span className="font-semibold text-base sm:text-lg">
                    {fb.userName}
                  </span>
                  <span className="text-zinc-500 text-base sm:text-lg">
                    ({fb.fatherName})
                  </span>
                </div>
                <div>
                  <span className="text-xs sm:text-sm text-zinc-400 font-mono mt-1">
                    {new Date(fb.createdAt).toLocaleString('en-IN', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <div className="flex flex-col gap-2">
                <div className="whitespace-pre-line text-zinc-800 dark:text-zinc-100 mb-2 px-4">
                  {fb.content}
                </div>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => handleDelete(fb._id)}
                  disabled={deletingId === fb._id}
                  className="self-end"
                >
                  {deletingId === fb._id ? 'Deleting...' : 'Delete'}
                </Button>
              </div>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
}

/* Add this to the file or your global CSS if needed:
   .no-underline > button { text-decoration: none !important; }
*/
