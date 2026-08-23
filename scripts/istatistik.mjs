#!/usr/bin/env node
/**
 * PROFİL İSTATİSTİK KARTLARI — kendi üretimimiz
 * ============================================
 *
 * ## Neden üçüncü taraf servis kullanmıyoruz
 *
 * `github-readme-stats` ve `github-profile-trophy` denendi (2026-08-23):
 *   - paylaşımlı örnek 503 verdi
 *   - kupa servisi 402 verdi (Vercel kotası bitmiş)
 *   - çalışan bir ayna bulundu ama o da 200 DÖNÜP içerik olarak
 *     "Maximum retries exceeded — PAT_1 ekleyin" hata kartı çiziyordu
 *
 * Son madde önemli: **HTTP 200 çalışıyor demek değil.** Durum koduna
 * bakan bir kontrol bunu yakalayamaz, içeriğe bakmak gerekiyor.
 *
 * Bu betik veriyi GitHub'ın kendi API'sinden çekip SVG'yi burada
 * üretiyor. Dış servis yok, rate limit yok, bir gün kapanacak bir
 * bağımlılık yok.
 *
 * ## Çalıştırma
 *
 *   GITHUB_TOKEN=... GITHUB_USER=eymenaktas node scripts/istatistik.mjs dist
 */

import { mkdir, writeFile } from "node:fs/promises";

const TOKEN = process.env["GITHUB_TOKEN"];
const KULLANICI = process.env["GITHUB_USER"] ?? "eymenaktas";
const HEDEF = process.argv[2] ?? "dist";

if (!TOKEN) {
  console.error("GITHUB_TOKEN gerekli.");
  process.exit(1);
}

/** Renkler — README'deki paletle aynı. */
const R = {
  zemin: "#0d1117",
  kenar: "#1f2733",
  baslik: "#1a73e8",
  metin: "#c9d1d9",
  soluk: "#8b949e",
  vurgu: "#8ab4f8",
};

