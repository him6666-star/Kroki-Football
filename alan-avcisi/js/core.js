'use strict';
/* =========================================================
   Oyun çekirdeği: ızgara, oyuncu, fitil, yakalama, düşman
   hareketi, kutular, çizim. Boss'a özel her şey bosses.js'de
   "kanca" (hook) fonksiyonları ile yapılır.
   ========================================================= */
const W=90,H=120,GOAL=80,FUSE_SPEED=70,FUSE_SPEED_SLOW=40;
// Zorluk ayarı
const DIFFS={easy:{sp:.75,boss:.8,nSmall:.6,hunt:0,atk:2.2,rage:.35,fuse:.7,shield:1.6},normal:{sp:.9,boss:.92,nSmall:.85,hunt:.7,atk:1.4,rage:.7,fuse:.85,shield:1.25},hard:{sp:1,boss:1,nSmall:1,hunt:1,atk:1,rage:1,fuse:1,shield:1}};
const DIFF=()=>DIFFS[SAVE.settings.diff]||DIFFS.normal;
const idx=(x,y)=>y*W+x;
const R=Math.random;
const clamp01=v=>Math.max(0,Math.min(1,v));

const grid=new Uint8Array(W*H);      // 0 boş, 1 alınmış, 2 iz
const border=new Uint8Array(W*H);
const trailIdx=new Int32Array(W*H);  // iz hücresinin iz dizisindeki sırası
const cv=document.getElementById('cv'),ctx=cv.getContext('2d');
const oc=document.createElement('canvas');oc.width=W;oc.height=H;
const octx=oc.getContext('2d'),img=octx.createImageData(W,H),pix=img.data;
let dirty=true;

let state='menu',level=1,lives=10,score=0,initialClaimed=0,pctNow=0,levelDeaths=0,lastStars=0;
// titreşim (ayarlardan kapatılabilir)
function buzz(p){
  if(SAVE.settings.vib===false)return;
  try{
    const H=window.Capacitor&&Capacitor.Plugins&&Capacitor.Plugins.Haptics;
    if(H){ // Android uygulaması: Capacitor titreşim eklentisi
      const seq=Array.isArray(p)?p:[p];let t0=0;
      seq.forEach((d,i)=>{if(i%2===0)setTimeout(()=>H.vibrate({duration:d}).catch(()=>{}),t0);t0+=d});
    }else if(navigator.vibrate)navigator.vibrate(p);
  }catch(e){}
}
let player={x:W>>1,y:H-1,drawing:false,trail:[],sx:0,sy:0,acc:0};
let enemies=[],sparks=[],powerups=[],parts=[],pops=[],shots=[],beams=[];
let effects={speed:0,freeze:0,shield:0};
let puTimer=6,dyingT=0,flash=0,pic=null,cpx=4,clock=0,fuse=null;
let boss=null,clearTimer=0,edgeShield=0,edgeMax=0,edgeBeep=0;

const PU={
  S:{c:'#ffd640',l:'»'},F:{c:'#5af0ff',l:'❄'},K:{c:'#4ade80',l:'◈'},L:{c:'#ff5fa2',l:'♥'},P:{c:'#f97316',l:'✸'}
};

