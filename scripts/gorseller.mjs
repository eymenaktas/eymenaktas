#!/usr/bin/env node
/**
 * PROFİL GÖRSELLERİ — başlık bandı, bölüm başlıkları, kartlar, alt bant
 * ====================================================================
 *
 * capsule-render ve readme-typing-svg Vercel'de koşuyor; aktivite
 * grafiği servisi de Vercel'deydi ve 402 vermeye başladı. Aynı akıbete
 * düşmemek için tüm dekoratif görselleri burada üretiyoruz. Animasyonlar
 * SVG içi CSS: GitHub <img> ile gösterdiğinde de oynuyor.
 *
 *   node scripts/gorseller.mjs dist
 */

import { mkdir, writeFile } from "node:fs/promises";

const HEDEF = process.argv[2] ?? "dist";
const W = 900;

const R = {
  zemin: "#0d1117",
  kart: "#111823",
  kenar: "#1f2733",
  mavi: "#ff5b4a",
  acik: "#ff8a7a",
  metin: "#e6edf3",
  soluk: "#8b949e",
};
const SANS = "'Segoe UI',Ubuntu,'Helvetica Neue',sans-serif";
const MONO = "'JetBrains Mono',ui-monospace,SFMono-Regular,Menlo,Consolas,monospace";
const kacis = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

/** Hareket azaltma tercihi olan izleyicide her şey durur. */
const SAKIN = "@media (prefers-reduced-motion: reduce){*{animation:none!important}.ilk{opacity:1!important}}";

// ---------------------------------------------------------------- başlık
const SATIRLAR = [
  "I run my own servers.",
  "I train my own models.",
  "I build what I want to use.",
  "Measure, don't guess.",
];

