'use client';
import React, { useState, useMemo } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import {
  Calendar as CalendarIcon,
  List,
  Plus,
  Search,
  Filter,
  AlertTriangle,
  Clock,
  MapPin,
  Users,
  Trash2,
  Edit2,
  UserCheck,
  CheckCircle,
  XCircle,
  Sparkles,
} from 'lucide-react';
import { Modal, ConfirmDialog } from '@/components/ui/Modal';
import { JadwalStatusBadge } from '@/components/ui/Badge';
import { useNEXSStore } from '@/lib/store';
import { JadwalPattern, JadwalInstance, JadwalConflict } from '@/lib/types';
import { useToast } from '@/components/ui/Toast';

const HARI_OPTIONS = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu'];

export default function JadwalPage() {
  const {
    currentUser,
    pengajar,
    kelas,
    ruangan,
    jadwalPatterns,
    jadwalInstances,
    checkConflict,
    addJadwalPattern,
    deleteJadwalPattern,
    cancelJadwalInstance,
    reassignPengajar,
  } = useNEXSStore();

  const isAdmin = currentUser?.role === 'ADMIN';

  // State
  const [activeTab, setActiveTab] = useState<'calendar' | 'table'>('table');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterPengajarId, setFilterPengajarId] = useState(
    isAdmin ? '' : currentUser?.id || ''
  );
  const [filterKelasId, setFilterKelasId] = useState('');
  const [filterRuanganId, setFilterRuanganId] = useState('');
  const [filterDate, setFilterDate] = useState('');

  // Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [conflicts, setConflicts] = useState<JadwalConflict[]>([]);
  const [isConflictWarningOpen, setIsConflictWarningOpen] = useState(false);

  // Form State
  const [formPengajarId, setFormPengajarId] = useState('');
  const [formKelasId, setFormKelasId] = useState('');
  const [formRuanganId, setFormRuanganId] = useState('');
  const [formHari, setFormHari] = useState<string[]>(['Senin', 'Rabu']);
  const [formJamMulai, setFormJamMulai] = useState('08:00');
  const [formJamSelesai, setFormJamSelesai] = useState('10:00');
  const [formTanggalMulai, setFormTanggalMulai] = useState(
    new Date().toISOString().split('T')[0]
  );
  const [formTanggalSelesai, setFormTanggalSelesai] = useState(
    new Date(new Date().setMonth(new Date().getMonth() + 2))
      .toISOString()
      .split('T')[0]
  );
  const [formTipe, setFormTipe] = useState<'BERULANG' | 'SEKALI'>('BERULANG');

  // Action targets
  const [reassignTarget, setReassignTarget] = useState<JadwalInstance | null>(null);
  const [newPengajarForReassign, setNewPengajarForReassign] = useState('');
  const [cancelTargetId, setCancelTargetId] = useState<string | null>(null);

  // Filter instances based on permissions and filters
  const filteredInstances = useMemo(() => {
    let list = [...jadwalInstances];

    // Role check: Pengajar only sees their own
    if (!isAdmin) {
      list = list.filter((i) => i.pengajarId === currentUser?.id);
    } else if (filterPengajarId) {
      list = list.filter((i) => i.pengajarId === filterPengajarId);
    }

    if (filterKelasId) {
      list = list.filter((i) => i.kelasId === filterKelasId);
    }

    if (filterRuanganId) {
      list = list.filter((i) => i.ruanganId === filterRuanganId);
    }

    if (filterDate) {
      list = list.filter((i) => i.tanggal === filterDate);
    }

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      list = list.filter((i) => {
        const k = kelas.find((kl) => kl.id === i.kelasId)?.nama.toLowerCase() || '';
        const p = pengajar.find((pl) => pl.id === i.pengajarId)?.name.toLowerCase() || '';
        const r = ruangan.find((rl) => rl.id === i.ruanganId)?.nama.toLowerCase() || '';
        return k.includes(q) || p.includes(q) || r.includes(q) || i.tanggal.includes(q);
      });
    }

    return list.sort((a, b) => {
      const dateCmp = a.tanggal.localeCompare(b.tanggal);
      return dateCmp !== 0 ? dateCmp : a.jamMulai.localeCompare(b.jamMulai);
    });
  }, [
    jadwalInstances,
    isAdmin,
    currentUser,
    filterPengajarId,
    filterKelasId,
    filterRuanganId,
    filterDate,
    searchQuery,
    kelas,
    pengajar,
    ruangan,
  ]);

  // FullCalendar Events format
  const calendarEvents = useMemo(() => {
    return filteredInstances.map((inst) => {
      const k = kelas.find((kl) => kl.id === inst.kelasId);
      const p = pengajar.find((pl) => pl.id === inst.pengajarId);
      const r = ruangan.find((rl) => rl.id === inst.ruanganId);

      const color =
        inst.status === 'SELESAI'
          ? '#10b981'
          : inst.status === 'MENGAJAR'
          ? '#4f46e5'
          : inst.status === 'DIBATALKAN'
          ? '#ef4444'
          : '#6366f1';

      return {
        id: inst.id,
        title: `${k?.nama || 'Kelas'} (${p?.name?.split(' ')[0] || ''})`,
        start: `${inst.tanggal}T${inst.jamMulai}:00`,
        end: `${inst.tanggal}T${inst.jamSelesai}:00`,
        backgroundColor: color,
        borderColor: color,
        extendedProps: {
          ruangan: r?.nama,
          status: inst.status,
          pengajar: p?.name,
          kelas: k?.nama,
        },
      };
    });
  }, [filteredInstances, kelas, pengajar, ruangan]);

  // Day selection toggle
  const toggleHari = (day: string) => {
    if (formHari.includes(day)) {
      if (formHari.length > 1) {
        setFormHari(formHari.filter((d) => d !== day));
      }
    } else {
      setFormHari([...formHari, day]);
    }
  };

  const toast = useToast();

  // Submit new schedule with conflict prevention
  const handleSaveJadwal = (forceBypass = false) => {
    if (!formPengajarId || !formKelasId || !formRuanganId) {
      toast.warning('Form Belum Lengkap', 'Mohon pilih Pengajar, Kelas, dan Ruangan.');
      return;
    }

    if (formJamMulai >= formJamSelesai) {
      toast.error('Jam Tidak Valid', 'Jam selesai harus lebih akhir daripada jam mulai.');
      return;
    }

    const payload = {
      pengajarId: formPengajarId,
      kelasId: formKelasId,
      ruanganId: formRuanganId,
      hari: formTipe === 'SEKALI' ? [] : formHari,
      jamMulai: formJamMulai,
      jamSelesai: formJamSelesai,
      tanggalMulai: formTanggalMulai,
      tanggalSelesai: formTipe === 'SEKALI' ? formTanggalMulai : formTanggalSelesai,
      tipe: formTipe,
    };

    if (!forceBypass) {
      const detectedConflicts = checkConflict(payload);
      if (detectedConflicts.length > 0) {
        setConflicts(detectedConflicts);
        setIsConflictWarningOpen(true);
        return;
      }
    }

    addJadwalPattern({
      ...payload,
      status: 'AKTIF',
    });

    setIsAddModalOpen(false);
    setIsConflictWarningOpen(false);
    toast.success('Jadwal Berhasil Dibuat', 'Pola jadwal dan seluruh sesi telah di-generate otomatis.');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900">
            Jadwal Mengajar
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            {isAdmin
              ? 'Kelola pola jadwal berulang, cegah bentrok ruangan/pengajar, dan atur penugasan kelas.'
              : 'Jadwal kelas yang ditugaskan kepada Anda.'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Tab view switcher */}
          <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200">
            <button
              onClick={() => setActiveTab('table')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                activeTab === 'table'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <List className="w-3.5 h-3.5" />
              Tabel
            </button>
            <button
              onClick={() => setActiveTab('calendar')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                activeTab === 'calendar'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <CalendarIcon className="w-3.5 h-3.5" />
              Kalender
            </button>
          </div>

          {/* Add schedule button (Admin only) */}
          {isAdmin && (
            <button
              onClick={() => {
                setFormPengajarId(pengajar[0]?.id || '');
                setFormKelasId(kelas[0]?.id || '');
                setFormRuanganId(ruangan[0]?.id || '');
                setIsAddModalOpen(true);
              }}
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Tambah Jadwal</span>
            </button>
          )}
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
              placeholder="Cari kelas / ruangan..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-indigo-600"
            />
          </div>

          {/* Filter Pengajar (Admin only) */}
          {isAdmin && (
            <div>
              <select
                value={filterPengajarId}
                onChange={(e) => setFilterPengajarId(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-indigo-600 text-slate-700 font-medium"
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

          {/* Filter Kelas */}
          <div>
            <select
              value={filterKelasId}
              onChange={(e) => setFilterKelasId(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-indigo-600 text-slate-700 font-medium"
            >
              <option value="">Semua Kelas</option>
              {kelas.map((k) => (
                <option key={k.id} value={k.id}>
                  {k.nama}
                </option>
              ))}
            </select>
          </div>

          {/* Filter Ruangan */}
          <div>
            <select
              value={filterRuanganId}
              onChange={(e) => setFilterRuanganId(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-indigo-600 text-slate-700 font-medium"
            >
              <option value="">Semua Ruangan</option>
              {ruangan.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.nama}
                </option>
              ))}
            </select>
          </div>

          {/* Filter Tanggal */}
          <div>
            <input
              type="date"
              value={filterDate}
              onChange={(e) => setFilterDate(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-indigo-600 text-slate-700 font-medium"
            />
          </div>
        </div>

        {/* Active filter count & reset */}
        {(searchQuery || filterPengajarId || filterKelasId || filterRuanganId || filterDate) && (
          <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100">
            <span>Menampilkan {filteredInstances.length} hasil jadwal</span>
            <button
              onClick={() => {
                setSearchQuery('');
                setFilterPengajarId(isAdmin ? '' : currentUser?.id || '');
                setFilterKelasId('');
                setFilterRuanganId('');
                setFilterDate('');
              }}
              className="text-indigo-600 hover:text-indigo-800 font-semibold"
            >
              Reset Filter
            </button>
          </div>
        )}
      </div>

      {/* Main View: Calendar or Table */}
      {activeTab === 'calendar' ? (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
          <FullCalendar
            plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
            initialView="dayGridMonth"
            headerToolbar={{
              left: 'prev,next today',
              center: 'title',
              right: 'dayGridMonth,timeGridWeek,timeGridDay',
            }}
            events={calendarEvents}
            eventTimeFormat={{
              hour: '2-digit',
              minute: '2-digit',
              hour12: false,
            }}
            height="auto"
            eventClick={(info) => {
              const item = jadwalInstances.find((i) => i.id === info.event.id);
              if (item) {
                alert(
                  `Detail Jadwal:\nKelas: ${info.event.extendedProps.kelas}\nPengajar: ${info.event.extendedProps.pengajar}\nRuangan: ${info.event.extendedProps.ruangan}\nJam: ${item.jamMulai} - ${item.jamSelesai}\nStatus: ${item.status}`
                );
              }
            }}
          />
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
          {filteredInstances.length === 0 ? (
            <div className="p-12 text-center">
              <CalendarIcon className="w-10 h-10 text-slate-300 mx-auto mb-2" />
              <p className="text-sm font-semibold text-slate-700">Tidak ada jadwal ditemukan</p>
              <p className="text-xs text-slate-400 mt-0.5">Coba ubah filter atau kata kunci pencarian Anda.</p>
            </div>
          ) : (
            <>
              {/* Mobile Cards View (Visible on mobile) */}
              <div className="block lg:hidden divide-y divide-slate-100">
                {filteredInstances.map((item) => {
                  const targetKelas = kelas.find((k) => k.id === item.kelasId);
                  const targetPengajar = pengajar.find((p) => p.id === item.pengajarId);
                  const targetRuangan = ruangan.find((r) => r.id === item.ruanganId);

                  return (
                    <div key={item.id} className="p-4 space-y-3 bg-white">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-lg border border-indigo-200/60">
                          <Clock className="w-3.5 h-3.5" />
                          <span>{item.jamMulai} – {item.jamSelesai}</span>
                        </div>
                        <span className="text-xs text-slate-500 font-semibold">{item.tanggal} ({item.hari})</span>
                      </div>

                      <div>
                        <h3 className="text-base font-bold text-slate-900 leading-snug">
                          {targetKelas?.nama || '—'}
                        </h3>
                        <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
                          <div className="flex items-center gap-1">
                            <MapPin className="w-3.5 h-3.5 text-slate-400" />
                            <span>{targetRuangan?.nama || '—'}</span>
                          </div>
                          {isAdmin && (
                            <>
                              <span>•</span>
                              <span className="font-semibold text-slate-700">Sensei: {targetPengajar?.name}</span>
                            </>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-1">
                        <JadwalStatusBadge status={item.status} />

                        {isAdmin && (
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => {
                                setReassignTarget(item);
                                setNewPengajarForReassign(item.pengajarId);
                              }}
                              className="px-2.5 py-1 text-xs font-semibold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-lg"
                            >
                              Ganti Sensei
                            </button>
                            {item.status !== 'DIBATALKAN' && item.status !== 'SELESAI' && (
                              <button
                                onClick={() => setCancelTargetId(item.id)}
                                className="px-2.5 py-1 text-xs font-semibold text-rose-600 bg-rose-50 hover:bg-rose-100 rounded-lg"
                              >
                                Batalkan
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Desktop Table View (Hidden on mobile) */}
              <div className="hidden lg:block overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-50 border-b border-slate-200/80 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    <tr>
                      <th className="px-6 py-3.5">Tanggal / Hari</th>
                      <th className="px-6 py-3.5">Jam</th>
                      <th className="px-6 py-3.5">Kelas</th>
                      {isAdmin && <th className="px-6 py-3.5">Pengajar</th>}
                      <th className="px-6 py-3.5">Ruangan</th>
                      <th className="px-6 py-3.5">Status</th>
                      {isAdmin && <th className="px-6 py-3.5 text-right">Aksi</th>}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredInstances.map((item) => {
                      const targetKelas = kelas.find((k) => k.id === item.kelasId);
                      const targetPengajar = pengajar.find((p) => p.id === item.pengajarId);
                      const targetRuangan = ruangan.find((r) => r.id === item.ruanganId);

                      return (
                        <tr key={item.id} className="hover:bg-slate-50/70 transition-colors">
                          {/* Tanggal / Hari */}
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="font-semibold text-slate-900">{item.tanggal}</div>
                            <div className="text-xs text-slate-500">{item.hari}</div>
                          </td>

                          {/* Jam */}
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center gap-1.5 text-xs font-semibold text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-md border border-indigo-200/50 w-fit">
                              <Clock className="w-3.5 h-3.5" />
                              <span>
                                {item.jamMulai} – {item.jamSelesai}
                              </span>
                            </div>
                          </td>

                          {/* Kelas */}
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="font-bold text-slate-900">{targetKelas?.nama || '—'}</div>
                            <div className="text-xs text-slate-500">Program: {targetKelas?.program}</div>
                          </td>

                          {/* Pengajar */}
                          {isAdmin && (
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="font-medium text-slate-800 flex items-center gap-2">
                                <span>{targetPengajar?.name || '—'}</span>
                              </div>
                            </td>
                          )}

                          {/* Ruangan */}
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center gap-1 text-slate-600 text-xs font-medium">
                              <MapPin className="w-3.5 h-3.5 text-slate-400" />
                              <span>{targetRuangan?.nama || '—'}</span>
                            </div>
                          </td>

                          {/* Status */}
                          <td className="px-6 py-4 whitespace-nowrap">
                            <JadwalStatusBadge status={item.status} />
                          </td>

                          {/* Aksi (Admin only) */}
                          {isAdmin && (
                            <td className="px-6 py-4 whitespace-nowrap text-right">
                              <div className="flex items-center justify-end gap-1.5">
                                {/* Reassign Pengajar */}
                                <button
                                  onClick={() => {
                                    setReassignTarget(item);
                                    setNewPengajarForReassign(item.pengajarId);
                                  }}
                                  title="Ganti Pengajar"
                                  className="p-1.5 text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                                >
                                  <UserCheck className="w-4 h-4" />
                                </button>

                                {/* Batalkan Sesi */}
                                {item.status !== 'DIBATALKAN' && item.status !== 'SELESAI' && (
                                  <button
                                    onClick={() => setCancelTargetId(item.id)}
                                    title="Batalkan Sesi"
                                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                                  >
                                    <XCircle className="w-4 h-4" />
                                  </button>
                                )}
                              </div>
                            </td>
                          )}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      )}

      {/* Modal: Tambah Jadwal Berulang */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Buat Jadwal Mengajar Baru"
        subtitle="Mendukung jadwal berulang otomatis & sistem pencegahan bentrok."
        maxWidth="xl"
      >
        <div className="space-y-4">
          {/* Tipe Jadwal */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Tipe Jadwal
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setFormTipe('BERULANG')}
                className={`py-2 px-3 text-xs font-semibold rounded-lg border text-center transition-all ${
                  formTipe === 'BERULANG'
                    ? 'bg-indigo-50 text-indigo-700 border-indigo-600 ring-2 ring-indigo-600/20'
                    : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                }`}
              >
                🔄 Jadwal Berulang (Pola Mingguan)
              </button>
              <button
                type="button"
                onClick={() => setFormTipe('SEKALI')}
                className={`py-2 px-3 text-xs font-semibold rounded-lg border text-center transition-all ${
                  formTipe === 'SEKALI'
                    ? 'bg-indigo-50 text-indigo-700 border-indigo-600 ring-2 ring-indigo-600/20'
                    : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                }`}
              >
                📅 Jadwal Sekali (1 Hari Saja)
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Pengajar */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Pengajar (Sensei) <span className="text-rose-500">*</span>
              </label>
              <select
                value={formPengajarId}
                onChange={(e) => setFormPengajarId(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-600"
              >
                {pengajar.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Kelas */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Kelas <span className="text-rose-500">*</span>
              </label>
              <select
                value={formKelasId}
                onChange={(e) => setFormKelasId(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-600"
              >
                {kelas.map((k) => (
                  <option key={k.id} value={k.id}>
                    {k.nama} ({k.level})
                  </option>
                ))}
              </select>
            </div>

            {/* Ruangan */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Ruangan <span className="text-rose-500">*</span>
              </label>
              <select
                value={formRuanganId}
                onChange={(e) => setFormRuanganId(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-600"
              >
                {ruangan.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.nama} (Kapasitas: {r.kapasitas})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Hari (If recurring) */}
          {formTipe === 'BERULANG' && (
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Hari Mengajar <span className="text-rose-500">*</span>
              </label>
              <div className="flex flex-wrap gap-1.5">
                {HARI_OPTIONS.map((day) => {
                  const isSelected = formHari.includes(day);
                  return (
                    <button
                      key={day}
                      type="button"
                      onClick={() => toggleHari(day)}
                      className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-colors ${
                        isSelected
                          ? 'bg-indigo-600 text-white border-indigo-600'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {day}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Jam Mulai & Jam Selesai */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Jam Mulai
              </label>
              <input
                type="time"
                value={formJamMulai}
                onChange={(e) => setFormJamMulai(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-600"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Jam Selesai
              </label>
              <input
                type="time"
                value={formJamSelesai}
                onChange={(e) => setFormJamSelesai(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-600"
              />
            </div>
          </div>

          {/* Periode Tanggal */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                {formTipe === 'BERULANG' ? 'Tanggal Mulai Periode' : 'Tanggal Pelaksanaan'}
              </label>
              <input
                type="date"
                value={formTanggalMulai}
                onChange={(e) => setFormTanggalMulai(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-600"
              />
            </div>
            {formTipe === 'BERULANG' && (
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Tanggal Selesai Periode
                </label>
                <input
                  type="date"
                  value={formTanggalSelesai}
                  onChange={(e) => setFormTanggalSelesai(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-600"
                />
              </div>
            )}
          </div>

          {/* Save Action */}
          <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsAddModalOpen(false)}
              className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg"
            >
              Batal
            </button>
            <button
              type="button"
              onClick={() => handleSaveJadwal(false)}
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-xs"
            >
              <CheckCircle className="w-4 h-4" />
              Simpan & Generate Jadwal
            </button>
          </div>
        </div>
      </Modal>

      {/* Modal: Deteksi Bentrok Jadwal (Pencegahan Bentrok) */}
      <Modal
        isOpen={isConflictWarningOpen}
        onClose={() => setIsConflictWarningOpen(false)}
        title="⚠️ Peringatan: Terdeteksi Jadwal Bentrok!"
        subtitle="Sistem mendeteksi jadwal yang bertabrakan dengan jadwal yang sudah ada."
        maxWidth="md"
      >
        <div className="space-y-4">
          <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl space-y-2">
            <div className="flex items-center gap-2 text-rose-800 font-bold text-xs">
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>Detail Jadwal Bentrok:</span>
            </div>
            <ul className="text-xs text-rose-700 space-y-1.5 pl-6 list-disc">
              {conflicts.slice(0, 5).map((cf, idx) => (
                <li key={idx}>
                  <span className="font-semibold capitalize">{cf.type}:</span>{' '}
                  <span className="font-bold">{cf.targetName}</span> pada{' '}
                  <span className="underline">{cf.tanggal}</span> jam{' '}
                  <span className="font-bold">{cf.jamBaru}</span> (Sudah ada:{' '}
                  {cf.jamEksisting} {cf.kelasEksisting ? `di ${cf.kelasEksisting}` : ''})
                </li>
              ))}
              {conflicts.length > 5 && (
                <li className="italic">
                  ...dan {conflicts.length - 5} bentrok lainnya pada periode ini.
                </li>
              )}
            </ul>
          </div>

          <p className="text-xs text-slate-600">
            Sebaiknya ubah jam atau hari jadwal untuk menghindari tabrakan jadwal mengajar atau ruangan.
          </p>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsConflictWarningOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg"
            >
              Kembali & Ubah Jadwal
            </button>
            <button
              type="button"
              onClick={() => handleSaveJadwal(true)}
              className="px-4 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-lg shadow-xs"
            >
              Tetap Simpan (Paksa)
            </button>
          </div>
        </div>
      </Modal>

      {/* Modal: Ganti Pengajar (Reassign) */}
      <Modal
        isOpen={!!reassignTarget}
        onClose={() => setReassignTarget(null)}
        title="Ganti Pengajar untuk Sesi Ini"
        subtitle={`Sesi: ${reassignTarget?.tanggal} (${reassignTarget?.jamMulai} - ${reassignTarget?.jamSelesai})`}
        maxWidth="sm"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Pilih Pengajar Pengganti
            </label>
            <select
              value={newPengajarForReassign}
              onChange={(e) => setNewPengajarForReassign(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-600"
            >
              {pengajar.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              onClick={() => setReassignTarget(null)}
              className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-lg"
            >
              Batal
            </button>
            <button
              onClick={() => {
                if (reassignTarget && newPengajarForReassign) {
                  reassignPengajar(reassignTarget.id, newPengajarForReassign);
                  setReassignTarget(null);
                  toast.success('Pengajar Berhasil Diganti', 'Sesi ini telah dialihkan ke pengajar baru.');
                }
              }}
              className="px-3.5 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg"
            >
              Simpan Pengajar
            </button>
          </div>
        </div>
      </Modal>

      {/* Confirm Dialog: Batalkan Sesi */}
      <ConfirmDialog
        isOpen={!!cancelTargetId}
        onClose={() => setCancelTargetId(null)}
        onConfirm={() => {
          if (cancelTargetId) {
            cancelJadwalInstance(cancelTargetId);
          }
        }}
        title="Batalkan Sesi Jadwal?"
        message="Sesi ini akan ditandai sebagai 'DIBATALKAN'. Status absensi terkait juga akan dibatalkan."
        confirmLabel="Ya, Batalkan Sesi"
        isDestructive
      />
    </div>
  );
}
