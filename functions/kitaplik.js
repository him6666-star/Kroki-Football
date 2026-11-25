// Kitapligim: raf fotografindaki / arka kapaktaki kitaplari Gemini (Vertex AI) ile okur.
// Istemci sadece {kind:'shelf'|'back', image:<base64 jpeg>, isbn?} gonderir; talimatlar burada durur.
const {onCall, HttpsError} = require('firebase-functions/v2/https');
const admin = require('firebase-admin');

const PROJECT = 'scribble-kick';
const MODELS = ['gemini-3.5-flash', 'gemini-flash-latest', 'gemini-2.5-flash'];
const DAILY_LIMIT = 150;
let ai = null, goodModel = null;

const SHELF = `Bu fotoğraf bir ev kitaplığında dizili kitapları gösteriyor. Görünen her kitabın sırtındaki (veya kapağındaki) yazıyı dikkatle oku.
Kurallar:
- "shelf": fotoğrafta ÜSTTEN başlayarak raf numarası (1, 2, 3…). Fotoğrafta tek raf varsa hepsi 1.
- "position": o rafta SOLDAN sıra (1'den başlar). Okunamayan bir kitabı listeye ekleme ama sıra sayımında yerini say.
- Yatay yığılmış kitapları da ekle; yığındaki sırayı yukarıdan aşağı say ve o rafın sonuna koy.
- "author" ve "publisher": sırtta yazanı yaz. Sırtta yazmıyorsa ama kitabı kesin biliyorsan doldur, emin değilsen boş bırak. Yayınevi logosunu tanıyorsan adını yaz.
- "genre": kısa Türkçe tür (Roman, Tarih, Bilim, Çocuk, Şiir, Felsefe, Psikoloji, Deneme, Biyografi, Ders…), bilmiyorsan boş.
- "confidence": "high", "medium" veya "low".
- "box_2d": kitabın fotoğraftaki sırt alanı, [ymin, xmin, ymax, xmax] biçiminde 0-1000 arası normalleştirilmiş koordinat.
- Türkçe karakterleri (ç ğ ı İ ö ş ü) doğru yaz; başlığı tamamı büyük harf yazılmışsa normal yazım biçimine çevir.
Sadece şu JSON'u döndür:
{"books":[{"title":"","author":"","publisher":"","genre":"","shelf":1,"position":1,"confidence":"high","box_2d":[0,0,0,0]}]}`;

const back = isbn => `Bu bir kitabın arka kapağının fotoğrafı.${isbn ? ' Barkoddan okunan ISBN: ' + isbn + '.' : ' Barkod okunamadı; fotoğrafta ISBN yazıyorsa onu da oku.'}
Kapakta görünen yazılardan (ve ISBN'den, bu kitabı kesin tanıyorsan bilgilerinden) kitabın adını, yazarını, yayınevini ve türünü çıkar.
Kapakta yazıyorsa ya da kesin biliyorsan sayfa sayısını ve basım yılını da ekle. "summary": kitabı tek cümlede anlatan kısa Türkçe özet (kapak yazısından ya da kesin bildiğin bilgiden; emin değilsen boş).
Emin olmadığın alanı boş bırak; tahmin uydurma. Türkçe karakterleri doğru yaz.
Sadece şu JSON'u döndür: {"title":"","author":"","publisher":"","genre":"","isbn":"","pages":0,"year":0,"summary":"","confidence":"high"}`;

async function gemini(prompt, b64) {
  if (!ai) {
    const {GoogleGenAI} = await import('@google/genai');
    ai = new GoogleGenAI({vertexai: true, project: PROJECT, location: 'global'});
  }
  const list = goodModel ? [goodModel] : MODELS;
  let last;
  for (const model of list) {
    try {
      const r = await ai.models.generateContent({
        model,
        contents: [{role: 'user', parts: [{inlineData: {mimeType: 'image/jpeg', data: b64}}, {text: prompt}]}],
        config: {responseMimeType: 'application/json', temperature: 0.1},
      });
      goodModel = model;
      return r.text;
    } catch (e) {
      last = e;
      const m = String(e && e.message || e);
      console.warn('model', model, m.slice(0, 300));
      if (!/not found|404|NOT_FOUND|does not have access|unsupported/i.test(m)) break;
    }
  }
  throw last;
}

function parse(t) {
  const m = String(t || '').match(/\{[\s\S]*\}/);
  if (!m) throw new HttpsError('internal', 'Yanıt anlaşılamadı');
  return JSON.parse(m[0]);
}

exports.kitaplikOku = onCall(
  {region: 'europe-west1', memory: '512MiB', timeoutSeconds: 150, maxInstances: 5},
  async req => {
    const uid = req.auth && req.auth.uid;
    if (!uid) throw new HttpsError('unauthenticated', 'Giriş gerekli');
    const {kind, image, isbn} = req.data || {};
    if (!['shelf', 'back'].includes(kind) || typeof image !== 'string' || image.length < 100 || image.length > 7e6)
      throw new HttpsError('invalid-argument', 'Geçersiz istek');

    // gunluk kota
    const day = new Date(Date.now() + 3 * 3600e3).toISOString().slice(0, 10);
    const ref = admin.firestore().collection('kitaplikKota').doc(uid + '_' + day);
    const n = await admin.firestore().runTransaction(async tx => {
      const s = await tx.get(ref);
      const c = (s.exists ? s.data().n : 0) + 1;
      if (c > DAILY_LIMIT) return c;
      tx.set(ref, {n: c, uid, day});
      return c;
    });
    if (n > DAILY_LIMIT) throw new HttpsError('resource-exhausted', 'Günlük limit doldu');

    const cleanIsbn = String(isbn || '').replace(/[^0-9Xx]/g, '').slice(0, 13);
    try {
      const out = parse(await gemini(kind === 'shelf' ? SHELF : back(cleanIsbn), image));
      return out;
    } catch (e) {
      if (e instanceof HttpsError) throw e;
      console.error('gemini hata', e);
      throw new HttpsError('unavailable', 'Tanıma servisi yanıt vermedi');
    }
  }
);

// Raf Izi: kullanicinin hesabini ve tum verilerini siler (kitaplik, fotograflar, kullanim kayitlari, giris kaydi)
exports.kitaplikHesapSil = onCall({region: 'europe-west1', maxInstances: 3}, async req => {
  const uid = req.auth && req.auth.uid;
  if (!uid) throw new HttpsError('unauthenticated', 'Giriş gerekli');
  const db = admin.firestore();
  await db.recursiveDelete(db.collection('kitaplik').doc(uid));
  const q = await db.collection('kitaplikKota').where('uid', '==', uid).get();
  const bt = db.batch(); q.forEach(d => bt.delete(d.ref)); await bt.commit();
  await admin.auth().deleteUser(uid).catch(e => console.warn('auth silinemedi', e.code));
  return {ok: true};
});
