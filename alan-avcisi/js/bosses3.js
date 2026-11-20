'use strict';
/* =========================================================
   25–27: Mıknatıs, Mürekkep Ahtapotu, Hücre
   + Final bölümleri (iki boss birlikte)
   ========================================================= */

function freeSpotFar(r,fx,fy,minD){
  for(let k=0;k<200;k++){const x=r+2+R()*(W-2*r-4),y=r+2+R()*(H-2*r-4);
    if(!hitsClaimed(x,y,r+1)&&Math.hypot(x-fx,y-fy)>minD)return {x,y}}
  return {x:W/2,y:H/2};
}

/* ---------- 25: Mıknatıs ---------- */
BOSSES.push({id:'miknatis',icon:'🧲',
  setup(bs){const e=spawnBoss(W/2,H*.4,3.2,bs*.7,'miknatis');boss.hp=boss.maxHp=3;boss.pol=1;boss.polT=4;boss.stuck=0;boss.stickCd=2;boss.dragT=0;
    boss.irons=[0,1,2].map(()=>freeSpotFar(2,e.x,e.y,25))},
  move(e,dt){return e.boss&&boss.stuck>0},
  ai(dt){
    const e=bossEnt();if(!e)return;
    boss.stickCd-=dt;
    if(boss.stuck>0){boss.stuck-=dt;e.vx=e.vy=0;if(boss.stuck<=0){setSpeed(e,e.base);boss.stickCd=3}return}
    boss.polT-=dt*(boss.rage||1);
    if(boss.polT<=0){boss.pol*=-1;boss.polT=4+R()*1.5;tone(boss.pol>0?220:440,.25,'square',.04,boss.pol>0?-120:120)}
    // demir bloklar: yakalanan blok kaybolur, bir süre sonra başka yerde çıkar
    boss.irons=boss.irons.filter(b=>!hitsClaimed(b.x,b.y,.5));
    if(boss.irons.length<3&&R()<dt*.25)boss.irons.push(freeSpotFar(2,e.x,e.y,18));
    if(boss.pol>0&&boss.irons.length){ // çekme: en yakın demire doğru kayar
      const b=boss.irons.reduce((a,c)=>Math.hypot(c.x-e.x,c.y-e.y)<Math.hypot(a.x-e.x,a.y-e.y)?c:a);
      const dx=b.x-e.x,dy=b.y-e.y,d=Math.hypot(dx,dy);
      if(d>.1){e.vx+=dx/d*dt*30;e.vy+=dy/d*dt*30;setSpeed(e,e.base)}
      if(d<e.r+1.6&&boss.stickCd<=0){boss.stuck=3;popText(t('pop.stuck'),e.x,e.y-e.r-3,'#93c5fd',1.4);tone(120,.3,'square',.06,-40);burst(b.x,b.y,'#cbd5e1',16)}
    }else wander(e,dt);
    // oyuncuyu çeker/iter (sadece keserken, sadece boş hücreye)
    if(player.drawing&&!(effects.freeze>0)){
      boss.dragT-=dt;
      const px=player.x+.5,py=player.y+.5,dx=(e.x-px)*boss.pol,dy=(e.y-py)*boss.pol,d=Math.hypot(dx,dy);
      if(boss.dragT<=0&&d<34&&d>e.r+3){
        boss.dragT=Math.max(.22,.42-boss.tier*.06);
        const k=Math.abs(dx)>Math.abs(dy)?(dx>0?'R':'L'):(dy>0?'D':'U'),D=DIRS[k],nx=player.x+D[0],ny=player.y+D[1];
        if(nx>=0&&ny>=0&&nx<W&&ny<H&&grid[idx(nx,ny)]===0)tryMove(D);
      }
    }
  },
  postCapture(cx){
    const e=bossEnt();if(!e||!(boss.stuck>0))return;
    if(cx.trailDist(e)<14){boss.stuck=0;setSpeed(e,e.base);boss.stickCd=3;burst(e.x,e.y,'#93c5fd',30);hurtBoss(1,null,null,t('pop.demag'),'#93c5fd')}
  },
  hint(){return t('hb.magnet',{a:boss.hp,b:boss.maxHp,m:t(boss.pol>0?'mag.pull':'mag.push')})},
  drawUnder(cs,tm,frz){
    for(const b of boss.irons){const x=b.x*cs,y=b.y*cs,s=cs*1.8;
      ctx.fillStyle=frz?'#bae6fd':'#64748b';ctx.fillRect(x-s,y-s,s*2,s*2);ctx.fillStyle=frz?'#e0f2fe':'#94a3b8';ctx.fillRect(x-s,y-s,s*2,s*.6);
      ctx.strokeStyle='#1e293b';ctx.lineWidth=Math.max(1,cs*.3);ctx.strokeRect(x-s,y-s,s*2,s*2)}
    const e=bossEnt();if(!e||boss.stuck>0)return;
    // alan çizgileri: çekerken içe, iterken dışa
    ctx.save();ctx.strokeStyle=boss.pol>0?'rgba(248,113,113,.35)':'rgba(96,165,250,.35)';ctx.lineWidth=Math.max(1,cs*.3);
    for(let i=0;i<3;i++){let ph=((tm/900)+i/3)%1;if(boss.pol>0)ph=1-ph;ctx.globalAlpha=1-ph;ctx.beginPath();ctx.arc(e.x*cs,e.y*cs,cs*(e.r+2+ph*14),0,7);ctx.stroke()}
    ctx.restore();
  },
  draw(e,cs,tm,frz){
    const x=e.x*cs,y=e.y*cs,r=e.r*cs,hurt=e.hurt>0&&Math.floor(tm/60)%2,stuck=boss.stuck>0;
    if(stuck)glowCircle(x,y,r*2.4,'rgba(147,197,253,.9)',.5+.3*Math.sin(tm/70));
    else if(!frz)glowCircle(x+(boss.pol>0?-r*.55:r*.55),y+r*.6,r*1.3,boss.pol>0?'rgba(248,113,113,.9)':'rgba(96,165,250,.9)',.55+.25*Math.sin(tm/90)); // aktif kutup parlar
    if(bImg('miknatis',x,y,r*3,stuck?0:Math.sin(tm/300)*.1,frz,hurt))return;
    ctx.save();ctx.translate(x,y);ctx.rotate(stuck?0:Math.sin(tm/300)*.1);ctx.lineCap='butt';
    const L=boss.pol>0?'#ef4444':'#3b82f6',Rc=boss.pol>0?'#3b82f6':'#ef4444';
    ctx.lineWidth=r*.75;ctx.strokeStyle=hurt?'#fff':frz?'#7dd3fc':'#94a3b8';ctx.beginPath();ctx.arc(0,-r*.1,r*.75,Math.PI,0);ctx.stroke();
    ctx.fillStyle=hurt?'#fff':frz?'#7dd3fc':L;ctx.fillRect(-r*1.12,-r*.1,r*.75,r*.95);
    ctx.fillStyle=hurt?'#fff':frz?'#7dd3fc':Rc;ctx.fillRect(r*.37,-r*.1,r*.75,r*.95);
    ctx.fillStyle='#e5e7eb';ctx.fillRect(-r*1.12,r*.6,r*.75,r*.25);ctx.fillRect(r*.37,r*.6,r*.75,r*.25);
    bEyes(0,-r*.7,r*.7,e,'#0f172a',.38,.2);
    ctx.restore();
  }
});

