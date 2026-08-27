'use client';
import React from 'react';
import { Sidebar } from './Sidebar';
import { NavbarTop } from './NavbarTop';
import { BottomNav } from './BottomNav';
import { ToastProvider } from '@/components/ui/Toast';

export function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <ToastProvider>
      <div className="min-h-screen bg-[#f8fafc]">
        {/* Desktop Sidebar (Only visible on lg+ screens) */}
        <div className="hidden lg:block">
          <Sidebar isOpen={true} />
        </div>

        <div className="lg:pl-64 flex flex-col min-h-screen">
          <NavbarTop />
          <main className="flex-1 p-3.5 sm:p-5 lg:p-6 pb-28 lg:pb-8 w-full">
            {children}
          </main>
        </div>

        {/* Mobile Bottom Navigation Bar (Visible only on mobile) */}
        <BottomNav />
      </div>
    </ToastProvider>
  );
}