/* ---------- Izgara ---------- */
function setPix(i,r,g,b,a){const k=i*4;pix[k]=r;pix[k+1]=g;pix[k+2]=b;pix[k+3]=a}
function paintCell(i){
  const v=grid[i];
  if(v===2)setPix(i,255,214,64,255);
  else if(v===1){border[i]?setPix(i,90,240,255,255):setPix(i,0,0,0,0)}
  else{const x=i%W,y=(i/W)|0;((x>>2)+(y>>2))&1?setPix(i,15,18,42,255):setPix(i,10,12,31,255)}
  dirty=true;
}
function rebuildOverlay(){for(let i=0;i<W*H;i++)paintCell(i)}
function computeBorder(){
  for(let y=0;y<H;y++)for(let x=0;x<W;x++){
    const i=y*W+x;let b=0;
    if(grid[i]===1){
      for(let dy=-1;dy<=1&&!b;dy++)for(let dx=-1;dx<=1;dx++){
        const nx=x+dx,ny=y+dy;if(nx<0||ny<0||nx>=W||ny>=H)continue;
        if(grid[ny*W+nx]!==1){b=1;break}
      }
    }
    border[i]=b;
  }
}
function resetBoard(){
  grid.fill(0);
  for(let x=0;x<W;x++){grid[idx(x,0)]=1;grid[idx(x,H-1)]=1}
  for(let y=0;y<H;y++){grid[idx(0,y)]=1;grid[idx(W-1,y)]=1}
  initialClaimed=2*W+2*H-4;
  computeBorder();rebuildOverlay();
}
function nearestBorder(x,y){
  if(border[idx(x,y)])return[x,y];
  const seen=new Uint8Array(W*H),q=[idx(x,y)];seen[q[0]]=1;
  for(let h=0;h<q.length;h++){
    const i=q[h],cx=i%W,cy=(i/W)|0;
    if(border[i])return[cx,cy];
    for(const[dx,dy]of[[1,0],[-1,0],[0,1],[0,-1]]){
      const nx=cx+dx,ny=cy+dy;if(nx<0||ny<0||nx>=W||ny>=H)continue;
      const n=ny*W+nx;if(!seen[n]){seen[n]=1;q.push(n)}
    }
  }
  return[x,y];
}
function claimedPct(){let c=0;for(let i=0;i<W*H;i++)if(grid[i]===1)c++;return Math.max(0,(c-initialClaimed)/(W*H-initialClaimed)*100)}
function countUnclaimed(){let c=0;for(let i=0;i<W*H;i++)if(grid[i]===0)c++;return c}
const cellAt=(x,y)=>idx(Math.min(W-1,Math.max(0,Math.floor(x))),Math.min(H-1,Math.max(0,Math.floor(y))));
function flood(s,mark){
  const q=[s];mark[s]=1;let n=1;
  for(let h=0;h<q.length;h++){
    const i=q[h],x=i%W,y=(i/W)|0;
    if(x>0){const k=i-1;if(!mark[k]&&grid[k]===0){mark[k]=1;q.push(k);n++}}
    if(x<W-1){const k=i+1;if(!mark[k]&&grid[k]===0){mark[k]=1;q.push(k);n++}}
    if(y>0){const k=i-W;if(!mark[k]&&grid[k]===0){mark[k]=1;q.push(k);n++}}
    if(y<H-1){const k=i+W;if(!mark[k]&&grid[k]===0){mark[k]=1;q.push(k);n++}}
  }
  return n;
}
function keepLargest(mark){
  const seen=new Uint8Array(W*H);let best=-1,bestN=-1;
  for(let i=0;i<W*H;i++)if(grid[i]===0&&!seen[i]){const n=flood(i,seen);if(n>bestN){bestN=n;best=i}}
  if(best>=0)flood(best,mark);
}
function findFreeCell(x,y,r){
  const cx=Math.floor(x),cy=Math.floor(y);
  for(let rad=0;rad<=Math.ceil(r)+3;rad++)
    for(let dy=-rad;dy<=rad;dy++)for(let dx=-rad;dx<=rad;dx++){
      const nx=cx+dx,ny=cy+dy;if(nx<0||ny<0||nx>=W||ny>=H)continue;
      if(grid[idx(nx,ny)]===0)return idx(nx,ny);
    }
  return -1;
}
function hitsClaimed(cx,cy,r){
  const x0=Math.floor(cx-r),x1=Math.floor(cx+r),y0=Math.floor(cy-r),y1=Math.floor(cy+r);
  for(let y=y0;y<=y1;y++)for(let x=x0;x<=x1;x++){
    if(x<0||y<0||x>=W||y>=H)return true;
    if(grid[y*W+x]===1)return true;
  }
  return false;
}
/* İzin dokunulan hücresinin sırasını döndürür (-1: dokunmuyor) */
function trailHit(cx,cy,r){
  let best=-1;
  const x0=Math.max(0,Math.floor(cx-r)),x1=Math.min(W-1,Math.floor(cx+r)),y0=Math.max(0,Math.floor(cy-r)),y1=Math.min(H-1,Math.floor(cy+r));
  for(let y=y0;y<=y1;y++)for(let x=x0;x<=x1;x++){
    const i=y*W+x;if(grid[i]!==2)continue;
    const dx=x+.5-cx,dy=y+.5-cy;if(dx*dx+dy*dy<(r+.25)*(r+.25)&&trailIdx[i]>best)best=trailIdx[i];
  }
  return best;
}
const hitsTrail=(x,y,r)=>trailHit(x,y,r)>=0;
function reachRatio(e,RAD){ // çember içinde, boş hücrelerden yürüyerek ulaşılabilen oran
  const cx=Math.floor(e.x),cy=Math.floor(e.y),R2=RAD*RAD;let tt=0;
  for(let dy=-RAD;dy<=RAD;dy++)for(let dx=-RAD;dx<=RAD;dx++){if(dx*dx+dy*dy>R2)continue;const x=cx+dx,y=cy+dy;if(x>=0&&y>=0&&x<W&&y<H)tt++}
  const s=findFreeCell(e.x,e.y,e.r);if(s<0||!tt)return 0;
  const seen=new Set([s]),q=[s];let f=0;
  while(q.length){const c=q.pop();f++;const x=c%W,y=(c/W)|0;
    for(const[ax,ay]of[[1,0],[-1,0],[0,1],[0,-1]]){const nx=x+ax,ny=y+ay;if(nx<0||ny<0||nx>=W||ny>=H)continue;
      const ddx=nx-cx,ddy=ny-cy;if(ddx*ddx+ddy*ddy>R2)continue;const n=ny*W+nx;if(seen.has(n)||grid[n]===1)continue;seen.add(n);q.push(n)}}
  return f/tt;
}
function confinement(){
  let c=0;for(const e of enemies)if(e.boss&&!e.harmless)c=Math.max(c,1-reachRatio(e,18));
  return c;
}
function freeRatio(e,RAD){
  let f=0,tt=0;const R2=RAD*RAD,cx=Math.floor(e.x),cy=Math.floor(e.y);
  for(let dy=-RAD;dy<=RAD;dy++)for(let dx=-RAD;dx<=RAD;dx++){
    if(dx*dx+dy*dy>R2)continue;
    const x=cx+dx,y=cy+dy;if(x<0||y<0||x>=W||y>=H)continue;tt++;
    if(grid[y*W+x]!==1)f++;
  }
  return tt?f/tt:1;
}
function findFreeSpot(r,test,tries=250){
  for(let k=0;k<tries;k++){
    const x=3+R()*(W-6),y=3+R()*(H-6);
    if(hitsClaimed(x,y,r)||hitsTrail(x,y,r+1))continue;
    if(test&&!test(x,y))continue;
    return{x,y};
  }
  return null;
}
/* Boss bölgeleri dışında kalan her yeri doldur (aşama geçişleri için) */
function fillOutsideSeeds(){
  const mark=new Uint8Array(W*H);
  const seeds=boss.def.seeds?boss.def.seeds():enemies.filter(e=>e.boss);
  for(const e of seeds){const s=findFreeCell(e.x,e.y,e.r);if(s>=0&&!mark[s])flood(s,mark)}
  let added=0;for(let i=0;i<W*H;i++)if(grid[i]===0&&!mark[i]){grid[i]=1;added++}
  if(added){computeBorder();rebuildOverlay();pctNow=claimedPct();
    enemies=enemies.filter(e=>e.boss||grid[cellAt(e.x,e.y)]!==1);
    const nb=nearestBorder(player.x,player.y);player.x=nb[0];player.y=nb[1];
    for(const s of sparks){const b=nearestBorder(s.x,s.y);s.x=b[0];s.y=b[1];s.px=-1;s.py=-1}}
  return added;
}

