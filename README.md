<h1 align="center">Merhaba, ben Eymen 👋</h1>

<p align="center">
  İstanbul'dan, kendi altyapısını kuran bir geliştirici.<br>
  Minecraft ekosisteminden geldim, şimdi makine öğrenmesi ve kendi sunucularımla uğraşıyorum.
</p>

<p align="center">
  <a href="https://mail.akts.tr"><img src="https://img.shields.io/badge/Aktaş_Mail-canlı-1a73e8?style=flat-square" alt="Aktaş Mail"></a>
  <a href="mailto:eymen@akts.tr"><img src="https://img.shields.io/badge/eymen@akts.tr-kendi_sunucumda-333?style=flat-square" alt="E-posta"></a>
  <img src="https://img.shields.io/badge/İstanbul-TR-e30a17?style=flat-square" alt="İstanbul">
</p>

---

## Ne yapıyorum

Bir şeyin nasıl çalıştığını anlamanın en iyi yolu onu kendin kurmak. Bu yüzden
e-posta sunucumu kendim işletiyorum, spam modelimi kendi verimle eğitiyorum ve
oynadığım oyunları kendim yazıyorum.

Çalışma tarzım basit: **ölç, tahmin etme.** Aşağıdaki her sayı gerçek bir
çalıştırmadan geliyor.

---

## 📬 [Aktaş Mail](https://github.com/eymenaktas/aktas-mail)

`mail.akts.tr` — kendi sunucumda çalışan, Gmail benzeri arayüzü olan e-posta
uygulaması. Postfix + Dovecot benim, uygulama da benim.

**En sevdiğim tasarım kararı:** uygulama IMAP parolanı **saklamıyor.**
Girişte rastgele bir oturum anahtarı üretiliyor, parola onunla şifrelenip
veritabanına yazılıyor, anahtar yalnızca sana gidiyor. Veritabanı tek başına
çalınırsa postalar açılamıyor.

Bunun bir bedeli var ve mimarinin tamamını şekillendirdi: sunucu, sen istekte
bulunmadan posta kutusuna **bakamıyor**. Yani "arka planda yeni mail var mı"
diye yoklamak yapısal olarak mümkün değil. Çözüm, bildirimi teslimat tarafından
tetiklemek oldu — Maildir'i inotify ile izleyen bir servis, mail yazıldığı anda
haber veriyor.

```
teslimattan bildirime: 549 ms
```

Öne çıkanlar:

- **Passkey + PRF** ile parolasız giriş — ilk girişten sonra parola hiç sorulmuyor
- **BIMI + VMC** ile gönderen logosu ve mavi tik; BIMI yoksa DMARC `p=reject`
  kontrolü (bu yüzden `google.com` tik alıyor, `gmail.com` almıyor)
- Gelen HTML **sandbox'lı iframe** içinde, `allow-scripts` yok, 16/16 saldırı testi geçiyor
- Uzak görseller varsayılan kapalı — takip pikseli engelleniyor
- 71 test

## 🧠 [Türkçe Spam Modeli](https://github.com/eymenaktas/turkce-spam-modeli)

Aktaş Mail'in spam sınıflandırıcısı, ayrı depo. ONNX olarak dağıtılıyor —
Python kurmadan Node, C#, Java, tarayıcı, hepsinde çalışıyor.

```
%74.1  →  %97.1     kendi gelen kutumun verisiyle
```

En sevdiğim hata buradan çıktı. `sklearn` ile ONNX'in tahminleri %83 uyuşuyordu.
Sebep Türkçe'nin `İ` harfi:

```python
"İ".lower()   # Python:  'i' + U+0307  → İKİ karakter
              # ONNX C++: 'i'          → TEK karakter
```

Yani `sklearn` "ACİL"i `aci` diye belirteçlerken ONNX `acil` diyordu. Aynı
metin, farklı tahmin. Küçültmeyi ONNX'in dışına alıp Türkçe harfleri ASCII'ye
katlayınca uyum **%100** oldu.

Bir de şunu öğrendim: Kaggle'da 1.0 puanlı, 4501 indirmeli bir veri setinin
17.171 "spam" satırında yalnızca **6 benzersiz metin** vardı. Popülerlik veri
kalitesini garanti etmiyor — artık toplayıcı bunu otomatik eliyor.

## 🎮 [OyunHub](https://github.com/eymenaktas/oyunhub)

172 tarayıcı oyunu barındıran Türkçe oyun portalı. **32'si bu proje için
sıfırdan yazıldı**, 140'ı Internet Archive emülatöründen geliyor.

32 oyunun tamamı konsol hatasız açılıyor — tek tek kontrol edildi.

## 🌐 [akts.tr](https://github.com/eymenaktas/akts-landing)

Tüm projelerimin durduğu VDS'in karşılama sayfası. Aynı sunucuda nginx, PM2,
PostgreSQL, Redis, Postfix + Dovecot ve n8n çalışıyor.

---

## Nerede çalıştım

| Yer | Rol |
|---|---|
| **Ecstacy Anticheat** | Media Manager — medya tarafı, kod değil |
| **TrPrac** | Owner (eski) |
| **wrus.net** | Developer (eski) |

---

## Kullandıklarım

**Dil:** TypeScript · Python · Java
**Sunucu:** Node · Fastify · PostgreSQL · Redis · nginx · Postfix/Dovecot
**Arayüz:** React · Vite
**ML:** scikit-learn · PyTorch · ONNX

---

<p align="center">
  <sub>Bir şey sormak istersen: <a href="mailto:eymen@akts.tr">eymen@akts.tr</a></sub>
</p>
