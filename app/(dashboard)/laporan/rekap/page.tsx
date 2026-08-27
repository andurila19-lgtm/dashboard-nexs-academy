'use client';
import React, { useState, useMemo } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import {
  BarChart3,
  Download,
  Calendar,
  Users,
  Clock,
  BookOpen,
  AlertCircle,
  FileSpreadsheet,
} from 'lucide-react';
import { StatCard } from '@/components/ui/StatCard';
import { useNEXSStore } from '@/lib/store';
import { exportRekapToExcel } from '@/lib/excel';
import { useToast } from '@/components/ui/Toast';

export default function RekapPengajarPage() {
  const { pengajar, kelas, getRekapPengajar } = useNEXSStore();

  // Filters
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [filterPengajarId, setFilterPengajarId] = useState('');
  const [filterKelasId, setFilterKelasId] = useState('');
  const [isExporting, setIsExporting] = useState(false);

  const rekapData = useMemo(() => {
    let data = getRekapPengajar({
      startDate: startDate || undefined,
      endDate: endDate || undefined,
      pengajarId: filterPengajarId || undefined,
      kelasId: filterKelasId || undefined,
    });

    if (filterPengajarId) {
      data = data.filter((d) => d.pengajarId === filterPengajarId);
    }

    return data;
  }, [getRekapPengajar, startDate, endDate, filterPengajarId, filterKelasId]);

  // Overall totals
  const totalSesiAll = rekapData.reduce((acc, r) => acc + r.totalSesi, 0);
  const totalKehadiranAll = rekapData.reduce((acc, r) => acc + r.totalKehadiran, 0);
  const totalJamAll = Number(
    rekapData.reduce((acc, r) => acc + r.totalJamMengajar, 0).toFixed(1)
  );
  const totalJurnalAll = rekapData.reduce((acc, r) => acc + r.totalJurnalDiisi, 0);
  const totalPendingAll = rekapData.reduce((acc, r) => acc + r.totalJurnalPending, 0);

  // Chart data
  const chartData = rekapData.map((r) => ({
    name: r.pengajarNama.replace(' Sensei', ''),
    'Total Jam Mengajar': r.totalJamMengajar,
    'Sesi Selesai': r.totalKehadiran,
    'Jurnal Terisi': r.totalJurnalDiisi,
  }));

  const toast = useToast();

  const handleExportExcel = async () => {
    setIsExporting(true);
    try {
      const periodeInfo =
        startDate && endDate
          ? `${startDate} s/d ${endDate}`
          : startDate
          ? `Mulai ${startDate}`
          : endDate
          ? `Sampai ${endDate}`
          : 'Semua Periode';
      await exportRekapToExcel(rekapData, periodeInfo);
      toast.success('Export Excel Berhasil', `File rekap (${periodeInfo}) telah diunduh.`);
    } catch (err) {
      console.error(err);
      toast.error('Export Gagal', 'Terjadi kesalahan saat membuat file spreadsheet Excel.');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header & Export button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900">
            Laporan Rekap Pengajar
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Akumulasi jam mengajar, tingkat kehadiran sesi, dan pemenuhan jurnal pembelajaran.
          </p>
        </div>

        <button
          onClick={handleExportExcel}
          disabled={isExporting}
          className="flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-xs transition-colors disabled:opacity-50"
        >
          <FileSpreadsheet className="w-4 h-4" />
          <span>{isExporting ? 'Mengekspor...' : 'Export Excel (.xlsx)'}</span>
        </button>
      </div>

      {/* 5 Summary Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard
          title="Total Sesi"
          value={totalSesiAll}
          icon={Calendar}
          description="Sesi terjadwal"
          iconBgColor="bg-slate-100"
          iconColor="text-slate-700"
        />
        <StatCard
          title="Total Kehadiran"
          value={totalKehadiranAll}
          icon={Users}
          description="Sesi selesai"
          iconBgColor="bg-emerald-50"
          iconColor="text-emerald-600"
        />
        <StatCard
          title="Total Jam Mengajar"
          value={`${totalJamAll} Jam`}
          icon={Clock}
          description="Akumulasi waktu"
          iconBgColor="bg-indigo-50"
          iconColor="text-indigo-600"
        />
        <StatCard
          title="Jurnal Terisi"
          value={totalJurnalAll}
          icon={BookOpen}
          description="Laporan lengkap"
          iconBgColor="bg-blue-50"
          iconColor="text-blue-600"
        />
        <StatCard
          title="Jurnal Pending"
          value={totalPendingAll}
          icon={AlertCircle}
          description="Belum diisi"
          badgeText={totalPendingAll > 0 ? 'Perhatian' : 'Nihil'}
          badgeType={totalPendingAll > 0 ? 'danger' : 'success'}
          iconBgColor="bg-rose-50"
          iconColor="text-rose-600"
        />
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
          {/* Start Date */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 mb-1">
              Dari Tanggal
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-600 font-medium"
            />
          </div>

          {/* End Date */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 mb-1">
              Sampai Tanggal
            </label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-600 font-medium"
            />
          </div>

          {/* Filter Pengajar */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 mb-1">
              Pengajar
            </label>
            <select
              value={filterPengajarId}
              onChange={(e) => setFilterPengajarId(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-600 font-medium"
            >
              <option value="">Semua Pengajar</option>
              {pengajar.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>

          {/* Filter Kelas */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 mb-1">
              Kelas
            </label>
            <select
              value={filterKelasId}
              onChange={(e) => setFilterKelasId(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-600 font-medium"
            >
              <option value="">Semua Kelas</option>
              {kelas.map((k) => (
                <option key={k.id} value={k.id}>
                  {k.nama}
                </option>
              ))}
            </select>
          </div>
        </div>

        {(startDate || endDate || filterPengajarId || filterKelasId) && (
          <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100">
            <span>Filter periode aktif</span>
            <button
              onClick={() => {
                setStartDate('');
                setEndDate('');
                setFilterPengajarId('');
                setFilterKelasId('');
              }}
              className="text-indigo-600 hover:text-indigo-800 font-semibold"
            >
              Reset Filter
            </button>
          </div>
        )}
      </div>

      {/* Visual Analytics Chart */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
        <h2 className="text-sm font-bold text-slate-900 mb-4">
          Statistik Jam Mengajar per Pengajar
        </h2>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#64748b' }} />
              <YAxis tick={{ fontSize: 12, fill: '#64748b' }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#ffffff',
                  borderRadius: '0.75rem',
                  border: '1px solid #e2e8f0',
                  boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                }}
              />
              <Legend wrapperStyle={{ fontSize: '12px' }} />
              <Bar dataKey="Total Jam Mengajar" fill="#4f46e5" radius={[4, 4, 0, 0]} />
              <Bar dataKey="Sesi Selesai" fill="#10b981" radius={[4, 4, 0, 0]} />
              <Bar dataKey="Jurnal Terisi" fill="#0ea5e9" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Rekap Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 bg-slate-50/50">
          <h2 className="text-sm font-bold text-slate-900">
            Tabel Rekapitulasi Pengajar
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 border-b border-slate-200/80 text-xs font-semibold text-slate-500 uppercase tracking-wider">
              <tr>
                <th className="px-6 py-3.5">Pengajar</th>
                <th className="px-6 py-3.5 text-center">Total Sesi</th>
                <th className="px-6 py-3.5 text-center">Kehadiran (Hadir)</th>
                <th className="px-6 py-3.5 text-center">Jam Mengajar</th>
                <th className="px-6 py-3.5 text-center">Jurnal Terisi</th>
                <th className="px-6 py-3.5 text-center">Jurnal Pending</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {rekapData.map((row) => (
                <tr key={row.pengajarId} className="hover:bg-slate-50/70 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="font-bold text-slate-900">{row.pengajarNama}</div>
                    <div className="text-xs text-slate-500">{row.pengajarEmail}</div>
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap text-center text-xs font-semibold text-slate-700">
                    {row.totalSesi} Sesi
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      {row.totalKehadiran} Sesi
                    </span>
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap text-center text-xs font-bold text-indigo-700">
                    {row.totalJamMengajar} Jam
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                      {row.totalJurnalDiisi} Jurnal
                    </span>
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    {row.totalJurnalPending > 0 ? (
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200 animate-pulse">
                        {row.totalJurnalPending} Pending
                      </span>
                    ) : (
                      <span className="text-xs text-slate-400 font-medium">0</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
