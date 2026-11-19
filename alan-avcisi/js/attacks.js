/* Saldırılar: küçük canavarların avlanması + boss ateş topları / ışınları */


// Kendi atışı olan boss'lar (ejder, örümcek, yıldız) ve mekaniği bozulacaklar burada yok.
const ATTACK={
  goz:      {type:'beam',every:4.2,color:'#e879f9'},
  golem:    {type:'shot',every:3.6,sp:15,r:1.0,b:1,color:'#7dd3fc'},
  yilan:    {type:'spread',every:4.0,n:3,spread:.32,sp:17,r:.7,b:1,color:'#a3e635'},
  ikiz:     {type:'shot',every:4.6,sp:18,r:.7,b:2,color:'#22d3ee',alt:'#f472b6'},
  balcik:   {type:'shot',every:4.2,sp:12,r:1.0,b:2,color:'#4ade80'},
  zirh:     {type:'shot',every:3.4,sp:19,r:.75,b:1,color:'#f43f5e'},
  isin:     {type:'beam',every:3.8,n:2,color:'#a78bfa'},
  kartopu:  {type:'shot',every:3.8,sp:14,r:1.1,b:2,color:'#e0f2fe'},
  ayna:     {type:'beam',every:4.6,color:'#c4b5fd'},
  bukalemun:{type:'spread',every:4.2,n:2,spread:.22,sp:16,r:.75,b:1,color:'#34d399'},
  dev:      {type:'spread',every:2.4,n:5,spread:.28,sp:14,r:1.1,b:0,color:'#d6d3d1',when:e=>e.awake>0},
};
const BEAM_WARN=.75,BEAM_LIVE=.32;

function bossAttack(dt){
  if(!boss||boss.dead)return;
  const a=ATTACK[boss.def.id];if(!a)return;
  if(boss.atk==null)boss.atk=2.5+R();
  boss.atk-=dt*(player.drawing?1.6:1)*(boss.rage||1);
  if(boss.atk>0)return;
  boss.atk=a.every*DIFF().atk*Math.max(.6,1-boss.tier*.15)*(.85+R()*.3);
  const srcs=enemies.filter(e=>e.boss&&!e.guest&&!e.harmless&&!(e.sleep>0)&&!e.hidden&&(!a.when||a.when(e)));
  if(!srcs.length)return;
  const px=player.x+.5,py=player.y+.5;
  srcs.forEach((e,k)=>{
    const base=Math.atan2(py-e.y,px-e.x);
    let col=a.color;if(a.alt&&k%2)col=a.alt;
    if(boss.def.id==='bukalemun'&&boss.col!=null&&typeof ORB_COL!=='undefined')col=ORB_COL[boss.col];
    if(a.type==='beam'){
      const n=a.n||1;
      for(let i=0;i<n;i++){const ang=base+(i?(R()<.5?1:-1)*(.5+R()*.6):0);beams.push({e,ang,t:0,color:col})}
      tone(320,.25,'sawtooth',.03,260);
    }else{
      if(shots.length>8)return;
      const n=a.type==='spread'?a.n:1,sp=a.sp+levelIn()*.3+boss.tier*2.5;
      for(let i=0;i<n;i++){
        const ang=base+(n>1?(i-(n-1)/2)*a.spread:0),c=Math.cos(ang),s=Math.sin(ang);
        shots.push({x:e.x+c*(e.r+1),y:e.y+s*(e.r+1),vx:c*sp,vy:s*sp,r:a.r,b:a.b,life:8,color:col});
      }
      sfx.shoot();
    }
  });
}

