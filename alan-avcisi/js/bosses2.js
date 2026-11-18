'use strict';
/* =========================================================
   19–24. bölümler: yeni bosslar
   ========================================================= */

/* ---------- ortak çizim yardımcıları ---------- */
function bEyes(x,y,r,e,col,spread=.3,size=.17){eyes(x,y,r,e,col,spread,size)}
function glowCircle(x,y,r,col,a){const g=ctx.createRadialGradient(x,y,0,x,y,r);g.addColorStop(0,col);g.addColorStop(1,'rgba(0,0,0,0)');ctx.globalAlpha=a;ctx.fillStyle=g;ctx.beginPath();ctx.arc(x,y,r,0,7);ctx.fill();ctx.globalAlpha=1}

/* ---------- 19: Kara At ---------- */
const KN=[[2,1],[1,2],[-1,2],[-2,1],[-2,-1],[-1,-2],[1,-2],[2,-1]],KS=8;
function knMoves(x,y,r,useTrail){
  return KN.map(([a,b])=>({x:x+a*KS,y:y+b*KS})).filter(p=>p.x>r+1&&p.y>r+1&&p.x<W-r-1&&p.y<H-r-1&&!hitsClaimed(p.x,p.y,r)&&!(useTrail&&hitsTrail(p.x,p.y,r+.5)));
}
function drawKnightPiece(x,y,s,frz,hurt,e){
  ctx.save();ctx.translate(x,y);
  ctx.shadowColor=frz?'#7dd3fc':'#a78bfa';ctx.shadowBlur=s*.6;
  const g=ctx.createLinearGradient(-s,-s,s,s);g.addColorStop(0,frz?'#bae6fd':'#6d28d9');g.addColorStop(1,frz?'#0c4a6e':'#1e1033');
  ctx.fillStyle=hurt?'#fff':g;ctx.strokeStyle=frz?'#e0f2fe':'#c4b5fd';ctx.lineWidth=Math.max(1,s*.09);
  // kaide
  ctx.beginPath();ctx.ellipse(0,s*.82,s*.85,s*.22,0,0,7);ctx.fill();ctx.stroke();
  // at başı silueti
  ctx.beginPath();
  ctx.moveTo(-s*.55,s*.75);ctx.lineTo(-s*.45,s*.15);ctx.quadraticCurveTo(-s*.75,-s*.25,-s*.35,-s*.65);
  ctx.lineTo(-s*.2,-s*1.0);ctx.lineTo(-s*.02,-s*.72);ctx.quadraticCurveTo(s*.45,-s*.8,s*.78,-s*.2);
  ctx.lineTo(s*.62,s*.05);ctx.lineTo(s*.2,-s*.1);ctx.quadraticCurveTo(s*.45,s*.35,s*.55,s*.75);ctx.closePath();
  ctx.fill();ctx.shadowBlur=0;ctx.stroke();
  // yele
  ctx.strokeStyle=frz?'#e0f2fe':'#e879f9';ctx.lineWidth=Math.max(1,s*.12);ctx.beginPath();
  ctx.moveTo(-s*.32,-s*.6);ctx.quadraticCurveTo(-s*.7,-s*.1,-s*.5,s*.4);ctx.stroke();
  // göz
  ctx.fillStyle='#fde047';ctx.shadowColor='#fde047';ctx.shadowBlur=s*.4;ctx.beginPath();ctx.ellipse(s*.12,-s*.45,s*.1,s*.07,-.4,0,7);ctx.fill();
  ctx.restore();
}
BOSSES.push({id:'at',icon:'♞',
  setup(bs){const e=spawnBoss(W/2,H*.42,3.0,0,'at');e.vx=e.vy=0;e.z=0;boss.hp=boss.maxHp=3;boss.hop=null;boss.timer=1.8;boss.moves=8},
  move(e){return e.boss},
  seeds(){const e=bossEnt();if(!e)return[];const h=boss.hop;return[h?{x:h.tx,y:h.ty,r:e.r}:e]},
  ai(dt){
    const e=bossEnt();if(!e)return;
    if(boss.shock)boss.shock.t-=dt;
    const h=boss.hop;
    if(h){
      h.t+=dt/h.dur;const k=Math.min(1,h.t);
      e.x=h.sx+(h.tx-h.sx)*k;e.y=h.sy+(h.ty-h.sy)*k;e.z=Math.sin(k*Math.PI);e.harmless=k<.85;
      if(h.t>=1){boss.hop=null;e.z=0;e.harmless=false;boss.shock={x:e.x,y:e.y,t:.22};burst(e.x,e.y,'#a78bfa',22);tone(110,.18,'square',.06,-40);
        boss.timer=Math.max(.75,1.7-boss.tier*.25)*(.8+R()*.4)}
      return;
    }
    boss.timer-=dt*(boss.rage||1);
    if(boss.timer<=0){
      const mv=knMoves(e.x,e.y,e.r,true);if(!mv.length){boss.timer=.3;return}
      const px=player.x+.5,py=player.y+.5;
      const pick=R()<.5?mv.reduce((a,b)=>Math.hypot(b.x-px,b.y-py)<Math.hypot(a.x-px,a.y-py)?b:a):mv[Math.floor(R()*mv.length)];
      boss.hop={sx:e.x,sy:e.y,tx:pick.x,ty:pick.y,t:0,dur:Math.max(.42,.62-boss.tier*.06)};tone(520,.1,'triangle',.04,220);
    }
  },
  always(){const e=bossEnt();if(!e)return;const h=boss.hop;boss.moves=knMoves(h?h.tx:e.x,h?h.ty:e.y,e.r,false).length},
  hazards(){const s=boss.shock;return !!(s&&s.t>0&&hazard(s.x,s.y,4.2))},
  postCapture(cx){
    const e=bossEnt();if(!e)return;const h=boss.hop,x=h?h.tx:e.x,y=h?h.ty:e.y;
    const n=knMoves(x,y,e.r,false).length;boss.moves=n;
    if(n===0){popText(t('pop.mate'),x,y-6,'#fde047',1.8);killBoss(false);return}
    if(n<=2&&cx.trailDist({x,y})<22){burst(x,y,'#e879f9',30);hurtBoss(1,x,y-5,t('pop.check'),'#e879f9')}
  },
  bar(){return boss.hp/boss.maxHp},
  hint(){return t('hb.moves',{n:boss.moves,a:boss.hp,b:boss.maxHp})},
  drawUnder(cs,tm,frz){
    const e=bossEnt();if(!e)return;const h=boss.hop,x=h?h.tx:e.x,y=h?h.ty:e.y;
    // olası hamleler: küçük satranç noktaları
    for(const p of knMoves(x,y,e.r,false)){ctx.fillStyle='rgba(196,181,253,.35)';ctx.beginPath();ctx.arc(p.x*cs,p.y*cs,cs*.9,0,7);ctx.fill()}
    if(h){ctx.strokeStyle='rgba(244,63,94,.8)';ctx.lineWidth=Math.max(1,cs*.35);ctx.beginPath();ctx.arc(h.tx*cs,h.ty*cs,e.r*cs*(1.3-.3*h.t),0,7);ctx.stroke()}
    const s=boss.shock;if(s&&s.t>0){ctx.strokeStyle=`rgba(232,121,249,${s.t/.22})`;ctx.lineWidth=cs*.8;ctx.beginPath();ctx.arc(s.x*cs,s.y*cs,cs*4.2*(1.2-s.t*2),0,7);ctx.stroke()}
    // gölge
    ctx.fillStyle='rgba(0,0,0,.35)';ctx.beginPath();ctx.ellipse(e.x*cs,(e.y+e.r*.8)*cs,e.r*cs*(1-.4*(e.z||0)),e.r*cs*.35*(1-.4*(e.z||0)),0,0,7);ctx.fill();
  },
  draw(e,cs,tm,frz){drawKnightPiece(e.x*cs,(e.y-(e.z||0)*5)*cs,e.r*cs*1.25,frz,e.hurt>0&&Math.floor(tm/60)%2,e)}
});

