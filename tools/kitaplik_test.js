// Yayindan sonra kitap tanima fonksiyonunu uctan uca dener (test kullanicisi + ornek arka kapak resmi).
const admin = require('firebase-admin');
const fs = require('fs');
const API_KEY = 'AIzaSyDST7X8QXynA2YJ6ZJZ1fWp1Ow2eJLylnQ';
const SITE = process.argv[2] || 'kitapligim.web.app';
(async () => {
  admin.initializeApp({credential: admin.credential.cert(JSON.parse(fs.readFileSync(process.env.GOOGLE_APPLICATION_CREDENTIALS)))});
  const ct = await admin.auth().createCustomToken('kitaplik-test-bot');
  const ref = {'Content-Type': 'application/json', Referer: 'https://' + SITE + '/'};
  const s = await (await fetch('https://identitytoolkit.googleapis.com/v1/accounts:signInWithCustomToken?key=' + API_KEY,
    {method: 'POST', headers: ref, body: JSON.stringify({token: ct, returnSecureToken: true})})).json();
  if (!s.idToken) { console.log('HATA giris', JSON.stringify(s)); process.exit(1); }
  const image = fs.readFileSync('kapak.jpg').toString('base64');
  let j = {};
  for (let i = 0; i < 4; i++) {
    const t0 = Date.now();
    const r = await fetch('https://europe-west1-scribble-kick.cloudfunctions.net/kitaplikOku',
      {method: 'POST', headers: {...ref, Authorization: 'Bearer ' + s.idToken}, body: JSON.stringify({data: {kind: 'back', image, isbn: '9789754700114'}})});
    const txt = await r.text();
    console.log('deneme', i + 1, 'HTTP', r.status, ((Date.now() - t0) / 1000).toFixed(1) + ' sn');
    try { j = JSON.parse(txt); } catch (e) { console.log(txt.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').slice(0, 400)); }
    if (j.result) break;
    await new Promise(r => setTimeout(r, 20000));
  }
  console.log(JSON.stringify(j, null, 1));
  await admin.auth().deleteUser('kitaplik-test-bot').catch(() => {});
  if (!j.result || !j.result.title) process.exit(1);
})().catch(e => { console.error(e); process.exit(1); });
