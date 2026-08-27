'use client';
import React, { useState } from 'react';
import { GraduationCap, Plus, Search, Edit2, Trash2, Users } from 'lucide-react';
import { Modal, ConfirmDialog } from '@/components/ui/Modal';
import { StatusAktifBadge } from '@/components/ui/Badge';
import { useNEXSStore } from '@/lib/store';
import { Kelas, StatusAktif } from '@/lib/types';
import { useToast } from '@/components/ui/Toast';

export default function MasterKelasPage() {
  const { kelas, siswa, addKelas, updateKelas, deleteKelas } = useNEXSStore();
  const toast = useToast();

  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Kelas | null>(null);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);

  // Form State
  const [nama, setNama] = useState('');
  const [program, setProgram] = useState('JLPT Preparation');
  const [level, setLevel] = useState('N5');
  const [kapasitas, setKapasitas] = useState(15);
  const [status, setStatus] = useState<StatusAktif>('AKTIF');

  const filteredKelas = kelas.filter(
    (k) =>
      k.nama.toLowerCase().includes(searchQuery.toLowerCase()) ||
      k.program.toLowerCase().includes(searchQuery.toLowerCase()) ||
      k.level.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const openAddModal = () => {
    setEditingItem(null);
    setNama('');
    setProgram('REGULER');
    setLevel('N5');
    setKapasitas(15);
    setStatus('AKTIF');
    setIsModalOpen(true);
  };

  const openEditModal = (item: Kelas) => {
    setEditingItem(item);
    setNama(item.nama);
    setProgram(item.program);
    setLevel(item.level);
    setKapasitas(item.kapasitas);
    setStatus(item.status);
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nama) {
      toast.warning('Form Belum Lengkap', 'Nama kelas harus diisi.');
      return;
    }

    if (editingItem) {
      updateKelas(editingItem.id, { nama, program, level, kapasitas, status });
      toast.success('Kelas Diperbarui', `Informasi kelas ${nama} berhasil disimpan.`);
    } else {
      addKelas({ nama, program, level, kapasitas, status });
      toast.success('Kelas Dibuat', `Kelas baru ${nama} berhasil didaftarkan.`);
    }
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900">
            Master Data Kelas
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Daftar kelas pembelajaran, level, dan kapasitas kuota di NEXS.
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah Kelas</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Cari nama kelas, program, atau level..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-600"
          />
        </div>
        <div className="text-xs text-slate-500 font-medium">
          Total: {filteredKelas.length} Kelas
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 border-b border-slate-200/80 text-xs font-semibold text-slate-500 uppercase tracking-wider">
              <tr>
                <th className="px-6 py-3.5">Nama Kelas</th>
                <th className="px-6 py-3.5">Program & Level</th>
                <th className="px-6 py-3.5">Siswa Terdaftar / Kapasitas</th>
                <th className="px-6 py-3.5">Status</th>
                <th className="px-6 py-3.5 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredKelas.map((item) => {
                const totalSiswa = siswa.filter((s) => s.kelasId === item.id).length;
                return (
                  <tr key={item.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 font-bold flex items-center justify-center text-xs border border-emerald-100">
                          <GraduationCap className="w-4 h-4" />
                        </div>
                        <div className="font-bold text-slate-900">{item.nama}</div>
                      </div>
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap text-xs text-slate-600">
                      <div>
                        <span className="font-semibold text-slate-800">{item.program}</span>
                        <span className="text-slate-400"> • </span>
                        <span className="inline-block px-1.5 py-0.5 bg-slate-100 text-slate-700 rounded text-[11px] font-mono">
                          Level {item.level}
                        </span>
                      </div>
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap text-xs">
                      <div className="flex items-center gap-2">
                        <Users className="w-3.5 h-3.5 text-slate-400" />
                        <span className="font-semibold text-slate-800">{totalSiswa}</span>
                        <span className="text-slate-400">/ {item.kapasitas} Siswa</span>
                      </div>
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap">
                      <StatusAktifBadge status={item.status} />
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => openEditModal(item)}
                          className="p-1.5 text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                          title="Edit Kelas"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setDeleteTargetId(item.id)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                          title="Hapus Kelas"
                        >
                          <Trash2 className="w-4 h-4" />
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

      {/* Modal Form */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingItem ? 'Edit Data Kelas' : 'Tambah Kelas Baru'}
        maxWidth="md"
      >
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Nama Kelas <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              placeholder="Contoh: JLPT N4 A (Reguler)"
              value={nama}
              onChange={(e) => setNama(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-600"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Program
              </label>
              <select
                value={program}
                onChange={(e) => setProgram(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-600"
              >
                <option value="JLPT Preparation">JLPT Preparation</option>
                <option value="Conversation">Conversation / Kaiwa</option>
                <option value="Business Japanese">Business Japanese</option>
                <option value="Private Class">Private Class</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Level
              </label>
              <input
                type="text"
                placeholder="Contoh: N5, N4, Dasar"
                value={level}
                onChange={(e) => setLevel(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-600"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Kapasitas Siswa
              </label>
              <input
                type="number"
                min={1}
                max={50}
                value={kapasitas}
                onChange={(e) => setKapasitas(Number(e.target.value))}
                className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-600"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Status Kelas
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as StatusAktif)}
                className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-600"
              >
                <option value="AKTIF">Aktif</option>
                <option value="NONAKTIF">Nonaktif</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-xs"
            >
              Simpan Kelas
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={!!deleteTargetId}
        onClose={() => setDeleteTargetId(null)}
        onConfirm={() => {
          if (deleteTargetId) {
            deleteKelas(deleteTargetId);
            setDeleteTargetId(null);
            toast.info('Kelas Dihapus', 'Data kelas telah dihapus.');
          }
        }}
        title="Hapus Data Kelas?"
        message="Kelas ini akan dihapus dari sistem."
        confirmLabel="Ya, Hapus"
        isDestructive
      />
    </div>
  );
}
