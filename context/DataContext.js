'use client'
import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { v4 as uuid } from 'uuid';
import { getSeedData } from 'data/nexs/seedData';

const DataContext = createContext(null);

// Helper: get day name in Indonesian
const HARI_NAMES = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];

function getDayName(date) {
  return HARI_NAMES[new Date(date).getDay()];
}

// Helper: generate recurring schedule instances
function generateScheduleInstances(pattern) {
  const instances = [];
  const startDate = new Date(pattern.tanggalMulai);
  const endDate = new Date(pattern.tanggalSelesai);
  
  if (pattern.tipe === 'sekali') {
    instances.push({
      id: uuid(),
      patternId: pattern.id,
      pengajarId: pattern.pengajarId,
      kelasId: pattern.kelasId,
      ruanganId: pattern.ruanganId,
      tanggal: pattern.tanggalMulai,
      hari: getDayName(pattern.tanggalMulai),
      jamMulai: pattern.jamMulai,
      jamSelesai: pattern.jamSelesai,
      status: 'aktif'
    });
    return instances;
  }

  // Recurring
  const current = new Date(startDate);
  while (current <= endDate) {
    const dayName = getDayName(current);
    if (pattern.hari.includes(dayName)) {
      const dateStr = current.toISOString().split('T')[0];
      instances.push({
        id: uuid(),
        patternId: pattern.id,
        pengajarId: pattern.pengajarId,
        kelasId: pattern.kelasId,
        ruanganId: pattern.ruanganId,
        tanggal: dateStr,
        hari: dayName,
        jamMulai: pattern.jamMulai,
        jamSelesai: pattern.jamSelesai,
        status: 'aktif'
      });
    }
    current.setDate(current.getDate() + 1);
  }
  return instances;
}

// Helper: check schedule conflict
function checkConflict(newSchedule, existingInstances, excludePatternId = null) {
  const conflicts = [];
  const newInstances = generateScheduleInstances(newSchedule);
  
  for (const newInst of newInstances) {
    for (const existing of existingInstances) {
      if (excludePatternId && existing.patternId === excludePatternId) continue;
      if (existing.status === 'dibatalkan') continue;
      
      // Same date, same pengajar
      if (existing.tanggal === newInst.tanggal && existing.pengajarId === newInst.pengajarId) {
        // Check time overlap
        if (newInst.jamMulai < existing.jamSelesai && newInst.jamSelesai > existing.jamMulai) {
          conflicts.push({
            date: existing.tanggal,
            existingTime: `${existing.jamMulai}–${existing.jamSelesai}`,
            newTime: `${newInst.jamMulai}–${newInst.jamSelesai}`
          });
        }
      }
      
      // Same date, same ruangan
      if (existing.tanggal === newInst.tanggal && existing.ruanganId === newInst.ruanganId) {
        if (newInst.jamMulai < existing.jamSelesai && newInst.jamSelesai > existing.jamMulai) {
          conflicts.push({
            date: existing.tanggal,
            type: 'ruangan',
            existingTime: `${existing.jamMulai}–${existing.jamSelesai}`,
            newTime: `${newInst.jamMulai}–${newInst.jamSelesai}`
          });
        }
      }
    }
  }
  return conflicts;
}

// Time helper
function parseTime(timeStr) {
  const [h, m] = timeStr.split(':').map(Number);
  return h * 60 + m;
}

function formatDuration(minutes) {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h === 0) return `${m} menit`;
  if (m === 0) return `${h} jam`;
  return `${h} jam ${m} menit`;
}

const STORAGE_KEY = 'nexs_data';

