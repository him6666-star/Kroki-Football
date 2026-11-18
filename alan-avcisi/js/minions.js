'use strict';
/* =========================================================
   Her boss'un kendine özgü küçük canavarı (yavrusu).
   Görsel varsa: assets/boss/m_<bossId>.png kullanılır,
   yoksa aşağıdaki çizimler.
   ========================================================= */
function mEyes(x,y,s,col,spread=.42,size=.3){
  const e=mEyes.e,lx=player.x+.5-e.x,ly=player.y+.5-e.y,ll=Math.hypot(lx,ly)||1;
  for(const sd of[-1,1]){const ex=x+sd*s*spread,ey=y;
    ctx.fillStyle='#fff';ctx.beginPath();ctx.arc(ex,ey,s*size,0,7);ctx.fill();
    ctx.fillStyle=col;ctx.beginPath();ctx.arc(ex+lx/ll*s*size*.4,ey+ly/ll*s*size*.4,s*size*.55,0,7);ctx.fill()}
}
function mAngle(e){return Math.atan2(e.vy,e.vx)}
const MINION_FACE={yilan:1};
const MINION_DRAW={
  // Göz yavrusu: yarasa kanatlı küçük göz, irisi seni izler
  goz(e,x,y,r,tm,frz){
    const f=Math.sin(tm/45+e.x)*.5+.5;
    ctx.fillStyle=frz?'#7dd3fc':'#c026d3';
    for(const sd of[-1,1]){ctx.beginPath();ctx.moveTo(x+sd*r*.6,y);ctx.lineTo(x+sd*r*(1.6+f*.3),y-r*(.9-f*.6));ctx.lineTo(x+sd*r*1.25,y+r*.15);ctx.lineTo(x+sd*r*(1.5+f*.2),y+r*.35);ctx.closePath();ctx.fill()}
    const g=ctx.createRadialGradient(x-r*.3,y-r*.3,0,x,y,r);g.addColorStop(0,'#fff');g.addColorStop(.8,'#ffe4f2');g.addColorStop(1,'#f472b6');
    ctx.fillStyle=g;ctx.beginPath();ctx.arc(x,y,r,0,7);ctx.fill();
    const e2=mEyes.e,lx=player.x+.5-e2.x,ly=player.y+.5-e2.y,ll=Math.hypot(lx,ly)||1;
    ctx.fillStyle=frz?'#0ea5e9':'#8b5cf6';ctx.beginPath();ctx.arc(x+lx/ll*r*.3,y+ly/ll*r*.3,r*.45,0,7);ctx.fill();
    ctx.fillStyle='#14051f';ctx.beginPath();ctx.arc(x+lx/ll*r*.36,y+ly/ll*r*.36,r*.2,0,7);ctx.fill();
  },
  // Golem kırıntısı: üstünde kristal parlayan küçük kaya
  golem(e,x,y,r,tm,frz){
    ctx.fillStyle=frz?'#bae6fd':'#64748b';ctx.beginPath();
    for(let i=0;i<7;i++){const a=i/7*6.283+e.ang*.2,rr=r*(.9+((i*37)%5)/25);ctx.lineTo(x+Math.cos(a)*rr,y+Math.sin(a)*rr)}ctx.closePath();ctx.fill();
    ctx.strokeStyle='#1e293b';ctx.lineWidth=Math.max(1,r*.12);ctx.stroke();
    ctx.shadowColor='#5af0ff';ctx.shadowBlur=r*1.2;ctx.fillStyle='#67e8f9';
    ctx.beginPath();ctx.moveTo(x+r*.1,y-r*1.25);ctx.lineTo(x+r*.38,y-r*.5);ctx.lineTo(x-r*.12,y-r*.55);ctx.closePath();ctx.fill();ctx.shadowBlur=0;
    mEyes(x,y+r*.15,r,'#0ea5e9',.35,.22);
  },
  // Neon iribaş: kuyruğu kıvrılan küçük yeşil yavru
  yilan(e,x,y,r,tm,frz){
    const a=mAngle(e);ctx.save();ctx.translate(x,y);ctx.rotate(a);
    ctx.strokeStyle=frz?'#7dd3fc':'#4ade80';ctx.lineCap='round';ctx.lineWidth=r*.55;
    ctx.beginPath();ctx.moveTo(-r*.5,0);for(let i=1;i<=6;i++)ctx.lineTo(-r*.5-i*r*.3,Math.sin(tm/70-i*.9)*r*.35);ctx.stroke();
    const g=ctx.createRadialGradient(-r*.2,-r*.2,0,0,0,r);g.addColorStop(0,'#ecfccb');g.addColorStop(1,frz?'#0ea5e9':'#22c55e');
    ctx.fillStyle=g;ctx.beginPath();ctx.ellipse(0,0,r*1.05,r*.85,0,0,7);ctx.fill();ctx.restore();
    mEyes(x,y-r*.1,r,'#14532d',.32,.26);
  },
  // Kıvılcım ruhu: yarısı mavi yarısı pembe, mini şimşekli
  ikiz(e,x,y,r,tm,frz){
    ctx.save();ctx.beginPath();ctx.arc(x,y,r,0,7);ctx.clip();
    ctx.fillStyle=frz?'#7dd3fc':'#22d3ee';ctx.fillRect(x-r,y-r,r,r*2);ctx.fillStyle=frz?'#bae6fd':'#e879f9';ctx.fillRect(x,y-r,r,r*2);ctx.restore();
    ctx.strokeStyle='#fef08a';ctx.lineWidth=Math.max(1,r*.15);ctx.beginPath();ctx.moveTo(x,y-r);ctx.lineTo(x-r*.2,y-r*.1);ctx.lineTo(x+r*.2,y+r*.1);ctx.lineTo(x,y+r);ctx.stroke();
    mEyes(x,y,r,'#0b1026',.42,.24);
  },
  // Kor cini: alev biçimli küçük ateş
  ejder(e,x,y,r,tm,frz){
    const fl=Math.sin(tm/60+e.x)*r*.15;
    const g=ctx.createLinearGradient(0,y-r*1.4,0,y+r);g.addColorStop(0,'#fde047');g.addColorStop(.5,frz?'#38bdf8':'#fb923c');g.addColorStop(1,frz?'#0369a1':'#dc2626');
    ctx.fillStyle=g;ctx.beginPath();ctx.moveTo(x,y-r*1.5-fl);ctx.quadraticCurveTo(x+r*1.1,y-r*.2,x+r*.8,y+r*.6);ctx.quadraticCurveTo(x,y+r*1.2,x-r*.8,y+r*.6);ctx.quadraticCurveTo(x-r*1.1,y-r*.2,x,y-r*1.5+fl);ctx.fill();
    mEyes(x,y+r*.1,r,'#7f1d1d',.3,.22);
  },
  // Zırhlı uğur böceği
  zirh(e,x,y,r,tm,frz){
    const a=mAngle(e)+Math.PI/2;ctx.save();ctx.translate(x,y);ctx.rotate(a);
    ctx.strokeStyle='#1e293b';ctx.lineWidth=Math.max(1,r*.15);
    for(let i=-1;i<=1;i++)for(const sd of[-1,1]){ctx.beginPath();ctx.moveTo(sd*r*.5,i*r*.4);ctx.lineTo(sd*r*1.1,i*r*.5+Math.sin(tm/50+i)*r*.15);ctx.stroke()}
    ctx.fillStyle='#f43f5e';ctx.beginPath();ctx.ellipse(0,r*.1,r*.75,r*.95,0,0,7);ctx.fill();
    ctx.fillStyle=frz?'#7dd3fc':'#475569';for(const sd of[-1,1]){ctx.beginPath();ctx.ellipse(sd*r*.36,r*.12,r*.4,r*.88,sd*.08,0,7);ctx.fill()}
    ctx.fillStyle='#0f172a';ctx.beginPath();ctx.arc(0,-r*.85,r*.38,0,7);ctx.fill();
    ctx.fillStyle='#fde047';for(const sd of[-1,1]){ctx.beginPath();ctx.arc(sd*r*.15,-r*.92,r*.09,0,7);ctx.fill()}
    ctx.restore();
  },
  // Mini girdap
  isin(e,x,y,r,tm,frz){
    const g=ctx.createRadialGradient(x,y,0,x,y,r);g.addColorStop(0,'#fff');g.addColorStop(.45,frz?'#7dd3fc':'#c084fc');g.addColorStop(1,frz?'#0369a1':'#4c1d95');
    ctx.fillStyle=g;ctx.beginPath();ctx.arc(x,y,r,0,7);ctx.fill();
    ctx.strokeStyle='rgba(255,255,255,.85)';ctx.lineWidth=Math.max(1,r*.12);ctx.save();ctx.translate(x,y);ctx.rotate(tm/200+e.x);
    ctx.beginPath();ctx.ellipse(0,0,r*1.45,r*.4,0,0,7);ctx.stroke();ctx.restore();
    mEyes(x,y,r,'#2e1065',.33,.2);
  },
  // Mini bomba
  bomba(e,x,y,r,tm,frz){
    ctx.fillStyle=frz?'#7dd3fc':'#292524';ctx.beginPath();ctx.arc(x,y,r,0,7);ctx.fill();
    ctx.strokeStyle='#a16207';ctx.lineWidth=Math.max(1,r*.18);ctx.beginPath();ctx.moveTo(x+r*.4,y-r*.8);ctx.quadraticCurveTo(x+r*.9,y-r*1.4,x+r*1.1,y-r*1.1);ctx.stroke();
    ctx.fillStyle='#fde047';ctx.beginPath();ctx.arc(x+r*1.15,y-r*1.15,r*(.25+.15*Math.sin(tm/30)),0,7);ctx.fill();
    ctx.fillStyle='#fb923c';ctx.fillRect(x-r*.85,y-r*.25,r*1.7,r*.38);mEyes(x,y-r*.05,r,'#000',.35,.16);
  },
  // Kartopu yavrusu
  kartopu(e,x,y,r,tm,frz){
    const g=ctx.createRadialGradient(x-r*.3,y-r*.3,0,x,y,r);g.addColorStop(0,'#fff');g.addColorStop(1,frz?'#38bdf8':'#a5c4e6');
    ctx.fillStyle=g;ctx.beginPath();ctx.arc(x,y,r,0,7);ctx.fill();
    ctx.fillStyle='#0f172a';for(const sd of[-1,1]){ctx.beginPath();ctx.arc(x+sd*r*.32,y-r*.1,r*.14,0,7);ctx.fill()}
    ctx.fillStyle='#f97316';ctx.beginPath();ctx.moveTo(x,y+r*.05);ctx.lineTo(x+r*.55,y+r*.18);ctx.lineTo(x,y+r*.3);ctx.closePath();ctx.fill();
  },
  // Gölge kıymığı
  ayna(e,x,y,r,tm,frz){
    ctx.save();ctx.translate(x,y);ctx.rotate(Math.PI/4+Math.sin(tm/200+e.x)*.3);
    ctx.fillStyle='#0b0820';ctx.fillRect(-r*.75,-r*.75,r*1.5,r*1.5);ctx.strokeStyle=frz?'#7dd3fc':'#a78bfa';ctx.lineWidth=Math.max(1,r*.18);ctx.strokeRect(-r*.75,-r*.75,r*1.5,r*1.5);ctx.restore();
    ctx.fillStyle='#ede9fe';for(const sd of[-1,1]){ctx.beginPath();ctx.arc(x+sd*r*.25,y,r*.13,0,7);ctx.fill()}
  },
  // Örümcek yavrusu
  orumcek(e,x,y,r,tm,frz){
    ctx.strokeStyle=frz?'#7dd3fc':'#3b0764';ctx.lineWidth=Math.max(1,r*.16);
    for(const sd of[-1,1])for(let i=0;i<4;i++){const a=-.9+i*.6+Math.sin(tm/45+i)*.18;ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x+sd*Math.cos(a)*r*1.6,y+Math.sin(a)*r*1.3);ctx.stroke()}
    ctx.fillStyle=frz?'#38bdf8':'#6d28d9';ctx.beginPath();ctx.arc(x,y,r*.8,0,7);ctx.fill();
    ctx.fillStyle='#fde047';for(const[dx,dy]of[[-.25,-.15],[.25,-.15],[-.1,.1],[.1,.1]]){ctx.beginPath();ctx.arc(x+dx*r,y+dy*r,r*.12,0,7);ctx.fill()}
  },
  // Bukalemun yumurtası: annesinin o anki rengini alır
  bukalemun(e,x,y,r,tm,frz){
    const col=frz?'#7dd3fc':(typeof ORB_COL!=='undefined'&&boss&&boss.col!=null?ORB_COL[boss.col]:'#22c55e');
    const g=ctx.createRadialGradient(x-r*.3,y-r*.4,0,x,y,r*1.1);g.addColorStop(0,'#fff');g.addColorStop(.5,col);g.addColorStop(1,'#111');
    ctx.fillStyle=g;ctx.beginPath();ctx.ellipse(x,y,r*.85,r*1.05,0,0,7);ctx.fill();
    ctx.strokeStyle='rgba(0,0,0,.35)';ctx.lineWidth=Math.max(1,r*.12);ctx.beginPath();ctx.moveTo(x-r*.7,y-r*.1);ctx.lineTo(x-r*.3,y+r*.15);ctx.lineTo(x,y-r*.1);ctx.lineTo(x+r*.35,y+r*.15);ctx.lineTo(x+r*.7,y-r*.1);ctx.stroke();
    mEyes(x,y-r*.45,r,'#111',.3,.18);
  },
  // Küçük ruh: hayaletin yarı saydam yavrusu
  hayalet(e,x,y,r,tm,frz){
    ctx.save();ctx.globalAlpha=.75;y+=Math.sin(tm/200+e.x)*r*.25;
    ctx.fillStyle=frz?'#bae6fd':'#f1f5f9';ctx.beginPath();ctx.arc(x,y-r*.2,r,Math.PI,0);
    for(let i=0;i<=4;i++){ctx.lineTo(x+r-i*r/2,y+r*.7+(i%2?-r*.25:0))}ctx.closePath();ctx.fill();ctx.restore();
    ctx.fillStyle='#1e1b4b';for(const sd of[-1,1]){ctx.beginPath();ctx.ellipse(x+sd*r*.32,y-r*.25,r*.13,r*.2,0,0,7);ctx.fill()}
  },
  // Toz şeytanı: minik hortum
  hortum(e,x,y,r,tm,frz){
    for(let i=0;i<4;i++){const f=i/3,yy=y+r*(.9-f*1.9),w=r*(.3+f*.8),off=Math.sin(tm/80+i)*r*.2;
      ctx.strokeStyle=frz?'#7dd3fc':`rgba(203,213,225,${.6+f*.4})`;ctx.lineWidth=Math.max(1,r*.22);ctx.beginPath();ctx.ellipse(x+off,yy,w,w*.32,0,0,7);ctx.stroke()}
    ctx.fillStyle='#e0f2fe';for(const sd of[-1,1]){ctx.beginPath();ctx.arc(x+sd*r*.22,y-r*.35,r*.11,0,7);ctx.fill()}
  },
  // Yosunlu çakıl
  dev(e,x,y,r,tm,frz){
    ctx.fillStyle=frz?'#bae6fd':'#78716c';ctx.beginPath();ctx.ellipse(x,y,r*1.05,r*.9,0,0,7);ctx.fill();
    ctx.fillStyle='#65a30d';ctx.beginPath();ctx.ellipse(x-r*.2,y-r*.6,r*.6,r*.28,-.2,0,7);ctx.fill();
    mEyes(x,y+r*.1,r,'#1c1917',.32,.2);
  },
  // Yıldız kıymığı
  yildiz(e,x,y,r,tm,frz){
    ctx.save();ctx.translate(x,y);ctx.rotate(e.ang);ctx.shadowColor='#fde047';ctx.shadowBlur=r;
    ctx.fillStyle=frz?'#7dd3fc':'#a855f7';ctx.beginPath();for(let i=0;i<10;i++){const a=i/10*6.283,rr=i%2?r*.5:r*1.2;ctx.lineTo(Math.cos(a)*rr,Math.sin(a)*rr)}ctx.closePath();ctx.fill();
    ctx.shadowBlur=0;ctx.fillStyle='#fde047';ctx.beginPath();ctx.arc(0,0,r*.35,0,7);ctx.fill();ctx.restore();
  },
};
function drawMinion(e,cs,tm,frz){
  if(!boss)return false;
  const id=boss.def.id,x=e.x*cs,y=e.y*cs,r=e.r*cs*1.2;
  const im=ASSET.boss['m_'+id];
  if(im){
    const S=r*2.4;ctx.save();ctx.translate(x,y);
    const face=MINION_FACE[id];if(face&&(e.vx>=0?1:-1)!==face)ctx.scale(-1,1);
    ctx.rotate(Math.sin(tm/300+e.x)*.1);
    const src=frz?tinted(im,'#7dd3fc'):(id==='bukalemun'&&boss.col!=null?tinted(im,ORB_COL[boss.col]):im);
    ctx.drawImage(src,-S/2,-S/2,S,S);ctx.restore();return true;
  }
  const f=MINION_DRAW[id];if(!f)return false;
  mEyes.e=e;ctx.save();f(e,x,y,r,tm,frz);ctx.restore();return true;
}
