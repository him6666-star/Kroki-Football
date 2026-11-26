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

const QUOTE = `Bu fotoğraf okunmakta olan bir kitabın sayfası. Okuyucu bir bölümün altını çizmiş, fosforlu kalemle boyamış, kenarına çizgi çekmiş ya da parantez içine almış olabilir.
Görev: İŞARETLİ bölümün metnini kelimesi kelimesine, sayfadaki yazımıyla aynen çıkar (Türkçe karakterleri doğru yaz, satır sonu tirelerini birleştir, satır sonlarını boşluğa çevir).
- İşaretli birden fazla ayrı bölüm varsa hepsini sırayla, aralarına boş satır koyarak yaz.
- Hiç işaret yoksa sayfadaki en belirgin tek paragrafı yaz ve "marked": false yap.
- "page": sayfanın üstünde ya da altında görünen sayfa numarası; görünmüyorsa 0.
- Metni özetleme, düzeltme, ekleme yapma.
Sadece şu JSON'u döndür: {"text":"","page":0,"marked":true}`;

const back = isbn => `Bu bir kitabın arka kapağının fotoğrafı.${isbn ? ' Barkoddan okunan ISBN: ' + isbn + '.' : ' Barkod okunamadı; fotoğrafta ISBN yazıyorsa onu da oku.'}
Kapakta görünen yazılardan (ve ISBN'den, bu kitabı kesin tanıyorsan bilgilerinden) kitabın adını, yazarını, yayınevini ve türünü çıkar.
Kapakta yazıyorsa ya da kesin biliyorsan sayfa sayısını ve basım yılını da ekle. "summary": kitabı tek cümlede anlatan kısa Türkçe özet (kapak yazısından ya da kesin bildiğin bilgiden; emin değilsen boş).
Emin olmadığın alanı boş bırak; tahmin uydurma. Türkçe karakterleri doğru yaz.
Sadece şu JSON'u döndür: {"title":"","author":"","publisher":"","genre":"","isbn":"","pages":0,"year":0,"summary":"","confidence":"high"}`;

async function gemini(prompt, b64, temperature) {
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
        contents: [{role: 'user', parts: b64 ? [{inlineData: {mimeType: 'image/jpeg', data: b64}}, {text: prompt}] : [{text: prompt}]}],
        config: {responseMimeType: 'application/json', temperature: temperature || 0.1},
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


const nrm = t => String(t || '').toLocaleLowerCase('tr').normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9ıçğöşü ]/g, ' ').replace(/\s+/g, ' ').trim();
const cut = (a, n, m) => (Array.isArray(a) ? a : []).slice(0, n).map(x => String(x || '').slice(0, m));
function suggestPrompt(d, lang) {
  const read = (Array.isArray(d.read) ? d.read : []).slice(0, 80).map(b => `- ${String(b.t || '').slice(0, 90)} — ${String(b.a || '').slice(0, 60)}${b.r ? ' (puan ' + Math.max(0, Math.min(5, +b.r || 0)) + '/5)' : ''}${b.g ? ' [' + String(b.g).slice(0, 30) + ']' : ''}`).join('\n');
  const own = cut(d.own, 600, 70).join('; '), skip = cut(d.skip, 200, 70).join('; '), wish = String(d.wish || '').slice(0, 200);
  const en = lang === 'en';
  return `Sen iyi okumuş, samimi bir kitapçısın. Bir okurun okuduğu kitaplara ve verdiği puanlara bakıp ona 8 kitap öner.
Okurun okudukları (puanı yüksek olanlar zevkini daha iyi gösterir, düşük puanlılara benzeyenlerden kaçın):
${read}
${wish ? '\nOkurun şu anki isteği: ' + wish + '\n' : ''}
Kurallar:
- Sadece gerçekten var olan, yayımlanmış kitaplar öner. Uydurma kitap ya da yanlış yazar eşleştirmesi kesinlikle olmasın.
- Şu kitaplar okurun kitaplığında zaten var, bunları ÖNERME: ${own || '(yok)'}
- Okur bunları istemediğini söyledi, bunları da ÖNERME: ${skip || '(yok)'}
- Karışık olsun: 2-3 tanesi sevdiği yazarların okumadığı başka kitapları, geri kalanı ona benzeyen ama yeni yazarlar. Aynı yazardan en fazla 2 kitap.
- ${en ? 'The reader uses the app in English: give the commonly used English title (original title if originally English) and write "why" and "genre" in English.' : 'Okur Türkçe okuyor: kitabın Türkçede yaygın kullanılan adını ver (çevirisi varsa çeviri adı), "why" ve "genre" Türkçe olsun. Türkçeye çevrilmiş ya da Türkçe yazılmış kitapları tercih et.'}
- "why" en fazla 2 kısa cümle: okurun okuduğu hangi kitaplara neden benzediğini, sıcak ve somut biçimde anlat (spoiler verme).
Sadece şu JSON'u döndür: {"items":[{"title":"","author":"","year":0,"genre":"","why":""}]}`;
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
    const {kind, image, isbn, lang} = req.data || {};
    const EN_NOTE = lang === 'en' ? '\nIMPORTANT: The user reads the app in English. Write "genre" and "summary" in English (keep book titles, author and publisher names exactly as printed).' : '';
    if (kind !== 'suggest' && (!['shelf', 'back', 'quote'].includes(kind) || typeof image !== 'string' || image.length < 100 || image.length > 7e6))
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
    if (kind === 'suggest') {
      const d = req.data || {};
      if (!Array.isArray(d.read) || !d.read.length) throw new HttpsError('invalid-argument', 'Önce okuduğun birkaç kitabı işaretle');
      try {
        const out = parse(await gemini(suggestPrompt(d, lang), null, 0.8));
        const ban = new Set([...cut(d.own, 600, 70), ...cut(d.skip, 200, 70), ...d.read.map(b => String(b.t || ''))].map(nrm));
        const seen = new Set();
        const items = (Array.isArray(out.items) ? out.items : []).filter(x => x && x.title && x.author).map(x => ({title: String(x.title).slice(0, 120), author: String(x.author).slice(0, 80), year: +x.year || 0, genre: String(x.genre || '').slice(0, 40), why: String(x.why || '').slice(0, 300)}))
          .filter(x => { const k = nrm(x.title); if (!k || ban.has(k) || seen.has(k)) return false; seen.add(k); return true; }).slice(0, 8);
        return {items};
      } catch (e) {
        if (e instanceof HttpsError) throw e;
        console.error('oneri hata', e);
        throw new HttpsError('unavailable', 'Öneri servisi yanıt vermedi');
      }
    }
    try {
      const out = parse(await gemini((kind === 'shelf' ? SHELF : kind === 'quote' ? QUOTE : back(cleanIsbn)) + (kind === 'quote' ? '' : EN_NOTE), image));
      return out;
    } catch (e) {
      if (e instanceof HttpsError) throw e;
      console.error('gemini hata', e);
      throw new HttpsError('unavailable', 'Tanıma servisi yanıt vermedi');
    }
  }
);