/* ---------- Varlıklar ---------- */
function mkEnemy(x,y,r,sp,isBoss){
  let a;do{a=R()*Math.PI*2}while(Math.abs(Math.cos(a))<.3||Math.abs(Math.sin(a))<.3);
  return{x,y,r,sp,base:sp,vx:Math.cos(a)*sp,vy:Math.sin(a)*sp,boss:!!isBoss,ang:0,turn:2+R()*2,hue:R()*40,hurt:0};
}
function spawnBoss(x,y,r,sp,kind){const e=mkEnemy(x,y,r,sp,true);e.kind=kind;enemies.push(e);return e}
function bossEnt(){return enemies.find(e=>e.boss)||null}
function setSpeed(e,sp){const v=Math.hypot(e.vx,e.vy);if(v<1e-6){const a=R()*6.283;e.vx=Math.cos(a)*sp;e.vy=Math.sin(a)*sp;return}e.vx=e.vx/v*sp;e.vy=e.vy/v*sp}
function aimAt(e,tx,ty,sp){const dx=tx-e.x,dy=ty-e.y,d=Math.hypot(dx,dy)||1;e.vx=dx/d*sp;e.vy=dy/d*sp}
function rot(e,a){
  const c=Math.cos(a),s=Math.sin(a),vx=e.vx*c-e.vy*s,vy=e.vx*s+e.vy*c;e.vx=vx;e.vy=vy;
  const sp=Math.hypot(e.vx,e.vy);if(sp<1e-6)return;
  if(Math.abs(e.vx)<sp*.25)e.vx=Math.sign(e.vx||1)*sp*.3;
  if(Math.abs(e.vy)<sp*.25)e.vy=Math.sign(e.vy||1)*sp*.3;
  const n=Math.hypot(e.vx,e.vy);e.vx=e.vx/n*sp;e.vy=e.vy/n*sp;
}
function wander(e,dt,amt=1.4){e.turn-=dt;if(e.turn<=0){e.turn=1.5+R()*2.5;rot(e,(R()-.5)*amt)}}
function moveEnt(e,dt){
  const sp=Math.hypot(e.vx,e.vy)*dt,n=Math.max(1,Math.ceil(sp/.4)),h=dt/n;
  for(let s=0;s<n;s++){
    const free=e.stuck&&hitsClaimed(e.x,e.y,e.r);
    const nx=e.x+e.vx*h;
    if(!free&&hitsClaimed(nx,e.y,e.r)){e.vx=-e.vx;rot(e,(R()-.5)*.25);e.bounced=(e.bounced||0)+1}else e.x=nx;
    const ny=e.y+e.vy*h;
    if(!free&&hitsClaimed(e.x,ny,e.r)){e.vy=-e.vy;rot(e,(R()-.5)*.25);e.bounced=(e.bounced||0)+1}else e.y=ny;
    if(e.stuck&&!hitsClaimed(e.x,e.y,e.r))e.stuck=false;
  }
}
function relocate(e){
  for(let rad=1;rad<=20;rad++)for(let k=0;k<16;k++){
    const a=k/16*Math.PI*2,nx=e.x+Math.cos(a)*rad,ny=e.y+Math.sin(a)*rad;
    if(!hitsClaimed(nx,ny,e.r)&&!hitsTrail(nx,ny,e.r)){e.x=nx;e.y=ny;return}
  }
  e.stuck=true;
}

/* ---------- Bölüm ---------- */
const levelIn=()=>(level-1)%BOSSES.length+1;
const levelTier=()=>Math.floor((level-1)/BOSSES.length);
function bossForLevel(lv){return BOSSES[(lv-1)%BOSSES.length]}

function startLevel(){
  levelDeaths=0;
  clearTimeout(clearTimer);
  resetBoard();
  player={x:W>>1,y:H-1,drawing:false,trail:[],sx:0,sy:0,acc:0};
  enemies=[];parts=[];pops=[];powerups=[];sparks=[];shots=[];beams=[];fuse=null;
  const def=bossForLevel(level),tier=levelTier(),li=levelIn();
  const D=DIFF(),bs=Math.min(9+li*.9+tier*3,24)*D.boss;
  boss={def,hp:1,maxHp:1,tier,dead:false,timer:2.5,bs};
  def.setup(bs,tier);
  const nSmall=def.smalls!==undefined?def.smalls:Math.max(1,Math.round(Math.min(1+Math.floor(li/3)+tier,6)*D.nSmall));
  const ss=Math.min(14+li*1.1+tier*3,30)*D.sp;
  for(let k=0;k<nSmall;k++){
    const p=findFreeSpot(1.2,(x,y)=>y<H*.75&&!enemies.some(e=>e.boss&&Math.hypot(e.x-x,e.y-y)<e.r+6));
    if(p)enemies.push(mkEnemy(p.x,p.y,1.1,ss,false));
  }
  const nSp=tier>=1?1:0;
  for(let k=0;k<nSp;k++)sparks.push({x:Math.floor(W*(k+1)/(nSp+1)),y:0,px:-1,py:-1,dir:[k%2?1:-1,0],acc:0});
  effects={speed:0,freeze:0,shield:1.5};
  edgeMax=Math.round(Math.max(150,240-(li-1)*4-tier*20)*D.shield);edgeShield=edgeMax;edgeBeep=0;
  puTimer=5+R()*3;
  pic=genPicture(level);
  pctNow=0;state='intro';
  updateHud();bossHud(true);fxHud();
  if(typeof onLevelStart==='function')onLevelStart();
}

/* ---------- Oyuncu ---------- */
const DIRS={U:[0,-1],D:[0,1],L:[-1,0],R:[1,0]};
// Kenardayken yön seçimi: parmak açıkça içeriyi göstermiyorsa kenarda kal (köşe dönüşleri kolay),
// içeriyi net gösteriyorsa beklemeden çık.
const LEAVE_DOT=.94; // ~20 derece
const LEAVE_DELAY=.12; // kenardan çıkmadan önce bekleme (sn)
function pickDir(dir){
  const p=player,v=(typeof joyVec!=='undefined'&&joyVec&&joyDir===dir)?joyVec:{x:DIRS[dir][0],y:DIRS[dir][1]};
  if(p.drawing||!border[idx(p.x,p.y)])return DIRS[dir];
  const c=[];
  for(const k in DIRS){const d=DIRS[k],dot=d[0]*v.x+d[1]*v.y;if(dot<=.15)continue;
    const nx=p.x+d[0],ny=p.y+d[1];if(nx<0||ny<0||nx>=W||ny>=H)continue;
    const n=idx(nx,ny),g=grid[n];const kind=g===0?'leave':(g===1&&border[n])?'stay':null;
    if(kind)c.push({k,d,dot,kind})}
  if(!c.length)return DIRS[dir];
  c.sort((a,b)=>b.dot-a.dot);
  const best=c[0];
  if(best.kind==='stay'||best.dot>=LEAVE_DOT)return best.d;
  const stays=c.filter(o=>o.kind==='stay');
  if(stays.length){const keep=stays.find(o=>o.k===p.lastK);return (keep||stays[0]).d}
  return best.dot>=.6?best.d:null;
}
function tryMove(d){
  if(!d)return false;
  const p=player,nx=p.x+d[0],ny=p.y+d[1];
  for(const k in DIRS)if(DIRS[k]===d)p.lastK=k;
  if(nx<0||ny<0||nx>=W||ny>=H)return false;
  const n=idx(nx,ny),c=grid[n];
  if(c===2)return false;
  if(c===0){
    if(!p.drawing){p.drawing=true;p.sx=p.x;p.sy=p.y;p.trail=[];fuse=null;sfx.start()}
    grid[n]=2;trailIdx[n]=p.trail.length;p.trail.push(n);paintCell(n);p.x=nx;p.y=ny;
    return true;
  }
  if(p.drawing){p.x=nx;p.y=ny;capture();return true}
  if(border[n]||!border[idx(p.x,p.y)]){p.x=nx;p.y=ny;return true}
  return false;
}