function baslik() {
  const H = 300;
  const adim = 3.2; // her satırın ekranda kaldığı süre (sn)
  const dongu = adim * SATIRLAR.length;
  const pay = (100 / SATIRLAR.length).toFixed(3);
  // Her satır kendi diliminde: kısa giriş, bekle, kısa çıkış.
  const kf = `@keyframes satir{0%{opacity:0;transform:translateY(8px)}3%{opacity:1;transform:none}${(pay - 3).toFixed(2)}%{opacity:1;transform:none}${pay}%{opacity:0;transform:translateY(-8px)}100%{opacity:0}}`;
  const satirlar = SATIRLAR.map(
    (s, i) =>
      `<text x="${W / 2}" y="214" class="satir${i === 0 ? ' ilk' : ''}" style="animation-delay:${(i * adim).toFixed(1)}s" text-anchor="middle"><tspan fill="${R.acik}">$</tspan> ${kacis(s)}</text>`
  ).join("\n    ");

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" role="img" aria-label="Eymen Aktaş — developer from Istanbul">
  <title>Eymen Aktaş — developer from Istanbul</title>
  <defs>
    <radialGradient id="k1" cx="50%" cy="50%" r="50%"><stop offset="0" stop-color="${R.mavi}" stop-opacity=".55"/><stop offset="1" stop-color="${R.mavi}" stop-opacity="0"/></radialGradient>
    <radialGradient id="k2" cx="50%" cy="50%" r="50%"><stop offset="0" stop-color="${R.acik}" stop-opacity=".35"/><stop offset="1" stop-color="${R.acik}" stop-opacity="0"/></radialGradient>
    <radialGradient id="k3" cx="50%" cy="50%" r="50%"><stop offset="0" stop-color="#bb2a2a" stop-opacity=".28"/><stop offset="1" stop-color="#bb2a2a" stop-opacity="0"/></radialGradient>
    <linearGradient id="ad" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#ffffff"/><stop offset=".55" stop-color="#d6e4ff"/><stop offset="1" stop-color="${R.acik}"/></linearGradient>
    <linearGradient id="kenar" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${R.mavi}" stop-opacity=".9"/><stop offset=".5" stop-color="${R.kenar}"/><stop offset="1" stop-color="${R.acik}" stop-opacity=".7"/></linearGradient>
    <pattern id="izgara" width="28" height="28" patternUnits="userSpaceOnUse"><path d="M28 0H0V28" fill="none" stroke="#ffffff" stroke-opacity=".035"/></pattern>
    <clipPath id="kirp"><rect width="${W}" height="${H}" rx="20"/></clipPath>
  </defs>
  <style>
    .ad{font:700 60px ${SANS};letter-spacing:-1.5px}
    .alt{font:500 15px ${SANS};letter-spacing:4px;text-transform:uppercase}
    .satir{font:500 19px ${MONO};fill:${R.metin};opacity:0;animation:satir ${dongu}s linear infinite}
    .imlec{animation:yanip 1s steps(1) infinite}
    .y1{animation:suzul 14s ease-in-out infinite alternate}
    .y2{animation:suzul 18s ease-in-out infinite alternate-reverse}
    .y3{animation:suzul 22s ease-in-out infinite alternate}
    ${kf}
    @keyframes yanip{50%{opacity:0}}
    @keyframes suzul{from{transform:translate(0,0)}to{transform:translate(60px,-24px)}}
    ${SAKIN}
  </style>
  <g clip-path="url(#kirp)">
    <rect width="${W}" height="${H}" fill="${R.zemin}"/>
    <ellipse class="y1" cx="170" cy="60" rx="320" ry="200" fill="url(#k1)"/>
    <ellipse class="y2" cx="760" cy="250" rx="300" ry="190" fill="url(#k2)"/>
    <ellipse class="y3" cx="620" cy="10" rx="220" ry="140" fill="url(#k3)"/>
    <rect width="${W}" height="${H}" fill="url(#izgara)"/>
  </g>
  <rect x=".75" y=".75" width="${W - 1.5}" height="${H - 1.5}" rx="19.25" fill="none" stroke="url(#kenar)" stroke-width="1.5"/>

  <g>
    <text x="${W / 2}" y="112" class="ad" fill="url(#ad)" text-anchor="middle">Eymen Aktaş</text>
  </g>
  <g>
    <text x="${W / 2}" y="150" class="alt" fill="${R.soluk}" text-anchor="middle">Developer · Istanbul · Akts Studio</text>
    <rect x="${W / 2 - 230}" y="182" width="460" height="48" rx="12" fill="#000" fill-opacity=".35" stroke="${R.kenar}"/>
    <circle cx="${W / 2 - 210}" cy="206" r="4" fill="#f28b82" fill-opacity=".8"/>
    <circle cx="${W / 2 - 196}" cy="206" r="4" fill="#fdd663" fill-opacity=".8"/>
    <circle cx="${W / 2 - 182}" cy="206" r="4" fill="#81c995" fill-opacity=".8"/>
    ${satirlar}
  </g>
</svg>
`;
}

// ------------------------------------------------------- bölüm başlıkları
const BOLUM_IKON = {
  yap: '<path d="m16 18 6-6-6-6M8 6l-6 6 6 6"/>',
  studyo: '<path d="M3 21h18M5 21V7l7-4 7 4v14M9 21v-6h6v6"/>',
  arac: '<path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94z"/>',
  istatistik: '<path d="M3 3v18h18"/><path d="M7 16v-4M12 16V8M17 16v-7"/>',
  aktivite: '<path d="M22 12h-4l-3 9L9 3l-3 9H2"/>',
  yilan: '<path d="M4 18c0-3 2-4 4-4h8c2 0 4-1 4-4s-2-4-4-4H8"/><circle cx="6" cy="6" r="2"/>',
  iletisim: '<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>',
};

/** Açık temada yazı renkleri; zemin şeffaf olduğu için yalnız bunlar değişir. */
const ACIK = { metin: "#1f2328", soluk: "#59636e", acik: "#c8281c" };
const renk = (tema) => (tema === "acik" ? ACIK : R);

function bolum(ikon, no, metin, tema) {
  const H = 64;
  const T = renk(tema);
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" role="img" aria-label="${kacis(metin)}">
  <title>${kacis(metin)}</title>
  <defs>
    <linearGradient id="c1" x1="0" x2="1"><stop offset="0" stop-color="${R.mavi}" stop-opacity="0"/><stop offset="1" stop-color="${R.mavi}" stop-opacity=".7"/></linearGradient>
    <linearGradient id="c2" x1="0" x2="1"><stop offset="0" stop-color="${R.mavi}" stop-opacity=".7"/><stop offset="1" stop-color="${R.mavi}" stop-opacity="0"/></linearGradient>
  </defs>
  <style>.n{font:600 12px ${MONO};letter-spacing:2px}.m{font:700 24px ${SANS};letter-spacing:-.3px}</style>
  <line x1="40" y1="32" x2="290" y2="32" stroke="url(#c1)"/>
  <line x1="${W - 290}" y1="32" x2="${W - 40}" y2="32" stroke="url(#c2)"/>
  <g transform="translate(${W / 2} 0)">
    <text x="0" y="16" class="n" fill="${T.acik}" text-anchor="middle">${no}</text>
    <g transform="translate(${-(metin.length * 24 * 0.55) / 2 - 34} 28) scale(.9)" fill="none" stroke="${T.acik}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" opacity=".9">${BOLUM_IKON[ikon]}</g>
    <text x="0" y="48" class="m" fill="${T.metin}" text-anchor="middle">${kacis(metin)}</text>
  </g>
</svg>
`;
}