/* ---------- 26: Mürekkep Ahtapotu ---------- */
function inkBlob(e){
  // oyuncunun aldığı alanın, boş alana komşu bir köşesini geri al
  const cand=[],R2=22,cx=Math.floor(e.x),cy=Math.floor(e.y),px=player.x,py=player.y;
  for(let y=Math.max(2,cy-R2);y<Math.min(H-2,cy+R2);y++)for(let x=Math.max(2,cx-R2);x<Math.min(W-2,cx+R2);x++){
    const n=y*W+x;if(grid[n]!==1)continue;
    if(grid[n-1]===0||grid[n+1]===0||grid[n-W]===0||grid[n+W]===0)cand.push(n)}
  if(!cand.length)return null;
  const c=cand[Math.floor(R()*cand.length)],bx=c%W,by=(c/W)|0,cells=[];
  for(let dy=-3;dy<=3;dy++)for(let dx=-3;dx<=3;dx++){
    if(dx*dx+dy*dy>8)continue;const x=bx+dx,y=by+dy;if(x<1||y<1||x>=W-1||y>=H-1)continue;
    if(Math.abs(x-px)<4&&Math.abs(y-py)<4)continue;const n=y*W+x;if(grid[n]!==1)continue;cells.push(n)}
  if(cells.length<4)return null;
  for(const n of cells){grid[n]=0;paintCell(n)}
  computeBorder();rebuildOverlay();pctNow=claimedPct();updateHud();
  for(const s of sparks)if(grid[idx(s.x,s.y)]!==1||!border[idx(s.x,s.y)]){const b=nearestBorder(s.x,s.y);s.x=b[0];s.y=b[1];s.px=-1;s.py=-1}
  return {cells,t:5,x:bx,y:by};
}
/* Kol: oyuncuya doğru uzanır. Ucu değerse yakar; uzanmış kolu kapanla kesersen hasar */
function armPts(e,a,len){const pts=[],c=Math.cos(a.ang),s=Math.sin(a.ang);
  for(let d=e.r*.8;d<=len;d+=1){const w=Math.sin(d*.45-clock*9)*Math.min(1,d/8)*.9;pts.push(e.x+c*d-s*w,e.y+s*d+c*w)}return pts}
