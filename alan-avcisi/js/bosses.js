'use strict';
/* Boss tanımları ve çizimleri */
function eyes(x,y,r,e,col,spread,size){
  const lx=player.x+.5-e.x,ly=player.y+.5-e.y,ll=Math.hypot(lx,ly)||1;
  for(const s of[-1,1]){
    const ex=x+s*r*spread,ey=y-r*.12;
    ctx.fillStyle='#fff';ctx.beginPath();ctx.arc(ex,ey,r*size,0,7);ctx.fill();
    ctx.fillStyle=col;ctx.beginPath();ctx.arc(ex+lx/ll*r*size*.4,ey+ly/ll*r*size*.4,r*size*.5,0,7);ctx.fill();
  }
}
function drawLegacy(e,cs,t,frz){
  let x=e.x*cs,y=e.y*cs;const r=e.r*cs,k=e.kind;
  if(e.state==='warn'){x+=(R()-.5)*cs*1.2;y+=(R()-.5)*cs*1.2}
  const hurt=e.hurt>0&&Math.floor(t/60)%2;
  ctx.save();
  if(k==='goz'){
    ctx.shadowColor=frz?'#5af0ff':'#ff5fa2';ctx.shadowBlur=cs*3;
    const g=ctx.createRadialGradient(x-r*.3,y-r*.3,0,x,y,r);
    g.addColorStop(0,'#ffffff');g.addColorStop(.75,'#ffe4ec');g.addColorStop(1,frz?'#7dd3fc':'#ff7aa8');
    ctx.fillStyle=g;ctx.beginPath();ctx.arc(x,y,r,0,7);ctx.fill();ctx.shadowBlur=0;
    // damarlar
    ctx.strokeStyle='rgba(220,40,80,.55)';ctx.lineWidth=Math.max(1,cs*.25);
    for(let i=0;i<7;i++){const a=i/7*6.28+e.ang*.3;ctx.beginPath();ctx.moveTo(x+Math.cos(a)*r*.95,y+Math.sin(a)*r*.95);
      ctx.quadraticCurveTo(x+Math.cos(a+.3)*r*.75,y+Math.sin(a+.3)*r*.75,x+Math.cos(a)*r*.6,y+Math.sin(a)*r*.6);ctx.stroke()}
    const lx=player.x+.5-e.x,ly=player.y+.5-e.y,ll=Math.hypot(lx,ly)||1;
    const ix=x+lx/ll*r*.35,iy=y+ly/ll*r*.35;
    if(e.blink){ctx.fillStyle='#ff7aa8';ctx.beginPath();ctx.ellipse(x,y,r,r*.25,0,0,7);ctx.fill()}
    else{
      const ig=ctx.createRadialGradient(ix,iy,0,ix,iy,r*.5);ig.addColorStop(0,'#fde047');ig.addColorStop(.5,frz?'#38bdf8':'#a855f7');ig.addColorStop(1,frz?'#0c4a6e':'#3b0764');
      ctx.fillStyle=ig;ctx.beginPath();ctx.arc(ix,iy,r*.48,0,7);ctx.fill();
      ctx.fillStyle='#000';ctx.beginPath();ctx.arc(ix,iy,r*.2,0,7);ctx.fill();
      ctx.fillStyle='#fff';ctx.beginPath();ctx.arc(ix-r*.12,iy-r*.12,r*.08,0,7);ctx.fill();
    }
  }else if(k==='golem'){
    const dash=e.state==='dash';
    ctx.translate(x,y);ctx.rotate(e.ang*.5);
    ctx.shadowColor=dash?'#f43f5e':(frz?'#5af0ff':'#94a3b8');ctx.shadowBlur=cs*(dash?5:2.5);
    ctx.beginPath();for(let i=0;i<6;i++){const a=i/6*6.28;ctx.lineTo(Math.cos(a)*r*1.05,Math.sin(a)*r*1.05)}ctx.closePath();
    const g=ctx.createLinearGradient(-r,-r,r,r);g.addColorStop(0,frz?'#e0f2fe':'#cbd5e1');g.addColorStop(1,frz?'#0369a1':'#334155');
    ctx.fillStyle=hurt?'#fff':g;ctx.fill();ctx.shadowBlur=0;
    ctx.strokeStyle='#0f172a';ctx.lineWidth=Math.max(1,cs*.3);
    ctx.beginPath();ctx.moveTo(-r*.6,-r*.2);ctx.lineTo(-r*.1,r*.1);ctx.lineTo(r*.2,-r*.5);ctx.moveTo(r*.1,r*.6);ctx.lineTo(r*.4,r*.2);ctx.stroke();
    // çekirdek
    const n=Math.max(1,(boss.cores||[]).length);
    ctx.fillStyle=dash?'#f43f5e':'#5af0ff';ctx.globalAlpha=.4+.2*n;
    ctx.beginPath();ctx.arc(0,0,r*.28,0,7);ctx.fill();ctx.globalAlpha=1;
    ctx.setTransform(1,0,0,1,0,0);
    eyes(x,y,r,e,dash?'#f43f5e':'#0ea5e9',.4,.16);
  }else if(k==='yilan'){
    const a=Math.atan2(e.vy,e.vx);
    ctx.translate(x,y);ctx.rotate(a);
    ctx.shadowColor=frz?'#5af0ff':'#a3e635';ctx.shadowBlur=cs*3;
    ctx.fillStyle=frz?'#7dd3fc':'#bef264';ctx.beginPath();ctx.ellipse(0,0,r*1.25,r,0,0,7);ctx.fill();ctx.shadowBlur=0;
    ctx.fillStyle='#fff';for(const s of[-1,1]){ctx.beginPath();ctx.arc(r*.4,s*r*.45,r*.3,0,7);ctx.fill()}
    ctx.fillStyle='#14532d';for(const s of[-1,1]){ctx.beginPath();ctx.ellipse(r*.5,s*r*.45,r*.08,r*.22,0,0,7);ctx.fill()}
    if(Math.sin(t/120)>0){ctx.strokeStyle='#f43f5e';ctx.lineWidth=Math.max(1,cs*.3);ctx.beginPath();ctx.moveTo(r*1.2,0);ctx.lineTo(r*1.8,0);ctx.lineTo(r*2.1,-r*.25);ctx.moveTo(r*1.8,0);ctx.lineTo(r*2.1,r*.25);ctx.stroke()}
  }else if(k==='kovan'){
    const pulse=1+.05*Math.sin(t/180);
    ctx.translate(x,y);ctx.scale(pulse,pulse);
    ctx.shadowColor=frz?'#5af0ff':'#f59e0b';ctx.shadowBlur=cs*3;
    ctx.fillStyle=hurt?'#fff':(frz?'#7dd3fc':'#f59e0b');
    ctx.beginPath();for(let i=0;i<6;i++){const a=i/6*6.28+Math.PI/6;ctx.lineTo(Math.cos(a)*r*1.1,Math.sin(a)*r*1.1)}ctx.closePath();ctx.fill();ctx.shadowBlur=0;
    ctx.strokeStyle='#92400e';ctx.lineWidth=Math.max(1,cs*.25);
    const hs=r*.32;
    for(const[cx,cy]of[[0,0],[hs*1.75,0],[-hs*1.75,0],[hs*.87,hs*1.5],[-hs*.87,hs*1.5],[hs*.87,-hs*1.5],[-hs*.87,-hs*1.5]]){
      ctx.beginPath();for(let i=0;i<6;i++){const a=i/6*6.28+Math.PI/6;ctx.lineTo(cx+Math.cos(a)*hs,cy+Math.sin(a)*hs)}ctx.closePath();ctx.stroke()}
    ctx.fillStyle='#451a03';ctx.beginPath();ctx.arc(0,r*.15,r*.22,0,7);ctx.fill();
    ctx.setTransform(1,0,0,1,0,0);
    eyes(x,y-r*.25,r,e,'#451a03',.3,.15);
  }else if(k==='ikizA'||k==='ikizB'){
    const c=k==='ikizA'?['#e0faff','#22d3ee','#0e7490']:['#fdf4ff','#e879f9','#86198f'];
    ctx.shadowColor=frz?'#5af0ff':c[1];ctx.shadowBlur=cs*4;
    const g=ctx.createRadialGradient(x,y,0,x,y,r);g.addColorStop(0,c[0]);g.addColorStop(.6,c[1]);g.addColorStop(1,c[2]);
    ctx.fillStyle=g;ctx.beginPath();
    for(let i=0;i<24;i++){const a=i/24*6.28,w=r*(1+.12*Math.sin(a*5+t/120));ctx.lineTo(x+Math.cos(a)*w,y+Math.sin(a)*w)}
    ctx.closePath();ctx.fill();ctx.shadowBlur=0;
    eyes(x,y,r,e,'#0b1026',.3,.2);
  }else if(k==='balcik'){
    const wob=t/180+e.x;
    ctx.shadowColor=frz?'#5af0ff':'#4ade80';ctx.shadowBlur=cs*3;
    const g=ctx.createRadialGradient(x-r*.3,y-r*.4,0,x,y,r*1.2);g.addColorStop(0,'#dcfce7');g.addColorStop(.5,frz?'#7dd3fc':'#4ade80');g.addColorStop(1,frz?'#0369a1':'#15803d');
    ctx.fillStyle=hurt?'#fff':g;ctx.globalAlpha=.92;ctx.beginPath();
    for(let i=0;i<28;i++){const a=i/28*6.283,w2=r*(1+.1*Math.sin(a*3+wob)+.06*Math.sin(a*5-wob*1.3));ctx.lineTo(x+Math.cos(a)*w2,y+Math.sin(a)*w2*.9)}
    ctx.closePath();ctx.fill();ctx.globalAlpha=1;ctx.shadowBlur=0;
    ctx.fillStyle='rgba(255,255,255,.5)';ctx.beginPath();ctx.ellipse(x-r*.35,y-r*.45,r*.2,r*.12,-.5,0,7);ctx.fill();
    eyes(x,y,r,e,'#052e16',.3,.2);
    if(e.gen<2){ctx.fillStyle='#fde047';ctx.beginPath();const cy=y-r*1.05;ctx.moveTo(x-r*.4,cy);ctx.lineTo(x-r*.4,cy-r*.35);ctx.lineTo(x-r*.2,cy-r*.15);ctx.lineTo(x,cy-r*.4);ctx.lineTo(x+r*.2,cy-r*.15);ctx.lineTo(x+r*.4,cy-r*.35);ctx.lineTo(x+r*.4,cy);ctx.closePath();ctx.fill()}
  }else if(k==='zirh'){
    const a=Math.atan2(e.vy,e.vx),op=e.open?1:0;
    ctx.translate(x,y);ctx.rotate(a+Math.PI/2);
    ctx.shadowColor=e.open?'#f43f5e':(frz?'#5af0ff':'#64748b');ctx.shadowBlur=cs*(e.open?5:2);
    // bacaklar
    ctx.strokeStyle='#1e293b';ctx.lineWidth=Math.max(1,cs*.4);
    for(let i=-1;i<=1;i++)for(const sd of[-1,1]){const lg=Math.sin(t/60+i)*r*.15;ctx.beginPath();ctx.moveTo(sd*r*.5,i*r*.4);ctx.lineTo(sd*r*1.15,i*r*.5+lg);ctx.stroke()}
    // gövde (kırmızı çekirdek)
    ctx.fillStyle=hurt?'#fff':'#f43f5e';ctx.beginPath();ctx.ellipse(0,0,r*.62,r*.95,0,0,7);ctx.fill();ctx.shadowBlur=0;
    // kabuk yarıları
    const sh=frz?'#7dd3fc':'#475569',sh2=frz?'#0369a1':'#1e293b';
    for(const sd of[-1,1]){ctx.save();ctx.translate(0,-r*.6);ctx.rotate(sd*op*.9);
      const g=ctx.createLinearGradient(0,0,sd*r,r);g.addColorStop(0,sh);g.addColorStop(1,sh2);ctx.fillStyle=g;
      ctx.beginPath();ctx.moveTo(0,0);ctx.quadraticCurveTo(sd*r*.95,r*.2,sd*r*.15,r*1.6);ctx.lineTo(0,r*1.55);ctx.closePath();ctx.fill();
      ctx.strokeStyle='#94a3b8';ctx.lineWidth=Math.max(1,cs*.2);ctx.stroke();ctx.restore()}
    // kafa
    ctx.fillStyle='#0f172a';ctx.beginPath();ctx.ellipse(0,-r*.95,r*.42,r*.3,0,0,7);ctx.fill();
    ctx.fillStyle=e.open?'#f43f5e':'#fde047';for(const sd of[-1,1]){ctx.beginPath();ctx.arc(sd*r*.2,-r*1.02,r*.09,0,7);ctx.fill()}
  }else if(k==='isin'){
    ctx.translate(x,y);
    ctx.shadowColor=frz?'#5af0ff':'#a855f7';ctx.shadowBlur=cs*4;
    const g=ctx.createRadialGradient(0,0,0,0,0,r);g.addColorStop(0,'#fff');g.addColorStop(.4,frz?'#7dd3fc':'#c084fc');g.addColorStop(1,frz?'#0369a1':'#4c1d95');
    ctx.fillStyle=hurt?'#fff':g;ctx.beginPath();ctx.arc(0,0,r,0,7);ctx.fill();ctx.shadowBlur=0;
    ctx.strokeStyle='rgba(255,255,255,.7)';ctx.lineWidth=Math.max(1,cs*.3);
    for(let k2=0;k2<3;k2++){ctx.rotate(t/250+k2*2.09);ctx.beginPath();ctx.ellipse(0,0,r*1.35,r*.45,0,0,7);ctx.stroke()}
    ctx.setTransform(1,0,0,1,0,0);
    eyes(x,y,r,e,'#2e1065',.3,.17);
  }else if(k==='bomba'){
    ctx.shadowColor=frz?'#5af0ff':'#fb923c';ctx.shadowBlur=cs*3;
    const g=ctx.createRadialGradient(x-r*.35,y-r*.35,0,x,y,r);g.addColorStop(0,'#78716c');g.addColorStop(1,'#1c1917');
    ctx.fillStyle=hurt?'#fff':g;ctx.beginPath();ctx.arc(x,y,r,0,7);ctx.fill();ctx.shadowBlur=0;
    ctx.fillStyle='#44403c';ctx.fillRect(x-r*.3,y-r*1.3,r*.6,r*.4);
    ctx.strokeStyle='#a16207';ctx.lineWidth=Math.max(1,cs*.4);ctx.beginPath();ctx.moveTo(x,y-r*1.3);ctx.quadraticCurveTo(x+r*.5,y-r*1.8,x+r*.7,y-r*1.6);ctx.stroke();
    ctx.fillStyle='#fde047';ctx.beginPath();ctx.arc(x+r*.75,y-r*1.6,cs*(.5+.3*Math.sin(t/35)),0,7);ctx.fill();
    // maske gözleri
    ctx.fillStyle='#fb923c';ctx.fillRect(x-r*.7,y-r*.3,r*1.4,r*.4);
    ctx.fillStyle='#000';for(const sd of[-1,1]){ctx.beginPath();ctx.arc(x+sd*r*.32,y-r*.1,r*.12,0,7);ctx.fill()}
    ctx.strokeStyle='#000';ctx.lineWidth=Math.max(1,cs*.3);ctx.beginPath();ctx.arc(x,y+r*.35,r*.3,.2,Math.PI-.2);ctx.stroke();
  }else if(k==='kartopu'){
    ctx.shadowColor=frz?'#5af0ff':'#e0f2fe';ctx.shadowBlur=cs*3;
    const g=ctx.createRadialGradient(x-r*.35,y-r*.35,0,x,y,r);g.addColorStop(0,'#ffffff');g.addColorStop(.7,'#e2e8f0');g.addColorStop(1,frz?'#38bdf8':'#94a3b8');
    ctx.fillStyle=g;ctx.beginPath();ctx.arc(x,y,r,0,7);ctx.fill();ctx.shadowBlur=0;
    ctx.save();ctx.translate(x,y);ctx.rotate(e.ang*.6);ctx.fillStyle='rgba(148,163,184,.45)';
    for(let i=0;i<9;i++){const a=i*2.4,d=r*(.3+(i%3)*.22);ctx.beginPath();ctx.arc(Math.cos(a)*d,Math.sin(a)*d,r*.09,0,7);ctx.fill()}ctx.restore();
    eyes(x,y,r,e,'#0f172a',.28,.14);
    ctx.fillStyle='#f97316';ctx.beginPath();ctx.moveTo(x-r*.06,y+r*.05);ctx.lineTo(x+r*.38,y+r*.15);ctx.lineTo(x-r*.06,y+r*.25);ctx.closePath();ctx.fill();
    // sıkışma uyarısı
    if(boss&&boss.region&&k==='kartopu'){const need=KARTOPU_K*Math.PI*e.r*e.r,f=need/boss.region;if(f>.6){ctx.strokeStyle=`rgba(244,63,94,${(f-.6)*2.2})`;ctx.lineWidth=Math.max(1,cs*.5);ctx.beginPath();ctx.arc(x,y,r*1.2,0,7);ctx.stroke()}}
  }else if(k==='ayna'){
    ctx.translate(x,y);ctx.rotate(Math.PI/4+Math.sin(t/300)*.2);
    ctx.shadowColor=frz?'#5af0ff':'#a78bfa';ctx.shadowBlur=cs*5;
    const s2=r*1.5;ctx.fillStyle=hurt?'#fff':'#0b0820';ctx.fillRect(-s2/2,-s2/2,s2,s2);
    ctx.strokeStyle='#a78bfa';ctx.lineWidth=Math.max(1,cs*.4);ctx.strokeRect(-s2/2,-s2/2,s2,s2);
    ctx.shadowBlur=0;ctx.fillStyle='#a78bfa';ctx.fillRect(-s2/4,-s2/4,s2/2,s2/2);
    ctx.setTransform(1,0,0,1,0,0);
    for(const sd of[-1,1]){ctx.fillStyle='#f5f3ff';ctx.beginPath();ctx.arc(x+sd*r*.3,y-r*.05,r*.13,0,7);ctx.fill()}
  }else if(k==='ejder'){
    ctx.translate(x,y);ctx.rotate(e.ang);
    ctx.shadowColor=frz?'#5af0ff':'#ff6a00';ctx.shadowBlur=cs*4;
    ctx.beginPath();
    for(let i=0;i<16;i++){const a=i/16*6.28,rad=i%2?r*.7:r*1.15;ctx.lineTo(Math.cos(a)*rad,Math.sin(a)*rad)}
    ctx.closePath();
    const g=ctx.createRadialGradient(0,0,0,0,0,r);g.addColorStop(0,frz?'#e0faff':'#fff1b8');g.addColorStop(.5,frz?'#38bdf8':'#ff6a00');g.addColorStop(1,frz?'#0e7490':'#7f1d1d');
    ctx.fillStyle=hurt?'#fff':g;ctx.fill();ctx.shadowBlur=0;
    ctx.setTransform(1,0,0,1,0,0);
    // boynuzlar
    ctx.fillStyle='#fde68a';
    for(const s of[-1,1]){ctx.beginPath();ctx.moveTo(x+s*r*.35,y-r*.55);ctx.lineTo(x+s*r*.75,y-r*1.35);ctx.lineTo(x+s*r*.6,y-r*.45);ctx.closePath();ctx.fill()}
    eyes(x,y,r,e,'#7f1d1d',.3,.17);
    ctx.fillStyle=e.mouth?'#fff7d6':'#3f0d0d';ctx.beginPath();ctx.ellipse(x,y+r*.35,r*.3,e.mouth?r*.2:r*.07,0,0,7);ctx.fill();
  }
  ctx.restore();
}
function drawBee(e,cs,t,frz){
  const x=e.x*cs,y=e.y*cs,r=e.r*cs*1.1,a=Math.atan2(e.vy,e.vx);
  ctx.save();ctx.translate(x,y);ctx.rotate(a);
  ctx.fillStyle='rgba(255,255,255,.6)';const fl=Math.sin(t/25)*.4;
  ctx.beginPath();ctx.ellipse(-r*.1,-r*.8,r*.5,r*(.35+fl*.2),.4,0,7);ctx.fill();
  ctx.beginPath();ctx.ellipse(-r*.1,r*.8,r*.5,r*(.35+fl*.2),-.4,0,7);ctx.fill();
  ctx.fillStyle=frz?'#7dd3fc':'#facc15';ctx.beginPath();ctx.ellipse(0,0,r*1.15,r*.8,0,0,7);ctx.fill();
  ctx.fillStyle='#1c1917';ctx.fillRect(-r*.35,-r*.8,r*.3,r*1.6);ctx.fillRect(r*.2,-r*.75,r*.25,r*1.5);
  ctx.restore();
}

