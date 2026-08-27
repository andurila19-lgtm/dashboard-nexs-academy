'use client';
import React, { useState, useMemo } from 'react';
import {
  Users,
  Plus,
  Search,
  Edit2,
  Trash2,
  Mail,
  Phone,
  CheckCircle,
  MessageSquare,
} from 'lucide-react';
import { Modal, ConfirmDialog } from '@/components/ui/Modal';
import { StatusAktifBadge } from '@/components/ui/Badge';
import { useNEXSStore } from '@/lib/store';
import { Pengajar, StatusAktif } from '@/lib/types';
import { WhatsAppModal } from '@/components/whatsapp/WhatsAppModal';
import { useToast } from '@/components/ui/Toast';

export default function MasterPengajarPage() {
  const { pengajar, addPengajar, updatePengajar, deletePengajar } = useNEXSStore();
  const toast = useToast();

  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Pengajar | null>(null);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);

  // WhatsApp Modal state
  const [waTarget, setWaTarget] = useState<Pengajar | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [status, setStatus] = useState<StatusAktif>('AKTIF');

  const filteredPengajar = useMemo(() => {
    return pengajar.filter(
      (p) =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.email.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [pengajar, searchQuery]);

  const openAddModal = () => {
    setEditingItem(null);
    setName('');
    setEmail('');
    setPhone('');
    setStatus('AKTIF');
    setIsModalOpen(true);
  };

  const openEditModal = (item: Pengajar) => {
    setEditingItem(item);
    setName(item.name);
    setEmail(item.email);
    setPhone(item.phone || '');
    setStatus(item.status);
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email) {
      toast.warning('Form Belum Lengkap', 'Nama dan Email pengajar harus diisi.');
      return;
    }

    if (editingItem) {
      updatePengajar(editingItem.id, { name, email, phone, status });
      toast.success('Data Diperbarui', `Informasi ${name} telah berhasil diupdate.`);
    } else {
      addPengajar({ name, email, phone, status });
      toast.success('Pengajar Ditambahkan', `${name} telah terdaftar sebagai pengajar baru.`);
    }
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900">
            Master Data Pengajar
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Daftar pengajar / sensei yang terdaftar di NEXS Academy.
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah Pengajar</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Cari nama atau email sensei..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-600"
          />
        </div>
        <div className="text-xs text-slate-500 font-medium">
          Total: {filteredPengajar.length} Pengajar
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 border-b border-slate-200/80 text-xs font-semibold text-slate-500 uppercase tracking-wider">
              <tr>
                <th className="px-6 py-3.5">Pengajar</th>
                <th className="px-6 py-3.5">Kontak WhatsApp</th>
                <th className="px-6 py-3.5">Status</th>
                <th className="px-6 py-3.5 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredPengajar.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 font-bold flex items-center justify-center text-xs border border-indigo-100">
                        {item.name.slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <div className="font-bold text-slate-900">{item.name}</div>
                        <div className="text-xs text-slate-500">{item.email}</div>
                      </div>
                    </div>
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap text-xs text-slate-600">
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1.5">
                        <Phone className="w-3.5 h-3.5 text-slate-400" />
                        <span>{item.phone || '—'}</span>
                      </div>
                      {item.phone && (
                        <button
                          onClick={() => setWaTarget(item)}
                          title="Chat via WhatsApp"
                          className="p-1 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors border border-emerald-200"
                        >
                          <MessageSquare className="w-3.5 h-3.5" />
                        </button>
                      )}
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
                        title="Edit Pengajar"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setDeleteTargetId(item.id)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                        title="Hapus Pengajar"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Form */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingItem ? 'Edit Data Pengajar' : 'Tambah Pengajar Baru'}
        maxWidth="md"
      >
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Nama Lengkap / Panggilan <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              placeholder="Contoh: Tanaka Sensei"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-600"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Email / Username <span className="text-rose-500">*</span>
            </label>
            <input
              type="email"
              placeholder="tanaka@nexs.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-600"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Nomor WhatsApp / HP
            </label>
            <input
              type="text"
              placeholder="081234567891"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-600"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Status Pengajar
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
              Simpan Pengajar
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
            deletePengajar(deleteTargetId);
            setDeleteTargetId(null);
            toast.info('Pengajar Dihapus', 'Data pengajar telah dihapus dari sistem.');
          }
        }}
        title="Hapus Data Pengajar?"
        message="Data pengajar ini akan dihapus dari sistem."
        confirmLabel="Ya, Hapus"
        isDestructive
      />

      {/* Direct WhatsApp Modal */}
      {waTarget && (
        <WhatsAppModal
          isOpen={!!waTarget}
          onClose={() => setWaTarget(null)}
          recipientName={waTarget.name}
          recipientPhone={waTarget.phone}
          defaultMessage={`Halo ${waTarget.name},\n\nSemoga sehat selalu. Ada informasi terbaru terkait jadwal dan kegiatan akademik di NEXS Academy yang ingin kami sampaikan.\n\nTerima kasih! 🙏`}
          title={`Kirim Pesan WhatsApp (${waTarget.name})`}
        />
      )}
    </div>
  );
}
