const fs = require('fs');
const path = require('path');

const outputDir = path.join(__dirname, '..', 'docs');
const outputPath = path.join(outputDir, 'KilowattService-Architettura-Sistema.pdf');

const pageWidth = 595;
const pageHeight = 842;
const leftMargin = 60;
const rightMargin = 50;

const palette = {
  black: [0, 0, 0],
  dark: [0.06, 0.06, 0.06],
  white: [1, 1, 1],
  gray: [0.7, 0.7, 0.7],
  muted: [0.55, 0.55, 0.55],
  neon: [0.639, 0.902, 0.208]
};

const sections = [
  {
    title: 'PANORAMICA',
    items: [
      '- SPA React con routing client-side; build con Vite.',
      '- Backend as a Service con Supabase: Auth, Postgres, Storage.',
      '- Il client comunica direttamente con Supabase via @supabase/supabase-js.'
    ]
  },
  {
    title: 'FRONT-END',
    items: [
      '- React 18 + TypeScript.',
      '- Routing: React Router.',
      '- UI: Tailwind CSS, tailwind-merge, tailwindcss-animate, class-variance-authority.',
      '- Icone: Lucide React, React Icons; loader: ldrs.',
      '- Mappe e 3D: Leaflet, OGL WebGL.',
      '- SEO: react-helmet-async.',
      '- Font: Kanit, Montserrat da Google Fonts.'
    ]
  },
  {
    title: 'BACK-END - SUPABASE',
    items: [
      '- Auth: email/password e Google OAuth.',
      '- Database Postgres con tabelle per catalogo, servizi, pacchetti, preventivi e SEO.',
      '- Storage: bucket proposals per upload file proposte.',
      '- Sicurezza: RLS attivo con policy pubbliche in lettura e policy per proprietario.'
    ]
  },
  {
    title: 'DATI PRINCIPALI - TABELLE',
    items: [
      '- products, service_catalog, services.',
      '- packages, package_services, package_products.',
      '- quotes, quote_items.',
      '- projects.',
      '- seo_config.'
    ]
  },
  {
    title: 'FLUSSI PRINCIPALI',
    items: [
      '- Catalogo: lettura pubblica prodotti e servizi.',
      '- Preventivi: utente autenticato crea quote e items.',
      '- Power By: upload proposta e creazione record project.',
      '- SEO: settings per pagina, es. home.'
    ]
  },
  {
    title: 'CONFIGURAZIONE E BUILD',
    items: [
      '- Variabili: VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY.',
      '- GEMINI_API_KEY configurata in Vite, se necessaria.',
      '- Dev: npm run dev; Build: npm run build.'
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

// Top label box
setStroke(palette.neon);
push('1 w');
drawRect(410, 790, 140, 20, false, true);

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
drawText(leftMargin, 745, 2, 16, palette.white, 'Architettura e tecnologie');
drawText(leftMargin, 728, 1, 10, palette.muted, 'Data: 02/02/2026');
drawText(420, 796, 1, 9, palette.neon, 'DOCUMENTO TECNICO');

// Body sections
let cursorY = 690;
const headingSize = 12;
const bodySize = 11;
const lineHeight = 14;
const sectionGap = 8;

sections.forEach((section) => {
  drawText(leftMargin, cursorY, 2, headingSize, palette.neon, section.title);
  cursorY -= 18;
  section.items.forEach((item) => {
    drawText(leftMargin, cursorY, 1, bodySize, palette.white, item);
    cursorY -= lineHeight;
  });
  cursorY -= sectionGap;
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
