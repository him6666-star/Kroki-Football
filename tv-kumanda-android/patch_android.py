# "npx cap add android" sonrası TV Kumanda Android projesini ayarlar:
# dikey ekran, Wi-Fi izinleri, düz ws:// bağlantısına izin, TV'yi açma (Wake-on-LAN) köprüsü, ikon, açılış ekranı, test imzası.
import re, shutil, os, glob
base = 'android/app/src/main'
BG = '#0d1117'

p = base + '/AndroidManifest.xml'
m = open(p, encoding='utf-8').read()
if 'screenOrientation' not in m:
    m = m.replace('android:name=".MainActivity"', 'android:name=".MainActivity"\n            android:screenOrientation="portrait"', 1)
perms = ['android.permission.VIBRATE', 'android.permission.ACCESS_NETWORK_STATE',
         'android.permission.ACCESS_WIFI_STATE', 'android.permission.CHANGE_WIFI_MULTICAST_STATE', 'android.permission.TRANSMIT_IR']
for pr in perms:
    if pr not in m:
        m = m.replace('<application', '<uses-permission android:name="%s" />\n    <application' % pr, 1)
if 'android.hardware.screen.portrait' not in m:
    m = m.replace('<application', '<uses-feature android:name="android.hardware.screen.portrait" android:required="false" />\n    <application', 1)
if 'android.hardware.consumerir' not in m:
    m = m.replace('<application', '<uses-feature android:name="android.hardware.consumerir" android:required="false" />\n    <application', 1)
if 'usesCleartextTraffic' not in m:
    m = m.replace('<application', '<application\n        android:usesCleartextTraffic="true"', 1)
open(p, 'w', encoding='utf-8').write(m)