/* ---------- Yakalama ---------- */
function capture(){
  const p=player,def=boss.def,trailCells=p.trail.slice();
  const cx={trailCells,trapped:[],trappedShots:[],separated:false,added:0,
    trailDist(e){let m=1e9;for(const n of trailCells){const dx=n%W+.5-e.x,dy=((n/W)|0)+.5-e.y,d=dx*dx+dy*dy;if(d<m)m=d}return Math.sqrt(m)}};
  if(def.preCapture)def.preCapture(cx);
  for(const n of trailCells)grid[n]=1;
  let added=trailCells.length;
  fuse=null;
  const mark=new Uint8Array(W*H);
  const seeds=def.seeds?def.seeds():enemies.filter(e=>e.boss);
  if(seeds.length){
    seeds.forEach((e,k)=>{const s=findFreeCell(e.x,e.y,e.r);if(s<0)return;if(k>0&&!mark[s])cx.separated=true;if(!mark[s])flood(s,mark)});
  }else keepLargest(mark);
  for(let i=0;i<W*H;i++)if(grid[i]===0&&!mark[i]){grid[i]=1;added++}
  cx.added=added;
  p.trail=[];p.drawing=false;
  computeBorder();rebuildOverlay();
  addScore(Math.round(added*10*(1+added/1500)),p.x+.5,p.y+.5);
  sfx.capture();buzz(18);
  pctNow=claimedPct();
  enemies=enemies.filter(e=>{
    if(e.boss)return true;
    if(grid[cellAt(e.x,e.y)]===1){burst(e.x,e.y,e.color||'#ff7a45',20);addScore(500,e.x,e.y);sfx.kill();cx.trapped.push(e);return false}
    return true;
  });
  shots=shots.filter(s=>{
    if(grid[cellAt(s.x,s.y)]===1){burst(s.x,s.y,s.color||'#ff9f1c',16);addScore(300,s.x,s.y);cx.trappedShots.push(s);return false}
    return true;
  });
  cx.activated=[];
  powerups=powerups.filter(u=>{if(grid[idx(u.x,u.y)]===1){activate(u);cx.activated.push(u);return false}return true});
  if(def.postCapture)def.postCapture(cx);
  if(state!=='play')return;
  for(const e of enemies)if(hitsClaimed(e.x,e.y,e.r))relocate(e);
  const nb=nearestBorder(p.x,p.y);p.x=nb[0];p.y=nb[1];
  for(const s of sparks){const b=nearestBorder(s.x,s.y);s.x=b[0];s.y=b[1];s.px=-1;s.py=-1}
  updateHud();
  if(pctNow>=GOAL)levelClear(false,false);
}

/* ---------- Kutular ---------- */
function spawnPU(){
  const types=['S','S','F','F','K','K','L','P','P'];
  for(let tries=0;tries<60;tries++){
    const x=3+Math.floor(R()*(W-6)),y=3+Math.floor(R()*(H-6));
    let ok=true;
    for(let dy=-2;dy<=2&&ok;dy++)for(let dx=-2;dx<=2;dx++)if(grid[idx(x+dx,y+dy)]!==0){ok=false;break}
    if(!ok)continue;
    if(enemies.some(e=>e.boss&&Math.hypot(e.x-x,e.y-y)<e.r+6))continue;
    powerups.push({x,y,t:types[Math.floor(R()*types.length)],life:16});return;
  }
}
function activate(u){
  sfx.pu();burst(u.x+.5,u.y+.5,PU[u.t].c,18);
  popText(t('pop.'+u.t),u.x,u.y,PU[u.t].c);
  if(u.t==='L')lives=Math.min(lives+1,15);
  if(u.t==='S')effects.speed=8;
  if(u.t==='F')effects.freeze=5;
  if(u.t==='K'){effects.shield=7;edgeShield=Math.min(edgeMax,edgeShield+45)}
  if(u.t==='P')purge();
  addScore(250,u.x,u.y,true);
}
/* Temizlik: tüm küçük düşmanları ve mermileri yok eder */
function purge(){
  for(const e of enemies)if(!e.boss){burst(e.x,e.y,'#f97316',16);addScore(200,e.x,e.y,true)}
  for(const s of shots)burst(s.x,s.y,'#f97316',8);
  enemies=enemies.filter(e=>e.boss);shots=[];beams=[];
  flash=Math.max(flash,.25);
  if(boss.def.onPurge)boss.def.onPurge();
}

/* ---------- Tehlike, fitil, ölüm ---------- */
function hazard(x,y,r){
  const dx=player.x+.5-x,dy=player.y+.5-y;
  if(!player.drawing){ // çizgideyken: kalkan süresi bitince düşman sana çarpabilir
    if(edgeShield>0)return false;
    if(dx*dx+dy*dy<(r+.6)*(r+.6)){killPlayer();return true}
    return false;
  }
  if(dx*dx+dy*dy<(r+.6)*(r+.6)){killPlayer();return true}
  const i=trailHit(x,y,r);if(i>=0)ignite(i);
  return false;
}
function ignite(i){
  if(effects.shield>0||!player.drawing)return;
  if(!fuse){fuse={i,p:i};sfx.fuse()}
  else if(i>fuse.i){fuse.i=i;fuse.p=Math.max(fuse.p,i)}
}
function updateFuse(dt){
  if(!fuse||!player.drawing){fuse=null;return false}
  if(effects.shield>0){fuse=null;return false}
  fuse.i+=(effects.speed>0?FUSE_SPEED_SLOW:FUSE_SPEED*DIFF().fuse)*dt; // Hız kutusu varken fitil sana yetişemez
  const L=player.trail.length;
  while(fuse.p<Math.min(fuse.i,L)){const n=player.trail[Math.floor(fuse.p)];if(n!==undefined)setPix(n,255,70,40,255);dirty=true;fuse.p++}
  if(R()<dt*30){const n=player.trail[Math.min(L-1,Math.floor(fuse.i))];if(n!==undefined)parts.push({x:n%W+.5,y:((n/W)|0)+.5,vx:(R()-.5)*14,vy:(R()-.5)*14,life:.3,c:R()<.5?'#ffd640':'#ff7a1a'})}
  if(fuse.i>=L-.5){fuse=null;killPlayer();return true}
  return false;
}
function killPlayer(){
  if(effects.shield>0||state!=='play')return;
  const p=player;
  burst(p.x+.5,p.y+.5,'#ffffff',30);burst(p.x+.5,p.y+.5,'#ff5fa2',20);
  for(const n of p.trail){grid[n]=0;paintCell(n)}
  if(p.drawing){p.x=p.sx;p.y=p.sy}
  p.trail=[];p.drawing=false;p.acc=0;fuse=null;
  lives--;levelDeaths++;sfx.die();buzz([90,50,160]);flash=1;updateHud();
  edgeShield=Math.max(edgeShield,Math.min(edgeMax,75));edgeBeep=0;
  state='dying';dyingT=1.2;
}
function hurtBoss(n,x,y,label,col){
  if(!boss||boss.dead||state!=='play')return false;
  const e=bossEnt();
  boss.hp=Math.max(0,boss.hp-n);buzz(45);
  if(e)e.hurt=.6;
  const px=x!=null?x:(e?e.x:W/2),py=y!=null?y:(e?e.y-4:H/2);
  if(label)popText(label,px,py,col||'#f43f5e');
  sfx.hit();
  if(boss.hp<=0){killBoss(false);return true}
  return false;
}
function killBoss(secret){
  if(!boss||boss.dead||state!=='play')return;
  for(const e of enemies){
    if(e.boss){burst(e.x,e.y,'#ffffff',40);burst(e.x,e.y,'#e879f9',40);burst(e.x,e.y,'#ffd640',30)}
    else burst(e.x,e.y,'#ff7a45',10);
  }
  if(boss.def.onKill)boss.def.onKill();
  enemies=[];shots=[];beams=[];fuse=null;
  boss.dead=true;boss.secret=!!secret;boss.hp=0;
  sfx.bossDie();flash=.8;buzz(secret?[60,40,60,40,60,40,220]:[70,40,70,40,200]);
  if(secret){sfx.secret();popText(t('pop.secret'),W/2,H/2,'#fde047',2.2)}
  levelClear(true,!!secret);
}

