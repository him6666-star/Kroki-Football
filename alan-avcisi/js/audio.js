'use strict';
/* Ses efektleri + prosedürel müzik (Web Audio) */
let ac=null,sfxGain=null,musGain=null,noiseBuf=null;

function ensureAudio(){
  if(!ac){
    try{
      ac=new(window.AudioContext||window.webkitAudioContext)();
      sfxGain=ac.createGain();musGain=ac.createGain();
      sfxGain.connect(ac.destination);musGain.connect(ac.destination);
      noiseBuf=ac.createBuffer(1,ac.sampleRate,ac.sampleRate);
      const d=noiseBuf.getChannelData(0);for(let i=0;i<d.length;i++)d[i]=Math.random()*2-1;
    }catch(e){ac=null}
  }
  if(ac&&ac.state==='suspended')ac.resume().catch(()=>{});
  applyVolumes();
}
function applyVolumes(){
  if(!ac)return;
  sfxGain.gain.value=SAVE.settings.sfx;
  musGain.gain.value=SAVE.settings.music?SAVE.settings.musicVol*.55:0;
  if(SAVE.settings.music&&SAVE.settings.musicVol>0)Music.start();else Music.stop();
}
function tone(f,d,type='square',v=.05,slide=0,delay=0,dest){
  if(!ac)return;
  const t0=ac.currentTime+delay,o=ac.createOscillator(),g=ac.createGain();
  o.type=type;o.frequency.setValueAtTime(f,t0);
  if(slide)o.frequency.exponentialRampToValueAtTime(Math.max(30,f+slide),t0+d);
  g.gain.setValueAtTime(0.0001,t0);g.gain.linearRampToValueAtTime(v,t0+.008);
  g.gain.exponentialRampToValueAtTime(.0001,t0+d);
  o.connect(g).connect(dest||sfxGain);o.start(t0);o.stop(t0+d+.03);
}
function noise(d,v,freq=2000,type='highpass',delay=0){
  if(!ac||!noiseBuf)return;
  const t0=ac.currentTime+delay,s=ac.createBufferSource(),f=ac.createBiquadFilter(),g=ac.createGain();
  s.buffer=noiseBuf;f.type=type;f.frequency.value=freq;
  g.gain.setValueAtTime(v,t0);g.gain.exponentialRampToValueAtTime(.0001,t0+d);
  s.connect(f).connect(g).connect(sfxGain);s.start(t0);s.stop(t0+d+.03);
}
const sfx={
  // kesmeye başlarken: yumuşak, kısa, tek bir "vınn" (eski cızırtılı tik sesleri kaldırıldı)
  start(){tone(330,.12,'sine',.025,60)},
  capture(){[523,659,784,1046].forEach((f,i)=>tone(f,.14,'triangle',.05,0,i*.06))},
  kill(){tone(320,.22,'triangle',.05,-200)},
  die(){tone(440,.6,'sawtooth',.06,-380);noise(.4,.05,800,'lowpass')},
  pu(){[660,990,1320].forEach((f,i)=>tone(f,.1,'sine',.06,0,i*.05))},
  hit(){tone(170,.2,'square',.06,-80);noise(.15,.04,1200,'lowpass')},
  shoot(){tone(240,.16,'triangle',.03,-140)},
  fuse(){noise(.45,.05,3500);tone(1400,.35,'sine',.012,-900)},
  boom(){noise(.6,.12,300,'lowpass');tone(90,.45,'sawtooth',.06,-50)},
  roar(){tone(85,.8,'sawtooth',.08,-25);noise(.7,.06,500,'lowpass')},
  bossDie(){for(let i=0;i<6;i++)tone(200-i*25,.35,'sawtooth',.05,-90,i*.09);[784,988,1175,1568].forEach((f,i)=>tone(f,.22,'triangle',.06,0,.6+i*.08))},
  secret(){[1046,1318,1568,2093,2637].forEach((f,i)=>tone(f,.25,'sine',.05,0,i*.07))},
  clear(){[523,659,784,1046,1318].forEach((f,i)=>tone(f,.18,'triangle',.06,0,i*.09))},
  click(){tone(700,.05,'sine',.03)},
};

/* Basit sıralayıcı: Am-F-C-G, bas + arpej + yumuşak pad */
const Music={
  timer:null,next:0,step:0,
  start(){if(!ac||this.timer)return;this.next=ac.currentTime+.1;this.step=0;this.timer=setInterval(()=>this.tick(),60)},
  stop(){if(this.timer){clearInterval(this.timer);this.timer=null}},
  note(m,time,d,type,v,cut){
    const o=ac.createOscillator(),g=ac.createGain();let node=o;
    o.type=type;o.frequency.value=440*Math.pow(2,(m-69)/12);
    if(cut){const f=ac.createBiquadFilter();f.type='lowpass';f.frequency.value=cut;o.connect(f);node=f}
    g.gain.setValueAtTime(.0001,time);g.gain.linearRampToValueAtTime(v,time+Math.min(.05,d*.3));
    g.gain.exponentialRampToValueAtTime(.0001,time+d);
    node.connect(g).connect(musGain);o.start(time);o.stop(time+d+.05);
  },
  tick(){
    if(!ac)return;
    const spb=60/108/4;
    while(this.next<ac.currentTime+.3){this.play(this.step,this.next);this.next+=spb;this.step++}
  },
  play(st,time){
    const prog=[[57,60,64],[53,57,60],[48,52,55],[55,59,62]];
    const sec=Math.floor(st/64)%2;
    const ch=prog[Math.floor(st/16)%4],s=st%16;
    if(s%4===0)this.note(ch[0]-24,time,.3,'triangle',.11);
    if(s%4===2)this.note(ch[0]-12,time,.15,'triangle',.05);
    const arp=[0,1,2,1,0,2,1,2];
    if(s%2===0)this.note(ch[arp[(s/2)%8]]+(sec?24:12),time,.18,'sine',.035);
    if(s===0)for(const n of ch)this.note(n,time,2.1,'sawtooth',.012,900);
  }
};
