package com.tvkumanda.lg;

import java.io.ByteArrayOutputStream;
import java.io.File;
import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.math.BigInteger;
import java.net.InetSocketAddress;
import java.net.Socket;
import java.security.KeyFactory;
import java.security.KeyPair;
import java.security.KeyPairGenerator;
import java.security.MessageDigest;
import java.security.Principal;
import java.security.PrivateKey;
import java.security.SecureRandom;
import java.security.Signature;
import java.security.cert.CertificateFactory;
import java.security.cert.X509Certificate;
import java.security.interfaces.RSAPublicKey;
import java.security.spec.PKCS8EncodedKeySpec;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;
import java.util.Locale;
import java.util.TimeZone;
import javax.net.ssl.KeyManager;
import javax.net.ssl.SSLContext;
import javax.net.ssl.SSLSocket;
import javax.net.ssl.TrustManager;
import javax.net.ssl.X509KeyManager;
import javax.net.ssl.X509TrustManager;

/**
 * Android TV / Google TV kumanda protokolü (v2).
 * 6467: eşleştirme (TV ekranında 6 haneli kod), 6466: kumanda (tuş gönderme).
 * Android'e bağımlı değil; MainActivity bunu JS'ye bağlar.
 */
public class AtvCore {
    public interface Listener { void onEvent(String type, String data); }

    public static final int PAIR_PORT = 6467, REMOTE_PORT = 6466;
    private final File dir;
    private final Listener listener;
    private PrivateKey key;
    private X509Certificate cert;

    private SSLSocket pairSock;
    private volatile SSLSocket remoteSock;
    private volatile String remoteHost;
    private final Object sendLock = new Object();

    public AtvCore(File dir, Listener l) { this.dir = dir; this.listener = l; }

    private void emit(String t, String d) { try { listener.onEvent(t, d == null ? "" : d); } catch (Exception e) { } }

    // ------------------------------------------------------------ istemci sertifikası
    private synchronized void ensureCert() throws Exception {
        if (cert != null) return;
        File kf = new File(dir, "atv_key.der"), cf = new File(dir, "atv_cert.der");
        if (kf.exists() && cf.exists()) {
            try {
                key = KeyFactory.getInstance("RSA").generatePrivate(new PKCS8EncodedKeySpec(readAll(kf)));
                cert = (X509Certificate) CertificateFactory.getInstance("X.509").generateCertificate(new FileInputStream(cf));
                return;
            } catch (Exception e) { /* yeniden üret */ }
        }
        KeyPairGenerator g = KeyPairGenerator.getInstance("RSA");
        g.initialize(2048);
        KeyPair kp = g.generateKeyPair();
        byte[] der = selfSigned(kp, "atvremote");
        cert = (X509Certificate) CertificateFactory.getInstance("X.509").generateCertificate(new java.io.ByteArrayInputStream(der));
        key = kp.getPrivate();
        writeAll(kf, key.getEncoded());
        writeAll(cf, der);
    }

