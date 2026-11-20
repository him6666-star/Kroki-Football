# Play Oyun Hizmetleri: liderlik tabloları ve başarımları (yoksa) oluşturur, simgelerini yükler, kimlikleri yazdırır.
import json, os, sys, google.auth.transport.requests
from google.oauth2 import service_account
APP = sys.argv[1]; D = sys.argv[2]
defs = json.load(open(os.path.join(D, 'defs.json')))
cred = service_account.Credentials.from_service_account_info(json.loads(os.environ['PLAY_JSON']), scopes=['https://www.googleapis.com/auth/androidpublisher'])
s = google.auth.transport.requests.AuthorizedSession(cred)
B = 'https://www.googleapis.com/games/v1configuration'
TR = os.environ.get('PGS_TR') == '1'
def bundle(en, tr):
    t = [{'kind': 'gamesConfiguration#localizedString', 'locale': 'en-US', 'value': en}]
    if TR: t.append({'kind': 'gamesConfiguration#localizedString', 'locale': 'tr-TR', 'value': tr})
    return {'kind': 'gamesConfiguration#localizedStringBundle', 'translations': t}
def add_tr(kind, x, name, desc=None):
    # mevcut kayda Türkçe adı ekle (projede Türkçe dil tanımlıysa)
    if not TR: return
    d = x.get('draft') or x.get('published') or {}
    if any(t['locale'] == 'tr-TR' for t in d.get('name', {}).get('translations', [])): return
    d['name'] = bundle(*name)
    if desc: d['description'] = bundle(*desc)
    body = dict(x); body['draft'] = d; body.pop('published', None)
    r = s.put(f'{B}/{kind}/{x["id"]}', json=body)
    print('  tr', kind, x['id'][-3:], r.status_code, '' if r.ok else __import__('base64').b64encode(r.text[:400].encode()).decode())
def listall(kind):
    out, tok = [], None
    while True:
        r = s.get(f'{B}/applications/{APP}/{kind}', params={'maxResults': 200, **({'pageToken': tok} if tok else {})})
        if r.status_code != 200: import base64; print('LIST HATA', kind, r.status_code, base64.b64encode(r.text[:900].encode()).decode()); sys.exit(1)
        j = r.json(); out += j.get('items', []); tok = j.get('nextPageToken')
        if not tok: return out
def name_of(x):
    for t in (x.get('published') or x.get('draft') or {}).get('name', {}).get('translations', []):
        if t['locale'] == 'en-US': return t['value']
def icon(rid, typ, path):
  import time
  for k in range(2):
    r = s.post(f'https://www.googleapis.com/upload/games/v1configuration/images/{rid}/imageType/{typ}', params={'uploadType': 'media'}, data=open(path, 'rb').read(), headers={'Content-Type': 'image/png'})
    print('  simge', typ, r.status_code, '' if r.ok else __import__('base64').b64encode(r.text[:400].encode()).decode())
    if r.ok: return
    time.sleep(5 * (k + 1))
ids = {'app': APP, 'lb': {}, 'ach': {}}
have = {name_of(x): x for x in listall('leaderboards')}
for i, l in enumerate(defs['leaderboards']):
    x = have.get(l['en'])
    if not x:
        body = {'kind': 'gamesConfiguration#leaderboardConfiguration', 'scoreOrder': 'LARGER_IS_BETTER',
                'draft': {'kind': 'gamesConfiguration#leaderboardConfigurationDetail', 'name': bundle(l['en'], l['tr']), 'sortRank': l['order'],
                          'scoreFormat': {'numberFormatType': 'NUMERIC', 'numDecimalPlaces': 0}}}
        r = s.post(f'{B}/applications/{APP}/leaderboards', json=body)
        print('LB', l['key'], r.status_code, '' if r.ok else __import__('base64').b64encode(r.text[:900].encode()).decode()); r.raise_for_status(); x = r.json()
    else: add_tr('leaderboards', x, (l['en'], l['tr']))
    if not (x.get('draft') or x.get('published') or {}).get('iconUrl'):
        icon(x['id'], 'LEADERBOARD_ICON', os.path.join(D, 'icons', 'lb_' + l['key'] + '.png'))
    ids['lb'][l['key']] = x['id']
have = {name_of(x): x for x in listall('achievements')}
for i, a in enumerate(defs['achievements']):
    x = have.get(a['en'][0])
    if not x:
        body = {'kind': 'gamesConfiguration#achievementConfiguration', 'achievementType': 'INCREMENTAL' if a.get('steps') else 'STANDARD',
                'initialState': 'HIDDEN' if a.get('hidden') else 'REVEALED',
                'draft': {'kind': 'gamesConfiguration#achievementConfigurationDetail', 'name': bundle(a['en'][0], a['tr'][0]),
                          'description': bundle(a['en'][1], a['tr'][1]), 'pointValue': a['pts'], 'sortRank': i + 1}}
        if a.get('steps'): body['stepsToUnlock'] = a['steps']
        r = s.post(f'{B}/applications/{APP}/achievements', json=body)
        print('ACH', a['key'], r.status_code, '' if r.ok else __import__('base64').b64encode(r.text[:900].encode()).decode()); r.raise_for_status(); x = r.json()
    else: add_tr('achievements', x, (a['en'][0], a['tr'][0]), (a['en'][1], a['tr'][1]))
    if not (x.get('draft') or x.get('published') or {}).get('iconUrl'):
        icon(x['id'], 'ACHIEVEMENT_ICON', os.path.join(D, 'icons', 'ach_' + a['key'] + '.png'))
    ids['ach'][a['key']] = x['id']
print('PGS_IDS=' + json.dumps(ids).replace('{', '(').replace('}', ')'))
