// Yalnizca Android uygulamasinda calisir (Capacitor). Geri tusu: acik pencere/menu/paneli kapat > Raf Haritasi'na don > cik.
(function(){
  function setup(){
    var C=window.Capacitor; if(!C||!C.Plugins||!C.Plugins.App) return;
    var App=C.Plugins.App, q=function(s){return document.querySelector(s)};
    App.addListener("backButton",function(){
      var menu=q("#add-menu"); if(menu&&!menu.hidden){ menu.hidden=true; return; }
      var sheet=q("#sheet"); if(sheet&&sheet.classList.contains("on")){ var x=sheet.querySelector(".sec:not([hidden]) [data-close]"); if(x) x.click(); else sheet.classList.remove("on"); return; }
      var dr=q("#drawer"); if(dr&&dr.classList.contains("on")){ q("#d-x").click(); return; }
      var map=q('.nav [data-v="map"]'); if(map&&map.getAttribute("aria-current")!=="true"){ map.click(); return; }
      App.exitApp();
    });
  }
  if(document.readyState==="complete") setup(); else window.addEventListener("load",setup);
})();
