'use strict';
/* Nasıl Oynanır: kayan, animasyonlu tanıtım kartları */
const TUT_FIELD='<rect x="4" y="4" width="192" height="132" rx="8" fill="#0b1030" stroke="#22d3ee" stroke-width="3"/>';
const TUT_DEFS='<defs><linearGradient id="tgA" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fb923c"/><stop offset="1" stop-color="#db2777"/></linearGradient></defs>';
const TUT_SLIDES=[
  // 1: çiz ve kapat
  ()=>`<svg viewBox="0 0 200 140">${TUT_DEFS}${TUT_FIELD}
    <rect x="60" y="50" width="80" height="86" fill="url(#tgA)" opacity="0"><animate attributeName="opacity" values="0;0;1;1;0" keyTimes="0;.56;.62;.94;1" dur="3.4s" repeatCount="indefinite"/></rect>
    <path d="M60 136V50H140V136" fill="none" stroke="#ffd640" stroke-width="3" stroke-dasharray="252" stroke-dashoffset="252"><animate attributeName="stroke-dashoffset" values="252;0;0;252" keyTimes="0;.56;.94;1" dur="3.4s" repeatCount="indefinite"/></path>
    <circle cx="28" cy="40" r="7" fill="#a855f7"><animate attributeName="cy" values="40;95;40" dur="2.6s" repeatCount="indefinite"/></circle>
    <circle r="6" fill="#ff5fa2" stroke="#fff" stroke-width="2"><animateMotion path="M60 136V50H140V136" keyPoints="0;1;1;0" keyTimes="0;.56;.94;1" calcMode="linear" dur="3.4s" repeatCount="indefinite"/></circle></svg>`,
  // 2: fitil
  ()=>`<svg viewBox="0 0 200 140">${TUT_DEFS}${TUT_FIELD}
    <rect x="40" y="4" width="156" height="36" fill="url(#tgA)" opacity="0"><animate attributeName="opacity" values="0;0;1;1" keyTimes="0;.8;.84;1" dur="3.4s" repeatCount="indefinite"/></rect>
    <path d="M40 136V40H196" fill="none" stroke="#ffd640" stroke-width="3" stroke-dasharray="252" stroke-dashoffset="252"><animate attributeName="stroke-dashoffset" values="252;0;0" keyTimes="0;.8;1" dur="3.4s" repeatCount="indefinite"/></path>
    <circle cx="22" cy="104" r="7" fill="#ef4444"><animate attributeName="cx" values="18;34;18;18" keyTimes="0;.3;.45;1" dur="3.4s" repeatCount="indefinite"/></circle>
    <circle r="5" fill="#ff7a1a" opacity="0"><animate attributeName="opacity" values="0;0;1;1;0" keyTimes="0;.3;.32;.8;.84" dur="3.4s" repeatCount="indefinite"/>
      <animateMotion path="M40 136V40H196" keyPoints=".13;.13;.93;.93" keyTimes="0;.3;.8;1" calcMode="linear" dur="3.4s" repeatCount="indefinite"/></circle>
    <circle r="6" fill="#ff5fa2" stroke="#fff" stroke-width="2"><animateMotion path="M40 136V40H196" keyPoints="0;1;1" keyTimes="0;.8;1" calcMode="linear" dur="3.4s" repeatCount="indefinite"/></circle></svg>`,
  // 3: hedef
  ()=>`<svg viewBox="0 0 200 140">
    <rect x="16" y="30" width="168" height="26" rx="13" fill="#1b2160" stroke="#3b4bb0" stroke-width="2"/>
    <rect x="19" y="33" width="0" height="20" rx="10" fill="#22d3ee"><animate attributeName="width" values="0;131;131" keyTimes="0;.7;1" dur="3s" repeatCount="indefinite"/></rect>
    <line x1="150" y1="22" x2="150" y2="64" stroke="#ffd640" stroke-width="3" stroke-dasharray="4 3"/>
    <text x="150" y="18" text-anchor="middle" fill="#ffd640" font-size="14" font-weight="800">%80</text>
    <text x="60" y="112" text-anchor="middle" font-size="40">🏁</text>
    <text x="100" y="110" text-anchor="middle" fill="#c8cff2" font-size="16" font-weight="800">${t('tut.or')}</text>
    <text x="142" y="112" text-anchor="middle" font-size="40">👑<animateTransform attributeName="transform" type="scale" values="1;1.08;1" dur="1.2s" repeatCount="indefinite" additive="sum"/></text></svg>`,
  // 4: kutular
  ()=>`<div class="tutPus">${['S','F','K','L','P'].map(k=>`<div><span class="pu" style="background:${PU[k].c}">${PU[k].l}</span><small>${t('tut.pu.'+k)}</small></div>`).join('')}</div>`,
  // 5: kalkan ve öfke
  ()=>`<div class="tutBig"><span class="tutChip">🛡 <b class="tutCount">240</b></span><span class="tutMon">👾</span></div>`,
  // 6: gizli yol
  ()=>`<div class="tutBig"><span class="tutSpark">✨</span></div>`,
];
let tutI=0,tutPlay=false,tutCountT=null;
function renderHelp(){
  const box=$('#helpBody');if(!box)return;
  box.innerHTML=`<div class="tutTrack">${TUT_SLIDES.map((f,i)=>`<div class="tutSlide"><div class="tutArt">${f()}</div><p class="tutCap">${t('tut.'+(i+1))}</p></div>`).join('')}</div>`;
  $('#tDots').innerHTML=TUT_SLIDES.map((_,i)=>`<i data-i="${i}"></i>`).join('');
  $('#tDots').querySelectorAll('i').forEach(d=>d.addEventListener('click',()=>tutGo(+d.dataset.i)));
  tutGo(tutI,true);
}
function tutGo(i,instant){
  tutI=Math.max(0,Math.min(TUT_SLIDES.length-1,i));
  const tr=$('#helpBody .tutTrack');if(!tr)return;
  tr.style.transition=instant?'none':'';tr.style.transform=`translateX(${-tutI*100}%)`;
  $('#tDots').querySelectorAll('i').forEach((d,k)=>d.classList.toggle('on',k===tutI));
  $('#tPrev').style.visibility=tutI?'visible':'hidden';
  const last=tutI===TUT_SLIDES.length-1;
  $('#tNext .lbl').textContent=last?(tutPlay?t('tut.go'):t('tut.done')):t('tut.next');
  clearInterval(tutCountT);
  if(tutI===4){let v=240;const el=$('#helpBody .tutSlide:nth-child(5) .tutCount');tutCountT=setInterval(()=>{v=v<=0?240:v-8;if(el){el.textContent=v;el.parentNode.classList.toggle('low',v<=40)}},120)}
}
function openTut(fromPlay){tutPlay=!!fromPlay;tutI=0;renderHelp();show('scrHelp')}
function tutFinish(){
  clearInterval(tutCountT);SAVE.seenTut=1;persist();
  if(tutPlay){tutPlay=false;startGame(nextLevelToPlay())}else show('scrMenu');
}
$('#tNext').addEventListener('click',()=>{sfx.click();if(tutI===TUT_SLIDES.length-1)tutFinish();else tutGo(tutI+1)});
$('#tPrev').addEventListener('click',()=>{sfx.click();tutGo(tutI-1)});
(()=>{ // kaydırma
  const box=$('#helpBody');let sx=null;
  box.addEventListener('pointerdown',e=>{sx=e.clientX});
  box.addEventListener('pointerup',e=>{if(sx==null)return;const d=e.clientX-sx;sx=null;if(Math.abs(d)>40)tutGo(tutI+(d<0?1:-1))});
})();