async function graphql(sorgu, degiskenler) {
  const cevap = await fetch("https://api.github.com/graphql", {
    method: "POST",
    headers: {
      authorization: `bearer ${TOKEN}`,
      "content-type": "application/json",
      "user-agent": "profil-istatistik",
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
      followers { totalCount }
      following { totalCount }
      contributionsCollection {
        totalCommitContributions
        totalPullRequestContributions
        totalIssueContributions
        restrictedContributionsCount
        contributionCalendar { totalContributions }
      }
      pullRequests(states: MERGED) { totalCount }
      repositories(ownerAffiliations: OWNER, isFork: false, first: 100) {
        totalCount
        nodes {
          stargazerCount
          languages(first: 10, orderBy: { field: SIZE, direction: DESC }) {
            edges { size node { name color } }
          }
        }
      }
    }
  }
`;

const { user } = await graphql(SORGU, { kullanici: KULLANICI });

const katki = user.contributionsCollection;
const depolar = user.repositories.nodes;
const yildiz = depolar.reduce((t, d) => t + d.stargazerCount, 0);

/*
  "Contributions" olarak katkı TAKVİMİNİN toplamı kullanılıyor,
  `totalCommitContributions` değil.

  İkisi ayrışabiliyor: commit'ler GitHub hesabına EKLİ OLMAYAN bir
  e-posta ile atılmışsa GitHub onları kullanıcıya atfetmiyor ve
  `totalCommitContributions` 0 kalıyor — takvim ise depo oluşturma,
  push gibi olayları yine sayıyor. (2026-08-23'te tam olarak bu görüldü:
  takvim 6, commit 0.)
*/
const sayilar = {
  Contributions: katki.contributionCalendar.totalContributions,
  "Total Commits": katki.totalCommitContributions + katki.restrictedContributionsCount,
  "Pull Requests": katki.totalPullRequestContributions,
  Issues: katki.totalIssueContributions,
  "Stars Earned": yildiz,
  Repositories: user.repositories.totalCount,
  Followers: user.followers.totalCount,
};

// Dil dağılımı — bayt cinsinden toplanıp yüzdeye çevriliyor
const dilBayt = new Map();
for (const d of depolar) {
  for (const { size, node } of d.languages.edges) {
    const onceki = dilBayt.get(node.name) ?? { bayt: 0, renk: node.color };
    dilBayt.set(node.name, { bayt: onceki.bayt + size, renk: node.color ?? R.vurgu });
  }
}
const toplamBayt = [...dilBayt.values()].reduce((t, x) => t + x.bayt, 0) || 1;
const diller = [...dilBayt.entries()]
  .map(([ad, x]) => ({ ad, oran: (x.bayt / toplamBayt) * 100, renk: x.renk }))
  .sort((a, b) => b.oran - a.oran)
  .slice(0, 6);

/** XML'e gömülecek metni kaçır — depo adı `&` içerebiliyor. */
const kacir = (m) =>
  String(m).replace(/[<>&"']/g, (c) =>
    ({ "<": "&lt;", ">": "&gt;", "&": "&amp;", '"': "&quot;", "'": "&#39;" })[c],
  );

/** Kartların ortak çerçevesi — tek yerden değişsin diye. */
function cerceve(genislik, yukseklik, baslik, icerik) {
  return `<svg width="${genislik}" height="${yukseklik}" viewBox="0 0 ${genislik} ${yukseklik}"
     xmlns="http://www.w3.org/2000/svg" role="img" aria-label="${kacir(baslik)}">
  <style>
    .b { font: 600 16px 'Segoe UI', Ubuntu, sans-serif; fill: ${R.baslik} }
    .e { font: 500 13px 'Segoe UI', Ubuntu, sans-serif; fill: ${R.metin} }
    .d { font: 700 13px 'Segoe UI', Ubuntu, sans-serif; fill: ${R.vurgu} }
    .k { font: 400 11px 'Segoe UI', Ubuntu, sans-serif; fill: ${R.soluk} }
    /* Kartlar yüklenirken belirsin — hepsi aynı anda parlıyor */
    .g { opacity: 0; animation: ac .6s ease forwards }
    @keyframes ac { to { opacity: 1 } }
  </style>
  <rect x="1" y="1" width="${genislik - 2}" height="${yukseklik - 2}" rx="12"
        fill="${R.zemin}" stroke="${R.kenar}" />
  <text x="24" y="34" class="b">${kacir(baslik)}</text>
  ${icerik}
</svg>`;
}

// ── Kart 1: sayılar ────────────────────────────────────────
const satirlar = Object.entries(sayilar)
  .map(([ad, deger], i) => {
    const y = 68 + i * 26;
    return `<g class="g" style="animation-delay:${i * 70}ms">
      <text x="24" y="${y}" class="e">${kacir(ad)}</text>
      <text x="276" y="${y}" class="d" text-anchor="end">${deger.toLocaleString("en-US")}</text>
    </g>`;
  })
  .join("\n");

await mkdir(HEDEF, { recursive: true });
await writeFile(`${HEDEF}/stats.svg`, cerceve(300, 240, `${KULLANICI}'s stats`, satirlar));

// ── Kart 2: diller ─────────────────────────────────────────
// Tek satırlık yığılmış çubuk + altında liste
let x = 24;
const cubuk = diller
  .map((d) => {
    const w = (d.oran / 100) * 252;
    const parca = `<rect x="${x.toFixed(1)}" y="52" width="${w.toFixed(1)}" height="8" fill="${d.renk}" />`;
    x += w;
    return parca;
  })
  .join("");

const dilListesi = diller
  .map((d, i) => {
    const sutun = i % 2;
    const satir = Math.floor(i / 2);
    const px = 24 + sutun * 132;
    const py = 86 + satir * 24;
    return `<g class="g" style="animation-delay:${i * 70}ms">
      <circle cx="${px + 5}" cy="${py - 4}" r="5" fill="${d.renk}" />
      <text x="${px + 18}" y="${py}" class="e">${kacir(d.ad)}</text>
      <text x="${px + 108}" y="${py}" class="k" text-anchor="end">${d.oran.toFixed(1)}%</text>
    </g>`;
  })
  .join("\n");

await writeFile(
  `${HEDEF}/languages.svg`,
  cerceve(
    300,
    240,
    "Most used languages",
    `<clipPath id="yuvarlak"><rect x="24" y="52" width="252" height="8" rx="4" /></clipPath>
     <g clip-path="url(#yuvarlak)">
       <rect x="24" y="52" width="252" height="8" fill="${R.kenar}" />
       ${cubuk}
     </g>
     ${dilListesi}`,
  ),
);

console.log(`stats.svg ve languages.svg yazıldı -> ${HEDEF}`);
console.log(
  Object.entries(sayilar)
    .map(([a, d]) => `  ${a}: ${d}`)
    .join("\n"),
);
console.log(`  diller: ${diller.map((d) => `${d.ad} %${d.oran.toFixed(1)}`).join(", ")}`);