/* ---------- ortak çizim yardımcıları ---------- */
const hurtOn=(e,tm)=>e.hurt>0&&Math.floor(tm/60)%2;
function zzz(e){if(R()<.02)popText('z',e.x+e.r*.6,e.y-e.r,'#c4b5fd',.9)}
function drawRope(ax,ay,bx,by,cs){
  ctx.strokeStyle='rgba(255,255,255,.75)';ctx.lineWidth=Math.max(1,cs*.25);
  ctx.beginPath();ctx.moveTo(ax*cs,ay*cs);
  const mx=(ax+bx)/2,my=(ay+by)/2+Math.hypot(bx-ax,by-ay)*.06;
  ctx.quadraticCurveTo(mx*cs,my*cs,bx*cs,by*cs);ctx.stroke();
  ctx.fillStyle='#e5e7eb';ctx.beginPath();ctx.arc(ax*cs,ay*cs,cs*.9,0,7);ctx.fill();
}
const GOZ_R=12,GOZ_T=.45,SNAKE_MIN=6,SNAKE_LEN=28,KARTOPU_K=20;
const ORB_COL=['#ef4444','#22c55e','#3b82f6'],ORB_KEY=['red','green','blue'];
const LIGHT_R=8;

/* =========================================================
   BOSS TANIMLARI
   Kancalar: setup, ai(dt), move(e,dt), afterMove(dt), always(dt),
   hazards(), preCapture(cx), postCapture(cx), seeds(), onPurge(),
   drawUnder/drawOver(cs,tm,frz), draw(e,cs,tm,frz), bar(), hint()
   GİZLİ YOLLAR (oyunda yazmaz): goz, golem, kovan, ikiz, ejder,
   bomba, ayna, bukalemun, hortum, dev
   ========================================================= */
