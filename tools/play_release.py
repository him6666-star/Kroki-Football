# alpha taslak surumu yayinla (incelemeye gonder) + ulke durumunu goster
import json, os, sys
from google.oauth2 import service_account
from googleapiclient.discovery import build
from googleapiclient.errors import HttpError
pkg=sys.argv[1]; track=sys.argv[2] if len(sys.argv)>2 else 'alpha'
c=service_account.Credentials.from_service_account_info(json.loads(os.environ['PLAY_JSON']),scopes=['https://www.googleapis.com/auth/androidpublisher'])
s=build('androidpublisher','v3',credentials=c,cache_discovery=False)
e=s.edits().insert(packageName=pkg,body={}).execute()['id']
for t in s.edits().tracks().list(packageName=pkg,editId=e).execute().get('tracks',[]):
    print('track',t['track'],[(r.get('name'),r.get('status'),r.get('versionCodes')) for r in t.get('releases',[])])
    try: print('  ulkeler:',s.edits().countryavailability().get(packageName=pkg,editId=e,track=t['track']).execute())
    except HttpError as x: print('  ulke okunamadi',x.status_code)
t=s.edits().tracks().get(packageName=pkg,editId=e,track=track).execute()
rs=t.get('releases',[]); d=[r for r in rs if r.get('status')=='draft']
if not d: print('taslak yok'); sys.exit()
top=max(d,key=lambda r:max(map(int,r['versionCodes'])))
top['status']='completed'
s.edits().tracks().update(packageName=pkg,editId=e,track=track,body={'track':track,'releases':[top]}).execute()
s.edits().commit(packageName=pkg,editId=e).execute()
print('YAYINLANDI (incelemeye gonderildi):',top.get('name'),top['versionCodes'])
