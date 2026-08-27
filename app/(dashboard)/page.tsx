'use client';
import React, { useState } from 'react';
import {
  Users,
  GraduationCap,
  Calendar,
  Radio,
  AlertCircle,
  Play,
  Square,
  FileEdit,
  Clock,
  MapPin,
  CheckCircle,
  Sparkles,
} from 'lucide-react';
import { StatCard } from '@/components/ui/StatCard';
import {
  JadwalStatusBadge,
  AbsensiStatusBadge,
  JurnalStatusBadge,
} from '@/components/ui/Badge';
import { useNEXSStore } from '@/lib/store';
import { JadwalInstance } from '@/lib/types';
import { JurnalFormModal } from '@/components/jurnal/JurnalFormModal';
import { useToast } from '@/components/ui/Toast';

export default function DashboardPage() {
  const toast = useToast();
  const {
    currentUser,
    pengajar,
    kelas,
    ruangan,
    absensi,
    jurnal,
    getStats,
    getTodaySchedule,
    startTeaching,
    finishTeaching,
  } = useNEXSStore();

  const [selectedJadwalForJurnal, setSelectedJadwalForJurnal] =
    useState<JadwalInstance | null>(null);

  const stats = getStats();
  const isAdmin = currentUser?.role === 'ADMIN';
  const todaySchedules = getTodaySchedule(
    isAdmin ? undefined : currentUser?.id
  );

  const handleStartTeaching = (id: string) => {
    startTeaching(id);
    toast.success('Sesi Mengajar Dimulai', 'Timer absensi mengajar telah aktif secara realtime.');
  };

  const handleFinishTeaching = (id: string) => {
    finishTeaching(id);
    toast.info('Sesi Mengajar Selesai', 'Waktu selesai telah dicatat. Jangan lupa mengisi jurnal mengajar.');
  };

  return (
    <div className="space-y-5 sm:space-y-6">
      {/* 5 Key Metric Stat Cards (2 columns on mobile, 5 on desktop) */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
        <StatCard
          title="Pengajar"
          value={stats.totalPengajar}
          icon={Users}
          description="Sensei aktif"
          iconBgColor="bg-blue-50"
          iconColor="text-blue-600"
        />
        <StatCard
          title="Kelas Aktif"
          value={stats.totalKelasAktif}
          icon={GraduationCap}
          description="Program berjalan"
          iconBgColor="bg-emerald-50"
          iconColor="text-emerald-600"
        />
        <StatCard
          title="Jadwal Hari Ini"
          value={stats.jadwalHariIni}
          icon={Calendar}
          description="Sesi terjadwal"
          iconBgColor="bg-indigo-50"
          iconColor="text-indigo-600"
        />
        <StatCard
          title="Sedang Mengajar"
          value={stats.pengajarSedangMengajar}
          icon={Radio}
          description="Sesi aktif di kelas"
          badgeText={stats.pengajarSedangMengajar > 0 ? 'Live Now' : undefined}
          badgeType="warning"
          iconBgColor="bg-amber-50"
          iconColor="text-amber-600"
        />
        <div className="col-span-2 lg:col-span-1">
          <StatCard
            title="Jurnal Belum Diisi"
            value={stats.jurnalBelumDiisi}
            icon={AlertCircle}
            description="Perlu ditindaklanjuti"
            badgeText={stats.jurnalBelumDiisi > 0 ? 'Perlu Diisi' : 'Lengkap'}
            badgeType={stats.jurnalBelumDiisi > 0 ? 'danger' : 'success'}
            iconBgColor="bg-rose-50"
            iconColor="text-rose-600"
          />
        </div>
      </div>

      {/* Section: Jadwal Hari Ini */}
      <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div>
            <h2 className="text-sm sm:text-base font-bold text-slate-900">
              Jadwal Hari Ini
            </h2>
            <p className="text-[11px] sm:text-xs text-slate-500 mt-0.5">
              {new Date().toLocaleDateString('id-ID', {
                weekday: 'long',
                day: 'numeric',
                month: 'long',
                year: 'numeric',
              })}
            </p>
          </div>

          <div className="text-[11px] sm:text-xs text-slate-600 font-bold flex items-center gap-1.5 bg-white px-2.5 py-1 rounded-xl border border-slate-200 shadow-2xs">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            {todaySchedules.length} Sesi
          </div>
        </div>

        {todaySchedules.length === 0 ? (
          <div className="p-10 sm:p-12 text-center">
            <div className="mx-auto w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400 mb-3">
              <Calendar className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-semibold text-slate-800">
              Tidak ada jadwal mengajar hari ini
            </h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              Semua kelas libur atau jadwal telah selesai untuk hari ini.
            </p>
          </div>
        ) : (
          <>
            {/* Mobile-Optimized Big Cards View (Visible on mobile screens) */}
            <div className="block lg:hidden divide-y divide-slate-100">
              {todaySchedules.map((item) => {
                const targetPengajar = pengajar.find(
                  (p) => p.id === item.pengajarId
                );
                const targetKelas = kelas.find((k) => k.id === item.kelasId);
                const targetRuangan = ruangan.find(
                  (r) => r.id === item.ruanganId
                );
                const targetAbsensi = absensi.find(
                  (a) => a.jadwalInstanceId === item.id
                );
                const targetJurnal = jurnal.find(
                  (j) => j.jadwalInstanceId === item.id
                );

                return (
                  <div key={item.id} className="p-4 space-y-3 bg-white hover:bg-slate-50/50 transition-colors">
                    {/* Header: Jam & Ruangan */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-lg border border-indigo-200/60">
                        <Clock className="w-3.5 h-3.5" />
                        <span>{item.jamMulai} – {item.jamSelesai}</span>
                      </div>
                      <div className="flex items-center gap-1 text-xs text-slate-600 font-medium">
                        <MapPin className="w-3.5 h-3.5 text-slate-400" />
                        <span>{targetRuangan?.nama || '—'}</span>
                      </div>
                    </div>

                    {/* Class & Sensei Info */}
                    <div>
                      <h3 className="text-base font-bold text-slate-900 leading-snug">
                        {targetKelas?.nama || '—'}
                      </h3>
                      <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
                        <span>Level: {targetKelas?.level}</span>
                        {isAdmin && (
                          <>
                            <span>•</span>
                            <span className="font-semibold text-slate-700">Sensei: {targetPengajar?.name}</span>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Status Badges */}
                    <div className="flex flex-wrap items-center gap-2 pt-1">
                      <JadwalStatusBadge status={item.status} />
                      <AbsensiStatusBadge status={targetAbsensi?.status} />
                      <JurnalStatusBadge status={targetJurnal?.status} />
                    </div>

                    {/* Big Thumb-Friendly Action Button */}
                    <div className="pt-2">
                      {item.status === 'AKTIF' && (
                        <button
                          onClick={() => handleStartTeaching(item.id)}
                          className="w-full flex items-center justify-center gap-2 py-3 px-4 text-xs font-bold text-white bg-indigo-600 active:bg-indigo-700 rounded-xl shadow-md shadow-indigo-600/30 transition-transform active:scale-[0.98]"
                        >
                          <Play className="w-4 h-4 fill-current" />
                          <span>MULAI MENGAJAR</span>
                        </button>
                      )}

                      {item.status === 'MENGAJAR' && (
                        <button
                          onClick={() => handleFinishTeaching(item.id)}
                          className="w-full flex items-center justify-center gap-2 py-3 px-4 text-xs font-bold text-white bg-amber-600 active:bg-amber-700 rounded-xl shadow-md shadow-amber-600/30 transition-transform active:scale-[0.98] animate-pulse"
                        >
                          <Square className="w-4 h-4 fill-current" />
                          <span>SELESAI MENGAJAR</span>
                        </button>
                      )}

                      {item.status === 'SELESAI' && (
                        <button
                          onClick={() => setSelectedJadwalForJurnal(item)}
                          className={`w-full flex items-center justify-center gap-2 py-3 px-4 text-xs font-bold rounded-xl shadow-xs transition-transform active:scale-[0.98] ${
                            targetJurnal?.status === 'DIISI' ||
                            targetJurnal?.status === 'DIREVIEW'
                              ? 'text-slate-700 bg-slate-100 active:bg-slate-200 border border-slate-300'
                              : 'text-white bg-emerald-600 active:bg-emerald-700 shadow-emerald-600/20'
                          }`}
                        >
                          <FileEdit className="w-4 h-4" />
                          <span>
                            {targetJurnal?.status === 'DIISI' ||
                            targetJurnal?.status === 'DIREVIEW'
                              ? 'Edit Jurnal Mengajar'
                              : 'ISI JURNAL MENGAJAR'}
                          </span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Desktop Table View (Full width, No horizontal scroll) */}
            <div className="hidden lg:block w-full">
              <table className="w-full text-left text-sm table-auto">
                <thead className="bg-slate-50 border-b border-slate-200/80 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  <tr>
                    <th className="px-4 py-3.5">Jam</th>
                    <th className="px-4 py-3.5">Kelas</th>
                    {isAdmin && <th className="px-4 py-3.5">Pengajar</th>}
                    <th className="px-4 py-3.5">Ruangan</th>
                    <th className="px-3 py-3.5 text-center">Status</th>
                    <th className="px-3 py-3.5 text-center">Status Absensi</th>
                    <th className="px-3 py-3.5 text-center">Status Jurnal</th>
                    <th className="px-4 py-3.5 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {todaySchedules.map((item) => {
                    const targetPengajar = pengajar.find(
                      (p) => p.id === item.pengajarId
                    );
                    const targetKelas = kelas.find((k) => k.id === item.kelasId);
                    const targetRuangan = ruangan.find(
                      (r) => r.id === item.ruanganId
                    );
                    const targetAbsensi = absensi.find(
                      (a) => a.jadwalInstanceId === item.id
                    );
                    const targetJurnal = jurnal.find(
                      (j) => j.jadwalInstanceId === item.id
                    );

                    return (
                      <tr
                        key={item.id}
                        className="hover:bg-slate-50/70 transition-colors"
                      >
                        {/* Jam */}
                        <td className="px-4 py-3.5 whitespace-nowrap">
                          <div className="flex items-center gap-1.5 font-bold text-slate-900 text-xs">
                            <Clock className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                            <span>
                              {item.jamMulai} – {item.jamSelesai}
                            </span>
                          </div>
                        </td>

                        {/* Kelas */}
                        <td className="px-4 py-3.5">
                          <div className="font-bold text-slate-900 text-sm">
                            {targetKelas?.nama || '—'}
                          </div>
                          <div className="text-[11px] text-slate-500">
                            Level: {targetKelas?.level || '—'}
                          </div>
                        </td>

                        {/* Pengajar (Admin only) */}
                        {isAdmin && (
                          <td className="px-4 py-3.5 whitespace-nowrap">
                            <div className="flex items-center gap-2 font-medium text-slate-800 text-xs">
                              <div className="w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center text-[10px] font-bold text-slate-700 shrink-0">
                                {targetPengajar?.name?.slice(0, 1)}
                              </div>
                              <span>{targetPengajar?.name || '—'}</span>
                            </div>
                          </td>
                        )}

                        {/* Ruangan */}
                        <td className="px-4 py-3.5 whitespace-nowrap text-slate-600 text-xs">
                          <div className="flex items-center gap-1.5">
                            <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            <span>{targetRuangan?.nama || '—'}</span>
                          </div>
                        </td>

                        {/* Status */}
                        <td className="px-3 py-3.5 text-center whitespace-nowrap">
                          <JadwalStatusBadge status={item.status} />
                        </td>

                        {/* Absensi */}
                        <td className="px-3 py-3.5 text-center whitespace-nowrap">
                          <AbsensiStatusBadge status={targetAbsensi?.status} />
                          {targetAbsensi?.jamMulaiAktual && (
                            <div className="text-[10px] text-slate-500 mt-0.5">
                              {targetAbsensi.jamMulaiAktual}
                              {targetAbsensi.jamSelesaiAktual &&
                                ` - ${targetAbsensi.jamSelesaiAktual}`}
                            </div>
                          )}
                        </td>

                        {/* Jurnal */}
                        <td className="px-3 py-3.5 text-center whitespace-nowrap">
                          <JurnalStatusBadge status={targetJurnal?.status} />
                        </td>

                        {/* Action buttons */}
                        <td className="px-4 py-3.5 whitespace-nowrap text-right">
                          {item.status === 'AKTIF' && (
                            <button
                              onClick={() => handleStartTeaching(item.id)}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-xs transition-colors"
                            >
                              <Play className="w-3.5 h-3.5 fill-current" />
                              <span>Mulai Mengajar</span>
                            </button>
                          )}

                          {item.status === 'MENGAJAR' && (
                            <button
                              onClick={() => handleFinishTeaching(item.id)}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-white bg-amber-600 hover:bg-amber-700 rounded-lg shadow-xs transition-colors animate-pulse"
                            >
                              <Square className="w-3.5 h-3.5 fill-current" />
                              <span>Selesai Mengajar</span>
                            </button>
                          )}

                          {item.status === 'SELESAI' && (
                            <button
                              onClick={() => setSelectedJadwalForJurnal(item)}
                              className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg shadow-xs transition-colors ${
                                targetJurnal?.status === 'DIISI' ||
                                targetJurnal?.status === 'DIREVIEW'
                                  ? 'text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-300'
                                  : 'text-white bg-emerald-600 hover:bg-emerald-700'
                              }`}
                            >
                              <FileEdit className="w-3.5 h-3.5" />
                              <span>
                                {targetJurnal?.status === 'DIISI' ||
                                targetJurnal?.status === 'DIREVIEW'
                                  ? 'Edit Jurnal'
                                  : 'Isi Jurnal'}
                              </span>
                            </button>
                          )}

                          {item.status === 'DIBATALKAN' && (
                            <span className="text-xs text-slate-400 italic">
                              Dibatalkan
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>

      {/* Jurnal Modal Dialog */}
      <JurnalFormModal
        isOpen={!!selectedJadwalForJurnal}
        onClose={() => setSelectedJadwalForJurnal(null)}
        jadwalInstance={selectedJadwalForJurnal}
      />
    </div>
  );
}