    /** Uzantısız (v1) öz imzalı X.509 sertifikası, elle DER kodlamasıyla. */
    static byte[] selfSigned(KeyPair kp, String cn) throws Exception {
        byte[] algId = seq(cat(new byte[]{0x06, 0x09, 0x2A, (byte) 0x86, 0x48, (byte) 0x86, (byte) 0xF7, 0x0D, 0x01, 0x01, 0x0B}, new byte[]{0x05, 0x00}));
        byte[] name = seq(set(seq(cat(new byte[]{0x06, 0x03, 0x55, 0x04, 0x03}, tlv(0x0C, cn.getBytes("UTF-8"))))));
        SimpleDateFormat f = new SimpleDateFormat("yyMMddHHmmss'Z'", Locale.US);
        f.setTimeZone(TimeZone.getTimeZone("UTC"));
        long now = System.currentTimeMillis();
        byte[] validity = seq(cat(tlv(0x17, f.format(new Date(now - 86400000L)).getBytes("US-ASCII")),
                                  tlv(0x17, f.format(new Date(now + 20L * 365 * 86400000L)).getBytes("US-ASCII"))));
        byte[] serial = tlv(0x02, new BigInteger(63, new SecureRandom()).add(BigInteger.ONE).toByteArray());
        byte[] tbs = seq(cat(serial, algId, name, validity, name, kp.getPublic().getEncoded()));
        Signature s = Signature.getInstance("SHA256withRSA");
        s.initSign(kp.getPrivate());
        s.update(tbs);
        byte[] sig = s.sign();
        byte[] bits = tlv(0x03, cat(new byte[]{0}, sig));
        return seq(cat(tbs, algId, bits));
    }
    static byte[] seq(byte[] c) { return tlv(0x30, c); }
    static byte[] set(byte[] c) { return tlv(0x31, c); }
    static byte[] tlv(int tag, byte[] c) {
        ByteArrayOutputStream o = new ByteArrayOutputStream();
        o.write(tag);
        int n = c.length;
        if (n < 128) o.write(n);
        else if (n < 256) { o.write(0x81); o.write(n); }
        else if (n < 65536) { o.write(0x82); o.write(n >> 8); o.write(n & 0xff); }
        else { o.write(0x83); o.write(n >> 16); o.write((n >> 8) & 0xff); o.write(n & 0xff); }
        o.write(c, 0, n);
        return o.toByteArray();
    }
    static byte[] cat(byte[]... a) {
        ByteArrayOutputStream o = new ByteArrayOutputStream();
        for (byte[] b : a) o.write(b, 0, b.length);
        return o.toByteArray();
    }

    // ------------------------------------------------------------ TLS
    private SSLSocket open(String host, int port, int timeoutMs) throws Exception {
        ensureCert();
        final PrivateKey k = key;
        final X509Certificate[] chain = new X509Certificate[]{cert};
        X509KeyManager km = new X509KeyManager() {
            public String[] getClientAliases(String t, Principal[] i) { return new String[]{"k"}; }
            public String chooseClientAlias(String[] t, Principal[] i, Socket s) { return "k"; }
            public String[] getServerAliases(String t, Principal[] i) { return null; }
            public String chooseServerAlias(String t, Principal[] i, Socket s) { return null; }
            public X509Certificate[] getCertificateChain(String a) { return chain; }
            public PrivateKey getPrivateKey(String a) { return k; }
        };
        TrustManager tm = new X509TrustManager() {
            public void checkClientTrusted(X509Certificate[] c, String a) { }
            public void checkServerTrusted(X509Certificate[] c, String a) { }
            public X509Certificate[] getAcceptedIssuers() { return new X509Certificate[0]; }
        };
        SSLContext ctx = SSLContext.getInstance("TLS");
        ctx.init(new KeyManager[]{km}, new TrustManager[]{tm}, new SecureRandom());
        Socket raw = new Socket();
        raw.connect(new InetSocketAddress(host, port), timeoutMs);
        SSLSocket s = (SSLSocket) ctx.getSocketFactory().createSocket(raw, host, port, true);
        s.setSoTimeout(0);
        s.startHandshake();
        return s;
    }

    // ------------------------------------------------------------ eşleştirme
    public void startPairing(final String host) {
        new Thread(new Runnable() { public void run() {
            try {
                closePair();
                SSLSocket s = open(host, PAIR_PORT, 4000);
                s.setSoTimeout(15000);
                pairSock = s;
                // 1) eşleştirme isteği
                sendPair(s, 10, cat(Pb.str(1, "atvremote"), Pb.str(2, "TV Kumanda")));
                expectPair(s, 11);
                // 2) seçenekler: 6 haneli onaltılık kod, biz giriş tarafıyız
                byte[] enc = cat(Pb.varint(1, 3), Pb.varint(2, 6));
                sendPair(s, 20, cat(Pb.bytes(1, enc), Pb.varint(3, 1)));
                expectPair(s, 20);
                // 3) yapılandırma -> TV kodu gösterir
                sendPair(s, 30, cat(Pb.bytes(1, enc), Pb.varint(2, 1)));
                expectPair(s, 31);
                s.setSoTimeout(0);
                emit("pairCode", host);
            } catch (Exception e) {
                closePair();
                emit("pairError", "Eşleştirme başlatılamadı: " + e.getMessage());
            }
        }}).start();
    }

