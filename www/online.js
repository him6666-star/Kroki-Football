// Kroki Futbol - cevrimici katman (Firebase: misafir girisi, profil, skor tablosu)
(function(){
 const cfg=window.KR_CFG;
 if(!cfg||!cfg.apiKey||!window.firebase)return;
 const T=(tr,en)=>(window.ST&&ST.lang=='en')?en:tr;
 const esc=s=>String(s).replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
 firebase.initializeApp(cfg);
 const auth=firebase.auth(),db=firebase.firestore(),FV=firebase.firestore.FieldValue;
 const KR=window.KR={user:null,profile:null,ready:false,db:db,FV:FV};
 const WK=()=>Math.floor((Date.now()+3*3600e3-345600000)/604800000);KR.week=WK;
 const PTS={easy:[1,0],medium:[3,1],hard:[5,2]}; // [galibiyet, beraberlik]
 const HI='background:#7cc4ee;color:#0b1a16';
 const back='<div class="row"><button onclick="retBack()">'+'\u2190'+'</button></div>';
 const CK=['kroki-q','kroki-tour','kroki-jug'],isG=()=>!!(KR.user&&!KR.user.isAnonymous);
 const sc=j=>{try{const q=JSON.parse(j);return (q.lv||1)*1e6+(q.xp||0)+Object.keys(q.ach||{}).length*10}catch(e){return 0}};
 const gl=k=>{try{return localStorage.getItem(k)||''}catch(e){return ''}};
 KR.cloudPush=async()=>{if(!isG()||KR.pulling)return;try{await db.collection('saves').doc(KR.user.uid).set({q:gl('kroki-q'),tour:gl('kroki-tour'),jug:gl('kroki-jug'),t:FV.serverTimestamp()})}catch(e){}};
 let pt=0;KR.cloudQueue=()=>{if(!isG())return;clearTimeout(pt);pt=setTimeout(KR.cloudPush,4000)};
 KR.cloudSync=async(manual)=>{if(!isG())return;KR.pulling=1;let d=null;try{const r=await db.collection('saves').doc(KR.user.uid).get();d=r.exists?r.data():null}catch(e){KR.pulling=0;return}KR.pulling=0;
  const loc=gl('kroki-q');
  if(d&&d.q&&sc(d.q)>=sc(loc)&&d.q!==loc){try{localStorage.setItem('kroki-q',d.q);d.tour?localStorage.setItem('kroki-tour',d.tour):localStorage.removeItem('kroki-tour');if(d.jug&&+d.jug>+gl('kroki-jug'))localStorage.setItem('kroki-jug',d.jug)}catch(e){}
   try{qLoad()}catch(e){}if(typeof state!='undefined'&&state=='menu'){try{menu()}catch(e){}}try{if(typeof toast=='function')toast(T('\u2601\ufe0f Kay\u0131t y\u00fcklendi','\u2601\ufe0f Progress loaded'))}catch(e){}}
  else await KR.cloudPush()};
 setTimeout(()=>{if(typeof qSave=='function'&&!qSave._w){const o=qSave;window.qSave=function(){o.apply(this,arguments);KR.cloudQueue()};window.qSave._w=1}if(typeof tourSave=='function'&&!tourSave._w){const o=tourSave;window.tourSave=function(){o.apply(this,arguments);KR.cloudQueue()};window.tourSave._w=1}},0);
 document.addEventListener('visibilitychange',()=>{if(document.hidden&&isG())KR.cloudPush()});
 async function load(){
  try{const d=await db.collection('users').doc(KR.user.uid).get();KR.profile=d.exists?d.data():null}catch(e){KR.profile=null}
  KR.prizes();const first=!KR.ready;KR.ready=true;if(first&&isG())KR.cloudSync();if(first&&typeof state!='undefined'&&state=='menu')menu();
 }
 auth.onAuthStateChanged(u=>{if(!u){auth.signInAnonymously().catch(()=>{KR.ready=true});return}KR.user=u;load()});
 KR.native=!!(window.Capacitor&&Capacitor.isNativePlatform&&Capacitor.isNativePlatform());
 const faPlugin=()=>{const C=window.Capacitor;if(!C)return null;if(C.Plugins&&C.Plugins.FirebaseAuthentication)return C.Plugins.FirebaseAuthentication;if(typeof C.registerPlugin=='function')return C.registerPlugin('FirebaseAuthentication');return null};
 const afterAuth=async()=>{KR.user=auth.currentUser;KR.profile=null;await load();try{await KR.cloudSync(true)}catch(e){}if(KR.glob){KR.glob=0;if(window.NETUI)NETUI.lobby();else KR.profileUI()}else KR.profileUI()};
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
  let h='<div class="card" style="width:min(560px,96vw)"><h1>\ud83d\udc64 '+T('Profil','Profile')+'</h1>';
  h+='<div class="pav"><div class="pfr">'+(window.mascotHTML?mascotHTML(1):'')+'</div><div class="pnm">';
  h+='<input id="krn" class="pin" maxlength="16" placeholder="'+T('Oyuncu ad\u0131 (3-16)','Player name (3-16)')+'" value="'+(p?esc(p.name):'')+'">';
  const gu=KR.user&&!KR.user.isAnonymous;
  h+='<div id="krm" style="min-height:16px;font-size:12px;opacity:.85"></div><button class="by" onclick="KR.saveName()">'+(p?T('Ad\u0131 de\u011fi\u015ftir','Rename'):T('Profil olu\u015ftur','Create profile'))+'</button></div></div>';
  if(p)h+='<div class="tile4"><div class="tl"><b>'+p.points+'</b><small>'+T('Puan','Points')+'</small></div><div class="tl"><b>'+p.matches+'</b><small>'+T('Ma\u00e7','Matches')+'</small></div><div class="tl"><b>'+p.wins+'/'+p.draws+'/'+p.losses+'</b><small>G/B/M</small></div><div class="tl"><b>'+p.goals+'</b><small>'+T('Gol','Goals')+'</small></div></div>';
  h+='<p style="margin:8px 0 4px;font-size:13px;opacity:.8">'+(gu?'\u2705 Google: '+esc(KR.user.email||''):T('Misafir hesab\u0131 (uygulama silinirse puanlar kaybolur)','Guest account (points are lost if the app is deleted)'))+'</p>';
  h+='<div class="row">'+(gu?'<button onclick="KR.signOut()">'+T('\u00c7\u0131k\u0131\u015f yap','Sign out')+'</button>':'<button class="gbt" onclick="KR.googleLogin()"><b style="color:#4285f4">G</b>  '+T('Google ile giri\u015f yap','Sign in with Google')+'</button>')+'</div>'+back+'</div>';
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
 KR.boardUI=async(tab)=>{
  tab=tab||KR.btab||'w';KR.btab=tab;const wk=WK();
  ov.style.display='flex';ov.innerHTML='<div class="card"><h1>🏆</h1><p>...</p></div>';
  const tg='<div class="row" style="margin:0 0 6px">'+[['w',T('Bu hafta','This week')],['a',T('Tüm zamanlar','All time')]].map(([k,n])=>'<button class="'+(tab==k?'by':'')+'" style="min-height:34px;padding:0 12px;font-size:13px" onclick="SOCW=Date.now()+6000;KR.boardUI(\''+k+'\')">'+n+'</button>').join('')+'</div>';
  try{
   const col=db.collection('users');
   const q=tab=='w'?await col.where('wk','==',wk).orderBy('wp','desc').limit(20).get():await col.orderBy('points','desc').limit(20).get();
   let h='<div class="card" style="width:min(520px,96vw)"><h1>🏆 '+T('Skor tablosu','Leaderboard')+'</h1>'+tg;
   if(tab=='w'){const left=Math.max(1,Math.ceil(((wk+1)*604800000+345600000-3*3600e3-Date.now())/864e5));h+='<div style="font-size:12px;opacity:.85;margin-bottom:4px">'+T('İlk 3\'e: 100 / 60 / 30 🪙 · '+left+' gün kaldı','Top 3 win: 100 / 60 / 30 🪙 · '+left+' day(s) left')+'</div>'}
   h+='<div style="margin:6px 0">';
   const arr=[];q.forEach(d=>{const x=d.data();arr.push({id:d.id,name:x.name,points:tab=='w'?x.wp:x.points})});const i=arr.length;
   try{if(tab=='w'&&KR.user&&arr.some(z=>z.id==KR.user.uid)&&window.QS&&QS.bw!==wk){QS.bw=wk;if(typeof qSave=='function')qSave();if(typeof ev=='function')ev('wkBoard')}}catch(e){}
   if(i)h+=(window.lbRows?lbRows(arr,KR.user&&KR.user.uid):'');
   if(!i)h+='<p style="text-align:center;opacity:.8">'+T('Henüz kimse yok.','Nobody yet.')+'</p>';
   ov.innerHTML=h+'</div>'+back+'</div>';
  }catch(e){ov.innerHTML='<div class="card"><h1>🏆</h1><p>'+T('Tablo yüklenemedi.','Could not load the leaderboard.')+'</p>'+tg+back+'</div>'}
 };
 // gecen haftanin odulunu al (sunucu yazar): gorev listesine "toplanacak odul" olarak eklenir
 KR.prizes=async()=>{
  try{
   if(!KR.user||typeof grant!='function'||!window.QS)return;
   const q=await db.collection('prizes').where('uid','==',KR.user.uid).get();
   for(const d of q.docs){const x=d.data();grant(Math.max(1,Math.min(100,x.gold|0)),'🏆 '+T('Haftalık sıralama #','Weekly rank #')+x.rank);try{if(typeof qSave=='function')qSave()}catch(e){}if(typeof ev=='function')ev('wkTop');await d.ref.delete()}
  }catch(e){}
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
  const wk=WK(),sw=p.wk===wk;const upd={wk:wk,wp:sw?FV.increment(gain):gain,points:FV.increment(gain),wins:FV.increment(w?1:0),draws:FV.increment(dr?1:0),losses:FV.increment(!w&&!dr?1:0),goals:FV.increment(g),matches:FV.increment(1),last:FV.serverTimestamp()};
  db.collection('users').doc(KR.user.uid).update(upd).catch(()=>{});
  p.wp=(sw?(p.wp||0):0)+gain;p.wk=wk;p.points+=gain;p.wins+=w?1:0;p.draws+=dr?1:0;p.losses+=!w&&!dr?1:0;p.goals+=g;p.matches+=1;
  return '<p style="margin:6px 0;font-size:16px;color:#7CFC8A">'+(gain?'+'+gain+' '+T('puan','points'):T('Puan yok','No points'))+' \u00b7 '+T('Toplam','Total')+': <b>'+p.points+'</b></p>';
 };
})();