function armUpdate(e,dt){
  const a=boss.arm,px=player.x+.5,py=player.y+.5,dist=Math.hypot(px-e.x,py-e.y);
  if(!a){boss.armT-=dt*(boss.rage||1)*(player.drawing?1.5:1);
    if(boss.armT<=0&&dist<40){boss.arm={ph:'warn',t:0,len:e.r,ang:Math.atan2(py-e.y,px-e.x),max:Math.min(42,dist+5)};tone(180,.5,'sine',.04,-60)}
    return}
  a.t+=dt;
  if(a.ph==='warn'){a.ang=Math.atan2(py-e.y,px-e.x);a.max=Math.min(42,dist+5);if(a.t>.7){a.ph='out';a.t=0;noise(.25,.04,900)}}
  else if(a.ph==='out'){
    let want=Math.atan2(py-e.y,px-e.x)-a.ang;while(want>Math.PI)want-=6.283;while(want<-Math.PI)want+=6.283;
    a.ang+=Math.max(-.6*dt,Math.min(.6*dt,want));
    a.len+=dt*(26+boss.tier*4);
    const c=Math.cos(a.ang),s=Math.sin(a.ang),tx=e.x+c*a.len,ty=e.y+s*a.len;
    if(a.len>=a.max||tx<1||ty<1||tx>W-1||ty>H-1||hitsClaimed(tx,ty,.4)){a.ph='hold';a.t=0}
  }else if(a.ph==='hold'){if(a.t>.45){a.ph='back';a.t=0}}
  else{a.len-=dt*22;if(a.len<=e.r){boss.arm=null;boss.armT=Math.max(3,5.5-boss.tier*.6)+R()*2}}
}
BOSSES.push({id:'ahtapot',icon:'🐙',
  setup(bs){spawnBoss(W/2,H*.4,3.6,bs*.6,'ahtapot');boss.hp=boss.maxHp=4;boss.inkT=3.5;boss.puddles=[];boss.arm=null;boss.armT=3},
  hazards(){
    const e=bossEnt(),a=boss.arm;if(!e||!a||a.ph==='warn'||effects.freeze>0)return false;
    const p=armPts(e,a,a.len);
    for(let i=0;i<p.length;i+=2){const tip=i>=p.length-4;if(hazard(p[i],p[i+1],tip?1.1:.55))return true}
    return false;
  },
  preCapture(cx){const e=bossEnt(),a=boss.arm;if(e&&a&&a.ph!=='warn'&&a.len>e.r+3)cx.armPts=armPts(e,a,a.len)},
  ai(dt){
    const e=bossEnt();if(!e)return;wander(e,dt);
    for(const p of boss.puddles)p.t-=dt;
    boss.puddles=boss.puddles.filter(p=>p.t>0);
    armUpdate(e,dt);
    boss.inkT-=dt*(boss.rage||1);
    if(boss.inkT<=0){boss.inkT=Math.max(2.4,4.2-boss.tier*.5)+R();
      if(pctNow>3&&boss.puddles.length<3){const p=inkBlob(e);if(p){boss.puddles.push(p);noise(.35,.05,500,'lowpass');parts.push({x:p.x,y:p.y,vx:0,vy:-3,life:.5,c:'#7c3aed'})}}}
  },
  postCapture(cx){
    let hits=0,hx=0,hy=0;
    if(cx&&cx.armPts){const p=cx.armPts,e=bossEnt();let cut=-1;
      for(let i=0;i<p.length;i+=2){const x=p[i],y=p[i+1];if(Math.hypot(x-e.x,y-e.y)>e.r+2&&grid[cellAt(x,y)]===1){cut=i;break}}
      if(cut>=0){burst(p[cut],p[cut+1],'#a855f7',30);boss.arm=null;boss.armT=4;if(hurtBoss(1,p[cut],p[cut+1]-3,t('pop.armCut'),'#e9d5ff'))return}}
    boss.puddles=boss.puddles.filter(p=>{const taken=p.cells.filter(n=>grid[n]===1).length;if(taken>=p.cells.length*.5){hits++;hx=p.x;hy=p.y;burst(p.x,p.y,'#a78bfa',20);return false}return true});
    if(hits)hurtBoss(hits,hx,hy-3,t('pop.inkBack'),'#c4b5fd');
  },
  hint(){return t('hb.hp',{a:boss.hp,b:boss.maxHp})},
  drawUnder(cs,tm,frz){
    const e=bossEnt(),a=boss.arm;
    if(e&&a){
      if(a.ph==='warn'){const c=Math.cos(a.ang),s=Math.sin(a.ang);ctx.save();ctx.setLineDash([cs,cs*1.2]);ctx.strokeStyle=`rgba(232,121,249,${.35+.35*Math.sin(tm/60)})`;ctx.lineWidth=Math.max(1,cs*.4);
        ctx.beginPath();ctx.moveTo(e.x*cs,e.y*cs);ctx.lineTo((e.x+c*a.max)*cs,(e.y+s*a.max)*cs);ctx.stroke();ctx.restore()}
      else{const p=armPts(e,a,a.len),n=p.length/2;ctx.lineCap='round';
        for(let i=1;i<n;i++){const k=1-i/n,w=cs*(.5+1.6*k);ctx.strokeStyle=frz?'#7dd3fc':'#6d28d9';ctx.lineWidth=w+cs*.5;ctx.beginPath();ctx.moveTo(p[i*2-2]*cs,p[i*2-1]*cs);ctx.lineTo(p[i*2]*cs,p[i*2+1]*cs);ctx.stroke()}
        for(let i=1;i<n;i++){const k=1-i/n,w=cs*(.5+1.6*k);ctx.strokeStyle=frz?'#bae6fd':'#a855f7';ctx.lineWidth=w;ctx.beginPath();ctx.moveTo(p[i*2-2]*cs,p[i*2-1]*cs);ctx.lineTo(p[i*2]*cs,p[i*2+1]*cs);ctx.stroke()}
        ctx.fillStyle='#f5d0fe';for(let i=3;i<n-1;i+=3){const k=1-i/n;ctx.beginPath();ctx.arc(p[i*2]*cs,p[i*2+1]*cs,cs*(.25+.45*k),0,7);ctx.fill()}
        if(n>1){ctx.fillStyle=frz?'#bae6fd':'#e879f9';ctx.beginPath();ctx.arc(p[p.length-2]*cs,p[p.length-1]*cs,cs*.9,0,7);ctx.fill()}}
    }
    for(const p of boss.puddles){
      ctx.fillStyle=`rgba(76,29,149,${.35+.25*Math.abs(Math.sin(tm/200))})`;
      for(const n of p.cells)if(grid[n]===0)ctx.fillRect((n%W)*cs,((n/W)|0)*cs,cs,cs);
      ctx.strokeStyle='#c4b5fd';ctx.lineWidth=Math.max(1.5,cs*.4);ctx.beginPath();ctx.arc((p.x+.5)*cs,(p.y+.5)*cs,cs*3.6,-Math.PI/2,-Math.PI/2+p.t/5*6.283);ctx.stroke();
    }
  },
  draw(e,cs,tm,frz){
    const x=e.x*cs,y=e.y*cs,r=e.r*cs,hurt=e.hurt>0&&Math.floor(tm/60)%2;
    if(bImg('ahtapot',x,y,r*3,Math.sin(tm/500)*.06,frz,hurt))return;
    ctx.save();
    const col=hurt?'#fff':frz?'#7dd3fc':'#7c3aed';
    ctx.strokeStyle=col;ctx.lineCap='round';ctx.lineWidth=r*.32;
    for(let i=0;i<8;i++){const a=Math.PI*.15+i/7*Math.PI*.7,w=Math.sin(tm/250+i)*.35;
      ctx.beginPath();ctx.moveTo(x+Math.cos(a)*r*.6,y+Math.sin(a)*r*.4);ctx.quadraticCurveTo(x+Math.cos(a+w)*r*1.3,y+Math.sin(a+w)*r*1.3,x+Math.cos(a-w*.5)*r*1.6,y+Math.sin(a-w*.5)*r*1.7);ctx.stroke()}
    const g=ctx.createRadialGradient(x-r*.3,y-r*.5,0,x,y-r*.2,r*1.1);g.addColorStop(0,frz?'#e0f2fe':'#c4b5fd');g.addColorStop(1,col);
    ctx.fillStyle=hurt?'#fff':g;ctx.beginPath();ctx.ellipse(x,y-r*.25,r*.95,r*1.05,0,0,7);ctx.fill();
    bEyes(x,y-r*.1,r*.9,e,'#1e1b4b',.33,.2);
    ctx.restore();
  }
});

