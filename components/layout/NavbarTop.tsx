'use client';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { LogOut } from 'lucide-react';
import { useNEXSStore } from '@/lib/store';
import { NexsLogo } from '@/components/ui/NexsLogo';
import { ConfirmDialog } from '@/components/ui/Modal';
import { useToast } from '@/components/ui/Toast';

export function NavbarTop() {
  const router = useRouter();
  const { currentUser, logout } = useNEXSStore();
  const toast = useToast();
  const isAdmin = currentUser?.role === 'ADMIN';

  const [isLogoutConfirmOpen, setIsLogoutConfirmOpen] = useState(false);

  const handleConfirmLogout = () => {
    logout();
    setIsLogoutConfirmOpen(false);
    toast.info('Logout Berhasil', 'Sesi Anda telah diakhiri.');
    router.replace('/login');
  };

  return (
    <>
      <header className="sticky top-0 z-30 flex h-14 sm:h-16 w-full items-center justify-between border-b border-slate-200/80 bg-white/95 px-3 sm:px-6 lg:px-8 backdrop-blur-md">
        {/* Official NEXS Logo: Icon-only on mobile, Full on desktop */}
        <div className="flex items-center">
          {/* Mobile: ONLY the 3D 'N' Emblem Icon */}
          <div className="flex sm:hidden items-center">
            <NexsLogo height={36} variant="icon-only" />
          </div>

          {/* Desktop: Full Logo with Typography */}
          <div className="hidden sm:flex items-center">
            <NexsLogo height={36} variant="dark-text" />
          </div>
        </div>

        {/* Right Actions: Role Badge (Admin / Pengajar), Avatar & Logout */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {isAdmin ? (
            /* Admin Role Badge (Static) */
            <div className="flex items-center gap-1.5 bg-amber-50/90 px-2.5 py-1 rounded-xl border border-amber-200/90 shadow-xs">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-xs font-bold text-amber-950 truncate max-w-[130px] sm:max-w-[200px]">
                👑 {currentUser?.name || 'Administrator'}
              </span>
              <span className="hidden sm:inline-block text-[10px] font-bold text-amber-800 bg-amber-100/90 px-1.5 py-0.5 rounded-md border border-amber-200">
                Admin
              </span>
            </div>
          ) : (
            /* Pengajar Role Badge (Static) */
            <div className="flex items-center gap-1.5 bg-indigo-50/80 px-2.5 py-1 rounded-xl border border-indigo-200 shadow-xs">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-xs font-bold text-indigo-950 truncate max-w-[130px] sm:max-w-[200px]">
                👨‍🏫 {currentUser?.name}
              </span>
              <span className="hidden sm:inline-block text-[10px] font-bold text-indigo-700 bg-indigo-100/80 px-1.5 py-0.5 rounded-md border border-indigo-200">
                Pengajar
              </span>
            </div>
          )}

          {/* User Initials Avatar */}
          <div className="flex items-center gap-2 pl-0.5">
            <div className="flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-xl bg-orange-600 font-bold text-xs text-white shadow-xs">
              {currentUser?.name?.slice(0, 2).toUpperCase() || 'AD'}
            </div>
          </div>

          {/* Logout Button */}
          <button
            onClick={() => setIsLogoutConfirmOpen(true)}
            title="Keluar dari Akun"
            className="flex items-center justify-center p-1.5 sm:px-2.5 sm:py-1 text-xs font-semibold text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 rounded-lg transition-colors border border-rose-200"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden md:inline ml-1">Keluar</span>
          </button>
        </div>
      </header>

      {/* Modern In-App Confirm Dialog for Logout */}
      <ConfirmDialog
        isOpen={isLogoutConfirmOpen}
        onClose={() => setIsLogoutConfirmOpen(false)}
        onConfirm={handleConfirmLogout}
        title="Keluar dari Akun?"
        message="Sesi login Anda saat ini akan diakhiri. Anda perlu memasukkan email dan kata sandi kembali untuk masuk."
        confirmLabel="Ya, Keluar"
        isDestructive
      />
    </>
  );
}
