import { Pengajar, JadwalInstance, Kelas, Ruangan } from './types';

/**
 * Format Indonesian phone number into standard international format for WhatsApp (628xxx).
 */
export function formatPhoneNumberForWA(phone?: string | null): string {
  if (!phone) return '';
  let cleaned = phone.replace(/[^0-9]/g, '');
  if (cleaned.startsWith('0')) {
    cleaned = '62' + cleaned.slice(1);
  } else if (cleaned.startsWith('8')) {
    cleaned = '62' + cleaned;
  }
  return cleaned;
}

/**
 * Generate WhatsApp URL for Web or Mobile App
 */
export function getWhatsAppUrl(phone: string, message: string): string {
  const formattedPhone = formatPhoneNumberForWA(phone);
  const encodedMessage = encodeURIComponent(message);
  if (formattedPhone) {
    return `https://wa.me/${formattedPhone}?text=${encodedMessage}`;
  }
  return `https://wa.me/?text=${encodedMessage}`;
}

/**
 * Open WhatsApp directly in a new browser tab/window
 */
export function openWhatsApp(phone: string, message: string): void {
  const url = getWhatsAppUrl(phone, message);
  if (typeof window !== 'undefined') {
    window.open(url, '_blank', 'noopener,noreferrer');
  }
}

/**
 * Template 1: Pengingat Jadwal Mengajar ke Pengajar (Sensei)
 */
export function createScheduleReminderMessage(options: {
  pengajarName: string;
  kelasNama: string;
  tanggal: string;
  hari: string;
  jamMulai: string;
  jamSelesai: string;
  ruanganNama: string;
}): string {
  const { pengajarName, kelasNama, tanggal, hari, jamMulai, jamSelesai, ruanganNama } = options;

  // Format readable date
  const dateFormatted = new Date(tanggal).toLocaleDateString('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  return `*PENGINGAT JADWAL MENGAJAR - NEXS ACADEMY* 📚

Halo *${pengajarName}*, 
Berikut informasi jadwal mengajar Anda:

📌 *Kelas:* ${kelasNama}
🗓️ *Hari/Tanggal:* ${hari}, ${dateFormatted}
⏰ *Waktu:* ${jamMulai} - ${jamSelesai} WIB
📍 *Ruangan:* ${ruanganNama}

Mohon untuk hadir tepat waktu dan melakukan check-in absensi serta pengisian jurnal mengajar melalui dashboard internal setelah kelas selesai.

Terima kasih atas dedikasi dan kerja samanya! 🙏
_Manajemen Akademik NEXS_`;
}

/**
 * Template 2: Pengingat Jurnal Mengajar yang Belum Diisi
 */
export function createPendingJournalReminderMessage(options: {
  pengajarName: string;
  totalPending: number;
  periode?: string;
}): string {
  const { pengajarName, totalPending, periode } = options;

  return `*REMINDER PENGISIAN JURNAL MENGAJAR* 📝
*NEXS ACADEMY*

Halo *${pengajarName}*, 
Kami menginformasikan bahwa masih terdapat *${totalPending} sesi mengajar* ${periode ? `(Periode: ${periode})` : ''} yang *belum dilengkapi jurnal pembelajarannya*.

Mohon kesediaannya untuk segera melengkapi:
1. Ringkasan materi yang diajarkan
2. Aktivitas kelas & jumlah siswa hadir
3. Tugas/PR yang diberikan

Pengisian jurnal sangat penting untuk validasi kehadiran dan rekapitulasi honor mengajar bulan ini.

🔗 _Silakan login ke dashboard NEXS untuk mengisi jurnal._
Terima kasih banyak atas kerja samanya! 🙏`;
}

/**
 * Template 3: Broadcast Jadwal Hari Ini ke Pengajar
 */
export function createDailyBroadcastMessage(options: {
  pengajarName: string;
  dateStr: string;
  sessions: Array<{
    kelasNama: string;
    jamMulai: string;
    jamSelesai: string;
    ruanganNama: string;
  }>;
}): string {
  const { pengajarName, dateStr, sessions } = options;

  const dateFormatted = new Date(dateStr).toLocaleDateString('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  const sessionLines = sessions
    .map(
      (s, idx) =>
        `${idx + 1}. *${s.kelasNama}*\n   ⏰ ${s.jamMulai} - ${s.jamSelesai} WIB | 📍 ${s.ruanganNama}`
    )
    .join('\n\n');

  return `*JADWAL MENGAJAR HARI INI* 🎌
*NEXS ACADEMY*
🗓️ ${dateFormatted}

Halo *${pengajarName}*, Anda memiliki *${sessions.length} sesi mengajar* hari ini:

${sessionLines}

Semoga kelas hari ini berjalan lancar dan menyenangkan! Jangan lupa melakukan presensi di dashboard.

_Manajemen Akademik NEXS_`;
}

/**
 * Template 4: Notifikasi Ringkasan Slip Honor Pengajar
 */
export function createHonorSlipNotificationMessage(options: {
  pengajarName: string;
  slipNo: string;
  periode: string;
  totalSesi: number;
  totalJam: number;
  totalHonorBersihFormatted: string;
}): string {
  const { pengajarName, slipNo, periode, totalSesi, totalJam, totalHonorBersihFormatted } = options;

  return `*SLIP HONORARIUM PENGAJAR* 💼
*NEXS ACADEMY*
No. Slip: ${slipNo}

Halo *${pengajarName}*,
Rekapitulasi honorarium mengajar Anda untuk periode *${periode}* telah selesai diproses:

📊 *Total Sesi:* ${totalSesi} Sesi
⏱️ *Total Jam Mengajar:* ${totalJam} Jam
💰 *Total Honor Diterima:* *${totalHonorBersihFormatted}*

Slip resmi dalam format PDF telah diterbitkan. Silakan hubungi tim Finance jika terdapat pertanyaan atau penyesuaian.

Terima kasih atas kontribusi terbaik Anda dalam mengajar di NEXS Academy! 🌟`;
}
