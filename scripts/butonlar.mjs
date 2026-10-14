#!/usr/bin/env node
/**
 * PROFİL BUTONLARI — kendi üretimimiz
 * ==================================
 *
 * shields.io rozetleri GitHub'ın camo vekilinde ara ara kırık görünüyor;
 * bazı logo adları (maildotru, safari) simple-icons'tan kalkınca rozet
 * sessizce ikonsuz çiziliyor. Butonları burada SVG olarak üretip
 * `output` dalına yazıyoruz: tek tasarım, ikonlar gömülü, dış servis yok.
 *
 * Sayaçlı butonlar (takipçi, yıldız) GitHub API'sinden besleniyor.
 *
 *   GITHUB_TOKEN=... GITHUB_USER=eymenaktas node scripts/butonlar.mjs dist
 */

import { mkdir, writeFile } from "node:fs/promises";

const TOKEN = process.env["GITHUB_TOKEN"];
const KULLANICI = process.env["GITHUB_USER"] ?? "eymenaktas";
const HEDEF = process.argv[2] ?? "dist";

/** 24×24 çizgi ikonlar (lucide tarzı), stroke ile çizilir. */
const IKON = {
  mail: '<rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-10 6L2 7"/>',
  globe: '<circle cx="12" cy="12" r="10"/><path d="M2 12h20M12 2a15 15 0 0 1 0 20M12 2a15 15 0 0 0 0 20"/>',
  github: '<path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.4 5.4 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65S8.93 17.38 9 18v4"/><path d="M9 18c-4.51 2-5-2-7-2"/>',
  arrow: '<path d="M5 12h14M13 6l6 6-6 6"/>',
  star: '<path d="m12 2 3.1 6.3 6.9 1-5 4.9 1.2 6.8L12 17.8 5.8 21l1.2-6.8-5-4.9 6.9-1z"/>',
  users: '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/>',
  server: '<rect x="2" y="2" width="20" height="8" rx="2"/><rect x="2" y="14" width="20" height="8" rx="2"/><path d="M6 6h.01M6 18h.01"/>',
  brain: '<path d="M12 5a3 3 0 1 0-5.99.13 4 4 0 0 0-2.53 5.77 4 4 0 0 0 .56 6.6A4 4 0 1 0 12 18Z"/><path d="M12 5a3 3 0 1 1 5.99.13 4 4 0 0 1 2.53 5.77 4 4 0 0 1-.56 6.6A4 4 0 1 1 12 18Z"/>',
  layout: '<rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M9 21V9"/>',
  user: '<circle cx="12" cy="8" r="5"/><path d="M20 21a8 8 0 0 0-16 0"/>',
};

/** Tonlar: [degrade başı, degrade sonu, ikon/değer rengi]. */
const TON = {
  mavi: ["#ff5b4a", "#ff8a7a", "#ff8a7a"],
  kirmizi: ["#bb2a2a", "#f28b82", "#f28b82"],
  yesil: ["#2ea043", "#7ee2a8", "#7ee2a8"],
  gri: ["#5f6b7a", "#c9d1d9", "#c9d1d9"],
};

const kacis = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

