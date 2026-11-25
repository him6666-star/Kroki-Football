# "npx cap add android" sonrasi Android projesini Kitapligim'a gore ayarlar.
# Dikey ekran, kamera izni, sistem cubuklarina gore bosluk, ikon, acilis ekrani, imza ve surum numarasi.
import re, shutil, os, glob
base = 'android/app/src/main'
BG = '#f6f6f4'

# 1) Manifest: dikey ekran, donanım hızlandırma, titreşim izni
p = base + '/AndroidManifest.xml'
m = open(p, encoding='utf-8').read()
if 'screenOrientation' not in m:
    m = m.replace('android:name=".MainActivity"', 'android:name=".MainActivity"\n            android:screenOrientation="portrait"', 1)
for perm in ['VIBRATE', 'CAMERA']:
    if 'android.permission.' + perm not in m:
        m = m.replace('<application', '<uses-permission android:name="android.permission.%s" />\n    <application' % perm, 1)
if 'android.hardware.camera' not in m:
    m = m.replace('<application', '<uses-feature android:name="android.hardware.camera" android:required="false" />\n    <application', 1)
# dikey ekran kilidi "zorunlu donanım" sayılmasın (Play: tüm cihazlar yükleyebilsin)
if 'android.hardware.screen.portrait' not in m:
    m = m.replace('<application', '<uses-feature android:name="android.hardware.screen.portrait" android:required="false" />\n    <application', 1)
if 'hardwareAccelerated' not in m:
    m = m.replace('<application', '<application\n        android:hardwareAccelerated="true"', 1)
open(p, 'w', encoding='utf-8').write(m)

# 2) MainActivity: sistem çubukları gizli; oyun çentiğin/kameranın altında kalmasın diye WebView o kadar içeri alınır
act = '''package com.fairridegames.rafizi;

import android.graphics.Color;
import android.os.Bundle;
import android.view.View;
import android.webkit.WebView;
import androidx.core.graphics.Insets;
import androidx.core.view.ViewCompat;
import androidx.core.view.WindowCompat;
import androidx.core.view.WindowInsetsCompat;
import androidx.core.view.WindowInsetsControllerCompat;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        WindowCompat.setDecorFitsSystemWindows(getWindow(), false);
        getWindow().getDecorView().setBackgroundColor(Color.parseColor("%s"));
        WindowInsetsControllerCompat c = WindowCompat.getInsetsController(getWindow(), getWindow().getDecorView());
        c.setAppearanceLightStatusBars(true);
        c.setAppearanceLightNavigationBars(true);
        try {
            WebView wv = getBridge().getWebView();
            wv.setBackgroundColor(Color.parseColor("%s"));
            View holder = (View) wv.getParent();
            ViewCompat.setOnApplyWindowInsetsListener(holder, (v, insets) -> {
                Insets b = insets.getInsets(WindowInsetsCompat.Type.systemBars() | WindowInsetsCompat.Type.displayCutout() | WindowInsetsCompat.Type.ime());
                v.setPadding(b.left, b.top, b.right, b.bottom);
                return WindowInsetsCompat.CONSUMED;
            });
        } catch (Exception e) { }
    }
}
''' % (BG, BG)
open(glob.glob(base + '/java/com/fairridegames/rafizi/MainActivity.java')[0], 'w', encoding='utf-8').write(act)

# 3) İkonlar (uyarlanabilir ikonun arka planı ikonun kenar rengi)
for d in glob.glob('icons/mipmap-*'):
    dst = base + '/res/' + os.path.basename(d)
    os.makedirs(dst, exist_ok=True)
    for f in glob.glob(d + '/*.png'):
        shutil.copy(f, dst)
for f in glob.glob(base + '/res/mipmap-*/ic_launcher*.webp'):
    os.remove(f)
open(base + '/res/values/ic_launcher_background.xml', 'w', encoding='utf-8').write(
    '<?xml version="1.0" encoding="utf-8"?>\n<resources>\n    <color name="ic_launcher_background">#104d2b</color>\n</resources>\n')

# 4) Sabit test imzası: test APK'sı eskisinin üstüne kurulabilsin
b = 'android/app/build.gradle'
t = open(b, encoding='utf-8').read()
if 'kitaplik-debug.keystore' not in t:
    t = t.replace('android {', 'android {\n    signingConfigs {\n        debug {\n            storeFile file("../../kitaplik-debug.keystore")\n            storePassword "android"\n            keyAlias "androiddebugkey"\n            keyPassword "android"\n        }\n    }', 1)

# 6) Acilis ekrani: acik zemin, ortada ikon
res = base + '/res'
for f in glob.glob(res + '/drawable*/splash.*'):
    os.remove(f)
os.makedirs(res + '/drawable', exist_ok=True)
os.makedirs(res + '/drawable-xxxhdpi', exist_ok=True)
shutil.copy('splash/splash_logo.png', res + '/drawable/splash_logo.png')
shutil.copy('splash/splash_icon.png', res + '/drawable-xxxhdpi/splash_icon.png')
open(res + '/drawable/splash.xml', 'w', encoding='utf-8').write(
    '<?xml version="1.0" encoding="utf-8"?>\n<layer-list xmlns:android="http://schemas.android.com/apk/res/android">\n'
    '    <item><shape android:shape="rectangle"><solid android:color="%s"/></shape></item>\n'
    '    <item android:gravity="center" android:left="48dp" android:right="48dp"><bitmap android:src="@drawable/splash_logo" android:gravity="center"/></item>\n'
    '</layer-list>\n' % BG)
sp = res + '/values/styles.xml'
if os.path.exists(sp):
    st = open(sp, encoding='utf-8').read()
    if 'windowSplashScreenBackground' not in st and 'NoActionBarLaunch' in st:
        st = re.sub(r'(<style name="AppTheme.NoActionBarLaunch"[^>]*>)', r'\1\n        <item name="windowSplashScreenBackground">%s</item>\n        <item name="windowSplashScreenAnimatedIcon">@drawable/splash_icon</item>' % BG, st, 1)
        open(sp, 'w', encoding='utf-8').write(st)

# 7) Play Store (AAB): yükleme anahtarı + sürüm numarası (yalnızca ortam değişkenleri varsa)
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
print('patch tamam')

# Google ile giris: Firebase Authentication eklentisi (Google) + google-services.json
v = 'android/variables.gradle'
t = open(v, encoding='utf-8').read()
if 'rgcfaIncludeGoogle' not in t:
    t = t.replace('ext {', 'ext {\n    rgcfaIncludeGoogle = true', 1)
    open(v, 'w', encoding='utf-8').write(t)
if os.path.exists('google-services.json'):
    shutil.copy('google-services.json', 'android/app/google-services.json')
    print('google-services.json kopyalandi')
else:
    print('UYARI: google-services.json yok, Google ile kaydet calismaz')