/* ---------- Güncelle ---------- */
function update(dt){
  for(const pt of parts){pt.x+=pt.vx*dt;pt.y+=pt.vy*dt;pt.vx*=.96;pt.vy*=.96;pt.life-=dt}
  parts=parts.filter(p=>p.life>0);
  for(const q of pops){q.y-=dt*4;q.life-=dt}
  pops=pops.filter(q=>q.life>0);
  if(flash>0)flash=Math.max(0,flash-dt*1.5);
  for(const e of enemies)e.ang+=dt*(e.boss?1.4:3);

  if(state==='menu'){menuUpdate(dt);return}
  if(state==='dying'){
    dyingT-=dt;
    if(dyingT<=0){
      if(lives<=0)gameOver();
      else{state='play';effects.shield=2;const nb=nearestBorder(player.x,player.y);player.x=nb[0];player.y=nb[1]}
    }
    return;
  }
  if(state!=='play')return;

  for(const k in effects)effects[k]=Math.max(0,effects[k]-dt);
  if(edgeShield>0){
    const before=edgeShield;edgeShield=Math.max(0,edgeShield-dt);
    if(edgeShield<=10&&Math.ceil(edgeShield)!==Math.ceil(before)&&edgeShield>0)tone(980,.07,'square',.03);
    if(edgeShield===0){popText(t('pop.edgeOff'),W/2,H*.5,'#ff6b7d',2);sfx.hit();flash=Math.max(flash,.35)}
  }
  fxHud();

  // oyuncu
  const dir=joyDir||keyDir;
  const step=effects.speed>0?.018:.028;
  // kenardan içeri çıkmadan önce kısa bir duraklama (kazara çıkışı önler)
  let holdOff=false;
  if(dir&&!player.drawing){const d=pickDir(dir);
    if(d){const nx=player.x+d[0],ny=player.y+d[1];
      if(nx>=0&&ny>=0&&nx<W&&ny<H&&grid[idx(nx,ny)]===0){player.hold=(player.hold||0)+dt;if(player.hold<LEAVE_DELAY)holdOff=true}else player.hold=0}
    else player.hold=0}
  else if(!dir)player.hold=0;
  if(dir&&!holdOff){player.acc+=dt;let guard=0;while(player.acc>=step&&guard++<8){player.acc-=step;if(!tryMove(pickDir(dir))){player.acc=0;break}if(state!=='play')return}}
  else player.acc=0;
  if(player.drawing)player.hold=0;

  clock+=dt;
  const def=boss.def,frozen=effects.freeze>0;
  for(const e of enemies)if(e.hurt)e.hurt=Math.max(0,e.hurt-dt);
  if(!frozen){
    if(def.ai)def.ai(dt);
    if(state!=='play')return;
    bossAttack(dt);updateBeams(dt);
    const fr=clamp01(pctNow/GOAL),pRage=1+.85*DIFF().rage*fr*fr;
    // sıkışma öfkesi: boss'un etrafında duvara takılmadan ulaşabildiği alan daraldıkça
    boss.confT=(boss.confT||0)-dt;
    if(boss.confT<=0){boss.confT=.2;boss.conf=confinement()}
    const cf=clamp01(((boss.conf||0)-.2)/.5),cRage=1+.9*DIFF().rage*Math.pow(cf,1.5);
    const want=Math.max(pRage,cRage),cur=boss.rage||1;
    const rage=want>cur?Math.min(want,cur+dt*1.5):Math.max(want,cur-dt*.4);boss.rage=rage;
    const rdt=dt*rage;
    if(!boss.rageLv)boss.rageLv=0;
    if(rage>=1.27&&boss.rageLv<1){boss.rageLv=1;tone(140,.4,'sawtooth',.05,-40)}
    if(rage>=1.56&&boss.rageLv<2){boss.rageLv=2;sfx.roar()}
    for(const e of enemies){
      if(def.move&&def.move(e,rdt))continue;
      if(!e.boss&&!e.noWander){if(player.drawing&&!e.harmless&&DIFF().hunt)hunt(e,dt);else{calm(e,dt);wander(e,dt,.3+(rage-1)*1.6)}}
      else if(rage>1.3&&R()<dt*(rage-1)*1.4&&Math.hypot(e.vx,e.vy)>.1)rot(e,(R()-.5)*1.3);
      moveEnt(e,rdt);
    }
    if(def.afterMove)def.afterMove(dt);
    if(state!=='play')return;
    for(const s of shots){
      const n=Math.max(1,Math.ceil(Math.hypot(s.vx,s.vy)*rdt/.4)),h=rdt/n;
      for(let k=0;k<n;k++){
        const nx=s.x+s.vx*h;if(hitsClaimed(nx,s.y,s.r)){s.vx=-s.vx;s.b--;s.bounced=(s.bounced||0)+1}else s.x=nx;
        const ny=s.y+s.vy*h;if(hitsClaimed(s.x,ny,s.r)){s.vy=-s.vy;s.b--;s.bounced=(s.bounced||0)+1}else s.y=ny;
      }
      s.life-=dt;
    }
    shots=shots.filter(s=>{if(s.b<0||s.life<=0){burst(s.x,s.y,s.color||'#ff9f1c',6);return false}return true});
  }
  if(def.always)def.always(dt);
  if(state!=='play')return;

  // çarpışmalar
  for(const e of enemies){if(e.harmless)continue;if(hazard(e.x,e.y,e.r))return}
  for(const s of shots)if(hazard(s.x,s.y,s.r))return;
  if(!frozen&&beamHazards())return;
  if(def.hazards&&def.hazards())return;
  if(state!=='play')return;

  // kıvılcımlar
  if(!frozen){
    const sInt=.1;
    for(const s of sparks){s.acc+=dt;while(s.acc>=sInt){s.acc-=sInt;sparkStep(s)}}
  }
  for(const s of sparks)if(Math.abs(s.x-player.x)<=1&&Math.abs(s.y-player.y)<=1){killPlayer();return}

  if(updateFuse(dt))return;

  puTimer-=dt;
  if(puTimer<=0){puTimer=7+R()*5;if(powerups.length<2)spawnPU()}
  for(const u of powerups)u.life-=dt;
  powerups=powerups.filter(u=>u.life>0);
  bossHud();
}
function sparkStep(s){
  const d=s.dir,o=[d,[d[1],-d[0]],[-d[1],d[0]],[-d[0],-d[1]]];
  if(R()<.5){const q=o[1];o[1]=o[2];o[2]=q}
  for(let k=0;k<4;k++){
    const dd=o[k],nx=s.x+dd[0],ny=s.y+dd[1];
    if(nx<0||ny<0||nx>=W||ny>=H)continue;
    const n=idx(nx,ny);if(grid[n]!==1||!border[n])continue;
    if(k<3&&nx===s.px&&ny===s.py)continue;
    s.px=s.x;s.py=s.y;s.x=nx;s.y=ny;s.dir=dd;return;
  }
}

