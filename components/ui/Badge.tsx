import React from 'react';
import { cn } from '@/lib/utils';
import { StatusJadwal, StatusAbsensi, StatusJurnal, StatusAktif } from '@/lib/types';

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info' | 'secondary' | 'outline';
}

export function Badge({ className, variant = 'default', children, ...props }: BadgeProps) {
  const variantStyles = {
    default: 'bg-indigo-50 text-indigo-700 border border-indigo-200/60',
    success: 'bg-emerald-50 text-emerald-700 border border-emerald-200/60',
    warning: 'bg-amber-50 text-amber-700 border border-amber-200/60',
    danger: 'bg-rose-50 text-rose-700 border border-rose-200/60',
    info: 'bg-sky-50 text-sky-700 border border-sky-200/60',
    secondary: 'bg-slate-100 text-slate-700 border border-slate-200/80',
    outline: 'bg-transparent text-slate-700 border border-slate-300',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold tracking-wide transition-colors',
        variantStyles[variant],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}

export function JadwalStatusBadge({ status }: { status: StatusJadwal }) {
  switch (status) {
    case 'AKTIF':
      return <Badge variant="secondary">Belum Mulai</Badge>;
    case 'MENGAJAR':
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-600 text-white animate-pulse">
          <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
          Sedang Mengajar
        </span>
      );
    case 'SELESAI':
      return <Badge variant="success">Selesai</Badge>;
    case 'DIBATALKAN':
      return <Badge variant="danger">Dibatalkan</Badge>;
    default:
      return <Badge>{status}</Badge>;
  }
}

export function AbsensiStatusBadge({ status }: { status: StatusAbsensi | null | undefined }) {
  if (!status) return <Badge variant="secondary">—</Badge>;
  switch (status) {
    case 'BELUM_MULAI':
      return <Badge variant="secondary">Belum Mulai</Badge>;
    case 'MENGAJAR':
      return <Badge variant="info">Mengajar</Badge>;
    case 'SELESAI':
      return <Badge variant="success">Hadir (Tepat Waktu)</Badge>;
    case 'TERLAMBAT':
      return <Badge variant="warning">Terlambat</Badge>;
    case 'TIDAK_HADIR':
      return <Badge variant="danger">Tidak Hadir</Badge>;
    case 'DIBATALKAN':
      return <Badge variant="secondary">Dibatalkan</Badge>;
    default:
      return <Badge>{status}</Badge>;
  }
}

export function JurnalStatusBadge({ status }: { status: StatusJurnal | null | undefined }) {
  if (!status || status === 'BELUM_DIISI') {
    return <Badge variant="danger">Belum Diisi</Badge>;
  }
  switch (status) {
    case 'DRAFT':
      return <Badge variant="warning">Draft</Badge>;
    case 'DIISI':
      return <Badge variant="success">Sudah Diisi</Badge>;
    case 'DIREVIEW':
      return <Badge variant="info">Sudah Direview</Badge>;
    default:
      return <Badge>{status}</Badge>;
  }
}

export function StatusAktifBadge({ status }: { status: StatusAktif }) {
  return status === 'AKTIF' ? (
    <Badge variant="success">Aktif</Badge>
  ) : (
    <Badge variant="secondary">Nonaktif</Badge>
  );
}