/* ---------- 27: Hücre ---------- */
BOSSES.push({id:'hucre',icon:'🦠',
  setup(bs){const e=spawnBoss(W/2,H*.4,3.0,bs*.75,'hucre');e.divT=4;boss.hp=boss.maxHp=1;boss.killed=0},
  ai(dt){
    const cells=enemies.filter(e=>e.boss);
    for(const e of cells){
      wander(e,dt);
      e.divT=(e.divT||5)-dt*(boss.rage||1);
      if(e.divT<=0){e.divT=Math.max(4.5,7-boss.tier*.8)+R()*2;
        if(cells.length<6&&reachRatio(e,12)>.55){ // yer varsa bölün
          const a=R()*6.283,n=spawnBoss(e.x+Math.cos(a)*e.r*1.2,e.y+Math.sin(a)*e.r*1.2,e.r,e.base,'hucre');
          if(hitsClaimed(n.x,n.y,n.r))relocate(n);n.divT=e.divT+1;n.vx=Math.cos(a)*n.base;n.vy=Math.sin(a)*n.base;e.vx=-n.vx;e.vy=-n.vy;
          burst(e.x,e.y,'#86efac',14);tone(700,.12,'sine',.03,300);
        }
      }
    }
  },
  seeds(){return []}, // tek alan kalır: hücreleri ayrı adalara bölüp oyuncuyu bir cebe hapsetmesin; kapatılan hücreler ölür
  postCapture(){
    const cells=enemies.filter(e=>e.boss),dead=cells.filter(e=>grid[cellAt(e.x,e.y)]===1||reachRatio(e,10)<.3); // bölünecek yeri kalmayan hücre ölür
    if(!dead.length)return;
    if(dead.length===cells.length){popText(t('pop.cellDie'),dead[0].x,dead[0].y-4,'#86efac',1.6);killBoss(false);return}
    for(const e of dead){burst(e.x,e.y,'#86efac',26);popText(t('pop.cellDie'),e.x,e.y-4,'#86efac',1.2);boss.killed++}
    enemies=enemies.filter(e=>!dead.includes(e));sfx.hit&&sfx.hit();buzz(40);
  },
  bar(){return Math.max(0,1-enemies.filter(e=>e.boss).length/6)},
  hint(){return t('hb.cells',{n:enemies.filter(e=>e.boss).length})},
  draw(e,cs,tm,frz){
    const x=e.x*cs,y=e.y*cs,r=e.r*cs,hurt=e.hurt>0&&Math.floor(tm/60)%2;
    const ready=e.divT<1.2;
    if(bImg('hucre',x,y,r*(ready?3.2+Math.sin(tm/60)*.15:3),tm/1500+e.x,frz,hurt))return;
    ctx.save();
    ctx.fillStyle=frz?'rgba(186,230,253,.55)':'rgba(134,239,172,.45)';ctx.strokeStyle=frz?'#7dd3fc':'#22c55e';ctx.lineWidth=Math.max(1.5,cs*.35);
    ctx.beginPath();for(let i=0;i<=24;i++){const a=i/24*6.283,w=1+Math.sin(a*3+tm/300+e.x)*.06+(ready?Math.cos(a*2)*.15:0);i?ctx.lineTo(x+Math.cos(a)*r*w,y+Math.sin(a)*r*w):ctx.moveTo(x+Math.cos(a)*r*w,y+Math.sin(a)*r*w)}
    ctx.closePath();ctx.fill();ctx.stroke();
    ctx.fillStyle=hurt?'#fff':frz?'#0369a1':'#15803d';ctx.beginPath();ctx.arc(x+r*.15,y+r*.1,r*.38,0,7);ctx.fill();
    bEyes(x,y-r*.3,r*.8,e,'#052e16',.3,.18);
    ctx.restore();
  }
});