const BOSSES=[
/* 1 */ {id:'goz',icon:'👁',
  setup(bs){const e=spawnBoss(W/2,H*.42,3.4,bs,'goz');e.sleepT=16+R()*6;e.sleep=0;boss.crush=1},
  ai(dt){
    const e=bossEnt();if(!e)return;
    if(e.sleep>0){ // GİZLİ: uyuklarken yakınında kapan kapatırsan anında ölür
      e.sleep-=dt;e.vx*=.92;e.vy*=.92;zzz(e);
      e.lid=Math.min(1,(5.5-e.sleep)/.35,e.sleep/.35);
      if(e.sleep<=0){e.sleepT=15+R()*8;aimAt(e,player.x+.5,player.y+.5,e.base);rot(e,0)}
      return;
    }
    e.sleepT-=dt;if(e.sleepT<=0){e.sleep=5.5;return}
    boss.timer-=dt;
    if(boss.timer<=0){boss.timer=2+R()*1.5;aimAt(e,player.x+.5+(R()-.5)*20,player.y+.5+(R()-.5)*20,e.base);rot(e,0)}
    {const tb=clock%3.6;e.lid=tb<.24?Math.sin(tb/.24*Math.PI):0}
  },
  always(){const e=bossEnt();if(e)boss.crush=freeRatio(e,GOZ_R)},
  preCapture(cx){const e=bossEnt();if(e&&e.sleep>0&&cx.trailDist(e)<e.r+12)cx.secret=true},
  postCapture(cx){
    if(cx.secret){killBoss(true);return}
    const e=bossEnt();boss.crush=freeRatio(e,GOZ_R);if(boss.crush<=GOZ_T)killBoss(false);
  },
  bar(){return clamp01((boss.crush-GOZ_T)/(1-GOZ_T))},
  hint(){return t('hb.crush',{a:Math.round((1-boss.crush)*100),b:Math.round((1-GOZ_T)*100)})},
  draw(e,cs,tm,frz){
    if(e.sleep>0){
      const x=e.x*cs,y=e.y*cs,r=e.r*cs;
      ctx.fillStyle=frz?'#bae6fd':'#ffe4ec';ctx.beginPath();ctx.arc(x,y,r,0,7);ctx.fill();
      ctx.fillStyle='#ff7aa8';ctx.beginPath();ctx.arc(x,y,r,Math.PI,0);ctx.fill();
      ctx.strokeStyle='#9d174d';ctx.lineWidth=Math.max(1,cs*.4);ctx.beginPath();ctx.moveTo(x-r,y);ctx.quadraticCurveTo(x,y+r*.35,x+r,y);ctx.stroke();
      for(let i=-2;i<=2;i++){ctx.beginPath();ctx.moveTo(x+i*r*.3,y+r*.12);ctx.lineTo(x+i*r*.36,y+r*.38);ctx.stroke()}
      return;
    }
    drawLegacy(e,cs,tm,frz);
  }},
/* 2 */ {id:'golem',icon:'💎',
  setup(bs){spawnBoss(W/2,H*.42,3.4,bs*.8,'golem');boss.hp=boss.maxHp=3;
    boss.cores=[];const spots=[[W*.22,H*.22],[W*.78,H*.3],[W*.3+R()*W*.4,H*.68]];
    for(const[x,y]of spots)boss.cores.push({x:Math.floor(x+(R()-.5)*10),y:Math.floor(y+(R()-.5)*10),a:R()*6})},
  ai(dt){
    const e=bossEnt();if(!e)return;const px=player.x+.5,py=player.y+.5;
    boss.timer-=dt;if(!e.state)e.state='idle';
    if(e.state==='idle'&&boss.timer<=0){e.state='warn';boss.timer=.7}
    else if(e.state==='warn'&&boss.timer<=0){
      let blocked=null;
      for(const c of boss.cores){const cx=c.x+.5,cy=c.y+.5,vx=px-e.x,vy=py-e.y,L2=vx*vx+vy*vy||1,u=Math.max(0,Math.min(1,((cx-e.x)*vx+(cy-e.y)*vy)/L2));
        if(Math.hypot(e.x+vx*u-cx,e.y+vy*u-cy)<e.r+2.2){blocked=c;break}}
      e.bait=!!(blocked&&Math.hypot(blocked.x+.5-px,blocked.y+.5-py)<10);
      if(blocked&&!e.bait){e.state='idle';boss.timer=1+R()}
      else{e.state='dash';boss.timer=1;aimAt(e,px,py,e.base*2.8);sfx.shoot()}}
    else if(e.state==='dash'&&boss.timer<=0){e.state='idle';boss.timer=3+R()*2-boss.tier*.5;setSpeed(e,e.base)}
    if(e.state!=='dash')wander(e,dt);
    for(const c of boss.cores)if(Math.hypot(c.x+.5-e.x,c.y+.5-e.y)<e.r+1.8){
      if(e.state==='dash'&&e.bait){burst(c.x+.5,c.y+.5,'#5af0ff',40);killBoss(true);return} // GİZLİ: kristalin arkasında bekleyen oyuncuya hücum ederse kendi kristaline çarpar
      const dx=e.x-c.x-.5,dy=e.y-c.y-.5,d=Math.hypot(dx,dy)||1;e.x=c.x+.5+dx/d*(e.r+1.9);e.y=c.y+.5+dy/d*(e.r+1.9);e.vx=dx/d*e.base;e.vy=dy/d*e.base;
      if(e.state==='dash'){e.state='idle';boss.timer=2}
    }
  },
  postCapture(){
    let n=0;
    boss.cores=boss.cores.filter(c=>{if(grid[idx(c.x,c.y)]===1){burst(c.x+.5,c.y+.5,'#5af0ff',30);burst(c.x+.5,c.y+.5,'#e879f9',20);n++;return false}return true});
    if(n)hurtBoss(n,null,null,t('pop.crystal'),'#5af0ff');
  },
  hint(){return t('hb.crystal',{n:boss.cores.length})},
  drawUnder(cs,tm){
    const be=bossEnt();
    for(const c of boss.cores){
      const x=(c.x+.5)*cs,y=(c.y+.5)*cs,s=cs*(2.4+.25*Math.sin(tm/200+c.a));
      if(be){ctx.strokeStyle='rgba(90,240,255,.22)';ctx.lineWidth=Math.max(1,cs*.4);ctx.setLineDash([cs,cs*1.2]);ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(be.x*cs,be.y*cs);ctx.stroke();ctx.setLineDash([])}
      ctx.save();ctx.translate(x,y);ctx.rotate(tm/700+c.a);ctx.shadowColor='#5af0ff';ctx.shadowBlur=cs*3;
      const g=ctx.createLinearGradient(-s,-s,s,s);g.addColorStop(0,'#e0faff');g.addColorStop(.5,'#5af0ff');g.addColorStop(1,'#a855f7');
      ctx.fillStyle=g;ctx.beginPath();ctx.moveTo(0,-s*1.3);ctx.lineTo(s*.8,0);ctx.lineTo(0,s*1.3);ctx.lineTo(-s*.8,0);ctx.closePath();ctx.fill();ctx.restore();
    }
  },
  draw(e,cs,tm,frz){drawLegacy(e,cs,tm,frz)}},
/* 3 */ {id:'yilan',icon:'🐍',
  setup(bs){const e=spawnBoss(W/2,H*.35,2.0,bs+7,'yilan');boss.snake={hist:[{x:e.x,y:e.y}],len:SNAKE_LEN,sp:4,lx:e.x,ly:e.y};boss.hp=boss.maxHp=SNAKE_LEN},
  ai(dt){const e=bossEnt();if(!e)return;rot(e,Math.sin(clock*2.6)*dt*2.4);setSpeed(e,e.base);boss.timer-=dt;if(boss.timer<=0){boss.timer=2.5+R()*2;rot(e,(R()-.5)*1.8)}},
  afterMove(){
    const h=bossEnt(),sn=boss.snake;if(!h)return;
    if(Math.hypot(h.x-sn.lx,h.y-sn.ly)>=.35){sn.hist.unshift({x:h.x,y:h.y});sn.lx=h.x;sn.ly=h.y;const max=sn.len*sn.sp+1;if(sn.hist.length>max)sn.hist.length=max}
  },
  hazards(){const sn=boss.snake;for(let i=1;i<sn.len;i++){const sg=sn.hist[i*sn.sp];if(!sg)break;if(hazard(sg.x,sg.y,1.1))return true}return false},
  postCapture(cx){
    const sn=boss.snake;let cut=sn.len;
    for(let i=1;i<sn.len;i++){const sg=sn.hist[i*sn.sp];if(!sg)break;if(grid[cellAt(sg.x,sg.y)]===1){cut=i;break}}
    if(cut<sn.len){
      for(let i=cut;i<sn.len;i++){const sg=sn.hist[i*sn.sp];if(sg)burst(sg.x,sg.y,'#a3e635',4)}
      popText(t('pop.cut'),player.x,player.y-3,'#a3e635');sfx.hit();addScore((sn.len-cut)*80,player.x,player.y,true);
      sn.len=cut;sn.hist.length=Math.min(sn.hist.length,cut*sn.sp+1);
    }
    boss.hp=sn.len;if(sn.len<SNAKE_MIN)killBoss(false);
  },
  bar(){return clamp01((boss.snake.len-SNAKE_MIN)/(SNAKE_LEN-SNAKE_MIN))},
  hint(){return t('boss.yilan.short')},
  drawUnder(cs,tm,frz){
    const sn=boss.snake,h=sn.hist,N=Math.min(h.length-1,(sn.len-1)*sn.sp+2);if(N<3)return;
    const P=[];for(let i=1;i<=N;i++)P.push(h[i]);
    const n=P.length,wid=k=>{const f=k/(n-1);return cs*(3.3-2.2*f)*(f>.82?Math.max(.25,1-(f-.82)/.18*.75):1)};
    const col=(f,l)=>frz?`hsl(195,80%,${l}%)`:`hsl(${85+f*70},${88-f*15}%,${l}%)`;
    const CH=6; // parçaları gruplayarak çiz (telefonda hızlı)
    const pass=(wm,add,cf)=>{for(let k=n-1;k>0;k-=CH){const k0=Math.max(0,k-CH),f=(k+k0)/2/(n-1);
      ctx.strokeStyle=cf(f);ctx.lineWidth=Math.max(1,wid((k+k0)>>1)*wm+add);ctx.beginPath();ctx.moveTo(P[k].x*cs,P[k].y*cs);
      for(let j=k-1;j>=k0;j--)ctx.lineTo(P[j].x*cs,P[j].y*cs);ctx.stroke()}};
    ctx.save();ctx.lineCap='round';ctx.lineJoin='round';
    // gölge + koyu dış hat
    pass(1,cs*1.7,()=>frz?'rgba(125,211,252,.16)':'rgba(163,230,53,.16)'); // ucuz parlama
    pass(1,cs*.55,()=>frz?'#0c4a6e':'#052e2b');
    // gövde: alt tonda turkuaz, üstte limon yeşili
    pass(1,0,f=>col(f,34));
    pass(.72,0,f=>col(f,46));
    pass(.34,0,f=>col(f,64)); // sırt parlaklığı
    // pullar: sırt boyunca baklava desenleri
    for(let k=5;k<n-4;k+=5){
      const A=P[k],B=P[k-1],ang=Math.atan2(B.y-A.y,B.x-A.x),w=wid(k),f=k/(n-1);
      ctx.save();ctx.translate(A.x*cs,A.y*cs);ctx.rotate(ang);
      ctx.fillStyle=frz?'rgba(12,74,110,.75)':`hsla(${170+f*20},80%,${22+f*4}%,.8)`;
      ctx.beginPath();ctx.moveTo(w*.42,0);ctx.lineTo(0,w*.24);ctx.lineTo(-w*.42,0);ctx.lineTo(0,-w*.24);ctx.closePath();ctx.fill();
      ctx.fillStyle=frz?'#e0f2fe':'rgba(236,252,203,.85)';ctx.beginPath();ctx.arc(w*.05,-w*.06,Math.max(.6,w*.07),0,7);ctx.fill();
      ctx.restore();
    }
    // kuyruk ucu: küçük parlak sivri
    const T=P[n-1],T2=P[Math.max(0,n-3)],ta=Math.atan2(T.y-T2.y,T.x-T2.x);
    ctx.fillStyle=frz?'#bae6fd':'#d9f99d';ctx.beginPath();
    ctx.moveTo(T.x*cs+Math.cos(ta)*cs*1.1,T.y*cs+Math.sin(ta)*cs*1.1);
    ctx.lineTo(T.x*cs+Math.cos(ta+1.9)*cs*.35,T.y*cs+Math.sin(ta+1.9)*cs*.35);
    ctx.lineTo(T.x*cs+Math.cos(ta-1.9)*cs*.35,T.y*cs+Math.sin(ta-1.9)*cs*.35);ctx.closePath();ctx.fill();
    ctx.restore();
  },
  draw(e,cs,tm,frz){drawLegacy(e,cs,tm,frz)}},
/* 4 */ {id:'kovan',icon:'🐝',smalls:0,
  setup(bs){spawnBoss(W/2,H*.4,3.4,bs*.6,'kovan');boss.hp=boss.maxHp=6;boss.timer=1.5},
  ai(dt){
    const e=bossEnt();if(!e)return;wander(e,dt,1.6);
    boss.timer-=dt;
    if(boss.timer<=0){boss.timer=Math.max(1.8,3.6-boss.tier*.6);
      if(enemies.filter(m=>m.kind==='bee').length<6){const m=mkEnemy(e.x,e.y,1.0,Math.min(13+levelIn()*1.1+boss.tier*3,26),false);m.kind='bee';m.color='#ffd640';enemies.push(m);burst(e.x,e.y,'#ffd640',8)}}
  },
  postCapture(cx){
    const n=cx.trapped.filter(e=>e.kind==='bee').length;
    if(n>=3){killBoss(true);return} // GİZLİ: tek kapanda 3 yavru
    if(n)hurtBoss(n,null,null,'-'+n);
  },
  draw(e,cs,tm,frz){if(e.kind==='bee'){drawBee(e,cs,tm,frz);return}drawLegacy(e,cs,tm,frz)}},
/* 5 */ {id:'ikiz',icon:'⚡',
  setup(bs){spawnBoss(W*.3,H*.38,2.6,bs+2,'ikizA');spawnBoss(W*.7,H*.46,2.6,bs+2,'ikizB')},
  seeds(){return enemies.filter(e=>e.kind==='ikizA'||e.kind==='ikizB')},
  ai(dt){
    const a=enemies.find(m=>m.kind==='ikizA'),b=enemies.find(m=>m.kind==='ikizB');if(!a||!b)return;
    const dx=b.x-a.x,dy=b.y-a.y,d=Math.hypot(dx,dy)||1,f=Math.max(-1,Math.min(1,(d-16)/30))*dt*1.4;
    a.vx+=dx/d*f*a.base;a.vy+=dy/d*f*a.base;b.vx-=dx/d*f*b.base;b.vy-=dy/d*f*b.base;
    setSpeed(a,a.base);setSpeed(b,b.base);wander(a,dt,1.2);wander(b,dt,1.2);
    if(d<a.r+b.r-.3){
      if(countUnclaimed()<3600){burst((a.x+b.x)/2,(a.y+b.y)/2,'#fef08a',50);killBoss(true);return} // GİZLİ: dar alanda çarpışırlarsa birbirini yok eder
      const nx=dx/d,ny=dy/d,va=a.vx*nx+a.vy*ny,vb=b.vx*nx+b.vy*ny;
      if(va-vb>0){a.vx+=(vb-va)*nx;a.vy+=(vb-va)*ny;b.vx+=(va-vb)*nx;b.vy+=(va-vb)*ny}
      const push=(a.r+b.r-d)/2+.05;a.x-=nx*push;a.y-=ny*push;b.x+=nx*push;b.y+=ny*push;setSpeed(a,a.base);setSpeed(b,b.base);
    }
  },
  postCapture(cx){if(cx.separated)killBoss(false)},
  bar(){return 1},hint(){return t('boss.ikiz.short')},
  drawUnder(cs,tm,frz){
    const a=enemies.find(e=>e.kind==='ikizA'),b=enemies.find(e=>e.kind==='ikizB');if(!a||!b)return;
    ctx.strokeStyle=frz?'#bae6fd':'#fef08a';ctx.lineWidth=Math.max(1,cs*.45);ctx.globalAlpha=.75;ctx.beginPath();ctx.moveTo(a.x*cs,a.y*cs);
    for(let i=1;i<12;i++){const f=i/12,j=(R()-.5)*cs*2.2;ctx.lineTo((a.x+(b.x-a.x)*f)*cs+j,(a.y+(b.y-a.y)*f)*cs+j)}
    ctx.lineTo(b.x*cs,b.y*cs);ctx.stroke();ctx.globalAlpha=1;
  },
  draw(e,cs,tm,frz){drawLegacy(e,cs,tm,frz)}},
/* 6 */ {id:'ejder',icon:'🐉',smalls:0,
  setup(bs){spawnBoss(W/2,H*.38,3.4,bs*.85,'ejder');boss.hp=boss.maxHp=4;boss.timer=2.5},
  ai(dt){
    const e=bossEnt();if(!e)return;wander(e,dt,1.6);
    boss.timer-=dt;e.charging=boss.timer<.8;e.mouth=e.charging?.3:0;
    if(boss.timer<=0){
      boss.timer=Math.max(1.4,2.5-boss.tier*.4-(player.drawing?.5:0));
      if(shots.length<5){const px=player.x+.5,py=player.y+.5,dx=px-e.x,dy=py-e.y,d=Math.hypot(dx,dy)||1,sp=16+levelIn()*.5+boss.tier*3;
        shots.push({x:e.x+dx/d*(e.r+1),y:e.y+dy/d*(e.r+1),vx:dx/d*sp,vy:dy/d*sp,r:.9,b:4,life:9,color:'#ffb020'});sfx.shoot()}
    }
  },
  afterMove(){ // GİZLİ: sekip geri dönen ateş topu, ejder ağzını açmışken ona çarparsa yutar ve patlar
    const e=bossEnt();if(!e||!e.charging||countUnclaimed()>4200)return;
    for(const s of shots)if((s.bounced||0)>=1&&Math.hypot(s.x-e.x,s.y-e.y)<e.r+s.r){burst(e.x,e.y,'#ff6a00',50);killBoss(true);return}
  },
  postCapture(cx){const n=cx.trappedShots.length;if(n)hurtBoss(n,null,null,'-'+n)},
  draw(e,cs,tm,frz){drawLegacy(e,cs,tm,frz)}},
/* 7 */ {id:'balcik',icon:'🟢',smalls:0,
  setup(bs){const e=spawnBoss(W/2,H*.42,3.4,bs*.9,'balcik');e.gen=0;boss.hp=boss.maxHp=7},
  ai(dt){for(const e of enemies)if(e.kind==='balcik')wander(e,dt)},
  always(){let m=0;for(const e of enemies)if(e.kind==='balcik')m+=[7,3,1][e.gen];boss.hp=m;if(m<=0)killBoss(false)},
  seeds(){return []}, // tek alan kalır; kapanda kalan parçalar ölür (oyuncu ayrı bir adaya hapsolmasın)
  preCapture(cx){cx.split=enemies.filter(e=>e.kind==='balcik'&&e.gen<2&&cx.trailDist(e)<e.r+11)},
  postCapture(cx){
    enemies=enemies.filter(e=>{if(e.kind==='balcik'&&grid[cellAt(e.x,e.y)]===1){burst(e.x,e.y,'#4ade80',24);addScore(500,e.x,e.y);sfx.kill();cx.split=cx.split.filter(q=>q!==e);return false}return true});
    for(const e of cx.split){
      if(!enemies.includes(e))continue;
      const ng=e.gen+1,nr=ng===1?2.3:1.3,a=Math.atan2(e.vy,e.vx)+Math.PI/2,base=e.base*(ng===1?1.15:1.4);
      enemies.splice(enemies.indexOf(e),1);
      for(const sg of[-1,1]){const c=mkEnemy(e.x+Math.cos(a)*sg*nr,e.y+Math.sin(a)*sg*nr,nr,base,ng<2);c.kind='balcik';c.gen=ng;c.base=base;c.vx=Math.cos(a)*sg*base;c.vy=Math.sin(a)*sg*base;rot(c,0);c.hurt=.5;c.color='#4ade80';enemies.push(c)}
      burst(e.x,e.y,'#4ade80',30);popText(t('pop.split'),e.x,e.y-3,'#4ade80');sfx.hit();
    }
    let m=0;for(const e of enemies)if(e.kind==='balcik')m+=[7,3,1][e.gen];boss.hp=m;if(m<=0)killBoss(false);
  },
  hint(){return t('hb.pieces',{n:enemies.filter(e=>e.kind==='balcik').length})},
  draw(e,cs,tm,frz){drawLegacy(e,cs,tm,frz)}},
/* 8 */ {id:'zirh',icon:'🪲',
  setup(bs){const e=spawnBoss(W/2,H*.42,3.4,bs,'zirh');e.open=false;setSpeed(e,e.base*1.3);boss.hp=boss.maxHp=3;boss.timer=4},
  ai(dt){
    const e=bossEnt();if(!e)return;wander(e,dt);
    boss.timer-=dt;
    if(boss.timer<=0){e.open=!e.open;boss.timer=e.open?2.6:Math.max(2.5,4.2-boss.tier*.5);setSpeed(e,e.base*(e.open?.55:1.3));if(e.open){tone(880,.12,'square',.04);tone(660,.12,'square',.04,0,.1)}}
  },
  preCapture(cx){const e=bossEnt();if(e&&e.open&&cx.trailDist(e)<e.r+9)cx.armorHit=true},
  postCapture(cx){if(cx.armorHit){const e=bossEnt();burst(e.x,e.y,'#f43f5e',30);if(hurtBoss(1,null,null,t('pop.armor')))return;e.open=false;boss.timer=3;setSpeed(e,e.base*1.3)}},
  hint(){const e=bossEnt();return e&&e.open?t('hb.armorOpen'):t('hb.hp',{a:boss.hp,b:boss.maxHp})},
  draw(e,cs,tm,frz){drawLegacy(e,cs,tm,frz)}},
/* 9 */ {id:'isin',icon:'🌀',
  setup(bs){spawnBoss(W/2,H*.42,3.0,bs,'isin');boss.hp=boss.maxHp=3;boss.timer=3;boss.portal=null},
  ai(dt){
    const e=bossEnt();if(!e)return;wander(e,dt);const px=player.x+.5,py=player.y+.5;
    boss.timer-=dt;
    if(!boss.portal&&boss.timer<=0){
      let dest=null;
      for(let k=0;k<120&&!dest;k++){const a=R()*6.28,d=k<80?8+R()*22:R()*60,x=(k<80?px:e.x)+Math.cos(a)*d,y=(k<80?py:e.y)+Math.sin(a)*d;
        if(x<2||y<2||x>W-2||y>H-2)continue;if(hitsClaimed(x,y,e.r+1)||hitsTrail(x,y,e.r+1))continue;if(Math.hypot(x-e.x,y-e.y)<12)continue;dest={x,y}}
      if(dest){const mx=Math.max(2.2,3.2-boss.tier*.4);boss.portal={x:dest.x,y:dest.y,t:mx,max:mx};tone(300,.5,'sine',.04,400)}else boss.timer=1;
    }
    const P=boss.portal;
    if(P){P.t-=dt;if(P.t<=0){
      const blocked=grid[cellAt(P.x,P.y)]===1||hitsClaimed(P.x,P.y,e.r*.6);burst(e.x,e.y,'#a855f7',25);boss.portal=null;
      if(blocked){burst(P.x,P.y,'#e879f9',40);if(hurtBoss(1,null,null,t('pop.void'),'#e879f9'))return}
      else{e.x=P.x;e.y=P.y;burst(e.x,e.y,'#a855f7',25);tone(900,.2,'sine',.04,-500)}
      boss.timer=Math.max(2,3.6-boss.tier*.5)+R()*1.5;
    }}
  },
  drawUnder(cs,tm){
    const P=boss.portal;if(!P)return;const x=P.x*cs,y=P.y*cs,r2=cs*3.5,f=P.t/P.max;
    ctx.save();ctx.translate(x,y);
    for(let k=0;k<3;k++){ctx.rotate(tm/300+k*2.1);ctx.strokeStyle=`rgba(${k?'232,121,249':'168,85,247'},.85)`;ctx.lineWidth=Math.max(1,cs*.5);ctx.beginPath();ctx.arc(0,0,r2*(.5+k*.25)*(1+.1*Math.sin(tm/90)),0,4);ctx.stroke()}
    ctx.restore();
    ctx.strokeStyle='#fde047';ctx.lineWidth=Math.max(1.5,cs*.5);ctx.beginPath();ctx.arc(x,y,r2*1.35,-Math.PI/2,-Math.PI/2+f*6.283);ctx.stroke();
    ctx.fillStyle='#fff';ctx.font=`800 ${Math.round(cs*2.6)}px system-ui`;ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(Math.ceil(P.t),x,y);
    const be=bossEnt();if(be){ctx.strokeStyle='rgba(168,85,247,.35)';ctx.setLineDash([cs,cs]);ctx.lineWidth=Math.max(1,cs*.3);ctx.beginPath();ctx.moveTo(be.x*cs,be.y*cs);ctx.lineTo(x,y);ctx.stroke();ctx.setLineDash([])}
  },
  draw(e,cs,tm,frz){drawLegacy(e,cs,tm,frz)}},
/* 10 */ {id:'bomba',icon:'💣',smalls:0,
  setup(bs){spawnBoss(W/2,H*.42,3.2,bs*.8,'bomba');boss.hp=boss.maxHp=4;boss.timer=2.5;boss.bombs=[];boss.throws=[]},
  ai(dt){
    const e=bossEnt();if(!e)return;wander(e,dt);
    boss.timer-=dt;
    if(boss.timer<=0){boss.timer=Math.max(2.2,3.6-boss.tier*.5);if(boss.bombs.length<4){boss.bombs.push({x:e.x,y:e.y,t:7,max:7});tone(200,.08,'square',.04)}}
    for(const b of boss.bombs)b.t-=dt;
    for(const b of boss.bombs.filter(b=>b.t<=0)){
      b.dead=true;burst(b.x,b.y,'#fb923c',40);burst(b.x,b.y,'#fde047',25);sfx.boom();flash=Math.max(flash,.3);
      if(Math.hypot(e.x-b.x,e.y-b.y)<4.5&&countUnclaimed()<4200){boss.bombs=boss.bombs.filter(q=>!q.dead);killBoss(true);return} // GİZLİ: kendi bombasına yakalanır
      if(player.drawing){
        const dx=player.x+.5-b.x,dy=player.y+.5-b.y;if(dx*dx+dy*dy<36){boss.bombs=boss.bombs.filter(q=>!q.dead);killPlayer();return}
        let best=-1;for(let i=0;i<player.trail.length;i++){const n=player.trail[i],ddx=n%W+.5-b.x,ddy=((n/W)|0)+.5-b.y;if(ddx*ddx+ddy*ddy<36)best=i}
        if(best>=0)ignite(best);
      }
    }
    boss.bombs=boss.bombs.filter(b=>!b.dead);
  },
  always(dt){
    const e=bossEnt();if(!e)return;
    for(const q of boss.throws){const dx=e.x-q.x,dy=e.y-q.y,d=Math.hypot(dx,dy)||1,st=Math.min(d,60*dt);q.x+=dx/d*st;q.y+=dy/d*st;q.a=(q.a||0)+dt*12;
      if(d<e.r+.5){q.done=true;burst(e.x,e.y,'#fb923c',35);flash=Math.max(flash,.25);if(hurtBoss(1,null,null,t('pop.boom'),'#fde047'))return}}
    boss.throws=boss.throws.filter(q=>!q.done);
  },
  postCapture(){boss.bombs=boss.bombs.filter(b=>{if(grid[cellAt(b.x,b.y)]===1){boss.throws.push({x:b.x,y:b.y});burst(b.x,b.y,'#fde047',12);return false}return true})},
  hint(){return t('hb.bombs',{a:boss.hp,b:boss.maxHp,n:boss.bombs.length})},
  drawUnder(cs,tm){
    for(const b of boss.bombs){const x=b.x*cs,y=b.y*cs,r=cs*1.5,f=b.t/b.max,blink=b.t<2&&Math.floor(tm/80)%2;
      ctx.fillStyle='rgba(251,146,60,.12)';ctx.beginPath();ctx.arc(x,y,cs*6,0,7);ctx.fill();
      ctx.fillStyle=blink?'#f43f5e':'#1c1917';ctx.beginPath();ctx.arc(x,y,r,0,7);ctx.fill();
      ctx.strokeStyle='#fde047';ctx.lineWidth=Math.max(1,cs*.4);ctx.beginPath();ctx.arc(x,y,r*1.5,-Math.PI/2,-Math.PI/2+f*6.283);ctx.stroke();
      ctx.fillStyle='#fde047';ctx.beginPath();ctx.arc(x+r*.6,y-r*.9,cs*(.35+.25*Math.sin(tm/40)),0,7);ctx.fill()}
    for(const q of boss.throws){ctx.save();ctx.translate(q.x*cs,q.y*cs);ctx.rotate(q.a||0);ctx.shadowColor='#fde047';ctx.shadowBlur=cs*3;ctx.fillStyle='#292524';ctx.beginPath();ctx.arc(0,0,cs*1.4,0,7);ctx.fill();ctx.fillStyle='#fde047';ctx.fillRect(-cs*.3,-cs*1.8,cs*.6,cs*.8);ctx.restore()}
  },
  draw(e,cs,tm,frz){drawLegacy(e,cs,tm,frz)}},
/* 11 */ {id:'kartopu',icon:'⛄',
  setup(bs){spawnBoss(W/2,H*.42,2.0,bs,'kartopu');boss.region=W*H},
  ai(dt){
    const e=bossEnt();if(!e)return;wander(e,dt);
    const nr=Math.min(7.5,e.r+.14*dt);if(!hitsClaimed(e.x,e.y,nr))e.r=nr;
    setSpeed(e,e.base*Math.min(1.1,2.6/e.r)+3);
    if(boss.region<KARTOPU_K*Math.PI*e.r*e.r)killBoss(false);
  },
  postCapture(){boss.region=countUnclaimed();const e=bossEnt();if(e&&boss.region<KARTOPU_K*Math.PI*e.r*e.r)killBoss(false)},
  bar(){const e=bossEnt();if(!e)return 0;return clamp01(1-KARTOPU_K*Math.PI*e.r*e.r/(boss.region||1))},
  hint(){const e=bossEnt();return e?t('hb.area',{a:boss.region>9000?'—':boss.region,b:Math.round(KARTOPU_K*Math.PI*e.r*e.r)}):''},
  draw(e,cs,tm,frz){drawLegacy(e,cs,tm,frz)}},
/* 12 */ {id:'ayna',icon:'🪞',
  setup(bs){spawnBoss(W/2,H*.3,2.6,22+levelIn()*.3+boss.tier*3,'ayna');boss.hp=boss.maxHp=3;boss.charge=0},
  move(e,dt){
    if(e.kind!=='ayna')return false;
    const tx=W-(player.x+.5),ty=H-(player.y+.5),dx=tx-e.x,dy=ty-e.y,d=Math.hypot(dx,dy);
    if(d<.05)return true;
    const st=Math.min(d,e.base*dt),n=Math.max(1,Math.ceil(st/.4)),h=st/n;e.vx=dx/d*e.base;e.vy=dy/d*e.base;
    for(let k=0;k<n;k++){const nx=e.x+dx/d*h;if(!hitsClaimed(nx,e.y,e.r))e.x=nx;const ny=e.y+dy/d*h;if(!hitsClaimed(e.x,ny,e.r))e.y=ny}
    return true;
  },
  ai(dt){
    const e=bossEnt();if(!e)return;const px=player.x+.5,py=player.y+.5;
    if(!player.drawing&&Math.hypot(e.x-px,e.y-py)<e.r+.9){burst(px,py,'#c4b5fd',50);killBoss(true);return} // GİZLİ: gölge aslıyla birleşirse yok olur
    const tc=cellAt(W-px,H-py);
    if(grid[tc]===1&&!border[tc])boss.charge+=dt;else boss.charge=Math.max(0,boss.charge-dt*.6);
    if(boss.charge>=1.5){boss.charge=0;burst(e.x,e.y,'#a78bfa',35);if(hurtBoss(1,null,null,t('pop.buried'),'#c4b5fd'))return;
      const p=findFreeSpot(e.r+1,(x,y)=>Math.hypot(x-px,y-py)>20);if(p){e.x=p.x;e.y=p.y}}
  },
  hint(){return boss.charge>0?t('hb.burying',{n:Math.round(boss.charge/1.5*100)}):t('hb.hp',{a:boss.hp,b:boss.maxHp})},
  drawOver(cs){
    if(state==='menu')return;
    const tx=(W-player.x-.5)*cs,ty=(H-player.y-.5)*cs,on=boss.charge>0,q=cs*1.6;
    ctx.strokeStyle=on?'#f43f5e':'rgba(196,181,253,.6)';ctx.lineWidth=Math.max(1,cs*.4);
    ctx.beginPath();ctx.moveTo(tx-q,ty-q);ctx.lineTo(tx+q,ty+q);ctx.moveTo(tx+q,ty-q);ctx.lineTo(tx-q,ty+q);ctx.stroke();
    if(on){ctx.beginPath();ctx.arc(tx,ty,cs*3,-Math.PI/2,-Math.PI/2+boss.charge/1.5*6.283);ctx.stroke()}
  },
  draw(e,cs,tm,frz){drawLegacy(e,cs,tm,frz)}},

/* 13 */ {id:'orumcek',icon:'🕷',
  setup(bs){spawnBoss(W/2,H*.24,2.6,bs+3,'spider');boss.hp=boss.maxHp=3;boss.ropeL=Math.max(26,34-boss.tier*3);boss.anchor={x:W>>1,y:0};boss.timer=3},
  ai(dt){
    const e=bossEnt();if(!e)return;wander(e,dt,1.8);
    boss.timer-=dt;
    if(boss.timer<=0){boss.timer=Math.max(1.8,3.2-boss.tier*.5);
      if(shots.length<4){const px=player.x+.5,py=player.y+.5,dx=px-e.x,dy=py-e.y,d=Math.hypot(dx,dy)||1,sp=13+levelIn()*.3+boss.tier*2;
        shots.push({x:e.x+dx/d*(e.r+1),y:e.y+dy/d*(e.r+1),vx:dx/d*sp,vy:dy/d*sp,r:.8,b:1,life:6,color:'#e5e7eb'});sfx.shoot()}}
  },
  afterMove(){
    const e=bossEnt();if(!e)return;const a=boss.anchor,ax=a.x+.5,ay=a.y+.5,L=boss.ropeL;
    const dx=e.x-ax,dy=e.y-ay,d=Math.hypot(dx,dy)||1;
    if(d>L){const nx=ax+dx/d*L,ny=ay+dy/d*L;if(!hitsClaimed(nx,ny,e.r)){e.x=nx;e.y=ny}
      const vr=(e.vx*dx+e.vy*dy)/d;if(vr>0){e.vx-=2*vr*dx/d;e.vy-=2*vr*dy/d}}
  },
  preCapture(cx){
    const e=bossEnt();if(!e)return;const a=boss.anchor,ax=a.x+.5,ay=a.y+.5,bx=e.x,by=e.y,L2=(bx-ax)**2+(by-ay)**2||1;
    for(const n of cx.trailCells){const px=n%W+.5,py=((n/W)|0)+.5;
      let u=((px-ax)*(bx-ax)+(py-ay)*(by-ay))/L2;if(u<0||u>1)continue;
      const qx=ax+u*(bx-ax),qy=ay+u*(by-ay);
      if(Math.hypot(px-qx,py-qy)<.95&&Math.hypot(px-ax,py-ay)>2.5&&Math.hypot(px-bx,py-by)>e.r){cx.ropeCut=true;break}}
  },
  postCapture(cx){
    const e=bossEnt();if(!e)return;
    if(cx.ropeCut){burst((boss.anchor.x+e.x)/2,(boss.anchor.y+e.y)/2,'#e5e7eb',30);if(hurtBoss(1,null,null,t('pop.rope'),'#e5e7eb'))return;this.reanchor(e)}
    else if(!border[idx(boss.anchor.x,boss.anchor.y)]){const nb=nearestBorder(boss.anchor.x,boss.anchor.y);boss.anchor={x:nb[0],y:nb[1]}}
  },
  reanchor(e){
    const c=[];
    for(let i=0;i<W*H;i++)if(border[i]){const x=i%W,y=(i/W)|0,d=Math.hypot(x+.5-e.x,y+.5-e.y);if(d>8&&d<boss.ropeL*.85)c.push([x,y])}
    if(c.length){const p=c[Math.floor(R()*c.length)];boss.anchor={x:p[0],y:p[1]}}
    else{const nb=nearestBorder(Math.floor(e.x),Math.floor(e.y));boss.anchor={x:nb[0],y:nb[1]}}
  },
  drawUnder(cs){const e=bossEnt();if(e)drawRope(boss.anchor.x+.5,boss.anchor.y+.5,e.x,e.y,cs)},
  draw(e,cs,tm,frz){
    const x=e.x*cs,y=e.y*cs,r=e.r*cs,hurt=hurtOn(e,tm);
    ctx.strokeStyle=frz?'#7dd3fc':'#1f1235';ctx.lineWidth=Math.max(1,cs*.45);
    for(const sd of[-1,1])for(let i=0;i<4;i++){const a=(-.9+i*.6)+Math.sin(tm/90+i)*.12,k=r*1.9;
      ctx.beginPath();ctx.moveTo(x+sd*r*.4,y);ctx.quadraticCurveTo(x+sd*Math.cos(a)*k*.7,y+Math.sin(a)*k*.5-r*.6,x+sd*Math.cos(a)*k,y+Math.sin(a)*k*.8+r*.3);ctx.stroke()}
    ctx.shadowColor=frz?'#5af0ff':'#a855f7';ctx.shadowBlur=cs*2;
    ctx.fillStyle=hurt?'#fff':(frz?'#38bdf8':'#2e1065');ctx.beginPath();ctx.ellipse(x,y+r*.25,r*.85,r,0,0,7);ctx.fill();
    ctx.beginPath();ctx.arc(x,y-r*.7,r*.55,0,7);ctx.fill();ctx.shadowBlur=0;
    ctx.fillStyle='#f43f5e';ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x-r*.25,y+r*.3);ctx.lineTo(x,y+r*.6);ctx.lineTo(x+r*.25,y+r*.3);ctx.closePath();ctx.fill();
    ctx.fillStyle='#fde047';for(const[dx,dy]of[[-.22,-.8],[.22,-.8],[-.1,-.6],[.1,-.6]]){ctx.beginPath();ctx.arc(x+dx*r,y+dy*r,r*.09,0,7);ctx.fill()}
  }},