/* ---------- 20: Saat Ustası ---------- */
// 0: serbest, 1: sadece dış çerçeve engelliyor, 2: oyuncunun doldurduğu alan engelliyor
function handBlock(e,ang,len){
  const c=Math.cos(ang),s=Math.sin(ang);let r=0;
  for(let d=e.r*.8;d<=len*.7;d+=.7){const x=e.x+c*d,y=e.y+s*d;
    if(x<1||y<1||x>=W-1||y>=H-1){r=Math.max(r,1);continue}
    if(hitsClaimed(x,y,.2))return 2}
  return r;
}
function handFree(e,ang,len){return handBlock(e,ang,len)===0}
function handLen(e,h){
  const c=Math.cos(h.ang),s=Math.sin(h.ang);
  for(let d=e.r*.8;d<=h.len;d+=.5)if(hitsClaimed(e.x+c*d,e.y+s*d,.2))return d;
  return h.len;
}
BOSSES.push({id:'saat',icon:'🕰',
  setup(bs){const e=spawnBoss(W/2,H*.42,3.2,bs*.5,'saat');boss.hp=boss.maxHp=2;
    boss.hands=[{len:20,ang:-Math.PI/2,sp:.95,dir:1,jam:0,alive:true,w:.9},{len:12,ang:Math.PI/6,sp:1.6,dir:-1,jam:0,alive:true,w:1.3}];
    boss.gongT=12+R()*4;boss.gong=0;boss.cut=0},
  ai(dt){
    const e=bossEnt();if(!e)return;
    boss.gongT-=dt;
    if(boss.gong>0){
      boss.gong-=dt;e.vx*=.85;e.vy*=.85;
      if(boss.gong<=0){setSpeed(e,e.base);boss.gongT=13+R()*5}
      return;
    }
    if(boss.gongT<=0){boss.gong=1.9;for(const h of boss.hands)h.ang=-Math.PI/2;tone(196,1.3,'sine',.09);tone(392,1.1,'sine',.04,0,.05);popText(t('pop.dong'),e.x,e.y-e.r-3,'#fde047',1.2);return}
    wander(e,dt);
    const k=dt*(boss.rage||1)*(1+boss.tier*.15);
    for(const h of boss.hands){
      if(!h.alive)continue;
      const da=h.sp*k*h.dir;
      if(handFree(e,h.ang+da,h.len)){h.ang+=da;h.jam=Math.max(0,h.jam-dt*2)}
      else if(handFree(e,h.ang-da*2,h.len)){h.dir*=-1;h.ang-=da;tone(1200,.04,'square',.02);
        // duvardan uzaklaş
        e.vx-=Math.cos(h.ang)*e.base*.5;e.vy-=Math.sin(h.ang)*e.base*.5;setSpeed(e,e.base);h.jam=Math.max(0,h.jam-dt)}
      else if(handBlock(e,h.ang+da,h.len)<2||handBlock(e,h.ang-da*2,h.len)<2){ // sadece kenar çerçevesi: kırılmaz, uzaklaşır
        e.vx-=Math.cos(h.ang)*e.base;e.vy-=Math.sin(h.ang)*e.base;setSpeed(e,e.base);h.jam=Math.max(0,h.jam-dt)}
      else{
        h.jam+=dt;
        if(h.jam>=1.3){
          h.alive=false;const L=handLen(e,h);burst(e.x+Math.cos(h.ang)*L*.6,e.y+Math.sin(h.ang)*L*.6,'#fde047',30);
          if(hurtBoss(1,null,null,t('pop.jam'),'#fde047'))return;
        }
      }
    }
  },
  always(){if(!player.drawing)boss.cut=0;
    if(boss.gong>0&&player.drawing){const e=bossEnt(),h=boss.hands[0];if(e&&h.alive){const L=handLen(e,h);
      for(let d=e.r;d<=L;d+=.6)if(hitsTrail(e.x+Math.cos(h.ang)*d,e.y+Math.sin(h.ang)*d,.4)){if(!boss.cut){boss.cut=1;tone(1568,.2,'sine',.05)}break}}}},
  hazards(){
    if(boss.gong>0)return false;
    const e=bossEnt();if(!e)return false;
    for(const h of boss.hands){if(!h.alive)continue;const L=handLen(e,h),c=Math.cos(h.ang),s=Math.sin(h.ang);
      for(let d=e.r;d<=L;d+=.8)if(hazard(e.x+c*d,e.y+s*d,.45))return true}
    return false;
  },
  postCapture(){if(boss.cut){killBoss(true)}},
  hint(){return t('hb.hands',{n:boss.hands.filter(h=>h.alive).length})},
  draw(e,cs,tm,frz){
    const x=e.x*cs,y=e.y*cs,r=e.r*cs,hurt=e.hurt>0&&Math.floor(tm/60)%2,gong=boss.gong>0;
    if(gong)glowCircle(x,y,r*3,'rgba(253,224,71,.9)',.5+.3*Math.sin(tm/80));
    // kollar
    ctx.save();ctx.lineCap='round';
    for(const h of boss.hands){if(!h.alive)continue;const L=handLen(e,h)*cs,c=Math.cos(h.ang),s=Math.sin(h.ang);
      const col=frz?'#7dd3fc':gong?'#fde047':h.jam>0?'#f43f5e':'#f8fafc';
      ctx.shadowColor=col;ctx.shadowBlur=cs*1.5;ctx.strokeStyle='#0f172a';ctx.lineWidth=cs*h.w+cs*.5;
      ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x+c*L,y+s*L);ctx.stroke();
      ctx.strokeStyle=col;ctx.lineWidth=cs*h.w;ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x+c*L,y+s*L);ctx.stroke();
      ctx.fillStyle=col;ctx.beginPath();ctx.moveTo(x+c*L+c*cs*1.2,y+s*L+s*cs*1.2);ctx.lineTo(x+c*L-s*cs*.9,y+s*L+c*cs*.9);ctx.lineTo(x+c*L+s*cs*.9,y+s*L-c*cs*.9);ctx.closePath();ctx.fill()}
    ctx.restore();
    // kadran
    ctx.save();ctx.shadowColor=frz?'#7dd3fc':'#f59e0b';ctx.shadowBlur=cs*2;
    ctx.fillStyle=hurt?'#fff':'#b45309';ctx.beginPath();ctx.arc(x,y,r*1.12,0,7);ctx.fill();ctx.shadowBlur=0;
    const g=ctx.createRadialGradient(x-r*.3,y-r*.3,0,x,y,r);g.addColorStop(0,'#fffbeb');g.addColorStop(1,frz?'#bae6fd':'#fde68a');
    ctx.fillStyle=g;ctx.beginPath();ctx.arc(x,y,r*.95,0,7);ctx.fill();
    ctx.strokeStyle='#78350f';ctx.lineWidth=Math.max(1,cs*.25);
    for(let i=0;i<12;i++){const a=i/12*6.283;ctx.beginPath();ctx.moveTo(x+Math.cos(a)*r*.72,y+Math.sin(a)*r*.72);ctx.lineTo(x+Math.cos(a)*r*.88,y+Math.sin(a)*r*.88);ctx.stroke()}
    bEyes(x,y+r*.1,r,e,'#78350f',.3,.16);
    ctx.fillStyle='#78350f';ctx.beginPath();ctx.arc(x,y+r*.45,r*.1,0,7);ctx.fill();
    ctx.restore();
  }
});

