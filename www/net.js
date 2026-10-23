// Scribble Kick - oda kodlu cevrimici 1v1 (WebRTC DataChannel + Firestore sinyal)
// Host (mavi) simulasyonu calistirir; misafir (turuncu) girdi yollar ve durumu alir.
(function(){
 if(!window.KR||!KR.db||!window.RTCPeerConnection)return;
 const db=KR.db,FV=KR.FV;
 const T=(tr,en)=>(window.ST&&ST.lang=='en')?en:tr;
 const ACT=['u','d','l','r','k','p','s','w','x','y'];
 const ICE={iceServers:[{urls:['stun:stun.l.google.com:19302','stun:stun1.l.google.com:19302']}].concat(window.KR_ICE||[])};
 const q1=v=>Math.round(v*10)/10,q2=v=>Math.round(v*100)/100;
 const HI='background:#7cc4ee;color:#0b1a16';
 const INP='padding:10px 14px;border-radius:999px;border:1px solid var(--bd);background:#1a2e28;color:#fff;font:700 20px ui-monospace,monospace;text-align:center;width:130px;letter-spacing:.25em;text-transform:uppercase';
 let unsub=null,joinTimer=null;
 const card=(h,body)=>{ov.style.display='flex';ov.innerHTML='<div class="card"><h1>'+h+'</h1>'+body+'</div>'};
 const setMsg=t=>{const e=document.getElementById('nm');if(e)e.textContent=t};
 const send=(ch,o)=>{try{if(ch&&ch.readyState=='open')ch.send(JSON.stringify(o))}catch(e){}};
 const gathered=(pc,ms)=>new Promise(res=>{if(pc.iceGatheringState=='complete')return res();const t=setTimeout(res,ms);pc.addEventListener('icegatheringstatechange',()=>{if(pc.iceGatheringState=='complete'){clearTimeout(t);res()}})});
 function releaseRemote(){if(NET&&NET.rm){ACT.forEach((a,i)=>{if(NET.rm&(1<<i))vk('keyup',K2[a][0])});NET.rm=0}}
 function close(){
  if(unsub){unsub();unsub=null}if(joinTimer){clearTimeout(joinTimer);joinTimer=null}
  const n=NET;if(!n)return;
  releaseRemote();NET=null;NETEV=null;
  try{n.ctl&&n.ctl.close()}catch(e){}try{n.snap&&n.snap.close()}catch(e){}try{n.pc&&n.pc.close()}catch(e){}
  if(n.role=='host'&&n.code)db.collection('rooms').doc(n.code).delete().catch(()=>{});
 }
 function lost(why){
  if(!NET)return;close();menu();
  card('\ud83d\udcf6 '+T('Ba\u011flant\u0131 koptu','Disconnected'),'<p style="opacity:.85">'+(why||'')+'</p><div class="row"><button onclick="menu()">Men\u00fc</button></div>');
 }
 function wire(n){
  const pc=n.pc;
  pc.onconnectionstatechange=()=>{const s=pc.connectionState;if(s=='failed'||s=='closed'){lost()}else if(s=='disconnected'){setTimeout(()=>{if(NET===n&&pc.connectionState=='disconnected')lost()},4000)}};
 }
 function attach(n,ch){
  if(ch.label=='ctl'){n.ctl=ch;ch.onopen=()=>onOpen(n);ch.onclose=()=>{if(NET===n)lost()};ch.onmessage=e=>{try{onCtl(n,JSON.parse(e.data))}catch(x){}};if(ch.readyState=='open')onOpen(n)}
  else if(ch.label=='snap'){n.snap=ch;ch.onmessage=e=>{try{onSnap(n,JSON.parse(e.data))}catch(x){}}}
 }
 function onOpen(n){
  if(NET!==n||n.opened)return;n.opened=true;
  if(joinTimer){clearTimeout(joinTimer);joinTimer=null}
  if(unsub){unsub();unsub=null}
  if(n.role=='host'){db.collection('rooms').doc(n.code).delete().catch(()=>{});card('\ud83c\udf10 '+T('Rakip ba\u011fland\u0131!','Opponent connected!'),'<p style="opacity:.85">'+T('Sen mavi, rakibin turuncu oynar.','You play blue, your opponent plays orange.')+'</p><div class="row"><button style="'+HI+'" onclick="NETUI.start()">'+T('Ma\u00e7\u0131 ba\u015flat','Start match')+'</button></div><div class="row"><button onclick="menu()">\u2190</button></div>')}
  else{card('\ud83c\udf10 '+T('Ba\u011fland\u0131!','Connected!'),'<p style="opacity:.85">'+T('Host ma\u00e7\u0131 ba\u015flat\u0131nca ba\u015flar. Sen turuncu oynars\u0131n.','The match starts when the host starts it. You play orange.')+'</p><div class="row"><button onclick="menu()">\u2190</button></div>')}
 }
 // ---------- host ----------
 function snapshot(){
  const S={t:performance.now(),sc:score,tm:q1(time),h:half,ex:q1(ext),fz:q1(froze),m:msg,m2:msg2,m2t:q1(msg2t),sh:shake>0?q2(shake):0,a:act,
   p:P.map(p=>[q1(p.x),q1(p.y),q1(p.vx),q1(p.vy),q2(p.fx),q2(p.fy),q2(p.stun||0),q2(p.off||0),q2(p.ch||0),q2(p.ax||0),q2(p.ay||0),p.sp===undefined?1:q2(p.sp),p.mk||null,q2(p.mkt||0),q2(p.bleed||0)]),
   b:ball?[q1(ball.x),q1(ball.y),q1(ball.vx),q1(ball.vy),q1(ball.h||0),q2(ball.sq||0),ball.fire?1:0,ball.hide>0?1:0,ball.jet?1:0]:null,
   fa:fa.map(f=>{const o={};for(const k in f){if(k=='a'||k=='v')o[k]=P.indexOf(f[k]);else o[k]=f[k]}return o}),
   bars:bars.map(b=>({...b})),
   rk:rk?(()=>{const o={};for(const k in rk)if(k!='sm')o[k]=rk[k];return o})():null,
   hd:hold?hold.t:-1,
   nf:netFx.map(f=>f&&clock-f.t<4?{ag:q2(clock-f.t),y:q1(f.y),a:q2(f.a)}:null),
   gc:gcam?[q1(gcam.x),q1(gcam.y)]:null};
  return JSON.stringify(S);
 }
 function hostTick(dt){
  const n=NET;if(!n||!n.opened)return;
  if(state=='end'){if(!n.sentEnd){n.sentEnd=true;send(n.ctl,{k:'end',sc:score})}return}
  if(state!='play')return;
  if(NETEV&&NETEV.length)send(n.ctl,{k:'ev',e:NETEV.splice(0)});
  n.acc=(n.acc||0)+dt;
  if(n.acc>=.05){n.acc=0;try{const s=snapshot(),ch=(n.snap&&n.snap.readyState=='open')?n.snap:n.ctl;if(ch&&ch.readyState=='open')ch.send(s)}catch(e){}}
 }
 function startHost(){
  const n=NET;if(!n||!n.opened)return;
  n.sentEnd=false;n.acc=0;n.rm=0;NETEV=[];
  go(2);pz.style.display='none';
  send(n.ctl,{k:'start',HL});
 }
 function applyInput(n,m){
  const old=n.rm||0;if(m===old)return;
  ACT.forEach((a,i)=>{const b=1<<i,was=old&b,now=m&b;if(now&&!was)vk('keydown',K2[a][0]);else if(!now&&was)vk('keyup',K2[a][0])});
  n.rm=m;
 }
 // ---------- guest ----------
 function startGuest(n,msgd){
  HL=msgd.HL||120;mode=2;ctl=[null,{w:[],k:[],p:[],s:[],x:[],y:[],u:[],d:[],l:[],r:[]}];
  score=[0,0];time=0;ext=0;half=0;msg='';msg2='';msg2t=0;froze=0;shake=0;act=[4,4];
  mk();ball={x:W/2,y:GY,vx:0,vy:0,h:0,sq:0,M:[1,0,0,0,1,0,0,0,1]};
  bars=[];fa=[];rk=null;fxs=[];trail=[];bh=[];netFx=[null,null];gcam=null;hold=null;pk=null;fk=null;restart=null;ko=null;psw=null;
  cam.x=W/2;cam.y=GY;cam.tx=cam.ty=undefined;
  n.buf=[];n.off=null;n.lm=-1;n.lt=0;n.act=null;
  state='play';ov.style.display='none';pz.style.display='none';musicSet('match');
 }
 function onCtl(n,m){
  if(m.k=='in'&&n.role=='host'){applyInput(n,m.m|0)}
  else if(m.k=='start'&&n.role=='guest'){startGuest(n,m)}
  else if(m.k=='ev'&&n.role=='guest'){m.e.forEach(x=>sfxPlay(x))}
  else if(m.k=='end'&&n.role=='guest'){guestEnd(m.sc)}
 }
 function onSnap(n,S){
  if(n.role!='guest'||state!='play')return;
  const now=performance.now(),o=now-S.t;
  if(n.off==null||o<n.off)n.off=o;else n.off+=(o-n.off)*.02;
  n.buf.push(S);if(n.buf.length>30)n.buf.shift();
  // kesikli alanlar hemen
  score=S.sc;time=S.tm;half=S.h;ext=S.ex;froze=S.fz;msg=S.m;msg2=S.m2;msg2t=S.m2t;if(S.sh>shake)shake=S.sh;act=S.a;
  S.p.forEach((a,i)=>{const p=P[i];if(!p)return;p.vx=a[2];p.vy=a[3];p.fx=a[4];p.fy=a[5];p.stun=a[6];p.off=a[7];p.ch=a[8];p.ax=a[9];p.ay=a[10];p.sp=a[11];p.mk=a[12];p.mkt=a[13];p.bleed=a[14]});
  if(S.b&&ball){ball.vx=S.b[2];ball.vy=S.b[3];ball.sq=S.b[5];ball.fire=!!S.b[6];ball.hide=S.b[7]?1:0;ball.jet=!!S.b[8]}
  fa=S.fa.map(f=>({...f,a:P[f.a],v:P[f.v]})).filter(f=>f.a&&f.v);
  bars=S.bars;
  if(S.rk){if(!rk||rk.kind!=S.rk.kind||rk.t>S.rk.t+1){rk={...S.rk,sm:[]}}else{rk.t+=(S.rk.t-rk.t)*.25;rk.tm=S.rk.tm}}else if(rk&&rk.t>.3){rk=null}
  hold=S.hd>=0?{t:S.hd}:null;
  for(let i=0;i<2;i++){const f=S.nf[i];if(f){if(!netFx[i]||clock-netFx[i].t>f.ag+.3)netFx[i]={t:clock-f.ag,y:f.y,a:f.a}}else if(netFx[i]&&clock-netFx[i].t>4)netFx[i]=null}
  gcam=S.gc?{x:S.gc[0],y:S.gc[1]}:null;
 }
 function guestEnd(sc){
  state='end';const a=sc[0],b=sc[1];
  card(b>a?T('KAZANDIN!','YOU WIN!'):a>b?T('KAYBETT\u0130N','YOU LOST'):T('BERABERE','DRAW'),'<p style="font-size:22px">'+a+' \u2014 '+b+'</p><p style="opacity:.8;font-size:14px">'+T('Host yeni ma\u00e7 ba\u015flatabilir.','The host can start a rematch.')+'</p><div class="row"><button onclick="menu()">Men\u00fc</button></div>');
 }
 function guestStep(dt){
  const n=NET;if(!n||!n.buf||!n.buf.length)return;
  const rt=performance.now()-n.off-100,B=n.buf;
  while(B.length>2&&B[1].t<=rt)B.shift();
  const a=B[0],b=B[1]||B[0],f=b.t>a.t?Math.max(0,Math.min(1,(rt-a.t)/(b.t-a.t))):1;
  P.forEach((p,i)=>{const u=a.p[i],v=b.p[i];if(!u)return;p.x=u[0]+(v[0]-u[0])*f;p.y=u[1]+(v[1]-u[1])*f});
  if(a.b&&b.b&&ball){ball.x=a.b[0]+(b.b[0]-a.b[0])*f;ball.y=a.b[1]+(b.b[1]-a.b[1])*f;ball.h=a.b[4]+(b.b[4]-a.b[4])*f;rollBall(dt)}
  if(shake>0)shake-=dt;
  if(rk)rkUpdate(dt);
  bars.forEach(x=>{x.a+=dt/GS});
  fa.forEach(x=>{x.t+=dt/GS});
  if(msg2t>0)msg2t-=dt/GS;
  let m=0;ACT.forEach((k,i)=>{if(K1[k].some(c=>keys.has(c)))m|=1<<i});
  const now=performance.now();if(m!==n.lm||now-n.lt>100){n.lm=m;n.lt=now;send(n.ctl,{k:'in',m})}
 }
 // ---------- UI ----------
 const code5=()=>{const a='ABCDEFGHJKMNPQRSTUVWXYZ23456789';let s='';for(let i=0;i<5;i++)s+=a[Math.floor(Math.random()*a.length)];return s};
 window.NETUI={
  lobby(){
   if(!KR.user){card('\ud83c\udf10 Online','<p>'+T('Ba\u011flant\u0131 kurulamad\u0131. \u0130nterneti kontrol et.','Could not connect. Check your internet.')+'</p><div class="row"><button onclick="menu()">\u2190</button></div>');return}
   card('\ud83c\udf10 Online','<p style="opacity:.85;margin:4px 0 10px">'+T('Arkada\u015f\u0131nla oda koduyla oyna. Oday\u0131 kuran mavi, kat\u0131lan turuncu oynar.','Play a friend with a room code. The room creator plays blue, the joiner orange.')+'</p><div class="row"><button style="'+HI+'" onclick="NETUI.host()">'+T('Oda kur','Create room')+'</button></div><div class="row"><input id="njc" maxlength="5" placeholder="KOD" style="'+INP+'"><button onclick="NETUI.join()">'+T('Kat\u0131l','Join')+'</button></div><div id="nm" style="min-height:20px;font-size:13px;opacity:.9"></div><div class="row"><button onclick="menu()">\u2190</button></div>');
  },
  async host(){
   close();
   const n=NET={role:'host',pc:new RTCPeerConnection(ICE)};wire(n);
   try{
    attach(n,n.pc.createDataChannel('ctl'));attach(n,n.pc.createDataChannel('snap',{ordered:false,maxRetransmits:0}));
    await n.pc.setLocalDescription(await n.pc.createOffer());await gathered(n.pc,3500);
    let ok=false,code;
    for(let i=0;i<4&&!ok;i++){code=code5();try{await db.collection('rooms').doc(code).set({host:KR.user.uid,guest:null,offer:{type:n.pc.localDescription.type,sdp:n.pc.localDescription.sdp},answer:null,created:FV.serverTimestamp()});ok=true}catch(e){if(i==3)throw e}}
    n.code=code;
    card('\ud83c\udf10 '+T('Oda kuruldu','Room created'),'<div style="font:800 44px ui-monospace,monospace;letter-spacing:.2em;margin:10px 0 4px;color:#7cc4ee">'+code+'</div><p style="opacity:.85;margin:4px 0 10px">'+T('Bu kodu arkada\u015f\u0131na s\u00f6yle. Rakip bekleniyor...','Share this code. Waiting for your opponent...')+'</p><div class="row"><button onclick="menu()">'+T('\u0130ptal','Cancel')+'</button></div>');
    unsub=db.collection('rooms').doc(code).onSnapshot(async d=>{const x=d.data();if(x&&x.answer&&NET===n&&!n.pc.remoteDescription){try{await n.pc.setRemoteDescription(x.answer)}catch(e){}}});
   }catch(e){close();NETUI.lobby();setMsg(T('Oda kurulamad\u0131. Tekrar dene.','Could not create the room. Try again.'))}
  },
  async join(){
   const el=document.getElementById('njc'),code=((el&&el.value)||'').trim().toUpperCase();
   if(code.length!=5){setMsg(T('5 haneli kodu yaz.','Enter the 5-character code.'));return}
   close();setMsg(T('Odaya ba\u011flan\u0131l\u0131yor...','Connecting...'));
   try{
    const ref=db.collection('rooms').doc(code),d=await ref.get();
    if(!d.exists){setMsg(T('Oda bulunamad\u0131.','Room not found.'));return}
    const x=d.data();
    if(x.guest){setMsg(T('Oda dolu.','Room is full.'));return}
    const n=NET={role:'guest',pc:new RTCPeerConnection(ICE),code};wire(n);
    n.pc.ondatachannel=e=>attach(n,e.channel);
    await n.pc.setRemoteDescription(x.offer);
    await n.pc.setLocalDescription(await n.pc.createAnswer());await gathered(n.pc,3500);
    await ref.update({guest:KR.user.uid,answer:{type:n.pc.localDescription.type,sdp:n.pc.localDescription.sdp}});
    joinTimer=setTimeout(()=>{if(NET===n&&!n.opened){close();NETUI.lobby();setMsg(T('Ba\u011flan\u0131lamad\u0131. A\u011f engelliyor olabilir (mobil veri).','Could not connect. Your network may be blocking it (mobile data).'))}},20000);
   }catch(e){close();NETUI.lobby();setMsg(T('Kat\u0131l\u0131namad\u0131. Kodu ve interneti kontrol et.','Could not join. Check the code and your connection.'))}
  },
  start(){startHost()},
  again(){startHost()}
 };
 // oyun kancalari
 const m0=menu;menu=function(){if(NET)close();NETEV=null;m0()};
 window.NETHOOK={hostTick,guestStep,endRow:()=>'<div class="row"><button onclick="NETUI.again()">'+T('Tekrar oyna','Play again')+'</button><button onclick="menu()">Men\u00fc</button></div>'};
})();
