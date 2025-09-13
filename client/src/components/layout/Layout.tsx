import { Navbar } from './Navbar';
import { Footer } from './Footer';
import type { ReactNode } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import ScrollToTop from '../pages/ScrollToTop';
import { useEffect, useRef } from 'react';

export function Layout({ children }: { children: ReactNode }) {
  const isFirstLoad = useRef(true);

  useEffect(() => {
    const handleOnline = () => {
      if (!isFirstLoad.current) {
        toast.success('🌐 You are back online!', {
          position: 'top-center',
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        });
      }
    };

    const handleOffline = () => {
      if (!isFirstLoad.current) {
        toast.error('📡 You are offline. Some features may not work.', {
          position: 'top-center',
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        });
      }
    };

    // Set first load to false after a brief delay to avoid showing notifications on initial page load
    const timer = setTimeout(() => {
      isFirstLoad.current = false;
    }, 1000);

    // Add event listeners
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Cleanup
    return () => {
      clearTimeout(timer);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);
  return (
    <div className="relative flex flex-col min-h-screen text-gray-800 dark:text-gray-100 overflow-hidden">
      {/* Premium gradient background */}
      <div className="absolute inset-0 -z-10 bg-gradient-to-br from-blue-100 via-purple-100 to-pink-200 dark:from-gray-900 dark:via-indigo-900 dark:to-gray-950" />
      {/* Subtle overlay for depth */}
      <div className="absolute inset-0 -z-10 bg-white/60 dark:bg-black/40 backdrop-blur-sm" />
      <Navbar />
      <main className="flex-grow px-4 py-6 relative z-0 bg-transparent">
        {children}
      </main>
      <Footer />
      <ToastContainer />
      <ScrollToTop />
    </div>
  );
}