/* ---------- 21: Kara Bulut ---------- */
BOSSES.push({id:'bulut',icon:'⛈',
  setup(bs){const e=spawnBoss(W/2,H*.22,3.8,bs*.6,'bulut');boss.hp=boss.maxHp=1;boss.maxW=30;boss.water=30;boss.rain=0;boss.rainT=2.5;boss.drops=[];boss.acc=0;boss.bolt=null;boss.boltT=7},
  ai(dt){
    const e=bossEnt();if(!e)return;const rg=boss.rage||1;
    wander(e,dt,1.2);
    if(boss.rain>0&&player.drawing){e.vx+=Math.sign(player.x+.5-e.x)*dt*14;setSpeed(e,e.base)}
    boss.rainT-=dt;
    if(boss.rain>0){
      boss.rain-=dt;boss.acc+=dt*(8+boss.tier*3)*rg;
      while(boss.acc>=1){boss.acc-=1;boss.drops.push({x:e.x+(R()-.5)*e.r*2.2,y:e.y+e.r*.6,vy:22+R()*6+boss.tier*3})}
    }else{
      boss.water=Math.min(boss.maxW,boss.water+dt*.3);
      if(boss.rainT<=0){boss.rain=3.2;boss.rainT=3.2+3+R()*2;noise(.5,.03,2500)}
    }
    for(const d of boss.drops){
      d.y+=d.vy*dt;
      if(d.y>=H-.5||hitsClaimed(d.x,d.y,.15)){
        d.dead=1;const cx2=Math.floor(d.x),cy2=Math.floor(d.y);
        const inner=cx2>0&&cx2<W-1&&cy2>0&&cy2<H-1&&grid[cy2*W+cx2]===1;
        if(inner&&d.y-e.y<26){boss.water-=.5;parts.push({x:d.x,y:d.y,vx:(R()-.5)*8,vy:-4-R()*4,life:.35,c:'#7dd3fc'})}
      }
    }
    boss.drops=boss.drops.filter(d=>!d.dead);
    if(boss.water<=0){popText(t('pop.evap'),e.x,e.y-e.r-3,'#7dd3fc',1.8);killBoss(false);return}
    // yıldırım
    const b=boss.bolt;
    if(b){b.t+=dt;if(b.t>=.95)boss.bolt=null}
    else{boss.boltT-=dt*rg;if(boss.boltT<=0){boss.bolt={x:e.x,y:e.y+e.r,t:0};boss.boltT=6+R()*3-boss.tier*.6;tone(80,.6,'sawtooth',.03,30)}}
    if(b&&b.t>=.7&&!b.boomed){b.boomed=1;noise(.5,.1,700,'lowpass');flash=Math.max(flash,.25)}
  },
  hazards(){
    for(const d of boss.drops)if(hazard(d.x,d.y,.35))return true;
    const b=boss.bolt;
    if(b&&b.t>=.7){for(let y=b.y;y<H;y+=.6){if(hitsClaimed(b.x,y,.2))break;if(hazard(b.x,y,.7))return true}}
    return false;
  },
  onPurge(){boss.drops=[]},
  bar(){return clamp01(boss.water/boss.maxW)},
  hint(){return t('hb.water',{n:Math.ceil(boss.water)})},
  drawOver(cs,tm,frz){
    ctx.save();ctx.strokeStyle=frz?'#e0f2fe':'rgba(125,211,252,.9)';ctx.lineWidth=Math.max(1,cs*.3);ctx.lineCap='round';
    for(const d of boss.drops){ctx.beginPath();ctx.moveTo(d.x*cs,d.y*cs);ctx.lineTo(d.x*cs,(d.y-1.4)*cs);ctx.stroke()}
    const b=boss.bolt;
    if(b){
      let y1=b.y;while(y1<H&&!hitsClaimed(b.x,y1,.2))y1+=.6;
      if(b.t<.7){ctx.globalAlpha=.3+.4*Math.abs(Math.sin(tm/50));ctx.setLineDash([cs,cs]);ctx.strokeStyle='#fde047';ctx.lineWidth=Math.max(1,cs*.3);
        ctx.beginPath();ctx.moveTo(b.x*cs,b.y*cs);ctx.lineTo(b.x*cs,y1*cs);ctx.stroke();ctx.setLineDash([])}
      else{const k=1-(b.t-.7)/.25;ctx.globalAlpha=Math.max(0,k);ctx.shadowColor='#fde047';ctx.shadowBlur=cs*3;ctx.strokeStyle='#fffbeb';ctx.lineWidth=cs*1.1;
        ctx.beginPath();ctx.moveTo(b.x*cs,b.y*cs);for(let y=b.y;y<y1;y+=3)ctx.lineTo((b.x+(R()-.5)*2.2)*cs,y*cs);ctx.lineTo(b.x*cs,y1*cs);ctx.stroke()}
    }
    ctx.restore();
  },
  draw(e,cs,tm,frz){
    const x=e.x*cs,y=e.y*cs,r=e.r*cs,hurt=e.hurt>0&&Math.floor(tm/60)%2,w=clamp01(boss.water/boss.maxW);
    const b=boss.bolt,charge=b&&b.t<.7&&Math.floor(tm/70)%2;
    ctx.save();ctx.shadowColor=charge?'#fde047':frz?'#7dd3fc':'#64748b';ctx.shadowBlur=cs*2.5;
    const base=frz?'#bae6fd':`hsl(220,${15+w*20}%,${hurt?90:28+(1-w)*30}%)`;
    ctx.fillStyle=base;
    for(const[dx,dy,rr]of[[-.75,.15,.6],[.75,.15,.62],[-.3,-.35,.7],[.35,-.3,.66],[0,.25,.75]]){ctx.beginPath();ctx.arc(x+dx*r*1.15,y+dy*r,rr*r*1.05,0,7);ctx.fill()}
    ctx.shadowBlur=0;ctx.fillStyle='rgba(255,255,255,.12)';ctx.beginPath();ctx.arc(x-r*.35,y-r*.55,r*.38,0,7);ctx.fill();
    bEyes(x,y,r,e,'#1e293b',.3,.15);
    ctx.strokeStyle='#0f172a';ctx.lineWidth=Math.max(1,cs*.3);ctx.beginPath();ctx.moveTo(x-r*.55,y-r*.38);ctx.lineTo(x-r*.15,y-r*.25);ctx.moveTo(x+r*.55,y-r*.38);ctx.lineTo(x+r*.15,y-r*.25);ctx.stroke();
    ctx.restore();
  }
});

