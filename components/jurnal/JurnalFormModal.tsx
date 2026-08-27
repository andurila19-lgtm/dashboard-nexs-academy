'use client';
import React, { useState, useEffect } from 'react';
import { Modal } from '@/components/ui/Modal';
import { useNEXSStore } from '@/lib/store';
import { JadwalInstance } from '@/lib/types';
import { BookOpen, CheckCircle, Save } from 'lucide-react';
import { useToast } from '@/components/ui/Toast';

interface JurnalFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  jadwalInstance: JadwalInstance | null;
}

export function JurnalFormModal({ isOpen, onClose, jadwalInstance }: JurnalFormModalProps) {
  const { kelas, pengajar, siswa, jurnal, submitJurnal } = useNEXSStore();
  const toast = useToast();

  const [materi, setMateri] = useState('');
  const [aktivitas, setAktivitas] = useState('');
  const [jumlahSiswaHadir, setJumlahSiswaHadir] = useState(0);
  const [tugas, setTugas] = useState('');
  const [catatan, setCatatan] = useState('');

  const targetKelas = kelas.find((k) => k.id === jadwalInstance?.kelasId);
  const targetPengajar = pengajar.find((p) => p.id === jadwalInstance?.pengajarId);
  const totalSiswaKelas = siswa.filter((s) => s.kelasId === jadwalInstance?.kelasId).length;

  useEffect(() => {
    if (jadwalInstance) {
      const existing = jurnal.find((j) => j.jadwalInstanceId === jadwalInstance.id);
      if (existing) {
        setMateri(existing.materi || '');
        setAktivitas(existing.aktivitas || '');
        setJumlahSiswaHadir(existing.jumlahSiswaHadir || totalSiswaKelas);
        setTugas(existing.tugas || '');
        setCatatan(existing.catatan || '');
      } else {
        setMateri('');
        setAktivitas('');
        setJumlahSiswaHadir(totalSiswaKelas || targetKelas?.kapasitas || 10);
        setTugas('');
        setCatatan('');
      }
    }
  }, [jadwalInstance, jurnal, totalSiswaKelas, targetKelas]);

  if (!jadwalInstance) return null;

  const handleSubmit = (isDraft = false) => {
    if (!materi && !isDraft) {
      toast.warning('Materi Pembelajaran Kosong', 'Mohon isi materi yang diajarkan sebelum mengirim jurnal.');
      return;
    }
    submitJurnal({
      jadwalInstanceId: jadwalInstance.id,
      materi: materi || 'Materi pembelajaran dasar',
      aktivitas: aktivitas || 'Penjelasan materi dan latihan soal',
      jumlahSiswaHadir: Number(jumlahSiswaHadir),
      tugas,
      catatan,
      isDraft,
    });
    
    if (isDraft) {
      toast.info('Draft Tersimpan', 'Jurnal berhasil disimpan sebagai draft.');
    } else {
      toast.success('Jurnal Berhasil Dikirim', 'Laporan jurnal mengajar telah berhasil disubmit.');
    }
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Pengisian Jurnal Mengajar"
      subtitle={`${targetKelas?.nama || 'Kelas'} • ${jadwalInstance.tanggal} (${jadwalInstance.jamMulai} - ${jadwalInstance.jamSelesai})`}
      maxWidth="lg"
    >
      <div className="space-y-4">
        {/* Info header */}
        <div className="p-3 bg-indigo-50/70 border border-indigo-100 rounded-xl flex items-center justify-between text-xs text-indigo-900">
          <div>
            <span className="font-semibold">Pengajar:</span> {targetPengajar?.name}
          </div>
          <div>
            <span className="font-semibold">Kapasitas:</span> {targetKelas?.kapasitas} Siswa
          </div>
        </div>

        {/* Form fields */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Materi yang Diajarkan <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            placeholder="Contoh: Bab 4 - Pola Kalimat ~te kudasai & Kosakata Baru"
            value={materi}
            onChange={(e) => setMateri(e.target.value)}
            className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-indigo-600 focus:border-transparent"
            required
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Aktivitas / Catatan Pembelajaran
          </label>
          <textarea
            rows={3}
            placeholder="Contoh: Drill pelafalan percakapan berpasangan, latihan menulis huruf hiragana/kanji..."
            value={aktivitas}
            onChange={(e) => setAktivitas(e.target.value)}
            className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-indigo-600 focus:border-transparent resize-none"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Jumlah Siswa Hadir
            </label>
            <input
              type="number"
              min={0}
              max={50}
              value={jumlahSiswaHadir}
              onChange={(e) => setJumlahSiswaHadir(Number(e.target.value))}
              className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-indigo-600 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Tugas / Homework
            </label>
            <input
              type="text"
              placeholder="Contoh: PR Lembar Kerja Bab 4 hal 15"
              value={tugas}
              onChange={(e) => setTugas(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-indigo-600 focus:border-transparent"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Catatan Tambahan (Opsional)
          </label>
          <input
            type="text"
            placeholder="Contoh: 2 siswa izin sakit, materi selesai sesuai target"
            value={catatan}
            onChange={(e) => setCatatan(e.target.value)}
            className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-indigo-600 focus:border-transparent"
          />
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
          >
            Batal
          </button>
          <button
            type="button"
            onClick={() => handleSubmit(true)}
            className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors border border-slate-300"
          >
            <Save className="w-4 h-4" />
            Simpan Draft
          </button>
          <button
            type="button"
            onClick={() => handleSubmit(false)}
            className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors shadow-xs"
          >
            <CheckCircle className="w-4 h-4" />
            Kirim Jurnal
          </button>
        </div>
      </div>
    </Modal>
  );
}