    public void finishPairing(final String host, final String codeIn) {
        new Thread(new Runnable() { public void run() {
            try {
                SSLSocket s = pairSock;
                if (s == null) throw new IOException("Eşleştirme oturumu yok, yeniden başlat");
                String code = codeIn.trim().toUpperCase(Locale.US);
                if (!code.matches("[0-9A-F]{6}")) { emit("pairError", "Kod 6 karakter olmalı (0-9, A-F)"); return; }
                RSAPublicKey cl = (RSAPublicKey) cert.getPublicKey();
                RSAPublicKey sv = (RSAPublicKey) s.getSession().getPeerCertificates()[0].getPublicKey();
                byte[] secret = secretHash(cl, sv, code);
                if ((secret[0] & 0xff) != Integer.parseInt(code.substring(0, 2), 16)) {
                    emit("pairError", "Kod yanlış, tekrar dene"); return;
                }
                s.setSoTimeout(15000);
                sendPair(s, 40, Pb.bytes(1, secret));
                expectPair(s, 41);
                closePair();
                emit("paired", host);
                connect(host);
            } catch (Exception e) {
                closePair();
                emit("pairError", "Eşleştirme başarısız: " + e.getMessage());
            }
        }}).start();
    }

    static byte[] secretHash(RSAPublicKey cl, RSAPublicKey sv, String code) throws Exception {
        MessageDigest d = MessageDigest.getInstance("SHA-256");
        d.update(hexBytes(cl.getModulus()));
        d.update(hexBytes(cl.getPublicExponent()));
        d.update(hexBytes(sv.getModulus()));
        d.update(hexBytes(sv.getPublicExponent()));
        d.update(unhex(code.substring(2)));
        return d.digest();
    }
    static byte[] hexBytes(BigInteger b) {
        String h = b.toString(16);
        if (h.length() % 2 == 1) h = "0" + h;
        return unhex(h);
    }
    static byte[] unhex(String h) {
        byte[] r = new byte[h.length() / 2];
        for (int i = 0; i < r.length; i++) r[i] = (byte) Integer.parseInt(h.substring(i * 2, i * 2 + 2), 16);
        return r;
    }

    private void sendPair(SSLSocket s, int field, byte[] inner) throws IOException {
        byte[] msg = cat(Pb.varint(1, 2), Pb.varint(2, 200), Pb.bytes(field, inner));
        writeFrame(s.getOutputStream(), msg);
    }
    private void expectPair(SSLSocket s, int field) throws IOException {
        Pb.Msg m = Pb.parse(readFrame(s.getInputStream()));
        long st = m.num(2, 200);
        if (st != 200) throw new IOException("TV reddetti (durum " + st + ")");
        if (!m.has(field)) throw new IOException("beklenmeyen yanıt");
    }
    private void closePair() { try { if (pairSock != null) pairSock.close(); } catch (Exception e) { } pairSock = null; }