/* ---------- 22: Taklitçi ---------- */
function mimicTarget(){
  const px=player.x+.5,py=player.y+.5,m=boss.maxHp-boss.hp;
  return m===0?{x:W-px,y:py}:m===1?{x:px,y:H-py}:{x:W-px,y:H-py};
}
function deepClaimed(x,y){
  for(let dy=-2;dy<=2;dy++)for(let dx=-2;dx<=2;dx++){const cx=Math.floor(x)+dx,cy=Math.floor(y)+dy;if(cx<0||cy<0||cx>=W||cy>=H)continue;if(grid[cy*W+cx]!==1)return false}
  return true;
}
BOSSES.push({id:'taklit',icon:'🎭',
  setup(bs){const e=spawnBoss(W*.7,H*.3,3.0,Math.min(bs+5,26),'taklit');boss.hp=boss.maxHp=3;boss.stuck=0;boss.cool=2.5},
  move(e,dt){
    if(!e.boss)return false;
    const T=mimicTarget(),dx=T.x-e.x,dy=T.y-e.y,d=Math.hypot(dx,dy),sp=Math.min(e.base,d*3);
    if(d>.05){e.vx=dx/d*sp;e.vy=dy/d*sp}else{e.vx=0;e.vy=0}
    moveEnt(e,dt);return true;
  },
  ai(dt){
    const e=bossEnt();if(!e)return;
    boss.cool-=dt;const T=mimicTarget();
    if(boss.cool<=0&&deepClaimed(T.x,T.y)){
      boss.stuck+=dt;
      if(boss.stuck>=1.5){boss.stuck=0;boss.cool=3;burst(e.x,e.y,'#c4b5fd',30);
        if(hurtBoss(1,null,null,t('pop.fooled'),'#c4b5fd'))return;
        popText(t('pop.newMirror'),W/2,H*.45,'#e9d5ff',1.6);tone(660,.3,'sine',.04,-300)}
    }else boss.stuck=Math.max(0,boss.stuck-dt*2);
  },
  hint(){const m=boss.maxHp-boss.hp;return t('hb.mirror',{a:boss.hp,b:boss.maxHp,m:t('mir.'+m)})},
  drawUnder(cs,tm,frz){
    const m=boss.maxHp-boss.hp;
    ctx.save();ctx.setLineDash([cs*1.5,cs*1.5]);ctx.strokeStyle='rgba(233,213,255,.28)';ctx.lineWidth=Math.max(1,cs*.3);ctx.beginPath();
    if(m!==1){ctx.moveTo(W/2*cs,0);ctx.lineTo(W/2*cs,H*cs)}
    if(m!==0){ctx.moveTo(0,H/2*cs);ctx.lineTo(W*cs,H/2*cs)}
    ctx.stroke();ctx.setLineDash([]);
    const T=mimicTarget();ctx.strokeStyle=deepClaimed(T.x,T.y)?'rgba(250,204,21,.9)':'rgba(233,213,255,.5)';
    ctx.beginPath();ctx.arc(T.x*cs,T.y*cs,cs*1.6,0,7);ctx.stroke();
    ctx.restore();
  },
  draw(e,cs,tm,frz){
    const x=e.x*cs,y=e.y*cs,r=e.r*cs,hurt=e.hurt>0&&Math.floor(tm/60)%2;
    ctx.save();
    if(boss.stuck>0){ctx.strokeStyle='#facc15';ctx.lineWidth=cs*.5;ctx.beginPath();ctx.arc(x,y,r*1.4,-Math.PI/2,-Math.PI/2+boss.stuck/1.5*6.283);ctx.stroke()}
    ctx.shadowColor=frz?'#7dd3fc':'#c084fc';ctx.shadowBlur=cs*2;
    // ikiye bölünmüş maske: bir yarı açık, bir yarı koyu (ayna)
    ctx.beginPath();ctx.ellipse(x,y,r*.95,r*1.1,0,0,7);ctx.clip();
    ctx.fillStyle=hurt?'#fff':frz?'#e0f2fe':'#f5f3ff';ctx.fillRect(x-r,y-r*1.2,r,r*2.4);
    ctx.fillStyle=hurt?'#fff':frz?'#0c4a6e':'#2e1065';ctx.fillRect(x,y-r*1.2,r,r*2.4);
    ctx.shadowBlur=0;
    for(const sd of[-1,1]){const ex=x+sd*r*.38,ey=y-r*.15;
      ctx.fillStyle=sd<0?'#2e1065':'#f5f3ff';ctx.beginPath();ctx.ellipse(ex,ey,r*.22,r*.13,sd*.25,0,7);ctx.fill();
      ctx.fillStyle='#e879f9';ctx.beginPath();ctx.arc(ex,ey,r*.07,0,7);ctx.fill()}
    ctx.strokeStyle='#e879f9';ctx.lineWidth=Math.max(1,cs*.3);ctx.beginPath();ctx.arc(x,y+r*.35,r*.35,.2,Math.PI-.2);ctx.stroke();
    ctx.restore();
    ctx.strokeStyle=frz?'#7dd3fc':'#c084fc';ctx.lineWidth=Math.max(1,cs*.3);ctx.beginPath();ctx.ellipse(x,y,r*.95,r*1.1,0,0,7);ctx.stroke();
  }
});

