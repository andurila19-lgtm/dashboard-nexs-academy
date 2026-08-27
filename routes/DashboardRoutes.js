import { v4 as uuid } from 'uuid';

/**
 *  NEXS Dashboard Routes
 *  Sidebar navigation for Teaching Management System
 */

export const DashboardMenu = [
	{
		id: uuid(),
		title: 'Dashboard',
		icon: 'home',
		link: '/'
	},
	{
		id: uuid(),
		title: 'OPERASIONAL',
		grouptitle: true
	},
	{
		id: uuid(),
		title: 'Jadwal Mengajar',
		icon: 'calendar',
		link: '/jadwal'
	},
	{
		id: uuid(),
		title: 'Absensi',
		icon: 'check-circle',
		link: '/absensi'
	},
	{
		id: uuid(),
		title: 'Jurnal Mengajar',
		icon: 'book-open',
		link: '/jurnal'
	},
	{
		id: uuid(),
		title: 'MASTER DATA',
		grouptitle: true
	},
	{
		id: uuid(),
		title: 'Pengajar',
		icon: 'users',
		link: '/master/pengajar'
	},
	{
		id: uuid(),
		title: 'Kelas',
		icon: 'book',
		link: '/master/kelas'
	},
	{
		id: uuid(),
		title: 'Siswa',
		icon: 'user',
		link: '/master/siswa'
	},
	{
		id: uuid(),
		title: 'Ruangan',
		icon: 'map-pin',
		link: '/master/ruangan'
	},
	{
		id: uuid(),
		title: 'LAPORAN',
		grouptitle: true
	},
	{
		id: uuid(),
		title: 'Rekap Pengajar',
		icon: 'bar-chart-2',
		link: '/laporan/rekap'
	}
];

// Pengajar-only menu (limited sidebar)
export const PengajarMenu = [
	{
		id: uuid(),
		title: 'Dashboard',
		icon: 'home',
		link: '/'
	},
	{
		id: uuid(),
		title: 'MENGAJAR',
		grouptitle: true
	},
	{
		id: uuid(),
		title: 'Jadwal Saya',
		icon: 'calendar',
		link: '/jadwal'
	},
	{
		id: uuid(),
		title: 'Riwayat Absensi',
		icon: 'check-circle',
		link: '/absensi'
	},
	{
		id: uuid(),
		title: 'Jurnal Saya',
		icon: 'book-open',
		link: '/jurnal'
	}
];

export default DashboardMenu;
