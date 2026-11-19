// Firestore kurallarini Firebase Rules test API ile dener (siralama yazimi)
const admin = require('firebase-admin'), fs = require('fs');
(async () => {
  const {access_token} = await admin.credential.applicationDefault().getAccessToken();
  const content = fs.readFileSync('firestore.rules', 'utf8');
  const now = new Date(), ms = now.getTime(), wk = String(Math.floor((ms + 3 * 3600e3 - 345600000) / 604800000));
  const D = '/databases/(default)/documents';
  const game = {data: {status: 'over', winner: 'A', why: 'sunk', p1: 'A', p2: 'B'}};
  const cases = [
    {name: 'ab_wins create', expectation: 'ALLOW', request: {auth: {uid: 'A'}, path: D + '/ab_wins/G1', method: 'create', time: now.toISOString(),
      resource: {data: {uid: 'A', wk: +wk}}},
     functionMocks: [{function: 'get', args: [{exactValue: D + '/ab_games/G1'}], result: {value: game}}]},
    {name: 'weekly create', expectation: 'ALLOW', request: {auth: {uid: 'A'}, path: D + `/ab_weekly/${wk}/players/A`, method: 'create', time: now.toISOString(),
      resource: {data: {name: 'TestBotA', rank: 1, wins: 1, lastGid: 'G1'}}},
     functionMocks: [
       {function: 'exists', args: [{exactValue: D + '/ab_wins/G1'}], result: {value: false}},
       {function: 'existsAfter', args: [{exactValue: D + '/ab_wins/G1'}], result: {value: true}},
       {function: 'getAfter', args: [{exactValue: D + '/ab_wins/G1'}], result: {value: {data: {uid: 'A'}}}}]},
    {name: 'weekly update', expectation: 'ALLOW', request: {auth: {uid: 'A'}, path: D + `/ab_weekly/${wk}/players/A`, method: 'update', time: now.toISOString(),
      resource: {data: {name: 'TestBotA', rank: 1, wins: 2, lastGid: 'G2'}}},
     functionMocks: [
       {function: 'get', args: [{exactValue: D + `/ab_weekly/${wk}/players/A`}], result: {value: {data: {wins: 1}}}},
       {function: 'exists', args: [{exactValue: D + '/ab_wins/G2'}], result: {value: false}},
       {function: 'existsAfter', args: [{exactValue: D + '/ab_wins/G2'}], result: {value: true}},
       {function: 'getAfter', args: [{exactValue: D + '/ab_wins/G2'}], result: {value: {data: {uid: 'A'}}}}]},
    {name: 'weekly hile (2 birden)', expectation: 'DENY', request: {auth: {uid: 'A'}, path: D + `/ab_weekly/${wk}/players/A`, method: 'create', time: now.toISOString(),
      resource: {data: {name: 'X', wins: 5, lastGid: 'G1'}}},
     functionMocks: [
       {function: 'exists', args: [{exactValue: D + '/ab_wins/G1'}], result: {value: false}},
       {function: 'existsAfter', args: [{exactValue: D + '/ab_wins/G1'}], result: {value: true}},
       {function: 'getAfter', args: [{exactValue: D + '/ab_wins/G1'}], result: {value: {data: {uid: 'A'}}}}]},
    {name: 'ab_wins hile (iska kazanc)', expectation: 'DENY', request: {auth: {uid: 'A'}, path: D + '/ab_wins/G3', method: 'create', time: now.toISOString(),
      resource: {data: {uid: 'A', wk: +wk}}},
     functionMocks: [{function: 'get', args: [{exactValue: D + '/ab_games/G3'}], result: {value: {data: {status: 'over', winner: 'A', why: 'left'}}}}]},
    {name: 'player create', expectation: 'ALLOW', request: {auth: {uid: 'A'}, path: D + '/ab_players/A', method: 'create', time: now.toISOString(),
      resource: {data: {name: 'TestBotA', xp: 195, games: 1}}}},
  ];
  const r = await fetch('https://firebaserules.googleapis.com/v1/projects/scribble-kick:test', {method: 'POST',
    headers: {Authorization: 'Bearer ' + access_token, 'Content-Type': 'application/json', 'x-goog-user-project': 'scribble-kick'},
    body: JSON.stringify({source: {files: [{name: 'firestore.rules', content}]}, testSuite: {testCases: cases.map(({name, ...c}) => c)}})});
  const j = await r.json();
  if (j.error) { console.log('HATA', JSON.stringify(j.error).slice(0, 800)); process.exit(1); }
  (j.testResults || []).forEach((t, i) => {
    console.log('KURAL', cases[i].name, '=>', t.state, (t.debugMessages || []).join(' ; ').slice(0, 300));
    (t.visitedExpressions || []).filter(v => v.value && v.value.boolValue === false).slice(0, 6)
      .forEach(v => console.log('   yanlis cikan ifade satir', v.sourcePosition && v.sourcePosition.line, 'sutun', v.sourcePosition && v.sourcePosition.column));
    if (t.errorPosition) console.log('   hata yeri', JSON.stringify(t.errorPosition));
  });
})().catch(e => { console.error(e); process.exit(1); });
