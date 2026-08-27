import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { v4 as uuid } from 'uuid';
import {
  User,
  Pengajar,
  Kelas,
  Siswa,
  Ruangan,
  JadwalPattern,
  JadwalInstance,
  Absensi,
  Jurnal,
  JadwalConflict,
  RekapPengajarRow,
  StatusJadwal,
  StatusAbsensi,
  StatusJurnal,
} from './types';

const HARI_NAMES = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];

export function getDayName(dateStr: string): string {
  const d = new Date(dateStr);
  return HARI_NAMES[d.getDay()];
}

export function generateInstancesFromPattern(pattern: JadwalPattern): JadwalInstance[] {
  const instances: JadwalInstance[] = [];
  const startDate = new Date(pattern.tanggalMulai);
  const endDate = new Date(pattern.tanggalSelesai);

  if (pattern.tipe === 'SEKALI') {
    instances.push({
      id: uuid(),
      patternId: pattern.id,
      pengajarId: pattern.pengajarId,
      kelasId: pattern.kelasId,
      ruanganId: pattern.ruanganId,
      tanggal: pattern.tanggalMulai,
      hari: getDayName(pattern.tanggalMulai),
      jamMulai: pattern.jamMulai,
      jamSelesai: pattern.jamSelesai,
      status: 'AKTIF',
    });
    return instances;
  }

  const current = new Date(startDate);
  while (current <= endDate) {
    const dayName = HARI_NAMES[current.getDay()];
    if (pattern.hari.includes(dayName)) {
      const dateStr = current.toISOString().split('T')[0];
      instances.push({
        id: uuid(),
        patternId: pattern.id,
        pengajarId: pattern.pengajarId,
        kelasId: pattern.kelasId,
        ruanganId: pattern.ruanganId,
        tanggal: dateStr,
        hari: dayName,
        jamMulai: pattern.jamMulai,
        jamSelesai: pattern.jamSelesai,
        status: 'AKTIF',
      });
    }
    current.setDate(current.getDate() + 1);
  }
  return instances;
}

