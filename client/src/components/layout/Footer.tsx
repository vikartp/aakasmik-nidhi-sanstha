export function Footer() {
  return (
    <footer className="sticky bottom-0 z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] border-t border-gray-200/50 dark:border-gray-800/50 text-center py-1.5 mt-auto">
      <div className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400 leading-tight">
        &copy; {new Date().getFullYear()} आकस्मिक निधि युवा संस्था बरकनगांगो.
        All rights reserved.
      </div>
      <div className="flex justify-center items-center gap-1 text-[11px] sm:text-xs font-medium text-gray-500 dark:text-gray-300 leading-tight">
        <span>
          Made with <span className="text-red-500 text-[10px]">&#10084;</span>{' '}
          in India by{' '}
          <span className="font-semibold text-gray-600 dark:text-gray-200">
            Vikash Kumar
          </span>
          .
        </span>
      </div>
    </footer>
  );
}
