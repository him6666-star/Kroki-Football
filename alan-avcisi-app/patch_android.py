import re, shutil, os, glob
base = 'android/app/src/main'
# 1) Manifest: yatay ekran + donanim hizlandirma
p = base + '/AndroidManifest.xml'
m = open(p, encoding='utf-8').read()
if 'screenOrientation' not in m:
    m = m.replace('android:name=".MainActivity"', 'android:name=".MainActivity"\n            android:screenOrientation="sensorPortrait"', 1)
if 'android.permission.VIBRATE' not in m:
    m = m.replace('<application', '<uses-permission android:name="android.permission.VIBRATE" />\n    <application', 1)
if 'android.hardware.screen.portrait' not in m:  # dikey ekran zorunlu donanım sayılmasın (Play uyarısı)
    m = m.replace('<application', '<uses-feature android:name="android.hardware.screen.portrait" android:required="false" />\n    <uses-feature android:name="android.hardware.touchscreen" android:required="false" />\n    <application', 1)
if 'hardwareAccelerated' not in m:
    m = m.replace('<application', '<application\n        android:hardwareAccelerated="true"', 1)
open(p, 'w', encoding='utf-8').write(m)
# 2) MainActivity: tam ekran (immersive), ekran acik kalsin, ses otomatik baslasin
act = '''package com.fairridegames.alanavcisi;

import android.os.Build;
import android.os.Bundle;
import android.view.View;
import android.view.WindowManager;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        registerPlugin(PlayGamesPlugin.class);
        super.onCreate(savedInstanceState);
        try { com.google.android.gms.games.PlayGamesSdk.initialize(this); } catch (Exception e) { }
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
open(glob.glob(base + '/java/com/fairridegames/alanavcisi/MainActivity.java')[0], 'w', encoding='utf-8').write(act)
# 2b) Play Oyun Hizmetleri: eklenti + APP_ID + bağımlılık
plug = '''package com.fairridegames.alanavcisi;

import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;
import com.google.android.gms.games.PlayGames;
import com.google.android.gms.games.SnapshotsClient;
import com.google.android.gms.games.snapshot.Snapshot;
import com.google.android.gms.games.snapshot.SnapshotMetadataChange;
import java.nio.charset.StandardCharsets;

@CapacitorPlugin(name = "PlayGames")
public class PlayGamesPlugin extends Plugin {
    private static final String SLOT = "alan-avcisi-ilerleme";

    private void authResult(PluginCall call, com.google.android.gms.tasks.Task<com.google.android.gms.games.AuthenticationResult> task) {
        task.addOnCompleteListener(t -> {
            JSObject r = new JSObject();
            r.put("signedIn", t.isSuccessful() && t.getResult() != null && t.getResult().isAuthenticated());
            call.resolve(r);
        });
    }
    @PluginMethod public void status(PluginCall call) { authResult(call, PlayGames.getGamesSignInClient(getActivity()).isAuthenticated()); }
    @PluginMethod public void signIn(PluginCall call) { authResult(call, PlayGames.getGamesSignInClient(getActivity()).signIn()); }

