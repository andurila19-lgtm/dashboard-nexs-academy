import ExcelJS from 'exceljs';
import { RekapPengajarRow } from './types';

export async function exportRekapToExcel(
  data: RekapPengajarRow[],
  periodeInfo: string = 'Semua Periode'
) {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'NEXS Teaching Management';
  workbook.created = new Date();

  const worksheet = workbook.addWorksheet('Rekap Pengajar', {
    views: [{ showGridLines: true }],
  });

  // Title block
  worksheet.mergeCells('A1:G1');
  const titleCell = worksheet.getCell('A1');
  titleCell.value = 'NEXS JAPANESE LANGUAGE CENTER — REKAP PENGAJAR';
  titleCell.font = { name: 'Arial', size: 14, bold: true, color: { argb: 'FFFFFFFF' } };
  titleCell.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FF4F46E5' }, // Indigo
  };
  titleCell.alignment = { vertical: 'middle', horizontal: 'center' };
  worksheet.getRow(1).height = 35;

  // Subtitle
  worksheet.mergeCells('A2:G2');
  const subCell = worksheet.getCell('A2');
  subCell.value = `Periode: ${periodeInfo} | Diekspor pada: ${new Date().toLocaleString('id-ID')}`;
  subCell.font = { name: 'Arial', size: 10, italic: true, color: { argb: 'FF475569' } };
  subCell.alignment = { vertical: 'middle', horizontal: 'center' };
  worksheet.getRow(2).height = 22;

  // Empty row
  worksheet.getRow(3).height = 10;

  // Header row
  const headers = [
    'No',
    'Nama Pengajar',
    'Email',
    'Total Sesi',
    'Kehadiran (Selesai)',
    'Total Jam Mengajar',
    'Jurnal Terisi',
    'Jurnal Pending',
  ];

  const headerRow = worksheet.addRow(headers);
  headerRow.height = 26;
  headerRow.eachCell((cell) => {
    cell.font = { name: 'Arial', size: 10, bold: true, color: { argb: 'FFFFFFFF' } };
    cell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF1E293B' }, // Slate 800
    };
    cell.alignment = { vertical: 'middle', horizontal: 'center' };
    cell.border = {
      top: { style: 'thin', color: { argb: 'FFCBD5E1' } },
      bottom: { style: 'medium', color: { argb: 'FF64748B' } },
      left: { style: 'thin', color: { argb: 'FFCBD5E1' } },
      right: { style: 'thin', color: { argb: 'FFCBD5E1' } },
    };
  });

  // Data rows
  data.forEach((row, index) => {
    const dataRow = worksheet.addRow([
      index + 1,
      row.pengajarNama,
      row.pengajarEmail,
      row.totalSesi,
      row.totalKehadiran,
      `${row.totalJamMengajar} Jam`,
      row.totalJurnalDiisi,
      row.totalJurnalPending,
    ]);
    dataRow.height = 22;

    const isEven = index % 2 === 0;
    dataRow.eachCell((cell, colNumber) => {
      cell.font = { name: 'Arial', size: 9.5 };
      cell.border = {
        top: { style: 'thin', color: { argb: 'FFE2E8F0' } },
        bottom: { style: 'thin', color: { argb: 'FFE2E8F0' } },
        left: { style: 'thin', color: { argb: 'FFE2E8F0' } },
        right: { style: 'thin', color: { argb: 'FFE2E8F0' } },
      };

      if (isEven) {
        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FFF8FAFC' },
        };
      }

      if (colNumber === 1 || colNumber >= 4) {
        cell.alignment = { vertical: 'middle', horizontal: 'center' };
      } else {
        cell.alignment = { vertical: 'middle', horizontal: 'left' };
      }

      // Highlight pending journals
      if (colNumber === 8 && row.totalJurnalPending > 0) {
        cell.font = { name: 'Arial', size: 9.5, bold: true, color: { argb: 'FFDC2626' } };
      }
    });
  });

  // Auto-fit column widths
  worksheet.columns = [
    { width: 6 },
    { width: 28 },
    { width: 26 },
    { width: 14 },
    { width: 20 },
    { width: 20 },
    { width: 16 },
    { width: 16 },
  ];

  // Write buffer and trigger browser download
  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });
  const url = window.URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = `Rekap_Pengajar_NEXS_${new Date().toISOString().split('T')[0]}.xlsx`;
  anchor.click();
  window.URL.revokeObjectURL(url);
}
