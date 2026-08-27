#!/usr/bin/env node
/**
 * AKTİVİTE GRAFİĞİ — kendi üretimimiz
 * ===================================
 *
 * ## Neden
 *
 * README'deki aktivite grafiği `github-readme-activity-graph.vercel.app`
 * adresinden geliyordu. 2026-08-27'de ölçüldü:
 *
 *     kod:402  tip:text/plain  gövde: "Payment required / DEPLOYMENT_DISABLED"
 *
 * Yani servisin Vercel dağıtımı kapanmış. İstatistik kartlarında
 * (`istatistik.mjs`) aynı sınıf hata daha önce yaşanmıştı; çözüm de
 * aynı: veriyi GitHub'ın kendi API'sinden çekip SVG'yi burada üret.
 *
 * ## Neden 31 gün, bir yıl değil
 *
 * Ölçüldü (2026-08-27, `contributionCalendar`): 369 günün **6'sında**
 * katkı var, toplam 28, ve bunun 26'sı tek bir ayda. Yıllık günlük
 * grafik 363 sıfır artı sondaki tek küme demek olurdu — bozuk görünür.
 * 31 gün hem okunur bir eğri veriyor hem de değiştirilen servisin
 * varsayılanıyla aynı.
 *
 * ## Çalıştırma
 *
 *   GITHUB_TOKEN=... GITHUB_USER=eymenaktas node scripts/aktivite.mjs dist
 */

import { mkdir, writeFile } from "node:fs/promises";

const TOKEN = process.env["GITHUB_TOKEN"];
const KULLANICI = process.env["GITHUB_USER"] ?? "eymenaktas";
const HEDEF = process.argv[2] ?? "dist";
const GUN = Number(process.env["AKTIVITE_GUN"] ?? 31);

if (!TOKEN) {
  console.error("GITHUB_TOKEN gerekli.");
  process.exit(1);
}

/** Renkler — README'deki paletle ve istatistik.mjs ile aynı. */
const R = {
  zemin: "#0d1117",
  kenar: "#1f2733",
  baslik: "#1a73e8",
  metin: "#c9d1d9",
  soluk: "#8b949e",
  cizgi: "#1a73e8",
  nokta: "#8ab4f8",
  izgara: "#161d27",
};

async function graphql(sorgu, degiskenler) {
  const cevap = await fetch("https://api.github.com/graphql", {
    method: "POST",
    headers: {
      authorization: `bearer ${TOKEN}`,
      "content-type": "application/json",
      "user-agent": "profil-aktivite",
    },
    body: JSON.stringify({ query: sorgu, variables: degiskenler }),
  });
  const veri = await cevap.json();
  if (veri.errors) throw new Error(JSON.stringify(veri.errors).slice(0, 300));
  return veri.data;
}

const SORGU = `
  query($kullanici: String!) {
    user(login: $kullanici) {
      contributionsCollection {
        contributionCalendar {
          totalContributions
          weeks { contributionDays { date contributionCount } }
        }
      }
    }
  }
`;

const { user } = await graphql(SORGU, { kullanici: KULLANICI });
const takvim = user.contributionsCollection.contributionCalendar;
const tumGunler = takvim.weeks.flatMap((h) => h.contributionDays);

/*
  Takvim bugünden SONRAKİ günleri de içeriyor (içinde bulunulan hafta
  sonuna kadar) ve onların sayısı 0. Grafiğin sonuna sahte bir düşüş
  eklememek için bugünden sonrası atılıyor.
*/
const bugun = new Date().toISOString().slice(0, 10);
const gecmis = tumGunler.filter((g) => g.date <= bugun);
const gunler = gecmis.slice(-GUN);

if (gunler.length === 0) {
  console.error("Takvim boş döndü — grafik üretilmedi.");
  process.exit(1);
}

// ── Çizim alanı ────────────────────────────────────────────
const G = 840;              // genişlik
const Y = 260;              // yükseklik
const sol = 44, sag = 24, ust = 64, alt = 46;
const cizG = G - sol - sag;
const cizY = Y - ust - alt;

const enCok = Math.max(...gunler.map((g) => g.contributionCount));

/*
  Tavan "yuvarlak" bir sayı olmalı, tepe değerin kendisi değil.
  Tepe 11 alınırsa dört eşit aralık 0/2.75/5.5/8.25/11 veriyor ve
  yuvarlanınca eksen 0/3/6/8/11 diye düzensiz görünüyor.
  Bunun yerine dörde tam bölünen en küçük uygun adım seçiliyor:
  tepe 11 -> adım 3 -> eksen 0/3/6/9/12.
*/
const ADIMLAR = [1, 2, 3, 4, 5, 10, 15, 20, 25, 50, 100, 250, 500];
const adim = ADIMLAR.find((a) => a * 4 >= Math.max(enCok, 4)) ?? Math.ceil(enCok / 4);
const tavan = adim * 4;

const x = (i) => sol + (gunler.length === 1 ? cizG / 2 : (i / (gunler.length - 1)) * cizG);
const y = (v) => ust + cizY - (v / tavan) * cizY;

const noktalar = gunler.map((g, i) => ({ ...g, px: x(i), py: y(g.contributionCount) }));

