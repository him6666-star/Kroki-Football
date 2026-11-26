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
  const qr = await (await fetch('https://europe-west1-scribble-kick.cloudfunctions.net/kitaplikOku',
    {method: 'POST', headers: {...ref, Authorization: 'Bearer ' + s.idToken}, body: JSON.stringify({data: {kind: 'quote', image: fs.readFileSync('sayfa.jpg').toString('base64')}})})).json();
  console.log('alinti testi:', JSON.stringify(qr.result || qr.error));
  const read = [['Suç ve Ceza','Fyodor Dostoyevski',5],['Kürk Mantolu Madonna','Sabahattin Ali',5],['1984','George Orwell',4],['Tutunamayanlar','Oğuz Atay',5]].map(([t,a,r]) => ({t, a, r}));
  for (const lang of ['tr', 'en']) {
    const sg = await (await fetch('https://europe-west1-scribble-kick.cloudfunctions.net/kitaplikOku', {method: 'POST', headers: {...ref, Authorization: 'Bearer ' + s.idToken}, body: JSON.stringify({data: {kind: 'suggest', read, own: ['Suç ve Ceza', 'Beyaz Geceler'], skip: [], wish: '', lang}})})).json();
    console.log('oneri testi (' + lang + '):', JSON.stringify(sg.result || sg.error, null, 1));
  }
  const del = await (await fetch('https://europe-west1-scribble-kick.cloudfunctions.net/kitaplikHesapSil',
    {method: 'POST', headers: {...ref, Authorization: 'Bearer ' + s.idToken}, body: JSON.stringify({data: {}})})).json();
  console.log('hesap silme:', JSON.stringify(del));
  await admin.auth().deleteUser('kitaplik-test-bot').catch(() => {});
  if (!del.result || !del.result.ok) process.exit(1);
  if (!j.result || !j.result.title) process.exit(1);
})().catch(e => { console.error(e); process.exit(1); });
