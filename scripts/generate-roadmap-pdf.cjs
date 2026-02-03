const fs = require('fs');
const path = require('path');

const outputDir = path.join(__dirname, '..', 'docs');
const outputPath = path.join(outputDir, 'KilowattService-Roadmap.pdf');

const pageWidth = 595;
const pageHeight = 842;
const leftMargin = 60;

const palette = {
  black: [0, 0, 0],
  dark: [0.06, 0.06, 0.06],
  white: [1, 1, 1],
  gray: [0.7, 0.7, 0.7],
  muted: [0.55, 0.55, 0.55],
  neon: [0.639, 0.902, 0.208]
};

const phases = [
  {
    title: 'FASE 1 - Stabilizzazione',
    range: 'Feb - Mar 2026',
    items: [
      'QA generale e fix bug critici',
      'Performance e ottimizzazione immagini',
      'Pulizia dati catalogo e seo_config',
      'Rafforzamento sicurezza RLS + logging essenziale'
    ]
  },
  {
    title: 'FASE 2 - Preventivi & CRM',
    range: 'Apr - Mag 2026',
    items: [
      'Area utente con storico preventivi',
      'Export PDF preventivo + invio email',
      'Workflow quote (draft/sent/accepted)',
      'Pannello admin per catalogo e pacchetti'
    ]
  },
  {
    title: 'FASE 3 - Booking & Pagamenti',
    range: 'Giu - Lug 2026',
    items: [
      'Calendario disponibilita prodotti/servizi',
      'Pagamento online (Stripe) e acconti',
      'Gestione consegne e logistica',
      'Notifiche automatiche (email/whatsapp)'
    ]
  },
  {
    title: 'FASE 4 - Marketing & Insights',
    range: 'Ago - Set 2026',
    items: [
      'Dashboard KPI e analytics avanzati',
      'Portfolio/casi studio e blog',
      'SEO evoluto e schema markup',
      'Landing A/B test per campagne'
    ]
  }
];

const escapePdfText = (text) => text
  .replace(/\\/g, '\\\\')
  .replace(/\(/g, '\\(')
  .replace(/\)/g, '\\)');

const contentLines = [];
const push = (line) => contentLines.push(line);
const setFill = (color) => push(`${color[0]} ${color[1]} ${color[2]} rg`);
const setStroke = (color) => push(`${color[0]} ${color[1]} ${color[2]} RG`);

const drawRect = (x, y, w, h, fill = true, stroke = false) => {
  push(`${x} ${y} ${w} ${h} re`);
  if (fill && stroke) {
    push('B');
  } else if (fill) {
    push('f');
  } else if (stroke) {
    push('S');
  }
};

const drawText = (x, y, font, size, color, text) => {
  push('BT');
  push(`/F${font} ${size} Tf`);
  setFill(color);
  push(`1 0 0 1 ${x} ${y} Tm`);
  push(`(${escapePdfText(text)}) Tj`);
  push('ET');
};

// Background
push('q');
setFill(palette.black);
drawRect(0, 0, pageWidth, pageHeight, true, false);
push('Q');

// Neon accents
setFill(palette.neon);
drawRect(0, 760, pageWidth, 2, true, false);
drawRect(40, 0, 3, pageHeight, true, false);

// Logo and header
push('BT');
push('/F2 26 Tf');
setFill(palette.white);
push(`1 0 0 1 ${leftMargin} 792 Tm`);
push(`(${escapePdfText('KILOWATT')}) Tj`);
setFill(palette.neon);
push(`(${escapePdfText('.srv')}) Tj`);
push('ET');

drawText(leftMargin, 772, 1, 11, palette.gray, 'Eventi, Digital & Investimenti');
drawText(leftMargin, 745, 2, 16, palette.white, 'Roadmap funzionalita - proposta');
drawText(leftMargin, 728, 1, 10, palette.muted, 'Data: 02/02/2026');

// Timeline line
setStroke(palette.neon);
push('2 w');
push('90 160 m');
push('90 680 l');
push('S');

const nodeSize = 10;
const textStartX = 120;
const lineHeight = 14;

const nodeYs = [670, 520, 370, 220];

phases.forEach((phase, index) => {
  const y = nodeYs[index];
  setFill(palette.neon);
  drawRect(90 - nodeSize / 2, y - nodeSize / 2, nodeSize, nodeSize, true, false);

  drawText(textStartX, y + 10, 2, 12, palette.neon, phase.title);
  drawText(textStartX, y - 6, 1, 10, palette.muted, phase.range);

  let itemY = y - 26;
  phase.items.forEach((item) => {
    drawText(textStartX, itemY, 1, 11, palette.white, `- ${item}`);
    itemY -= lineHeight;
  });
});

// Footer
setFill(palette.neon);
drawRect(0, 58, pageWidth, 1.5, true, false);
drawText(leftMargin, 40, 1, 9, palette.muted, '(c) 2026 Kilowatt Service. Documento ad uso cliente.');

const contentStream = contentLines.join('\n');
const contentLength = Buffer.byteLength(contentStream, 'ascii');

const objects = [];
objects.push('1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n');
objects.push('2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n');
objects.push(
  '3 0 obj\n' +
  `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${pageWidth} ${pageHeight}] ` +
  '/Contents 4 0 R /Resources << /Font << /F1 5 0 R /F2 6 0 R >> >> >>\n' +
  'endobj\n'
);
objects.push(
  `4 0 obj\n<< /Length ${contentLength} >>\nstream\n${contentStream}\nendstream\nendobj\n`
);
objects.push('5 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\nendobj\n');
objects.push('6 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>\nendobj\n');

const header = '%PDF-1.4\n%KilowattService\n';
const chunks = [Buffer.from(header, 'ascii')];
let offset = Buffer.byteLength(header, 'ascii');
const offsets = [0];

objects.forEach((obj, index) => {
  offsets[index + 1] = offset;
  const buf = Buffer.from(obj, 'ascii');
  chunks.push(buf);
  offset += buf.length;
});

const xrefOffset = offset;
let xref = `xref\n0 ${objects.length + 1}\n`;
xref += '0000000000 65535 f \n';
for (let i = 1; i <= objects.length; i += 1) {
  const pad = String(offsets[i]).padStart(10, '0');
  xref += `${pad} 00000 n \n`;
}

const trailer =
  `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\n` +
  `startxref\n${xrefOffset}\n%%EOF\n`;

chunks.push(Buffer.from(xref + trailer, 'ascii'));

if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

fs.writeFileSync(outputPath, Buffer.concat(chunks));

console.log(`PDF generated at: ${outputPath}`);
