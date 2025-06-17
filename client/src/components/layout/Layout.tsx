import { Navbar } from './Navbar';
import { Footer } from './Footer';
import type { ReactNode } from 'react';
import { ToastContainer } from 'react-toastify';

export function Layout({ children }: { children: ReactNode }) {
  return (
    <div className="relative flex flex-col min-h-screen text-gray-800 dark:text-gray-100 overflow-hidden">
      {/* Premium gradient background */}
      <div className="absolute inset-0 -z-10 bg-gradient-to-br from-blue-100 via-purple-100 to-pink-200 dark:from-gray-900 dark:via-indigo-900 dark:to-gray-950" />
      {/* Subtle overlay for depth */}
      <div className="absolute inset-0 -z-10 bg-white/60 dark:bg-black/40 backdrop-blur-sm" />
      <Navbar />
      <main className="flex-grow px-4 py-6">{children}</main>
      <Footer />
      <ToastContainer />
    </div>
  );
}
