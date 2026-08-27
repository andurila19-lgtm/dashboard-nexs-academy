import { Pengajar, Kelas, JadwalInstance, Absensi, Jurnal } from './types';

export interface HonorRateConfig {
  tarifPerJam: number; // default e.g. 75000 (Rp 75.000 / jam)
  bonusPerJurnal: number; // default e.g. 15000 (Rp 15.000 / jurnal yang diisi lengkap)
  tunjanganTransportPerSesi: number; // default e.g. 20000 (Rp 20.000 / kehadiran sesi)
  tunjanganKomunikasi: number; // default e.g. 50000
  bonusPerforma: number; // default 0
  potonganPPh21Percent: number; // default 0 (misal 2.5% atau 5%)
  potonganKeterlambatan: number; // default 0
  potonganLain: number; // default 0
  bankName: string; // default e.g. 'Bank BCA'
  bankAccount: string; // default e.g. '7810-9283-11'
  bankHolder: string; // default e.g. Nama Pengajar
  catatanKhusus?: string;
}

export interface HonorSlipItem {
  instanceId: string;
  tanggal: string;
  hari: string;
  kelasNama: string;
  program: string;
  level: string;
  ruanganNama: string;
  jamJadwal: string;
  jamAktual: string;
  durasiMenit: number;
  durasiJam: number;
  honorSesi: number;
  bonusJurnal: number;
  tunjanganTransport: number;
  subtotal: number;
  statusAbsensi: string;
  statusJurnal: string;
  isJurnalFilled: boolean;
  isLate: boolean;
}

export interface HonorSlipData {
  slipNo: string;
  nomorRegistrasi: string;
  tanggalCetak: string;
  tanggalTransfer: string;
  periode: string;
  statusPembayaran: 'LUNAS / TELAH DITRANSFER' | 'SIAP DIBAYARKAN';
  pengajar: Pengajar;
  config: HonorRateConfig;
  items: HonorSlipItem[];
  // Statistics
  totalSesi: number;
  totalKehadiran: number;
  totalSesiTepatWaktu: number;
  totalSesiTerlambat: number;
  totalSesiBatal: number;
  totalJurnalTerisi: number;
  persentaseJurnal: number;
  totalJamMengajar: number;
  // Earnings
  totalHonorPokok: number;
  totalBonusJurnal: number;
  totalTunjanganTransport: number;
  totalTunjanganKomunikasi: number;
  totalBonusPerforma: number;
  totalPendapatanKotor: number;
  // Deductions
  totalPotonganPPh21: number;
  totalPotonganKeterlambatan: number;
  totalPotonganLain: number;
  totalPotongan: number;
  // Net
  totalHonorBersih: number;
  terbilangBersih: string;
}

/**
 * Format number into Indonesian Rupiah format (e.g., Rp 1.500.000)
 */
