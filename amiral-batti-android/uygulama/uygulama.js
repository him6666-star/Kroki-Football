// Yalnızca Android uygulamasında çalışır (Capacitor). Geri tuşu: açık pencereyi kapat > oyundaysa menüye dön > menüdeyse çık.
(function(){
  function setup(){
    var C=window.Capacitor; if(!C||!C.Plugins||!C.Plugins.App) return;
    var App=C.Plugins.App;
    // WhatsApp davet linki: uygulamadan çıkmadan WhatsApp'ı aç (yeni pencere yerine doğrudan yönlendirme)
    document.addEventListener("click",function(e){
      var a=e.target.closest&&e.target.closest("#roomWa"); if(!a) return;
      e.preventDefault(); window.location.href=a.href;
    },true);
    App.addListener("backButton",function(){
      var open=[].slice.call(document.querySelectorAll(".overlay.show"));
      if(open.length){
        var top=open[open.length-1];
        if(top.id==="mm"){ var b=document.getElementById("mmCancel"); if(b) b.click(); return; }
        if(top.id==="quit"){ document.getElementById("quitNo").click(); return; }
        if(top.id==="howto"){ document.getElementById("howClose").click(); return; }
        if(top.id==="result"){ document.getElementById("resMenu").click(); return; }
        if(top.id==="room"){ document.getElementById("roomCancel").click(); return; }
        top.classList.remove("show"); return;
      }
      var game=document.getElementById("game");
      if(game&&game.classList.contains("show")){ document.getElementById("homeBtn").click(); return; }
      App.exitApp();
    });
  }
  if(document.readyState==="complete") setup(); else window.addEventListener("load",setup);
})();
