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
    <header className="bg-white dark:bg-gray-900 shadow sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 py-3 flex justify-center items-center">
        <a href="/">
          <img src={logo} className="h-8" alt="Aakasmik Nidhi logo" />
        </a>
        <h1 className="text-xl font-bold text-gray-800 dark:text-white ml-4">
          आकस्मिक निधि युवा संस्था बरकनगांगो
        </h1>
        <Button
          variant="ghost"
          onClick={() => setDarkMode(!darkMode)}
          size="icon"
        >
          {darkMode ? (
            <Sun className="h-5 w-5" />
          ) : (
            <Moon className="h-5 w-5" />
          )}
        </Button>
      </div>
    </header>
  );
}