/* 14 */ {id:'bukalemun',icon:'🦎',
  setup(bs){spawnBoss(W/2,H*.42,3.0,bs,'cham');boss.hp=boss.maxHp=4;boss.col=0;boss.next=1;boss.timer=5;boss.orbs=[0,1,2].map(c=>this.newOrb(c))},
  newOrb(c){
    const be=bossEnt(),p=findFreeSpot(2,(x,y)=>Math.hypot(x-player.x,y-player.y)>14&&(!be||Math.hypot(x-be.x,y-be.y)>8))||{x:W/2,y:H/2};
    const o={x:p.x,y:p.y,r:1.6,c,ang:0,turn:2};const a=R()*6.28;o.vx=Math.cos(a)*5;o.vy=Math.sin(a)*5;return o;
  },
  ai(dt){
    const e=bossEnt();if(!e)return;wander(e,dt);
    boss.timer-=dt;
    if(boss.timer<=0){boss.col=boss.next;boss.next=(boss.col+1+(R()<.5?1:0))%3;boss.timer=Math.max(3,5-boss.tier*.7);tone(520,.1,'sine',.03)}
    for(const o of boss.orbs){wander(o,dt,1);moveEnt(o,dt)}
  },
  postCapture(){
    const got=boss.orbs.filter(o=>grid[cellAt(o.x,o.y)]===1);
    if(got.length===3){for(const o of got)burst(o.x,o.y,ORB_COL[o.c],30);killBoss(true);return} // GİZLİ: 3 küre aynı anda
    for(const o of got){
      burst(o.x,o.y,ORB_COL[o.c],25);
      if(o.c===boss.col){if(hurtBoss(1,o.x,o.y-3,t('pop.right'),ORB_COL[o.c]))return}
      else{boss.hp=Math.min(boss.maxHp,boss.hp+1);popText(t('pop.wrong'),o.x,o.y-3,'#94a3b8')}
      Object.assign(o,this.newOrb(o.c));
    }
    for(const o of boss.orbs)if(hitsClaimed(o.x,o.y,o.r))relocate(o);
  },
  hint(){return t('hb.color',{a:boss.hp,b:boss.maxHp})+` <span style="display:inline-block;width:10px;height:10px;border-radius:50%;background:${ORB_COL[boss.col]};vertical-align:-1px"></span>`},
  drawUnder(cs,tm,frz){
    for(const o of boss.orbs){const x=o.x*cs,y=o.y*cs,r=o.r*cs*(1+.08*Math.sin(tm/150+o.c));
      ctx.shadowColor=ORB_COL[o.c];ctx.shadowBlur=cs*3;
      const g=ctx.createRadialGradient(x-r*.3,y-r*.3,0,x,y,r);g.addColorStop(0,'#fff');g.addColorStop(.4,ORB_COL[o.c]);g.addColorStop(1,'#111');
      ctx.fillStyle=g;ctx.beginPath();ctx.arc(x,y,r,0,7);ctx.fill();ctx.shadowBlur=0}
  },
  draw(e,cs,tm,frz){
    const x=e.x*cs,y=e.y*cs,r=e.r*cs,a=Math.atan2(e.vy,e.vx),hurt=hurtOn(e,tm);
    const flick=boss.timer<1&&Math.floor(tm/90)%2,col=frz?'#7dd3fc':ORB_COL[flick?boss.next:boss.col];
    ctx.save();ctx.translate(x,y);ctx.rotate(a);
    ctx.shadowColor=col;ctx.shadowBlur=cs*3;
    ctx.strokeStyle=col;ctx.lineWidth=r*.28;ctx.lineCap='round';ctx.beginPath();ctx.moveTo(-r*.8,0);ctx.quadraticCurveTo(-r*1.7,r*.2,-r*1.5,r*.8);ctx.arc(-r*1.25,r*.8,r*.25,0,5);ctx.stroke();
    ctx.fillStyle=hurt?'#fff':col;ctx.beginPath();ctx.ellipse(0,0,r*1.05,r*.72,0,0,7);ctx.fill();ctx.shadowBlur=0;
    ctx.fillStyle='rgba(0,0,0,.18)';for(let i=-1;i<=1;i++){ctx.beginPath();ctx.ellipse(i*r*.38,0,r*.12,r*.6,0,0,7);ctx.fill()}
    ctx.fillStyle=col;ctx.beginPath();ctx.ellipse(r*1.05,0,r*.5,r*.42,0,0,7);ctx.fill();
    ctx.fillStyle='#fff';ctx.beginPath();ctx.arc(r*1.15,-r*.25,r*.22,0,7);ctx.fill();
    const lx=player.x+.5-e.x,ly=player.y+.5-e.y,ll=Math.hypot(lx,ly)||1,ca=Math.cos(-a),sa=Math.sin(-a),ex=(lx*ca-ly*sa)/ll,ey=(lx*sa+ly*ca)/ll;
    ctx.fillStyle='#111';ctx.beginPath();ctx.arc(r*1.15+ex*r*.09,-r*.25+ey*r*.09,r*.1,0,7);ctx.fill();
    ctx.strokeStyle=col;ctx.lineWidth=Math.max(1,cs*.4);for(const sd of[-1,1])for(const fx of[-.5,.6]){ctx.beginPath();ctx.moveTo(fx*r,sd*r*.6);ctx.lineTo(fx*r+r*.25,sd*r*1.05);ctx.stroke()}
    ctx.restore();
  }},