Object.assign(MINION_DRAW,{
  miknatis(e,x,y,r,tm,frz){ // somun
    ctx.fillStyle=frz?'#bae6fd':'#94a3b8';ctx.beginPath();for(let i=0;i<6;i++){const a=i/6*6.283+e.ang*.3;ctx.lineTo(x+Math.cos(a)*r,y+Math.sin(a)*r)}ctx.closePath();ctx.fill();
    ctx.strokeStyle='#334155';ctx.lineWidth=Math.max(1,r*.15);ctx.stroke();ctx.fillStyle='#1e293b';ctx.beginPath();ctx.arc(x,y,r*.35,0,7);ctx.fill();
    mEyes(x,y-r*.45,r*.7,'#0f172a',.4,.2);
  },
  ahtapot(e,x,y,r,tm,frz){ // mürekkep damlası
    ctx.fillStyle=frz?'#bae6fd':'#6d28d9';ctx.beginPath();ctx.moveTo(x,y-r*1.25);ctx.quadraticCurveTo(x+r*1.05,y+r*.1,x,y+r);ctx.quadraticCurveTo(x-r*1.05,y+r*.1,x,y-r*1.25);ctx.fill();
    mEyes(x,y+r*.2,r*.8,'#f5f3ff',.35,.2);
  },
  hucre(e,x,y,r,tm,frz){ // amip
    ctx.fillStyle=frz?'#bae6fd':'#4ade80';ctx.beginPath();for(let i=0;i<=16;i++){const a=i/16*6.283,w=1+Math.sin(a*4+tm/200+e.x)*.12;i?ctx.lineTo(x+Math.cos(a)*r*w,y+Math.sin(a)*r*w):ctx.moveTo(x+Math.cos(a)*r*w,y+Math.sin(a)*r*w)}ctx.fill();
    mEyes(x,y,r*.85,'#052e16',.35,.22);
  },
});
Object.assign(ATTACK,{ahtapot:{type:'spread',every:4.6,n:3,spread:.3,sp:15,r:.8,b:1,color:'#7c3aed'}});