// Raf Izi: kullanicinin hesabini ve tum verilerini siler (kitaplik, fotograflar, kullanim kayitlari, giris kaydi)
exports.kitaplikHesapSil = onCall({region: 'europe-west1', maxInstances: 3, timeoutSeconds: 120}, async req => {
  const uid = req.auth && req.auth.uid;
  if (!uid) throw new HttpsError('unauthenticated', 'Giriş gerekli');
  const db = admin.firestore();
  // baska bir aile kitapligina uyeyse oradan cikar
  const ptr = await db.collection('kitaplikUye').doc(uid).get();
  if (ptr.exists) await dropMember(db, ptr.data().lib, uid);
  // kendi kitapligi: uyelerin erisimini kaldir, sonra tamamen sil
  const own = await db.collection('kitaplik').doc(uid).get();
  for (const m of (own.exists ? own.data().uyeler || [] : [])) await db.collection('kitaplikUye').doc(m).delete();
  const inv = await db.collection('kitaplikDavet').where('lib', '==', uid).get();
  const b1 = db.batch(); inv.forEach(d => b1.delete(d.ref)); await b1.commit();
  await db.recursiveDelete(db.collection('kitaplik').doc(uid));
  const q = await db.collection('kitaplikKota').where('uid', '==', uid).get();
  const bt = db.batch(); q.forEach(d => bt.delete(d.ref)); await bt.commit();
  await admin.auth().deleteUser(uid).catch(e => console.warn('auth silinemedi', e.code));
  return {ok: true};
});