// Initial Seed Data
function getInitialData() {
  const adminUser: User = {
    id: 'user-admin',
    name: 'Admin NEXS',
    email: 'admin@nexs.com',
    role: 'ADMIN',
    phone: '081234567890',
    status: 'AKTIF',
  };

  const pengajarList: Pengajar[] = [
    { id: 'p-1', name: 'Tanaka Sensei', email: 'tanaka@nexs.com', phone: '081234567891', status: 'AKTIF' },
    { id: 'p-2', name: 'Yamamoto Sensei', email: 'yamamoto@nexs.com', phone: '081234567892', status: 'AKTIF' },
    { id: 'p-3', name: 'Suzuki Sensei', email: 'suzuki@nexs.com', phone: '081234567893', status: 'AKTIF' },
    { id: 'p-4', name: 'Nakamura Sensei', email: 'nakamura@nexs.com', phone: '081234567894', status: 'AKTIF' },
    { id: 'p-5', name: 'Watanabe Sensei', email: 'watanabe@nexs.com', phone: '081234567895', status: 'NONAKTIF' },
  ];

  const kelasList: Kelas[] = [
    { id: 'k-1', nama: 'JLPT N5 A (Reguler)', program: 'JLPT Preparation', level: 'N5', kapasitas: 15, status: 'AKTIF' },
    { id: 'k-2', nama: 'JLPT N5 B (Intensif)', program: 'JLPT Preparation', level: 'N5', kapasitas: 15, status: 'AKTIF' },
    { id: 'k-3', nama: 'JLPT N4 A (Reguler)', program: 'JLPT Preparation', level: 'N4', kapasitas: 12, status: 'AKTIF' },
    { id: 'k-4', nama: 'JLPT N4 B (Weekend)', program: 'JLPT Preparation', level: 'N4', kapasitas: 12, status: 'AKTIF' },
    { id: 'k-5', nama: 'JLPT N3 A (Intermediate)', program: 'JLPT Preparation', level: 'N3', kapasitas: 10, status: 'AKTIF' },
    { id: 'k-6', nama: 'JLPT N2 A (Advanced)', program: 'JLPT Preparation', level: 'N2', kapasitas: 8, status: 'AKTIF' },
    { id: 'k-7', nama: 'Kaiwa / Percakapan Sehari-hari', program: 'Conversation', level: 'Dasar', kapasitas: 18, status: 'AKTIF' },
    { id: 'k-8', nama: 'Business Japanese (BJT)', program: 'Business Japanese', level: 'Menengah', kapasitas: 10, status: 'NONAKTIF' },
  ];

  const ruanganList: Ruangan[] = [
    { id: 'r-1', nama: 'Room 1 (Tokyo)', kapasitas: 20, status: 'AKTIF' },
    { id: 'r-2', nama: 'Room 2 (Kyoto)', kapasitas: 15, status: 'AKTIF' },
    { id: 'r-3', nama: 'Room 3 (Osaka)', kapasitas: 12, status: 'AKTIF' },
    { id: 'r-4', nama: 'Room 4 (Shibuya)', kapasitas: 10, status: 'AKTIF' },
  ];

  const siswaList: Siswa[] = [
    { id: 's-1', nama: 'Andi Pratama', email: 'andi@email.com', phone: '081299901', kelasId: 'k-1', status: 'AKTIF' },
    { id: 's-2', nama: 'Budi Santoso', email: 'budi@email.com', phone: '081299902', kelasId: 'k-1', status: 'AKTIF' },
    { id: 's-3', nama: 'Citra Dewi', email: 'citra@email.com', phone: '081299903', kelasId: 'k-1', status: 'AKTIF' },
    { id: 's-4', nama: 'Dian Safitri', email: 'dian@email.com', phone: '081299904', kelasId: 'k-2', status: 'AKTIF' },
    { id: 's-5', nama: 'Eko Wijaya', email: 'eko@email.com', phone: '081299905', kelasId: 'k-2', status: 'AKTIF' },
    { id: 's-6', nama: 'Fitri Handayani', email: 'fitri@email.com', phone: '081299906', kelasId: 'k-3', status: 'AKTIF' },
    { id: 's-7', nama: 'Galih Permana', email: 'galih@email.com', phone: '081299907', kelasId: 'k-3', status: 'AKTIF' },
    { id: 's-8', nama: 'Hana Putri', email: 'hana@email.com', phone: '081299908', kelasId: 'k-3', status: 'AKTIF' },
    { id: 's-9', nama: 'Irfan Hakim', email: 'irfan@email.com', phone: '081299909', kelasId: 'k-4', status: 'AKTIF' },
    { id: 's-10', nama: 'Joko Susilo', email: 'joko@email.com', phone: '081299910', kelasId: 'k-4', status: 'AKTIF' },
    { id: 's-11', nama: 'Kartika Sari', email: 'kartika@email.com', phone: '081299911', kelasId: 'k-5', status: 'AKTIF' },
    { id: 's-12', nama: 'Lukman Hakim', email: 'lukman@email.com', phone: '081299912', kelasId: 'k-6', status: 'AKTIF' },
    { id: 's-13', nama: 'Maya Anggraeni', email: 'maya@email.com', phone: '081299913', kelasId: 'k-7', status: 'AKTIF' },
    { id: 's-14', nama: 'Nadia Rahma', email: 'nadia@email.com', phone: '081299914', kelasId: 'k-7', status: 'AKTIF' },
    { id: 's-15', nama: 'Rizki Fajar', email: 'rizki@email.com', phone: '081299915', kelasId: 'k-7', status: 'AKTIF' },
  ];

  // Dates for current demo month
  const todayObj = new Date();
  const todayStr = todayObj.toISOString().split('T')[0];
  const todayDayName = HARI_NAMES[todayObj.getDay()];

  const currentYear = todayObj.getFullYear();
  const currentMonth = todayObj.getMonth();
  const startPeriod = new Date(currentYear, currentMonth, 1).toISOString().split('T')[0];
  const endPeriod = new Date(currentYear, currentMonth + 2, 0).toISOString().split('T')[0];

  const patterns: JadwalPattern[] = [
    {
      id: 'pat-1',
      pengajarId: 'p-1',
      kelasId: 'k-3',
      ruanganId: 'r-1',
      hari: ['Senin', 'Rabu', todayDayName],
      jamMulai: '08:00',
      jamSelesai: '10:00',
      tanggalMulai: startPeriod,
      tanggalSelesai: endPeriod,
      tipe: 'BERULANG',
      status: 'AKTIF',
    },
    {
      id: 'pat-2',
      pengajarId: 'p-2',
      kelasId: 'k-1',
      ruanganId: 'r-2',
      hari: ['Senin', 'Kamis', todayDayName],
      jamMulai: '10:15',
      jamSelesai: '12:15',
      tanggalMulai: startPeriod,
      tanggalSelesai: endPeriod,
      tipe: 'BERULANG',
      status: 'AKTIF',
    },
    {
      id: 'pat-3',
      pengajarId: 'p-3',
      kelasId: 'k-4',
      ruanganId: 'r-3',
      hari: ['Selasa', 'Jumat', todayDayName],
      jamMulai: '13:00',
      jamSelesai: '15:00',
      tanggalMulai: startPeriod,
      tanggalSelesai: endPeriod,
      tipe: 'BERULANG',
      status: 'AKTIF',
    },
    {
      id: 'pat-4',
      pengajarId: 'p-4',
      kelasId: 'k-5',
      ruanganId: 'r-4',
      hari: ['Rabu', 'Sabtu'],
      jamMulai: '15:30',
      jamSelesai: '17:30',
      tanggalMulai: startPeriod,
      tanggalSelesai: endPeriod,
      tipe: 'BERULANG',
      status: 'AKTIF',
    },
    {
      id: 'pat-5',
      pengajarId: 'p-1',
      kelasId: 'k-7',
      ruanganId: 'r-1',
      hari: ['Jumat'],
      jamMulai: '18:30',
      jamSelesai: '20:30',
      tanggalMulai: startPeriod,
      tanggalSelesai: endPeriod,
      tipe: 'BERULANG',
      status: 'AKTIF',
    }
  ];

  let instances: JadwalInstance[] = [];
  patterns.forEach((pat) => {
    instances = [...instances, ...generateInstancesFromPattern(pat)];
  });

  // Past attendance & journals
  const absensiList: Absensi[] = [];
  const jurnalList: Jurnal[] = [];

  instances.forEach((inst, index) => {
    if (inst.tanggal < todayStr) {
      if (index % 5 !== 0) { // 80% attended
        const absId = uuid();
        absensiList.push({
          id: absId,
          jadwalInstanceId: inst.id,
          pengajarId: inst.pengajarId,
          kelasId: inst.kelasId,
          tanggal: inst.tanggal,
          jamJadwalMulai: inst.jamMulai,
          jamJadwalSelesai: inst.jamSelesai,
          jamMulaiAktual: inst.jamMulai,
          jamSelesaiAktual: inst.jamSelesai,
          durasi: 120,
          status: 'SELESAI',
        });
        inst.status = 'SELESAI';

        if (index % 2 === 0) { // 50% have completed journals
          jurnalList.push({
            id: uuid(),
            jadwalInstanceId: inst.id,
            pengajarId: inst.pengajarId,
            kelasId: inst.kelasId,
            tanggal: inst.tanggal,
            materi: `Tata Bahasa & Pola Kalimat Bab ${((index % 6) + 1)}`,
            aktivitas: 'Penjelasan teori materi, drill pelafalan kosakata, latihan menulis kanji, serta tanya jawab interaktif.',
            jumlahSiswaHadir: 10 + (index % 4),
            tugas: 'Kerjakan soal latihan di workbook halaman ' + (20 + (index % 10)),
            catatan: 'Seluruh siswa sangat antusias dan memahami materi dengan baik.',
            status: index % 4 === 0 ? 'DIREVIEW' : 'DIISI',
            createdAt: `${inst.tanggal}T${inst.jamSelesai}:00.000Z`,
          });
        }
      }
    }
  });

  return {
    currentUser: adminUser,
    pengajar: pengajarList,
    kelas: kelasList,
    siswa: siswaList,
    ruangan: ruanganList,
    jadwalPatterns: patterns,
    jadwalInstances: instances,
    absensi: absensiList,
    jurnal: jurnalList,
  };
}