/** XML'e gömülecek metni kaçır. */
const kacir = (m) =>
  String(m).replace(/[<>&"']/g, (c) =>
    ({ "<": "&lt;", ">": "&gt;", "&": "&amp;", '"': "&quot;", "'": "&#39;" })[c],
  );

// Düz çizgi bilerek: yumuşatılmış eğri seyrek veride sıfırın ALTINA
// taşıp olmayan bir düşüş uyduruyor.
const cizgiYolu = noktalar.map((n, i) => `${i ? "L" : "M"}${n.px.toFixed(1)} ${n.py.toFixed(1)}`).join(" ");
const taban = (ust + cizY).toFixed(1);
const alanYolu =
  `M${noktalar[0].px.toFixed(1)} ${taban} ` +
  noktalar.map((n) => `L${n.px.toFixed(1)} ${n.py.toFixed(1)}`).join(" ") +
  ` L${noktalar[noktalar.length - 1].px.toFixed(1)} ${taban} Z`;

// ── Y ekseni: 0 ile tavan arasında 4 çizgi ─────────────────
const yEkseni = [0, 1, 2, 3, 4]
  .map((k) => {
    const deger = adim * k;
    const py = y(deger);
    return `<line x1="${sol}" y1="${py.toFixed(1)}" x2="${G - sag}" y2="${py.toFixed(1)}" stroke="${R.izgara}" />
      <text x="${sol - 10}" y="${(py + 4).toFixed(1)}" class="k" text-anchor="end">${deger}</text>`;
  })
  .join("\n  ");

// ── X ekseni: ayın değiştiği günler + ilk ve son ───────────
const AYLAR = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
const etiket = (t) => `${AYLAR[Number(t.slice(5, 7)) - 1]} ${Number(t.slice(8, 10))}`;
const xEkseni = noktalar
  .map((n, i) => {
    const ilk = i === 0;
    const son = i === noktalar.length - 1;
    const ayBasi = i > 0 && n.date.slice(5, 7) !== noktalar[i - 1].date.slice(5, 7);
    if (!ilk && !son && !ayBasi) return "";
    // Uçlardaki etiketler kartın dışına taşmasın
    const hiza = ilk ? "start" : son ? "end" : "middle";
    return `<text x="${n.px.toFixed(1)}" y="${Y - alt + 26}" class="k" text-anchor="${hiza}">${etiket(n.date)}</text>`;
  })
  .filter(Boolean)
  .join("\n  ");

// Nokta yalnızca katkı OLAN günlere konuyor; 31 tane sıfır noktası
// grafiği okunmaz hâle getiriyordu.
const isaretler = noktalar
  .filter((n) => n.contributionCount > 0)
  .map(
    (n) => `<circle cx="${n.px.toFixed(1)}" cy="${n.py.toFixed(1)}" r="4"
      fill="${R.nokta}" stroke="${R.zemin}" stroke-width="2">
      <title>${kacir(etiket(n.date))}: ${n.contributionCount}</title>
    </circle>`,
  )
  .join("\n  ");

const toplamAralik = gunler.reduce((t, g) => t + g.contributionCount, 0);

const svg = `<svg width="${G}" height="${Y}" viewBox="0 0 ${G} ${Y}"
     xmlns="http://www.w3.org/2000/svg" role="img"
     aria-label="${kacir(KULLANICI)} contribution activity, last ${gunler.length} days, ${toplamAralik} total">
  <style>
    .b { font: 600 16px 'Segoe UI', Ubuntu, sans-serif; fill: ${R.baslik} }
    .s { font: 400 12px 'Segoe UI', Ubuntu, sans-serif; fill: ${R.soluk} }
    .k { font: 400 11px 'Segoe UI', Ubuntu, sans-serif; fill: ${R.soluk} }
    /* pathLength="1" sayesinde dasharray yolun gerçek uzunluğundan
       bağımsız — sabit 4000 verilseydi kısa yolda çizim animasyonun
       son saniyesinde bir anda oluyordu. */
    .cizgi { stroke-dasharray: 1; stroke-dashoffset: 1; animation: ciz 1.6s ease forwards }
    .alan  { opacity: 0; animation: ac .8s ease .6s forwards }
    @keyframes ciz { to { stroke-dashoffset: 0 } }
    @keyframes ac  { to { opacity: 1 } }
    @media (prefers-reduced-motion: reduce) {
      .cizgi { animation: none; stroke-dashoffset: 0 }
      .alan  { animation: none; opacity: 1 }
    }
  </style>
  <defs>
    <linearGradient id="dolgu" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="${R.cizgi}" stop-opacity=".38" />
      <stop offset="1" stop-color="${R.cizgi}" stop-opacity="0" />
    </linearGradient>
  </defs>

  <rect x="1" y="1" width="${G - 2}" height="${Y - 2}" rx="12" fill="${R.zemin}" stroke="${R.kenar}" />
  <text x="24" y="34" class="b">Contribution activity</text>
  <text x="${G - 24}" y="34" class="s" text-anchor="end">last ${gunler.length} days &#183; ${toplamAralik} contributions</text>

  ${yEkseni}

  <path d="${alanYolu}" fill="url(#dolgu)" class="alan" />
  <path d="${cizgiYolu}" pathLength="1" fill="none" stroke="${R.cizgi}" stroke-width="2.5"
        stroke-linejoin="round" stroke-linecap="round" class="cizgi" />
  ${isaretler}

  ${xEkseni}
</svg>`;

await mkdir(HEDEF, { recursive: true });
await writeFile(`${HEDEF}/activity.svg`, svg);

console.log(`activity.svg yazıldı -> ${HEDEF}`);
console.log(`  aralık : ${gunler[0].date} .. ${gunler[gunler.length - 1].date} (${gunler.length} gün)`);
console.log(`  toplam : ${toplamAralik} katkı, tepe ${enCok}`);
console.log(`  yıllık : ${takvim.totalContributions} katkı`);