act = '''package com.tvkumanda.lg;

import android.content.Context;
import android.graphics.Color;
import android.net.nsd.NsdManager;
import android.net.nsd.NsdServiceInfo;
import android.net.wifi.WifiManager;
import org.json.JSONObject;
import java.net.Inet4Address;
import java.net.InetAddress;
import java.net.NetworkInterface;
import java.util.Collections;
import java.util.HashSet;
import java.util.LinkedList;
import java.util.List;
import java.util.Set;
import android.hardware.ConsumerIrManager;
import android.os.Bundle;
import android.webkit.JavascriptInterface;
import android.webkit.WebView;
import com.getcapacitor.BridgeActivity;
import java.net.DatagramPacket;
import java.net.DatagramSocket;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        getWindow().getDecorView().setBackgroundColor(Color.parseColor("%s"));
        try {
            WebView wv = getBridge().getWebView();
            wv.setBackgroundColor(Color.parseColor("%s"));
            wv.addJavascriptInterface(new Wol(), "TvWol");
            wv.addJavascriptInterface(new Ir(), "TvIr");
            wv.addJavascriptInterface(new Atv(), "TvAtv");
        } catch (Exception e) { }
    }

    /** TV+ (Android TV) kumandası: JS köprüsü */
    private AtvCore atv;
    private void jsEvent(final String type, final String data) {
        runOnUiThread(new Runnable() { public void run() {
            try {
                getBridge().getWebView().evaluateJavascript(
                    "window.atvEvent&&window.atvEvent(" + JSONObject.quote(type) + "," + JSONObject.quote(data) + ")", null);
            } catch (Exception e) { }
        }});
    }
    private synchronized AtvCore core() {
        if (atv == null) atv = new AtvCore(getFilesDir(), new AtvCore.Listener() {
            public void onEvent(String t, String d) { jsEvent(t, d); }
        });
        return atv;
    }
    public class Atv {
        @JavascriptInterface public void pair(String host) { core().startPairing(host); }
        @JavascriptInterface public void code(String host, String code) { core().finishPairing(host, code); }
        @JavascriptInterface public void connect(String host) { core().connect(host); }
        @JavascriptInterface public void disconnect() { core().disconnect(); }
        @JavascriptInterface public boolean connected() { return core().isConnected(); }
        @JavascriptInterface public void key(int code, int dir) { core().key(code, dir); }
        @JavascriptInterface public void link(String url) { core().appLink(url); }
        @JavascriptInterface public void discover() {
            final Set<String> seen = Collections.synchronizedSet(new HashSet<String>());
            // 1) mDNS: _androidtvremote2._tcp
            try {
                final WifiManager wm = (WifiManager) getApplicationContext().getSystemService(Context.WIFI_SERVICE);
                final WifiManager.MulticastLock lock = wm.createMulticastLock("tvk");
                lock.acquire();
                final NsdManager nsd = (NsdManager) getSystemService(Context.NSD_SERVICE);
                final LinkedList<NsdServiceInfo> queue = new LinkedList<NsdServiceInfo>();
                final boolean[] resolving = {false};
                final Runnable[] next = new Runnable[1];
                next[0] = new Runnable() { public void run() {
                    NsdServiceInfo si;
                    synchronized (queue) { if (resolving[0] || queue.isEmpty()) return; si = queue.removeFirst(); resolving[0] = true; }
                    try {
                        nsd.resolveService(si, new NsdManager.ResolveListener() {
                            public void onResolveFailed(NsdServiceInfo i, int e) { synchronized (queue) { resolving[0] = false; } next[0].run(); }
                            public void onServiceResolved(NsdServiceInfo i) {
                                try {
                                    String host = i.getHost().getHostAddress();
                                    if (host != null && seen.add(host)) {
                                        JSONObject o = new JSONObject(); o.put("name", i.getServiceName()); o.put("host", host);
                                        jsEvent("found", o.toString());
                                    }
                                } catch (Exception e) { }
                                synchronized (queue) { resolving[0] = false; }
                                next[0].run();
                            }
                        });
                    } catch (Exception e) { synchronized (queue) { resolving[0] = false; } }
                }};
                final NsdManager.DiscoveryListener dl = new NsdManager.DiscoveryListener() {
                    public void onStartDiscoveryFailed(String t, int e) { }
                    public void onStopDiscoveryFailed(String t, int e) { }
                    public void onDiscoveryStarted(String t) { }
                    public void onDiscoveryStopped(String t) { }
                    public void onServiceFound(NsdServiceInfo i) { synchronized (queue) { queue.add(i); } next[0].run(); }
                    public void onServiceLost(NsdServiceInfo i) { }
                };
                nsd.discoverServices("_androidtvremote2._tcp", NsdManager.PROTOCOL_DNS_SD, dl);
                new android.os.Handler(android.os.Looper.getMainLooper()).postDelayed(new Runnable() { public void run() {
                    try { nsd.stopServiceDiscovery(dl); } catch (Exception e) { }
                    try { lock.release(); } catch (Exception e) { }
                }}, 9000);
            } catch (Exception e) { }
            // 2) yedek: yerel ağda 6466 portu açık cihazları tara
            new Thread(new Runnable() { public void run() {
                try {
                    String prefix = null;
                    for (NetworkInterface ni : Collections.list(NetworkInterface.getNetworkInterfaces())) {
                        if (!ni.isUp() || ni.isLoopback()) continue;
                        for (InetAddress a : Collections.list(ni.getInetAddresses())) {
                            if (a instanceof Inet4Address && a.isSiteLocalAddress()) {
                                String ip = a.getHostAddress();
                                if (prefix == null || ni.getName().startsWith("wlan")) prefix = ip.substring(0, ip.lastIndexOf('.'));
                            }
                        }
                    }
                    if (prefix != null) {
                        List<String> l = AtvCore.scanSubnet(prefix, 3000);
                        for (String h : l) if (seen.add(h)) {
                            JSONObject o = new JSONObject(); o.put("name", "Android TV"); o.put("host", h);
                            jsEvent("found", o.toString());
                        }
                    }
                } catch (Exception e) { }
                jsEvent("scanDone", "");
            }}).start();
        }
    }

    /** Kızılötesi verici (telefonda varsa) */
    public class Ir {
        private ConsumerIrManager ir() {
            try { return (ConsumerIrManager) getSystemService(Context.CONSUMER_IR_SERVICE); } catch (Exception e) { return null; }
        }
        @JavascriptInterface
        public boolean hasIr() {
            ConsumerIrManager m = ir();
            return m != null && m.hasIrEmitter();
        }
        @JavascriptInterface
        public void transmit(int freq, String csv) {
            try {
                ConsumerIrManager m = ir();
                if (m == null || !m.hasIrEmitter()) return;
                String[] a = csv.split(",");
                int[] pat = new int[a.length];
                for (int i = 0; i < a.length; i++) pat[i] = Integer.parseInt(a[i].trim());
                m.transmit(freq, pat);
            } catch (Exception e) { }
        }
    }

    /** TV'yi Wi-Fi ile uyandırma: sihirli paket (Wake-on-LAN) */
    public static class Wol {
        @JavascriptInterface
        public void wake(final String mac, final String ip) {
            new Thread(new Runnable() { public void run() {
                try {
                    String[] h = mac.split("[:-]");
                    byte[] mb = new byte[6];
                    for (int i = 0; i < 6; i++) mb[i] = (byte) Integer.parseInt(h[i], 16);
                    byte[] d = new byte[102];
                    for (int i = 0; i < 6; i++) d[i] = (byte) 0xff;
                    for (int i = 6; i < d.length; i += 6) System.arraycopy(mb, 0, d, i, 6);
                    String sub = ip.substring(0, ip.lastIndexOf('.')) + ".255";
                    String[] targets = { "255.255.255.255", sub, ip };
                    DatagramSocket s = new DatagramSocket();
                    s.setBroadcast(true);
                    for (int k = 0; k < 3; k++) {
                        for (String t : targets) {
                            for (int port : new int[]{9, 7}) {
                                try { s.send(new DatagramPacket(d, d.length, InetAddress.getByName(t), port)); } catch (Exception e) { }
                            }
                        }
                        Thread.sleep(150);
                    }
                    s.close();
                } catch (Exception e) { }
            }}).start();
        }
    }
}
''' % (BG, BG)
open(glob.glob(base + '/java/com/tvkumanda/lg/MainActivity.java')[0], 'w', encoding='utf-8').write(act)
shutil.copy('java/AtvCore.java', base + '/java/com/tvkumanda/lg/AtvCore.java')

