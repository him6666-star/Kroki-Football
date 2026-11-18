const admin = require('firebase-admin');
admin.initializeApp({ credential: admin.credential.applicationDefault(), projectId: 'scribble-kick' });
const db = admin.firestore();
(async () => {
  const qs = await db.collection('ab_games').orderBy('created', 'desc').limit(1).get();
  const d = qs.docs[0], g = d.data(), sh = u => (u || '-').slice(0, 5);
  console.log('GAME', d.id, 'status', g.status, 'turn', sh(g.turn), 'pending', JSON.stringify(g.pending && { ...g.pending, by: sh(g.pending.by) }), 'p1', sh(g.p1), 'p2', sh(g.p2));
  for (const e of g.res || []) console.log('RES', e.n, sh(e.by), e.r + '' + e.c, e.hit ? 'HIT' : 'miss', e.sunk ? 'SUNK ' + e.sunk.name + ' [' + e.sunk.cells + ']' : '');
  console.log('KEYS', Object.keys(g).join(','));
})().catch(e => { console.error(e); process.exit(1); });
