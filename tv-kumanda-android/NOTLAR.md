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