/* ---------- Puan / efekt ---------- */
function addScore(v,x,y,silent){score+=v;if(!silent&&v>0)popText('+'+v,x,y,'#fff');updateHud()}
function popText(tx,x,y,c,life){pops.push({t:tx,x,y,c,life:life||1.2})}
function burst(x,y,c,n){for(let i=0;i<n;i++){const a=R()*7,s=4+R()*16;parts.push({x,y,vx:Math.cos(a)*s,vy:Math.sin(a)*s,life:.5+R()*.6,c})}}

/* ---------- Bölüm sonu ---------- */
function levelClear(bossKilled,secret){
  state='clear';if(!bossKilled)sfx.clear();
  let bonus=bossKilled?5000+levelIn()*1500+Math.round(pctNow*30):Math.round((pctNow-GOAL)*400)+levelIn()*1000;
  if(secret)bonus*=2;
  score+=bonus;recordScore(score);
  lastStars=1+(levelDeaths===0?1:0)+(bossKilled?1:0);
  recordClear(level,{boss:bossKilled,secret,score,stars:lastStars});
  updateHud();bossHud(true);
  if(bossKilled)popText(t('pop.defeated',{name:t('boss.'+boss.def.id+'.name')}),W/2,H*.35,'#f0abfc',1.8);
  clearTimeout(clearTimer);
  clearTimer=setTimeout(()=>{if(state==='clear')onLevelClear(bossKilled,secret,bonus)},bossKilled?1800:1400);
}
function gameOver(){state='over';recordScore(score);onGameOver()}

/* ---------- Çizim ---------- */
function rr(x,y,w,h,r){ctx.beginPath();ctx.moveTo(x+r,y);ctx.arcTo(x+w,y,x+w,y+h,r);ctx.arcTo(x+w,y+h,x,y+h,r);ctx.arcTo(x,y+h,x,y,r);ctx.arcTo(x,y,x+w,y,r);ctx.closePath()}
function drawSmall(e,cs,frz){
  const x=e.x*cs,y=e.y*cs,r=e.r*cs;
  const g=ctx.createRadialGradient(x-r*.3,y-r*.3,0,x,y,r*1.2);
  g.addColorStop(0,'#fff');g.addColorStop(.35,frz?'#7dd3fc':`hsl(${15+e.hue},100%,60%)`);g.addColorStop(1,frz?'#0369a1':`hsl(${350+e.hue},90%,35%)`);
  ctx.fillStyle=g;ctx.beginPath();ctx.arc(x,y,r,0,7);ctx.fill();
  ctx.strokeStyle=frz?'#bae6fd':'#ffb38a';ctx.lineWidth=Math.max(1,cs*.3);
  ctx.beginPath();ctx.arc(x,y,r*1.35,e.ang,e.ang+1.6);ctx.stroke();
  ctx.beginPath();ctx.arc(x,y,r*1.35,e.ang+3.14,e.ang+4.74);ctx.stroke();
}
/* Boss görselleri: tür → dosya, yön (face: görselin baktığı yön), ölçek */
const SPRITE={goz:{k:'goz'},golem:{k:'golem'},yilan:{k:'yilan',face:-1,s:2.7},kovan:{k:'kovan'},ikizA:{k:'ikizA'},ikizB:{k:'ikizB'},
  ejder:{k:'ejder',face:1},balcik:{k:'balcik'},zirh:{k:'zirh',face:1},isin:{k:'isin',spin:1},bomba:{k:'bomba'},kartopu:{k:'kartopu'},
  ayna:{k:'ayna'},spider:{k:'orumcek',face:-1},cham:{k:'bukalemun',face:1,tint:1},ghost:{k:'hayalet'},twister:{k:'hortum'},giant:{k:'dev'},star:{k:'yildiz'}};