/* ---------- 23: Sarmaşık ---------- */
BOSSES.push({id:'sarmasik',icon:'🌿',
  setup(bs){const e=spawnBoss(W/2,H*.45,3.4,0,'sarmasik');e.vx=e.vy=0;boss.hp=boss.maxHp=4;boss.vines=[];boss.sproutT=.6},
  move(e){return e.boss},
  ai(dt){
    const e=bossEnt();if(!e)return;const g=dt*(boss.rage||1)*(1+boss.tier*.2);
    boss.sproutT-=g;
    if(boss.sproutT<=0&&boss.vines.length<5){boss.sproutT=2.6;const a=R()*6.283;boss.vines.push({pts:[{x:e.x+Math.cos(a)*e.r,y:e.y+Math.sin(a)*e.r}],a,acc:0,grow:true,bloom:0,mature:0})}
    for(const v of boss.vines){
      if(v.grow){
        v.acc+=g*7;
        while(v.acc>=1){
          v.acc-=1;const L=v.pts[v.pts.length-1];
          v.a+=(R()-.5)*.45;
          if(player.drawing){const want=Math.atan2(player.y+.5-L.y,player.x+.5-L.x);let d=want-v.a;while(d>Math.PI)d-=6.283;while(d<-Math.PI)d+=6.283;v.a+=Math.max(-.12,Math.min(.12,d))}
          const nx=L.x+Math.cos(v.a)*.8,ny=L.y+Math.sin(v.a)*.8;
          if(hitsClaimed(nx,ny,.4)){if(v.pts.length<6){v.a+=Math.PI*(.5+R());continue}v.grow=false;break}
          v.pts.push({x:nx,y:ny});
          if(v.pts.length>=70){v.grow=false;break}
        }
      }else{v.mature+=g;if(!v.bloom&&v.mature>2.2){v.bloom=1;const L=v.pts[v.pts.length-1];burst(L.x,L.y,'#f472b6',10);tone(880,.15,'sine',.03,200)}}
    }
  },
  hazards(){
    for(const v of boss.vines){
      const L=v.pts[v.pts.length-1];
      if(hazard(L.x,L.y,v.bloom?1.0:.6))return true; // dikenli uç / çiçek
    }
    return false;
  },
  postCapture(){
    let hits=0,hx=0,hy=0;
    for(const v of boss.vines){
      const i=v.pts.findIndex(p=>grid[cellAt(p.x,p.y)]===1);
      if(i<0)continue;
      const tip=v.pts[v.pts.length-1];
      if(v.bloom){hits++;hx=tip.x;hy=tip.y;burst(tip.x,tip.y,'#f472b6',30)}
      for(let k=i;k<v.pts.length;k+=3)parts.push({x:v.pts[k].x,y:v.pts[k].y,vx:(R()-.5)*10,vy:(R()-.5)*10,life:.4,c:'#4ade80'});
      v.pts.length=i;v.grow=true;v.bloom=0;v.mature=0;
    }
    boss.vines=boss.vines.filter(v=>v.pts.length>=2);
    if(hits)hurtBoss(hits,hx,hy-3,t('pop.bloom'),'#f472b6');
  },
  drawUnder(cs,tm,frz){
    ctx.save();ctx.lineCap='round';ctx.lineJoin='round';
    for(const v of boss.vines){
      if(v.pts.length<2)continue;
      ctx.strokeStyle=frz?'#0c4a6e':'#14532d';ctx.lineWidth=cs*1.1;ctx.beginPath();v.pts.forEach((p,i)=>i?ctx.lineTo(p.x*cs,p.y*cs):ctx.moveTo(p.x*cs,p.y*cs));ctx.stroke();
      ctx.strokeStyle=frz?'#7dd3fc':'#22c55e';ctx.lineWidth=cs*.6;ctx.stroke();
      for(let k=4;k<v.pts.length-2;k+=6){const p=v.pts[k],q=v.pts[k-1],a=Math.atan2(p.y-q.y,p.x-q.x)+(k%12?1:-1)*1.1;
        ctx.fillStyle=frz?'#bae6fd':'#4ade80';ctx.beginPath();ctx.ellipse((p.x+Math.cos(a)*.7)*cs,(p.y+Math.sin(a)*.7)*cs,cs*.7,cs*.35,a,0,7);ctx.fill()}
      const L=v.pts[v.pts.length-1];
      if(v.bloom){
        ctx.shadowColor='#f472b6';ctx.shadowBlur=cs*2;
        for(let i=0;i<5;i++){const a=i/5*6.283+tm/900;ctx.fillStyle=frz?'#e0f2fe':'#f472b6';ctx.beginPath();ctx.ellipse((L.x+Math.cos(a)*.7)*cs,(L.y+Math.sin(a)*.7)*cs,cs*.6,cs*.35,a,0,7);ctx.fill()}
        ctx.shadowBlur=0;ctx.fillStyle='#fde047';ctx.beginPath();ctx.arc(L.x*cs,L.y*cs,cs*.35,0,7);ctx.fill();
      }else{
        ctx.fillStyle=frz?'#bae6fd':'#dc2626';
        for(let i=0;i<4;i++){const a=i/4*6.283+tm/200;ctx.beginPath();ctx.moveTo((L.x+Math.cos(a)*.9)*cs,(L.y+Math.sin(a)*.9)*cs);ctx.lineTo((L.x+Math.cos(a+.6)*.3)*cs,(L.y+Math.sin(a+.6)*.3)*cs);ctx.lineTo((L.x+Math.cos(a-.6)*.3)*cs,(L.y+Math.sin(a-.6)*.3)*cs);ctx.fill()}
      }
    }
    ctx.restore();
  },
  draw(e,cs,tm,frz){
    const x=e.x*cs,y=e.y*cs,r=e.r*cs,hurt=e.hurt>0&&Math.floor(tm/60)%2;
    ctx.save();ctx.shadowColor=frz?'#7dd3fc':'#4ade80';ctx.shadowBlur=cs*2;
    for(let i=0;i<7;i++){const a=i/7*6.283+Math.sin(tm/600)*.15;ctx.fillStyle=frz?'#bae6fd':i%2?'#16a34a':'#22c55e';
      ctx.beginPath();ctx.ellipse(x+Math.cos(a)*r*.8,y+Math.sin(a)*r*.8,r*.75,r*.38,a,0,7);ctx.fill()}
    ctx.shadowBlur=0;
    const g=ctx.createRadialGradient(x,y-r*.2,0,x,y,r*.8);g.addColorStop(0,'#fce7f3');g.addColorStop(1,frz?'#7dd3fc':'#db2777');
    ctx.fillStyle=hurt?'#fff':g;ctx.beginPath();ctx.arc(x,y,r*.7,0,7);ctx.fill();
    bEyes(x,y,r*.75,e,'#14532d',.32,.2);
    ctx.restore();
  }
});

