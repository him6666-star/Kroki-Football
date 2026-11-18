# "npx cap add android" sonrası Android projesini Amiral Battı'ya göre ayarlar.
# Dikey ekran, tam ekran (çentik payı bırakılır), ikon, açılış ekranı, imza ve sürüm numarası.
import re, shutil, os, glob
base = 'android/app/src/main'
BG = '#04111f'

# 1) Manifest: dikey ekran, donanım hızlandırma, titreşim izni
p = base + '/AndroidManifest.xml'
m = open(p, encoding='utf-8').read()
if 'screenOrientation' not in m:
    m = m.replace('android:name=".MainActivity"', 'android:name=".MainActivity"\n            android:screenOrientation="portrait"', 1)
if 'android.permission.VIBRATE' not in m:
    m = m.replace('<application', '<uses-permission android:name="android.permission.VIBRATE" />\n    <application', 1)
if 'hardwareAccelerated' not in m:
    m = m.replace('<application', '<application\n        android:hardwareAccelerated="true"', 1)
open(p, 'w', encoding='utf-8').write(m)

# 2) MainActivity: sistem çubukları gizli; oyun çentiğin/kameranın altında kalmasın diye WebView o kadar içeri alınır
act = '''package com.amiralbatti.game;

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
        try {
            WebView wv = getBridge().getWebView();
            wv.setBackgroundColor(Color.parseColor("%s"));
            wv.getSettings().setMediaPlaybackRequiresUserGesture(false);
            View holder = (View) wv.getParent();
            ViewCompat.setOnApplyWindowInsetsListener(holder, (v, insets) -> {
                Insets c = insets.getInsets(WindowInsetsCompat.Type.displayCutout());
                v.setPadding(c.left, c.top, c.right, c.bottom);
                return WindowInsetsCompat.CONSUMED;
            });
        } catch (Exception e) { }
        hideBars();
    }

    @Override
    public void onWindowFocusChanged(boolean hasFocus) {
        super.onWindowFocusChanged(hasFocus);
        if (hasFocus) hideBars();
    }

    private void hideBars() {
        WindowInsetsControllerCompat c = WindowCompat.getInsetsController(getWindow(), getWindow().getDecorView());
        c.hide(WindowInsetsCompat.Type.systemBars());
        c.setSystemBarsBehavior(WindowInsetsControllerCompat.BEHAVIOR_SHOW_TRANSIENT_BARS_BY_SWIPE);
    }
}
''' % (BG, BG)
open(glob.glob(base + '/java/com/amiralbatti/game/MainActivity.java')[0], 'w', encoding='utf-8').write(act)

# 3) İkonlar (uyarlanabilir ikonun arka planı ikonun kenar rengi)
for d in glob.glob('icons/mipmap-*'):
    dst = base + '/res/' + os.path.basename(d)
    os.makedirs(dst, exist_ok=True)
    for f in glob.glob(d + '/*.png'):
        shutil.copy(f, dst)
for f in glob.glob(base + '/res/mipmap-*/ic_launcher*.webp'):
    os.remove(f)
open(base + '/res/values/ic_launcher_background.xml', 'w', encoding='utf-8').write(
    '<?xml version="1.0" encoding="utf-8"?>\n<resources>\n    <color name="ic_launcher_background">#0b2a4a</color>\n</resources>\n')

# 4) Sabit test imzası: test APK'sı eskisinin üstüne kurulabilsin
b = 'android/app/build.gradle'
t = open(b, encoding='utf-8').read()
if 'amiral-batti-debug.keystore' not in t:
    t = t.replace('android {', 'android {\n    signingConfigs {\n        debug {\n            storeFile file("../../amiral-batti-debug.keystore")\n            storePassword "android"\n            keyAlias "androiddebugkey"\n            keyPassword "android"\n        }\n    }', 1)

# 6) Açılış ekranı: koyu deniz zemini, ortada logo; Android 12+ ikonla, eski sürümler logoyla
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
