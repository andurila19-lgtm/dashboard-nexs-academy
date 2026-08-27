'use client';
import React, { useState, useEffect } from 'react';
import {
  MessageSquare,
  Send,
  Copy,
  Check,
  Phone,
  User,
  X,
  ExternalLink,
  Sparkles,
} from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { openWhatsApp, formatPhoneNumberForWA } from '@/lib/whatsapp';
import { useToast } from '@/components/ui/Toast';

interface WhatsAppModalProps {
  isOpen: boolean;
  onClose: () => void;
  recipientName: string;
  recipientPhone?: string | null;
  defaultMessage: string;
  title?: string;
}

export function WhatsAppModal({
  isOpen,
  onClose,
  recipientName,
  recipientPhone,
  defaultMessage,
  title = 'Kirim Pesan WhatsApp',
}: WhatsAppModalProps) {
  const [message, setMessage] = useState(defaultMessage);
  const [phone, setPhone] = useState(recipientPhone || '');
  const [isCopied, setIsCopied] = useState(false);
  const toast = useToast();

  useEffect(() => {
    setMessage(defaultMessage);
    setPhone(recipientPhone || '');
  }, [defaultMessage, recipientPhone, isOpen]);

  const handleSendWA = () => {
    if (!phone) {
      toast.warning('Nomor WhatsApp Kosong', 'Harap masukkan nomor WhatsApp penerima terlebih dahulu.');
      return;
    }
    openWhatsApp(phone, message);
    toast.success('Membuka WhatsApp', `Mengarahkan pesan ke WhatsApp ${recipientName}...`);
    onClose();
  };

  const handleCopyText = async () => {
    try {
      await navigator.clipboard.writeText(message);
      setIsCopied(true);
      toast.success('Pesan Disalin', 'Teks pesan WhatsApp berhasil disalin ke clipboard.');
      setTimeout(() => setIsCopied(false), 2000);
    } catch (err) {
      console.error(err);
      toast.error('Gagal Menyalin', 'Tidak dapat mengakses clipboard browser.');
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} maxWidth="lg">
      <div className="space-y-4">
        {/* Recipient Card */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 bg-emerald-50/70 border border-emerald-200/80 rounded-xl">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold text-sm shadow-xs shrink-0">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-semibold text-emerald-900 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-emerald-700" />
                <span>{recipientName}</span>
              </div>
              <div className="text-[11px] text-emerald-700 flex items-center gap-1 mt-0.5">
                <Phone className="w-3 h-3 text-emerald-600" />
                <span>
                  {phone ? formatPhoneNumberForWA(phone) : 'Nomor HP belum diisi'}
                </span>
              </div>
            </div>
          </div>

          {/* Quick Edit Phone if missing */}
          <div className="flex items-center gap-2">
            <input
              type="text"
              placeholder="No. WA (0812...)"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="px-2.5 py-1.5 text-xs bg-white border border-emerald-300 rounded-lg focus:ring-2 focus:ring-emerald-500 w-36 font-medium text-slate-800"
            />
          </div>
        </div>

        {/* Message Editor */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
              <span>Preview & Edit Pesan</span>
              <span className="text-[10px] font-normal text-slate-400">
                (Dapat diedit sebelum dikirim)
              </span>
            </label>
            <button
              type="button"
              onClick={handleCopyText}
              className="flex items-center gap-1 text-[11px] font-semibold text-emerald-700 hover:text-emerald-800 transition-colors"
            >
              {isCopied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Tersalin!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Salin Teks</span>
                </>
              )}
            </button>
          </div>

          <div className="relative">
            <textarea
              rows={9}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full p-3 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-600 font-sans leading-relaxed text-slate-800 shadow-inner"
              placeholder="Tulis pesan..."
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col-reverse sm:flex-row sm:items-center justify-between gap-2.5 pt-3 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
          >
            Tutup
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleCopyText}
              className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
            >
              {isCopied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
              <span>Salin</span>
            </button>

            <button
              type="button"
              onClick={handleSendWA}
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-xs shadow-emerald-600/30 transition-colors"
            >
              <Send className="w-4 h-4" />
              <span>Kirim via WhatsApp</span>
              <ExternalLink className="w-3.5 h-3.5 opacity-80" />
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
}