/* 15 */ {id:'hayalet',icon:'👻',
  setup(bs){const e=spawnBoss(W/2,H*.42,2.8,bs*1.05,'ghost');e.alpha=.2;boss.hp=boss.maxHp=3;boss.lamps=[];for(let k=0;k<3;k++)boss.lamps.push(this.newLamp())},
  newLamp(){
    const be=bossEnt(),p=findFreeSpot(2.5,(x,y)=>(!be||Math.hypot(x-be.x,y-be.y)>10)&&boss.lamps.every(l=>Math.hypot(l.x-x,l.y-y)>14))||findFreeSpot(2.5)||{x:W/2,y:H/2};
    return{x:Math.floor(p.x),y:Math.floor(p.y),ph:R()*6};
  },
  lit(e){return boss.lamps.find(l=>Math.hypot(l.x+.5-e.x,l.y+.5-e.y)<LIGHT_R)},
  ai(dt){
    const e=bossEnt();if(!e)return;wander(e,dt,1.8);
    const lit=!!this.lit(e);setSpeed(e,e.base*(lit?.35:1));
    const target=lit?1:.18;e.alpha+=(target-e.alpha)*Math.min(1,dt*6);
  },
  preCapture(cx){const e=bossEnt();cx.litLamps=e?boss.lamps.filter(l=>Math.hypot(l.x+.5-e.x,l.y+.5-e.y)<LIGHT_R):[]},
  postCapture(cx){
    for(const l of boss.lamps.slice()){
      if(grid[idx(l.x,l.y)]!==1)continue;
      if(cx.litLamps.includes(l)){burst(l.x+.5,l.y+.5,'#fde68a',40);if(hurtBoss(1,null,null,t('pop.light'),'#fde68a'))return}
      else{burst(l.x+.5,l.y+.5,'#94a3b8',10);popText(t('pop.wasted'),l.x,l.y-3,'#94a3b8')}
      Object.assign(l,this.newLamp());
    }
  },
  drawUnder(cs,tm){
    for(const l of boss.lamps){const x=(l.x+.5)*cs,y=(l.y+.5)*cs,R2=LIGHT_R*cs*(1+.04*Math.sin(tm/200+l.ph));
      const g=ctx.createRadialGradient(x,y,0,x,y,R2);g.addColorStop(0,'rgba(253,230,138,.45)');g.addColorStop(.7,'rgba(253,230,138,.15)');g.addColorStop(1,'rgba(253,230,138,0)');
      ctx.fillStyle=g;ctx.beginPath();ctx.arc(x,y,R2,0,7);ctx.fill();
      ctx.strokeStyle='rgba(253,230,138,.35)';ctx.setLineDash([cs*.8,cs*.8]);ctx.lineWidth=Math.max(1,cs*.25);ctx.beginPath();ctx.arc(x,y,LIGHT_R*cs,0,7);ctx.stroke();ctx.setLineDash([]);
      ctx.fillStyle='#78350f';ctx.fillRect(x-cs*.9,y-cs*1.6,cs*1.8,cs*.4);ctx.fillRect(x-cs*.9,y+cs*1.1,cs*1.8,cs*.4);
      ctx.fillStyle='#fde047';ctx.shadowColor='#fde047';ctx.shadowBlur=cs*3;ctx.fillRect(x-cs*.7,y-cs*1.2,cs*1.4,cs*2.3);ctx.shadowBlur=0}
  },
  draw(e,cs,tm,frz){
    const x=e.x*cs,y=e.y*cs+Math.sin(tm/250)*cs*.6,r=e.r*cs,hurt=hurtOn(e,tm);
    ctx.save();ctx.globalAlpha=hurt?1:e.alpha;
    ctx.shadowColor=frz?'#5af0ff':'#e0e7ff';ctx.shadowBlur=cs*4;
    ctx.fillStyle=frz?'#bae6fd':'#f1f5f9';ctx.beginPath();ctx.arc(x,y-r*.2,r,Math.PI,0);
    for(let i=0;i<=6;i++){const px=x+r-i*(2*r/6),py=y+r*.75+(i%2?-r*.25:0)+Math.sin(tm/120+i)*r*.08;ctx.lineTo(px,py)}
    ctx.closePath();ctx.fill();ctx.shadowBlur=0;
    ctx.fillStyle='#1e1b4b';for(const sd of[-1,1]){ctx.beginPath();ctx.ellipse(x+sd*r*.33,y-r*.3,r*.15,r*.22,0,0,7);ctx.fill()}
    ctx.beginPath();ctx.ellipse(x,y+r*.12,r*.16,r*.12,0,0,7);ctx.fill();
    ctx.restore();
  }},