/* ---------- 24: Zar Kral ---------- */
const PIPS={1:[[0,0]],2:[[-1,-1],[1,1]],3:[[-1,-1],[0,0],[1,1]],4:[[-1,-1],[1,-1],[-1,1],[1,1]],5:[[-1,-1],[1,-1],[0,0],[-1,1],[1,1]],6:[[-1,-1],[1,-1],[-1,0],[1,0],[-1,1],[1,1]]};
function drawDie(x,y,s,face,ang,frz,hurt,glow){
  ctx.save();ctx.translate(x,y);ctx.rotate(ang);
  if(glow){ctx.shadowColor='#fde047';ctx.shadowBlur=s*1.2}else{ctx.shadowColor=frz?'#7dd3fc':'#f43f5e';ctx.shadowBlur=s*.6}
  ctx.fillStyle=hurt?'#fecaca':frz?'#e0f2fe':'#fffbeb';
  const k=s*.28;ctx.beginPath();ctx.moveTo(-s+k,-s);ctx.arcTo(s,-s,s,s,k);ctx.arcTo(s,s,-s,s,k);ctx.arcTo(-s,s,-s,-s,k);ctx.arcTo(-s,-s,s,-s,k);ctx.closePath();ctx.fill();
  ctx.shadowBlur=0;ctx.strokeStyle=frz?'#0c4a6e':'#9f1239';ctx.lineWidth=Math.max(1,s*.1);ctx.stroke();
  ctx.fillStyle=frz?'#0369a1':face===6?'#b91c1c':'#1f2937';
  for(const[a,b]of PIPS[face])ctx.beginPath(),ctx.arc(a*s*.52,b*s*.52,s*.15,0,7),ctx.fill();
  ctx.restore();
}
BOSSES.push({id:'zar',icon:'🎲',
  setup(bs){const e=spawnBoss(W/2,H*.42,3.3,bs,'zar');e.rolling=0;boss.hp=boss.maxHp=15;boss.face=1+Math.floor(R()*6);boss.rollT=2.5;boss.last=0;setSpeed(e,e.base*(.55+boss.face*.13))},
  ai(dt){
    const e=bossEnt();if(!e)return;wander(e,dt);
    if(e.rolling>0){
      e.rolling-=dt;if(R()<dt*14)boss.face=1+Math.floor(R()*6);
      if(e.rolling<=0){
        boss.face=1+Math.floor(R()*6);setSpeed(e,e.base*(.55+boss.face*.13));tone(300+boss.face*60,.12,'square',.04);
        if(boss.face>=5&&shots.length<8){const n=boss.face-2,b=Math.atan2(player.y+.5-e.y,player.x+.5-e.x),sp=16+boss.tier*2.5;
          for(let i=0;i<n;i++){const a=b+(i-(n-1)/2)*.28;shots.push({x:e.x+Math.cos(a)*(e.r+1),y:e.y+Math.sin(a)*(e.r+1),vx:Math.cos(a)*sp,vy:Math.sin(a)*sp,r:.75,b:1,life:7,color:'#fb7185'})}sfx.shoot()}
      }
    }else{
      boss.rollT-=dt*(boss.rage||1);
      if(boss.rollT<=0){e.rolling=.9;boss.rollT=Math.max(2.2,3.4-boss.tier*.4)+R()*1.5;setSpeed(e,e.base*1.4);noise(.4,.04,1800)}
    }
  },
  postCapture(cx){
    const e=bossEnt();if(!e||cx.trailDist(e)>e.r+10)return;
    if(e.rolling>0){popText(t('pop.rolling'),e.x,e.y-e.r-3,'#fda4af');return}
    const f=boss.face;
    if(f===6&&boss.last===6){popText(t('pop.duses'),e.x,e.y-e.r-5,'#fde047',2);killBoss(true);return}
    boss.last=f;burst(e.x,e.y,'#fb7185',8+f*4);
    if(hurtBoss(f,null,null,'-'+f,f===6?'#fde047':'#fb7185'))return;
    boss.rollT=Math.min(boss.rollT,.6);
  },
  hint(){return t('hb.dice',{a:boss.hp,b:boss.maxHp,f:bossEnt()&&bossEnt().rolling>0?'?':boss.face})},
  draw(e,cs,tm,frz){
    const ang=e.rolling>0?tm/45:Math.sin(tm/700)*.08;
    drawDie(e.x*cs,e.y*cs,e.r*cs*.95,boss.face,ang,frz,e.hurt>0&&Math.floor(tm/60)%2,boss.face===6&&!(e.rolling>0));
    if(!(e.rolling>0)){ctx.save();ctx.globalAlpha=.9;bEyes(e.x*cs,e.y*cs-e.r*cs*1.25,e.r*cs*.8,e,'#9f1239',.3,.16);ctx.restore()}
  }
});