interface NEXSStoreState {
  currentUser: User | null;
  pengajar: Pengajar[];
  kelas: Kelas[];
  siswa: Siswa[];
  ruangan: Ruangan[];
  jadwalPatterns: JadwalPattern[];
  jadwalInstances: JadwalInstance[];
  absensi: Absensi[];
  jurnal: Jurnal[];

  // Auth actions
  loginAs: (role: 'ADMIN' | 'PENGAJAR', pengajarId?: string) => void;
  logout: () => void;
  switchUser: (userId: string) => void;

  // Master Data CRUD
  addPengajar: (data: Omit<Pengajar, 'id'>) => Pengajar;
  updatePengajar: (id: string, data: Partial<Pengajar>) => void;
  deletePengajar: (id: string) => void;

  addKelas: (data: Omit<Kelas, 'id'>) => Kelas;
  updateKelas: (id: string, data: Partial<Kelas>) => void;
  deleteKelas: (id: string) => void;

  addSiswa: (data: Omit<Siswa, 'id'>) => Siswa;
  updateSiswa: (id: string, data: Partial<Siswa>) => void;
  deleteSiswa: (id: string) => void;

  addRuangan: (data: Omit<Ruangan, 'id'>) => Ruangan;
  updateRuangan: (id: string, data: Partial<Ruangan>) => void;
  deleteRuangan: (id: string) => void;

