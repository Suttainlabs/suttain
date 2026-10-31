import { jsPDF } from 'jspdf';
import { base44 } from '@/api/base44Client';

// Shared download helpers for research results: CSV, JSON (including the stored raw engine response) and PDF reports.

const slug = s => String(s || 'suttain-result').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 60);
export const fileName = (title, id, ext) => `suttain-${slug(title)}${id ? `-${String(id).slice(-8)}` : ''}.${ext}`;

export function downloadText(name, text, mime = 'text/plain') {
  const url = URL.createObjectURL(new Blob([text], { type: `${mime};charset=utf-8` }));
  const a = document.createElement('a');
  a.href = url; a.download = name; document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 2000);
}

const cell = v => {
  const s = v == null ? '' : typeof v === 'object' ? JSON.stringify(v) : String(v);
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
};
export const toCsv = (header, rows) => [header, ...rows].map(r => r.map(cell).join(',')).join('\n');

// The complete engine response saved privately with the job.
export async function fetchStoredRaw(fileUri) {
  if (!fileUri) return null;
  const { signed_url } = await base44.integrations.Core.CreateFileSignedUrl({ file_uri: fileUri });
  const res = await fetch(signed_url);
  if (!res.ok) throw new Error('The stored engine response could not be loaded.');
  return res.json();
}

// Simple, clean PDF report. sections: [{ heading, rows: [[label, value]], text, note }]
export function pdfReport({ title, subtitle, meta = [], sections = [], citations = [], footer }) {
  const doc = new jsPDF({ unit: 'pt', format: 'a4' });
  const W = doc.internal.pageSize.getWidth(), H = doc.internal.pageSize.getHeight(), M = 48;
  let y = 0;
  const teal = [1, 84, 78];
  const ensure = h => { if (y + h > H - 56) { doc.addPage(); y = M; } };
  const wrap = (text, size, color = [26, 26, 26], style = 'normal', indent = 0) => {
    doc.setFont('helvetica', style); doc.setFontSize(size); doc.setTextColor(...color);
    for (const line of doc.splitTextToSize(String(text), W - 2 * M - indent)) { ensure(size * 1.4); doc.text(line, M + indent, y); y += size * 1.4; }
  };

  doc.setFillColor(...teal); doc.rect(0, 0, W, 96, 'F');
  doc.setTextColor(255, 255, 255); doc.setFont('helvetica', 'bold'); doc.setFontSize(10); doc.text('SUTTAIN RESEARCH', M, 34);
  doc.setFontSize(18); doc.text(doc.splitTextToSize(title, W - 2 * M)[0], M, 60);
  if (subtitle) { doc.setFont('helvetica', 'normal'); doc.setFontSize(10); doc.text(doc.splitTextToSize(subtitle, W - 2 * M)[0], M, 80); }
  y = 124;

  if (meta.length) {
    for (const [k, v] of meta) { ensure(16); doc.setFont('helvetica', 'normal'); doc.setFontSize(9); doc.setTextColor(110, 110, 110); doc.text(String(k), M, y); doc.setTextColor(26, 26, 26); const lines = doc.splitTextToSize(String(v ?? '—'), W - 2 * M - 140); doc.text(lines, M + 140, y); y += 14 * Math.max(1, lines.length); }
    y += 8;
  }
  for (const s of sections) {
    ensure(40); y += 6;
    doc.setDrawColor(220, 226, 224); doc.line(M, y, W - M, y); y += 18;
    wrap(s.heading, 12, teal, 'bold');
    if (s.text) wrap(s.text, 10);
    if (s.rows?.length) {
      for (const [label, value] of s.rows) {
        const lines = doc.splitTextToSize(String(value ?? '—'), 170);
        const labelLines = doc.splitTextToSize(String(label), W - 2 * M - 190);
        const h = 13 * Math.max(lines.length, labelLines.length) + 4; ensure(h);
        doc.setFont('helvetica', 'normal'); doc.setFontSize(9.5); doc.setTextColor(60, 60, 60); doc.text(labelLines, M, y);
        doc.setFont('courier', 'normal'); doc.setTextColor(26, 26, 26); doc.text(lines, W - M, y, { align: 'right' });
        y += h;
      }
    }
    if (s.note) { y += 2; wrap(s.note, 8.5, [110, 110, 110], 'italic'); }
  }
  if (citations.length) { ensure(40); y += 10; wrap('Citations', 12, teal, 'bold'); citations.forEach(c => wrap(`• ${c}`, 8.5, [80, 80, 80])); }
  const pages = doc.getNumberOfPages();
  for (let i = 1; i <= pages; i++) {
    doc.setPage(i); doc.setFont('helvetica', 'normal'); doc.setFontSize(8); doc.setTextColor(130, 130, 130);
    doc.text(footer || 'Machine-learning and computational predictions, not experimental measurements. Validate before use.', M, H - 28, { maxWidth: W - 2 * M - 60 });
    doc.text(`${i} / ${pages}`, W - M, H - 28, { align: 'right' });
  }
  return doc;
}