for d in glob.glob('icons/mipmap-*'):
    dst = base + '/res/' + os.path.basename(d)
    os.makedirs(dst, exist_ok=True)
    for f in glob.glob(d + '/*.png'):
        shutil.copy(f, dst)
for f in glob.glob(base + '/res/mipmap-*/ic_launcher*.webp'):
    os.remove(f)
open(base + '/res/values/ic_launcher_background.xml', 'w', encoding='utf-8').write(
    '<?xml version="1.0" encoding="utf-8"?>\n<resources>\n    <color name="ic_launcher_background">%s</color>\n</resources>\n' % BG)

b = 'android/app/build.gradle'
t = open(b, encoding='utf-8').read()
if 'tv-kumanda-debug.keystore' not in t:
    t = t.replace('android {', 'android {\n    signingConfigs {\n        debug {\n            storeFile file("../../tv-kumanda-debug.keystore")\n            storePassword "android"\n            keyAlias "androiddebugkey"\n            keyPassword "android"\n        }\n    }', 1)
vc = os.environ.get('VERSION_CODE')
if vc:
    t = re.sub(r'versionCode\s+\d+', 'versionCode ' + vc, t, count=1)
    t = re.sub(r'versionName\s+"[^"]*"', 'versionName "1.0.' + vc + '"', t, count=1)
open(b, 'w', encoding='utf-8').write(t)

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
    '    <item android:gravity="center" android:left="64dp" android:right="64dp"><bitmap android:src="@drawable/splash_logo" android:gravity="center"/></item>\n'
    '</layer-list>\n' % BG)
sp = res + '/values/styles.xml'
if os.path.exists(sp):
    st = open(sp, encoding='utf-8').read()
    if 'windowSplashScreenBackground' not in st and 'NoActionBarLaunch' in st:
        st = re.sub(r'(<style name="AppTheme.NoActionBarLaunch"[^>]*>)', r'\1\n        <item name="windowSplashScreenBackground">%s</item>\n        <item name="windowSplashScreenAnimatedIcon">@drawable/splash_icon</item>' % BG, st, 1)
        open(sp, 'w', encoding='utf-8').write(st)
print('patch tamam')
