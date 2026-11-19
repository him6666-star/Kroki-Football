// Firebase Auth yetkili alan adlarina amiral-batti.web.app ekler (web'de Google ile kaydet icin)
const admin = require('firebase-admin');
(async () => {
  const cred = admin.credential.applicationDefault();
  const {access_token} = await cred.getAccessToken();
  const base = 'https://identitytoolkit.googleapis.com/admin/v2/projects/scribble-kick/config';
  const h = {Authorization: 'Bearer ' + access_token, 'Content-Type': 'application/json', 'x-goog-user-project': 'scribble-kick'};
  const cfg = await (await fetch(base, {headers: h})).json();
  if (cfg.error) { console.log('HATA config', JSON.stringify(cfg.error)); process.exit(1); }
  const doms = cfg.authorizedDomains || [];
  console.log('mevcut alanlar:', doms.join(', '));
  const google = (cfg.signIn || {});
  console.log('anonim:', JSON.stringify(google.anonymous || {}));
  if (doms.includes('amiral-batti.web.app')) { console.log('amiral-batti.web.app zaten var'); return; }
  const r = await fetch(base + '?updateMask=authorizedDomains', {method: 'PATCH', headers: h, body: JSON.stringify({authorizedDomains: [...doms, 'amiral-batti.web.app']})});
  const j = await r.json(); if (j.error) { console.log('HATA patch', JSON.stringify(j.error)); process.exit(1); }
  console.log('eklendi; yeni liste:', j.authorizedDomains.join(', '));
})().catch(e => { console.error(e); process.exit(1); });
