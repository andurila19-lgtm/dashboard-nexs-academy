import { v4 as uuid } from 'uuid';

// Generate IDs upfront so we can reference them
const PENGAJAR_IDS = {
  tanaka: 'pengajar-1',
  yamamoto: 'pengajar-2',
  suzuki: 'pengajar-3',
  nakamura: 'pengajar-4',
  watanabe: 'pengajar-5'
};

const KELAS_IDS = {
  n5a: uuid(),
  n5b: uuid(),
  n4a: uuid(),
  n4b: uuid(),
  n3a: uuid(),
  n2a: uuid(),
  konversasi: uuid(),
  bisnis: uuid()
};

const RUANGAN_IDS = {
  room1: uuid(),
  room2: uuid(),
  room3: uuid(),
  room4: uuid()
};

// Helper to get dates for current month
function getCurrentMonthDates() {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  
  // Period: start of current month to end of next month
  const periodEnd = new Date(year, month + 2, 0);
  
  return {
    start: firstDay.toISOString().split('T')[0],
    end: periodEnd.toISOString().split('T')[0],
    monthStart: firstDay.toISOString().split('T')[0],
    monthEnd: lastDay.toISOString().split('T')[0]
  };
}

const HARI_NAMES = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];

function generateInstances(pattern) {
  const instances = [];
  const startDate = new Date(pattern.tanggalMulai);
  const endDate = new Date(pattern.tanggalSelesai);
  
  if (pattern.tipe === 'sekali') {
    instances.push({
      id: uuid(),
      patternId: pattern.id,
      pengajarId: pattern.pengajarId,
      kelasId: pattern.kelasId,
      ruanganId: pattern.ruanganId,
      tanggal: pattern.tanggalMulai,
      hari: HARI_NAMES[new Date(pattern.tanggalMulai).getDay()],
      jamMulai: pattern.jamMulai,
      jamSelesai: pattern.jamSelesai,
      status: 'aktif'
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
        status: 'aktif'
      });
    }
    current.setDate(current.getDate() + 1);
  }
  return instances;
}

