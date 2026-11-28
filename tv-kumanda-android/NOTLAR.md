# TV Kumanda (Android) — notlar

LG webOS TV'ler (ör. 49UF8507, webOS 2.0) için Wi‑Fi kumanda. TV'ye `ws://TV_IP:3000` (SSAP) ile bağlanır; ilk bağlantıda TV ekranında onay ister, sonra anahtarı saklar.

| Ne | Nerede |
|---|---|
| Kumandanın kendisi (tek HTML) | `../tv-kumanda/index.html` |
| Android ayarları (dikey, izinler, ws:// izni, Wake-on-LAN köprüsü `TvWol`, kızılötesi köprüsü `TvIr`, ikon, açılış) | `patch_android.py`, `icons/`, `splash/` |

- Özellikler: güç (kapat; aç = Wake-on-LAN), yön tuşları/OK, geri/ana ekran/çıkış, ses/kanal (basılı tutunca tekrar), medya tuşları, kaynak seçimi, fare/touchpad, uygulama listesi ve başlatma, TV'ye yazı yazma, rakamlar ve renkli tuşlar, ağda otomatik TV bulma, kızılötesi (telefonda IR verici varsa; LG NEC kodları, 38 kHz; Ayarlar > Kontrol yöntemi: Otomatik/Wi‑Fi/Kızılötesi).
- `androidScheme: http` şart: https sayfadan düz `ws://` bağlantısı engellenir.
- Derleme: GitHub Actions > "TV Kumanda APK" > Run workflow (yalnızca elle çalışır). Çıktı: test APK (`tv-kumanda-apk-1.0.N`).
- Paket adı `com.tvkumanda.lg`, test imzası `tv-kumanda-debug.keystore` (şifre android).
- Eşleştirme manifesti `lgtv2` (MIT) paketinin `pairing.json`'ından.

## TV+ kutusu (Sagemcom DIW362 UHD, Android TV)
- Wi‑Fi ile Android TV kumanda protokolü v2: 6467 eşleştirme (TV'de 6 haneli onaltılık kod), 6466 kumanda. Kod: `java/AtvCore.java` (derlemede pakete kopyalanır), JS köprüsü `TvAtv` (MainActivity, patch_android.py içinde).
- İstemci sertifikası ilk açılışta üretilir (RSA 2048, elle DER), uygulama dosyalarında saklanır; uygulama silinirse yeniden eşleştirme gerekir.
- Bulma: mDNS `_androidtvremote2._tcp` + yerel /24 ağda 6466 portu taraması. Kutu ağda "Connect TV" adıyla görünüyor.
- Mesajlar androidtvremote2 (Python) kütüphanesinin protobuf tanımlarıyla bayt bayt karşılaştırıldı.
- Ekran gerçek TV+ kumandasının düzeninde. Kaynak, tv⏻, ses ve sessiz tuşları LG TV'ye gider (Wi‑Fi ya da kızılötesi); diğer tuşlar kutuya (Android tuş kodları: TV+=HOME 3, menü 82, geri 4, bilgi 165, çıkış 111, R 130, pr 166/167, renkli 183-186, kutu ⏻ 26).
