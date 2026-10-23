#!/usr/bin/env python3
"""www/audio klasorundeki ses dosyalarini tarar ve audio/manifest.json uretir.
Kullanim (depo kokunden):  python3 tools/make_manifest.py
Dosya adlari: sfx icin <ad>.mp3|ogg|wav (varyasyon: <ad>2.mp3, <ad>3.mp3)
Muzik: music_menu.*, music_match.*   Kalabalik ortam sesi: crowd.*"""
import json, os, re, sys
d = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'www', 'audio')
SFX = ['kick_soft','kick_hard','goal','net','whistle_pen','whistle_foul','whistle_long','whistle_start','tackle','bump','wallhit','dash','wallup','fireshot','foul_knife','foul_axe','foul_hammer','foul_pan','foul_glove','cele_broom','cele_rocket','cele_giant','cele_ufo','cele_king','rk_bx','rk_by','pop']
ok = ('.mp3', '.ogg', '.wav', '.m4a')
files = sorted(f for f in os.listdir(d) if f.lower().endswith(ok))
m = {'sfx': [], 'music': {}}
for f in files:
    base = os.path.splitext(f)[0]
    if base in ('music_menu', 'music_match'):
        m['music'][base[6:]] = f
    elif base == 'crowd':
        m['crowd'] = f
    elif re.sub(r'\d+$', '', base) in SFX:
        m['sfx'].append(f)
    else:
        print('Taninmayan dosya (atlandi):', f)
if not m['music']: del m['music']
json.dump(m, open(os.path.join(d, 'manifest.json'), 'w'), indent=1)
print('manifest.json yazildi:', len(m['sfx']), 'efekt', list(m.get('music', {})), 'crowd' if 'crowd' in m else '')