    // ------------------------------------------------------------ kumanda bağlantısı
    public void connect(final String host) {
        disconnect();
        remoteHost = host;
        new Thread(new Runnable() { public void run() {
            SSLSocket s = null;
            boolean gotAny = false;
            try {
                try { s = open(host, REMOTE_PORT, 4000); }
                catch (javax.net.ssl.SSLException e) { emit("needPair", host); return; }
                catch (Exception e) { emit("unreachable", host); return; }
                remoteSock = s;
                InputStream in = s.getInputStream();
                boolean announced = false;
                while (true) {
                    Pb.Msg m = Pb.parse(readFrame(in));
                    gotAny = true;
                    if (m.has(1)) { // remote_configure
                        byte[] info = cat(Pb.str(1, "TV Kumanda"), Pb.str(2, "TV Kumanda"), Pb.varint(3, 1),
                                Pb.str(4, "1"), Pb.str(5, "atvremote"), Pb.str(6, "1.0.0"));
                        send(Pb.bytes(1, cat(Pb.varint(1, 622), Pb.bytes(2, info))));
                    } else if (m.has(2)) { // remote_set_active
                        send(Pb.bytes(2, Pb.varint(1, 622)));
                        if (!announced) { announced = true; emit("connected", host); }
                    } else if (m.has(8)) { // ping
                        Pb.Msg p = Pb.parse(m.bytes(8));
                        send(Pb.bytes(9, Pb.varint(1, p.num(1, 0))));
                    } else if (m.has(40)) { // remote_start: güç durumu
                        Pb.Msg p = Pb.parse(m.bytes(40));
                        emit("power", p.num(1, 0) != 0 ? "on" : "off");
                    } else if (m.has(3)) {
                        emit("remoteError", "TV hata bildirdi");
                    }
                }
            } catch (Exception e) {
                if (remoteSock == s) {
                    if (!gotAny) emit("needPair", host);
                    else emit("disconnected", e.getMessage() == null ? "" : e.getMessage());
                }
            } finally {
                if (remoteSock == s) remoteSock = null;
                try { if (s != null) s.close(); } catch (Exception e) { }
            }
        }}).start();
    }

    public void disconnect() {
        SSLSocket s = remoteSock;
        remoteSock = null;
        try { if (s != null) s.close(); } catch (Exception e) { }
    }

    public boolean isConnected() { return remoteSock != null; }

    /** direction: 1 = basılı tutmaya başla, 2 = bırak, 3 = kısa basış */
    public void key(final int code, final int direction) {
        sendAsync(Pb.bytes(10, cat(Pb.varint(1, code), Pb.varint(2, direction))));
    }
    public void appLink(String link) { sendAsync(Pb.bytes(90, Pb.str(1, link))); }

    private final java.util.concurrent.ExecutorService sender = java.util.concurrent.Executors.newSingleThreadExecutor();
    private void sendAsync(final byte[] msg) {
        if (remoteSock == null) { emit("notConnected", ""); return; }
        sender.execute(new Runnable() { public void run() {
            try { send(msg); } catch (Exception e) { emit("disconnected", "gönderilemedi"); disconnect(); }
        }});
    }
    private void send(byte[] msg) throws IOException {
        SSLSocket s = remoteSock;
        if (s == null) throw new IOException("bağlı değil");
        synchronized (sendLock) { writeFrame(s.getOutputStream(), msg); }
    }

    // ------------------------------------------------------------ ağda bulma (6466 portu açık cihazlar)
    public static List<String> scanSubnet(String prefix, int timeoutMs) {
        final List<String> found = new ArrayList<String>();
        List<Thread> ts = new ArrayList<Thread>();
        for (int i = 1; i < 255; i++) {
            final String ip = prefix + "." + i;
            Thread t = new Thread(new Runnable() { public void run() {
                Socket so = new Socket();
                try { so.connect(new InetSocketAddress(ip, REMOTE_PORT), 700); synchronized (found) { found.add(ip); } }
                catch (Exception e) { } finally { try { so.close(); } catch (Exception e) { } }
            }});
            ts.add(t); t.start();
        }
        for (Thread t : ts) try { t.join(timeoutMs); } catch (Exception e) { }
        synchronized (found) { return new ArrayList<String>(found); }
    }