  // Jadwal Actions & Conflict Detection
  checkConflict: (
    newSchedule: {
      pengajarId: string;
      kelasId?: string;
      ruanganId: string;
      hari: string[];
      jamMulai: string;
      jamSelesai: string;
      tanggalMulai: string;
      tanggalSelesai: string;
      tipe: 'BERULANG' | 'SEKALI';
    },
    excludePatternId?: string
  ) => JadwalConflict[];

  addJadwalPattern: (pattern: Omit<JadwalPattern, 'id'>) => JadwalPattern;
  updateJadwalPattern: (id: string, pattern: Partial<JadwalPattern>) => void;
  deleteJadwalPattern: (id: string) => void;
  cancelJadwalInstance: (instanceId: string) => void;
  reassignPengajar: (instanceId: string, newPengajarId: string) => void;

  // Teaching & Attendance Workflow
  startTeaching: (jadwalInstanceId: string) => Absensi;
  finishTeaching: (jadwalInstanceId: string) => void;

  // Journal Workflow
  submitJurnal: (data: {
    jadwalInstanceId: string;
    materi: string;
    aktivitas: string;
    jumlahSiswaHadir: number;
    tugas?: string;
    catatan?: string;
    isDraft?: boolean;
  }) => Jurnal;
  reviewJurnal: (jurnalId: string) => void;

  // Getters & Aggregations
  getTodaySchedule: (pengajarId?: string) => JadwalInstance[];
  getStats: () => {
    totalPengajar: number;
    totalKelasAktif: number;
    jadwalHariIni: number;
    pengajarSedangMengajar: number;
    jurnalBelumDiisi: number;
  };
  getRekapPengajar: (filters?: {
    startDate?: string;
    endDate?: string;
    pengajarId?: string;
    kelasId?: string;
  }) => RekapPengajarRow[];

  resetAllData: () => void;
}