/** Segoe/Ubuntu için kaba karakter genişliği; büyük harfler biraz daha geniş. */
function genislik(metin, boyut, kalin) {
  let w = 0;
  for (const c of metin) {
    if (c === " ") w += 0.3;
    else if (/[A-ZĞÜŞİÖÇ@MW]/.test(c)) w += 0.68;
    else if (/[iıljt.,'·|]/.test(c)) w += 0.3;
    else if (/[0-9]/.test(c)) w += 0.58;
    else w += 0.55;
  }
  return w * boyut * (kalin ? 1.06 : 1);
}

/**
 * Hap biçimli buton. `deger` verilirse sağda ayrı bir bölme çizilir.
 * boyut: "buyuk" (üst kısım ve çağrılar) veya "kucuk" (proje listesi).
 */
function buton({ ikon, etiket, deger, ton = "mavi", boyut = "buyuk" }) {
  const [a, b, vurgu] = TON[ton];
  const B = boyut === "buyuk";
  const h = B ? 40 : 30;
  const fs = B ? 14 : 12;
  const ik = B ? 18 : 14;
  const px = B ? 16 : 12;
  const gap = B ? 9 : 7;
  const id = `g${Math.random().toString(36).slice(2, 8)}`;

  const etW = genislik(etiket, fs, true);
  const solW = px + ik + gap + etW + px;
  const degW = deger != null ? genislik(String(deger), fs, true) + px * 2 : 0;
  const W = Math.ceil(solW + degW);
  const r = h / 2;
  const y = h / 2;

  const degerBolme =
    deger != null
      ? `<path d="M${solW} 1.5h${degW - r + 0.5}a${r - 1.5} ${r - 1.5} 0 0 1 0 ${h - 3}H${solW}z" fill="${a}" fill-opacity=".22"/>
  <line x1="${solW}" y1="7" x2="${solW}" y2="${h - 7}" stroke="url(#${id})" stroke-opacity=".6"/>
  <text x="${solW + degW / 2}" y="${y}" class="t" fill="${vurgu}" text-anchor="middle">${kacis(deger)}</text>`
      : "";

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${h}" viewBox="0 0 ${W} ${h}" role="img" aria-label="${kacis(etiket)}${deger != null ? `: ${kacis(deger)}` : ""}">
  <title>${kacis(etiket)}${deger != null ? `: ${kacis(deger)}` : ""}</title>
  <defs>
    <linearGradient id="${id}" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="${a}"/><stop offset="1" stop-color="${b}"/>
    </linearGradient>
    <linearGradient id="${id}p" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#ffffff" stop-opacity=".07"/><stop offset="1" stop-color="#ffffff" stop-opacity="0"/>
    </linearGradient>
  </defs>
  <style>.t{font:600 ${fs}px 'Segoe UI',Ubuntu,'Helvetica Neue',sans-serif;dominant-baseline:central;letter-spacing:.2px}</style>
  <rect x=".75" y=".75" width="${W - 1.5}" height="${h - 1.5}" rx="${r - 0.75}" fill="#0d1117"/>
  <rect x=".75" y=".75" width="${W - 1.5}" height="${h - 1.5}" rx="${r - 0.75}" fill="url(#${id}p)"/>
  <rect x=".75" y=".75" width="${W - 1.5}" height="${h - 1.5}" rx="${r - 0.75}" fill="none" stroke="url(#${id})" stroke-width="1.5"/>
  <g transform="translate(${px} ${(h - ik) / 2}) scale(${ik / 24})" fill="none" stroke="${vurgu}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${IKON[ikon]}</g>
  <text x="${px + ik + gap}" y="${y}" class="t" fill="#e6edf3">${kacis(etiket)}</text>
  ${degerBolme}
</svg>
`;
}

async function sayilar() {
  if (!TOKEN) return { takipci: "—", yildiz: "—" };
  const cevap = await fetch("https://api.github.com/graphql", {
    method: "POST",
    headers: { authorization: `bearer ${TOKEN}`, "content-type": "application/json", "user-agent": "profil-butonlar" },
    body: JSON.stringify({
      query: `query($l:String!){user(login:$l){followers{totalCount}
        repositories(ownerAffiliations:OWNER,first:100,isFork:false){nodes{stargazerCount}}}}`,
      variables: { l: KULLANICI },
    }),
  });
  const { data, errors } = await cevap.json();
  if (errors) throw new Error(JSON.stringify(errors).slice(0, 300));
  return {
    takipci: data.user.followers.totalCount,
    yildiz: data.user.repositories.nodes.reduce((t, d) => t + d.stargazerCount, 0),
  };
}

const { takipci, yildiz } = await sayilar();

const BUTONLAR = {
  "btn-email": { ikon: "mail", etiket: "eymen@akts.tr" },
  "btn-website": { ikon: "globe", etiket: "akts.tr", ton: "gri" },
  "btn-studio": { ikon: "github", etiket: "Akts Studio", ton: "kirmizi" },
  "btn-studio-git": { ikon: "arrow", etiket: "Go to Akts Studio", ton: "kirmizi" },
  "btn-mail": { ikon: "mail", etiket: "Send a mail" },
  "btn-follow": { ikon: "github", etiket: "Follow", ton: "gri" },
  "btn-followers": { ikon: "users", etiket: "Followers", deger: takipci },
  "btn-stars": { ikon: "star", etiket: "Stars", deger: yildiz },
  "proje-aktas-mail": { ikon: "server", etiket: "Aktaş Mail", deger: "self-hosted mail", boyut: "kucuk" },
  "proje-spam": { ikon: "brain", etiket: "Türkçe Spam Modeli", deger: "ML", ton: "yesil", boyut: "kucuk" },
  "proje-landing": { ikon: "layout", etiket: "akts.tr", deger: "landing", ton: "gri", boyut: "kucuk" },
  "proje-portfolio": { ikon: "user", etiket: "eymen.akts.tr", deger: "portfolio", ton: "gri", boyut: "kucuk" },
};

await mkdir(HEDEF, { recursive: true });
for (const [ad, ayar] of Object.entries(BUTONLAR)) {
  await writeFile(`${HEDEF}/${ad}.svg`, buton(ayar));
}
console.log(`${Object.keys(BUTONLAR).length} buton yazıldı → ${HEDEF}/`);