export function formatRupiah(amount: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Convert number into Indonesian spelled-out words (Terbilang)
 * E.g., 2500000 -> "Dua Juta Lima Ratus Ribu Rupiah"
 */
export function terbilang(n: number): string {
  const bilangan = [
    '',
    'Satu',
    'Dua',
    'Tiga',
    'Empat',
    'Lima',
    'Enam',
    'Tujuh',
    'Delapan',
    'Sembilan',
    'Sepuluh',
    'Sebelas',
  ];

  function convert(num: number): string {
    num = Math.floor(Math.abs(num));
    if (num < 12) {
      return bilangan[num];
    } else if (num < 20) {
      return convert(num - 10) + ' Belas';
    } else if (num < 100) {
      return convert(Math.floor(num / 10)) + ' Puluh ' + convert(num % 10);
    } else if (num < 200) {
      return 'Seratus ' + convert(num - 100);
    } else if (num < 1000) {
      return convert(Math.floor(num / 100)) + ' Ratus ' + convert(num % 100);
    } else if (num < 2000) {
      return 'Seribu ' + convert(num - 1000);
    } else if (num < 1000000) {
      return convert(Math.floor(num / 1000)) + ' Ribu ' + convert(num % 1000);
    } else if (num < 1000000000) {
      return convert(Math.floor(num / 1000000)) + ' Juta ' + convert(num % 1000000);
    } else if (num < 1000000000000) {
      return convert(Math.floor(num / 1000000000)) + ' Milyar ' + convert(num % 1000000000);
    }
    return '';
  }

  if (n === 0) return 'Nol Rupiah';
  const result = convert(n).replace(/\s+/g, ' ').trim();
  return `${result} Rupiah`;
}

export const DEFAULT_HONOR_CONFIG: HonorRateConfig = {
  tarifPerJam: 75000,
  bonusPerJurnal: 15000,
  tunjanganTransportPerSesi: 20000,
  tunjanganKomunikasi: 50000,
  bonusPerforma: 0,
  potonganPPh21Percent: 0,
  potonganKeterlambatan: 0,
  potonganLain: 0,
  bankName: 'Bank Central Asia (BCA)',
  bankAccount: '829-102-9981',
  bankHolder: '',
  catatanKhusus: 'Honorarium ditransfer langsung ke rekening terdaftar pada hari kerja pertama awal bulan berikutnya.',
};

/**
 * Generate Honor Slip data structure for a teacher in a given period
 */
export function generateHonorSlipData(params: {
  pengajar: Pengajar;
  kelasList: Kelas[];
  jadwalInstances: JadwalInstance[];
  absensiList: Absensi[];
  jurnalList: Jurnal[];
  periode?: string;
  config?: Partial<HonorRateConfig>;
}): HonorSlipData {
  const { pengajar, kelasList, jadwalInstances, absensiList, jurnalList, periode } = params;

  const currentConfig: HonorRateConfig = {
    ...DEFAULT_HONOR_CONFIG,
    bankHolder: pengajar.name,
    ...(params.config || {}),
  };

  const today = new Date();
  const dateFormattedToday = today.toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  const periodLabel =
    periode ||
    today.toLocaleDateString('id-ID', {
      month: 'long',
      year: 'numeric',
    });

  // Filter instances for this teacher
  const teacherInstances = jadwalInstances.filter((i) => i.pengajarId === pengajar.id);

  const items: HonorSlipItem[] = [];
  let totalLateCount = 0;
  let totalBatalCount = 0;

  teacherInstances.forEach((inst) => {
    const k = kelasList.find((c) => c.id === inst.kelasId);
    const abs = absensiList.find((a) => a.jadwalInstanceId === inst.id);
    const jur = jurnalList.find((j) => j.jadwalInstanceId === inst.id);

    if (inst.status === 'DIBATALKAN' || abs?.status === 'DIBATALKAN') {
      totalBatalCount++;
    }

    const isCompleted = inst.status === 'SELESAI' || abs?.status === 'SELESAI';
    const durasiMenit = isCompleted ? (abs?.durasi || 120) : 0;
    const durasiJam = Number((durasiMenit / 60).toFixed(2));

    const isLate = abs?.status === 'TERLAMBAT';
    if (isLate) totalLateCount++;

    const isJurnalFilled = !!jur && (jur.status === 'DIISI' || jur.status === 'DIREVIEW');

    const honorSesi = isCompleted ? Math.round(durasiJam * currentConfig.tarifPerJam) : 0;
    const bonusJurnal = isJurnalFilled ? currentConfig.bonusPerJurnal : 0;
    const tunjanganTransport = isCompleted ? currentConfig.tunjanganTransportPerSesi : 0;
    const subtotal = honorSesi + bonusJurnal + tunjanganTransport;

    items.push({
      instanceId: inst.id,
      tanggal: inst.tanggal,
      hari: inst.hari,
      kelasNama: k?.nama || 'Kelas Bahasa Jepang',
      program: k?.program || 'JLPT Preparation',
      level: k?.level || 'N5',
      ruanganNama: 'Room Tokyo / NEXS Centre',
      jamJadwal: `${inst.jamMulai} - ${inst.jamSelesai}`,
      jamAktual: abs?.jamMulaiAktual && abs?.jamSelesaiAktual ? `${abs.jamMulaiAktual} - ${abs.jamSelesaiAktual}` : (isCompleted ? `${inst.jamMulai} - ${inst.jamSelesai}` : '—'),
      durasiMenit,
      durasiJam,
      honorSesi,
      bonusJurnal,
      tunjanganTransport,
      subtotal,
      statusAbsensi: abs?.status || inst.status,
      statusJurnal: jur?.status || 'BELUM_DIISI',
      isJurnalFilled,
      isLate,
    });
  });

  // Sort chronologically
  items.sort((a, b) => a.tanggal.localeCompare(b.tanggal));

  const totalSesi = items.length;
  const completedItems = items.filter((i) => i.durasiMenit > 0);
  const totalKehadiran = completedItems.length;
  const totalSesiTepatWaktu = Math.max(0, totalKehadiran - totalLateCount);
  const totalJurnalTerisi = items.filter((i) => i.isJurnalFilled).length;
  const persentaseJurnal = totalKehadiran > 0 ? Math.round((totalJurnalTerisi / totalKehadiran) * 100) : 100;

  const totalJamMengajar = Number(
    completedItems.reduce((acc, i) => acc + i.durasiJam, 0).toFixed(1)
  );

  const totalHonorPokok = completedItems.reduce((acc, i) => acc + i.honorSesi, 0);
  const totalBonusJurnal = items.reduce((acc, i) => acc + i.bonusJurnal, 0);
  const totalTunjanganTransport = items.reduce((acc, i) => acc + i.tunjanganTransport, 0);
  const totalTunjanganKomunikasi = totalKehadiran > 0 ? (currentConfig.tunjanganKomunikasi || 0) : 0;
  const totalBonusPerforma = currentConfig.bonusPerforma || 0;

  const totalPendapatanKotor =
    totalHonorPokok +
    totalBonusJurnal +
    totalTunjanganTransport +
    totalTunjanganKomunikasi +
    totalBonusPerforma;

  const totalPotonganPPh21 = currentConfig.potonganPPh21Percent > 0
    ? Math.round((totalPendapatanKotor * currentConfig.potonganPPh21Percent) / 100)
    : 0;
  const totalPotonganKeterlambatan = currentConfig.potonganKeterlambatan || 0;
  const totalPotonganLain = currentConfig.potonganLain || 0;

  const totalPotongan = totalPotonganPPh21 + totalPotonganKeterlambatan + totalPotonganLain;
  const totalHonorBersih = Math.max(0, totalPendapatanKotor - totalPotongan);

  const padId = pengajar.id.replace(/[^0-9]/g, '').padStart(3, '0') || '001';
  const monthCode = String(today.getMonth() + 1).padStart(2, '0');
  const yearCode = today.getFullYear();
  const slipNo = `SLIP/${yearCode}/${monthCode}/NX-${padId}`;
  const nomorRegistrasi = `REG-TUTOR/NX-${padId}/${yearCode}`;

  return {
    slipNo,
    nomorRegistrasi,
    tanggalCetak: dateFormattedToday,
    tanggalTransfer: dateFormattedToday,
    periode: periodLabel,
    statusPembayaran: 'LUNAS / TELAH DITRANSFER',
    pengajar,
    config: currentConfig,
    items,
    totalSesi,
    totalKehadiran,
    totalSesiTepatWaktu,
    totalSesiTerlambat: totalLateCount,
    totalSesiBatal: totalBatalCount,
    totalJurnalTerisi,
    persentaseJurnal,
    totalJamMengajar,
    totalHonorPokok,
    totalBonusJurnal,
    totalTunjanganTransport,
    totalTunjanganKomunikasi,
    totalBonusPerforma,
    totalPendapatanKotor,
    totalPotonganPPh21,
    totalPotonganKeterlambatan,
    totalPotonganLain,
    totalPotongan,
    totalHonorBersih,
    terbilangBersih: terbilang(totalHonorBersih),
  };
}
