'use client';
import React, { useState, useMemo } from 'react';
import {
  Printer,
  FileDown,
  Send,
  Sliders,
  DollarSign,
  Calendar,
  User,
  Clock,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  X,
  CreditCard,
  Building,
  ShieldCheck,
  Award,
  QrCode,
} from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { NexsLogo } from '@/components/ui/NexsLogo';
import {
  Pengajar,
  Kelas,
  JadwalInstance,
  Absensi,
  Jurnal,
} from '@/lib/types';
import {
  HonorRateConfig,
  generateHonorSlipData,
  formatRupiah,
  DEFAULT_HONOR_CONFIG,
} from '@/lib/payroll';
import {
  createHonorSlipNotificationMessage,
  openWhatsApp,
} from '@/lib/whatsapp';
import { WhatsAppModal } from '@/components/whatsapp/WhatsAppModal';
import { useToast } from '@/components/ui/Toast';

interface SlipHonorModalProps {
  isOpen: boolean;
  onClose: () => void;
  pengajar: Pengajar;
  kelasList: Kelas[];
  jadwalInstances: JadwalInstance[];
  absensiList: Absensi[];
  jurnalList: Jurnal[];
  periode?: string;
  isAdmin?: boolean;
}

export function SlipHonorModal({
  isOpen,
  onClose,
  pengajar,
  kelasList,
  jadwalInstances,
  absensiList,
  jurnalList,
  periode,
  isAdmin = true,
}: SlipHonorModalProps) {
  const toast = useToast();

  // Custom rate config state
  const [config, setConfig] = useState<HonorRateConfig>({
    ...DEFAULT_HONOR_CONFIG,
    bankHolder: pengajar.name,
  });
  const [showConfigPanel, setShowConfigPanel] = useState(false);
  const [isWAModalOpen, setIsWAModalOpen] = useState(false);

  // Generate slip calculation
  const slipData = useMemo(() => {
    return generateHonorSlipData({
      pengajar,
      kelasList,
      jadwalInstances,
      absensiList,
      jurnalList,
      periode,
      config,
    });
  }, [
    pengajar,
    kelasList,
    jadwalInstances,
    absensiList,
    jurnalList,
    periode,
    config,
  ]);

  const handlePrint = () => {
    if (typeof window !== 'undefined') {
      window.print();
    }
  };

  const handlePrintCleanWindow = () => {
    if (typeof window === 'undefined') return;
    const printContent = document.getElementById('slip-honor-printable');
    if (!printContent) {
      window.print();
      return;
    }

    const printWindow = window.open('', '_blank', 'width=900,height=800');
    if (!printWindow) {
      window.print();
      return;
    }

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Slip Honorarium - ${pengajar.name} - ${slipData.slipNo}</title>
          <meta charset="utf-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <script src="https://cdn.tailwindcss.com"></script>
          <style>
            @page { size: A4 portrait; margin: 12mm 15mm; }
            body { font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #fff; color: #0f172a; }
            table { width: 100%; border-collapse: collapse; page-break-inside: auto; }
            thead { display: table-header-group; }
            tr { page-break-inside: avoid; }
            .slip-summary-block, .slip-signature-block { page-break-inside: avoid; break-inside: avoid; }
          </style>
        </head>
        <body class="p-6">
          ${printContent.innerHTML}
          <script>
            window.onload = function() {
              window.focus();
              window.print();
            };
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const handleOpenWA = () => {
    setIsWAModalOpen(true);
  };

  const waMessage = useMemo(() => {
    return createHonorSlipNotificationMessage({
      pengajarName: pengajar.name,
      slipNo: slipData.slipNo,
      periode: slipData.periode,
      totalSesi: slipData.totalKehadiran,
      totalJam: slipData.totalJamMengajar,
      totalHonorBersihFormatted: formatRupiah(slipData.totalHonorBersih),
    });
  }, [pengajar.name, slipData]);

  return (
    <>
      <Modal isOpen={isOpen} onClose={onClose} title="Slip Honorarium Pengajar Resmi" maxWidth="4xl">
        <div className="space-y-4">
          {/* Top Actions Bar (Hidden when printing) */}
          <div className="no-print flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 bg-slate-50 border border-slate-200 rounded-xl">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-700">
                Pengaturan Dokumen:
              </span>
              {isAdmin && (
                <button
                  type="button"
                  onClick={() => setShowConfigPanel(!showConfigPanel)}
                  className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-lg border border-indigo-200 transition-colors"
                >
                  <Sliders className="w-3.5 h-3.5" />
                  <span>{showConfigPanel ? 'Sembunyikan Panel Edit' : 'Edit Tarif, Bank & Potongan'}</span>
                </button>
              )}
            </div>

            <div className="flex items-center gap-2">
              {isAdmin && (
                <button
                  type="button"
                  onClick={handleOpenWA}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-xs transition-colors"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Kirim ke WhatsApp Pengajar</span>
                </button>
              )}

              <button
                type="button"
                onClick={handlePrintCleanWindow}
                className="flex items-center gap-1.5 px-4 py-1.5 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-lg shadow-xs transition-colors"
                title="Cetak atau simpan sebagai PDF A4 lengkap multi-halaman tanpa terpotong"
              >
                <Printer className="w-4 h-4 text-amber-300" />
                <span>Cetak / Simpan PDF (A4 Multi-Halaman)</span>
              </button>
            </div>
          </div>

          {/* Collapsible Rate & Bank Configuration (Admin Only, Hidden on print) */}
          {isAdmin && showConfigPanel && (
            <div className="no-print p-4.5 bg-indigo-50/80 border border-indigo-100 rounded-2xl space-y-4 animate-fadeIn">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-indigo-950 flex items-center gap-1.5">
                  <Sliders className="w-4 h-4 text-indigo-600" />
                  <span>Kustomisasi Parameter Honor, Tunjangan & Rekening Bank</span>
                </h4>
                <button
                  type="button"
                  onClick={() => setConfig({ ...DEFAULT_HONOR_CONFIG, bankHolder: pengajar.name })}
                  className="text-[11px] font-semibold text-indigo-600 hover:text-indigo-800"
                >
                  Reset Default
                </button>
              </div>

              {/* Grid 1: Tarif & Tunjangan */}
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Tarif Dasar / Jam
                  </label>
                  <div className="relative">
                    <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-[11px]">
                      Rp
                    </span>
                    <input
                      type="number"
                      step={5000}
                      value={config.tarifPerJam}
                      onChange={(e) =>
                        setConfig({ ...config, tarifPerJam: Number(e.target.value) || 0 })
                      }
                      className="w-full pl-8 pr-2 py-1.5 bg-white border border-indigo-200 rounded-lg font-semibold text-slate-900 focus:ring-2 focus:ring-indigo-600"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Insentif Jurnal / Sesi
                  </label>
                  <div className="relative">
                    <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-[11px]">
                      Rp
                    </span>
                    <input
                      type="number"
                      step={5000}
                      value={config.bonusPerJurnal}
                      onChange={(e) =>
                        setConfig({ ...config, bonusPerJurnal: Number(e.target.value) || 0 })
                      }
                      className="w-full pl-8 pr-2 py-1.5 bg-white border border-indigo-200 rounded-lg font-semibold text-slate-900 focus:ring-2 focus:ring-indigo-600"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Transport / Sesi
                  </label>
                  <div className="relative">
                    <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-[11px]">
                      Rp
                    </span>
                    <input
                      type="number"
                      step={5000}
                      value={config.tunjanganTransportPerSesi}
                      onChange={(e) =>
                        setConfig({
                          ...config,
                          tunjanganTransportPerSesi: Number(e.target.value) || 0,
                        })
                      }
                      className="w-full pl-8 pr-2 py-1.5 bg-white border border-indigo-200 rounded-lg font-semibold text-slate-900 focus:ring-2 focus:ring-indigo-600"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Tunjangan Komunikasi
                  </label>
                  <div className="relative">
                    <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-[11px]">
                      Rp
                    </span>
                    <input
                      type="number"
                      step={5000}
                      value={config.tunjanganKomunikasi}
                      onChange={(e) =>
                        setConfig({ ...config, tunjanganKomunikasi: Number(e.target.value) || 0 })
                      }
                      className="w-full pl-8 pr-2 py-1.5 bg-white border border-indigo-200 rounded-lg font-semibold text-slate-900 focus:ring-2 focus:ring-indigo-600"
                    />
                  </div>
                </div>
              </div>

              {/* Grid 2: Potongan & Rekening Bank */}
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs pt-1 border-t border-indigo-100">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Pajak PPh 21 (%)
                  </label>
                  <input
                    type="number"
                    step={0.5}
                    value={config.potonganPPh21Percent}
                    onChange={(e) =>
                      setConfig({ ...config, potonganPPh21Percent: Number(e.target.value) || 0 })
                    }
                    className="w-full px-3 py-1.5 bg-white border border-indigo-200 rounded-lg font-semibold text-slate-900 focus:ring-2 focus:ring-indigo-600"
                    placeholder="0%"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Potongan Lain (Rp)
                  </label>
                  <input
                    type="number"
                    step={5000}
                    value={config.potonganLain}
                    onChange={(e) =>
                      setConfig({ ...config, potonganLain: Number(e.target.value) || 0 })
                    }
                    className="w-full px-3 py-1.5 bg-white border border-indigo-200 rounded-lg font-semibold text-rose-600 focus:ring-2 focus:ring-rose-600"
                    placeholder="Rp 0"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Nama Bank Penerima
                  </label>
                  <input
                    type="text"
                    value={config.bankName}
                    onChange={(e) => setConfig({ ...config, bankName: e.target.value })}
                    className="w-full px-3 py-1.5 bg-white border border-indigo-200 rounded-lg font-medium text-slate-900 focus:ring-2 focus:ring-indigo-600"
                    placeholder="Bank BCA"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Nomor Rekening
                  </label>
                  <input
                    type="text"
                    value={config.bankAccount}
                    onChange={(e) => setConfig({ ...config, bankAccount: e.target.value })}
                    className="w-full px-3 py-1.5 bg-white border border-indigo-200 rounded-lg font-medium text-slate-900 focus:ring-2 focus:ring-indigo-600"
                    placeholder="829-102-9981"
                  />
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* THE OFFICIAL COMPLETE PRINTABLE A4 SLIP CONTAINER                        */}
          {/* ========================================================================= */}
          <div
            id="slip-honor-printable"
            className="slip-honor-container bg-white p-6 sm:p-9 rounded-2xl border border-slate-300 shadow-sm text-slate-800 font-sans"
          >
            {/* Header: Official Legal Institution Header */}
            <div className="border-b-2 border-slate-900 pb-4 mb-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-3">
                    <NexsLogo height={42} variant="dark-text" />
                  </div>
                  <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wide">
                    LEMBAGA PENDIDIKAN & PELATIHAN BAHASA JEPANG NEXS NIHONGO CENTRE
                  </h2>
                  <p className="text-[10px] text-slate-600">
                    SK Kemenkumham No. AHU-0012948.AH.01.04 | Izin Operasional LPK No. 560/218/LPK-NEXS/2024
                  </p>
                  <p className="text-[9.5px] text-slate-500">
                    Gedung Edu Centre Lt. 2, Jl. Pendidikan No. 88, Yogyakarta | Telp: (0274) 554-123 | Email: finance@nexs.com
                  </p>
                </div>

                <div className="sm:text-right shrink-0">
                  <div className="inline-block px-3 py-1 bg-slate-900 text-amber-300 text-xs font-black tracking-widest uppercase rounded-sm border border-slate-800">
                    SLIP HONORARIUM PENGAJAR
                  </div>
                  <div className="text-xs font-mono font-bold text-slate-800 mt-2">
                    {slipData.slipNo}
                  </div>
                  <div className="text-[10px] text-slate-500">
                    Reg. ID: {slipData.nomorRegistrasi}
                  </div>
                  <div className="inline-flex items-center gap-1 px-2 py-0.5 mt-1 rounded-sm text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                    <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                    <span>{slipData.statusPembayaran}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Profile Grid: Pengajar, Periode & Rekening Bank */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 bg-slate-50/90 rounded-xl border border-slate-200 text-xs mb-4">
              {/* Kolom Kiri: Biodata Pengajar */}
              <div className="space-y-1.5">
                <div className="flex">
                  <span className="text-slate-500 w-32 font-medium">Nama Pengajar</span>
                  <span className="font-bold text-slate-900">: {pengajar.name}</span>
                </div>
                <div className="flex">
                  <span className="text-slate-500 w-32 font-medium">Status Pengajar</span>
                  <span className="font-semibold text-indigo-900">: Pengajar Lepas (Freelance Instructor)</span>
                </div>
                <div className="flex">
                  <span className="text-slate-500 w-32 font-medium">Spesialisasi</span>
                  <span className="text-slate-700">: Pengajar Bahasa Jepang (JLPT & Kaiwa)</span>
                </div>
                <div className="flex">
                  <span className="text-slate-500 w-32 font-medium">No. WhatsApp / HP</span>
                  <span className="text-slate-700">: {pengajar.phone || '—'}</span>
                </div>
                <div className="flex">
                  <span className="text-slate-500 w-32 font-medium">Email Terdaftar</span>
                  <span className="text-slate-700">: {pengajar.email}</span>
                </div>
              </div>

              {/* Kolom Kanan: Periode, Cut-off & Bank */}
              <div className="space-y-1.5 sm:border-l sm:border-slate-200 sm:pl-4">
                <div className="flex">
                  <span className="text-slate-500 w-32 font-medium">Periode Penggajian</span>
                  <span className="font-bold text-indigo-700">: {slipData.periode}</span>
                </div>
                <div className="flex">
                  <span className="text-slate-500 w-32 font-medium">Tanggal Cetak</span>
                  <span className="text-slate-700">: {slipData.tanggalCetak}</span>
                </div>
                <div className="flex">
                  <span className="text-slate-500 w-32 font-medium">Tarif Dasar / Jam</span>
                  <span className="font-bold text-slate-800">: {formatRupiah(config.tarifPerJam)} / Jam</span>
                </div>
                <div className="flex">
                  <span className="text-slate-500 w-32 font-medium">Bank Penerima</span>
                  <span className="font-bold text-slate-900">: {config.bankName}</span>
                </div>
                <div className="flex">
                  <span className="text-slate-500 w-32 font-medium">No. Rekening & A/N</span>
                  <span className="font-mono font-bold text-slate-900">: {config.bankAccount} (a.n {config.bankHolder || pengajar.name})</span>
                </div>
              </div>
            </div>

            {/* Performance Summary Metrics Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-6 gap-2 p-2.5 bg-slate-100 rounded-xl border border-slate-200 text-center mb-4">
              <div className="p-1.5 bg-white rounded-lg border border-slate-200">
                <div className="text-[10px] text-slate-500 font-semibold uppercase">Total Sesi</div>
                <div className="text-xs font-black text-slate-900">{slipData.totalSesi} Sesi</div>
              </div>
              <div className="p-1.5 bg-white rounded-lg border border-slate-200">
                <div className="text-[10px] text-slate-500 font-semibold uppercase">Hadir Terlaksana</div>
                <div className="text-xs font-black text-emerald-700">{slipData.totalKehadiran} Sesi</div>
              </div>
              <div className="p-1.5 bg-white rounded-lg border border-slate-200">
                <div className="text-[10px] text-slate-500 font-semibold uppercase">Tepat Waktu</div>
                <div className="text-xs font-black text-blue-700">{slipData.totalSesiTepatWaktu} Sesi</div>
              </div>
              <div className="p-1.5 bg-white rounded-lg border border-slate-200">
                <div className="text-[10px] text-slate-500 font-semibold uppercase">Terlambat</div>
                <div className="text-xs font-black text-amber-700">{slipData.totalSesiTerlambat} Sesi</div>
              </div>
              <div className="p-1.5 bg-white rounded-lg border border-slate-200">
                <div className="text-[10px] text-slate-500 font-semibold uppercase">Total Jam Kerja</div>
                <div className="text-xs font-black text-indigo-700">{slipData.totalJamMengajar} Jam</div>
              </div>
              <div className="p-1.5 bg-white rounded-lg border border-slate-200">
                <div className="text-[10px] text-slate-500 font-semibold uppercase">Jurnal Terisi</div>
                <div className="text-xs font-black text-emerald-700">{slipData.persentaseJurnal}%</div>
              </div>
            </div>

            {/* Teaching Sessions Table Breakdown */}
            <div className="mb-4 overflow-x-auto">
              <div className="text-[11px] font-bold text-slate-800 mb-1.5 uppercase tracking-wide flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-indigo-600" />
                <span>Rincian Pelaksanaan Sesi Mengajar & Presensi</span>
              </div>
              <table className="w-full text-left text-[11px] border-collapse border border-slate-200">
                <thead>
                  <tr className="bg-slate-100 border-b border-slate-200 text-[10px] font-bold text-slate-700 uppercase">
                    <th className="p-1.5 border-r border-slate-200 text-center w-7">No</th>
                    <th className="p-1.5 border-r border-slate-200">Tanggal / Hari</th>
                    <th className="p-1.5 border-r border-slate-200">Kelas / Program</th>
                    <th className="p-1.5 border-r border-slate-200 text-center">Waktu Aktual</th>
                    <th className="p-1.5 border-r border-slate-200 text-center">Durasi</th>
                    <th className="p-1.5 border-r border-slate-200 text-right">Honor Pokok</th>
                    <th className="p-1.5 border-r border-slate-200 text-right">Insentif Jurnal</th>
                    <th className="p-1.5 border-r border-slate-200 text-right">Transport</th>
                    <th className="p-1.5 text-right">Subtotal</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 text-slate-700">
                  {slipData.items.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="p-4 text-center text-slate-400 italic">
                        Tidak ada sesi mengajar yang tercatat dalam periode ini.
                      </td>
                    </tr>
                  ) : (
                    slipData.items.map((item, idx) => (
                      <tr key={item.instanceId} className={idx % 2 === 1 ? 'bg-slate-50/60' : 'bg-white'}>
                        <td className="p-1.5 border-r border-slate-200 text-center text-slate-500 font-mono">
                          {idx + 1}
                        </td>
                        <td className="p-1.5 border-r border-slate-200 whitespace-nowrap">
                          <div className="font-semibold text-slate-900">{item.tanggal}</div>
                          <div className="text-[9.5px] text-slate-500">{item.hari}</div>
                        </td>
                        <td className="p-1.5 border-r border-slate-200">
                          <div className="font-semibold text-slate-900">{item.kelasNama}</div>
                          <div className="text-[9.5px] text-slate-500">{item.program} ({item.level})</div>
                        </td>
                        <td className="p-1.5 border-r border-slate-200 text-center font-mono text-[10px]">
                          {item.jamAktual}
                        </td>
                        <td className="p-1.5 border-r border-slate-200 text-center whitespace-nowrap font-medium">
                          {item.durasiJam} Jam
                        </td>
                        <td className="p-1.5 border-r border-slate-200 text-right font-medium">
                          {formatRupiah(item.honorSesi)}
                        </td>
                        <td className="p-1.5 border-r border-slate-200 text-right">
                          {item.isJurnalFilled ? (
                            <span className="text-emerald-700 font-medium">
                              +{formatRupiah(item.bonusJurnal)}
                            </span>
                          ) : (
                            <span className="text-slate-400 italic text-[10px]">Nihil</span>
                          )}
                        </td>
                        <td className="p-1.5 border-r border-slate-200 text-right text-slate-700">
                          {item.tunjanganTransport > 0 ? formatRupiah(item.tunjanganTransport) : '—'}
                        </td>
                        <td className="p-1.5 text-right font-bold text-slate-900">
                          {formatRupiah(item.subtotal)}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Comprehensive Financial Calculation Breakdown */}
            <div className="slip-summary-block grid grid-cols-1 sm:grid-cols-2 gap-4 items-start border-t-2 border-slate-900 pt-3 mb-4">
              {/* Left Column: Terbilang & Catatan Legalitas */}
              <div className="space-y-3">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs">
                  <div className="font-bold text-slate-700 mb-1 text-[10px] uppercase tracking-wide flex items-center gap-1">
                    <Award className="w-3.5 h-3.5 text-amber-600" />
                    <span>Terbilang (Jumlah Bersih Diterima):</span>
                  </div>
                  <div className="italic font-bold text-slate-900 bg-white p-2 rounded-lg border border-slate-200 leading-relaxed text-xs">
                    "{slipData.terbilangBersih}"
                  </div>
                </div>

                <div className="p-2.5 bg-amber-50/60 rounded-xl border border-amber-200/80 text-[10px] text-amber-950 space-y-1">
                  <div className="font-bold flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-amber-700" />
                    <span>Catatan & Ketentuan Pembayaran:</span>
                  </div>
                  <p className="leading-tight">
                    1. Dokumen ini merupakan bukti sah pembayaran honorarium pengajar NEXS Nihongo Centre.
                  </p>
                  <p className="leading-tight">
                    2. Apabila terdapat ketidaksesuaian jam atau nominal, harap menghubungi bagian Finance maksimal 3 hari kerja setelah slip diterbitkan.
                  </p>
                </div>
              </div>

              {/* Right Column: Complete Earnings & Deductions Breakdown */}
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2 text-xs">
                <div className="font-bold text-slate-900 text-xs uppercase tracking-wide border-b border-slate-200 pb-1">
                  Rincian Komponen Finansial
                </div>

                {/* Pendapatan */}
                <div className="space-y-1 text-[11px]">
                  <div className="flex justify-between">
                    <span className="text-slate-600">Honor Pokok Mengajar ({slipData.totalJamMengajar} Jam):</span>
                    <span className="font-semibold text-slate-900">{formatRupiah(slipData.totalHonorPokok)}</span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-slate-600">Insentif Kelengkapan Jurnal ({slipData.totalJurnalTerisi} Sesi):</span>
                    <span className="font-semibold text-emerald-700">+{formatRupiah(slipData.totalBonusJurnal)}</span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-slate-600">Tunjangan Transportasi ({slipData.totalKehadiran} Kehadiran):</span>
                    <span className="font-semibold text-slate-900">{formatRupiah(slipData.totalTunjanganTransport)}</span>
                  </div>

                  {slipData.totalTunjanganKomunikasi > 0 && (
                    <div className="flex justify-between">
                      <span className="text-slate-600">Tunjangan Komunikasi & Koordinasi:</span>
                      <span className="font-semibold text-slate-900">+{formatRupiah(slipData.totalTunjanganKomunikasi)}</span>
                    </div>
                  )}

                  <div className="flex justify-between font-bold text-slate-900 pt-1 border-t border-slate-200">
                    <span>Total Pendapatan Kotor (Gross):</span>
                    <span>{formatRupiah(slipData.totalPendapatanKotor)}</span>
                  </div>
                </div>

                {/* Potongan */}
                <div className="space-y-1 text-[11px] pt-1.5 border-t border-slate-200 text-rose-700">
                  {slipData.totalPotonganPPh21 > 0 && (
                    <div className="flex justify-between">
                      <span>Potongan Pajak PPh 21 ({config.potonganPPh21Percent}%):</span>
                      <span className="font-semibold">-{formatRupiah(slipData.totalPotonganPPh21)}</span>
                    </div>
                  )}

                  {slipData.totalPotonganLain > 0 && (
                    <div className="flex justify-between">
                      <span>Potongan Lainnya / Administrasi:</span>
                      <span className="font-semibold">-{formatRupiah(slipData.totalPotonganLain)}</span>
                    </div>
                  )}

                  {slipData.totalPotongan === 0 && (
                    <div className="flex justify-between text-slate-500 italic text-[10px]">
                      <span>Total Potongan:</span>
                      <span>Rp 0 (Nihil)</span>
                    </div>
                  )}
                </div>

                {/* Net Pay Box */}
                <div className="flex justify-between items-center p-2.5 bg-slate-900 text-white rounded-lg mt-2">
                  <div>
                    <span className="block font-bold text-[11px] uppercase tracking-wider text-amber-300">
                      TOTAL HONOR BERSIH (NET PAY)
                    </span>
                    <span className="text-[9.5px] text-slate-300">
                      Siap Ditransfer ke {config.bankName}
                    </span>
                  </div>
                  <span className="font-black text-sm sm:text-base text-amber-300">
                    {formatRupiah(slipData.totalHonorBersih)}
                  </span>
                </div>
              </div>
            </div>

            {/* Official Signature & QR Code Verification Section */}
            <div className="slip-signature-block grid grid-cols-3 gap-4 text-center text-xs pt-4 border-t border-slate-200 items-end">
              <div>
                <p className="text-[10px] text-slate-500 mb-12">Dibuat & Diverifikasi,</p>
                <p className="font-bold text-slate-900 underline text-xs">Finance & Payroll Officer</p>
                <p className="text-[9.5px] text-slate-400">NEXS Nihongo Centre</p>
              </div>

              <div className="flex flex-col items-center justify-center">
                <div className="w-14 h-14 bg-slate-100 border border-slate-300 rounded-lg p-1 flex flex-col items-center justify-center text-slate-600 mb-1">
                  <QrCode className="w-10 h-10 text-slate-800" />
                </div>
                <p className="text-[9px] font-mono text-slate-500">DIGITALLY VERIFIED</p>
                <p className="text-[8.5px] text-slate-400 font-mono">{slipData.slipNo}</p>
              </div>

              <div>
                <p className="text-[10px] text-slate-500 mb-12">Diterima Oleh,</p>
                <p className="font-bold text-slate-900 underline text-xs">{pengajar.name}</p>
                <p className="text-[9.5px] text-slate-400">Pengajar / Sensei</p>
              </div>
            </div>
          </div>

          {/* Bottom Close Button (Hidden on Print) */}
          <div className="no-print flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
            >
              Tutup
            </button>
          </div>
        </div>
      </Modal>

      {/* WhatsApp Modal for Direct Notification */}
      <WhatsAppModal
        isOpen={isWAModalOpen}
        onClose={() => setIsWAModalOpen(false)}
        recipientName={pengajar.name}
        recipientPhone={pengajar.phone}
        defaultMessage={waMessage}
        title={`Kirim Slip Honor ke ${pengajar.name}`}
      />
    </>
  );
}