export function DataProvider({ children }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Initialize data
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        setData(JSON.parse(saved));
      } else {
        const seed = getSeedData();
        setData(seed);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(seed));
      }
    } catch (e) {
      const seed = getSeedData();
      setData(seed);
    }
    setLoading(false);
  }, []);

  // Persist on change
  useEffect(() => {
    if (data && !loading) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    }
  }, [data, loading]);

  // ==================== PENGAJAR ====================
  const getPengajar = useCallback(() => data?.pengajar || [], [data]);
  
  const addPengajar = useCallback((pengajar) => {
    const newPengajar = { ...pengajar, id: uuid() };
    setData(prev => ({ ...prev, pengajar: [...prev.pengajar, newPengajar] }));
    return newPengajar;
  }, []);

  const updatePengajar = useCallback((id, updates) => {
    setData(prev => ({
      ...prev,
      pengajar: prev.pengajar.map(p => p.id === id ? { ...p, ...updates } : p)
    }));
  }, []);

  const deletePengajar = useCallback((id) => {
    setData(prev => ({
      ...prev,
      pengajar: prev.pengajar.filter(p => p.id !== id)
    }));
  }, []);

  // ==================== KELAS ====================
  const getKelas = useCallback(() => data?.kelas || [], [data]);
  
  const addKelas = useCallback((kelas) => {
    const newKelas = { ...kelas, id: uuid() };
    setData(prev => ({ ...prev, kelas: [...prev.kelas, newKelas] }));
    return newKelas;
  }, []);

  const updateKelas = useCallback((id, updates) => {
    setData(prev => ({
      ...prev,
      kelas: prev.kelas.map(k => k.id === id ? { ...k, ...updates } : k)
    }));
  }, []);

  const deleteKelas = useCallback((id) => {
    setData(prev => ({
      ...prev,
      kelas: prev.kelas.filter(k => k.id !== id)
    }));
  }, []);

  // ==================== SISWA ====================
  const getSiswa = useCallback(() => data?.siswa || [], [data]);
  
  const addSiswa = useCallback((siswa) => {
    const newSiswa = { ...siswa, id: uuid() };
    setData(prev => ({ ...prev, siswa: [...prev.siswa, newSiswa] }));
    return newSiswa;
  }, []);

  const updateSiswa = useCallback((id, updates) => {
    setData(prev => ({
      ...prev,
      siswa: prev.siswa.map(s => s.id === id ? { ...s, ...updates } : s)
    }));
  }, []);

  const deleteSiswa = useCallback((id) => {
    setData(prev => ({
      ...prev,
      siswa: prev.siswa.filter(s => s.id !== id)
    }));
  }, []);

  // ==================== RUANGAN ====================
  const getRuangan = useCallback(() => data?.ruangan || [], [data]);
  
  const addRuangan = useCallback((ruangan) => {
    const newRuangan = { ...ruangan, id: uuid() };
    setData(prev => ({ ...prev, ruangan: [...prev.ruangan, newRuangan] }));
    return newRuangan;
  }, []);

  const updateRuangan = useCallback((id, updates) => {
    setData(prev => ({
      ...prev,
      ruangan: prev.ruangan.map(r => r.id === id ? { ...r, ...updates } : r)
    }));
  }, []);

  const deleteRuangan = useCallback((id) => {
    setData(prev => ({
      ...prev,
      ruangan: prev.ruangan.filter(r => r.id !== id)
    }));
  }, []);

  // ==================== JADWAL PATTERNS ====================
  const getJadwalPatterns = useCallback(() => data?.jadwalPatterns || [], [data]);
  
  const addJadwalPattern = useCallback((pattern) => {
    const newPattern = { ...pattern, id: uuid() };
    const instances = generateScheduleInstances(newPattern);
    setData(prev => ({
      ...prev,
      jadwalPatterns: [...prev.jadwalPatterns, newPattern],
      jadwalInstances: [...prev.jadwalInstances, ...instances]
    }));
    return { pattern: newPattern, instances };
  }, []);

  const updateJadwalPattern = useCallback((id, updates) => {
    setData(prev => {
      const updatedPattern = { ...prev.jadwalPatterns.find(p => p.id === id), ...updates };
      // Regenerate instances (only future ones, keep past attendance)
      const today = new Date().toISOString().split('T')[0];
      const oldInstances = prev.jadwalInstances.filter(
        i => i.patternId === id && i.tanggal < today
      );
      const otherInstances = prev.jadwalInstances.filter(i => i.patternId !== id);
      const newInstances = generateScheduleInstances(updatedPattern).filter(
        i => i.tanggal >= today
      );
      return {
        ...prev,
        jadwalPatterns: prev.jadwalPatterns.map(p => p.id === id ? updatedPattern : p),
        jadwalInstances: [...otherInstances, ...oldInstances, ...newInstances]
      };
    });
  }, []);

  const deleteJadwalPattern = useCallback((id) => {
    setData(prev => ({
      ...prev,
      jadwalPatterns: prev.jadwalPatterns.filter(p => p.id !== id),
      jadwalInstances: prev.jadwalInstances.filter(i => i.patternId !== id)
    }));
  }, []);

  // ==================== JADWAL INSTANCES ====================
  const getJadwalInstances = useCallback(() => data?.jadwalInstances || [], [data]);
  
  const updateJadwalInstance = useCallback((id, updates) => {
    setData(prev => ({
      ...prev,
      jadwalInstances: prev.jadwalInstances.map(i => i.id === id ? { ...i, ...updates } : i)
    }));
  }, []);

  const cancelJadwalInstance = useCallback((id) => {
    setData(prev => ({
      ...prev,
      jadwalInstances: prev.jadwalInstances.map(i => 
        i.id === id ? { ...i, status: 'dibatalkan' } : i
      )
    }));
  }, []);

  // Get today's schedule
  const getTodaySchedule = useCallback((pengajarId = null) => {
    if (!data) return [];
    const today = new Date().toISOString().split('T')[0];
    let instances = data.jadwalInstances.filter(i => i.tanggal === today && i.status !== 'dibatalkan');
    if (pengajarId) {
      instances = instances.filter(i => i.pengajarId === pengajarId);
    }
    return instances.sort((a, b) => a.jamMulai.localeCompare(b.jamMulai));
  }, [data]);

  // Check conflicts
  const checkScheduleConflict = useCallback((newSchedule, excludePatternId = null) => {
    if (!data) return [];
    return checkConflict(newSchedule, data.jadwalInstances, excludePatternId);
  }, [data]);

  // ==================== ABSENSI ====================
  const getAbsensi = useCallback(() => data?.absensi || [], [data]);
  
  const startTeaching = useCallback((jadwalInstanceId) => {
    const now = new Date();
    const timeStr = now.toTimeString().slice(0, 5);
    const instance = data.jadwalInstances.find(i => i.id === jadwalInstanceId);
    
    let status = 'mengajar';
    if (instance && timeStr > instance.jamMulai) {
      const lateMinutes = parseTime(timeStr) - parseTime(instance.jamMulai);
      if (lateMinutes > 15) status = 'terlambat';
    }

    const absensiRecord = {
      id: uuid(),
      jadwalInstanceId,
      pengajarId: instance.pengajarId,
      kelasId: instance.kelasId,
      tanggal: instance.tanggal,
      jamJadwalMulai: instance.jamMulai,
      jamJadwalSelesai: instance.jamSelesai,
      jamMulaiAktual: timeStr,
      jamSelesaiAktual: null,
      durasi: null,
      status
    };

    setData(prev => ({
      ...prev,
      absensi: [...prev.absensi, absensiRecord],
      jadwalInstances: prev.jadwalInstances.map(i => 
        i.id === jadwalInstanceId ? { ...i, status: 'mengajar' } : i
      )
    }));

    return absensiRecord;
  }, [data]);

  const finishTeaching = useCallback((jadwalInstanceId) => {
    const now = new Date();
    const timeStr = now.toTimeString().slice(0, 5);

    setData(prev => {
      const absensi = prev.absensi.find(
        a => a.jadwalInstanceId === jadwalInstanceId && !a.jamSelesaiAktual
      );
      if (!absensi) return prev;

      const durasiMinutes = parseTime(timeStr) - parseTime(absensi.jamMulaiAktual);

      return {
        ...prev,
        absensi: prev.absensi.map(a => 
          a.id === absensi.id 
            ? { ...a, jamSelesaiAktual: timeStr, durasi: durasiMinutes, status: 'selesai' }
            : a
        ),
        jadwalInstances: prev.jadwalInstances.map(i => 
          i.id === jadwalInstanceId ? { ...i, status: 'selesai' } : i
        )
      };
    });
  }, []);

  // ==================== JURNAL ====================
  const getJurnal = useCallback(() => data?.jurnal || [], [data]);
  
  const addJurnal = useCallback((jurnal) => {
    const newJurnal = { ...jurnal, id: uuid(), createdAt: new Date().toISOString() };
    setData(prev => ({ ...prev, jurnal: [...prev.jurnal, newJurnal] }));
    return newJurnal;
  }, []);

  const updateJurnal = useCallback((id, updates) => {
    setData(prev => ({
      ...prev,
      jurnal: prev.jurnal.map(j => j.id === id ? { ...j, ...updates, updatedAt: new Date().toISOString() } : j)
    }));
  }, []);

  // ==================== HELPERS ====================
  const getPengajarById = useCallback((id) => data?.pengajar?.find(p => p.id === id), [data]);
  const getKelasById = useCallback((id) => data?.kelas?.find(k => k.id === id), [data]);
  const getRuanganById = useCallback((id) => data?.ruangan?.find(r => r.id === id), [data]);
  
  const getSiswaByKelas = useCallback((kelasId) => {
    return (data?.siswa || []).filter(s => s.kelasId === kelasId);
  }, [data]);

  const getAbsensiByJadwal = useCallback((jadwalInstanceId) => {
    return (data?.absensi || []).find(a => a.jadwalInstanceId === jadwalInstanceId);
  }, [data]);

  const getJurnalByJadwal = useCallback((jadwalInstanceId) => {
    return (data?.jurnal || []).find(j => j.jadwalInstanceId === jadwalInstanceId);
  }, [data]);

  // Reset data
  const resetData = useCallback(() => {
    const seed = getSeedData();
    setData(seed);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(seed));
  }, []);

  if (loading || !data) {
    return <DataContext.Provider value={{ loading: true }}>{children}</DataContext.Provider>;
  }

  return (
    <DataContext.Provider value={{
      loading: false,
      // Pengajar
      getPengajar, addPengajar, updatePengajar, deletePengajar, getPengajarById,
      // Kelas
      getKelas, addKelas, updateKelas, deleteKelas, getKelasById,
      // Siswa
      getSiswa, addSiswa, updateSiswa, deleteSiswa, getSiswaByKelas,
      // Ruangan
      getRuangan, addRuangan, updateRuangan, deleteRuangan, getRuanganById,
      // Jadwal
      getJadwalPatterns, addJadwalPattern, updateJadwalPattern, deleteJadwalPattern,
      getJadwalInstances, updateJadwalInstance, cancelJadwalInstance,
      getTodaySchedule, checkScheduleConflict,
      // Absensi
      getAbsensi, startTeaching, finishTeaching, getAbsensiByJadwal,
      // Jurnal
      getJurnal, addJurnal, updateJurnal, getJurnalByJadwal,
      // Helpers
      formatDuration, resetData,
      // Generate instances (exposed for external use)
      generateScheduleInstances
    }}>
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within DataProvider');
  }
  return context;
}

export { generateScheduleInstances, checkConflict, getDayName, HARI_NAMES, formatDuration, parseTime };

export default DataContext;