/* 16 */ {id:'hortum',icon:'🌪',smalls:5,
  setup(bs){spawnBoss(W/2,H*.42,3.0,bs*.8,'twister');boss.hp=boss.maxHp=4;boss.timer=8},
  ai(dt){
    const e=bossEnt();if(!e)return;wander(e,dt,1.6);
    const PR=4+14*Math.min(1,pctNow/70);boss.pull=PR;
    for(const m of enemies.slice()){
      if(m.boss)continue;
      const dx=e.x-m.x,dy=e.y-m.y,d=Math.hypot(dx,dy)||1;
      if(d<PR&&pctNow>=25){const sp=Math.hypot(m.vx,m.vy)||m.base,k=(1-d/PR)*dt*2.4;m.vx+=dx/d*sp*k;m.vy+=dy/d*sp*k;setSpeed(m,sp)}
      if(d<e.r+m.r*.6&&pctNow<25){const sp=Math.hypot(m.vx,m.vy)||m.base;m.vx=-dx/d*sp;m.vy=-dy/d*sp;m.x-=dx/d*.6;m.y-=dy/d*.6;continue}
      if(d<e.r+m.r*.6){enemies.splice(enemies.indexOf(m),1);burst(m.x,m.y,'#cbd5e1',20);e.r=Math.min(e.r+.35,4.6);if(hurtBoss(1,null,null,t('pop.eat'),'#e2e8f0'))return}
    }
    for(const u of powerups.slice()){
      if(Math.hypot(u.x+.5-e.x,u.y+.5-e.y)<e.r+2.2){powerups.splice(powerups.indexOf(u),1);burst(u.x+.5,u.y+.5,PU[u.t].c,12);popText(t('pop.eat'),u.x,u.y-2,'#e2e8f0')}
    }
    boss.timer-=dt;
    const smalls=enemies.filter(m=>!m.boss).length;
    if(boss.timer<=0){boss.timer=6;if(smalls<2){const p=findFreeSpot(1.2,(x,y)=>Math.hypot(x-player.x,y-player.y)>15&&Math.hypot(x-e.x,y-e.y)>12);
      if(p)enemies.push(mkEnemy(p.x,p.y,1.1,Math.min(14+levelIn()*1.1,30),false))}}
  },
  postCapture(cx){ // GİZLİ: Dondur kutusunu hortumun çekim alanı içindeyken kapanına alırsan hortum donup parçalanır
    const e=bossEnt();if(!e)return;
    const PR=4+14*Math.min(1,pctNow/70);boss.pull=PR;
    for(const u of cx.activated)if(u.t==='F'&&Math.hypot(u.x+.5-e.x,u.y+.5-e.y)<Math.max(PR,6)+3){burst(e.x,e.y,'#5af0ff',60);killBoss(true);return}
  },
  hint(){return t('hb.eaten',{a:boss.maxHp-boss.hp,b:boss.maxHp})},
  draw(e,cs,tm,frz){
    const x=e.x*cs,y=e.y*cs,r=e.r*cs,hurt=hurtOn(e,tm);
    const PR=(boss.pull||4)*cs,pull=ctx.createRadialGradient(x,y,r*.5,x,y,PR);pull.addColorStop(0,'rgba(203,213,225,.12)');pull.addColorStop(1,'rgba(203,213,225,0)');ctx.fillStyle=pull;ctx.beginPath();ctx.arc(x,y,PR,0,7);ctx.fill();
    for(let i=0;i<7;i++){const f=i/6,yy=y+r*(1-f*2.1),w2=r*(.35+f*.95),off=Math.sin(tm/120+i*.9)*r*.25;
      ctx.strokeStyle=hurt?'#fff':(frz?`rgba(125,211,252,${.5+f*.4})`:`rgba(226,232,240,${.5+f*.4})`);ctx.lineWidth=Math.max(1,cs*(.6-f*.2));
      ctx.beginPath();ctx.ellipse(x+off,yy,w2,w2*.28,0,0,7);ctx.stroke()}
    ctx.fillStyle='rgba(148,163,184,.8)';for(let i=0;i<6;i++){const a=tm/150+i,d=r*(.6+.5*((i*37)%10)/10);ctx.fillRect(x+Math.cos(a)*d,y+Math.sin(a)*d*.4,cs*.5,cs*.5)}
  }},