/* ---------- yeni bossların küçük canavarları ---------- */
Object.assign(MINION_DRAW,{
  // Piyon
  at(e,x,y,r,tm,frz){
    ctx.fillStyle=frz?'#7dd3fc':'#4c1d95';ctx.strokeStyle=frz?'#e0f2fe':'#c4b5fd';ctx.lineWidth=Math.max(1,r*.12);
    ctx.beginPath();ctx.ellipse(x,y+r*.75,r*.85,r*.25,0,0,7);ctx.fill();ctx.stroke();
    ctx.beginPath();ctx.moveTo(x-r*.55,y+r*.7);ctx.quadraticCurveTo(x-r*.2,y,x-r*.3,y-r*.2);ctx.lineTo(x+r*.3,y-r*.2);ctx.quadraticCurveTo(x+r*.2,y,x+r*.55,y+r*.7);ctx.closePath();ctx.fill();ctx.stroke();
    ctx.beginPath();ctx.arc(x,y-r*.55,r*.45,0,7);ctx.fill();ctx.stroke();
    mEyes(x,y-r*.55,r*.7,'#fde047',.35,.22);
  },
  // Dişli
  saat(e,x,y,r,tm,frz){
    ctx.save();ctx.translate(x,y);ctx.rotate(e.ang);ctx.fillStyle=frz?'#7dd3fc':'#d97706';
    ctx.beginPath();for(let i=0;i<16;i++){const a=i/16*6.283,rr=i%2?r*.8:r*1.08;ctx.lineTo(Math.cos(a)*rr,Math.sin(a)*rr)}ctx.closePath();ctx.fill();
    ctx.fillStyle=frz?'#0c4a6e':'#78350f';ctx.beginPath();ctx.arc(0,0,r*.3,0,7);ctx.fill();ctx.restore();
    mEyes(x,y,r*.85,'#78350f',.42,.2);
  },
  // Yağmur damlası
  bulut(e,x,y,r,tm,frz){
    ctx.fillStyle=frz?'#e0f2fe':'#38bdf8';ctx.shadowColor='#7dd3fc';ctx.shadowBlur=r;
    ctx.beginPath();ctx.moveTo(x,y-r*1.3);ctx.quadraticCurveTo(x+r*1.05,y+r*.1,x,y+r);ctx.quadraticCurveTo(x-r*1.05,y+r*.1,x,y-r*1.3);ctx.fill();ctx.shadowBlur=0;
    ctx.fillStyle='rgba(255,255,255,.6)';ctx.beginPath();ctx.ellipse(x-r*.3,y-r*.1,r*.15,r*.3,.3,0,7);ctx.fill();
    mEyes(x,y+r*.25,r*.8,'#0c4a6e',.35,.2);
  },
  // Küçük maske
  taklit(e,x,y,r,tm,frz){
    ctx.save();ctx.beginPath();ctx.arc(x,y,r,0,7);ctx.clip();
    ctx.fillStyle=frz?'#e0f2fe':'#f5f3ff';ctx.fillRect(x-r,y-r,r,r*2);ctx.fillStyle=frz?'#0c4a6e':'#3b0764';ctx.fillRect(x,y-r,r,r*2);ctx.restore();
    ctx.strokeStyle='#c084fc';ctx.lineWidth=Math.max(1,r*.12);ctx.beginPath();ctx.arc(x,y,r,0,7);ctx.stroke();
    ctx.fillStyle='#e879f9';ctx.beginPath();ctx.arc(x-r*.38,y-r*.15,r*.14,0,7);ctx.arc(x+r*.38,y-r*.15,r*.14,0,7);ctx.fill();
  },
  // Dikenli tohum
  sarmasik(e,x,y,r,tm,frz){
    ctx.fillStyle=frz?'#7dd3fc':'#65a30d';
    for(let i=0;i<8;i++){const a=i/8*6.283+e.ang*.5;ctx.beginPath();ctx.moveTo(x+Math.cos(a)*r*1.3,y+Math.sin(a)*r*1.3);ctx.lineTo(x+Math.cos(a+.35)*r*.7,y+Math.sin(a+.35)*r*.7);ctx.lineTo(x+Math.cos(a-.35)*r*.7,y+Math.sin(a-.35)*r*.7);ctx.fill()}
    ctx.fillStyle=frz?'#bae6fd':'#84cc16';ctx.beginPath();ctx.arc(x,y,r*.85,0,7);ctx.fill();
    ctx.fillStyle='#166534';ctx.beginPath();ctx.ellipse(x,y-r*.85,r*.3,r*.15,0,0,7);ctx.fill();
    mEyes(x,y,r*.85,'#14532d',.35,.22);
  },
  // Küçük zar
  zar(e,x,y,r,tm,frz){drawDie(x,y,r*.85,1+((e.hue|0)%3),e.ang*.4,frz,false,false)},
});

/* yeni bossların ateş biçimleri */
Object.assign(ATTACK,{
  taklit:{type:'shot',every:4.4,sp:17,r:.7,b:1,color:'#c084fc'},
  sarmasik:{type:'spread',every:5,n:3,spread:.4,sp:13,r:.7,b:0,color:'#84cc16'},
});
