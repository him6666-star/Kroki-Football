// Amiral Batti: son maclarin durumunu yazdirir (teshis icin)
const admin = require('firebase-admin');
admin.initializeApp({ credential: admin.credential.applicationDefault(), projectId: 'scribble-kick' });
const db = admin.firestore();
(async () => {
  const now = Date.now();
  const lob = await db.collection('ab_lobby').doc('main').get();
  console.log('LOBBY', JSON.stringify(lob.data()));
  const qs = await db.collection('ab_games').orderBy('created', 'desc').limit(25).get();
  for (const d of qs.docs) {
    const g = d.data(), sh = u => (u || '-').slice(0, 5);
    const hb = Object.entries(g.hb || {}).map(([u, t]) => sh(u) + ':' + Math.round((now - t.toMillis()) / 1000) + 's').join(' ');
    const res = g.res || [];
    const last = res.slice(-3).map(e => `${sh(e.by)}#${e.n}${e.hit ? 'H' : 'm'}${e.sunk ? 'S' : ''}`).join(',');
    const created = g.created ? Math.round((now - g.created.toMillis()) / 60000) + 'dk' : '?';
    const upd = Math.round((now - d.updateTime.toMillis()) / 1000) + 's';
    console.log(`${d.id.slice(0, 6)} ${created} önce, son değişiklik ${upd} | ${g.status} p1=${sh(g.p1)} p2=${sh(g.p2)} ready=${JSON.stringify(Object.keys(g.ready || {}).map(sh))} turn=${sh(g.turn)} pending=${g.pending ? sh(g.pending.by) + '#' + g.pending.n + '@' + g.pending.r + g.pending.c : 'yok'} res=${res.length} son=[${last}] hb=[${hb}] winner=${sh(g.winner)} why=${g.why}`);
  }
})().catch(e => { console.error(e); process.exit(1); });