const tintCache={};
function tinted(im,col){
  const key=im.src+'|'+col;if(tintCache[key])return tintCache[key];
  const c=document.createElement('canvas');c.width=im.width;c.height=im.height;const g=c.getContext('2d');
  g.drawImage(im,0,0);g.globalCompositeOperation='multiply';g.fillStyle=col;g.fillRect(0,0,c.width,c.height);
  g.globalCompositeOperation='destination-in';g.drawImage(im,0,0);return tintCache[key]=c;
}
function glowUnder(x,y,r,col,a){const g=ctx.createRadialGradient(x,y,r*.2,x,y,r);g.addColorStop(0,col);g.addColorStop(1,'rgba(0,0,0,0)');ctx.globalAlpha=a;ctx.fillStyle=g;ctx.beginPath();ctx.arc(x,y,r,0,7);ctx.fill();ctx.globalAlpha=1}
/* Göz: görseldeki irisi kırpıp oyuncuya doğru kaydırır */
const EYE={cx:.418,cy:.491,r:.295};
function drawEyeTrack(e,src,S){
  const icx=(EYE.cx-.5)*S,icy=(EYE.cy-.5)*S,ir=EYE.r*S;
  const dx=player.x+.5-e.x,dy=player.y+.5-e.y,d=Math.hypot(dx,dy)||1,k=Math.min(1,d/12);
  const ox=dx/d*S*.12*k,oy=dy/d*S*.12*k;
  const g=ctx.createRadialGradient(icx-ir*.3,icy-ir*.3,0,icx,icy,ir*1.1);
  g.addColorStop(0,'#ffffff');g.addColorStop(.7,'#fdeef8');g.addColorStop(1,'#f6c8e6');
  ctx.fillStyle=g;ctx.beginPath();ctx.arc(icx,icy,ir*1.03,0,7);ctx.fill();
  ctx.save();ctx.beginPath();ctx.arc(icx+ox,icy+oy,ir,0,7);ctx.clip();
  ctx.drawImage(src,-S/2+ox,-S/2+oy,S,S);ctx.restore();
  drawLids(S,e.lid||0);
}
/* Göz kapakları: p=0 açık, p=1 kapalı. Göz dairesine kırpılır. */
function drawLids(S,p){
  if(p<=.01)return;
  const R=S*.47,yU=-R+p*R*1.02,yL=R-p*R*.98,bulge=R*.28;
  ctx.save();ctx.beginPath();ctx.arc(0,0,R*.995,0,7);ctx.clip();
  let g=ctx.createLinearGradient(0,-R,0,yU+bulge);g.addColorStop(0,'#ffc2e2');g.addColorStop(.75,'#f58ac0');g.addColorStop(1,'#d9468f');
  ctx.fillStyle=g;ctx.beginPath();ctx.moveTo(-R,-R-2);ctx.lineTo(R,-R-2);ctx.lineTo(R,yU);ctx.quadraticCurveTo(0,yU+bulge*2,-R,yU);ctx.closePath();ctx.fill();
  g=ctx.createLinearGradient(0,R,0,yL-bulge);g.addColorStop(0,'#ffc2e2');g.addColorStop(.8,'#f58ac0');g.addColorStop(1,'#d9468f');
  ctx.fillStyle=g;ctx.beginPath();ctx.moveTo(-R,R+2);ctx.lineTo(R,R+2);ctx.lineTo(R,yL);ctx.quadraticCurveTo(0,yL-bulge*.8,-R,yL);ctx.closePath();ctx.fill();
  ctx.strokeStyle='#5b0f37';ctx.lineCap='round';ctx.lineWidth=Math.max(1.5,S*.03);
  ctx.beginPath();ctx.moveTo(-R,yU);ctx.quadraticCurveTo(0,yU+bulge*2,R,yU);ctx.stroke();
  if(p>.85){ctx.lineWidth=Math.max(1,S*.022);
    for(let i=-3;i<=3;i++){const t=(i+3)/6,x=-R*.75+t*R*1.5,y=yU+bulge*2*(1-Math.pow(2*t-1,2))*.5;ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x+i*S*.012,y+S*.07);ctx.stroke()}}
  ctx.restore();
}
function drawSprite(e,cs,tm,frz){
  const meta=SPRITE[e.kind];if(!meta)return false;
  const im=ASSET.boss[meta.k];if(!im)return false;
  let x=e.x*cs,y=e.y*cs;
  const shake=e.state==='warn'||(e.kind==='giant'&&e.awake>0);
  if(shake){x+=(R()-.5)*cs*1.2;y+=(R()-.5)*cs*1.2}
  if(e.kind==='ghost')y+=Math.sin(tm/250)*cs*.6;
  const S=e.r*cs*(meta.s||2.5),hurt=e.hurt>0&&Math.floor(tm/60)%2;
  // durum parıltıları
  if(e.kind==='zirh'&&e.open)glowUnder(x,y,S*.8,'rgba(244,63,94,.9)',.55+.25*Math.sin(tm/90));
  if(e.kind==='golem'&&e.state==='dash')glowUnder(x,y,S*.8,'rgba(244,63,94,.9)',.6);
  if(e.kind==='ejder'&&e.charging)glowUnder(x,y,S*.75,'rgba(255,140,0,.9)',.5+.3*Math.sin(tm/50));
  if(e.kind==='giant'&&e.awake>0)glowUnder(x,y,S*.8,'rgba(244,63,94,.9)',.5);
  ctx.save();ctx.translate(x,y);
  if(meta.spin)ctx.rotate(e.ang*.5);else if(e.kind!=='goz')ctx.rotate(Math.sin(tm/400+e.x)*.06);
  if(meta.face){const want=e.vx>=0?1:-1;if(want!==meta.face)ctx.scale(-1,1)}
  ctx.globalAlpha=e.alpha!=null?Math.max(e.alpha,hurt?1:0):1;
  let src=im;
  if(meta.tint&&boss&&boss.def.id==='bukalemun'){const flick=boss.timer<1&&Math.floor(tm/90)%2;src=tinted(im,ORB_COL[flick?boss.next:boss.col])}
  ctx.drawImage(src,-S/2,-S/2,S,S);
  if(e.kind==='goz')drawEyeTrack(e,src,S);
  if(frz){ctx.globalAlpha=.55;ctx.drawImage(tinted(im,'#7dd3fc'),-S/2,-S/2,S,S)}
  if(e.kind==='giant'&&e.awake>0){ctx.globalAlpha=.45;ctx.drawImage(tinted(im,'#ff5a5a'),-S/2,-S/2,S,S)}
  if(hurt){ctx.globalCompositeOperation='lighter';ctx.globalAlpha=.55;ctx.drawImage(im,-S/2,-S/2,S,S)}
  ctx.restore();
  return true;
}
function draw(tm){
  const cs=cpx,cw=cv.width,ch=cv.height;
  ctx.setTransform(1,0,0,1,0,0);
  ctx.imageSmoothingEnabled=false;
  if(pic)ctx.drawImage(pic,0,0);
  if(state!=='clear'){
    if(dirty){octx.putImageData(img,0,0);dirty=false}
    ctx.drawImage(oc,0,0,cw,ch);
  }
  ctx.imageSmoothingEnabled=true;
  const frz=effects.freeze>0,def=boss&&boss.def;
  if(def&&def.drawUnder&&!boss.dead)def.drawUnder(cs,tm,frz);

  // kutular
  for(const u of powerups){
    if(u.life<3&&Math.floor(u.life*6)%2)continue;
    const x=(u.x+.5)*cs,y=(u.y+.5)*cs,s=cs*3.2,pu=PU[u.t];
    const bob=Math.sin(tm/220+u.x)*cs*.35;
    glowUnder(x,y+bob,s*1.15,pu.c,.45+.2*Math.sin(tm/150));
    const g=ctx.createLinearGradient(0,y-s/2+bob,0,y+s/2+bob);g.addColorStop(0,'#ffffff');g.addColorStop(.25,pu.c);g.addColorStop(1,pu.c);
    ctx.fillStyle='rgba(0,0,0,.35)';rr(x-s/2,y-s/2+bob+cs*.4,s,s,cs*.9);ctx.fill();
    ctx.fillStyle=g;rr(x-s/2,y-s/2+bob,s,s,cs*.9);ctx.fill();
    ctx.strokeStyle='rgba(255,255,255,.85)';ctx.lineWidth=Math.max(1,cs*.3);ctx.stroke();
    ctx.fillStyle='#14123a';ctx.font=`900 ${Math.round(s*.66)}px system-ui`;ctx.textAlign='center';ctx.textBaseline='middle';
    ctx.fillText(pu.l,x,y+bob+cs*.1);
  }
  // düşmanlar
  const rg=boss&&boss.rage||1;
  if(rg>1.2&&state!=='menu')for(const e of enemies)glowUnder(e.x*cs,e.y*cs,e.r*cs*2.3,'rgba(255,40,70,.95)',Math.min(.75,(rg-1.2)*1.3)*(.65+.35*Math.sin(tm/(rg>1.5?70:130)+e.x)));
  for(const e of enemies){
    if(e.kind&&drawSprite(e,cs,tm,frz))continue;
    if(def&&def.draw&&e.kind&&def.draw(e,cs,tm,frz)!==false)continue;
    if(!e.kind&&drawMinion(e,cs,tm,frz))continue;
    drawSmall(e,cs,frz);
  }
  // mermiler
  for(const s of shots){
    const x=s.x*cs,y=s.y*cs,r=s.r*cs*(1+.15*Math.sin(tm/50)),c=s.color||'#ffb020';
    const g=ctx.createRadialGradient(x,y,0,x,y,r*2);
    g.addColorStop(0,'#fff');g.addColorStop(.35,frz?'#7dd3fc':c);g.addColorStop(1,'rgba(0,0,0,0)');
    ctx.fillStyle=g;ctx.beginPath();ctx.arc(x,y,r*2,0,7);ctx.fill();
  }
  drawBeams(cs,tm,frz);
  if(def&&def.drawOver&&!boss.dead)def.drawOver(cs,tm,frz);

  // kıvılcımlar
  for(const s of sparks){
    const x=(s.x+.5)*cs,y=(s.y+.5)*cs,r=cs*(1.3+.4*Math.sin(tm/60+s.x));
    ctx.fillStyle=frz?'#bae6fd':'#fff6a0';ctx.beginPath();
    for(let i=0;i<8;i++){const a=i/8*Math.PI*2+tm/120,rad=i%2?r*.45:r*1.3;ctx.lineTo(x+Math.cos(a)*rad,y+Math.sin(a)*rad)}
    ctx.closePath();ctx.fill();
    ctx.fillStyle='#ff9f1c';ctx.beginPath();ctx.arc(x,y,r*.4,0,7);ctx.fill();
  }
  // fitil ucu
  if(fuse&&player.drawing){
    const n=player.trail[Math.min(player.trail.length-1,Math.floor(fuse.i))];
    if(n!==undefined){const x=(n%W+.5)*cs,y=(((n/W)|0)+.5)*cs,r=cs*(1.6+.5*Math.sin(tm/30));
      const g=ctx.createRadialGradient(x,y,0,x,y,r*2);g.addColorStop(0,'#fff');g.addColorStop(.3,'#ffd640');g.addColorStop(1,'rgba(255,90,0,0)');
      ctx.fillStyle=g;ctx.beginPath();ctx.arc(x,y,r*2,0,7);ctx.fill()}
  }
  // oyuncu
  if(state!=='menu'&&(state!=='dying')){
    const p=player,x=(p.x+.5)*cs,y=(p.y+.5)*cs,s=cs*2.7,col=p.drawing?'#ffd640':'#ff5fa2';
    // belirginlik: koyu taban + beyaz halka + kenardayken radar dalgası
    ctx.fillStyle='rgba(8,10,40,.55)';ctx.beginPath();ctx.arc(x,y,cs*3.7,0,7);ctx.fill();
    if(!p.drawing){const ph=(tm/900)%1;ctx.globalAlpha=1-ph;ctx.strokeStyle=col;ctx.lineWidth=Math.max(1.5,cs*.45);
      ctx.beginPath();ctx.arc(x,y,cs*(3.9+ph*4),0,7);ctx.stroke();ctx.globalAlpha=1}
    ctx.strokeStyle='#fff';ctx.lineWidth=Math.max(1.5,cs*.4);ctx.beginPath();ctx.arc(x,y,cs*3.7,0,7);ctx.stroke();
    if(!p.drawing&&p.hold>0){ctx.strokeStyle='#ffd640';ctx.lineWidth=Math.max(2,cs*.7);ctx.beginPath();ctx.arc(x,y,cs*3.7,-Math.PI/2,-Math.PI/2+Math.min(1,p.hold/LEAVE_DELAY)*6.283);ctx.stroke()}
    ctx.strokeStyle=col;ctx.lineWidth=Math.max(1,cs*.25);ctx.beginPath();ctx.arc(x,y,cs*4.2,0,7);ctx.stroke();
    if(ASSET.ui.ship){
      glowUnder(x,y,cs*5,p.drawing?'rgba(255,214,64,.9)':'rgba(255,95,162,.9)',.55);
      const S2=cs*6.6;ctx.drawImage(ASSET.ui.ship,x-S2/2,y-S2/2,S2,S2);
    }else{
    ctx.save();ctx.translate(x,y);ctx.rotate(Math.PI/4);
    ctx.shadowColor=p.drawing?'#ffd640':'#ff5fa2';ctx.shadowBlur=cs*2.5;
    ctx.fillStyle='#fff';ctx.fillRect(-s/2,-s/2,s,s);
    ctx.shadowBlur=0;ctx.fillStyle=p.drawing?'#ffd640':'#ff5fa2';ctx.fillRect(-s/4,-s/4,s/2,s/2);
    ctx.restore();}
    if(effects.shield>0&&(effects.shield>1.5||Math.floor(tm/90)%2)){
      ctx.strokeStyle='#4ade80';ctx.lineWidth=Math.max(1.5,cs*.4);
      ctx.beginPath();ctx.arc(x,y,cs*4.8,0,7);ctx.stroke();
    }
  }
  // parçacıklar + yazılar
  for(const p of parts){ctx.globalAlpha=Math.min(1,p.life*2);ctx.fillStyle=p.c;ctx.fillRect(p.x*cs-cs*.4,p.y*cs-cs*.4,cs*.8,cs*.8)}
  ctx.globalAlpha=1;ctx.textAlign='center';ctx.textBaseline='middle';
  for(const p of pops){
    ctx.globalAlpha=Math.min(1,p.life*1.5);ctx.font=`800 ${Math.round(cs*3.6)}px 'Baloo 2',system-ui`;
    ctx.lineWidth=cs*.8;ctx.strokeStyle='#000a';ctx.strokeText(p.t,p.x*cs,p.y*cs);
    ctx.fillStyle=p.c;ctx.fillText(p.t,p.x*cs,p.y*cs);
  }
  ctx.globalAlpha=1;
  if(flash>0){ctx.fillStyle=`rgba(255,40,90,${flash*.35})`;ctx.fillRect(0,0,cw,ch)}
}
