'use client';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowRightLeft, RotateCcw, LogOut } from 'lucide-react';
import { useNEXSStore } from '@/lib/store';
import { NexsLogo } from '@/components/ui/NexsLogo';
import { ConfirmDialog } from '@/components/ui/Modal';
import { useToast } from '@/components/ui/Toast';

export function NavbarTop() {
  const router = useRouter();
  const { currentUser, pengajar, switchUser, resetAllData, logout } = useNEXSStore();
  const toast = useToast();
  const isAdmin = currentUser?.role === 'ADMIN';

  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false);
  const [isLogoutConfirmOpen, setIsLogoutConfirmOpen] = useState(false);

  const handleConfirmReset = () => {
    resetAllData();
    setIsResetConfirmOpen(false);
    toast.success('Data Berhasil Direset', 'Semua data operasional dan absensi telah dikembalikan ke kondisi awal.');
    setTimeout(() => {
      window.location.reload();
    }, 800);
  };

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

        {/* Right Actions: Role Switcher, Reset, Avatar & Logout */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Quick Role Switcher */}
          <div className="flex items-center gap-1 bg-slate-100 p-0.5 sm:p-1 rounded-xl border border-slate-200">
            <div className="flex items-center gap-1 px-1 text-xs font-semibold text-slate-600">
              <ArrowRightLeft className="w-3.5 h-3.5 text-orange-600 shrink-0" />
              <span className="hidden md:inline">Role:</span>
            </div>
            <select
              value={isAdmin ? 'user-admin' : currentUser?.id || 'p-1'}
              onChange={(e) => {
                const targetVal = e.target.value;
                switchUser(targetVal);
                const targetName =
                  targetVal === 'user-admin'
                    ? 'Admin NEXS'
                    : pengajar.find((p) => p.id === targetVal)?.name || 'Pengajar';
                toast.info('Role Dialihkan', `Sekarang melihat dashboard sebagai: ${targetName}`);
              }}
              className="rounded-lg border-0 bg-white px-2 py-1 text-xs font-bold text-slate-800 shadow-xs ring-1 ring-slate-200 focus:outline-hidden focus:ring-2 focus:ring-orange-500 max-w-[125px] sm:max-w-[180px] truncate cursor-pointer"
            >
              <option value="user-admin">Admin</option>
              <optgroup label="Akun Pengajar">
                {pengajar.map((p) => (
                  <option key={p.id} value={p.id}>
                    👨‍🏫 {p.name.replace(' Sensei', '')}
                  </option>
                ))}
              </optgroup>
            </select>
          </div>

          {/* Reset Demo Button */}
          <button
            onClick={() => setIsResetConfirmOpen(true)}
            title="Reset Data Demo"
            className="flex items-center justify-center p-1.5 sm:px-2.5 sm:py-1 text-xs font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors border border-slate-200"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden md:inline ml-1">Reset</span>
          </button>

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

      {/* Modern In-App Confirm Dialog for Reset */}
      <ConfirmDialog
        isOpen={isResetConfirmOpen}
        onClose={() => setIsResetConfirmOpen(false)}
        onConfirm={handleConfirmReset}
        title="Reset Ulang Data Demo?"
        message="Tindakan ini akan mengembalikan semua jadwal, data absensi, dan jurnal ke status awal bawaan sistem."
        confirmLabel="Ya, Reset Data"
        isDestructive
      />

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