// -------------------------------------------------------------- kartlar
const KARTLAR = [
  {
    ikon: '<rect x="2" y="2" width="20" height="8" rx="2"/><rect x="2" y="14" width="20" height="8" rx="2"/><path d="M6 6h.01M6 18h.01"/>',
    baslik: "Self-hosting",
    metin: ["I'd rather run it than rent it.", "Mail, databases, reverse proxies —", "I want to know what every", "service on the box is doing."],
  },
  {
    ikon: '<path d="M12 5a3 3 0 1 0-5.99.13 4 4 0 0 0-2.53 5.77 4 4 0 0 0 .56 6.6A4 4 0 1 0 12 18Z"/><path d="M12 5a3 3 0 1 1 5.99.13 4 4 0 0 1 2.53 5.77 4 4 0 0 1-.56 6.6A4 4 0 1 1 12 18Z"/>',
    baslik: "Machine Learning",
    metin: ["Training models on my own data", "and shipping them where they", "get used. If a number isn't", "measured, it isn't real."],
  },
  {
    ikon: '<path d="M6 11h4M8 9v4M15 12h.01M18 10h.01"/><rect x="2" y="6" width="20" height="12" rx="4"/>',
    baslik: "Game & Plugin Dev",
    metin: ["Started in the Minecraft", "ecosystem writing plugins.", "Still the fastest way I know", "to learn a language properly."],
  },
];

function kartlar() {
  const H = 230;
  const bosluk = 18;
  const kw = (W - bosluk * 2) / 3;
  const parcalar = KARTLAR.map((k, i) => {
    const x = i * (kw + bosluk);
    const satir = k.metin
      .map((m, j) => `<text x="24" y="${130 + j * 21}" class="m">${kacis(m)}</text>`)
      .join("");
    return `<g transform="translate(${x} 0)">
    <rect x=".75" y=".75" width="${kw - 1.5}" height="${H - 1.5}" rx="16" fill="${R.kart}"/>
    <rect x=".75" y=".75" width="${kw - 1.5}" height="${H - 1.5}" rx="16" fill="url(#ust)"/>
    <rect x=".75" y=".75" width="${kw - 1.5}" height="${H - 1.5}" rx="16" fill="none" stroke="url(#ck)" stroke-width="1.2"/>
    <rect x="24" y="24" width="44" height="44" rx="12" fill="${R.mavi}" fill-opacity=".14" stroke="${R.mavi}" stroke-opacity=".45"/>
    <g transform="translate(34 34)" fill="none" stroke="${R.acik}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${k.ikon}</g>
    <text x="24" y="100" class="b">${kacis(k.baslik)}</text>
    ${satir}
  </g>`;
  }).join("\n  ");

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" role="img" aria-label="Self-hosting, Machine Learning, Game and Plugin Dev">
  <title>What I do</title>
  <defs>
    <linearGradient id="ck" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${R.mavi}" stop-opacity=".7"/><stop offset=".45" stop-color="${R.kenar}"/><stop offset="1" stop-color="${R.kenar}"/></linearGradient>
    <linearGradient id="ust" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${R.mavi}" stop-opacity=".09"/><stop offset=".6" stop-color="${R.mavi}" stop-opacity="0"/></linearGradient>
  </defs>
  <style>
    .b{font:700 18px ${SANS};fill:${R.metin}}
    .m{font:400 13.5px ${SANS};fill:${R.soluk}}
  </style>
  ${parcalar}
</svg>
`;
}

// --------------------------------------------------------- ilgi alanları
const ILGI = [
  "taking things apart to see how they work",
  "chasing a bug to its actual root cause",
  "making it work first, then making it beautiful",
  "automating the boring part",
];

function ilgi() {
  const H = 96;
  const fs = 13;
  const gen = (s) => s.length * fs * 0.62 + 34;
  const satirlar = [ILGI.slice(0, 2), ILGI.slice(2)];
  const govde = satirlar
    .map((sat, si) => {
      const top = sat.reduce((t, s) => t + gen(s), 0) + 12 * (sat.length - 1);
      let x = (W - top) / 2;
      return sat
        .map((s) => {
          const w = gen(s);
          const g = `<rect x="${x}" y="${si * 48 + 6}" width="${w}" height="34" rx="17" fill="${R.kart}" stroke="${R.kenar}"/><text x="${x + w / 2}" y="${si * 48 + 27.5}" class="c" text-anchor="middle"><tspan fill="${R.acik}">›</tspan> ${kacis(s)}</text>`;
          x += w + 12;
          return g;
        })
        .join("");
    })
    .join("\n  ");
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" role="img" aria-label="${kacis(ILGI.join(", "))}">
  <title>Things I enjoy</title>
  <style>.c{font:500 ${fs}px ${MONO};fill:${R.metin}}</style>
  ${govde}
</svg>
`;
}

