'use client';
import React, { useState, useMemo } from 'react';
import {
  CheckCircle2,
  Search,
  Filter,
  Clock,
  Calendar,
  Users,
  AlertCircle,
  GraduationCap,
  Play,
  Square,
  FileSpreadsheet,
} from 'lucide-react';
import { AbsensiStatusBadge } from '@/components/ui/Badge';
import { useNEXSStore } from '@/lib/store';
import { formatMinutes } from '@/lib/utils';

export default function AbsensiPage() {
  const {
    currentUser,
    pengajar,
    kelas,
    jadwalInstances,
    absensi,
    startTeaching,
    finishTeaching,
  } = useNEXSStore();

  const isAdmin = currentUser?.role === 'ADMIN';

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [filterPengajarId, setFilterPengajarId] = useState(
    isAdmin ? '' : currentUser?.id || ''
  );
  const [filterKelasId, setFilterKelasId] = useState('');
  const [filterTanggal, setFilterTanggal] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  // Combined attendance records with instances
  const attendanceList = useMemo(() => {
    // Each scheduled instance is an attendance entry
    let list = jadwalInstances.map((inst) => {
      const abs = absensi.find((a) => a.jadwalInstanceId === inst.id);
      const targetPengajar = pengajar.find((p) => p.id === inst.pengajarId);
      const targetKelas = kelas.find((k) => k.id === inst.kelasId);

      return {
        instanceId: inst.id,
        tanggal: inst.tanggal,
        hari: inst.hari,
        jamJadwal: `${inst.jamMulai} – ${inst.jamSelesai}`,
        jamMulaiAktual: abs?.jamMulaiAktual || '—',
        jamSelesaiAktual: abs?.jamSelesaiAktual || '—',
        durasi: abs?.durasi,
        status: abs?.status || (inst.status === 'DIBATALKAN' ? 'DIBATALKAN' : 'BELUM_MULAI'),
        pengajarId: inst.pengajarId,
        pengajarNama: targetPengajar?.name || '—',
        kelasId: inst.kelasId,
        kelasNama: targetKelas?.nama || '—',
        program: targetKelas?.program || '—',
        instanceStatus: inst.status,
      };
    });

    // Role filtering
    if (!isAdmin) {
      list = list.filter((item) => item.pengajarId === currentUser?.id);
    } else if (filterPengajarId) {
      list = list.filter((item) => item.pengajarId === filterPengajarId);
    }

    if (filterKelasId) {
      list = list.filter((item) => item.kelasId === filterKelasId);
    }

    if (filterTanggal) {
      list = list.filter((item) => item.tanggal === filterTanggal);
    }

    if (filterStatus) {
      list = list.filter((item) => item.status === filterStatus);
    }

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (item) =>
          item.pengajarNama.toLowerCase().includes(q) ||
          item.kelasNama.toLowerCase().includes(q) ||
          item.tanggal.includes(q)
      );
    }

    return list.sort((a, b) => b.tanggal.localeCompare(a.tanggal));
  }, [
    jadwalInstances,
    absensi,
    pengajar,
    kelas,
    isAdmin,
    currentUser,
    filterPengajarId,
    filterKelasId,
    filterTanggal,
    filterStatus,
    searchQuery,
  ]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900">
            Absensi Mengajar
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            {isAdmin
              ? 'Riwayat absensi kehadiran pengajar otomatis tersinkronisasi dari jadwal kelas.'
              : 'Riwayat absensi dan jam mengajar Anda.'}
          </p>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3">
          {/* Search */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Cari pengajar / kelas..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-600"
            />
          </div>

          {/* Pengajar (Admin only) */}
          {isAdmin && (
            <div>
              <select
                value={filterPengajarId}
                onChange={(e) => setFilterPengajarId(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-600 text-slate-700 font-medium"
              >
                <option value="">Semua Pengajar</option>
                {pengajar.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Kelas */}
          <div>
            <select
              value={filterKelasId}
              onChange={(e) => setFilterKelasId(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-600 text-slate-700 font-medium"
            >
              <option value="">Semua Kelas</option>
              {kelas.map((k) => (
                <option key={k.id} value={k.id}>
                  {k.nama}
                </option>
              ))}
            </select>
          </div>

          {/* Tanggal */}
          <div>
            <input
              type="date"
              value={filterTanggal}
              onChange={(e) => setFilterTanggal(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-600 text-slate-700 font-medium"
            />
          </div>

          {/* Status Absensi */}
          <div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-600 text-slate-700 font-medium"
            >
              <option value="">Semua Status Absen</option>
              <option value="BELUM_MULAI">Belum Mulai</option>
              <option value="MENGAJAR">Sedang Mengajar</option>
              <option value="SELESAI">Hadir (Selesai)</option>
              <option value="TERLAMBAT">Terlambat</option>
              <option value="TIDAK_HADIR">Tidak Hadir</option>
              <option value="DIBATALKAN">Dibatalkan</option>
            </select>
          </div>
        </div>

        {(searchQuery || filterPengajarId || filterKelasId || filterTanggal || filterStatus) && (
          <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100">
            <span>Ditemukan {attendanceList.length} rekaman absensi</span>
            <button
              onClick={() => {
                setSearchQuery('');
                setFilterPengajarId(isAdmin ? '' : currentUser?.id || '');
                setFilterKelasId('');
                setFilterTanggal('');
                setFilterStatus('');
              }}
              className="text-indigo-600 hover:text-indigo-800 font-semibold"
            >
              Reset Filter
            </button>
          </div>
        )}
      </div>

      {/* Attendance Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        {attendanceList.length === 0 ? (
          <div className="p-12 text-center">
            <CheckCircle2 className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <p className="text-sm font-semibold text-slate-700">Tidak ada riwayat absensi</p>
            <p className="text-xs text-slate-400 mt-0.5">Coba sesuaikan filter pencarian Anda.</p>
          </div>
        ) : (
          <div className="w-full overflow-x-auto">
            <table className="w-full text-left text-sm table-auto">
              <thead className="bg-slate-50 border-b border-slate-200/80 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                <tr>
                  <th className="px-4 py-3.5">Tanggal</th>
                  {isAdmin && <th className="px-4 py-3.5">Pengajar</th>}
                  <th className="px-4 py-3.5">Kelas</th>
                  <th className="px-4 py-3.5">Jam Jadwal</th>
                  <th className="px-4 py-3.5">Jam Aktual (Mulai - Selesai)</th>
                  <th className="px-4 py-3.5">Durasi</th>
                  <th className="px-4 py-3.5 text-center">Status Absensi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {attendanceList.map((item, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/70 transition-colors">
                    {/* Tanggal */}
                    <td className="px-4 py-3.5 whitespace-nowrap">
                      <div className="font-semibold text-slate-900">{item.tanggal}</div>
                      <div className="text-xs text-slate-500">{item.hari}</div>
                    </td>

                    {/* Pengajar */}
                    {isAdmin && (
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        <div className="font-medium text-slate-800 text-xs">
                          {item.pengajarNama}
                        </div>
                      </td>
                    )}

                    {/* Kelas */}
                    <td className="px-4 py-3.5">
                      <div className="font-bold text-slate-900 text-xs">{item.kelasNama}</div>
                      <div className="text-[11px] text-slate-500">{item.program}</div>
                    </td>

                    {/* Jam Jadwal */}
                    <td className="px-4 py-3.5 whitespace-nowrap">
                      <div className="flex items-center gap-1.5 text-xs text-slate-700 font-medium">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        <span>{item.jamJadwal}</span>
                      </div>
                    </td>

                    {/* Jam Aktual */}
                    <td className="px-4 py-3.5 whitespace-nowrap">
                      {item.jamMulaiAktual ? (
                        <div className="text-xs font-semibold text-slate-800">
                          {item.jamMulaiAktual} – {item.jamSelesaiAktual || '(Mengajar...)'}
                        </div>
                      ) : (
                        <span className="text-xs text-slate-400">—</span>
                      )}
                    </td>

                    {/* Durasi */}
                    <td className="px-4 py-3.5 whitespace-nowrap">
                      {item.durasi ? (
                        <div className="text-xs font-bold text-indigo-700">
                          {formatMinutes(item.durasi)}
                        </div>
                      ) : (
                        <span className="text-xs text-slate-400">—</span>
                      )}
                    </td>

                    {/* Status */}
                    <td className="px-4 py-3.5 whitespace-nowrap text-center">
                      <AbsensiStatusBadge status={item.status as any} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