/* 17 */ {id:'dev',icon:'🗿',
  setup(bs,tier){const e=spawnBoss(W/2,H*.45,4.4,0,'giant');e.base=Math.min(22+tier*3,28);e.vx=0;e.vy=0;e.awake=0;e.harmless=false;
    boss.noise=0;boss.hp=boss.maxHp=3;boss.chests=[];
    for(let k=0;k<3;k++){for(let tries=0;tries<60;tries++){const a=k*2.094+R()*.6,d=12+R()*5,x=Math.floor(e.x+Math.cos(a)*d),y=Math.floor(e.y+Math.sin(a)*d);
      if(x>3&&y>3&&x<W-4&&y<H-4){boss.chests.push({x,y});break}}}},
  wake(e){
    e.awake=Math.max(5,6.5-boss.tier*.5);sfx.roar();popText(t('pop.wake'),e.x,e.y-e.r-2,'#f43f5e');flash=Math.max(flash,.3);
    if(countUnclaimed()<1500){burst(e.x,e.y,'#a8a29e',60);killBoss(true);return} // GİZLİ: dar alanda uyanırsa kafasını çarpar
    aimAt(e,player.x+.5,player.y+.5,e.base);rot(e,0);
  },
  ai(dt){
    const e=bossEnt();if(!e)return;
    if(e.awake>0){
      e.awake-=dt;e.retarget=(e.retarget||0)-dt;
      if(e.retarget<=0){e.retarget=.6;aimAt(e,player.x+.5,player.y+.5,e.base);rot(e,0)}
      if(e.awake<=0){e.vx=0;e.vy=0;boss.noise=0}
      return;
    }
    e.vx=0;e.vy=0;zzz(e);
    if(boss.noise>=1){this.wake(e);return}
    const d=Math.hypot(player.x+.5-e.x,player.y+.5-e.y);
    if(player.drawing&&d<30)boss.noise=Math.min(1,boss.noise+dt*(1.15-d/30)*(.55+boss.tier*.15));
    else boss.noise=Math.max(0,boss.noise-dt*.1);
    if(boss.noise>=1)this.wake(e);
  },
  preCapture(cx){const e=bossEnt();if(e&&!(e.awake>0)){const d=cx.trailDist(e);if(d<26)boss.noise=Math.min(1,boss.noise+.22*(1-d/26))}},
  postCapture(){
    let n=0;boss.chests=boss.chests.filter(c=>{if(grid[idx(c.x,c.y)]===1){burst(c.x+.5,c.y+.5,'#fde047',30);n++;return false}return true});
    if(n&&hurtBoss(n,null,null,t('pop.chest'),'#fde047'))return;
    const e=bossEnt();if(e&&!(e.awake>0)&&boss.noise>=1)this.wake(e);
  },
  hint(){return t('hb.noise',{n:boss.chests.length,p:Math.round(boss.noise*100)})},
  drawUnder(cs,tm){
    for(const c of boss.chests){const x=(c.x+.5)*cs,y=(c.y+.5)*cs,s=cs*1.6;
      ctx.shadowColor='#fde047';ctx.shadowBlur=cs*2*(1+.4*Math.sin(tm/200+c.x));
      ctx.fillStyle='#92400e';ctx.fillRect(x-s,y-s*.5,s*2,s*1.2);ctx.fillStyle='#b45309';ctx.fillRect(x-s,y-s*.95,s*2,s*.5);ctx.shadowBlur=0;
      ctx.fillStyle='#fde047';ctx.fillRect(x-s*.15,y-s*.6,s*.3,s*.45);ctx.fillRect(x-s,y-s*.5,s*2,s*.12)}
  },
  draw(e,cs,tm,frz){
    let x=e.x*cs,y=e.y*cs;const r=e.r*cs,hurt=hurtOn(e,tm),aw=e.awake>0;
    if(aw){x+=(R()-.5)*cs*.6;y+=(R()-.5)*cs*.6}
    const breath=aw?1:1+.04*Math.sin(tm/500);
    ctx.save();ctx.translate(x,y);ctx.scale(breath,breath);
    ctx.shadowColor=aw?'#f43f5e':(frz?'#5af0ff':'#57534e');ctx.shadowBlur=cs*3;
    const g=ctx.createRadialGradient(-r*.3,-r*.3,0,0,0,r);g.addColorStop(0,frz?'#e0f2fe':'#a8a29e');g.addColorStop(1,frz?'#0369a1':'#44403c');
    ctx.fillStyle=hurt?'#fff':g;ctx.beginPath();
    for(let i=0;i<10;i++){const a=i/10*6.283,rad=r*(.92+((i*53)%7)/70);ctx.lineTo(Math.cos(a)*rad,Math.sin(a)*rad)}
    ctx.closePath();ctx.fill();ctx.shadowBlur=0;
    ctx.fillStyle='#57534e';ctx.beginPath();ctx.ellipse(-r*.6,-r*.75,r*.3,r*.2,-.5,0,7);ctx.ellipse(r*.6,-r*.75,r*.3,r*.2,.5,0,7);ctx.fill();
    if(aw){ctx.fillStyle='#f43f5e';for(const sd of[-1,1]){ctx.beginPath();ctx.arc(sd*r*.32,-r*.15,r*.13,0,7);ctx.fill()}
      ctx.fillStyle='#1c1917';ctx.beginPath();ctx.ellipse(0,r*.35,r*.35,r*.2,0,0,7);ctx.fill();
      ctx.fillStyle='#f5f5f4';for(const sd of[-1,1]){ctx.beginPath();ctx.moveTo(sd*r*.25,r*.2);ctx.lineTo(sd*r*.18,r*.4);ctx.lineTo(sd*r*.32,r*.4);ctx.fill()}}
    else{ctx.strokeStyle='#1c1917';ctx.lineWidth=Math.max(1,cs*.4);for(const sd of[-1,1]){ctx.beginPath();ctx.arc(sd*r*.32,-r*.18,r*.14,.2,Math.PI-.2);ctx.stroke()}
      ctx.beginPath();ctx.arc(0,r*.35,r*.12,0,7);ctx.stroke()}
    ctx.restore();
  }},
