// node tools/i18n/build.js  ->  kitaplik/lang-{es,pt,de,fr,id}.js
const fs = require('fs'), path = require('path');
const ROOT = path.join(__dirname, '..', '..'), K = path.join(ROOT, 'kitaplik');
global.window = {}; require(path.join(K, 'lang-en.js')); const EN = window.RAF_EN;
const ORDER = JSON.parse(fs.readFileSync(path.join(__dirname, '_order.json')));
const SPECS = require('./specs.js');
const q = s => JSON.stringify(s);
for (const [L, S] of Object.entries(SPECS)) {
  const arr = JSON.parse(fs.readFileSync(path.join(__dirname, L + '.arr.json')));
  const M = new Map(ORDER.map((e, i) => [e, arr[i]]));
  const miss = new Set();
  const tr = e => { if (M.has(e)) return M.get(e); if (e.trim()) miss.add(e); return e; };
  const exact = {}; for (const [k, v] of Object.entries(EN.exact)) exact[k] = tr(v);
  const phrases = EN.phrases.map(([k, v]) => [k, tr(v)]);
  const T = S.T, W = S.W;
  const rx = x => x.replace(/[.*+?^${}()|[\]\\\/]/g, '\\$&');
  const fixList = [...Object.values(W).filter(([o, m]) => o !== m).map(([o, m]) => ['1 ' + m, '1 ' + o]), ...(S.fix || [])];
  const fixPats = fixList.map(([a, b]) => `[/(^|[^\\d])${rx(a)}(?![\\wÀ-ÿ])/g,${q('$1' + b)}]`).join(',');
  const pats = `[
 [/^Öneri yapabilmem için en az 3 kitabı “Okundu” olarak işaretle ya da puan ver\\. Şu an (\\d+) kitap var\\.$/,(m,n)=>(${T.suggestNeed})(+n)],
 [/^Okuduğun (\\d+) kitaba ve verdiğin puanlara bakarak öneriyorum\\. Kitaplığında olanlar önerilmez\\.$/,(m,n)=>(${T.basedOn})(+n)],
 [/^İstek listen \\((\\d+)\\)$/,${T.wishN}],
 [/^(.*), (\\d+)\\. kitap(, ödünçte)?$/,(m,a,n,l)=>(${T.spine})(a,n,l)],[/^(\\d) yıldız$/,(m,n)=>P(+n,'star')],[/^ve (\\d+) raf var\\.$/,(m,n)=>(${T.andShelves})(+n)],
 [/(\\d+) kitap uzun süredir ödünçte/,(m,n)=>(${T.longLoan})(+n)],[/(\\d+)\\. Raf\\b/g,${T.ShelfN}],[/(\\d+)\\. raf\\b/g,${T.shelfN}],[/Soldan (\\d+)\\. kitap/g,${T.fromLeft}],
 [/(\\d+) kitap(?![a-zçğıöşü])/g,(m,n)=>P(+n,'book')],[/(\\d+) yazar(?![a-zçğıöşü])/g,(m,n)=>P(+n,'author')],[/(\\d+) yayınevi(?![a-zçğıöşü])/g,(m,n)=>P(+n,'publisher')],
 [/(\\d+) okundu\\b/g,${T.readN}],[/(\\d+) raf(?![a-zçğıöşü])/g,(m,n)=>P(+n,'shelf')],[/(\\d+) kişi(?![a-zçğıöşü])/g,(m,n)=>P(+n,'person')],
 [/(\\d+) gündür/g,(m,n)=>(${T.forDays})(+n)],[/(\\d+) gün oldu/g,(m,n)=>(${T.daysAgo})(+n)],[/(\\d+) sayfa(?![a-zçğıöşü])/g,(m,n)=>P(+n,'page')],
 [/Sayfa (\\d+)/g,${T.PageN}],[/^s\\. (\\d+)$/,${T.pAbbr}],[/(\\d+) kitabın/g,(m,n)=>P(+n,'book')],[/(\\d+) kitabı ekle/g,(m,n)=>(${T.addN})(+n)],
 [/^Alıntılar \\((\\d+)\\)$/,${T.quotesN}],[/^Kendi (\\d+) kitabımı da o kitaplığa kopyala \\(okuma ve ödünç bilgilerim benimle gelir\\)$/,(m,n)=>(${T.copyMine})(+n)],
 [/^(.+) \\((\\d+)\\)$/,(m,a,n)=>D.exact[a]?D.exact[a]+' ('+n+')':m],
 ${fixPats}
]`;
  const out = `/* Raf İzi — ${L} (otomatik üretildi: tools/i18n/build.js; elle düzenleme, specs.js / ${L}.arr.json'u değiştir) */
(function(){
const W=${q(W)};
const P=(n,k)=>{const one=W[k][0],many=W[k][1];return n+' '+(${S.pl})};
const D=window.RAF_EN={
x:${S.x},
exact:${q(exact)},
patterns:${pats},
phrases:${q(phrases)}
};
})();
`;
  fs.writeFileSync(path.join(K, 'lang-' + L + '.js'), out);
  console.log(L, 'exact', Object.keys(exact).length, 'phrases', phrases.length, miss.size ? 'EKSIK: ' + [...miss].join(' | ') : 'eksik yok');
}
