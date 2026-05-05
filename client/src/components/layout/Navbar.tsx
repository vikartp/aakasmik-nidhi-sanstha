import { Button } from '@/components/ui/button';
import { Moon, Sun } from 'lucide-react';
import { useEffect, useState } from 'react';
import logo from '/aakasmik-nidhi-logo.png';

const UI_THEME_STORAGE_KEY = 'aakasmik-ui-theme';

export function Navbar() {
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    const stored = localStorage.getItem(UI_THEME_STORAGE_KEY);
    if (stored === null) return true; // default to dark mode
    return stored === 'true';
  });

  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode);
    localStorage.setItem(UI_THEME_STORAGE_KEY, String(darkMode));
  }, [darkMode]);

  return (
    <header className="sticky top-0 z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md shadow-sm border-b border-gray-200/50 dark:border-gray-800/50">
      <div className="max-w-7xl mx-auto px-3 py-1.5 flex justify-between items-center">
        <a href="/" className="flex-shrink-0 flex items-center">
          <img src={logo} className="h-6 sm:h-7" alt="Aakasmik Nidhi logo" />
        </a>
        <h1 className="text-sm sm:text-lg font-bold text-gray-800 dark:text-white mx-2 truncate text-center flex-grow">
          आकस्मिक निधि युवा संस्था बरकनगांगो
        </h1>
        <Button
          variant="ghost"
          onClick={() => setDarkMode(!darkMode)}
          size="icon"
          className="h-8 w-8 flex-shrink-0"
        >
          {darkMode ? (
            <Sun className="h-4 w-4" />
          ) : (
            <Moon className="h-4 w-4" />
          )}
        </Button>
      </div>
    </header>
  );
}