    @PluginMethod public void submitScore(PluginCall call) {
        String id = call.getString("id"); Long s = call.getLong("score");
        if (id != null && s != null) PlayGames.getLeaderboardsClient(getActivity()).submitScore(id, s);
        call.resolve();
    }
    @PluginMethod public void unlock(PluginCall call) {
        String id = call.getString("id");
        if (id != null) PlayGames.getAchievementsClient(getActivity()).unlock(id);
        call.resolve();
    }
    @PluginMethod public void setSteps(PluginCall call) {
        String id = call.getString("id"); Integer n = call.getInt("steps");
        if (id != null && n != null && n > 0) PlayGames.getAchievementsClient(getActivity()).setSteps(id, n);
        call.resolve();
    }
    @PluginMethod public void showLeaderboards(PluginCall call) {
        PlayGames.getLeaderboardsClient(getActivity()).getAllLeaderboardsIntent()
            .addOnSuccessListener(i -> getActivity().startActivityForResult(i, 9101));
        call.resolve();
    }
    @PluginMethod public void showAchievements(PluginCall call) {
        PlayGames.getAchievementsClient(getActivity()).getAchievementsIntent()
            .addOnSuccessListener(i -> getActivity().startActivityForResult(i, 9102));
        call.resolve();
    }
    @PluginMethod public void saveGame(PluginCall call) {
        String data = call.getString("data", ""); String desc = call.getString("desc", "");
        SnapshotsClient sc = PlayGames.getSnapshotsClient(getActivity());
        sc.open(SLOT, true, SnapshotsClient.RESOLUTION_POLICY_MOST_RECENTLY_MODIFIED).addOnCompleteListener(t -> {
            if (!t.isSuccessful() || t.getResult() == null || t.getResult().isConflict()) { call.reject("open"); return; }
            Snapshot snap = t.getResult().getData();
            snap.getSnapshotContents().writeBytes(data.getBytes(StandardCharsets.UTF_8));
            sc.commitAndClose(snap, new SnapshotMetadataChange.Builder().setDescription(desc).build())
                .addOnCompleteListener(c -> { if (c.isSuccessful()) call.resolve(); else call.reject("commit"); });
        });
    }
    @PluginMethod public void loadGame(PluginCall call) {
        SnapshotsClient sc = PlayGames.getSnapshotsClient(getActivity());
        sc.open(SLOT, true, SnapshotsClient.RESOLUTION_POLICY_MOST_RECENTLY_MODIFIED).addOnCompleteListener(t -> {
            if (!t.isSuccessful() || t.getResult() == null || t.getResult().isConflict()) { call.reject("open"); return; }
            Snapshot snap = t.getResult().getData();
            try {
                byte[] b = snap.getSnapshotContents().readFully();
                JSObject r = new JSObject(); r.put("data", b == null ? "" : new String(b, StandardCharsets.UTF_8));
                sc.discardAndClose(snap);
                call.resolve(r);
            } catch (Exception e) { call.reject("read"); }
        });
    }
}
'''
open(os.path.dirname(glob.glob(base + '/java/com/fairridegames/alanavcisi/MainActivity.java')[0]) + '/PlayGamesPlugin.java', 'w', encoding='utf-8').write(plug)
p = base + '/AndroidManifest.xml'
m = open(p, encoding='utf-8').read()
if 'games.APP_ID' not in m:
    m = m.replace('</application>', '    <meta-data android:name="com.google.android.gms.games.APP_ID" android:value="@string/game_services_project_id" />\n    </application>', 1)
    open(p, 'w', encoding='utf-8').write(m)
open(base + '/res/values/games-ids.xml', 'w', encoding='utf-8').write(
    '<?xml version="1.0" encoding="utf-8"?>\n<resources>\n    <string name="game_services_project_id" translatable="false">307843857448</string>\n</resources>\n')
bg = 'android/app/build.gradle'
t = open(bg, encoding='utf-8').read()
if 'play-services-games-v2' not in t:
    t = t.replace('dependencies {', 'dependencies {\n    implementation "com.google.android.gms:play-services-games-v2:20.1.2"', 1)
    open(bg, 'w', encoding='utf-8').write(t)
print('play games tamam')
# 3) Ikonlar
for d in glob.glob('icons/mipmap-*'):
    dst = base + '/res/' + os.path.basename(d)
    os.makedirs(dst, exist_ok=True)
    for f in glob.glob(d + '/*.png'):
        shutil.copy(f, dst)
open(base + '/res/values/ic_launcher_background.xml', 'w', encoding='utf-8').write(
    '<?xml version="1.0" encoding="utf-8"?>\n<resources>\n    <color name="ic_launcher_background">#0F1338</color>\n</resources>\n')
b = 'android/app/build.gradle'
# 5) Acilis ekrani (splash): varsayilan Capacitor logosu yerine oyun logosu
res = base + '/res'
for f in glob.glob(res + '/drawable*/splash.*'):
    os.remove(f)
os.makedirs(res + '/drawable', exist_ok=True)
shutil.copy('splash/splash_logo.png', res + '/drawable/splash_logo.png')
open(res + '/drawable/splash.xml', 'w', encoding='utf-8').write(
    '<?xml version="1.0" encoding="utf-8"?>\n<layer-list xmlns:android="http://schemas.android.com/apk/res/android">\n'
    '    <item><shape android:shape="rectangle"><solid android:color="#0F1338"/></shape></item>\n'
    '    <item android:gravity="center"><bitmap android:src="@drawable/splash_logo" android:gravity="center"/></item>\n'
    '</layer-list>\n')
sp = res + '/values/styles.xml'
if os.path.exists(sp):
    t = open(sp, encoding='utf-8').read()
    if 'windowSplashScreenBackground' not in t and 'NoActionBarLaunch' in t:
        t = re.sub(r'(<style name="AppTheme.NoActionBarLaunch"[^>]*>)', r'\1\n        <item name="windowSplashScreenBackground">#0F1338</item>\n        <item name="windowSplashScreenAnimatedIcon">@drawable/splash_logo</item>', t, 1)
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
    if '    signingConfigs {\n' in t:
        t = t.replace('    signingConfigs {\n', rel, 1)
    else:
        t = t.replace('android {', 'android {\n' + rel + '    }', 1)
    t = re.sub(r'(buildTypes\s*\{\s*release\s*\{)', r'\1\n            signingConfig signingConfigs.release', t, count=1)
    print('release imzasi eklendi')
vc = os.environ.get('VERSION_CODE')
if vc:
    t = re.sub(r'versionCode\s+\d+', 'versionCode ' + vc, t, count=1)
    t = re.sub(r'versionName\s+"[^"]*"', 'versionName "1.0.' + vc + '"', t, count=1)
    print('versionCode', vc)
open(b, 'w', encoding='utf-8').write(t)
