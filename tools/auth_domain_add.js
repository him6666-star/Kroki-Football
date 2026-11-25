// Firebase Auth yetkili alan adlarina verilen alani ekler: node tools/auth_domain_add.js kitapligim.web.app
const admin = require('firebase-admin');
const dom = process.argv[2];
(async () => {
  if (!dom) throw new Error('alan adi verilmedi');
  const {access_token} = await admin.credential.applicationDefault().getAccessToken();
  const base = 'https://identitytoolkit.googleapis.com/admin/v2/projects/scribble-kick/config';
  const h = {Authorization: 'Bearer ' + access_token, 'Content-Type': 'application/json', 'x-goog-user-project': 'scribble-kick'};
  const cfg = await (await fetch(base, {headers: h})).json();
  if (cfg.error) { console.log('HATA config', JSON.stringify(cfg.error)); process.exit(1); }
  const doms = cfg.authorizedDomains || [];
  if (doms.includes(dom)) { console.log(dom + ' zaten yetkili'); return; }
  const r = await fetch(base + '?updateMask=authorizedDomains', {method: 'PATCH', headers: h, body: JSON.stringify({authorizedDomains: [...doms, dom]})});
  const j = await r.json(); if (j.error) { console.log('HATA patch', JSON.stringify(j.error)); process.exit(1); }
  console.log('eklendi:', dom);
})().catch(e => { console.error(e); process.exit(1); });
