/* Raf İzi — English UI dictionary.
   exact:    whole text of a node/attribute → English
   patterns: regex rewrites for counts and numbered labels (run before phrases)
   phrases:  fragments that appear around names/numbers (only multi-word or punctuated, never single words) */
(function(){
const pl=(n,one,many)=>n+' '+(String(n)==='1'?one:many);
window.RAF_EN={
exact:{
// navigation & header
'Raf İzi':'Raf İzi','Bölümler':'Sections','Katalog':'Catalog','Raf Haritası':'Shelf Map','Okuma Listesi':'Reading List','Dizin':'Directory','Kitap Tara':'Scan Book',
'Bende var mı?':'Do I own it?','Raf fotoğrafı':'Shelf photo','Barkod okut':'Scan barcode','Elle ekle':'Add manually','Aile kitaplığı':'Family library','Yedek ve aktarma':'Backup & export',
'Gizlilik politikası':'Privacy policy','Hesabımı ve verilerimi sil':'Delete my account and data','Çıkış yap':'Sign out','Dil: English':'Language: English',
// sign-in
'Raflarının fotoğrafını çek, kitapların kaydedilsin. Bir kitabı aradığında hangi rafta olduğunu söylesin.':'Snap your shelves and your books are saved. Search for a book and see exactly which shelf it is on.',
'Google ile giriş yap':'Sign in with Google','Pencere kapatıldı.':'The window was closed.','Bu adres henüz Google girişine açılmadı.':'Google sign-in is not enabled for this address yet.',
'Giriş yapılamadı, tekrar dene.':'Could not sign in, please try again.','Giriş iptal edildi.':'Sign-in was cancelled.','Google ile giriş yapılamadı, tekrar dene.':'Google sign-in failed, please try again.',
// map page
'Kitaplık Raf Haritası':'Bookcase Shelf Map','Raf Fotoğrafı Tara':'Scan Shelf Photo','Barkod Okut':'Scan Barcode','Raf Diyagramı':'Shelf Diagram','Kitaplık Fotoğrafı':'Bookcase Photo',
'Bu Kitaplığı Tara':'Scan This Bookcase','+ Kitaplık Ekle':'+ Add Bookcase','Seçili Kitabın Raf Konumu':'Selected Book Location','Fotoğrafta Gör':'See in Photo','Detaylar':'Details',
'Seçimi kaldır':'Clear selection','Kitaplığın boş':'Your library is empty','Bir raf fotoğrafı tara ya da kitapların barkodunu okut; raflar burada çizilecek.':'Scan a shelf photo or your books’ barcodes; your shelves will be drawn here.',
'Yerini değiştirmek için kitabı sürükle (telefonda basılı tut) · Detay için dokun':'Drag a book to move it (press and hold on a phone) · Tap for details',
'Kutulara dokununca kitabın detayı açılır':'Tap a box to open the book',
'Bu kitaplık için kayıtlı fotoğraf yok. “Bu Kitaplığı Tara” ile çektiğin fotoğraflar burada kitapların işaretli hâliyle görünür.':'No photos saved for this bookcase yet. Photos you take with “Scan This Bookcase” appear here with each book marked.',
'Boş raf · kitabı buraya sürükle':'Empty shelf · drag a book here','Boş raf':'Empty shelf','Rafı belirsiz kitaplar':'Books with unknown shelf',
'Düzenleme önerisi':'Arrangement ideas','+ Raf ekle':'+ Add shelf','Boş olan son rafı kaldır':'Remove the empty last shelf','Kitaplığın adını değiştir':'Rename bookcase','Kitaplığı sil':'Delete bookcase',
'BURADA':'HERE','ÖDÜNÇ':'LENT','Geri isteme zamanı':'Time to ask for it back','Hatırlat':'Remind','Geri geldi':'Returned','7 gün sonra':'In 7 days',
// catalog
'Kitap adı, yazar, yayınevi veya ISBN…':'Title, author, publisher or ISBN…','Katalogda ara':'Search catalog','Sırala':'Sort','Ada göre':'By title','Yazara göre':'By author','Yayınevine göre':'By publisher','Son eklenen':'Recently added',
'Ödünçtekiler':'Lent out','Filtreyi kaldır':'Remove filter','Eşleşen kitap yok.':'No matching books.','Henüz kitap eklenmedi.':'No books added yet.','Kitaplığında ara':'Search your library',
'Okunacak':'To read','Okunuyor':'Reading','Okundu':'Read','Yeri yok':'No location','Yeri girilmemiş':'No location yet',
// reading list
'Okuduğun kitapların sayfa ilerlemesini, puanlarını ve notlarını buradan takip et.':'Track your page progress, ratings and notes here.',
'Şu An Okunan':'Reading Now','Okunacak Kuyruğu':'To-Read Queue','Tamamlanan Kitap':'Books Finished','Toplam Okunan Sayfa':'Total Pages Read',
'İşaretlenmemiş':'Unmarked','Tümü':'All','Okunan sayfa':'Pages read','Bitirdim':'Finished','Okumaya başla':'Start reading','Okunacaklara ekle':'Add to to-read','Okudum':'I read it',
'Rafta Göster':'Show on Shelf','Rafta göster':'Show on shelf','Puan':'Rating','Şu an okuduğun kitap yok.':'You are not reading anything right now.','Tüm kitapların işaretli.':'All your books are marked.','Bu listede kitap yok.':'No books in this list.',
'Son 12 ayda biten kitaplar':'Books finished in the last 12 months','Kitaplığındaki kategoriler':'Categories in your library','Tüm kitaplar':'All books','En çok okuduğun yazarlar':'Your most-read authors','Okunan kitap sayısı':'Books read','Henüz veri yok.':'No data yet.',
// directory
'Kütüphane Dizini':'Library Directory','Kitaplarını yayınevine, yazara veya kategoriye göre gruplanmış biçimde incele.':'Browse your books grouped by publisher, author or category.',
'Yayınevleri':'Publishers','Yazarlar':'Authors','Kategoriler':'Categories','Ödünç verdiklerim':'Lent out','Henüz gruplanacak bilgi yok.':'Nothing to group yet.',
'Yayınevi belirtilmemiş':'No publisher','Yazarı belirtilmemiş':'No author','Kategorisi belirtilmemiş':'No category','belirtilmemiş':'not set',
'Şu an ödünç verdiğin kitap yok. Bir kitabın üstüne basılı tutup “Ödünç ver”i seçebilirsin.':'You haven’t lent any books. Press and hold a book and choose “Lend”.',
// drawer
'Kitap detayı':'Book details','Düzenle':'Edit','Kapat':'Close','Kitap':'Book','Yeni kitap':'New book','Raf Fotoğrafı':'Shelf photo','Barkod':'Barcode','Elle eklendi':'Added manually',
'Kapak ara':'Find cover','Kapağı yenile':'Refresh cover','İnternetten tamamla':'Fill in from the web','Bilgileri yenile':'Refresh details','Aranıyor…':'Searching…',
'Kitaplıktaki Konumu':'Location in your bookcase','Yerini değiştir':'Move','Kitaplık':'Bookcase','Raf':'Shelf','Rafsız':'No shelf','Kitaplık seç':'Choose bookcase','+ Yeni kitaplık…':'+ New bookcase…',
'◀ Sola':'◀ Left','Sağa ▶':'Right ▶','▲ Üst raf':'▲ Shelf up','▼ Alt raf':'▼ Shelf down',
'Yazar':'Author','Yayınevi':'Publisher','Kategori':'Category','ISBN':'ISBN','Sayfa Sayısı':'Pages','Basım Yılı':'Year','Özet':'Summary',
'Okuma Takibi':'Reading','Okunan Sayfa':'Pages Read','Değerlendirme':'Rating','Okuma Notları':'Reading notes','Notunu yaz; dışarı tıklayınca kaydedilir.':'Write a note; it saves when you click outside.','Kitabı sil':'Delete book',
'Ödünç':'Lending','Ödünç ver':'Lend','Kimde:':'With:','Bilgileri düzenle':'Edit details','Elle kitap ekle':'Add a book manually','Kitap adı':'Title','Sayfa sayısı':'Pages','Basım yılı':'Year',
'Raf (üstten)':'Shelf (from top)','Kaydet':'Save','Vazgeç':'Cancel','Sil':'Delete','Silinsin mi? Tekrar dokun':'Delete? Tap again','Emin misin? Tekrar dokun':'Are you sure? Tap again',
'Alıntılar':'Quotes','Sayfadan alıntı':'Quote from page','Galeriden':'From gallery','Yaz':'Type','Alıntı metni':'Quote text','Sayfa no':'Page no.',
'Altını çizdiğin bir paragrafın fotoğrafını çek; metni ve sayfa numarasını kitabın alıntılarına kaydedeyim.':'Take a photo of a passage you underlined; I’ll save the text and page number to this book’s quotes.',
'Kopyala':'Copy','Paylaş':'Share','Sayfa hazırlanıyor…':'Preparing page…','Altı çizili bölüm okunuyor…':'Reading the underlined passage…',
'Metni kontrol et, gerekirse düzelt ve kaydet.':'Check the text, fix it if needed and save.','İşaretli bir bölüm göremedim; sayfadaki belirgin paragrafı aldım. İstediğin kısmı bırakıp gerisini silebilirsin.':'I couldn’t see a marked passage, so I took the main paragraph. Keep the part you want and delete the rest.',
'Sayfada okunabilir metin bulunamadı; daha yakından ve düz çekmeyi dene ya da metni elle yaz.':'No readable text found. Try a closer, straighter photo or type the text.',
'Alıntı kaydedildi':'Quote saved','Alıntı kopyalandı':'Quote copied','Alıntı silindi':'Quote deleted',
// loan
'Ödünç bilgisini düzenle':'Edit lending details','Kime verdin?':'Who did you lend it to?','ör. Ayşe':'e.g. Emma','Ne zaman verdin?':'When did you lend it?','Ne zaman hatırlatayım?':'When should I remind you?',
'1 hafta sonra':'After 1 week','2 hafta sonra':'After 2 weeks','1 ay sonra':'After 1 month','2 ay sonra':'After 2 months','3 ay sonra':'After 3 months','Hatırlatma yok':'No reminder',
'Not (isteğe bağlı)':'Note (optional)','ör. okuyup bitirince getirecek':'e.g. will bring it back when finished','Hatırlatma:':'Reminder:','Ödünç hatırlatma':'Lending reminder',
'7 gün sonra tekrar hatırlatılacak':'I’ll remind you again in 7 days',
// book menu
'Detayları aç':'Open details','Ödünçten geri geldi':'It came back','Ödünç ver…':'Lend…','Raftan çıkar (rafı belirsiz)':'Take off shelf (shelf unknown)','Rafı belirsiz yapıldı':'Shelf set to unknown',
// sheets: shelf scan
'Raf fotoğrafı tara':'Scan a shelf photo','Hangi kitaplık?':'Which bookcase?','ör. Salon':'e.g. Living room','Fotoğraftaki en üst raf kaçıncı?':'Which shelf is the top one in the photo?',
'Bütün dolabı ya da tek bir rafı çekebilirsin. Rafın tam karşısına geç, flaşı kapat; sırtlar okunaklı olsun.':'Photograph the whole bookcase or a single shelf. Stand straight in front, turn the flash off and make sure the spines are readable.',
'Fotoğraf çek':'Take photo','Galeriden seç':'Choose from gallery','Kitapları tanı':'Recognise books','Yanlış okunanları düzelt, istemediklerinin işaretini kaldır.':'Fix anything misread and untick the ones you don’t want.',
'Bu raflarda kayıtlı olup fotoğrafta görünmeyen kitapların rafını “belirsiz” yap':'Mark books saved on these shelves but missing from the photo as “shelf unknown”',
'Seçilenleri kaydet':'Save selected','Yeni':'New','Kayıtlı · yeri güncellenecek':'Saved · location will update','Emin değil':'Unsure','Fotoğraf hazırlanıyor…':'Preparing photo…',
'Kitaplar okunuyor… (10–40 sn sürebilir)':'Reading books… (may take 10–40 s)','Hiç kitap okunamadı. Daha yakından ya da rafları tek tek çekmeyi dene.':'No books could be read. Try closer, or one shelf at a time.',
'Önce kitaplığın adını yaz (ör. Salon).':'Enter the bookcase name first (e.g. Living room).','Kaydediliyor…':'Saving…','Sıra':'Position','Soldan sıra':'Position from left',
// sheets: barcode
'Arka kapağı çek':'Photograph back cover','Kitabın arka kapağını barkod ve yazılar görünecek şekilde çek.':'Photograph the back cover so the barcode and text are visible.',
'ISBN (barkod numarası)':'ISBN (barcode number)','Kaydet, sıradaki':'Save, next','Barkod okunuyor…':'Reading barcode…','Bilgiler okunuyor…':'Reading details…',
'Barkod çözülemedi, kapaktaki yazılardan okunuyor…':'Couldn’t decode the barcode, reading the cover text…','Bilgileri kontrol edip kaydet.':'Check the details and save.','Bilgileri elle yazabilirsin.':'You can type the details yourself.',
'Kitap adı boş olamaz.':'Title can’t be empty.','Sıradaki kitabın arka kapağını çek.':'Photograph the next book’s back cover.',
// check
'Kitapçıda kitabın arka kapağındaki barkodu çek; kitaplığında olup olmadığını, varsa hangi rafta olduğunu hemen söyleyeyim.':'At the bookshop, photograph the barcode on the back cover and I’ll tell you right away whether you own it — and which shelf it’s on.',
'Barkodu çek':'Photograph barcode','ya da barkod numarasını / kitabın adını yaz':'or type the barcode number / title','978… ya da kitap adı':'978… or title',
'Bu kitap sende var':'You own this book','Sende yok':'You don’t own it','Sıradaki kitabı okut':'Scan next book','Aldım, kitaplığa ekle':'I bought it, add to library',
'Bunu okudun.':'You’ve read it.','Şu an okuyorsun.':'You’re reading it now.','Okunacaklar listende.':'It’s on your to-read list.','Bilinmeyen kitap':'Unknown book',
'Bu barkodla internette kitap bilgisi bulunamadı; kitaplığında da yok.':'No book details found online for this barcode, and it isn’t in your library.',
'Barkod okunamadı, kapaktaki yazılardan bakılıyor…':'Couldn’t read the barcode, checking the cover text…','Barkod numarasını ya da kitabın adını aşağıya yazabilirsin.':'You can type the barcode number or title below.',
'Kitaplığında bu barkod yok; kitabın adı bulunuyor…':'This barcode isn’t in your library; looking up the title…',
// family
'Aile kitaplığı giriş yapınca çalışır.':'Family library works after you sign in.','Evdekileri davet et: kendi Google hesaplarıyla aynı kitaplığı görsünler, kitap eklesinler, raf düzenlesinler.':'Invite your household: they see the same library with their own Google account, add books and arrange shelves.',
'Okuma ve ödünç bilgileri herkesin kendine özel kalır.':'Reading and lending details stay private to each person.','Davet':'Invite','Davet kodu oluştur':'Create invite code','Davet kodu':'Invite code','Katıl':'Join',
'Başka birinin kitaplığına katıl':'Join someone else’s library','Sen':'You','kitaplık sahibi':'owner','Aile üyesi':'Family member','Çıkar':'Remove','Çıkarıldı.':'Removed.',
'Bir aile kitaplığındasın. Kitapları herkes görür ve ekleyebilir; okuma ve ödünç bilgilerin yalnızca sende.':'You’re in a family library. Everyone sees and can add books; your reading and lending details are yours only.',
'Aile kitaplığından ayrıl':'Leave family library','Ayrılınca kendi kitaplığına dönersin; bu kitaplıktaki okuma bilgilerin silinir.':'You’ll go back to your own library; your reading details in this library will be deleted.',
'Kod 7 gün geçerli. Katılan kişi kendi Google hesabıyla girer.':'The code is valid for 7 days. The person joining signs in with their own Google account.',
"WhatsApp'tan gönder":'Send via WhatsApp','Mesajı kopyala':'Copy message','Kopyalandı':'Copied','Kopyalanamadı':'Couldn’t copy','Bekle…':'Please wait…','Davet kodunu yaz.':'Enter the invite code.',
'Aile kitaplığından ayrıldın; kendi kitaplığındasın':'You left the family library; you’re back in your own','Olmadı, tekrar dene.':'That didn’t work, try again.','Olmadı, tekrar dene':'That didn’t work, try again',
// data
'Dışa aktar':'Export','Excel olarak indir':'Download as Excel','Yedek dosyası indir':'Download backup file','İçe aktar':'Import','Dosya seç (Excel, CSV, Goodreads, Raf İzi yedeği)':'Choose file (Excel, CSV, Goodreads, Raf İzi backup)',
'Excel dosyasında tüm kitapların yeri, okuma ve ödünç bilgileriyle olur. Yedek dosyası (.json) Raf İzi\'ye geri yüklemek içindir.':'The Excel file contains all your books with location, reading and lending details. The backup file (.json) is for restoring into Raf İzi.',
"Goodreads'ten: My Books → Import and export → Export Library ile indirdiğin CSV dosyasını seç. Kendi Excel listende ilk satırda “Kitap”, “Yazar”, “Yayınevi”, “ISBN” gibi başlıklar olsun. Zaten kayıtlı kitaplar atlanır.":'From Goodreads: choose the CSV you downloaded via My Books → Import and export → Export Library. In your own spreadsheet, use headers like “Title”, “Author”, “Publisher”, “ISBN” in the first row. Books you already have are skipped.',
'Hazırlanıyor…':'Preparing…','Dosya hazır':'File ready','Dosya okunuyor…':'Reading file…','Ekleniyor…':'Adding…','Dosya okunamadı.':'Couldn’t read the file.','Dosyada satır bulunamadı.':'No rows found in the file.',
'Bu bir Raf İzi yedek dosyası değil.':'This isn’t a Raf İzi backup file.','Kitap adı sütunu bulunamadı (başlık “Kitap” ya da “Title” olmalı).':'No title column found (header should be “Title” or “Kitap”).',
'Excel modülü yüklenemedi; internet bağlantını kontrol et.':'Couldn’t load the Excel module; check your internet connection.','Dosyayı kaydet ya da gönder':'Save or send the file','Ekle':'Add',
// arrange
'Raf düzenleme önerisi':'Arrangement ideas','Kategoriye göre':'By category','Kitap adına göre':'By title','Renge göre':'By colour','Bu düzeni kaydet':'Save this arrangement','Kitapların zaten bu sırada.':'Your books are already in this order.',
'Renge göre dizmek için kitapların raf fotoğrafıyla taranmış olması gerekiyor; renkleri fotoğraftan okuyorum. Bu kitaplıkta henüz fotoğrafla taranmış kitap yok.':'To arrange by colour, books need to have been scanned from a shelf photo — I read the colours from the photo. No books in this bookcase have been scanned that way yet.',
// bookcases
'Yeni kitaplık':'New bookcase','Yeni kitaplığın adı':'New bookcase name','Kitaplığın yeni adı':'New bookcase name','ör. Çalışma Odası':'e.g. Study','Tamam':'OK',
'Kitaplarıyla birlikte sil':'Delete with its books','Sadece kitaplığı sil':'Delete only the bookcase','Kitaplar kalır, “Yeri girilmemiş” olarak görünür.':'The books stay and show as “No location yet”.',
// account
'Hesabını ve verilerini sil':'Delete your account and data','Hesabımı kalıcı olarak sil':'Delete my account permanently','Siliniyor…':'Deleting…','Hesabın ve tüm verilerin silindi':'Your account and all your data were deleted',
'Bu önizlemede hesap silme kapalı.':'Account deletion is off in this preview.','Aile kitaplığından da çıkarılırsın; ortak kitaplar silinmez.':'You’ll also be removed from the family library; shared books are not deleted.',
'hesap silme':'account deletion','yaz':'','Bu kitaplıkta':'This bookcase has','Bu düzende':'In this arrangement','Bu işlem':'This permanently deletes','Onaylamak için':'To confirm, type',
'yeri değişir (altın çerçeveli olanlar). Her raftaki kitap sayısı aynı kalır.':'move (outlined in gold). Each shelf keeps the same number of books.','SİL':'DELETE',
// misc toasts & errors
'Kaydedildi':'Saved','Kaydedilemedi':'Couldn’t save','Silinemedi':'Couldn’t delete','Geri al':'Undo','Geri alındı':'Undone','Geri alınamadı':'Couldn’t undo','Taşınamadı':'Couldn’t move',
'Önce giriş yapmalısın.':'Please sign in first.','Önce kitaplık seç':'Choose a bookcase first','Kitaplar yükleniyor…':'Loading books…','Kayıtlara şu an ulaşılamıyor; bağlantını kontrol et.':'Can’t reach your records right now; check your connection.',
'Bugünlük tanıma hakkın doldu, yarın tekrar dene.':'You’ve used today’s recognitions, try again tomorrow.','Yanıt gecikti; tekrar dene ya da rafları ayrı ayrı çek.':'The response took too long; try again or photograph one shelf at a time.',
'Tanıma servisine ulaşılamadı, biraz sonra tekrar dene.':'Couldn’t reach the recognition service, try again shortly.','Yanıt anlaşılamadı, tekrar dene.':'Couldn’t understand the response, try again.','Bir hata oldu.':'Something went wrong.',
'Kitap tanıma bu önizlemede kapalı; yayındaki sitede çalışır.':'Book recognition is off in this preview; it works on the live site.','İnternette yeni bilgi bulunamadı':'No new details found online','Kapak bulundu':'Cover found','Kapak bulunamadı':'No cover found',
'Önizleme: örnek kitaplar gösteriliyor; değişiklikler kaydedilmez, kitap tanıma kapalı.':'Preview: sample books are shown; changes aren’t saved and recognition is off.',
'Raf İzi: evdeki kitaplarını raf fotoğrafı ve barkodla kaydet, hangi rafta olduğunu anında bul.':'Raf İzi: record your home library from shelf photos and barcodes and instantly find which shelf a book is on.',
'Barkod farklı: sendeki başka bir baskısı olabilir':'Different barcode: you may own another edition','Durum':'Status','Notlar':'Notes','Sayfa':'Pages','Tarih':'Date',
'Roman':'Novel','Klasik':'Classic','Distopya':'Dystopia','Bilim Kurgu':'Science fiction','Tarih':'History','Bilim':'Science','Felsefe':'Philosophy','Şiir':'Poetry','Çocuk':'Children','Deneme':'Essay','Biyografi':'Biography','Psikoloji':'Psychology','Ders':'Textbook'
},
patterns:[
 [/^(.*), (\d+)\. kitap(, ödünçte)?$/,(m,a,n,l)=>a+', book '+n+(l?', lent out':'')],[/^(\d) yıldız$/,(m,n)=>pl(n,'star','stars')],[/^ve (\d+) raf var\.$/,(m,n)=>'and '+pl(n,'shelf','shelves')+'.'],
 [/(\d+) kitap uzun süredir ödünçte/,(m,n)=>pl(n,'book has','books have')+' been out for a long time'],[/(\d+)\. Raf\b/g,'Shelf $1'],[/(\d+)\. raf\b/g,'shelf $1'],[/Soldan (\d+)\. kitap/g,'book $1 from left'],
 [/(\d+) kitap(?![a-zçğıöşü])/g,(m,n)=>pl(n,'book','books')],[/(\d+) yazar(?![a-zçğıöşü])/g,(m,n)=>pl(n,'author','authors')],[/(\d+) yayınevi(?![a-zçğıöşü])/g,(m,n)=>pl(n,'publisher','publishers')],
 [/(\d+) okundu\b/g,'$1 read'],[/(\d+) raf(?![a-zçğıöşü])/g,(m,n)=>pl(n,'shelf','shelves')],[/(\d+) kişi(?![a-zçğıöşü])/g,(m,n)=>pl(n,'person','people')],
 [/(\d+) gündür/g,(m,n)=>'for '+pl(n,'day','days')],[/(\d+) gün oldu/g,(m,n)=>pl(n,'day','days')+' ago'],[/(\d+) sayfa(?![a-zçğıöşü])/g,(m,n)=>pl(n,'page','pages')],
 [/Sayfa (\d+)/g,'Page $1'],[/^s\. (\d+)$/,'p. $1'],[/(\d+) kitabın/g,(m,n)=>pl(n,'book’s','books’')],[/(\d+) kitabı ekle/g,(m,n)=>'Add '+pl(n,'book','books')],
 [/\b1 books\b/g,'1 book'],[/\b1 shelves\b/g,'1 shelf'],[/\b1 people\b/g,'1 person'],
 [/^Alıntılar \((\d+)\)$/,'Quotes ($1)'],[/^Kendi (\d+) kitabımı da o kitaplığa kopyala \(okuma ve ödünç bilgilerim benimle gelir\)$/,(m,n)=>'Also copy my '+pl(n,'book','books')+' into that library (my reading and lending details come with me)'],[/^(.+) \((\d+)\)$/,(m,a,n)=>{const T={'Okunuyor':'Reading','Okunacak':'To read','Okundu':'Read','İşaretlenmemiş':'Unmarked','Tümü':'All','Yayınevleri':'Publishers','Yazarlar':'Authors','Kategoriler':'Categories','Ödünç verdiklerim':'Lent out','Ödünçtekiler':'Lent out'};return T[a]?T[a]+' ('+n+')':m}]
],
phrases:[
 [' · raf belirsiz',' · shelf unknown'],['raf kitap kayıtlı','shelves'],[' kitap kayıtlı',' books saved'],
 ['Kitaplığında ara (','Search your library ('],['): kitap adı, yazar, yayınevi veya ISBN…','): title, author, publisher or ISBN…'],
 [' · aile kitaplığı (',' · family library ('],
 ['Kitaplığında “','Nothing in your library matches “'],['” ile eşleşen kitap yok.','”.'],
 ['Üstteki raf:','Top shelf:'],
 ['Rafı belirsiz kitaplar · bir kitabı rafından çıkarmak için buraya sürükle','Books with unknown shelf · drag a book here to take it off its shelf'],
 ['Rengi bilinmeyen ','Unknown colour: '],[' kitap sona kondu; renk yalnızca raf fotoğrafıyla taranan kitaplardan okunabiliyor.',' put at the end; colour can only be read from books scanned in a shelf photo.'],
 ['Bu düzende ','In this arrangement '],[' yeri değişir (altın çerçeveli olanlar). Her raftaki kitap sayısı aynı kalır.',' move (outlined in gold). Each shelf keeps the same number of books.'],
 [' için kitapları nasıl dizebileceğini raf raf gösteriyorum. Beğenirsen kitapları bu sıraya göre dizip “Bu düzeni kaydet”e dokun.',': here’s how you could arrange the books, shelf by shelf. If you like it, arrange them this way and tap “Save this arrangement”.'],
 ['’nı sil',' — delete'],[' kitap ve ',' books and '],[' raf var.',' shelves.'],['Bu kitaplıkta ','This bookcase has '],
 [' kitabın kaydı, notları ve okuma bilgileri de silinir.',' book records, notes and reading details will also be deleted.'],
 ['Bu işlem ','This permanently deletes '],[', tüm kitaplık ve raf bilgilerin, okuma ve ödünç kayıtların, notların, saklanan raf fotoğrafların ve Raf İzi hesabın kalıcı olarak silinir. Geri alınamaz.',', all your bookcases and shelves, reading and lending records, notes, saved shelf photos and your Raf İzi account. This can’t be undone.'],
 ['Google hesabının kendisi etkilenmez. Ayrıntılar:','Your Google account itself is not affected. Details:'],['Onaylamak için ','To confirm, type '],
 ['Bu kitaplığı ','You share this library with '],[' kişiyle paylaşıyorsun: ortak kitaplık da silinir ve onlar erişimini kaybeder.',' people: the shared library will be deleted too and they lose access.'],
 ['Kitaplığını ','You share your library with '],[' kişiyle paylaşıyorsun.',' people.'],
 
 ['Aile kitaplığına katıldın','You joined the family library'],[' kitabın kopyalandı',' books copied'],
 ['Kimde: ','With: '],[' · en eskisi ',' · oldest '],[' kitap daha: Dizin → Ödünç verdiklerim',' more: Directory → Lent out'],
 [' tarihinde verdin · ',' lent · '],
 ['Ödünç verildi: ','Lent to: '],[' gün sonra hatırlatacağım.','-day reminder set.'],
 ['Ödünçte · ','Lent · '],['Şu an ödünçte · ','Currently lent · '],['Şu an ödünçte, ','Currently lent, '],['kimde: ','with: '],[' · verildi: ',' · lent on: '],
 ['Ödünç: ','Lent: '],[' geri geldi',' came back'],
 ['Barkod ','Barcode '],[' · kitaplığına bakılıyor…',' · checking your library…'],['Barkod: ','Barcode: '],['. Bilgiler okunuyor…','. Reading details…'],
 ['Bu kitap zaten kayıtlı: ','Already in your library: '],[' (okuttuğun: ',' (scanned: '],['Emin olamadı, ','Not sure, '],
 ['Eklendi: ','Added: '],['Güncellendi: ','Updated: '],['Kaydedilemedi: ','Couldn’t save: '],['Eklenemedi: ','Couldn’t add: '],['Silinemedi: ','Couldn’t delete: '],['Silindi: ','Deleted: '],
 ['Taşındı: ','Moved: '],[', soldan ',', position '],
 [' kitap bulundu.',' books found.'],[' tanesi zaten kitaplığında (atlanacak)',' already in your library (will be skipped)'],
 [' kitap eklendi; kapak ve eksik bilgiler arka planda tamamlanıyor',' books added; covers and missing details are being filled in'],
 [' yeni, ',' new, '],[' güncellendi',' updated'],[' kitabın rafı belirsiz',' books set to shelf unknown'],[' kitabın yeri güncellendi',' books moved'],
 [' · toplam sayfa sayısını detaydan gir',' · add the total pages in details'],
 ['Şu an okuduğun kitap yok. Yeni eklediğin ','You aren’t reading anything right now. Your '],[' kitap “İşaretlenmemiş” sekmesinde; oradan okumaya başlayabilirsin.',' new books are in the “Unmarked” tab; start reading from there.'],
 ['Kayıtlar okunamadı (','Couldn’t read records ('],[' sonra tekrar hatırlatılacak',' later'],
 [' (yeni)',' (new)'],['Eklendi: kapak','Added: cover'],[', sayfa sayısı',', pages'],[', basım yılı',', year'],[', yayınevi',', publisher'],
 ['Kitap adı','Title'],
]
};
})();