// ------------------------------------------------------------- alt bant
function alt(tema) {
  const H = 110;
  const T = renk(tema);
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" role="img" aria-label="akts.tr">
  <title>akts.tr</title>
  <defs>
    <linearGradient id="d" x1="0" x2="1"><stop offset="0" stop-color="${R.mavi}" stop-opacity="0"/><stop offset=".5" stop-color="${R.acik}"/><stop offset="1" stop-color="${R.mavi}" stop-opacity="0"/></linearGradient>
    <radialGradient id="p" cx="50%" cy="0%" r="60%"><stop offset="0" stop-color="${R.mavi}" stop-opacity=".25"/><stop offset="1" stop-color="${R.mavi}" stop-opacity="0"/></radialGradient>
  </defs>
  <style>
    .s{font:500 13px ${MONO};letter-spacing:3px}
    .isik{animation:nefes 4s ease-in-out infinite}
    @keyframes nefes{50%{opacity:.45}}
    ${SAKIN}
  </style>
  <rect x="0" y="20" width="${W}" height="${H - 20}" fill="url(#p)" class="isik"/>
  <line x1="60" y1="20" x2="${W - 60}" y2="20" stroke="url(#d)" stroke-width="1.5"/>
  <text x="${W / 2}" y="66" class="s" fill="${T.soluk}" text-anchor="middle">MADE IN ISTANBUL  ·  AKTS.TR</text>
</svg>
`;
}

await mkdir(HEDEF, { recursive: true });
const dosyalar = {
  "header.svg": baslik(),
  "cards.svg": kartlar(),
  "enjoy.svg": ilgi(),
};
const BOLUMLER = {
  what: ["yap", "01", "What I Do"],
  studio: ["studyo", "02", "Akts Studio"],
  tools: ["arac", "03", "Languages & Tools"],
  stats: ["istatistik", "04", "Statistics"],
  activity: ["aktivite", "05", "Activity"],
  snake: ["yilan", "06", "Contribution Snake"],
  contact: ["iletisim", "07", "Get in Touch"],
};
// README <picture> ile temaya göre seçer: x.svg koyu, x-light.svg açık.
for (const tema of ["koyu", "acik"]) {
  const ek = tema === "acik" ? "-light" : "";
  dosyalar[`footer${ek}.svg`] = alt(tema);
  for (const [ad, [ikon, no, metin]] of Object.entries(BOLUMLER))
    dosyalar[`h-${ad}${ek}.svg`] = bolum(ikon, no, metin, tema);
}
for (const [ad, icerik] of Object.entries(dosyalar)) await writeFile(`${HEDEF}/${ad}`, icerik);
console.log(`${Object.keys(dosyalar).length} görsel yazıldı → ${HEDEF}/`);
