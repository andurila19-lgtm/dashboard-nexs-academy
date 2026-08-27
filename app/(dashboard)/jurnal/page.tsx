'use client';
import React, { useState, useMemo } from 'react';
import {
  BookOpen,
  Search,
  CheckCircle,
  FileEdit,
  Clock,
  Eye,
  AlertCircle,
  Sparkles,
  Users,
  Check,
} from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { JurnalStatusBadge } from '@/components/ui/Badge';
import { useNEXSStore } from '@/lib/store';
import { JadwalInstance, Jurnal } from '@/lib/types';
import { JurnalFormModal } from '@/components/jurnal/JurnalFormModal';
import { useToast } from '@/components/ui/Toast';

export default function JurnalPage() {
  const toast = useToast();
  const {
    currentUser,
    pengajar,
    kelas,
    jadwalInstances,
    jurnal,
    reviewJurnal,
  } = useNEXSStore();

  const isAdmin = currentUser?.role === 'ADMIN';

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [filterPengajarId, setFilterPengajarId] = useState(
    isAdmin ? '' : currentUser?.id || ''
  );
  const [filterKelasId, setFilterKelasId] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  // Modals
  const [selectedJadwalForForm, setSelectedJadwalForForm] =
    useState<JadwalInstance | null>(null);
  const [selectedJurnalForDetail, setSelectedJurnalForDetail] =
    useState<Jurnal | null>(null);

  // Combined journal entries for all completed/active schedule sessions
  const journalEntries = useMemo(() => {
    // Only completed sessions or sessions with journal are displayed
    let list = jadwalInstances
      .filter((i) => i.status === 'SELESAI' || jurnal.some((j) => j.jadwalInstanceId === i.id))
      .map((inst) => {
        const j = jurnal.find((item) => item.jadwalInstanceId === inst.id);
        const targetPengajar = pengajar.find((p) => p.id === inst.pengajarId);
        const targetKelas = kelas.find((k) => k.id === inst.kelasId);

        return {
          instance: inst,
          jurnal: j,
          tanggal: inst.tanggal,
          jam: `${inst.jamMulai} - ${inst.jamSelesai}`,
          pengajarId: inst.pengajarId,
          pengajarNama: targetPengajar?.name || '—',
          kelasId: inst.kelasId,
          kelasNama: targetKelas?.nama || '—',
          program: targetKelas?.program || '—',
          materi: j?.materi || '—',
          aktivitas: j?.aktivitas || '—',
          jumlahSiswa: j?.jumlahSiswaHadir || 0,
          status: j?.status || 'BELUM_DIISI',
        };
      });

    if (!isAdmin) {
      list = list.filter((item) => item.pengajarId === currentUser?.id);
    } else if (filterPengajarId) {
      list = list.filter((item) => item.pengajarId === filterPengajarId);
    }

    if (filterKelasId) {
      list = list.filter((item) => item.kelasId === filterKelasId);
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
          item.materi.toLowerCase().includes(q) ||
          item.tanggal.includes(q)
      );
    }

    return list.sort((a, b) => b.tanggal.localeCompare(a.tanggal));
  }, [
    jadwalInstances,
    jurnal,
    pengajar,
    kelas,
    isAdmin,
    currentUser,
    filterPengajarId,
    filterKelasId,
    filterStatus,
    searchQuery,
  ]);

  const unfulfilledCount = journalEntries.filter(
    (e) => e.status === 'BELUM_DIISI'
  ).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900">
            Jurnal Mengajar
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            {isAdmin
              ? 'Review materi pembelajaran, catatan kelas, dan verifikasi laporan mengajar pengajar.'
              : 'Isi materi dan aktivitas pembelajaran setelah selesai mengajar.'}
          </p>
        </div>
      </div>

      {/* Unfulfilled Journal Warning Alert */}
      {unfulfilledCount > 0 && (
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl flex items-center justify-between gap-3 text-amber-800 text-xs">
          <div className="flex items-center gap-2.5">
            <AlertCircle className="w-5 h-5 text-amber-600 shrink-0" />
            <span>
              Terdapat <strong>{unfulfilledCount} sesi kelas</strong> yang telah selesai namun jurnal pembelajarannya belum diisi.
            </span>
          </div>
        </div>
      )}

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
          {/* Search */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Cari materi / kelas..."
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

          {/* Status Jurnal */}
          <div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-600 text-slate-700 font-medium"
            >
              <option value="">Semua Status Jurnal</option>
              <option value="BELUM_DIISI">Belum Diisi</option>
              <option value="DRAFT">Draft</option>
              <option value="DIISI">Sudah Diisi</option>
              <option value="DIREVIEW">Sudah Direview</option>
            </select>
          </div>
        </div>

        {(searchQuery || filterPengajarId || filterKelasId || filterStatus) && (
          <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100">
            <span>Ditemukan {journalEntries.length} entri jurnal</span>
            <button
              onClick={() => {
                setSearchQuery('');
                setFilterPengajarId(isAdmin ? '' : currentUser?.id || '');
                setFilterKelasId('');
                setFilterStatus('');
              }}
              className="text-indigo-600 hover:text-indigo-800 font-semibold"
            >
              Reset Filter
            </button>
          </div>
        )}
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        {journalEntries.length === 0 ? (
          <div className="p-12 text-center">
            <BookOpen className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <p className="text-sm font-semibold text-slate-700">Tidak ada jurnal ditemukan</p>
            <p className="text-xs text-slate-400 mt-0.5">Selesaikan sesi mengajar untuk mulai mengisi jurnal.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 border-b border-slate-200/80 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-3.5">Tanggal</th>
                  {isAdmin && <th className="px-6 py-3.5">Pengajar</th>}
                  <th className="px-6 py-3.5">Kelas</th>
                  <th className="px-6 py-3.5">Materi Pembelajaran</th>
                  <th className="px-6 py-3.5">Hadir</th>
                  <th className="px-6 py-3.5">Status Jurnal</th>
                  <th className="px-6 py-3.5 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {journalEntries.map((item, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/70 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-semibold text-slate-900">{item.tanggal}</div>
                      <div className="text-xs text-slate-500">{item.jam}</div>
                    </td>

                    {isAdmin && (
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="font-medium text-slate-800">{item.pengajarNama}</div>
                      </td>
                    )}

                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-bold text-slate-900">{item.kelasNama}</div>
                      <div className="text-xs text-slate-500">{item.program}</div>
                    </td>

                    <td className="px-6 py-4">
                      <div className="max-w-xs truncate text-xs font-medium text-slate-800">
                        {item.materi}
                      </div>
                      {item.jurnal?.tugas && (
                        <div className="text-[11px] text-slate-500 truncate max-w-xs">
                          Tugas: {item.jurnal.tugas}
                        </div>
                      )}
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap text-xs text-slate-700 font-semibold">
                      {item.jumlahSiswa > 0 ? `${item.jumlahSiswa} Siswa` : '—'}
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap">
                      <JurnalStatusBadge status={item.status as any} />
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {/* View Details */}
                        {item.jurnal && (
                          <button
                            onClick={() => setSelectedJurnalForDetail(item.jurnal!)}
                            title="Lihat Detail Jurnal"
                            className="p-1.5 text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                        )}

                        {/* Fill / Edit button */}
                        <button
                          onClick={() => setSelectedJadwalForForm(item.instance)}
                          className={`inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                            item.status === 'BELUM_DIISI'
                              ? 'text-white bg-rose-600 hover:bg-rose-700'
                              : 'text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-300'
                          }`}
                        >
                          <FileEdit className="w-3.5 h-3.5" />
                          {item.status === 'BELUM_DIISI' ? 'Isi Jurnal' : 'Edit'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Form Modal */}
      <JurnalFormModal
        isOpen={!!selectedJadwalForForm}
        onClose={() => setSelectedJadwalForForm(null)}
        jadwalInstance={selectedJadwalForForm}
      />

      {/* Detail & Review Modal (Admin or view) */}
      <Modal
        isOpen={!!selectedJurnalForDetail}
        onClose={() => setSelectedJurnalForDetail(null)}
        title="Detail Jurnal Pembelajaran"
        subtitle={`Tanggal: ${selectedJurnalForDetail?.tanggal}`}
        maxWidth="lg"
      >
        {selectedJurnalForDetail && (
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <span className="text-xs text-slate-500 font-medium">Status Verifikasi</span>
                <div className="mt-0.5">
                  <JurnalStatusBadge status={selectedJurnalForDetail.status} />
                </div>
              </div>
              <div className="text-right">
                <span className="text-xs text-slate-500 font-medium">Siswa Hadir</span>
                <p className="text-sm font-bold text-slate-900">
                  {selectedJurnalForDetail.jumlahSiswaHadir} Siswa
                </p>
              </div>
            </div>

            <div>
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Materi yang Diajarkan
              </span>
              <p className="text-sm text-slate-900 mt-1 font-medium bg-slate-50 p-3 rounded-lg border border-slate-200">
                {selectedJurnalForDetail.materi}
              </p>
            </div>

            <div>
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Aktivitas & Catatan Pembelajaran
              </span>
              <p className="text-xs text-slate-700 mt-1 bg-slate-50 p-3 rounded-lg border border-slate-200 leading-relaxed whitespace-pre-wrap">
                {selectedJurnalForDetail.aktivitas}
              </p>
            </div>

            {selectedJurnalForDetail.tugas && (
              <div>
                <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Tugas / Homework
                </span>
                <p className="text-xs text-slate-700 mt-1 bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                  {selectedJurnalForDetail.tugas}
                </p>
              </div>
            )}

            {selectedJurnalForDetail.catatan && (
              <div>
                <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Catatan Tambahan
                </span>
                <p className="text-xs text-slate-700 mt-1 bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                  {selectedJurnalForDetail.catatan}
                </p>
              </div>
            )}

            <div className="flex items-center justify-between pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setSelectedJurnalForDetail(null)}
                className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                Tutup
              </button>

              {isAdmin && selectedJurnalForDetail.status !== 'DIREVIEW' && (
                <button
                  type="button"
                  onClick={() => {
                    reviewJurnal(selectedJurnalForDetail.id);
                    setSelectedJurnalForDetail(null);
                    toast.success('Jurnal Terverifikasi', 'Jurnal pembelajaran berhasil ditandai sebagai Sudah Direview.');
                  }}
                  className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-xs"
                >
                  <Check className="w-4 h-4" />
                  Verifikasi / Tandai Sudah Direview
                </button>
              )}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
