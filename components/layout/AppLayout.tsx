'use client';
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Sidebar } from './Sidebar';
import { NavbarTop } from './NavbarTop';
import { BottomNav } from './BottomNav';
import { ToastProvider } from '@/components/ui/Toast';
import { useNEXSStore } from '@/lib/store';

export function AppLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { currentUser } = useNEXSStore();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (isMounted && !currentUser) {
      router.replace('/login');
    }
  }, [isMounted, currentUser, router]);

  // Prevent flash of authenticated content before session check
  if (!isMounted || !currentUser) {
    return (
      <div className="min-h-screen bg-[#0f172a] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-3 border-orange-500/20 border-t-orange-500 rounded-full animate-spin" />
          <span className="text-xs text-slate-400 font-medium">Memuat sesi...</span>
        </div>
      </div>
    );
  }

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
