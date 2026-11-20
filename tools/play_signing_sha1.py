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
import glob, re
print('apk bytes', len(r.content))
bt = sorted(glob.glob(os.environ.get('ANDROID_HOME', '/usr/local/lib/android/sdk') + '/build-tools/*/apksigner'))
out = subprocess.run([bt[-1], 'verify', '--print-certs', 'play.apk'], capture_output=True, text=True).stdout if bt else ''
m = re.search(r'SHA-1 digest:\s*([0-9a-fA-F]{40})', out)
if not m:
    out = subprocess.run(['keytool', '-printcert', '-jarfile', 'play.apk'], capture_output=True, text=True).stdout
    sha = [l.split('SHA1:')[1].strip() for l in out.splitlines() if 'SHA1:' in l]
else:
    hs = []
    for h in re.findall(r'SHA-1 digest:\s*([0-9a-fA-F]{40})', out):
        h = h.upper()
        if h not in hs: hs.append(h)
    sha = [':'.join(h[i:i+2] for i in range(0, 40, 2)) for h in hs]
print('\n'.join(l for l in out.splitlines() if 'SHA-1' in l or 'DN' in l))
print('PLAY_SHA1=' + ' '.join(sha))
