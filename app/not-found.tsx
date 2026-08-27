import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#0f172a] flex flex-col items-center justify-center p-4 text-center">
      <div className="w-full max-w-md bg-white rounded-3xl p-8 shadow-2xl space-y-4">
        <h1 className="text-4xl font-extrabold text-slate-900">404</h1>
        <h2 className="text-base font-bold text-slate-800">Halaman Tidak Ditemukan</h2>
        <p className="text-xs text-slate-500">
          Halaman yang Anda tuju tidak tersedia atau telah dipindahkan.
        </p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-md transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Kembali ke Dashboard</span>
        </Link>
      </div>
    </div>
  );
}
