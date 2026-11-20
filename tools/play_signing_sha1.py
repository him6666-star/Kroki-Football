# Play'in uygulama imzalama anahtarı SHA-1'ini bulur: Play'in ürettiği evrensel APK'yı indirip sertifikasını okur.
import json, os, sys, subprocess, google.auth.transport.requests
from google.oauth2 import service_account
pkg, vc = sys.argv[1], sys.argv[2]
cred = service_account.Credentials.from_service_account_info(json.loads(os.environ['PLAY_JSON']), scopes=['https://www.googleapis.com/auth/androidpublisher'])
s = google.auth.transport.requests.AuthorizedSession(cred)
base = f'https://androidpublisher.googleapis.com/androidpublisher/v3/applications/{pkg}/generatedApks/{vc}'
r = s.get(base); r.raise_for_status()
d = r.json()
gl = (d.get('generatedApks') or [{}])[0]
uni = gl.get('generatedUniversalApk') or {}
dl = uni.get('downloadId') or ((gl.get('generatedSplitApks') or [{}])[0].get('downloadId'))
if not dl: print('APK bulunamadı', json.dumps(d)[:500]); sys.exit(1)
r = s.get(f'{base}/downloads/{dl}:download', params={'alt': 'media'}); r.raise_for_status()
open('play.apk', 'wb').write(r.content)
out = subprocess.run(['keytool', '-printcert', '-jarfile', 'play.apk'], capture_output=True, text=True).stdout
sha = [l.split('SHA1:')[1].strip() for l in out.splitlines() if 'SHA1:' in l]
print('PLAY_SHA1=' + (sha[0] if sha else ''))