/* 18 */ {id:'yildiz',icon:'🌟',smalls:2,
  setup(bs){spawnBoss(W/2,H*.42,3.6,bs*.8,'star');boss.phase=1;boss.hp=boss.maxHp=3;boss.timer=3;boss.crush=1;
    boss.cores=[{x:Math.floor(W*.2+R()*8),y:Math.floor(H*.25+R()*10),a:0},{x:Math.floor(W*.72+R()*8),y:Math.floor(H*.6+R()*10),a:2}]},
  seeds(){return enemies.filter(e=>e.boss)},
  ai(dt){
    for(const e of enemies)if(e.boss)wander(e,dt,1.4);
    if(boss.phase===3){const c=bossEnt();boss.timer-=dt;if(c&&boss.timer<=0){boss.timer=2+R();aimAt(c,player.x+.5+(R()-.5)*20,player.y+.5+(R()-.5)*20,c.base);rot(c,0)}return}
    boss.timer-=dt;
    if(boss.timer<=0){boss.timer=Math.max(1.6,3-boss.tier*.4);
      const src=enemies.filter(e=>e.boss);const e=src[Math.floor(R()*src.length)];
      if(e&&shots.length<5){const px=player.x+.5,py=player.y+.5,dx=px-e.x,dy=py-e.y,d=Math.hypot(dx,dy)||1,sp=15+boss.tier*3;
        shots.push({x:e.x+dx/d*(e.r+1),y:e.y+dy/d*(e.r+1),vx:dx/d*sp,vy:dy/d*sp,r:.85,b:3,life:8,color:'#fde047'});sfx.shoot()}}
  },
  always(){if(boss.phase===3){const c=bossEnt();if(c)boss.crush=freeRatio(c,GOZ_R)}},
  postCapture(cx){
    if(boss.phase===1){
      let n=0;boss.cores=boss.cores.filter(c=>{if(grid[idx(c.x,c.y)]===1){burst(c.x+.5,c.y+.5,'#fde047',35);n++;return false}return true});
      if(n){popText(t('pop.crystal'),player.x,player.y-3,'#fde047');sfx.hit()}
      if(!boss.cores.length){
        const e=bossEnt();enemies.splice(enemies.indexOf(e),1);
        const a=spawnBoss(e.x-3,e.y,2.6,e.base*1.25,'starA'),b=spawnBoss(e.x+3,e.y,2.6,e.base*1.25,'starB');
        a.vx=-Math.abs(a.vx);b.vx=Math.abs(b.vx);
        for(const q of[a,b])if(hitsClaimed(q.x,q.y,q.r))relocate(q);
        boss.phase=2;burst(e.x,e.y,'#fde047',50);popText(t('pop.phase',{n:2}),e.x,e.y-5,'#fde047',1.6);sfx.bossDie();
      }
    }else if(boss.phase===2){
      if(cx.separated){
        const a=enemies.find(e=>e.kind==='starA'),b=enemies.find(e=>e.kind==='starB');
        const keep=a||b;burst(a.x,a.y,'#fde047',40);burst(b.x,b.y,'#fde047',40);
        enemies=enemies.filter(e=>!e.boss);
        const c=spawnBoss(keep.x,keep.y,2.2,keep.base*1.1,'starCore');
        if(hitsClaimed(c.x,c.y,c.r))relocate(c);
        boss.phase=3;boss.timer=1;fillOutsideSeeds();
        boss.crush=freeRatio(c,GOZ_R);
        popText(t('pop.phase',{n:3}),c.x,c.y-5,'#fde047',1.6);sfx.bossDie();
        if(pctNow>=GOAL){levelClear(false,false);return}
      }
    }else{
      const c=bossEnt();boss.crush=freeRatio(c,GOZ_R);if(boss.crush<=GOZ_T)killBoss(false);
    }
  },
  bar(){
    if(boss.phase===1)return (2+boss.cores.length/2)/3;
    if(boss.phase===2)return 2/3;
    return clamp01((boss.crush-GOZ_T)/(1-GOZ_T))/3;
  },
  hint(){return t('hb.phase',{a:boss.phase})},
  drawUnder(cs,tm){
    if(boss.phase===1){const be=bossEnt();
      for(const c of boss.cores){const x=(c.x+.5)*cs,y=(c.y+.5)*cs,s=cs*2.6;
        if(be){ctx.strokeStyle='rgba(253,224,71,.25)';ctx.setLineDash([cs,cs]);ctx.lineWidth=Math.max(1,cs*.4);ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(be.x*cs,be.y*cs);ctx.stroke();ctx.setLineDash([])}
        ctx.save();ctx.translate(x,y);ctx.rotate(tm/500+c.a);ctx.shadowColor='#fde047';ctx.shadowBlur=cs*4;ctx.fillStyle='#fef08a';ctx.beginPath();
        for(let i=0;i<10;i++){const a=i/10*6.283,rad=i%2?s*.45:s;ctx.lineTo(Math.cos(a)*rad,Math.sin(a)*rad)}ctx.closePath();ctx.fill();ctx.restore()}}
    if(boss.phase===2){const a=enemies.find(e=>e.kind==='starA'),b=enemies.find(e=>e.kind==='starB');
      if(a&&b){ctx.strokeStyle='rgba(253,224,71,.6)';ctx.lineWidth=Math.max(1,cs*.4);ctx.beginPath();ctx.moveTo(a.x*cs,a.y*cs);
        for(let i=1;i<10;i++){const f=i/10,j=(R()-.5)*cs*1.6;ctx.lineTo((a.x+(b.x-a.x)*f)*cs+j,(a.y+(b.y-a.y)*f)*cs+j)}ctx.lineTo(b.x*cs,b.y*cs);ctx.stroke()}}
  },
  draw(e,cs,tm,frz){
    const x=e.x*cs,y=e.y*cs,r=e.r*cs,hurt=hurtOn(e,tm);
    const col=e.kind==='starA'?['#fef9c3','#f59e0b','#7c2d12']:e.kind==='starB'?['#fef9c3','#ec4899','#500724']:e.kind==='starCore'?['#ffffff','#fde047','#a16207']:['#fffbeb','#a855f7','#1e1b4b'];
    ctx.save();ctx.translate(x,y);ctx.rotate(e.ang*.7);
    ctx.shadowColor=frz?'#5af0ff':col[1];ctx.shadowBlur=cs*5;
    ctx.beginPath();const pts=e.kind==='star'?14:10;
    for(let i=0;i<pts;i++){const a=i/pts*6.283,rad=i%2?r*.62:r*1.1;ctx.lineTo(Math.cos(a)*rad,Math.sin(a)*rad)}ctx.closePath();
    const g=ctx.createRadialGradient(0,0,0,0,0,r);g.addColorStop(0,col[0]);g.addColorStop(.5,frz?'#38bdf8':col[1]);g.addColorStop(1,col[2]);
    ctx.fillStyle=hurt?'#fff':g;ctx.fill();ctx.restore();
    if(e.kind==='star'){ctx.fillStyle='#000';ctx.beginPath();ctx.arc(x,y,r*.38,0,7);ctx.fill();ctx.strokeStyle='#fde047';ctx.lineWidth=Math.max(1,cs*.3);ctx.beginPath();ctx.arc(x,y,r*.38,0,7);ctx.stroke()}
    eyes(x,y-(e.kind==='star'?r*.05:0),r,e,'#1e1b4b',.28,e.kind==='starCore'?.22:.15);
  }},
];
