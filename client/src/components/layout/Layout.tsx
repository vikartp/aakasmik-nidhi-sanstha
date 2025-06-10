import { Navbar } from './Navbar';
import { Footer } from './Footer';
import type { ReactNode } from 'react';

export function Layout({ children }: { children: ReactNode }) {
  return (
    <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-gray-950 text-gray-800 dark:text-gray-100">
      <Navbar />
      <main className="flex-grow px-4 py-6">{children}</main>
      <Footer />
    </div>
  );
}
