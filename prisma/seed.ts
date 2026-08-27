import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting Database Seeding for NEXS Management...');

  // 1. Seed Users & Pengajar
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@nexs.com' },
    update: {},
    create: {
      name: 'Admin NEXS',
      email: 'admin@nexs.com',
      password: 'admin123',
      role: 'ADMIN',
      status: 'AKTIF',
    },
  });

  const pengajarData = [
    { name: 'Tanaka Sensei', email: 'tanaka@nexs.com', phone: '081234567890' },
    { name: 'Yamamoto Sensei', email: 'yamamoto@nexs.com', phone: '081234567891' },
    { name: 'Suzuki Sensei', email: 'suzuki@nexs.com', phone: '081234567892' },
    { name: 'Sato Sensei', email: 'sato@nexs.com', phone: '081234567893' },
  ];

  const createdPengajar: any[] = [];
  for (const p of pengajarData) {
    const pengajar = await prisma.pengajar.upsert({
      where: { email: p.email },
      update: {},
      create: {
        name: p.name,
        email: p.email,
        phone: p.phone,
        status: 'AKTIF',
      },
    });
    createdPengajar.push(pengajar);

    // Create user account for each pengajar
    await prisma.user.upsert({
      where: { email: p.email },
      update: {},
      create: {
        name: p.name,
        email: p.email,
        password: 'sensei123',
        role: 'PENGAJAR',
        status: 'AKTIF',
        pengajarId: pengajar.id,
      },
    });
  }

  // 2. Seed Ruangan
  const ruanganData = [
    { nama: 'Room 1 (Tokyo)', kapasitas: 20 },
    { nama: 'Room 2 (Kyoto)', kapasitas: 15 },
    { nama: 'Room 3 (Osaka)', kapasitas: 12 },
    { nama: 'Room 4 (Hokkaido)', kapasitas: 10 },
  ];

  const createdRuangan: any[] = [];
  for (const r of ruanganData) {
    const ruangan = await prisma.ruangan.upsert({
      where: { nama: r.nama },
      update: {},
      create: {
        nama: r.nama,
        kapasitas: r.kapasitas,
        status: 'AKTIF',
      },
    });
    createdRuangan.push(ruangan);
  }

  // 3. Seed Kelas
  const kelasData = [
    { nama: 'JLPT N4 A (Reguler)', program: 'JLPT Preparation', level: 'N4', kapasitas: 15 },
    { nama: 'JLPT N5 A (Reguler)', program: 'JLPT Preparation', level: 'N5', kapasitas: 15 },
    { nama: 'JLPT N4 B (Weekend)', program: 'JLPT Preparation', level: 'N4', kapasitas: 12 },
    { nama: 'Percakapan Dasar A', program: 'Kaiwa Conversation', level: 'Dasar', kapasitas: 10 },
    { nama: 'Percakapan Bisnis B', program: 'Business Japanese', level: 'Menengah', kapasitas: 8 },
    { nama: 'Intensif N3 Pagi', program: 'JLPT Intensive', level: 'N3', kapasitas: 10 },
    { nama: 'Kids Japanese Class', program: 'General Japanese', level: 'Kids', kapasitas: 8 },
  ];

  const createdKelas: any[] = [];
  for (const k of kelasData) {
    const kelas = await prisma.kelas.upsert({
      where: { nama: k.nama },
      update: {},
      create: {
        nama: k.nama,
        program: k.program,
        level: k.level,
        kapasitas: k.kapasitas,
        status: 'AKTIF',
      },
    });
    createdKelas.push(kelas);
  }

  // 4. Seed Siswa
  const siswaNames = [
    'Ahmad Fauzi', 'Budi Santoso', 'Citra Dewi', 'Doni Pratama', 'Eka Rahmawati',
    'Fajar Nugraha', 'Gita Permata', 'Hadi Wijaya', 'Indah Lestari', 'Joko Susilo',
  ];

  for (let i = 0; i < siswaNames.length; i++) {
    const targetKelas = createdKelas[i % createdKelas.length];
    await prisma.siswa.create({
      data: {
        nama: siswaNames[i],
        email: `${siswaNames[i].toLowerCase().replace(' ', '.')}@gmail.com`,
        phone: `08129876543${i}`,
        status: 'AKTIF',
        kelasId: targetKelas.id,
      },
    });
  }

  console.log('✅ Database seeded successfully with initial NEXS data!');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
