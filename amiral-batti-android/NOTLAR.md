# Amiral Battı (Android) — notlar

Klasik amiral battı: bilgisayara karşı (Kolay/Normal/Zor) ve online "Rakip Bul" (Firebase anonim giriş + Firestore, Scribble Kick projesi).

## Kaynak
Android sarmalayıcısı bu klasörde (`Kroki-Football/amiral-batti-android/`). Oyunun kendisi yan klasör `amiral-batti/` (aynı zamanda https://amiral-batti.web.app).
Derleme her çalıştığında `amiral-batti/`'nin güncel hâlini `www/`'ye kopyalar; web'de yapılan her değişiklik bir sonraki derlemede uygulamaya da girer.

| Ne | Nerede |
|---|---|
| Android geri tuşu (pencere kapat > menüye dön > çık) | `uygulama/uygulama.js` (derlemede index.html'e eklenir) |
| Android ayarları (dikey, tam ekran, ikon, açılış, imza, sürüm) | `patch_android.py`, `icons/`, `splash/` |
| Mağaza metinleri / ikon kaynağı | `store/` |

## Yayın (GitHub Actions: `Amiral Batti AAB`)
- Bu klasörde değişiklik push edilince ya da elle (Run workflow) çalışır: test APK + imzalı AAB derler. Sürüm kodu = çalıştırma numarası, sürüm adı 1.0.N.
- Web'deki oyunu değiştirip uygulamayı güncellemek için: Actions > "Amiral Batti AAB" > Run workflow ("Play'e yüklensin" işaretli).
- Commit mesajında `[play]` varsa AAB Play kapalı teste (alpha) yüklenir. Kullanıcı istemeden `[play]` kullanma.
- Gizli anahtarlar Kroki-Football reposunda zaten tanımlı (Scribble Kick ile ortak yükleme anahtarı): `UPLOAD_KEYSTORE_B64`, `UPLOAD_KS_PASS`, `UPLOAD_KEY_ALIAS`, `UPLOAD_KEY_PASS`, `PLAY_SERVICE_ACCOUNT_JSON`.
- Paket adı `com.amiralbatti.game`. Test imzası `amiral-batti-debug.keystore` (şifre android).
- Play sürüm notu: `distribution/whatsnew/whatsnew-tr-TR`.

## Son durum
- 2026-11-18: Android paketi hazırlandı; ilk AAB elle Play kapalı teste yüklenecek.