export function getSeedData() {
  const dates = getCurrentMonthDates();

  const pengajar = [
    { id: PENGAJAR_IDS.tanaka, name: 'Sensei Tanaka', email: 'tanaka@nexs.com', phone: '081234567891', status: 'Aktif' },
    { id: PENGAJAR_IDS.yamamoto, name: 'Sensei Yamamoto', email: 'yamamoto@nexs.com', phone: '081234567892', status: 'Aktif' },
    { id: PENGAJAR_IDS.suzuki, name: 'Sensei Suzuki', email: 'suzuki@nexs.com', phone: '081234567893', status: 'Aktif' },
    { id: PENGAJAR_IDS.nakamura, name: 'Sensei Nakamura', email: 'nakamura@nexs.com', phone: '081234567894', status: 'Aktif' },
    { id: PENGAJAR_IDS.watanabe, name: 'Sensei Watanabe', email: 'watanabe@nexs.com', phone: '081234567895', status: 'Nonaktif' }
  ];

  const kelas = [
    { id: KELAS_IDS.n5a, nama: 'JLPT N5 A', program: 'JLPT Preparation', level: 'N5', kapasitas: 15, status: 'Aktif' },
    { id: KELAS_IDS.n5b, nama: 'JLPT N5 B', program: 'JLPT Preparation', level: 'N5', kapasitas: 15, status: 'Aktif' },
    { id: KELAS_IDS.n4a, nama: 'JLPT N4 A', program: 'JLPT Preparation', level: 'N4', kapasitas: 12, status: 'Aktif' },
    { id: KELAS_IDS.n4b, nama: 'JLPT N4 B', program: 'JLPT Preparation', level: 'N4', kapasitas: 12, status: 'Aktif' },
    { id: KELAS_IDS.n3a, nama: 'JLPT N3 A', program: 'JLPT Preparation', level: 'N3', kapasitas: 10, status: 'Aktif' },
    { id: KELAS_IDS.n2a, nama: 'JLPT N2 A', program: 'JLPT Preparation', level: 'N2', kapasitas: 8, status: 'Aktif' },
    { id: KELAS_IDS.konversasi, nama: 'Konversasi Dasar', program: 'Conversation', level: 'Dasar', kapasitas: 20, status: 'Aktif' },
    { id: KELAS_IDS.bisnis, nama: 'Bahasa Jepang Bisnis', program: 'Business Japanese', level: 'Menengah', kapasitas: 10, status: 'Nonaktif' }
  ];

  const ruangan = [
    { id: RUANGAN_IDS.room1, nama: 'Room 1', kapasitas: 20, status: 'Aktif' },
    { id: RUANGAN_IDS.room2, nama: 'Room 2', kapasitas: 15, status: 'Aktif' },
    { id: RUANGAN_IDS.room3, nama: 'Room 3', kapasitas: 12, status: 'Aktif' },
    { id: RUANGAN_IDS.room4, nama: 'Room 4', kapasitas: 10, status: 'Aktif' }
  ];

  // Generate siswa
  const siswaNames = [
    'Andi Pratama', 'Budi Santoso', 'Citra Dewi', 'Dian Safitri', 'Eko Wijaya',
    'Fitri Handayani', 'Galih Permana', 'Hana Putri', 'Irfan Hakim', 'Joko Susilo',
    'Kartika Sari', 'Lukman Hakim', 'Maya Anggraeni', 'Nadia Rahma', 'Oscar Pratama',
    'Putri Ayu', 'Qori Ramadhani', 'Rizki Fajar', 'Sinta Maharani', 'Taufik Hidayat',
    'Umar Faruk', 'Vina Melati', 'Wahyu Setiawan', 'Xena Putri', 'Yusuf Maulana',
    'Zahra Amelia', 'Agus Purnomo', 'Bayu Saputra', 'Cici Paramitha', 'Doni Setiawan'
  ];

  const kelasAssignments = [
    KELAS_IDS.n5a, KELAS_IDS.n5a, KELAS_IDS.n5a, KELAS_IDS.n5a, KELAS_IDS.n5a,
    KELAS_IDS.n5b, KELAS_IDS.n5b, KELAS_IDS.n5b, KELAS_IDS.n5b, KELAS_IDS.n5b,
    KELAS_IDS.n4a, KELAS_IDS.n4a, KELAS_IDS.n4a, KELAS_IDS.n4a,
    KELAS_IDS.n4b, KELAS_IDS.n4b, KELAS_IDS.n4b, KELAS_IDS.n4b,
    KELAS_IDS.n3a, KELAS_IDS.n3a, KELAS_IDS.n3a,
    KELAS_IDS.n2a, KELAS_IDS.n2a, KELAS_IDS.n2a,
    KELAS_IDS.konversasi, KELAS_IDS.konversasi, KELAS_IDS.konversasi, KELAS_IDS.konversasi,
    KELAS_IDS.konversasi, KELAS_IDS.konversasi
  ];

  const siswa = siswaNames.map((name, idx) => ({
    id: uuid(),
    nama: name,
    email: `${name.toLowerCase().replace(' ', '.')}@email.com`,
    phone: `08${String(1000000000 + idx).slice(1)}`,
    kelasId: kelasAssignments[idx],
    status: 'Aktif'
  }));

  // Jadwal patterns
  const jadwalPatterns = [
    {
      id: uuid(),
      pengajarId: PENGAJAR_IDS.tanaka,
      kelasId: KELAS_IDS.n4a,
      ruanganId: RUANGAN_IDS.room1,
      hari: ['Senin', 'Rabu'],
      jamMulai: '08:00',
      jamSelesai: '10:00',
      tanggalMulai: dates.start,
      tanggalSelesai: dates.end,
      tipe: 'berulang',
      status: 'aktif'
    },
    {
      id: uuid(),
      pengajarId: PENGAJAR_IDS.tanaka,
      kelasId: KELAS_IDS.n3a,
      ruanganId: RUANGAN_IDS.room1,
      hari: ['Selasa', 'Kamis'],
      jamMulai: '08:00',
      jamSelesai: '10:00',
      tanggalMulai: dates.start,
      tanggalSelesai: dates.end,
      tipe: 'berulang',
      status: 'aktif'
    },
    {
      id: uuid(),
      pengajarId: PENGAJAR_IDS.yamamoto,
      kelasId: KELAS_IDS.n5a,
      ruanganId: RUANGAN_IDS.room2,
      hari: ['Senin', 'Rabu', 'Jumat'],
      jamMulai: '10:00',
      jamSelesai: '12:00',
      tanggalMulai: dates.start,
      tanggalSelesai: dates.end,
      tipe: 'berulang',
      status: 'aktif'
    },
    {
      id: uuid(),
      pengajarId: PENGAJAR_IDS.yamamoto,
      kelasId: KELAS_IDS.n5b,
      ruanganId: RUANGAN_IDS.room2,
      hari: ['Selasa', 'Kamis'],
      jamMulai: '10:00',
      jamSelesai: '12:00',
      tanggalMulai: dates.start,
      tanggalSelesai: dates.end,
      tipe: 'berulang',
      status: 'aktif'
    },
    {
      id: uuid(),
      pengajarId: PENGAJAR_IDS.suzuki,
      kelasId: KELAS_IDS.n4b,
      ruanganId: RUANGAN_IDS.room3,
      hari: ['Senin', 'Rabu'],
      jamMulai: '13:00',
      jamSelesai: '15:00',
      tanggalMulai: dates.start,
      tanggalSelesai: dates.end,
      tipe: 'berulang',
      status: 'aktif'
    },
    {
      id: uuid(),
      pengajarId: PENGAJAR_IDS.suzuki,
      kelasId: KELAS_IDS.konversasi,
      ruanganId: RUANGAN_IDS.room3,
      hari: ['Jumat'],
      jamMulai: '13:00',
      jamSelesai: '15:00',
      tanggalMulai: dates.start,
      tanggalSelesai: dates.end,
      tipe: 'berulang',
      status: 'aktif'
    },
    {
      id: uuid(),
      pengajarId: PENGAJAR_IDS.nakamura,
      kelasId: KELAS_IDS.n2a,
      ruanganId: RUANGAN_IDS.room4,
      hari: ['Selasa', 'Kamis'],
      jamMulai: '15:00',
      jamSelesai: '17:00',
      tanggalMulai: dates.start,
      tanggalSelesai: dates.end,
      tipe: 'berulang',
      status: 'aktif'
    }
  ];

  // Generate all instances
  let jadwalInstances = [];
  jadwalPatterns.forEach(pattern => {
    jadwalInstances = [...jadwalInstances, ...generateInstances(pattern)];
  });

  // Create some past absensi records (for demo)
  const today = new Date();
  const pastInstances = jadwalInstances.filter(i => {
    const instDate = new Date(i.tanggal);
    return instDate < today && instDate >= new Date(today.getFullYear(), today.getMonth(), 1);
  });

  const absensi = [];
  const jurnal = [];
  
  // Mark ~70% of past instances as completed
  pastInstances.forEach((inst, idx) => {
    if (idx % 10 < 7) { // 70% completed
      const absensiId = uuid();
      absensi.push({
        id: absensiId,
        jadwalInstanceId: inst.id,
        pengajarId: inst.pengajarId,
        kelasId: inst.kelasId,
        tanggal: inst.tanggal,
        jamJadwalMulai: inst.jamMulai,
        jamJadwalSelesai: inst.jamSelesai,
        jamMulaiAktual: inst.jamMulai,
        jamSelesaiAktual: inst.jamSelesai,
        durasi: 120,
        status: 'selesai'
      });
      inst.status = 'selesai';

      // 60% of completed have journals
      if (idx % 10 < 4) {
        jurnal.push({
          id: uuid(),
          jadwalInstanceId: inst.id,
          pengajarId: inst.pengajarId,
          kelasId: inst.kelasId,
          tanggal: inst.tanggal,
          materi: getMockMateri(idx),
          aktivitas: getMockAktivitas(idx),
          jumlahSiswaHadir: 8 + (idx % 5),
          tugas: idx % 3 === 0 ? 'Latihan soal bab ' + ((idx % 5) + 1) : '',
          catatan: idx % 4 === 0 ? 'Beberapa siswa perlu bimbingan tambahan' : '',
          status: idx % 5 === 0 ? 'direview' : 'diisi',
          createdAt: new Date(inst.tanggal + 'T' + inst.jamSelesai).toISOString()
        });
      }
    } else if (idx % 10 === 7) {
      // Late
      absensi.push({
        id: uuid(),
        jadwalInstanceId: inst.id,
        pengajarId: inst.pengajarId,
        kelasId: inst.kelasId,
        tanggal: inst.tanggal,
        jamJadwalMulai: inst.jamMulai,
        jamJadwalSelesai: inst.jamSelesai,
        jamMulaiAktual: addMinutes(inst.jamMulai, 20),
        jamSelesaiAktual: inst.jamSelesai,
        durasi: 100,
        status: 'selesai'
      });
      inst.status = 'selesai';
    }
    // Remaining ~20% stay as 'aktif' (not attended - will show as missed for past dates)
  });

  return {
    pengajar,
    kelas,
    siswa,
    ruangan,
    jadwalPatterns,
    jadwalInstances,
    absensi,
    jurnal
  };
}

function addMinutes(timeStr, minutes) {
  const [h, m] = timeStr.split(':').map(Number);
  const total = h * 60 + m + minutes;
  const newH = Math.floor(total / 60);
  const newM = total % 60;
  return `${String(newH).padStart(2, '0')}:${String(newM).padStart(2, '0')}`;
}

function getMockMateri(idx) {
  const materials = [
    'Hiragana dasar (あ-お)',
    'Katakana lanjutan',
    'Kanji N4 - Bab 3',
    'Tata bahasa: て-form',
    'Kosakata sehari-hari',
    'Pola kalimat: ～たいです',
    'Membaca teks pendek',
    'Latihan mendengarkan',
    'Kanji N3 - Bab 5',
    'Keigo (bahasa sopan)'
  ];
  return materials[idx % materials.length];
}

function getMockAktivitas(idx) {
  const activities = [
    'Penjelasan materi, latihan menulis, tanya jawab',
    'Drill kosakata, role play, latihan soal',
    'Presentasi singkat, diskusi kelompok, quiz',
    'Latihan mendengarkan, shadowing, review materi',
    'Membaca bersama, penjelasan grammar, praktek percakapan'
  ];
  return activities[idx % activities.length];
}

export default getSeedData;
