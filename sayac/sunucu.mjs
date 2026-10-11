// Profil görüntülenme sayacı — komarev yerine kendi sunucumuz.
// GitHub README'si görseli camo üzerinden her açılışta çeker; her istek +1.
// Sayı /srv/profil-sayac/sayi.json'da tutulur. nginx: akts.tr/sayac/profil
import { createServer } from "node:http";
import { readFileSync, writeFileSync, renameSync } from "node:fs";

const DOSYA = new URL("./sayi.json", import.meta.url);
const PORT = Number(process.env.PORT ?? 8794);
let sayi = 0;
try { sayi = JSON.parse(readFileSync(DOSYA, "utf8")).sayi ?? 0; } catch {}

let kirli = false;
setInterval(() => {
  if (!kirli) return;
  writeFileSync(DOSYA + ".tmp", JSON.stringify({ sayi }));
  renameSync(DOSYA + ".tmp", DOSYA);
  kirli = false;
}, 5000);

const bicim = (n) => n.toLocaleString("en-US");

function svg(n) {
  const deger = bicim(n);
  const solW = 16 + 18 + 9 + 103 + 16;
  const degW = deger.length * 8.6 + 32;
  const W = Math.ceil(solW + degW), h = 40, r = 20;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${h}" viewBox="0 0 ${W} ${h}" role="img" aria-label="Profile views: ${deger}">
  <title>Profile views: ${deger}</title>
  <defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#1a73e8"/><stop offset="1" stop-color="#8ab4f8"/></linearGradient>
  <linearGradient id="p" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".07"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></linearGradient></defs>
  <style>.t{font:600 14px 'Segoe UI',Ubuntu,'Helvetica Neue',sans-serif;dominant-baseline:central;letter-spacing:.2px}</style>
  <rect x=".75" y=".75" width="${W - 1.5}" height="${h - 1.5}" rx="19.25" fill="#0d1117"/>
  <rect x=".75" y=".75" width="${W - 1.5}" height="${h - 1.5}" rx="19.25" fill="url(#p)"/>
  <path d="M${solW} 1.5h${degW - r + 0.5}a18.5 18.5 0 0 1 0 37H${solW}z" fill="#1a73e8" fill-opacity=".22"/>
  <rect x=".75" y=".75" width="${W - 1.5}" height="${h - 1.5}" rx="19.25" fill="none" stroke="url(#g)" stroke-width="1.5"/>
  <line x1="${solW}" y1="7" x2="${solW}" y2="33" stroke="url(#g)" stroke-opacity=".6"/>
  <g transform="translate(16 11) scale(.75)" fill="none" stroke="#8ab4f8" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z"/><circle cx="12" cy="12" r="3"/></g>
  <text x="43" y="20" class="t" fill="#e6edf3">Profile views</text>
  <text x="${solW + degW / 2}" y="20" class="t" fill="#8ab4f8" text-anchor="middle">${deger}</text>
</svg>`;
}

createServer((istek, cevap) => {
  const sayma = new URL(istek.url, "http://x").searchParams.has("sayma");
  if (!sayma && istek.method === "GET") { sayi++; kirli = true; }
  cevap.writeHead(200, {
    "content-type": "image/svg+xml; charset=utf-8",
    "cache-control": "no-cache, no-store, must-revalidate, max-age=0",
    expires: "0",
  });
  cevap.end(svg(sayi));
}).listen(PORT, "127.0.0.1", () => console.log(`profil-sayac :${PORT} sayi=${sayi}`));
