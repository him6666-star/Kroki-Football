# Play magaza sayfasi (bir dil): baslik/aciklamalar + one cikan gorsel + telefon ekran goruntuleri.
# Kullanim: python tools/play_listing.py <paket> <dil (en-US)> <klasor>
import json, os, sys, glob
from google.oauth2 import service_account
from googleapiclient.discovery import build
from googleapiclient.http import MediaFileUpload
from googleapiclient.errors import HttpError
pkg, lang, d = sys.argv[1], sys.argv[2], sys.argv[3]
creds = service_account.Credentials.from_service_account_info(json.loads(os.environ['PLAY_JSON']), scopes=['https://www.googleapis.com/auth/androidpublisher'])
svc = build('androidpublisher', 'v3', credentials=creds, cache_discovery=False)
eid = svc.edits().insert(packageName=pkg, body={}).execute()['id']
det = svc.edits().details().get(packageName=pkg, editId=eid).execute()
print('varsayilan dil:', det.get('defaultLanguage'))
print('mevcut diller:', [l['language'] for l in svc.edits().listings().list(packageName=pkg, editId=eid).execute().get('listings', [])])
if os.path.exists(os.path.join(d, 'listing.json')):
    L = json.load(open(os.path.join(d, 'listing.json')))
    svc.edits().listings().update(packageName=pkg, editId=eid, language=lang, body={**L, 'language': lang}).execute()
    print('metinler yazildi:', lang)
else:
    print('metinlere dokunulmadi (listing.json yok):', lang)
for t in ['featureGraphic', 'phoneScreenshots']:
    svc.edits().images().deleteall(packageName=pkg, editId=eid, language=lang, imageType=t).execute()
svc.edits().images().upload(packageName=pkg, editId=eid, language=lang, imageType='featureGraphic', media_body=MediaFileUpload(os.path.join(d, 'feature.png'), mimetype='image/png')).execute()
for f in sorted(glob.glob(os.path.join(d, 'phone-*.png'))):
    svc.edits().images().upload(packageName=pkg, editId=eid, language=lang, imageType='phoneScreenshots', media_body=MediaFileUpload(f, mimetype='image/png')).execute()
    print('yuklendi:', os.path.basename(f))
try:
    svc.edits().commit(packageName=pkg, editId=eid).execute()
except HttpError as e:
    if 'changesNotSentForReview' in str(e):
        svc.edits().commit(packageName=pkg, editId=eid, changesNotSentForReview=True).execute(); print('(incelemeye gondermeden kaydedildi)')
    else: raise
print('TAMAM: magaza sayfasi guncellendi', lang)
