import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'NEXS - Teaching Management System',
  description:
    'Sistem manajemen pengajaran NEXS untuk mengelola Jadwal Mengajar, Absensi, Jurnal, dan Rekap Pengajar.',
  icons: {
    icon: '/images/brand/nexs-icon.svg',
    shortcut: '/images/brand/nexs-icon.svg',
    apple: '/images/brand/nexs-icon.svg',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id">
      <head>
        <link rel="icon" href="/images/brand/nexs-icon.svg" type="image/svg+xml" />
      </head>
      <body className={inter.className}>{children}</body>
    </html>
  );
}
