// Hamster Mühendis: Google ile giriş + bulut kaydı (Firebase Auth + Firestore)
(function () {
  var cfg = window.HM_CFG, APP = window.HM_APP;
  if (!cfg || !window.firebase || !APP) return;
  firebase.initializeApp(cfg);
  var auth = firebase.auth(), db = firebase.firestore();
  var native = !!(window.Capacitor && Capacitor.isNativePlatform && Capacitor.isNativePlatform());
  var user = null, pulling = false, timer = 0;
  function plugin() {
    var C = window.Capacitor; if (!C) return null;
    if (C.Plugins && C.Plugins.FirebaseAuthentication) return C.Plugins.FirebaseAuthentication;
    return typeof C.registerPlugin === 'function' ? C.registerPlugin('FirebaseAuthentication') : null;
  }
  function doc() { return db.collection('hamster_users').doc(user.uid); }
  function push() {
    if (!user || pulling) return Promise.resolve();
    var s = APP.getSave();
    return doc().set({ stars: JSON.stringify(s.progress), shop: JSON.stringify(s.shop), t: firebase.firestore.FieldValue.serverTimestamp() })
      .catch(function (e) { APP.setMessage('Buluta kaydedilemedi: ' + (e.code || e.message)); });
  }
  function queue() { if (!user) return; clearTimeout(timer); timer = setTimeout(push, 2500); }
  function sync() {
    pulling = true;
    return doc().get().then(function (r) {
      pulling = false;
      if (r.exists) {
        var d = r.data(), p = null, sh = null;
        try { p = JSON.parse(d.stars || 'null'); } catch (e) {}
        try { sh = JSON.parse(d.shop || 'null'); } catch (e) {}
        APP.applySave({ progress: p, shop: sh });
      }
      return push();
    }).then(function () { APP.setMessage('İlerlemen bulutla eşitlendi.', true); })
      .catch(function (e) { pulling = false; APP.setMessage('Bulut kaydı okunamadı: ' + (e.code || e.message)); });
  }
  auth.onAuthStateChanged(function (u) {
    user = u && !u.isAnonymous ? u : null;
    APP.setAccount(user ? { name: user.displayName, email: user.email, photo: user.photoURL } : null);
    if (user) sync();
  });
  APP.onChange(queue);
  document.addEventListener('visibilitychange', function () { if (document.hidden && user) { clearTimeout(timer); push(); } });
  function fail(e) {
    var c = (e && (e.code || e.message)) || '';
    if (/popup-closed|cancel/i.test(c)) APP.setMessage('Giriş iptal edildi.');
    else APP.setMessage('Giriş yapılamadı: ' + c);
  }
  APP.enable({
    signIn: function () {
      if (!navigator.onLine) { APP.setMessage('İnternet bağlantısı yok.'); return; }
      if (!native) {
        var pr = new firebase.auth.GoogleAuthProvider();
        auth.signInWithPopup(pr).catch(function (e) {
          if (e && e.code === 'auth/popup-blocked') return auth.signInWithRedirect(pr);
          fail(e);
        });
        return;
      }
      var FA = plugin();
      if (!FA) { APP.setMessage('Giriş eklentisi bulunamadı.'); return; }
      FA.signInWithGoogle().then(function (r) {
        var t = r && r.credential && r.credential.idToken;
        if (!t) throw new Error('token yok');
        return auth.signInWithCredential(firebase.auth.GoogleAuthProvider.credential(t));
      }).catch(fail);
    },
    signOut: function () {
      push().then(function () {
        var FA = native && plugin();
        return FA ? FA.signOut().catch(function () {}) : null;
      }).then(function () { return auth.signOut(); }).then(function () { APP.setMessage('Çıkış yapıldı. İlerlemen bu cihazda kalmaya devam ediyor.', true); });
    }
  });
})();
