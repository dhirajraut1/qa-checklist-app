import { jsPDF } from 'jspdf';
import { MODULES, calcProgress, formatDate } from './ticketUtils';

const INK = [23, 27, 29];
const INK_SOFT = [90, 100, 97];
const TEAL = [11, 110, 100];
const TEAL_DARK = [8, 60, 55];
const AMBER = [184, 114, 44];
const LINE = [216, 222, 219];
const PAGE_W = 210;
const PAGE_H = 297;
const MARGIN = 18;
const CONTENT_W = PAGE_W - MARGIN * 2;

export function downloadPdf(ticket) {
  const doc = new jsPDF({ unit: 'mm', format: 'a4' });
  const { total, selected, percent } = calcProgress(ticket);
  const modules = MODULES.filter((m) => ticket.selectedModules.includes(m.id));

  let y = MARGIN;

  const ensureSpace = (needed) => {
    if (y + needed > PAGE_H - MARGIN) {
      addFooter();
      doc.addPage();
      y = MARGIN;
    }
  };

  const addFooter = () => {
    const page = doc.internal.getNumberOfPages();
    doc.setFont('courier', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(...INK_SOFT);
    doc.text(`QA Manifest`, MARGIN, PAGE_H - 10);
    doc.text(`Page ${page}`, PAGE_W - MARGIN, PAGE_H - 10, { align: 'right' });
  };

  // ---- Header band ----
  doc.setFillColor(...TEAL_DARK);
  doc.rect(0, 0, PAGE_W, 34, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('courier', 'bold');
  doc.setFontSize(18);
  doc.text('QA TEST MANIFEST', MARGIN, 16);
  doc.setFont('courier', 'normal');
  doc.setFontSize(10);
  doc.text(`Ticket ${ticket.ticketId || 'UNTITLED'}`, MARGIN, 24);
  doc.setFontSize(8.5);
  doc.text(`Generated ${formatDate(new Date().toISOString())}`, MARGIN, 30);

  y = 42;

  // ---- Meta block ----
  doc.setTextColor(...INK);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.text(ticket.ticketTitle || 'Untitled ticket', MARGIN, y);
  y += 8;

  const metaRows = [
    ['Tester', ticket.testerName || '—'],
    ['Modules', modules.map((m) => m.shortName).join(', ') || '—'],
    ['Created', formatDate(ticket.createdAt)],
    ['Updated', formatDate(ticket.updatedAt)],
  ];
  doc.setFontSize(9.5);
  metaRows.forEach(([label, val]) => {
    doc.setFont('courier', 'bold');
    doc.setTextColor(...INK_SOFT);
    doc.text(`${label.toUpperCase()}`, MARGIN, y);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...INK);
    doc.text(String(val), MARGIN + 28, y);
    y += 5.5;
  });

  y += 2;
  // Progress bar
  doc.setFont('courier', 'bold');
  doc.setTextColor(...INK_SOFT);
  doc.text(`PROGRESS`, MARGIN, y);
  doc.setTextColor(...INK);
  doc.text(`${selected}/${total} items  (${percent}%)`, MARGIN + 28, y);
  const barX = MARGIN + 78;
  const barW = CONTENT_W - 78;
  doc.setDrawColor(...LINE);
  doc.setFillColor(240, 242, 241);
  doc.roundedRect(barX, y - 3.2, barW, 4, 1, 1, 'FD');
  doc.setFillColor(...TEAL);
  const fillW = Math.max(2, (barW * percent) / 100);
  doc.roundedRect(barX, y - 3.2, fillW, 4, 1, 1, 'F');
  y += 9;

  doc.setDrawColor(...LINE);
  doc.line(MARGIN, y, PAGE_W - MARGIN, y);
  y += 8;

  // ---- Modules & items ----
  modules.forEach((mod) => {
    const relevantCats = mod.categories
      .map((cat) => ({
        ...cat,
        items: cat.items.filter((it) => ticket.itemStates?.[it.id]?.selected),
      }))
      .filter((cat) => cat.items.length > 0);

    if (relevantCats.length === 0) return;

    ensureSpace(14);
    doc.setFillColor(...TEAL);
    doc.rect(MARGIN, y - 4.5, 2.2, 6, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.setTextColor(...TEAL_DARK);
    doc.text(mod.name, MARGIN + 5, y);
    y += 7;

    relevantCats.forEach((cat) => {
      ensureSpace(8);
      doc.setFont('courier', 'bold');
      doc.setFontSize(9);
      doc.setTextColor(...INK_SOFT);
      doc.text(cat.name.toUpperCase(), MARGIN + 3, y);
      y += 5.5;

      cat.items.forEach((item) => {
        const state = ticket.itemStates?.[item.id] || {};
        const textLines = doc.splitTextToSize(item.text, CONTENT_W - 14);
        const remarkLines = state.remark?.trim()
          ? doc.splitTextToSize(`Remark: ${state.remark.trim()}`, CONTENT_W - 18)
          : [];
        const blockH = textLines.length * 5 + remarkLines.length * 4.6 + 2.5;
        ensureSpace(blockH);

        // checkbox
        doc.setDrawColor(...TEAL);
        doc.setLineWidth(0.4);
        doc.roundedRect(MARGIN + 3, y - 3.6, 3.4, 3.4, 0.6, 0.6);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(7.5);
        doc.setTextColor(...TEAL);
        doc.text('X', MARGIN + 4.05, y - 1.05);

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(9.5);
        doc.setTextColor(...INK);
        doc.text(textLines, MARGIN + 10, y);
        y += textLines.length * 5;

        if (remarkLines.length) {
          doc.setFont('helvetica', 'italic');
          doc.setFontSize(8.5);
          doc.setTextColor(...AMBER);
          doc.text(remarkLines, MARGIN + 10, y);
          y += remarkLines.length * 4.6;
        }
        y += 2.5;
      });
      y += 1.5;
    });
    y += 2;
  });

  // ---- Overall remarks ----
  ensureSpace(20);
  doc.setDrawColor(...LINE);
  doc.line(MARGIN, y, PAGE_W - MARGIN, y);
  y += 8;
  doc.setFillColor(...AMBER);
  doc.rect(MARGIN, y - 4.5, 2.2, 6, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(...AMBER);
  doc.text('Overall Remarks', MARGIN + 5, y);
  y += 7;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9.5);
  doc.setTextColor(...INK);
  const overallText = ticket.overallRemarks?.trim() || 'No overall remarks provided.';
  const overallLines = doc.splitTextToSize(overallText, CONTENT_W - 4);
  overallLines.forEach((line) => {
    ensureSpace(5);
    doc.text(line, MARGIN + 2, y);
    y += 5;
  });

  addFooter();
  doc.save(`${(ticket.ticketId || 'qa-checklist').replace(/[^a-z0-9-_]+/gi, '_')}.pdf`);
}
