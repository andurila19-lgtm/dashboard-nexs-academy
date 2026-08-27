'use client';
import React, { useState } from 'react';
import { UserCheck, Plus, Search, Edit2, Trash2, GraduationCap, Phone, Mail } from 'lucide-react';
import { Modal, ConfirmDialog } from '@/components/ui/Modal';
import { StatusAktifBadge } from '@/components/ui/Badge';
import { useNEXSStore } from '@/lib/store';
import { Siswa, StatusAktif } from '@/lib/types';
import { useToast } from '@/components/ui/Toast';

export default function MasterSiswaPage() {
  const { siswa, kelas, addSiswa, updateSiswa, deleteSiswa } = useNEXSStore();
  const toast = useToast();

  const [searchQuery, setSearchQuery] = useState('');
  const [filterKelasId, setFilterKelasId] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Siswa | null>(null);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);

  // Form State
  const [nama, setNama] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [kelasId, setKelasId] = useState('');
  const [status, setStatus] = useState<StatusAktif>('AKTIF');

  const filteredSiswa = siswa.filter((s) => {
    const matchSearch =
      s.nama.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (s.email && s.email.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchKelas = filterKelasId ? s.kelasId === filterKelasId : true;
    return matchSearch && matchKelas;
  });

  const openAddModal = () => {
    setEditingItem(null);
    setNama('');
    setEmail('');
    setPhone('');
    setKelasId(kelas[0]?.id || '');
    setStatus('AKTIF');
    setIsModalOpen(true);
  };

  const openEditModal = (item: Siswa) => {
    setEditingItem(item);
    setNama(item.nama);
    setEmail(item.email || '');
    setPhone(item.phone || '');
    setKelasId(item.kelasId || '');
    setStatus(item.status);
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nama) {
      toast.warning('Form Belum Lengkap', 'Nama siswa harus diisi.');
      return;
    }

    if (editingItem) {
      updateSiswa(editingItem.id, { nama, email, phone, kelasId: kelasId || null, status });
      toast.success('Siswa Diperbarui', `Informasi ${nama} berhasil disimpan.`);
    } else {
      addSiswa({ nama, email, phone, kelasId: kelasId || null, status });
      toast.success('Siswa Ditambahkan', `${nama} berhasil didaftarkan sebagai siswa.`);
    }
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900">
            Master Data Siswa
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Kelola data siswa dan penugasan kelas pembelajaran.
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah Siswa</span>
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative flex-1 w-full sm:max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Cari nama atau email siswa..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-600"
          />
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <select
            value={filterKelasId}
            onChange={(e) => setFilterKelasId(e.target.value)}
            className="w-full sm:w-48 px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-600 text-slate-700 font-medium"
          >
            <option value="">Semua Kelas</option>
            {kelas.map((k) => (
              <option key={k.id} value={k.id}>
                {k.nama}
              </option>
            ))}
          </select>
          <div className="text-xs text-slate-500 font-medium whitespace-nowrap">
            Total: {filteredSiswa.length} Siswa
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 border-b border-slate-200/80 text-xs font-semibold text-slate-500 uppercase tracking-wider">
              <tr>
                <th className="px-6 py-3.5">Nama Siswa</th>
                <th className="px-6 py-3.5">Kelas Terdaftar</th>
                <th className="px-6 py-3.5">Kontak</th>
                <th className="px-6 py-3.5">Status</th>
                <th className="px-6 py-3.5 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredSiswa.map((item) => {
                const targetKelas = kelas.find((k) => k.id === item.kelasId);
                return (
                  <tr key={item.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-600 font-bold flex items-center justify-center text-xs">
                          {item.nama.slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <div className="font-bold text-slate-900">{item.nama}</div>
                          <div className="text-xs text-slate-500">{item.email || '—'}</div>
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap text-xs">
                      {targetKelas ? (
                        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-700 font-semibold border border-indigo-200/60">
                          <GraduationCap className="w-3.5 h-3.5" />
                          <span>{targetKelas.nama}</span>
                        </div>
                      ) : (
                        <span className="text-slate-400 italic">Belum ditentukan</span>
                      )}
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap text-xs text-slate-600">
                      <span>{item.phone || '—'}</span>
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap">
                      <StatusAktifBadge status={item.status} />
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => openEditModal(item)}
                          className="p-1.5 text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                          title="Edit Siswa"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setDeleteTargetId(item.id)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                          title="Hapus Siswa"
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
        title={editingItem ? 'Edit Data Siswa' : 'Tambah Siswa Baru'}
        maxWidth="md"
      >
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Nama Lengkap Siswa <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              placeholder="Contoh: Andi Pratama"
              value={nama}
              onChange={(e) => setNama(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-600"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Kaitkan dengan Kelas
            </label>
            <select
              value={kelasId}
              onChange={(e) => setKelasId(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-600"
            >
              <option value="">-- Tanpa Kelas --</option>
              {kelas.map((k) => (
                <option key={k.id} value={k.id}>
                  {k.nama} ({k.level})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Email
              </label>
              <input
                type="email"
                placeholder="andi@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-600"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Nomor HP / WhatsApp
              </label>
              <input
                type="text"
                placeholder="081299901"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-600"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Status Siswa
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
              Simpan Siswa
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={!!deleteTargetId}
        onClose={() => setDeleteTargetId(null)}
        title="Hapus Data Siswa?"
        message="Siswa ini akan dihapus dari sistem dan dikeluarkan dari kelas terkait."
        confirmLabel="Ya, Hapus"
        isDestructive
        onConfirm={() => {
          if (deleteTargetId) {
            deleteSiswa(deleteTargetId);
            setDeleteTargetId(null);
            toast.info('Siswa Dihapus', 'Data siswa telah dihapus.');
          }
        }}
      />
    </div>
  );
}
