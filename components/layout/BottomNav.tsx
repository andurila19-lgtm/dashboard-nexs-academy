'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Calendar,
  CheckCircle2,
  BookOpen,
  Menu,
  X,
  Users,
  GraduationCap,
  UserCheck,
  DoorOpen,
  BarChart3,
  ChevronRight,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useNEXSStore } from '@/lib/store';

export function BottomNav() {
  const pathname = usePathname();
  const { currentUser } = useNEXSStore();
  const isAdmin = currentUser?.role === 'ADMIN';
  const [isMoreMenuOpen, setIsMoreMenuOpen] = useState(false);

  const mainTabs = [
    { href: '/', label: 'Home', icon: LayoutDashboard },
    { href: '/jadwal', label: 'Jadwal', icon: Calendar },
    { href: '/absensi', label: 'Absensi', icon: CheckCircle2 },
    { href: '/jurnal', label: 'Jurnal', icon: BookOpen },
  ];

  const moreMenuItems = [
    { href: '/master/pengajar', label: 'Master Pengajar', icon: Users },
    { href: '/master/kelas', label: 'Master Kelas', icon: GraduationCap },
    { href: '/master/siswa', label: 'Master Siswa', icon: UserCheck },
    { href: '/master/ruangan', label: 'Master Ruangan', icon: DoorOpen },
    { href: '/laporan/rekap', label: 'Rekap & Laporan', icon: BarChart3 },
  ];

  const isMoreActive = moreMenuItems.some((item) => pathname.startsWith(item.href));

  return (
    <>
      {/* Slide-up "Menu Lainnya" drawer on mobile for master data & reports */}
      {isMoreMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs animate-in fade-in"
            onClick={() => setIsMoreMenuOpen(false)}
          />
          <div className="fixed bottom-0 left-0 right-0 bg-white rounded-t-3xl border-t border-slate-200 p-6 space-y-4 shadow-2xl z-50 max-h-[80vh] overflow-y-auto animate-in slide-in-from-bottom duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-base font-bold text-slate-900">Menu Lainnya</h3>
                <p className="text-xs text-slate-500">Master Data & Laporan NEXS</p>
              </div>
              <button
                onClick={() => setIsMoreMenuOpen(false)}
                className="p-2 text-slate-400 hover:text-slate-600 bg-slate-100 rounded-full"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-1.5 pt-1">
              {isAdmin && (
                <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-2 pt-2">
                  Master Data & Laporan
                </div>
              )}
              {moreMenuItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setIsMoreMenuOpen(false)}
                    className={cn(
                      'flex items-center justify-between p-3 rounded-2xl text-sm font-semibold transition-all',
                      isActive
                        ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                        : 'text-slate-700 bg-slate-50 hover:bg-slate-100'
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={cn(
                          'p-2 rounded-xl',
                          isActive ? 'bg-white/20 text-white' : 'bg-white text-slate-600 shadow-xs'
                        )}
                      >
                        <Icon className="w-4.5 h-4.5" />
                      </div>
                      <span>{item.label}</span>
                    </div>
                    <ChevronRight className={cn('w-4 h-4', isActive ? 'text-white' : 'text-slate-400')} />
                  </Link>
                );
              })}

              {/* Logout button in mobile drawer */}
              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => {
                    if (confirm('Keluar dari akun?')) {
                      useNEXSStore.getState().logout();
                      window.location.href = '/login';
                    }
                  }}
                  className="w-full flex items-center justify-between p-3 rounded-2xl text-sm font-bold text-rose-600 bg-rose-50 hover:bg-rose-100 transition-all border border-rose-200"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-white text-rose-600 shadow-xs">
                      <X className="w-4.5 h-4.5" />
                    </div>
                    <span>Keluar Akun (Logout)</span>
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modern Bottom Navigation Bar */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200/90 py-1.5 px-2 lg:hidden shadow-lg shadow-slate-900/10">
        <div className="grid grid-cols-5 items-center justify-around max-w-md mx-auto">
          {mainTabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = pathname === tab.href;

            return (
              <Link
                key={tab.href}
                href={tab.href}
                className={cn(
                  'flex flex-col items-center justify-center py-1.5 px-1 rounded-xl transition-all',
                  isActive ? 'text-indigo-600 font-bold' : 'text-slate-400 hover:text-slate-600 font-medium'
                )}
              >
                <div
                  className={cn(
                    'flex items-center justify-center w-10 h-7 rounded-xl transition-all',
                    isActive ? 'bg-indigo-50 text-indigo-600 shadow-xs' : 'text-slate-400'
                  )}
                >
                  <Icon className="w-5 h-5" />
                </div>
                <span className="text-[10px] tracking-tight mt-0.5">{tab.label}</span>
              </Link>
            );
          })}

          {/* More menu button (Admin / Extra) */}
          <button
            type="button"
            onClick={() => setIsMoreMenuOpen(true)}
            className={cn(
              'flex flex-col items-center justify-center py-1.5 px-1 rounded-xl transition-all',
              isMoreActive ? 'text-indigo-600 font-bold' : 'text-slate-400 hover:text-slate-600 font-medium'
            )}
          >
            <div
              className={cn(
                'flex items-center justify-center w-10 h-7 rounded-xl transition-all',
                isMoreActive ? 'bg-indigo-50 text-indigo-600 shadow-xs' : 'text-slate-400'
              )}
            >
              <Menu className="w-5 h-5" />
            </div>
            <span className="text-[10px] tracking-tight mt-0.5">Lainnya</span>
          </button>
        </div>
      </nav>
    </>
  );
}
