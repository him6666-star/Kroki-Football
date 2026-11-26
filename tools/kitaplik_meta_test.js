// index.html'deki lookMeta'yi gercek Google Books / Open Library ile dener (kayit yapmaz).
const fs=require('fs');
const h=fs.readFileSync('kitaplik/index.html','utf8');
const code=h.slice(h.indexOf('const coverAsked=new Set();'),h.indexOf('function queueCovers(){'));
const TR={'ç':'c','ğ':'g','ı':'i','ö':'o','ş':'s','ü':'u','â':'a','î':'i','û':'u'};
const norm=s=>String(s||'').toLocaleLowerCase('tr').replace(/[çğıöşüâîû]/g,c=>TR[c]).normalize('NFD').replace(/[̀-ͯ]/g,'').replace(/[^a-z0-9]+/g,' ').trim();
const books={};const putBooks=async()=>{};const render=()=>{};
eval(code+';globalThis.lookMeta=lookMeta;');
const T=[['Tutunamayanlar','Oğuz Atay'],['Kürk Mantolu Madonna','Sabahattin Ali'],['İnce Memed 1','Yaşar Kemal'],['Saatleri Ayarlama Enstitüsü','Ahmet Hamdi Tanpınar'],['Kara Kitap','Orhan Pamuk'],['Suç ve Ceza','Fyodor Dostoyevski']];
(async()=>{let ok=0;
  for(const [title,author] of T){const id='t'+Math.random();books[id]={id,title,author};
    const ch=await lookMeta(books[id]);if(ch.isbn||ch.pages)ok++;
    console.log(title,'=>',JSON.stringify({isbn:ch.isbn,pages:ch.pages,year:ch.year,publisher:ch.publisher,cover:!!ch.cover}))}
  console.log('ISBN/sayfa bulunan:',ok,'/',T.length);
})();
