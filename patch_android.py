import re, shutil, os, glob
base = 'android/app/src/main'
# 1) Manifest: yatay ekran + donanim hizlandirma
p = base + '/AndroidManifest.xml'
m = open(p, encoding='utf-8').read()
if 'screenOrientation' not in m:
    m = m.replace('android:name=".MainActivity"', 'android:name=".MainActivity"\n            android:screenOrientation="sensorLandscape"', 1)
if 'hardwareAccelerated' not in m:
    m = m.replace('<application', '<application\n        android:hardwareAccelerated="true"', 1)
open(p, 'w', encoding='utf-8').write(m)
# 2) MainActivity: tam ekran (immersive), ekran acik kalsin, ses otomatik baslasin
act = '''package com.scribblekick.game;

import android.os.Build;
import android.os.Bundle;
import android.view.View;
import android.view.WindowManager;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        getWindow().addFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON);
        if (Build.VERSION.SDK_INT >= 28) {
            WindowManager.LayoutParams lp = getWindow().getAttributes();
            lp.layoutInDisplayCutoutMode = WindowManager.LayoutParams.LAYOUT_IN_DISPLAY_CUTOUT_MODE_SHORT_EDGES;
            getWindow().setAttributes(lp);
        }
        hideBars();
        try {
            if (getBridge() != null && getBridge().getWebView() != null) {
                getBridge().getWebView().getSettings().setMediaPlaybackRequiresUserGesture(false);
            }
        } catch (Exception e) { }
    }

    @Override
    public void onWindowFocusChanged(boolean hasFocus) {
        super.onWindowFocusChanged(hasFocus);
        if (hasFocus) hideBars();
    }

    private void hideBars() {
        getWindow().getDecorView().setSystemUiVisibility(
            View.SYSTEM_UI_FLAG_IMMERSIVE_STICKY
            | View.SYSTEM_UI_FLAG_FULLSCREEN
            | View.SYSTEM_UI_FLAG_HIDE_NAVIGATION
            | View.SYSTEM_UI_FLAG_LAYOUT_STABLE
            | View.SYSTEM_UI_FLAG_LAYOUT_HIDE_NAVIGATION
            | View.SYSTEM_UI_FLAG_LAYOUT_FULLSCREEN);
    }
}
'''
open(glob.glob(base + '/java/com/scribblekick/game/MainActivity.java')[0], 'w', encoding='utf-8').write(act)
# 3) Ikonlar
for d in glob.glob('icons/mipmap-*'):
    dst = base + '/res/' + os.path.basename(d)
    os.makedirs(dst, exist_ok=True)
    for f in glob.glob(d + '/*.png'):
        shutil.copy(f, dst)
open(base + '/res/values/ic_launcher_background.xml', 'w', encoding='utf-8').write(
    '<?xml version="1.0" encoding="utf-8"?>\n<resources>\n    <color name="ic_launcher_background">#1F7A40</color>\n</resources>\n')
# 4) Google girisi: Google Play hizmetleri, sabit imza (SHA-1 degismesin), google-services.json
v = 'android/variables.gradle'
t = open(v, encoding='utf-8').read()
if 'rgcfaIncludeGoogle' not in t:
    t = t.replace('ext {', 'ext {\n    rgcfaIncludeGoogle = true', 1)
    open(v, 'w', encoding='utf-8').write(t)
b = 'android/app/build.gradle'
t = open(b, encoding='utf-8').read()
if 'scribble-debug.keystore' not in t:
    t = t.replace('android {', 'android {\n    signingConfigs {\n        debug {\n            storeFile file("../../scribble-debug.keystore")\n            storePassword "android"\n            keyAlias "androiddebugkey"\n            keyPassword "android"\n        }\n    }', 1)
    open(b, 'w', encoding='utf-8').write(t)
if os.path.exists('google-services.json'):
    shutil.copy('google-services.json', 'android/app/google-services.json')
    print('google-services.json kopyalandi')
else:
    print('UYARI: google-services.json yok, Google girisi calismaz')

# 5) Acilis ekrani (splash): varsayilan Capacitor logosu yerine oyun logosu
res = base + '/res'
for f in glob.glob(res + '/drawable*/splash.*'):
    os.remove(f)
os.makedirs(res + '/drawable', exist_ok=True)
shutil.copy('splash/splash_logo.png', res + '/drawable/splash_logo.png')
open(res + '/drawable/splash.xml', 'w', encoding='utf-8').write(
    '<?xml version="1.0" encoding="utf-8"?>\n<layer-list xmlns:android="http://schemas.android.com/apk/res/android">\n'
    '    <item><shape android:shape="rectangle"><solid android:color="#101C19"/></shape></item>\n'
    '    <item android:gravity="center"><bitmap android:src="@drawable/splash_logo" android:gravity="center"/></item>\n'
    '</layer-list>\n')
sp = res + '/values/styles.xml'
if os.path.exists(sp):
    t = open(sp, encoding='utf-8').read()
    if 'windowSplashScreenBackground' not in t and 'NoActionBarLaunch' in t:
        t = re.sub(r'(<style name="AppTheme.NoActionBarLaunch"[^>]*>)', r'\1\n        <item name="windowSplashScreenBackground">#101C19</item>\n        <item name="windowSplashScreenAnimatedIcon">@drawable/splash_logo</item>', t, 1)
        open(sp, 'w', encoding='utf-8').write(t)
print('splash tamam')
print('patch tamam')

# 5) Play Store (AAB): yukleme anahtari + surum numarasi (sadece ortam degiskenleri varsa)
t = open(b, encoding='utf-8').read()
ks = os.environ.get('UPLOAD_KS')
if ks and 'upload-release' not in t:
    rel = ('    signingConfigs {\n        release { // upload-release\n'
           '            storeFile file("%s")\n            storePassword System.getenv("UPLOAD_KS_PASS")\n'
           '            keyAlias System.getenv("UPLOAD_KEY_ALIAS")\n            keyPassword System.getenv("UPLOAD_KEY_PASS")\n        }\n' % ks)
    t = t.replace('    signingConfigs {\n', rel, 1)
    t = re.sub(r'(buildTypes\s*\{\s*release\s*\{)', r'\1\n            signingConfig signingConfigs.release', t, count=1)
    print('release imzasi eklendi')
vc = os.environ.get('VERSION_CODE')
if vc:
    t = re.sub(r'versionCode\s+\d+', 'versionCode ' + vc, t, count=1)
    t = re.sub(r'versionName\s+"[^"]*"', 'versionName "1.0.' + vc + '"', t, count=1)
    print('versionCode', vc)
open(b, 'w', encoding='utf-8').write(t)