/* ---------- Final bölümleri: her 6 bölümde bir, iki boss birlikte ---------- */
const FINALS=[{at:6,a:'ejder',b:'golem'},{at:12,a:'zirh',b:'isin'},{at:18,a:'orumcek',b:'kartopu'},{at:24,a:'zar',b:'goz'}];
const isFinal=lv=>lv>1000&&lv<=1000+FINALS.length;
const finalOf=lv=>FINALS[lv-1001];
const bossIdx=id=>BOSSES.findIndex(b=>b.id===id)+1;
const isDaily=lv=>lv===2000;
function levelLabel(lv){lv=lv||level;return isFinal(lv)?'F'+(lv-1000):isDaily(lv)?'★':lv}
function nextAfter(lv){
  if(isFinal(lv))return finalOf(lv).at+1;
  const k=FINALS.findIndex(f=>f.at===lv);return k>=0?1001+k:lv+1;
}
// misafir boss: yenilmez, kendi yolunda dolaşır, kendi silahıyla ateş eder
function spawnGuest(F){
  const kind=Object.keys(SPRITE).find(k=>SPRITE[k].k===F.b)||F.b,pe=bossEnt();
  const p=freeSpotFar(3.2,pe?pe.x:W/2,pe?pe.y:H/2,30);
  const g=mkEnemy(p.x,p.y,3.0,boss.bs*.8,true);g.kind=kind;g.guest=F.b;enemies.push(g);
  boss.guestAtk=3.5;
}
function guestAttack(dt){
  if(!boss||boss.dead||boss.guestAtk==null)return;
  const g=enemies.find(e=>e.guest);if(!g)return;
  const a=ATTACK[g.guest]||{type:'shot',every:4,sp:16,r:.8,b:1,color:'#fca5a5'};
  boss.guestAtk-=dt*(player.drawing?1.6:1)*(boss.rage||1);if(boss.guestAtk>0)return;
  boss.guestAtk=a.every*1.25*DIFF().atk*(.85+R()*.3);
  const ang=Math.atan2(player.y+.5-g.y,player.x+.5-g.x);
  if(a.type==='beam'){beams.push({e:g,ang,t:0,color:a.color});tone(320,.25,'sawtooth',.03,260);return}
  if(shots.length>8)return;
  const n=a.type==='spread'?a.n:1,sp=a.sp+boss.tier*2.5;
  for(let i=0;i<n;i++){const an=ang+(n>1?(i-(n-1)/2)*a.spread:0);shots.push({x:g.x+Math.cos(an)*(g.r+1),y:g.y+Math.sin(an)*(g.r+1),vx:Math.cos(an)*sp,vy:Math.sin(an)*sp,r:a.r,b:a.b,life:8,color:a.color})}
  sfx.shoot();
}

/* ---------- Günlük meydan okuma (cihazda; tarih tohumlu) ---------- */
function todayKey(){const d=new Date();return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0')}
function dayHash(k){let h=2166136261;for(const c of k){h^=c.charCodeAt(0);h=Math.imul(h,16777619)}return h>>>0}
function dailyDef(){return BOSSES[dayHash(todayKey())%BOSSES.length]}
function dailyInfo(){const d=SAVE.daily||{};return {played:d.date===todayKey(),best:d.date===todayKey()?d.best||0:0,streak:d.streak||0,top:d.top||0}}
function recordDaily(sc){
  const k=todayKey(),d=SAVE.daily||{};
  if(d.date!==k){const y=new Date();y.setDate(y.getDate()-1);
    const yk=y.getFullYear()+'-'+String(y.getMonth()+1).padStart(2,'0')+'-'+String(y.getDate()).padStart(2,'0');
    d.streak=d.date===yk?(d.streak||0)+1:1;d.date=k;d.best=0}
  const nb=sc>(d.best||0);d.best=Math.max(d.best||0,sc);d.top=Math.max(d.top||0,sc);SAVE.daily=d;persist();return nb;
}
