// Her pazartesi 00:05 (Istanbul): gecen haftanin ilk 3'unu bulur, odul belgesi yazar.
const {onSchedule} = require('firebase-functions/v2/scheduler');
const admin = require('firebase-admin');
admin.initializeApp();

const PRIZES = [100, 60, 30];
// Oyundaki hafta numarasi ile ayni formul (hafta pazartesi 00:00 Istanbul'da baslar)
const weekNo = ms => Math.floor((ms + 3 * 3600e3 - 345600000) / 604800000);

exports.weeklyPrizes = onSchedule(
  {schedule: '5 0 * * 1', timeZone: 'Europe/Istanbul', region: 'europe-west1'},
  async () => {
    const db = admin.firestore();
    const prev = weekNo(Date.now()) - 1;
    const snap = await db.collection('users').where('wk', '==', prev).orderBy('wp', 'desc').limit(3).get();
    const batch = db.batch();
    let rank = 0;
    snap.forEach(d => {
      const x = d.data();
      if (!(x.wp > 0) || rank >= PRIZES.length) return;
      batch.set(db.collection('prizes').doc(d.id + '_' + prev), {
        uid: d.id, wk: prev, rank: rank + 1, gold: PRIZES[rank], name: x.name || '',
        t: admin.firestore.FieldValue.serverTimestamp()
      });
      rank++;
    });
    await batch.commit();
  }
);