export const useNEXSStore = create<NEXSStoreState>()(
  persist(
    (set, get) => ({
      ...getInitialData(),

      loginAs: (role, pengajarId) => {
        if (role === 'ADMIN') {
          set({
            currentUser: {
              id: 'user-admin',
              name: 'Admin NEXS',
              email: 'admin@nexs.com',
              role: 'ADMIN',
              phone: '081234567890',
              status: 'AKTIF',
            },
          });
        } else {
          const p = get().pengajar.find((item) => item.id === (pengajarId || 'p-1')) || get().pengajar[0];
          set({
            currentUser: {
              id: p.id,
              name: p.name,
              email: p.email,
              role: 'PENGAJAR',
              phone: p.phone,
              status: p.status,
              pengajarId: p.id,
            },
          });
        }
      },

      logout: () => {
        set({ currentUser: null });
      },

      switchUser: (userId) => {
        if (userId === 'user-admin') {
          get().loginAs('ADMIN');
        } else {
          get().loginAs('PENGAJAR', userId);
        }
      },

      // Master Data CRUD
      addPengajar: (data) => {
        const item: Pengajar = { ...data, id: uuid() };
        set((state) => ({ pengajar: [...state.pengajar, item] }));
        return item;
      },
      updatePengajar: (id, data) => {
        set((state) => ({
          pengajar: state.pengajar.map((p) => (p.id === id ? { ...p, ...data } : p)),
        }));
      },
      deletePengajar: (id) => {
        set((state) => ({
          pengajar: state.pengajar.filter((p) => p.id !== id),
        }));
      },

      addKelas: (data) => {
        const item: Kelas = { ...data, id: uuid() };
        set((state) => ({ kelas: [...state.kelas, item] }));
        return item;
      },
      updateKelas: (id, data) => {
        set((state) => ({
          kelas: state.kelas.map((k) => (k.id === id ? { ...k, ...data } : k)),
        }));
      },
      deleteKelas: (id) => {
        set((state) => ({
          kelas: state.kelas.filter((k) => k.id !== id),
        }));
      },

      addSiswa: (data) => {
        const item: Siswa = { ...data, id: uuid() };
        set((state) => ({ siswa: [...state.siswa, item] }));
        return item;
      },
      updateSiswa: (id, data) => {
        set((state) => ({
          siswa: state.siswa.map((s) => (s.id === id ? { ...s, ...data } : s)),
        }));
      },
      deleteSiswa: (id) => {
        set((state) => ({
          siswa: state.siswa.filter((s) => s.id !== id),
        }));
      },

      addRuangan: (data) => {
        const item: Ruangan = { ...data, id: uuid() };
        set((state) => ({ ruangan: [...state.ruangan, item] }));
        return item;
      },
      updateRuangan: (id, data) => {
        set((state) => ({
          ruangan: state.ruangan.map((r) => (r.id === id ? { ...r, ...data } : r)),
        }));
      },
      deleteRuangan: (id) => {
        set((state) => ({
          ruangan: state.ruangan.filter((r) => r.id !== id),
        }));
      },

      // Conflict detection
      checkConflict: (newSchedule, excludePatternId) => {
        const conflicts: JadwalConflict[] = [];
        const state = get();
        const testPattern: JadwalPattern = {
          id: 'test',
          kelasId: newSchedule.kelasId || 'k-1',
          ...newSchedule,
          status: 'AKTIF',
        };
        const simulatedInstances = generateInstancesFromPattern(testPattern);

        const pengajarTarget = state.pengajar.find((p) => p.id === newSchedule.pengajarId);
        const ruanganTarget = state.ruangan.find((r) => r.id === newSchedule.ruanganId);

        for (const sim of simulatedInstances) {
          for (const existing of state.jadwalInstances) {
            if (excludePatternId && existing.patternId === excludePatternId) continue;
            if (existing.status === 'DIBATALKAN') continue;

            if (existing.tanggal === sim.tanggal) {
              const isTimeOverlap = sim.jamMulai < existing.jamSelesai && sim.jamSelesai > existing.jamMulai;

              if (isTimeOverlap) {
                const existingKelas = state.kelas.find((k) => k.id === existing.kelasId);

                // Pengajar conflict
                if (existing.pengajarId === sim.pengajarId) {
                  conflicts.push({
                    type: 'pengajar',
                    targetName: pengajarTarget?.name || 'Pengajar',
                    tanggal: sim.tanggal,
                    jamBaru: `${sim.jamMulai}–${sim.jamSelesai}`,
                    jamEksisting: `${existing.jamMulai}–${existing.jamSelesai}`,
                    kelasEksisting: existingKelas?.nama,
                  });
                }

                // Ruangan conflict
                if (existing.ruanganId === sim.ruanganId) {
                  conflicts.push({
                    type: 'ruangan',
                    targetName: ruanganTarget?.nama || 'Ruangan',
                    tanggal: sim.tanggal,
                    jamBaru: `${sim.jamMulai}–${sim.jamSelesai}`,
                    jamEksisting: `${existing.jamMulai}–${existing.jamSelesai}`,
                    kelasEksisting: existingKelas?.nama,
                  });
                }
              }
            }
          }
        }

        return conflicts;
      },

      addJadwalPattern: (patternData) => {
        const pattern: JadwalPattern = { ...patternData, id: uuid() };
        const newInstances = generateInstancesFromPattern(pattern);
        set((state) => ({
          jadwalPatterns: [...state.jadwalPatterns, pattern],
          jadwalInstances: [...state.jadwalInstances, ...newInstances],
        }));
        return pattern;
      },

      updateJadwalPattern: (id, patternData) => {
        const state = get();
        const existing = state.jadwalPatterns.find((p) => p.id === id);
        if (!existing) return;

        const updatedPattern: JadwalPattern = { ...existing, ...patternData };
        const todayStr = new Date().toISOString().split('T')[0];

        // Keep historical instances, regenerate future ones
        const pastInstances = state.jadwalInstances.filter(
          (i) => i.patternId === id && i.tanggal < todayStr
        );
        const otherInstances = state.jadwalInstances.filter((i) => i.patternId !== id);
        const futureGenerated = generateInstancesFromPattern(updatedPattern).filter(
          (i) => i.tanggal >= todayStr
        );

        set({
          jadwalPatterns: state.jadwalPatterns.map((p) => (p.id === id ? updatedPattern : p)),
          jadwalInstances: [...otherInstances, ...pastInstances, ...futureGenerated],
        });
      },

      deleteJadwalPattern: (id) => {
        set((state) => ({
          jadwalPatterns: state.jadwalPatterns.filter((p) => p.id !== id),
          jadwalInstances: state.jadwalInstances.filter((i) => i.patternId !== id),
        }));
      },

      cancelJadwalInstance: (instanceId) => {
        set((state) => ({
          jadwalInstances: state.jadwalInstances.map((i) =>
            i.id === instanceId ? { ...i, status: 'DIBATALKAN' } : i
          ),
          absensi: state.absensi.map((a) =>
            a.jadwalInstanceId === instanceId ? { ...a, status: 'DIBATALKAN' } : a
          ),
        }));
      },

      reassignPengajar: (instanceId, newPengajarId) => {
        set((state) => ({
          jadwalInstances: state.jadwalInstances.map((i) =>
            i.id === instanceId ? { ...i, pengajarId: newPengajarId } : i
          ),
          absensi: state.absensi.map((a) =>
            a.jadwalInstanceId === instanceId ? { ...a, pengajarId: newPengajarId } : a
          ),
        }));
      },

      // Attendance
      startTeaching: (jadwalInstanceId) => {
        const state = get();
        const instance = state.jadwalInstances.find((i) => i.id === jadwalInstanceId);
        if (!instance) throw new Error('Jadwal tidak ditemukan');

        const now = new Date();
        const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

        // Check if late (e.g. >15 mins from scheduled start)
        const [schH, schM] = instance.jamMulai.split(':').map(Number);
        const [curH, curM] = currentTime.split(':').map(Number);
        const diffMinutes = curH * 60 + curM - (schH * 60 + schM);
        const statusAbsen: StatusAbsensi = diffMinutes > 15 ? 'TERLAMBAT' : 'MENGAJAR';

        const existingAbsensi = state.absensi.find((a) => a.jadwalInstanceId === jadwalInstanceId);
        let absRecord: Absensi;

        if (existingAbsensi) {
          absRecord = {
            ...existingAbsensi,
            jamMulaiAktual: currentTime,
            status: statusAbsen,
          };
          set({
            absensi: state.absensi.map((a) => (a.id === existingAbsensi.id ? absRecord : a)),
            jadwalInstances: state.jadwalInstances.map((i) =>
              i.id === jadwalInstanceId ? { ...i, status: 'MENGAJAR' } : i
            ),
          });
        } else {
          absRecord = {
            id: uuid(),
            jadwalInstanceId,
            pengajarId: instance.pengajarId,
            kelasId: instance.kelasId,
            tanggal: instance.tanggal,
            jamJadwalMulai: instance.jamMulai,
            jamJadwalSelesai: instance.jamSelesai,
            jamMulaiAktual: currentTime,
            jamSelesaiAktual: null,
            durasi: null,
            status: statusAbsen,
          };
          set({
            absensi: [...state.absensi, absRecord],
            jadwalInstances: state.jadwalInstances.map((i) =>
              i.id === jadwalInstanceId ? { ...i, status: 'MENGAJAR' } : i
            ),
          });
        }

        return absRecord;
      },

      finishTeaching: (jadwalInstanceId) => {
        const state = get();
        const abs = state.absensi.find((a) => a.jadwalInstanceId === jadwalInstanceId);
        const now = new Date();
        const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

        let durasi = 120;
        if (abs?.jamMulaiAktual) {
          const [sH, sM] = abs.jamMulaiAktual.split(':').map(Number);
          const [eH, eM] = currentTime.split(':').map(Number);
          durasi = Math.max(0, eH * 60 + eM - (sH * 60 + sM));
        }

        set({
          absensi: state.absensi.map((a) =>
            a.jadwalInstanceId === jadwalInstanceId
              ? { ...a, jamSelesaiAktual: currentTime, durasi, status: 'SELESAI' }
              : a
          ),
          jadwalInstances: state.jadwalInstances.map((i) =>
            i.id === jadwalInstanceId ? { ...i, status: 'SELESAI' } : i
          ),
        });
      },

      // Journal
      submitJurnal: (data) => {
        const state = get();
        const instance = state.jadwalInstances.find((i) => i.id === data.jadwalInstanceId);
        if (!instance) throw new Error('Jadwal tidak ditemukan');

        const existing = state.jurnal.find((j) => j.jadwalInstanceId === data.jadwalInstanceId);
        const status: StatusJurnal = data.isDraft ? 'DRAFT' : 'DIISI';

        if (existing) {
          const updated: Jurnal = {
            ...existing,
            materi: data.materi,
            aktivitas: data.aktivitas,
            jumlahSiswaHadir: data.jumlahSiswaHadir,
            tugas: data.tugas || null,
            catatan: data.catatan || null,
            status,
            updatedAt: new Date().toISOString(),
          };
          set({
            jurnal: state.jurnal.map((j) => (j.id === existing.id ? updated : j)),
          });
          return updated;
        } else {
          const newJurnal: Jurnal = {
            id: uuid(),
            jadwalInstanceId: data.jadwalInstanceId,
            pengajarId: instance.pengajarId,
            kelasId: instance.kelasId,
            tanggal: instance.tanggal,
            materi: data.materi,
            aktivitas: data.aktivitas,
            jumlahSiswaHadir: data.jumlahSiswaHadir,
            tugas: data.tugas || null,
            catatan: data.catatan || null,
            status,
            createdAt: new Date().toISOString(),
          };
          set({ jurnal: [...state.jurnal, newJurnal] });
          return newJurnal;
        }
      },

      reviewJurnal: (jurnalId) => {
        set((state) => ({
          jurnal: state.jurnal.map((j) => (j.id === jurnalId ? { ...j, status: 'DIREVIEW' } : j)),
        }));
      },

      // Getters
      getTodaySchedule: (pengajarId) => {
        const state = get();
        const todayStr = new Date().toISOString().split('T')[0];
        let list = state.jadwalInstances.filter(
          (i) => i.tanggal === todayStr && i.status !== 'DIBATALKAN'
        );
        if (pengajarId) {
          list = list.filter((i) => i.pengajarId === pengajarId);
        }
        return list.sort((a, b) => a.jamMulai.localeCompare(b.jamMulai));
      },

      getStats: () => {
        const state = get();
        const todayStr = new Date().toISOString().split('T')[0];
        const todayInstances = state.jadwalInstances.filter(
          (i) => i.tanggal === todayStr && i.status !== 'DIBATALKAN'
        );
        const sedangMengajar = state.jadwalInstances.filter(
          (i) => i.tanggal === todayStr && i.status === 'MENGAJAR'
        ).length;

        // Completed teaching sessions that don't have a filled journal yet
        const completedInstances = state.jadwalInstances.filter(
          (i) => i.status === 'SELESAI'
        );
        const journalFilledMap = new Set(
          state.jurnal.filter((j) => j.status === 'DIISI' || j.status === 'DIREVIEW').map((j) => j.jadwalInstanceId)
        );
        const unfulfilledJournals = completedInstances.filter(
          (i) => !journalFilledMap.has(i.id)
        ).length;

        return {
          totalPengajar: state.pengajar.filter((p) => p.status === 'AKTIF').length,
          totalKelasAktif: state.kelas.filter((k) => k.status === 'AKTIF').length,
          jadwalHariIni: todayInstances.length,
          pengajarSedangMengajar: sedangMengajar,
          jurnalBelumDiisi: unfulfilledJournals,
        };
      },

      getRekapPengajar: (filters) => {
        const state = get();
        return state.pengajar.map((p) => {
          let instList = state.jadwalInstances.filter((i) => i.pengajarId === p.id);

          if (filters?.startDate) {
            instList = instList.filter((i) => i.tanggal >= filters.startDate!);
          }
          if (filters?.endDate) {
            instList = instList.filter((i) => i.tanggal <= filters.endDate!);
          }
          if (filters?.kelasId) {
            instList = instList.filter((i) => i.kelasId === filters.kelasId);
          }

          const totalSesi = instList.length;
          const completedInstances = instList.filter((i) => i.status === 'SELESAI');
          const totalKehadiran = completedInstances.length;

          // Compute total hours from absensi
          const instIds = new Set(instList.map((i) => i.id));
          const relevantAbsensi = state.absensi.filter((a) => instIds.has(a.jadwalInstanceId) && a.durasi);
          const totalMinutes = relevantAbsensi.reduce((acc, a) => acc + (a.durasi || 0), 0);
          const totalJamMengajar = Number((totalMinutes / 60).toFixed(1));

          const relevantJurnals = state.jurnal.filter((j) => instIds.has(j.jadwalInstanceId));
          const totalJurnalDiisi = relevantJurnals.filter(
            (j) => j.status === 'DIISI' || j.status === 'DIREVIEW'
          ).length;
          const totalJurnalPending = Math.max(0, totalKehadiran - totalJurnalDiisi);

          return {
            pengajarId: p.id,
            pengajarNama: p.name,
            pengajarEmail: p.email,
            totalSesi,
            totalKehadiran,
            totalJamMengajar,
            totalJurnalDiisi,
            totalJurnalPending,
          };
        });
      },

      resetAllData: () => {
        set(getInitialData());
      },
    }),
    {
      name: 'nexs-teaching-store-v1',
      storage: createJSONStorage(() => localStorage),
    }
  )
);
