export function Footer() {
  return (
    <footer className="bg-white dark:bg-gray-900 text-center text-sm text-gray-500 dark:text-gray-400 py-2 border-t border-gray-200 dark:border-gray-800">
      <div>
        &copy; {new Date().getFullYear()} आकस्मिक निधि युवा संस्था बरकनगांगो. All rights reserved.
      </div>
      <div className="mt-1 flex flex-col sm:flex-row justify-center items-center gap-1 text-base font-medium text-gray-500 dark:text-gray-300">
        <span>
          Made with <span className="text-red-500">&#10084;</span> in India by{" "}
          <span className="font-semibold text-gray-600 dark:text-gray-200">
            Vikash Kumar
          </span>
          .
        </span>
      </div>
    </footer>
  );
}
