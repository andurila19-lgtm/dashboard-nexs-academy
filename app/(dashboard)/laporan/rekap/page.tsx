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
  FileText,
  MessageSquare,
  DollarSign,
  Printer,
} from 'lucide-react';
import { StatCard } from '@/components/ui/StatCard';
import { useNEXSStore } from '@/lib/store';
import { exportRekapToExcel } from '@/lib/excel';
import { SlipHonorModal } from '@/components/payroll/SlipHonorModal';
import { WhatsAppModal } from '@/components/whatsapp/WhatsAppModal';
import { createPendingJournalReminderMessage } from '@/lib/whatsapp';
import { formatRupiah } from '@/lib/payroll';
import { useToast } from '@/components/ui/Toast';
import { Pengajar } from '@/lib/types';

export default function RekapPengajarPage() {
  const {
    currentUser,
    pengajar,
    kelas,
    jadwalInstances,
    absensi,
    jurnal,
    getRekapPengajar,
  } = useNEXSStore();

  const isAdmin = currentUser?.role === 'ADMIN';

  // Filters
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [filterPengajarId, setFilterPengajarId] = useState(
    isAdmin ? '' : currentUser?.id || ''
  );
  const [filterKelasId, setFilterKelasId] = useState('');
  const [isExporting, setIsExporting] = useState(false);

  // Modals
  const [selectedPengajarForSlip, setSelectedPengajarForSlip] = useState<Pengajar | null>(null);
  const [waReminderTarget, setWaReminderTarget] = useState<{
    pengajar: Pengajar;
    pendingCount: number;
  } | null>(null);

  const rekapData = useMemo(() => {
    let data = getRekapPengajar({
      startDate: startDate || undefined,
      endDate: endDate || undefined,
      pengajarId: filterPengajarId || (isAdmin ? undefined : currentUser?.id),
      kelasId: filterKelasId || undefined,
    });

    if (filterPengajarId) {
      data = data.filter((d) => d.pengajarId === filterPengajarId);
    } else if (!isAdmin && currentUser?.id) {
      data = data.filter((d) => d.pengajarId === currentUser.id);
    }

    return data;
  }, [getRekapPengajar, startDate, endDate, filterPengajarId, filterKelasId, isAdmin, currentUser]);

  // Overall totals
  const totalSesiAll = rekapData.reduce((acc, r) => acc + r.totalSesi, 0);
  const totalKehadiranAll = rekapData.reduce((acc, r) => acc + r.totalKehadiran, 0);
  const totalJamAll = Number(
    rekapData.reduce((acc, r) => acc + r.totalJamMengajar, 0).toFixed(1)
  );
  const totalJurnalAll = rekapData.reduce((acc, r) => acc + r.totalJurnalDiisi, 0);
  const totalPendingAll = rekapData.reduce((acc, r) => acc + r.totalJurnalPending, 0);

  // Estimasi Honor Pokok (Tarif default Rp 75.000 / jam + insentif jurnal Rp 15.000)
  const totalEstimasiHonor = Math.round(totalJamAll * 75000 + totalJurnalAll * 15000);

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

  const handleOpenSlip = (pengajarId: string) => {
    const target = pengajar.find((p) => p.id === pengajarId);
    if (target) {
      setSelectedPengajarForSlip(target);
    }
  };

  const handleOpenWAReminder = (row: (typeof rekapData)[0]) => {
    const target = pengajar.find((p) => p.id === row.pengajarId);
    if (target) {
      setWaReminderTarget({
        pengajar: target,
        pendingCount: row.totalJurnalPending,
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header & Export / Slip Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900">
            {isAdmin ? 'Laporan Rekap & Payroll Pengajar' : 'Rekapitulasi Mengajar & Honor Saya'}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Akumulasi jam mengajar, penerbitan slip honorarium, dan kelengkapan jurnal pembelajaran.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {!isAdmin && currentUser?.pengajarId && (
            <button
              onClick={() => handleOpenSlip(currentUser.pengajarId!)}
              className="flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs transition-colors"
            >
              <FileText className="w-4 h-4" />
              <span>Lihat Slip Honor Saya</span>
            </button>
          )}

          <button
            onClick={handleExportExcel}
            disabled={isExporting}
            className="flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-xs transition-colors disabled:opacity-50"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>{isExporting ? 'Mengekspor...' : 'Export Excel (.xlsx)'}</span>
          </button>
        </div>
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
          description="Sesi terlaksana"
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
          title="Est. Total Honor"
          value={formatRupiah(totalEstimasiHonor)}
          icon={DollarSign}
          description="Basis tarif standar"
          iconBgColor="bg-amber-50"
          iconColor="text-amber-600"
        />
        <StatCard
          title="Jurnal Pending"
          value={totalPendingAll}
          icon={AlertCircle}
          description="Belum dilengkapi"
          badgeText={totalPendingAll > 0 ? 'Perlu Reminder' : 'Lengkap'}
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

          {/* Filter Pengajar (Only for Admin) */}
          {isAdmin ? (
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
          ) : (
            <div>
              <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                Akun Pengajar
              </label>
              <div className="px-3 py-2 text-xs bg-slate-100 text-slate-700 font-bold rounded-lg border border-slate-200 truncate">
                {currentUser?.name}
              </div>
            </div>
          )}

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

        {(startDate || endDate || (isAdmin && filterPengajarId) || filterKelasId) && (
          <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100">
            <span>Filter periode aktif</span>
            <button
              onClick={() => {
                setStartDate('');
                setEndDate('');
                if (isAdmin) setFilterPengajarId('');
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
      {isAdmin && (
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <h2 className="text-sm font-bold text-slate-900 mb-4">
            Statistik Jam Mengajar & Jurnal per Pengajar
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
      )}

      {/* Rekap & Slip Honor Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-slate-900">
              Tabel Rekapitulasi & Penerbitan Slip Honor
            </h2>
            <p className="text-xs text-slate-500">
              Klik "Slip Honor (PDF)" untuk mencetak atau mengirimkan bukti honorarium resmi.
            </p>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 border-b border-slate-200/80 text-xs font-semibold text-slate-500 uppercase tracking-wider">
              <tr>
                <th className="px-5 py-3.5">Pengajar</th>
                <th className="px-4 py-3.5 text-center">Total Sesi</th>
                <th className="px-4 py-3.5 text-center">Kehadiran</th>
                <th className="px-4 py-3.5 text-center">Jam Mengajar</th>
                <th className="px-4 py-3.5 text-center">Jurnal</th>
                <th className="px-4 py-3.5 text-center">Est. Honor</th>
                <th className="px-5 py-3.5 text-right">Aksi Dokumen & WA</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {rekapData.map((row) => {
                const targetPengajarObj = pengajar.find((p) => p.id === row.pengajarId);
                const estRowHonor = Math.round(row.totalJamMengajar * 75000 + row.totalJurnalDiisi * 15000);

                return (
                  <tr key={row.pengajarId} className="hover:bg-slate-50/70 transition-colors">
                    <td className="px-5 py-4 whitespace-nowrap">
                      <div className="font-bold text-slate-900">{row.pengajarNama}</div>
                      <div className="text-xs text-slate-500">{row.pengajarEmail}</div>
                      {targetPengajarObj?.phone && (
                        <div className="text-[11px] text-emerald-700 font-medium">
                          WA: {targetPengajarObj.phone}
                        </div>
                      )}
                    </td>

                    <td className="px-4 py-4 whitespace-nowrap text-center text-xs font-semibold text-slate-700">
                      {row.totalSesi} Sesi
                    </td>

                    <td className="px-4 py-4 whitespace-nowrap text-center">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        {row.totalKehadiran} Sesi
                      </span>
                    </td>

                    <td className="px-4 py-4 whitespace-nowrap text-center text-xs font-bold text-indigo-700">
                      {row.totalJamMengajar} Jam
                    </td>

                    <td className="px-4 py-4 whitespace-nowrap text-center text-xs">
                      <div className="flex flex-col items-center gap-1">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                          {row.totalJurnalDiisi} Terisi
                        </span>
                        {row.totalJurnalPending > 0 && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold bg-rose-50 text-rose-700 border border-rose-200 animate-pulse">
                            {row.totalJurnalPending} Pending
                          </span>
                        )}
                      </div>
                    </td>

                    <td className="px-4 py-4 whitespace-nowrap text-center text-xs font-black text-slate-900">
                      {formatRupiah(estRowHonor)}
                    </td>

                    <td className="px-5 py-4 whitespace-nowrap text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {/* WhatsApp Pending Jurnal Reminder Button */}
                        {isAdmin && row.totalJurnalPending > 0 && (
                          <button
                            onClick={() => handleOpenWAReminder(row)}
                            title="Kirim Pengingat Jurnal via WhatsApp"
                            className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg transition-colors"
                          >
                            <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
                            <span className="hidden sm:inline">WA Reminder</span>
                          </button>
                        )}

                        {/* Slip Honor PDF / Print Button */}
                        <button
                          onClick={() => handleOpenSlip(row.pengajarId)}
                          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-lg shadow-xs transition-colors"
                          title="Generate & Cetak Slip Honor PDF"
                        >
                          <FileText className="w-3.5 h-3.5 text-amber-300" />
                          <span>Slip Honor</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Slip Honorarium Modal */}
      {selectedPengajarForSlip && (
        <SlipHonorModal
          isOpen={!!selectedPengajarForSlip}
          onClose={() => setSelectedPengajarForSlip(null)}
          pengajar={selectedPengajarForSlip}
          kelasList={kelas}
          jadwalInstances={jadwalInstances}
          absensiList={absensi}
          jurnalList={jurnal}
          periode={
            startDate && endDate
              ? `${startDate} s/d ${endDate}`
              : startDate
              ? `Mulai ${startDate}`
              : endDate
              ? `Sampai ${endDate}`
              : undefined
          }
          isAdmin={isAdmin}
        />
      )}

      {/* WhatsApp Modal for Pending Journal Reminder */}
      {waReminderTarget && (
        <WhatsAppModal
          isOpen={!!waReminderTarget}
          onClose={() => setWaReminderTarget(null)}
          recipientName={waReminderTarget.pengajar.name}
          recipientPhone={waReminderTarget.pengajar.phone}
          defaultMessage={createPendingJournalReminderMessage({
            pengajarName: waReminderTarget.pengajar.name,
            totalPending: waReminderTarget.pendingCount,
            periode: startDate && endDate ? `${startDate} s/d ${endDate}` : undefined,
          })}
          title={`Kirim Pengingat Jurnal (${waReminderTarget.pengajar.name})`}
        />
      )}
    </div>
  );
}
