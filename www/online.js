// Kroki Futbol - cevrimici katman (Firebase: misafir girisi, profil, skor tablosu)
(function(){
 const cfg=window.KR_CFG;
 if(!cfg||!cfg.apiKey||!window.firebase)return;
 const T=(tr,en)=>(window.ST&&ST.lang=='en')?en:tr;
 const esc=s=>String(s).replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
 firebase.initializeApp(cfg);
 const auth=firebase.auth(),db=firebase.firestore(),FV=firebase.firestore.FieldValue;
 const KR=window.KR={user:null,profile:null,ready:false,db:db,FV:FV};
 const PTS={easy:[1,0],medium:[3,1],hard:[5,2]}; // [galibiyet, beraberlik]
 const HI='background:#7cc4ee;color:#0b1a16';
 const back='<div class="row"><button onclick="menu()">'+'\u2190'+'</button></div>';
 async function load(){
  try{const d=await db.collection('users').doc(KR.user.uid).get();KR.profile=d.exists?d.data():null}catch(e){KR.profile=null}
  const first=!KR.ready;KR.ready=true;if(first&&typeof state!='undefined'&&state=='menu')menu();
 }
 auth.onAuthStateChanged(u=>{if(!u){auth.signInAnonymously().catch(()=>{KR.ready=true});return}KR.user=u;load()});
 KR.native=!!(window.Capacitor&&Capacitor.isNativePlatform&&Capacitor.isNativePlatform());
 const faPlugin=()=>{const C=window.Capacitor;if(!C)return null;if(C.Plugins&&C.Plugins.FirebaseAuthentication)return C.Plugins.FirebaseAuthentication;if(typeof C.registerPlugin=='function')return C.registerPlugin('FirebaseAuthentication');return null};
 const afterAuth=async()=>{KR.user=auth.currentUser;KR.profile=null;await load();KR.profileUI()};
 KR.googleLogin=async()=>{
  const m=document.getElementById('krm'),say=t=>{if(m)m.textContent=t};
  try{
   say('...');
   if(!KR.native){
    const pr=new firebase.auth.GoogleAuthProvider(),cu=auth.currentUser;
    if(cu&&cu.isAnonymous){try{await cu.linkWithPopup(pr)}catch(e){if(e.code=='auth/credential-already-in-use'&&e.credential){await auth.signInWithCredential(e.credential)}else throw e}}
    else await auth.signInWithPopup(pr);
    await afterAuth();return;
   }
   const FA=faPlugin();if(!FA)throw new Error('plugin-yok');
   const r=await FA.signInWithGoogle(),idt=r&&r.credential&&r.credential.idToken;
   if(!idt)throw new Error('token yok');
   const cred=firebase.auth.GoogleAuthProvider.credential(idt),cu=auth.currentUser;
   if(cu&&cu.isAnonymous){try{await cu.linkWithCredential(cred)}catch(e){if(e.code=='auth/credential-already-in-use'||e.code=='auth/email-already-in-use'){await auth.signInWithCredential(e.credential||cred)}else throw e}}
   else await auth.signInWithCredential(cred);
   await afterAuth();
  }catch(e){say(T('Giri\u015f yap\u0131lamad\u0131: ','Sign-in failed: ')+((e&&(e.code||e.message))||''))}
 };
 KR.signOut=async()=>{try{const FA=KR.native&&faPlugin();if(FA)await FA.signOut()}catch(e){}try{await auth.signOut()}catch(e){}KR.user=null;KR.profile=null;menu()};
 KR.menuRow=()=>'<div class="row"><button onclick="KR.profileUI()">\ud83d\udc64 '+(KR.profile?esc(KR.profile.name):T('Profil','Profile'))+'</button><button onclick="KR.boardUI()">\ud83c\udfc6 '+T('Skor tablosu','Leaderboard')+'</button>'+(window.NETUI?'<button onclick="NETUI.lobby()">\uD83C\uDF10 Online</button>':'')+'</div>';
 KR.profileUI=()=>{
  if(!KR.user){ov.innerHTML='<div class="card"><h1>\ud83d\udc64</h1><p>'+T('Ba\u011flant\u0131 kurulamad\u0131. \u0130nterneti kontrol et.','Could not connect. Check your internet.')+'</p>'+back+'</div>';return}
  const p=KR.profile;
  let h='<div class="card"><h1>\ud83d\udc64 '+T('Profil','Profile')+'</h1>';
  if(p)h+='<p style="margin:4px 0 10px;opacity:.9">'+T('Puan','Points')+': <b>'+p.points+'</b> \u00b7 '+T('Ma\u00e7','Matches')+': '+p.matches+' \u00b7 G/B/M: '+p.wins+'/'+p.draws+'/'+p.losses+' \u00b7 '+T('Gol','Goals')+': '+p.goals+'</p>';
  h+='<div class="row"><input id="krn" maxlength="16" placeholder="'+T('Oyuncu ad\u0131 (3-16)','Player name (3-16)')+'" value="'+(p?esc(p.name):'')+'" style="padding:10px 14px;border-radius:999px;border:1px solid var(--bd);background:#1a2e28;color:#fff;font:600 15px system-ui;text-align:center;width:210px"></div>';
  const gu=KR.user&&!KR.user.isAnonymous;
  h+='<div id="krm" style="min-height:20px;font-size:13px;opacity:.85"></div><div class="row"><button style="'+HI+'" onclick="KR.saveName()">'+(p?T('Ad\u0131 de\u011fi\u015ftir','Rename'):T('Profil olu\u015ftur','Create profile'))+'</button></div>';
  h+='<p style="margin:8px 0 4px;font-size:13px;opacity:.8">'+(gu?'\u2705 Google: '+esc(KR.user.email||''):T('Misafir hesab\u0131 (uygulama silinirse puanlar kaybolur)','Guest account (points are lost if the app is deleted)'))+'</p>';
  h+='<div class="row">'+(gu?'<button onclick="KR.signOut()">'+T('\u00c7\u0131k\u0131\u015f yap','Sign out')+'</button>':'<button style="background:#fff;color:#222" onclick="KR.googleLogin()">G  '+T('Google ile giri\u015f yap','Sign in with Google')+'</button>')+'</div>'+back+'</div>';
  ov.style.display='flex';ov.innerHTML=h;
 };
 KR.saveName=async()=>{
  const el=document.getElementById('krn'),m=document.getElementById('krm'),n=(el.value||'').trim().replace(/\s+/g,' ');
  if(n.length<3||n.length>16){m.textContent=T('Ad 3-16 karakter olmal\u0131.','Name must be 3-16 characters.');return}
  m.textContent='...';
  try{
   const ref=db.collection('users').doc(KR.user.uid);
   if(KR.profile){await ref.update({name:n});KR.profile.name=n}
   else{const d={name:n,points:0,wins:0,draws:0,losses:0,goals:0,matches:0,last:FV.serverTimestamp()};await ref.set(d);KR.profile={...d,last:null}}
   menu();
  }catch(e){m.textContent=T('Kaydedilemedi. Tekrar dene.','Could not save. Try again.')}
 };
 KR.boardUI=async()=>{
  ov.style.display='flex';ov.innerHTML='<div class="card"><h1>\ud83c\udfc6</h1><p>...</p></div>';
  try{
   const q=await db.collection('users').orderBy('points','desc').limit(20).get();
   let h='<div class="card" style="min-width:min(420px,86%)"><h1>\ud83c\udfc6 '+T('Skor tablosu','Leaderboard')+'</h1><div style="text-align:left;max-height:240px;overflow:auto;margin:6px 0">';
   let i=0;q.forEach(d=>{const x=d.data();i++;const me=KR.user&&d.id==KR.user.uid;h+='<div style="display:flex;gap:10px;padding:5px 8px;border-radius:8px;'+(me?'background:rgba(124,196,238,.18);':'')+'"><span style="width:24px;opacity:.7">'+i+'</span><span style="flex:1">'+esc(x.name)+'</span><b>'+x.points+'</b></div>'});
   if(!i)h+='<p style="text-align:center;opacity:.8">'+T('Hen\u00fcz kimse yok.','Nobody yet.')+'</p>';
   ov.innerHTML=h+'</div>'+back+'</div>';
  }catch(e){ov.innerHTML='<div class="card"><h1>\ud83c\udfc6</h1><p>'+T('Tablo y\u00fcklenemedi.','Could not load the leaderboard.')+'</p>'+back+'</div>'}
 };
 // gorev/basarim odulu (kurallar: tek seferde en fazla 25 puan)
 KR.bonus=(n)=>db.collection('users').doc(KR.user.uid).update({points:FV.increment(Math.max(1,Math.min(25,n|0))),qlast:FV.serverTimestamp()}).then(()=>{if(KR.profile)KR.profile.points+=n});
 // 1 oyunculu mac bitince cagrilir; ekrana eklenecek HTML dondurur
 KR.matchEnd=(a,b,diff)=>{
  const w=a>b,dr=a==b;
  const gain=w?(PTS[diff]||PTS.medium)[0]:dr?(PTS[diff]||PTS.medium)[1]:0;
  if(!KR.user)return '';
  if(!KR.profile)return '<p style="margin:6px 0;font-size:14px;opacity:.9">'+T('Puan kaydetmek i\u00e7in profil olu\u015ftur.','Create a profile to save points.')+'</p><div class="row"><button onclick="KR.profileUI()">\ud83d\udc64 '+T('Profil','Profile')+'</button></div>';
  const p=KR.profile,g=Math.min(a,20);
  const upd={points:FV.increment(gain),wins:FV.increment(w?1:0),draws:FV.increment(dr?1:0),losses:FV.increment(!w&&!dr?1:0),goals:FV.increment(g),matches:FV.increment(1),last:FV.serverTimestamp()};
  db.collection('users').doc(KR.user.uid).update(upd).catch(()=>{});
  p.points+=gain;p.wins+=w?1:0;p.draws+=dr?1:0;p.losses+=!w&&!dr?1:0;p.goals+=g;p.matches+=1;
  return '<p style="margin:6px 0;font-size:16px;color:#7CFC8A">'+(gain?'+'+gain+' '+T('puan','points'):T('Puan yok','No points'))+' \u00b7 '+T('Toplam','Total')+': <b>'+p.points+'</b></p>';
 };
})();
