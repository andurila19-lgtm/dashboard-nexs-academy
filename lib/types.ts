export type Role = 'ADMIN' | 'PENGAJAR';
export type StatusAktif = 'AKTIF' | 'NONAKTIF';
export type TipeJadwal = 'BERULANG' | 'SEKALI';
export type StatusJadwal = 'AKTIF' | 'MENGAJAR' | 'SELESAI' | 'DIBATALKAN';
export type StatusAbsensi = 'BELUM_MULAI' | 'MENGAJAR' | 'SELESAI' | 'TERLAMBAT' | 'TIDAK_HADIR' | 'DIBATALKAN';
export type StatusJurnal = 'BELUM_DIISI' | 'DRAFT' | 'DIISI' | 'DIREVIEW';

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  phone?: string | null;
  status: StatusAktif;
  pengajarId?: string | null;
}

export interface Pengajar {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  status: StatusAktif;
}

export interface Kelas {
  id: string;
  nama: string;
  program: string;
  level: string;
  kapasitas: number;
  status: StatusAktif;
}

export interface Siswa {
  id: string;
  nama: string;
  email?: string | null;
  phone?: string | null;
  status: StatusAktif;
  kelasId?: string | null;
}

export interface Ruangan {
  id: string;
  nama: string;
  kapasitas: number;
  status: StatusAktif;
}

export interface JadwalPattern {
  id: string;
  pengajarId: string;
  kelasId: string;
  ruanganId: string;
  hari: string[]; // ['Senin', 'Rabu']
  jamMulai: string; // '08:00'
  jamSelesai: string; // '10:00'
  tanggalMulai: string; // '2026-09-01'
  tanggalSelesai: string; // '2026-11-30'
  tipe: TipeJadwal;
  status: StatusAktif;
}

export interface JadwalInstance {
  id: string;
  patternId?: string | null;
  pengajarId: string;
  kelasId: string;
  ruanganId: string;
  tanggal: string; // '2026-09-01'
  hari: string; // 'Senin'
  jamMulai: string; // '08:00'
  jamSelesai: string; // '10:00'
  status: StatusJadwal;
}

export interface Absensi {
  id: string;
  jadwalInstanceId: string;
  pengajarId: string;
  kelasId: string;
  tanggal: string;
  jamJadwalMulai: string;
  jamJadwalSelesai: string;
  jamMulaiAktual?: string | null;
  jamSelesaiAktual?: string | null;
  durasi?: number | null; // in minutes
  status: StatusAbsensi;
}

export interface Jurnal {
  id: string;
  jadwalInstanceId: string;
  pengajarId: string;
  kelasId: string;
  tanggal: string;
  materi: string;
  aktivitas: string;
  jumlahSiswaHadir: number;
  tugas?: string | null;
  catatan?: string | null;
  status: StatusJurnal;
  createdAt: string;
  updatedAt?: string | null;
}

export interface JadwalConflict {
  type: 'pengajar' | 'ruangan';
  targetName: string;
  tanggal: string;
  jamBaru: string;
  jamEksisting: string;
  kelasEksisting?: string;
}

export interface RekapPengajarRow {
  pengajarId: string;
  pengajarNama: string;
  pengajarEmail: string;
  totalSesi: number;
  totalKehadiran: number;
  totalJamMengajar: number; // in hours (e.g. 24.5)
  totalJurnalDiisi: number;
  totalJurnalPending: number;
}
