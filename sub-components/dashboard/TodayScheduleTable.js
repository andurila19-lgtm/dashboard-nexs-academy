'use client'
import Link from 'next/link';
import { Col, Row, Card, Table, Badge } from 'react-bootstrap';
import { useData } from 'context/DataContext';
import { useAuth } from 'context/AuthContext';

const statusBadge = (status) => {
    const map = {
        'aktif': { bg: 'light', text: 'dark', label: 'Belum Mulai' },
        'mengajar': { bg: 'primary', text: 'white', label: 'Sedang Mengajar' },
        'selesai': { bg: 'success', text: 'white', label: 'Selesai' },
        'dibatalkan': { bg: 'secondary', text: 'white', label: 'Dibatalkan' },
    };
    const s = map[status] || map['aktif'];
    return <Badge bg={s.bg} text={s.text === 'dark' ? 'dark' : undefined}>{s.label}</Badge>;
};

const absenBadge = (absensi) => {
    if (!absensi) return <Badge bg="light" text="dark">—</Badge>;
    const map = {
        'mengajar': { bg: 'info', label: 'Mengajar' },
        'selesai': { bg: 'success', label: 'Hadir' },
        'terlambat': { bg: 'warning', label: 'Terlambat' },
    };
    const s = map[absensi.status] || { bg: 'secondary', label: absensi.status };
    return <Badge bg={s.bg}>{s.label}</Badge>;
};

const jurnalBadge = (jurnal) => {
    if (!jurnal) return <Badge bg="light" text="dark">Belum Diisi</Badge>;
    const map = {
        'draft': { bg: 'warning', label: 'Draft' },
        'diisi': { bg: 'success', label: 'Sudah Diisi' },
        'direview': { bg: 'info', label: 'Direview' },
    };
    const s = map[jurnal.status] || { bg: 'secondary', label: jurnal.status };
    return <Badge bg={s.bg}>{s.label}</Badge>;
};

const TodayScheduleTable = () => {
    const { getTodaySchedule, getPengajarById, getKelasById, getRuanganById, getAbsensiByJadwal, getJurnalByJadwal } = useData();
    const { currentUser, isPengajar } = useAuth();

    const schedule = isPengajar
        ? getTodaySchedule(currentUser.id)
        : getTodaySchedule();

    return (
        <Row className="mt-6">
            <Col md={12} xs={12}>
                <Card>
                    <Card.Header className="bg-white py-4">
                        <h4 className="mb-0">Jadwal Hari Ini</h4>
                    </Card.Header>
                    {schedule.length === 0 ? (
                        <Card.Body className="text-center py-6">
                            <i className="fe fe-calendar text-muted mb-3" style={{ fontSize: '2.5rem' }}></i>
                            <p className="text-muted mb-0">Tidak ada jadwal untuk hari ini</p>
                        </Card.Body>
                    ) : (
                        <Table responsive className="text-nowrap mb-0">
                            <thead className="table-light">
                                <tr>
                                    <th>Jam</th>
                                    <th>Kelas</th>
                                    {!isPengajar && <th>Pengajar</th>}
                                    <th>Ruangan</th>
                                    <th>Status</th>
                                    <th>Absensi</th>
                                    <th>Jurnal</th>
                                </tr>
                            </thead>
                            <tbody>
                                {schedule.map((item) => {
                                    const pengajar = getPengajarById(item.pengajarId);
                                    const kelas = getKelasById(item.kelasId);
                                    const ruangan = getRuanganById(item.ruanganId);
                                    const absensi = getAbsensiByJadwal(item.id);
                                    const jurnal = getJurnalByJadwal(item.id);
                                    return (
                                        <tr key={item.id}>
                                            <td className="align-middle">
                                                <span className="fw-semi-bold">{item.jamMulai}–{item.jamSelesai}</span>
                                            </td>
                                            <td className="align-middle">
                                                <span className="fw-semi-bold">{kelas?.nama || '—'}</span>
                                            </td>
                                            {!isPengajar && (
                                                <td className="align-middle">{pengajar?.name || '—'}</td>
                                            )}
                                            <td className="align-middle">{ruangan?.nama || '—'}</td>
                                            <td className="align-middle">{statusBadge(item.status)}</td>
                                            <td className="align-middle">{absenBadge(absensi)}</td>
                                            <td className="align-middle">{jurnalBadge(jurnal)}</td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </Table>
                    )}
                </Card>
            </Col>
        </Row>
    )
}

export default TodayScheduleTable;