    // ------------------------------------------------------------ çerçeveleme + protobuf
    static void writeFrame(OutputStream o, byte[] msg) throws IOException {
        ByteArrayOutputStream b = new ByteArrayOutputStream();
        Pb.writeVarint(b, msg.length);
        b.write(msg, 0, msg.length);
        o.write(b.toByteArray());
        o.flush();
    }
    static byte[] readFrame(InputStream in) throws IOException {
        long len = 0; int shift = 0;
        while (true) {
            int c = in.read();
            if (c < 0) throw new IOException("bağlantı kapandı");
            len |= (long) (c & 0x7f) << shift;
            if ((c & 0x80) == 0) break;
            shift += 7;
        }
        if (len > 1 << 20) throw new IOException("çok büyük mesaj");
        byte[] r = new byte[(int) len];
        int off = 0;
        while (off < r.length) {
            int n = in.read(r, off, r.length - off);
            if (n < 0) throw new IOException("bağlantı kapandı");
            off += n;
        }
        return r;
    }

    static byte[] readAll(File f) throws IOException {
        FileInputStream in = new FileInputStream(f);
        try {
            ByteArrayOutputStream o = new ByteArrayOutputStream();
            byte[] b = new byte[4096]; int n;
            while ((n = in.read(b)) > 0) o.write(b, 0, n);
            return o.toByteArray();
        } finally { in.close(); }
    }
    static void writeAll(File f, byte[] d) throws IOException {
        FileOutputStream o = new FileOutputStream(f);
        try { o.write(d); } finally { o.close(); }
    }

    /** Çok küçük protobuf yardımcı sınıfı (varint + uzunluk önekli alanlar). */
    public static class Pb {
        static void writeVarint(ByteArrayOutputStream o, long v) {
            while ((v & ~0x7FL) != 0) { o.write((int) ((v & 0x7f) | 0x80)); v >>>= 7; }
            o.write((int) v);
        }
        static byte[] varint(int field, long v) {
            ByteArrayOutputStream o = new ByteArrayOutputStream();
            writeVarint(o, ((long) field << 3)); writeVarint(o, v);
            return o.toByteArray();
        }
        static byte[] bytes(int field, byte[] v) {
            ByteArrayOutputStream o = new ByteArrayOutputStream();
            writeVarint(o, ((long) field << 3) | 2); writeVarint(o, v.length); o.write(v, 0, v.length);
            return o.toByteArray();
        }
        static byte[] str(int field, String s) {
            try { return bytes(field, s.getBytes("UTF-8")); } catch (Exception e) { return new byte[0]; }
        }
        public static class Msg {
            final java.util.Map<Integer, Object> f = new java.util.HashMap<Integer, Object>();
            boolean has(int k) { return f.containsKey(k); }
            long num(int k, long d) { Object o = f.get(k); return o instanceof Long ? (Long) o : d; }
            byte[] bytes(int k) { Object o = f.get(k); return o instanceof byte[] ? (byte[]) o : new byte[0]; }
        }
        static Msg parse(byte[] d) throws IOException {
            Msg m = new Msg();
            int[] p = {0};
            while (p[0] < d.length) {
                long tag = rv(d, p);
                int field = (int) (tag >>> 3), wt = (int) (tag & 7);
                if (wt == 0) m.f.put(field, rv(d, p));
                else if (wt == 2) {
                    int n = (int) rv(d, p);
                    if (n < 0 || p[0] + n > d.length) throw new IOException("bozuk mesaj");
                    byte[] b = new byte[n]; System.arraycopy(d, p[0], b, 0, n); p[0] += n;
                    m.f.put(field, b);
                } else if (wt == 5) p[0] += 4;
                else if (wt == 1) p[0] += 8;
                else throw new IOException("bilinmeyen alan türü");
            }
            return m;
        }
        static long rv(byte[] d, int[] p) throws IOException {
            long r = 0; int sh = 0;
            while (true) {
                if (p[0] >= d.length) throw new IOException("bozuk varint");
                int c = d[p[0]++] & 0xff;
                r |= (long) (c & 0x7f) << sh;
                if ((c & 0x80) == 0) return r;
                sh += 7;
            }
        }
    }
}
