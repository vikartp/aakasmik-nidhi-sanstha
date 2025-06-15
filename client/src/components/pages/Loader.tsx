import { LoaderPinwheel } from 'lucide-react';

interface LoaderProps {
  text?: string;
}

export default function Loader({
  text = 'Loading, please wait...',
}: LoaderProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[150px] w-full">
      <LoaderPinwheel className="animate-spin text-blue-500" size={48} />
      <span className="mt-4 text-gray-600 text-lg font-medium animate-pulse">
        {text}
      </span>
    </div>
  );
}
