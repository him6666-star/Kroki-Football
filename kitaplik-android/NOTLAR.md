# Raf İzi (Android) — notlar

Ev kitaplığı uygulaması: raf fotoğrafı / barkoddan kitap tanıma (Gemini, `functions/kitaplik.js`), raf haritası, sürükle-bırak ile yer değiştirme, okuma takibi. Google ile giriş; veriler Firestore'da `kitaplik/{uid}` altında (Scribble Kick projesi).

| Ne | Nerede |
|---|---|
| Uygulamanın kendisi (web ile aynı) | `kitaplik/index.html` → https://rafizi.web.app (yoksa workflow özetindeki adres; eski kitapligim-app.web.app yönlenir) |
| Android geri tuşu | `uygulama/uygulama.js` (derlemede index.html'e eklenir) |
| Android ayarları (kamera izni, sistem çubukları, ikon, açılış, imza, sürüm) | `patch_android.py`, `icons/`, `splash/` |
| Mağaza ikonu | `icons/play-store-512.png`, kaynak `store/icon-1024.png` |

## Derleme (GitHub Actions: `Raf Izi AAB`)
- Bu klasörde değişiklik push edilince ya da elle çalışır; test APK + imzalı AAB üretir (Artifacts). Sürüm kodu = çalıştırma numarası, ad 1.0.N.
- Her derlemede Firebase'e Android uygulaması (`com.fairridegames.rafizi`) ve imza parmak izleri (test + yükleme anahtarı) eklenir, `google-services.json` o an üretilir (repoda tutulmaz).
- Play'den indirilen sürümde Google girişi için Play Console > Uygulama bütünlüğü > Uygulama imzalama anahtarı SHA-1'i elle çalıştırırken `play_sha1` olarak verilmeli.
- Play'e yükleme yalnızca elle çalıştırıp "play" işaretlenirse (uygulama önce Play Console'da oluşturulmalı; ilk AAB elle yüklenir).
- Gizli anahtarlar Kroki-Football reposunda ortak: `FIREBASE_KEY`, `UPLOAD_KEYSTORE_B64`, `UPLOAD_KS_PASS`, `UPLOAD_KEY_ALIAS`, `UPLOAD_KEY_PASS`, `PLAY_SERVICE_ACCOUNT_JSON`.

## Son durum
- 2026-11-25: Android paketi hazırlandı, ilk AAB derlenecek.