// ışının ucu: alınmış alana ya da kenara çarptığı yer
function beamPts(b){
  const c=Math.cos(b.ang),s=Math.sin(b.ang),e=b.e,pts=[];
  let x=e.x+c*(e.r+.5),y=e.y+s*(e.r+.5);
  for(let k=0;k<400;k++){
    if(x<0||y<0||x>=W||y>=H||hitsClaimed(x,y,.2))break;
    pts.push(x,y);x+=c*.5;y+=s*.5;
  }
  return pts;
}
function updateBeams(dt){
  for(const b of beams){
    b.t+=dt;
    if(b.t<BEAM_WARN&&enemies.includes(b.e)){ // uyarı sırasında ışın hafifçe oyuncuya döner
      const want=Math.atan2(player.y+.5-b.e.y,player.x+.5-b.e.x);
      let d=want-b.ang;while(d>Math.PI)d-=6.283;while(d<-Math.PI)d+=6.283;
      b.ang+=Math.max(-.5*dt,Math.min(.5*dt,d));
    }
  }
  beams=beams.filter(b=>b.t<BEAM_WARN+BEAM_LIVE&&enemies.includes(b.e));
}
function beamHazards(){
  for(const b of beams){
    if(b.t<BEAM_WARN)continue;
    const p=beamPts(b);
    for(let i=0;i<p.length;i+=2)if(hazard(p[i],p[i+1],.45))return true;
  }
  return false;
}
function drawBeams(cs,tm,frz){
  for(const b of beams){
    const p=beamPts(b);if(p.length<4)continue;
    const x0=p[0]*cs,y0=p[1]*cs,x1=p[p.length-2]*cs,y1=p[p.length-1]*cs;
    const col=frz?'#7dd3fc':b.color;
    ctx.save();ctx.lineCap='round';
    if(b.t<BEAM_WARN){
      ctx.globalAlpha=.35+.35*Math.abs(Math.sin(tm/60));
      ctx.setLineDash([cs*1.2,cs*1.2]);ctx.strokeStyle=col;ctx.lineWidth=Math.max(1,cs*.35);
      ctx.beginPath();ctx.moveTo(x0,y0);ctx.lineTo(x1,y1);ctx.stroke();
      ctx.setLineDash([]);ctx.globalAlpha=.8;ctx.fillStyle=col;ctx.beginPath();ctx.arc(x0,y0,cs*(.6+b.t),0,7);ctx.fill();
    }else{
      const k=1-(b.t-BEAM_WARN)/BEAM_LIVE;
      ctx.shadowColor=col;ctx.shadowBlur=cs*3;ctx.strokeStyle=col;ctx.lineWidth=cs*1.6*k+1;
      ctx.beginPath();ctx.moveTo(x0,y0);ctx.lineTo(x1,y1);ctx.stroke();
      ctx.shadowBlur=0;ctx.strokeStyle='#fff';ctx.lineWidth=cs*.5*k+.5;
      ctx.beginPath();ctx.moveTo(x0,y0);ctx.lineTo(x1,y1);ctx.stroke();
    }
    ctx.restore();
  }
}

// Kesmeye başlayınca küçük canavarlar oyuncuya doğru hızla döner
function hunt(e,dt){
  const hk=DIFF().hunt;if(!hk){calm(e,dt);return}
  const want=Math.atan2(player.y+.5-e.y,player.x+.5-e.x);
  const cur=Math.atan2(e.vy,e.vx);
  let d=want-cur;while(d>Math.PI)d-=6.283;while(d<-Math.PI)d+=6.283;
  const turn=(2.6+boss.tier*.5)*hk*dt,na=cur+Math.max(-turn,Math.min(turn,d));
  const v=Math.hypot(e.vx,e.vy),target=Math.min(e.base*(1+.55*hk),31);
  const nv=v+(target-v)*Math.min(1,dt*3);
  e.vx=Math.cos(na)*nv;e.vy=Math.sin(na)*nv;e.hunting=true;
}
function calm(e,dt){
  if(!e.hunting)return;
  const v=Math.hypot(e.vx,e.vy),nv=v+(e.base-v)*Math.min(1,dt*2);
  setSpeed(e,nv);if(Math.abs(nv-e.base)<.3)e.hunting=false;
}
