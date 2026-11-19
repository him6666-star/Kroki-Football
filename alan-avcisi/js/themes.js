'use strict';
/* =========================================================
   Gizli resimler (her bölüm bir tema). Kendi görsellerin:
   assets/manifest.json içine {"bg":[{"level":1,"file":"bg/01.jpg"}],
   "boss":[{"id":"goz","file":"boss/goz.png"}]} yaz; varsa
   kodla çizilen resim yerine onlar kullanılır.
   ========================================================= */
const ASSET={bg:{},boss:{},ui:{}};
function loadAssets(onBg){
  fetch('assets/manifest.json').then(r=>r.ok?r.json():null).then(m=>{
    if(!m)return;
    (m.bg||[]).forEach(f=>{const im=new Image();im.onload=()=>{ASSET.bg[f.level]=im;onBg&&onBg(f.level)};im.src='assets/'+f.file});
    (m.boss||[]).forEach(f=>{const im=new Image();im.onload=()=>{ASSET.boss[f.id]=im};im.src='assets/'+f.file});
    (m.ui||[]).forEach(f=>{const im=new Image();im.onload=()=>{ASSET.ui[f.id]=im;if(f.id==='menu')document.body.classList.add('hasMenuArt')};im.src='assets/'+f.file});
  }).catch(()=>{});
}
function rng(seed){return()=>{seed|=0;seed=seed+0x6D2B79F5|0;let q=Math.imul(seed^seed>>>15,1|seed);q=q+Math.imul(q^q>>>7,61|q)^q;return((q^q>>>14)>>>0)/4294967296}}
const THEMES=[
  {key:'sunset',sky:['#ff7e5f','#feb47b','#ffe0b0'],sun:'#fff3b0',layers:['#b34a6a','#7a2e5c','#3d1a44'],},
  {key:'aurora',sky:['#020617','#0b2a4a','#145a6a'],sun:'#e0f2fe',layers:['#164e4f','#0d3438','#051a1e'],stars:1,aurora:1},
  {key:'ocean',sky:['#1e9ad6','#7dd3fc','#e6f7ff'],sun:'#fffbe6',layers:['#2b8a6e','#1f6b55'],sea:1},
  {key:'desert',sky:['#f08c1a','#fcd34d','#fff3cf'],sun:'#fff7ed',layers:['#e0912a','#c06a1a','#8a4512'],dunes:1},
  {key:'space',sky:['#0b0420','#2e1065','#5b21b6'],sun:'#f0abfc',layers:['#3b0764','#1e0538'],stars:1,planet:1},
  {key:'forest',sky:['#b6f0d4','#7fe0b6','#e3fbef'],sun:'#fefce8',layers:['#2f9a52','#1d7040','#0b3a22'],trees:1},
  {key:'sakura',sky:['#f9a8d4','#fce7f3','#fff1f2'],sun:'#fff7fb',layers:['#86efac','#4ade80'],sakura:1},
  {key:'volcano',sky:['#1c0a0a','#4c0f0f','#9a3412'],sun:'#fca5a5',layers:['#292524','#1c1917'],volcano:1,stars:1},
  {key:'city',sky:['#020617','#1e1b4b','#4338ca'],sun:'#fef9c3',layers:[],city:1,stars:1},
  {key:'under',sky:['#22d3ee','#0369a1','#082f49'],sun:'#cffafe',layers:['#c2a26b','#8a6d3b'],under:1,noSun:1},
  {key:'glacier',sky:['#7dd3fc','#e0f2fe','#f8fafc'],sun:'#ffffff',layers:['#f1f5f9','#94a3b8','#cbd5e1'],snow:1},
  {key:'lavender',sky:['#c4b5fd','#fde68a','#fef3c7'],sun:'#fff7ed',layers:['#7c9a3a','#65a30d'],lavender:1},
  {key:'canyon',sky:['#1e3a8a','#f97316','#fed7aa'],sun:'#fff7ed',layers:[],canyon:1},
  {key:'clouds',sky:['#93c5fd','#c7d2fe','#fce7f3'],sun:'#fffbeb',layers:[],clouds:1},
  {key:'synth',sky:['#0f0326','#3b0764','#be185d'],sun:'#fde047',layers:[],synth:1,stars:1,noSun:1},
  {key:'bamboo',sky:['#d9f99d','#bef264','#ecfccb'],sun:'#fefce8',layers:['#4d7c0f'],bamboo:1},
  {key:'cave',sky:['#020617','#0f172a','#1e1b4b'],sun:'#000000',layers:[],cave:1,noSun:1},
  {key:'galaxy',sky:['#000000','#0b0420','#1e0a3c'],sun:'#000000',layers:[],galaxy:1,noSun:1},
  {key:'chess',sky:['#1e1b4b','#4c1d95','#a78bfa'],sun:'#f5f3ff',layers:['#312e81','#1e1b4b'],stars:1},
  {key:'brass',sky:['#451a03','#b45309','#fde68a'],sun:'#fffbeb',layers:['#92400e','#78350f','#451a03'],dunes:1},
  {key:'storm',sky:['#0f172a','#334155','#64748b'],sun:'#e2e8f0',layers:['#1e293b','#0f172a'],clouds:1,noSun:1},
  {key:'masque',sky:['#2e1065','#86198f','#f0abfc'],sun:'#fdf4ff',layers:[],city:1,stars:1},
  {key:'jungle',sky:['#064e3b','#15803d','#bbf7d0'],sun:'#fefce8',layers:['#166534','#14532d','#052e16'],trees:1},
  {key:'casino',sky:['#450a0a','#9f1239','#fda4af'],sun:'#fde047',layers:[],synth:1,stars:1,noSun:1},
  {key:'magnet',sky:['#0f172a','#1e3a8a','#93c5fd'],sun:'#f87171',layers:['#334155','#1e293b','#0f172a'],city:1},
  {key:'deepsea',sky:['#020617','#1e1b4b','#6d28d9'],sun:'#c4b5fd',layers:['#312e81','#1e1b4b','#0b0a2a'],stars:1,noSun:1},
  {key:'petri',sky:['#052e16','#15803d','#d9f99d'],sun:'#fefce8',layers:['#166534','#14532d','#052e16'],aurora:1},
];
function themeFor(lv){return THEMES[(lv-1)%THEMES.length]}
function genPicture(lv){
  if(isFinal(lv))lv=finalOf(lv).at;else if(isDaily(lv))lv=bossIdx(dailyDef().id);
  const ti=(lv-1)%THEMES.length,th=THEMES[ti],r=rng(lv*977+13);
  const c=document.createElement('canvas');c.width=W*cpx;c.height=H*cpx;
  const g=c.getContext('2d'),w=c.width,h=c.height;
  c.themeName=t('theme.'+th.key);c.themeKey=th.key;
  const asset=ASSET.bg[ti+1];
  if(asset){
    const sc=Math.max(w/asset.width,h/asset.height),dw=asset.width*sc,dh=asset.height*sc;
    g.drawImage(asset,(w-dw)/2,(h-dh)/2,dw,dh);
    return c;
  }
  let gr=g.createLinearGradient(0,0,0,h*.75);
  gr.addColorStop(0,th.sky[0]);gr.addColorStop(.55,th.sky[1]);gr.addColorStop(1,th.sky[2]);
  g.fillStyle=gr;g.fillRect(0,0,w,h);
  if(th.stars){for(let i=0;i<260;i++){g.fillStyle=`rgba(255,255,255,${.3+r()*.7})`;const s=r()*w*.004+.5;g.fillRect(r()*w,r()*h*.7,s,s)}}
  if(th.aurora){
    for(let k=0;k<4;k++){
      const col=k%2?'rgba(167,139,250,':'rgba(74,222,128,';
      g.beginPath();const by=h*(.12+k*.07),ph=r()*6;
      g.moveTo(0,by);
      for(let x=0;x<=w;x+=w/40)g.lineTo(x,by+Math.sin(x/w*7+ph)*h*.05);
      for(let x=w;x>=0;x-=w/40)g.lineTo(x,by+h*.14+Math.sin(x/w*5+ph)*h*.04);
      const ag=g.createLinearGradient(0,by,0,by+h*.18);ag.addColorStop(0,col+'0)');ag.addColorStop(.4,col+'.45)');ag.addColorStop(1,col+'0)');
      g.fillStyle=ag;g.fill();
    }
  }
  const sx=w*(.2+r()*.6),sy=h*(.22+r()*.12),sr=w*(th.planet?.22:.11);
  if(!th.noSun){
  const sg=g.createRadialGradient(sx,sy,0,sx,sy,sr*2.6);
  sg.addColorStop(0,th.sun);sg.addColorStop(.35,th.sun+'88');sg.addColorStop(1,th.sun+'00');
  g.fillStyle=sg;g.fillRect(0,0,w,h);
  g.fillStyle=th.sun;g.beginPath();g.arc(sx,sy,sr,0,7);g.fill();
  }
  if(th.under){
    for(let k=0;k<7;k++){const x0=r()*w,wd=w*(.04+r()*.06);
      const rg=g.createLinearGradient(0,0,0,h*.8);rg.addColorStop(0,'rgba(255,255,255,.28)');rg.addColorStop(1,'rgba(255,255,255,0)');
      g.fillStyle=rg;g.beginPath();g.moveTo(x0,0);g.lineTo(x0+wd,0);g.lineTo(x0+wd*3+w*.1,h*.8);g.lineTo(x0+w*.1,h*.8);g.closePath();g.fill()}
  }
  if(th.volcano){
    const vx=w*(.35+r()*.3),top=h*.32,cw2=w*.07;
    const vgr=g.createLinearGradient(0,top,0,h*.8);vgr.addColorStop(0,'#44403c');vgr.addColorStop(1,'#0c0a09');
    g.fillStyle=vgr;g.beginPath();g.moveTo(vx-w*.55,h*.8);g.lineTo(vx-cw2,top);g.lineTo(vx+cw2,top);g.lineTo(vx+w*.55,h*.8);g.closePath();g.fill();
    const lg2=g.createRadialGradient(vx,top,0,vx,top,w*.3);lg2.addColorStop(0,'rgba(255,170,40,.95)');lg2.addColorStop(.3,'rgba(255,80,0,.5)');lg2.addColorStop(1,'rgba(255,40,0,0)');
    g.fillStyle=lg2;g.fillRect(0,0,w,h);
    g.strokeStyle='#ff7a1a';g.lineCap='round';
    for(let k=0;k<5;k++){g.lineWidth=cpx*(1+r()*1.5);g.beginPath();let x=vx+(r()-.5)*cw2*1.6,y=top;g.moveTo(x,y);
      for(let j=0;j<10;j++){x+=(r()-.5)*w*.05+(x-vx)*.12;y+=h*.045;g.lineTo(x,y)}g.stroke()}
    for(let k=0;k<40;k++){g.fillStyle=`rgba(255,${120+r()*100|0},40,${.4+r()*.6})`;g.beginPath();g.arc(vx+(r()-.5)*w*.3,top-r()*h*.2,cpx*(.5+r()),0,7);g.fill()}
  }
  if(th.city){
    for(let row=0;row<2;row++){
      let x=-r()*w*.05;const base=h;
      while(x<w){const bw=w*(.06+r()*.09),bh=h*(row?.18+r()*.28:.3+r()*.35);
        g.fillStyle=row?'#0b1020':'#1e1b4b';g.fillRect(x,base-bh,bw,bh);
        if(r()<.3){g.fillRect(x+bw*.45,base-bh-h*.04,bw*.1,h*.04)}
        for(let wy=base-bh+h*.015;wy<base-h*.02;wy+=h*.025)for(let wx=x+bw*.12;wx<x+bw*.85;wx+=bw*.22)
          if(r()<.45){g.fillStyle=r()<.8?'rgba(253,224,71,.85)':'rgba(125,211,252,.85)';g.fillRect(wx,wy,bw*.12,h*.012)}
        x+=bw+w*(row?.005:.02);}
    }
  }
  if(th.planet){
    const pg=g.createLinearGradient(sx-sr,sy-sr,sx+sr,sy+sr);pg.addColorStop(0,'#f5d0fe');pg.addColorStop(1,'#7e22ce');
    g.fillStyle=pg;g.beginPath();g.arc(sx,sy,sr,0,7);g.fill();
    g.strokeStyle='#fde68acc';g.lineWidth=sr*.12;g.beginPath();g.ellipse(sx,sy,sr*1.8,sr*.45,-.35,0,7);g.stroke();
  }
  const n=th.layers.length;
  th.layers.forEach((col,i)=>{
    const base=h*(.5+i*(.4/n)),amp=h*(th.dunes?.06:.13-i*.025),p1=r()*6,p2=r()*6,f1=2+r()*3,f2=6+r()*6;
    g.beginPath();g.moveTo(0,h);
    for(let x=0;x<=w;x+=w/120){
      const t=x/w;let y=Math.sin(t*f1+p1)*.65+Math.sin(t*f2+p2)*(th.dunes?.15:.35);
      if(!th.dunes)y+=Math.abs(Math.sin(t*f2*2.3+p1))*.25;
      g.lineTo(x,base-amp*y);
    }
    g.lineTo(w,h);g.closePath();
    const lg=g.createLinearGradient(0,base-amp,0,h);lg.addColorStop(0,col);lg.addColorStop(1,shade(col,-.45));
    g.fillStyle=lg;g.fill();
    if(th.trees&&i>0){
      g.fillStyle=shade(col,-.25);
      for(let k=0;k<26;k++){const tx=r()*w,ty=base+r()*h*.08,ts=w*(.025+r()*.03);
        g.beginPath();g.moveTo(tx,ty-ts*2.4);g.lineTo(tx-ts,ty);g.lineTo(tx+ts,ty);g.closePath();g.fill();}
    }
  });
  if(th.sakura){
    const tx=w*(.25+r()*.15);
    g.strokeStyle='#5b3a29';g.lineCap='round';
    const branch=(x,y,a,len,wd,d)=>{if(d>5||len<w*.02)return;const x2=x+Math.cos(a)*len,y2=y+Math.sin(a)*len;
      g.lineWidth=wd;g.beginPath();g.moveTo(x,y);g.lineTo(x2,y2);g.stroke();
      branch(x2,y2,a-.4-r()*.3,len*.72,wd*.68,d+1);branch(x2,y2,a+.35+r()*.3,len*.7,wd*.68,d+1)};
    branch(tx,h*.95,-Math.PI/2,h*.22,w*.05,0);
    for(let k=0;k<160;k++){const a=r()*6.28,d=r()*w*.32;g.fillStyle=`hsla(${330+r()*20},90%,${78+r()*12}%,.85)`;
      g.beginPath();g.arc(tx+Math.cos(a)*d*1.2,h*.38+Math.sin(a)*d*.75,w*(.015+r()*.025),0,7);g.fill()}
    for(let k=0;k<90;k++){g.fillStyle='rgba(251,207,232,.9)';g.beginPath();g.ellipse(r()*w,r()*h,w*.008,w*.005,r()*3,0,7);g.fill()}
  }
  if(th.under){
    for(let k=0;k<14;k++){const x=r()*w;g.strokeStyle=`hsl(${130+r()*40},60%,${30+r()*15}%)`;g.lineWidth=w*.012;g.beginPath();g.moveTo(x,h);
      const hh=h*(.15+r()*.25);for(let j=1;j<=10;j++)g.lineTo(x+Math.sin(j*.9+k)*w*.02,h-hh*j/10);g.stroke()}
    g.strokeStyle='rgba(255,255,255,.55)';g.lineWidth=Math.max(1,cpx*.4);
    for(let k=0;k<45;k++){g.beginPath();g.arc(r()*w,r()*h*.9,w*(.004+r()*.015),0,7);g.stroke()}
    for(let k=0;k<6;k++){const fx=r()*w,fy=h*(.2+r()*.5),fs=w*(.03+r()*.03);g.fillStyle=['#fb923c','#facc15','#f472b6'][k%3];
      g.beginPath();g.ellipse(fx,fy,fs,fs*.55,0,0,7);g.fill();g.beginPath();g.moveTo(fx-fs*.8,fy);g.lineTo(fx-fs*1.5,fy-fs*.5);g.lineTo(fx-fs*1.5,fy+fs*.5);g.closePath();g.fill()}
  }
  if(th.snow){g.fillStyle='rgba(255,255,255,.9)';for(let k=0;k<220;k++){g.beginPath();g.arc(r()*w,r()*h,cpx*(.3+r()*.8),0,7);g.fill()}}
  if(th.lavender){
    const vy=h*.66,cx2=w/2;
    for(let k=-14;k<=14;k++){const xb=cx2+k*w*.09;
      g.strokeStyle=k%2?'#7c3aed':'#a78bfa';g.lineWidth=w*.035;g.beginPath();g.moveTo(cx2+k*w*.012,vy);g.lineTo(xb,h);g.stroke()}
    const lg3=g.createLinearGradient(0,vy,0,h);lg3.addColorStop(0,'rgba(254,243,199,.5)');lg3.addColorStop(.4,'rgba(254,243,199,0)');g.fillStyle=lg3;g.fillRect(0,vy,w,h-vy);
  }
  if(th.sea){
    const sy0=h*.68,sgr=g.createLinearGradient(0,sy0,0,h);sgr.addColorStop(0,'#38bdf8');sgr.addColorStop(1,'#0c4a6e');
    g.fillStyle=sgr;g.fillRect(0,sy0,w,h-sy0);
    g.fillStyle='rgba(255,255,255,.35)';
    for(let k=0;k<70;k++){const y=sy0+r()*(h-sy0),lw=w*(.03+r()*.08);g.fillRect(r()*w,y,lw,Math.max(1,cpx*.4))}
  }

  if(th.canyon){
    for(let li=0;li<3;li++){
      const base=h*(.55+li*.14),cols=[['#9a3412','#c2410c','#ea580c'],['#7c2d12','#9a3412','#c2410c'],['#431407','#7c2d12','#9a3412']][li];
      let x=-w*.05;
      while(x<w){
        const mw=w*(.18+r()*.25),mh=h*(.12+r()*.18)*(1-li*.2),inset=mw*(.1+r()*.1);
        g.save();g.beginPath();g.moveTo(x,h);g.lineTo(x+inset,base-mh);g.lineTo(x+mw-inset,base-mh);g.lineTo(x+mw,h);g.closePath();g.clip();
        for(let sy=base-mh;sy<h;sy+=h*.018){g.fillStyle=cols[Math.floor((sy/(h*.018))%3)];g.fillRect(x,sy,mw,h*.018)}
        g.restore();
        x+=mw*(.75+r()*.4);
      }
    }
  }
  if(th.clouds){
    const cloud=(cx,cy,s,col)=>{g.fillStyle=col;for(let k=0;k<7;k++){g.beginPath();g.arc(cx+(k-3)*s*.45,cy+Math.abs(k-3)*s*.12,s*(.55+r()*.3),0,7);g.fill()}};
    for(let k=0;k<5;k++){
      const ix=r()*w,iy=h*(.3+r()*.5),iw=w*(.14+r()*.12);
      g.fillStyle='#78716c';g.beginPath();g.moveTo(ix-iw,iy);g.lineTo(ix+iw,iy);g.lineTo(ix+iw*.2,iy+iw*1.1);g.lineTo(ix-iw*.3,iy+iw*.8);g.closePath();g.fill();
      g.fillStyle='#4ade80';g.beginPath();g.ellipse(ix,iy,iw*1.05,iw*.18,0,0,7);g.fill();
      g.fillStyle='#166534';for(let j=0;j<3;j++){const tx=ix+(r()-.5)*iw*1.2;g.beginPath();g.arc(tx,iy-iw*.25,iw*.18,0,7);g.fill()}
    }
    for(let k=0;k<9;k++)cloud(r()*w,h*(.1+r()*.85),w*(.05+r()*.05),`rgba(255,255,255,${.75+r()*.25})`);
  }
  if(th.synth){
    const hy=h*.6,sx2=w/2,sy2=h*.42,sr2=w*.26;
    const sg2=g.createLinearGradient(0,sy2-sr2,0,sy2+sr2);sg2.addColorStop(0,'#fde047');sg2.addColorStop(1,'#ec4899');
    g.save();g.beginPath();g.arc(sx2,sy2,sr2,0,7);g.clip();g.fillStyle=sg2;g.fillRect(sx2-sr2,sy2-sr2,sr2*2,sr2*2);
    g.fillStyle='#3b0764';for(let k=0;k<7;k++){const yy=sy2+sr2*(.1+k*.13);g.fillRect(sx2-sr2,yy,sr2*2,sr2*(.02+k*.012))}g.restore();
    g.fillStyle='#1e0533';g.beginPath();g.moveTo(0,hy);
    for(let x=0;x<=w;x+=w/16)g.lineTo(x,hy-h*(.03+r()*.1)*(Math.abs(x-w/2)/(w/2)));
    g.lineTo(w,hy);g.closePath();g.fill();
    const fg=g.createLinearGradient(0,hy,0,h);fg.addColorStop(0,'#2e1065');fg.addColorStop(1,'#0f0326');g.fillStyle=fg;g.fillRect(0,hy,w,h-hy);
    g.strokeStyle='#f0abfc';g.lineWidth=Math.max(1,cpx*.35);
    for(let k=-12;k<=12;k++){g.beginPath();g.moveTo(w/2+k*w*.02,hy);g.lineTo(w/2+k*w*.16,h);g.stroke()}
    for(let k=1;k<12;k++){const yy=hy+(h-hy)*Math.pow(k/12,1.8);g.beginPath();g.moveTo(0,yy);g.lineTo(w,yy);g.stroke()}
  }
  if(th.bamboo){
    for(let k=0;k<26;k++){
      const x=r()*w,bw=w*(.018+r()*.02),shade2=40+r()*25;
      g.fillStyle=`hsl(${90+r()*20},55%,${shade2}%)`;g.fillRect(x,0,bw,h);
      g.fillStyle=`hsl(95,45%,${shade2-12}%)`;
      for(let y=r()*h*.1;y<h;y+=h*(.08+r()*.04))g.fillRect(x-bw*.1,y,bw*1.2,Math.max(1,cpx*.5));
      g.fillStyle=`hsla(${100+r()*20},60%,${30+r()*20}%,.85)`;
      for(let j=0;j<4;j++){const ly=r()*h,dir=r()<.5?-1:1;g.beginPath();g.ellipse(x+bw/2+dir*bw*2,ly,bw*2.2,bw*.5,dir*.5,0,7);g.fill()}
    }
  }
  if(th.cave){
    g.fillStyle='#0b0f1e';
    for(let x=0;x<w;x+=w*(.04+r()*.05)){const sw=w*(.03+r()*.04),sh=h*(.05+r()*.18);g.beginPath();g.moveTo(x,0);g.lineTo(x+sw,0);g.lineTo(x+sw/2,sh);g.closePath();g.fill()}
    g.fillStyle='#111827';g.beginPath();g.moveTo(0,h);for(let x=0;x<=w;x+=w/20)g.lineTo(x,h*.82-r()*h*.06);g.lineTo(w,h);g.closePath();g.fill();
    for(let k=0;k<11;k++){
      const cx2=r()*w,cy2=h*(.78+r()*.12),hue=r()<.5?190:290;
      const gl=g.createRadialGradient(cx2,cy2,0,cx2,cy2,w*.18);gl.addColorStop(0,`hsla(${hue},90%,60%,.35)`);gl.addColorStop(1,`hsla(${hue},90%,60%,0)`);g.fillStyle=gl;g.fillRect(0,0,w,h);
      for(let j=0;j<4;j++){const a=-Math.PI/2+(r()-.5)*1.1,len=h*(.05+r()*.1),cw3=w*(.012+r()*.012);
        g.save();g.translate(cx2,cy2);g.rotate(a+Math.PI/2);
        const cg=g.createLinearGradient(-cw3,0,cw3,0);cg.addColorStop(0,`hsl(${hue},90%,75%)`);cg.addColorStop(1,`hsl(${hue},80%,40%)`);
        g.fillStyle=cg;g.beginPath();g.moveTo(-cw3,0);g.lineTo(0,-len);g.lineTo(cw3,0);g.closePath();g.fill();g.restore()}
    }
  }
  if(th.galaxy){
    const gx=w*.5,gy=h*.45;
    for(const[col,rad]of[['rgba(168,85,247,.35)',w*.6],['rgba(236,72,153,.25)',w*.4],['rgba(56,189,248,.2)',w*.3]]){
      const ng=g.createRadialGradient(gx,gy,0,gx,gy,rad);ng.addColorStop(0,col);ng.addColorStop(1,'rgba(0,0,0,0)');g.fillStyle=ng;g.fillRect(0,0,w,h)}
    for(let arm=0;arm<3;arm++)for(let k=0;k<420;k++){
      const tt=k/420*4.2,a=tt*1.9+arm*2.094+(r()-.5)*.5,d=w*.02+tt*w*.11+(r()-.5)*w*.04;
      g.fillStyle=`hsla(${200+r()*120},90%,${70+r()*30}%,${.4+r()*.6})`;
      const ss=cpx*(.3+r()*.9);g.fillRect(gx+Math.cos(a)*d,gy+Math.sin(a)*d*.75,ss,ss)}
    const core=g.createRadialGradient(gx,gy,0,gx,gy,w*.08);core.addColorStop(0,'#fff');core.addColorStop(1,'rgba(255,255,255,0)');g.fillStyle=core;g.fillRect(0,0,w,h);
    for(let i=0;i<300;i++){g.fillStyle=`rgba(255,255,255,${r()*.8})`;g.fillRect(r()*w,r()*h,cpx*.4,cpx*.4)}
  }
  // ince çerçeve parlaklığı
  const vg=g.createRadialGradient(w/2,h/2,h*.3,w/2,h/2,h*.75);vg.addColorStop(0,'rgba(0,0,0,0)');vg.addColorStop(1,'rgba(0,0,0,.35)');
  g.fillStyle=vg;g.fillRect(0,0,w,h);
  return c;
}
function shade(hex,amt){
  const n=parseInt(hex.slice(1),16);let r=n>>16,g=n>>8&255,b=n&255;
  const f=amt<0?0:255,p=Math.abs(amt);
  r=Math.round((f-r)*p+r);g=Math.round((f-g)*p+g);b=Math.round((f-b)*p+b);
  return'#'+((1<<24)|(r<<16)|(g<<8)|b).toString(16).slice(1);
}

