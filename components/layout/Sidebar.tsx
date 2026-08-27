'use client';
import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Calendar,
  CheckCircle2,
  BookOpen,
  Users,
  GraduationCap,
  UserCheck,
  DoorOpen,
  BarChart3,
  ChevronRight,
  LogOut,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useNEXSStore } from '@/lib/store';
import { NexsLogo } from '@/components/ui/NexsLogo';

interface SidebarProps {
  isOpen: boolean;
  onClose?: () => void;
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();
  const { currentUser, logout } = useNEXSStore();
  const isAdmin = currentUser?.role === 'ADMIN';

  const adminMenu = [
    {
      title: 'DASHBOARD',
      items: [{ href: '/', label: 'Dashboard', icon: LayoutDashboard }],
    },
    {
      title: 'OPERASIONAL',
      items: [
        { href: '/jadwal', label: 'Jadwal Mengajar', icon: Calendar },
        { href: '/absensi', label: 'Absensi', icon: CheckCircle2 },
        { href: '/jurnal', label: 'Jurnal Mengajar', icon: BookOpen },
      ],
    },
    {
      title: 'MASTER DATA',
      items: [
        { href: '/master/pengajar', label: 'Pengajar', icon: Users },
        { href: '/master/kelas', label: 'Kelas', icon: GraduationCap },
        { href: '/master/siswa', label: 'Siswa', icon: UserCheck },
        { href: '/master/ruangan', label: 'Ruangan', icon: DoorOpen },
      ],
    },
    {
      title: 'LAPORAN',
      items: [{ href: '/laporan/rekap', label: 'Rekap Pengajar', icon: BarChart3 }],
    },
  ];

  const pengajarMenu = [
    {
      title: 'DASHBOARD',
      items: [{ href: '/', label: 'Dashboard', icon: LayoutDashboard }],
    },
    {
      title: 'MENGAJAR',
      items: [
        { href: '/jadwal', label: 'Jadwal Saya', icon: Calendar },
        { href: '/absensi', label: 'Riwayat Absensi', icon: CheckCircle2 },
        { href: '/jurnal', label: 'Jurnal Saya', icon: BookOpen },
      ],
    },
    {
      title: 'LAPORAN & HONOR',
      items: [
        { href: '/laporan/rekap', label: 'Rekap & Slip Honor Saya', icon: BarChart3 },
      ],
    },
  ];

  const menuSections = isAdmin ? adminMenu : pengajarMenu;

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-xs lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={cn(
          'fixed top-0 left-0 z-40 h-screen w-64 flex flex-col bg-[#0f172a] text-slate-300 transition-transform duration-300 ease-in-out border-r border-slate-800',
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        )}
      >
        {/* Brand header with Official Logo */}
        <div className="flex h-20 items-center px-6 border-b border-slate-800/80 bg-[#0f172a]">
          <NexsLogo height={34} variant="light-text" />
        </div>

        {/* Navigation list */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
          {menuSections.map((section, idx) => (
            <div key={idx} className="space-y-1">
              <div className="px-3 text-[11px] font-bold tracking-wider text-slate-400 uppercase">
                {section.title}
              </div>
              {section.items.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={onClose}
                    className={cn(
                      'group flex items-center justify-between rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-150',
                      isActive
                        ? 'bg-indigo-600 text-white font-semibold shadow-xs shadow-indigo-600/50'
                        : 'text-slate-400 hover:bg-slate-800/70 hover:text-slate-100'
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <Icon
                        className={cn(
                          'h-4.5 w-4.5 transition-colors',
                          isActive ? 'text-white' : 'text-slate-400 group-hover:text-slate-200'
                        )}
                      />
                      <span>{item.label}</span>
                    </div>
                    {isActive && <ChevronRight className="h-4 w-4 opacity-75" />}
                  </Link>
                );
              })}
            </div>
          ))}
        </div>

        {/* Footer info & Logout */}
        <div className="p-4 border-t border-slate-800/80 bg-slate-950/40 space-y-3">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-800 text-slate-200 font-bold text-xs border border-slate-700">
              {currentUser?.name?.slice(0, 2).toUpperCase() || 'US'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="truncate text-xs font-semibold text-white">{currentUser?.name}</p>
              <p className="truncate text-[11px] text-slate-400">
                {isAdmin ? 'Administrator' : 'Pengajar'}
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              if (confirm('Keluar dari akun?')) {
                logout();
                window.location.href = '/login';
              }
            }}
            className="w-full flex items-center justify-center gap-2 py-2 px-3 text-xs font-semibold text-rose-400 hover:text-rose-300 bg-rose-500/10 hover:bg-rose-500/20 rounded-lg transition-colors border border-rose-500/20"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Keluar Akun (Logout)</span>
          </button>
        </div>
      </aside>
    </>
  );
}
