// Test botlarinin profil ve siralama kayitlarini siler
const admin = require('firebase-admin');
admin.initializeApp({credential: admin.credential.applicationDefault(), projectId: 'scribble-kick'});
const db = admin.firestore();
(async () => {
  const fs = require('fs');
  const uids = fs.existsSync('test_uids.json') ? JSON.parse(fs.readFileSync('test_uids.json', 'utf8')) : [];
  const bots = await db.collection('ab_players').where('name', 'in', ['TestBotA', 'TestBotB']).get();
  bots.forEach(d => { if (!uids.includes(d.id)) uids.push(d.id); });
  const wk = String(Math.floor((Date.now() + 3 * 3600e3 - 345600000) / 604800000));
  for (const u of uids) {
    await db.collection('ab_players').doc(u).delete();
    await db.collection('ab_weekly').doc(wk).collection('players').doc(u).delete();
    const w = await db.collection('ab_wins').where('uid', '==', u).get(); for (const d of w.docs) await d.ref.delete();
    console.log('temizlendi', u.slice(0, 5));
  }
})().catch(e => { console.error(e); process.exit(1); });