// Raf Izi aile kitapligi: davet kodu olustur, katil, ayril, uye cikar
const ADJ = 'ABCDEFGHJKLMNPRSTUVYZ23456789';
async function copyLibrary(db, fromLib, toLib, uid) {
  const src = db.collection('kitaplik').doc(fromLib), dst = db.collection('kitaplik').doc(toLib);
  const PERSONAL = ['status', 'page', 'rating', 'notes', 'statusAt', 'finishedAt', 'loan', 'loanHistory', 'quotes'];
  const [books, metaDst, metaSrc, mine] = await Promise.all([src.collection('books').get(), dst.collection('meta').doc('bookcases').get(),
    src.collection('meta').doc('bookcases').get(), src.collection('kisisel').doc(uid).collection('kitap').get()]);
  const myP = {}; mine.forEach(d => { myP[d.id] = d.data(); });
  let bt = db.batch(), n = 0, ops = 0;
  const flush = async () => { if (ops) { await bt.commit(); bt = db.batch(); ops = 0; } };
  for (const d of books.docs) {
    const data = d.data(), shared = {}, pers = {};
    for (const [k, v] of Object.entries(data)) (PERSONAL.includes(k) ? pers : shared)[k] = v;
    Object.assign(pers, myP[d.id] || {});
    delete shared.photoId; delete shared.box;
    const id = 'c' + d.id;
    bt.set(dst.collection('books').doc(id), shared); ops++;
    if (Object.keys(pers).length) { bt.set(dst.collection('kisisel').doc(uid).collection('kitap').doc(id), pers); ops++; }
    n++; if (ops > 400) await flush();
  }
  await flush();
  const a = metaDst.exists ? metaDst.data() : {}, b = metaSrc.exists ? metaSrc.data() : {};
  const names = [...(a.names || [])]; for (const x of (b.names || [])) if (!names.includes(x)) names.push(x);
  await dst.collection('meta').doc('bookcases').set({names, shelves: {...(b.shelves || {}), ...(a.shelves || {})}});
  return n;
}
async function dropMember(db, lib, uid) {
  await db.collection('kitaplik').doc(lib).set({uyeler: admin.firestore.FieldValue.arrayRemove(uid), adlar: {[uid]: admin.firestore.FieldValue.delete()}}, {merge: true});
  await db.recursiveDelete(db.collection('kitaplik').doc(lib).collection('kisisel').doc(uid));
  await db.collection('kitaplikUye').doc(uid).delete();
}
exports.kitaplikAile = onCall({region: 'europe-west1', maxInstances: 3, timeoutSeconds: 120}, async req => {
  const uid = req.auth && req.auth.uid;
  if (!uid) throw new HttpsError('unauthenticated', 'Giriş gerekli');
  const db = admin.firestore();
  const {op, code, tasi, kim} = req.data || {};
  const myPtr = await db.collection('kitaplikUye').doc(uid).get();
  const myLib = myPtr.exists ? myPtr.data().lib : uid;
  const name = (req.auth.token.name || req.auth.token.email || 'Aile üyesi').toString().slice(0, 60);
  if (op === 'davet') {
    if (myLib !== uid) throw new HttpsError('failed-precondition', 'Başkasının kitaplığındasın; davet yalnızca kitaplık sahibinden gelir.');
    let c = ''; for (let i = 0; i < 6; i++) c += ADJ[Math.floor(Math.random() * ADJ.length)];
    await db.collection('kitaplikDavet').doc(c).set({lib: uid, by: uid, at: Date.now(), exp: Date.now() + 7 * 864e5});
    await db.collection('kitaplik').doc(uid).set({owner: uid, adlar: {[uid]: name}}, {merge: true});
    return {code: c};
  }
  if (op === 'katil') {
    const c = String(code || '').toUpperCase().replace(/[^A-Z0-9]/g, '');
    const inv = await db.collection('kitaplikDavet').doc(c || '-').get();
    if (!inv.exists || inv.data().exp < Date.now()) throw new HttpsError('not-found', 'Davet kodu bulunamadı ya da süresi doldu.');
    const lib = inv.data().lib;
    if (lib === uid) throw new HttpsError('failed-precondition', 'Bu senin kendi kitaplığının davet kodu.');
    if (myLib !== uid && myLib !== lib) throw new HttpsError('failed-precondition', 'Zaten başka bir aile kitaplığındasın; önce oradan ayrıl.');
    const own = await db.collection('kitaplik').doc(uid).get();
    if (own.exists && (own.data().uyeler || []).length) throw new HttpsError('failed-precondition', 'Senin kitaplığına üye olanlar var; başka bir kitaplığa katılmadan önce onları çıkar.');
    await db.collection('kitaplik').doc(lib).set({owner: lib, uyeler: admin.firestore.FieldValue.arrayUnion(uid), adlar: {[uid]: name}}, {merge: true});
    await db.collection('kitaplikUye').doc(uid).set({lib, at: Date.now()});
    let copied = 0; if (tasi) copied = await copyLibrary(db, uid, lib, uid);
    const o = await db.collection('kitaplik').doc(lib).get();
    return {lib, owner: (o.data().adlar || {})[lib] || '', copied};
  }
  if (op === 'ayril') {
    if (myLib === uid) throw new HttpsError('failed-precondition', 'Zaten kendi kitaplığındasın.');
    await dropMember(db, myLib, uid);
    return {ok: true};
  }
  if (op === 'cikar') {
    if (myLib !== uid) throw new HttpsError('permission-denied', 'Yalnızca kitaplık sahibi üye çıkarabilir.');
    const p = await db.collection('kitaplikUye').doc(String(kim || '-')).get();
    if (!p.exists || p.data().lib !== uid) throw new HttpsError('not-found', 'Bu kişi senin kitaplığında değil.');
    await dropMember(db, uid, kim);
    return {ok: true};
  }
  throw new HttpsError('invalid-argument', 'Bilinmeyen işlem');
});
