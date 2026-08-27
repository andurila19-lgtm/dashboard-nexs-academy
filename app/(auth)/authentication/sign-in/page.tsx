'use client';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Lock,
  Mail,
  ArrowRight,
  Eye,
  EyeOff,
} from 'lucide-react';
import { useNEXSStore } from '@/lib/store';
import { NexsLogo } from '@/components/ui/NexsLogo';
import { ToastProvider, useToast } from '@/components/ui/Toast';

export default function SignInPage() {
  return (
    <ToastProvider>
      <SignInContent />
    </ToastProvider>
  );
}

function SignInContent() {
  const router = useRouter();
  const toast = useToast();
  const { loginAs, pengajar } = useNEXSStore();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !password) {
      toast.warning('Form Belum Lengkap', 'Silakan masukkan email dan kata sandi Anda.');
      return;
    }

    setIsLoading(true);

    setTimeout(() => {
      const cleanEmail = email.trim().toLowerCase();

      // Check if email belongs to admin
      if (cleanEmail.includes('admin')) {
        loginAs('ADMIN');
        toast.success('Login Berhasil', 'Selamat datang kembali.');
        setTimeout(() => router.push('/'), 400);
        return;
      }

      // Check if email matches any pengajar
      const matchedPengajar = pengajar.find(
        (p) => p.email.toLowerCase() === cleanEmail || p.name.toLowerCase().includes(cleanEmail)
      );

      if (matchedPengajar) {
        loginAs('PENGAJAR', matchedPengajar.id);
        toast.success('Login Berhasil', `Selamat datang, ${matchedPengajar.name}.`);
        setTimeout(() => router.push('/'), 400);
        return;
      }

      // Default fallback: login as first pengajar
      loginAs('PENGAJAR', pengajar[0]?.id || 'p-1');
      toast.success('Login Berhasil', 'Selamat datang.');
      setTimeout(() => router.push('/'), 400);
    }, 500);
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 sm:p-6 bg-[#0f172a] relative overflow-hidden font-sans">
      {/* Subtle Ambient Glows */}
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-orange-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-indigo-600/15 rounded-full blur-3xl pointer-events-none" />

      {/* Discrete, Clean, Professional Login Card */}
      <div className="w-full max-w-md bg-white rounded-3xl p-7 sm:p-9 shadow-2xl border border-slate-100 space-y-6 relative z-10 animate-in fade-in zoom-in-95 duration-300">
        {/* Official Brand Logo */}
        <div className="flex flex-col items-center justify-center text-center pb-2">
          <NexsLogo height={46} variant="dark-text" />
        </div>

        {/* Standard Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4 pt-1">
          {/* Email / ID Input */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-700">
              Email / ID Pengguna
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                placeholder="nama@nexs.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-3.5 py-2.5 text-xs font-semibold text-slate-900 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-orange-500 focus:bg-white transition-colors"
                required
                autoComplete="email"
              />
            </div>
          </div>

          {/* Password Input */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold text-slate-700">
                Kata Sandi
              </label>
              <button
                type="button"
                onClick={() =>
                  toast.info(
                    'Bantuan Akun',
                    'Silakan hubungi administrator institusi untuk bantuan reset kata sandi.'
                  )
                }
                className="text-[11px] font-medium text-slate-500 hover:text-orange-600 transition-colors"
              >
                Lupa kata sandi?
              </button>
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-10 py-2.5 text-xs font-semibold text-slate-900 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-orange-500 focus:bg-white transition-colors"
                required
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5"
                aria-label="Toggle password visibility"
              >
                {showPassword ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>

          {/* Remember Me */}
          <div className="flex items-center gap-2 pt-0.5">
            <input
              type="checkbox"
              id="remember"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="w-4 h-4 rounded text-orange-600 focus:ring-orange-500 border-slate-300 cursor-pointer"
            />
            <label
              htmlFor="remember"
              className="text-xs text-slate-600 font-medium cursor-pointer select-none"
            >
              Ingat sesi saya
            </label>
          </div>

          {/* Submit Button */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 text-xs sm:text-sm font-bold text-white bg-gradient-to-r from-orange-600 via-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 active:scale-[0.99] rounded-2xl shadow-lg shadow-orange-600/25 transition-all disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Memproses...</span>
                </>
              ) : (
                <>
                  <span>Masuk</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </form>

        {/* Footer */}
        <div className="text-center pt-2 text-[11px] text-slate-400 border-t border-slate-100">
          © {new Date().getFullYear()} NEXS Japanese Academy. All rights reserved.
        </div>
      </div>
    </div>
  );
}
