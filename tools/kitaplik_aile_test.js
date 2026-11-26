// Raf Izi aile kitapligi uctan uca: iki test kullanicisi, davet/katil/ayril ve Firestore kurallari.
const admin = require('firebase-admin');
const fs = require('fs');
const KEY = 'AIzaSyDST7X8QXynA2YJ6ZJZ1fWp1Ow2eJLylnQ', P = 'scribble-kick';
const REF = {'Content-Type': 'application/json', Referer: 'https://rafizi.web.app/'};
const FN = n => `https://europe-west1-${P}.cloudfunctions.net/${n}`;
const DOC = p => `https://firestore.googleapis.com/v1/projects/${P}/databases/(default)/documents/${p}`;
let fail = 0; const check = (ok, msg) => { console.log((ok ? 'OK   ' : 'HATA ') + msg); if (!ok) fail++; };
async function token(uid) {
  const ct = await admin.auth().createCustomToken(uid, {name: uid === 'raf-test-a' ? 'Test Sahibi' : 'Test Üye'});
  const s = await (await fetch('https://identitytoolkit.googleapis.com/v1/accounts:signInWithCustomToken?key=' + KEY, {method: 'POST', headers: REF, body: JSON.stringify({token: ct, returnSecureToken: true})})).json();
  return s.idToken;
}
async function call(fn, tok, data) {
  for (let i = 0; i < 4; i++) {
    const r = await fetch(FN(fn), {method: 'POST', headers: {...REF, Authorization: 'Bearer ' + tok}, body: JSON.stringify({data})});
    const t = await r.text(); try { return JSON.parse(t); } catch (e) { await new Promise(r => setTimeout(r, 15000)); }
  }
  return {};
}
const get = async (p, tok) => (await fetch(DOC(p), {headers: {Authorization: 'Bearer ' + tok}})).status;
const put = async (p, tok, title) => (await fetch(DOC(p), {method: 'PATCH', headers: {Authorization: 'Bearer ' + tok, 'Content-Type': 'application/json'}, body: JSON.stringify({fields: {title: {stringValue: title}}})})).status;
(async () => {
  admin.initializeApp({credential: admin.credential.cert(JSON.parse(fs.readFileSync(process.env.GOOGLE_APPLICATION_CREDENTIALS)))});
  const A = 'raf-test-a', Bu = 'raf-test-b';
  const ta = await token(A), tb = await token(Bu);
  check(await put(`kitaplik/${A}/books/t1`, ta, 'Aile Testi') === 200, 'sahip kendi kitaplığına kitap yazar');
  check(await get(`kitaplik/${A}/books/t1`, tb) === 403, 'yabancı, davetsiz okuyamaz');
  const d = await call('kitaplikAile', ta, {op: 'davet'}); const code = d.result && d.result.code;
  check(!!code, 'davet kodu oluştu: ' + code);
  const k = await call('kitaplikAile', tb, {op: 'katil', code});
  check(k.result && k.result.lib === A, 'üye koda katıldı (' + JSON.stringify(k.result || k.error) + ')');
  check(await get(`kitaplik/${A}/books/t1`, tb) === 200, 'üye ortak kitapları okur');
  check(await put(`kitaplik/${A}/books/t2`, tb, 'Üyenin kitabı') === 200, 'üye kitap ekler');
  check(await put(`kitaplik/${A}/kisisel/${Bu}/kitap/t1`, tb, 'x') === 200, 'üye kendi okuma kaydını yazar');
  check(await get(`kitaplik/${A}/kisisel/${A}/kitap/t1`, tb) === 403, 'üye sahibin okuma kaydını okuyamaz');
  check(await get(`kitaplikUye/${Bu}`, tb) === 200, 'üye kendi üyelik kaydını okur');
  const ay = await call('kitaplikAile', tb, {op: 'ayril'});
  check(ay.result && ay.result.ok, 'üye ayrıldı');
  check(await get(`kitaplik/${A}/books/t1`, tb) === 403, 'ayrılan üye artık okuyamaz');
  for (const t of [ta, tb]) await call('kitaplikHesapSil', t, {});
  for (const u of [A, Bu]) await admin.auth().deleteUser(u).catch(() => {});
  console.log(fail ? `${fail} kontrol başarısız` : 'Aile kitaplığı testi geçti');
  process.exit(fail ? 1 : 0);
})().catch(e => { console.error(e); process.exit(1); });
