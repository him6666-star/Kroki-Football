// Her dil icin: sayili kaliplar + kod icindeki metinler (WhatsApp, bildirim, davet, Excel sutunlari...).
// build.js bunlari lang-en.js'teki Turkce anahtarlarla birlestirip kitaplik/lang-XX.js uretir.
// W: kelime tablosu [tekil, cogul]. Kaliplar build.js'te ortak sablondan uretilir.
module.exports = {
es: {
  fix: [['1 leídos','1 leído'],['1 libro encontrados','1 libro encontrado'],['1 libro guardados','1 libro guardado']],
  pl: 'n==1?one:many',
  W: {book: ['libro', 'libros'], author: ['autor', 'autores'], publisher: ['editorial', 'editoriales'], shelf: ['estante', 'estantes'], person: ['persona', 'personas'], day: ['día', 'días'], page: ['página', 'páginas'], star: ['estrella', 'estrellas']},
  T: {
    suggestNeed: "n=>'Para recomendarte libros necesito al menos 3 marcados como «Leído» o puntuados. Ahora tienes '+n+'.'",
    basedOn: "n=>'Según los '+P(n,'book')+' que has leído y tus puntuaciones. No se recomiendan los que ya tienes.'",
    wishN: "'Lista de deseos ($1)'",
    spine: "(a,n,l)=>a+', libro '+n+(l?', prestado':'')",
    andShelves: "n=>'y '+P(n,'shelf')+'.'",
    longLoan: "n=>n==1?'1 libro lleva mucho tiempo prestado':n+' libros llevan mucho tiempo prestados'",
    ShelfN: "'Estante $1'", shelfN: "'estante $1'", fromLeft: "'libro $1 desde la izquierda'",
    readN: "'$1 leídos'", forDays: "n=>'desde hace '+P(n,'day')", daysAgo: "n=>'hace '+P(n,'day')",
    PageN: "'Página $1'", pAbbr: "'p. $1'", addN: "n=>'Añadir '+P(n,'book')", quotesN: "'Citas ($1)'",
    copyMine: "n=>'Copiar también mis '+P(n,'book')+' a esa biblioteca (mis datos de lectura y préstamo vienen conmigo)'"
  },
  x: `{sample:{cases:['Salón','Despacho'],notes:['Las descripciones del valle de Salinas son impresionantes.','Sigue sin igual en ecología y política.']},loc:'es-ES',months:['ene','feb','mar','abr','may','jun','jul','ago','sep','oct','nov','dic'],pageAbbr:', p. ',noLoc:'Sin ubicación',bookWord:'libro',
 caseLabel:n=>n,
 locText:(b,cl)=>{if(!b.bookcase)return 'Aún sin ubicación';let s=cl(b.bookcase);if(!b.shelf)return s+' · estante desconocido';s+=' · estante '+b.shelf+' (desde arriba)';if(b.pos)s+=' · libro '+b.pos+' desde la izquierda';return s},
 shelfShort:n=>' · Estante '+n,
 cols:{Kitap:'Título',Yazar:'Autor','Yayınevi':'Editorial',Kategori:'Categoría',ISBN:'ISBN',Sayfa:'Páginas','Basım yılı':'Año','Kitaplık':'Estantería',Raf:'Estante','Sıra':'Posición',Durum:'Estado','Okunan sayfa':'Páginas leídas',Puan:'Puntuación',Notlar:'Notas'},
 colQuotes:'Citas',colLentTo:'Prestado a',colLentOn:'Fecha de préstamo',sheet:'Libros',fileLib:'biblioteca',fileBak:'copia',
 wa:(to,title,d)=>\`¡Hola, \${to}! ¿Sigues teniendo «\${title}», que te presté el \${d}? Si ya lo terminaste, ¿me lo podrías devolver cuando puedas? ¡Gracias!\`,
 notif:(title,to)=>\`«\${title}» lo tiene \${to}. ¿Quieres pedírselo?\`,
 invite:(link,code)=>\`¡Únete a nuestra biblioteca de casa en Raf İzi! Abre este enlace: \${link} o en la app ve al menú Escanear libro → Biblioteca familiar → escribe el código: \${code} (válido 7 días)\`}`
},
pt: {
  fix: [['1 lidos','1 lido'],['1 livro encontrados','1 livro encontrado'],['1 livro salvos','1 livro salvo']],
  pl: 'n==1?one:many',
  W: {book: ['livro', 'livros'], author: ['autor', 'autores'], publisher: ['editora', 'editoras'], shelf: ['prateleira', 'prateleiras'], person: ['pessoa', 'pessoas'], day: ['dia', 'dias'], page: ['página', 'páginas'], star: ['estrela', 'estrelas']},
  T: {
    suggestNeed: "n=>'Para sugerir livros preciso de pelo menos 3 marcados como “Lido” ou com nota. Agora você tem '+n+'.'",
    basedOn: "n=>'Com base nos '+P(n,'book')+' que você leu e nas suas notas. Livros que você já tem ficam de fora.'",
    wishN: "'Lista de desejos ($1)'",
    spine: "(a,n,l)=>a+', livro '+n+(l?', emprestado':'')",
    andShelves: "n=>'e '+P(n,'shelf')+'.'",
    longLoan: "n=>n==1?'1 livro está emprestado há muito tempo':n+' livros estão emprestados há muito tempo'",
    ShelfN: "'Prateleira $1'", shelfN: "'prateleira $1'", fromLeft: "'livro $1 a partir da esquerda'",
    readN: "'$1 lidos'", forDays: "n=>'há '+P(n,'day')", daysAgo: "n=>'há '+P(n,'day')",
    PageN: "'Página $1'", pAbbr: "'p. $1'", addN: "n=>'Adicionar '+P(n,'book')", quotesN: "'Citações ($1)'",
    copyMine: "n=>'Copiar também meus '+P(n,'book')+' para essa biblioteca (meus dados de leitura e empréstimo vêm comigo)'"
  },
  x: `{sample:{cases:['Sala','Escritório'],notes:['As descrições do vale de Salinas são impressionantes.','Continua imbatível em ecologia e política.']},loc:'pt-BR',months:['jan','fev','mar','abr','mai','jun','jul','ago','set','out','nov','dez'],pageAbbr:', p. ',noLoc:'Sem local',bookWord:'livro',
 caseLabel:n=>n,
 locText:(b,cl)=>{if(!b.bookcase)return 'Ainda sem local';let s=cl(b.bookcase);if(!b.shelf)return s+' · prateleira desconhecida';s+=' · prateleira '+b.shelf+' (de cima)';if(b.pos)s+=' · livro '+b.pos+' a partir da esquerda';return s},
 shelfShort:n=>' · Prateleira '+n,
 cols:{Kitap:'Título',Yazar:'Autor','Yayınevi':'Editora',Kategori:'Categoria',ISBN:'ISBN',Sayfa:'Páginas','Basım yılı':'Ano','Kitaplık':'Estante',Raf:'Prateleira','Sıra':'Posição',Durum:'Status','Okunan sayfa':'Páginas lidas',Puan:'Nota',Notlar:'Anotações'},
 colQuotes:'Citações',colLentTo:'Emprestado para',colLentOn:'Data do empréstimo',sheet:'Livros',fileLib:'biblioteca',fileBak:'backup',
 wa:(to,title,d)=>\`Oi, \${to}! Você ainda está com “\${title}”, que te emprestei em \${d}? Se já terminou, pode me devolver quando der? Obrigado!\`,
 notif:(title,to)=>\`“\${title}” está com \${to}. Quer pedir de volta?\`,
 invite:(link,code)=>\`Entre na nossa biblioteca de casa no Raf İzi! Abra este link: \${link} ou, no app, vá ao menu Escanear livro → Biblioteca da família → digite o código: \${code} (vale por 7 dias)\`}`
},
de: {
  pl: 'n==1?one:many',
  W: {book: ['Buch', 'Bücher'], author: ['Autor', 'Autoren'], publisher: ['Verlag', 'Verlage'], shelf: ['Fach', 'Fächer'], person: ['Person', 'Personen'], day: ['Tag', 'Tage'], page: ['Seite', 'Seiten'], star: ['Stern', 'Sterne']},
  T: {
    suggestNeed: "n=>'Für Vorschläge brauche ich mindestens 3 Bücher, die als „Gelesen“ markiert oder bewertet sind. Bisher sind es '+n+'.'",
    basedOn: "n=>'Basierend auf '+n+' gelesenen '+(n==1?'Buch':'Büchern')+' und deinen Bewertungen. Bücher, die du schon hast, werden nicht vorgeschlagen.'",
    wishN: "'Wunschliste ($1)'",
    spine: "(a,n,l)=>a+', Buch '+n+(l?', verliehen':'')",
    andShelves: "n=>'und '+P(n,'shelf')+'.'",
    longLoan: "n=>n==1?'1 Buch ist schon lange verliehen':n+' Bücher sind schon lange verliehen'",
    ShelfN: "'Fach $1'", shelfN: "'Fach $1'", fromLeft: "'Buch $1 von links'",
    readN: "'$1 gelesen'", forDays: "n=>'seit '+(n==1?'1 Tag':n+' Tagen')", daysAgo: "n=>'vor '+(n==1?'1 Tag':n+' Tagen')",
    PageN: "'Seite $1'", pAbbr: "'S. $1'", addN: "n=>P(n,'book')+' hinzufügen'", quotesN: "'Zitate ($1)'",
    copyMine: "n=>'Auch '+(n==1?'mein 1 Buch':'meine '+n+' Bücher')+' in diese Bibliothek kopieren (meine Lese- und Verleihdaten kommen mit)'"
  },
  x: `{sample:{cases:['Wohnzimmer','Arbeitszimmer'],notes:['Die Beschreibungen des Salinas-Tals sind großartig.','In Ökologie und Politik bis heute unerreicht.']},loc:'de-DE',months:['Jan','Feb','Mär','Apr','Mai','Jun','Jul','Aug','Sep','Okt','Nov','Dez'],pageAbbr:', S. ',noLoc:'Kein Standort',bookWord:'Buch',
 caseLabel:n=>n,
 locText:(b,cl)=>{if(!b.bookcase)return 'Noch kein Standort';let s=cl(b.bookcase);if(!b.shelf)return s+' · Fach unbekannt';s+=' · Fach '+b.shelf+' (von oben)';if(b.pos)s+=' · Buch '+b.pos+' von links';return s},
 shelfShort:n=>' · Fach '+n,
 cols:{Kitap:'Titel',Yazar:'Autor','Yayınevi':'Verlag',Kategori:'Kategorie',ISBN:'ISBN',Sayfa:'Seiten','Basım yılı':'Jahr','Kitaplık':'Regal',Raf:'Fach','Sıra':'Position',Durum:'Status','Okunan sayfa':'Gelesene Seiten',Puan:'Bewertung',Notlar:'Notizen'},
 colQuotes:'Zitate',colLentTo:'Verliehen an',colLentOn:'Verliehen am',sheet:'Bücher',fileLib:'bibliothek',fileBak:'sicherung',
 wa:(to,title,d)=>\`Hallo \${to}, hast du „\${title}“ noch, das ich dir am \${d} geliehen habe? Wenn du fertig bist, könnte ich es bei Gelegenheit zurückbekommen? Danke!\`,
 notif:(title,to)=>\`„\${title}“ ist bei \${to}. Möchtest du es zurückfordern?\`,
 invite:(link,code)=>\`Komm in unsere Hausbibliothek bei Raf İzi! Öffne diesen Link: \${link} oder geh in der App zu Buch scannen → Familienbibliothek → gib den Code ein: \${code} (7 Tage gültig)\`}`
},
fr: {
  fix: [['1 lus','1 lu'],['0 lus','0 lu'],['1 livre trouvés','1 livre trouvé'],['1 livre enregistrés','1 livre enregistré']],
  pl: 'n<2?one:many',
  W: {book: ['livre', 'livres'], author: ['auteur', 'auteurs'], publisher: ['éditeur', 'éditeurs'], shelf: ['étagère', 'étagères'], person: ['personne', 'personnes'], day: ['jour', 'jours'], page: ['page', 'pages'], star: ['étoile', 'étoiles']},
  T: {
    suggestNeed: "n=>'Pour vous suggérer des livres, il m’en faut au moins 3 marqués « Lu » ou notés. Vous en avez '+n+' pour l’instant.'",
    basedOn: "n=>'D’après les '+P(n,'book')+' que vous avez lus et vos notes. Les livres que vous avez déjà ne sont pas suggérés.'",
    wishN: "'Liste d’envies ($1)'",
    spine: "(a,n,l)=>a+', livre '+n+(l?', prêté':'')",
    andShelves: "n=>'et '+P(n,'shelf')+'.'",
    longLoan: "n=>n<2?n+' livre est prêté depuis longtemps':n+' livres sont prêtés depuis longtemps'",
    ShelfN: "'Étagère $1'", shelfN: "'étagère $1'", fromLeft: "'livre $1 depuis la gauche'",
    readN: "'$1 lus'", forDays: "n=>'depuis '+P(n,'day')", daysAgo: "n=>'il y a '+P(n,'day')",
    PageN: "'Page $1'", pAbbr: "'p. $1'", addN: "n=>'Ajouter '+P(n,'book')", quotesN: "'Citations ($1)'",
    copyMine: "n=>'Copier aussi mes '+P(n,'book')+' dans cette bibliothèque (mes infos de lecture et de prêt me suivent)'"
  },
  x: `{sample:{cases:['Salon','Bureau'],notes:['Les descriptions de la vallée de Salinas sont superbes.','Toujours inégalé sur l’écologie et la politique.']},loc:'fr-FR',months:['janv.','févr.','mars','avr.','mai','juin','juil.','août','sept.','oct.','nov.','déc.'],pageAbbr:', p. ',noLoc:'Sans emplacement',bookWord:'livre',
 caseLabel:n=>n,
 locText:(b,cl)=>{if(!b.bookcase)return 'Pas encore d’emplacement';let s=cl(b.bookcase);if(!b.shelf)return s+' · étagère inconnue';s+=' · étagère '+b.shelf+' (depuis le haut)';if(b.pos)s+=' · livre '+b.pos+' depuis la gauche';return s},
 shelfShort:n=>' · Étagère '+n,
 cols:{Kitap:'Titre',Yazar:'Auteur','Yayınevi':'Éditeur',Kategori:'Catégorie',ISBN:'ISBN',Sayfa:'Pages','Basım yılı':'Année','Kitaplık':'Bibliothèque',Raf:'Étagère','Sıra':'Position',Durum:'Statut','Okunan sayfa':'Pages lues',Puan:'Note',Notlar:'Notes'},
 colQuotes:'Citations',colLentTo:'Prêté à',colLentOn:'Prêté le',sheet:'Livres',fileLib:'bibliotheque',fileBak:'sauvegarde',
 wa:(to,title,d)=>\`Salut \${to}, tu as toujours « \${title} » que je t’ai prêté le \${d} ? Si tu l’as fini, tu pourrais me le rendre quand ça t’arrange ? Merci !\`,
 notif:(title,to)=>\`« \${title} » est chez \${to}. Voulez-vous le récupérer ?\`,
 invite:(link,code)=>\`Rejoins notre bibliothèque familiale sur Raf İzi ! Ouvre ce lien : \${link} ou, dans l’app, va dans le menu Scanner un livre → Bibliothèque familiale → saisis le code : \${code} (valable 7 jours)\`}`
},
id: {
  pl: 'one',
  W: {book: ['buku', 'buku'], author: ['penulis', 'penulis'], publisher: ['penerbit', 'penerbit'], shelf: ['rak', 'rak'], person: ['orang', 'orang'], day: ['hari', 'hari'], page: ['halaman', 'halaman'], star: ['bintang', 'bintang']},
  T: {
    suggestNeed: "n=>'Untuk menyarankan buku, aku butuh minimal 3 buku yang ditandai “Selesai dibaca” atau diberi nilai. Sekarang ada '+n+'.'",
    basedOn: "n=>'Berdasarkan '+P(n,'book')+' yang sudah kamu baca dan nilaimu. Buku yang sudah kamu punya tidak disarankan.'",
    wishN: "'Daftar keinginan ($1)'",
    spine: "(a,n,l)=>a+', buku ke-'+n+(l?', dipinjamkan':'')",
    andShelves: "n=>'dan '+P(n,'shelf')+'.'",
    longLoan: "n=>n+' buku sudah lama dipinjamkan'",
    ShelfN: "'Rak $1'", shelfN: "'rak $1'", fromLeft: "'buku ke-$1 dari kiri'",
    readN: "'$1 selesai'", forDays: "n=>'sejak '+P(n,'day')+' lalu'", daysAgo: "n=>P(n,'day')+' lalu'",
    PageN: "'Halaman $1'", pAbbr: "'hlm. $1'", addN: "n=>'Tambah '+P(n,'book')", quotesN: "'Kutipan ($1)'",
    copyMine: "n=>'Salin juga '+P(n,'book')+' milikku ke perpustakaan itu (data baca dan peminjamanku ikut pindah)'"
  },
  x: `{sample:{cases:['Ruang tamu','Ruang kerja'],notes:['Deskripsi Lembah Salinas-nya memukau.','Soal ekologi dan politik, masih tak tertandingi.']},loc:'id-ID',months:['Jan','Feb','Mar','Apr','Mei','Jun','Jul','Agu','Sep','Okt','Nov','Des'],pageAbbr:', hlm. ',noLoc:'Tanpa lokasi',bookWord:'buku',
 caseLabel:n=>n,
 locText:(b,cl)=>{if(!b.bookcase)return 'Belum ada lokasi';let s=cl(b.bookcase);if(!b.shelf)return s+' · rak tidak diketahui';s+=' · rak '+b.shelf+' (dari atas)';if(b.pos)s+=' · buku ke-'+b.pos+' dari kiri';return s},
 shelfShort:n=>' · Rak '+n,
 cols:{Kitap:'Judul',Yazar:'Penulis','Yayınevi':'Penerbit',Kategori:'Kategori',ISBN:'ISBN',Sayfa:'Halaman','Basım yılı':'Tahun','Kitaplık':'Lemari',Raf:'Rak','Sıra':'Posisi',Durum:'Status','Okunan sayfa':'Halaman dibaca',Puan:'Nilai',Notlar:'Catatan'},
 colQuotes:'Kutipan',colLentTo:'Dipinjamkan ke',colLentOn:'Tanggal pinjam',sheet:'Buku',fileLib:'perpustakaan',fileBak:'cadangan',
 wa:(to,title,d)=>\`Hai \${to}, “\${title}” yang kupinjamkan tanggal \${d} masih ada padamu? Kalau sudah selesai, boleh dikembalikan kapan sempat? Terima kasih!\`,
 notif:(title,to)=>\`“\${title}” ada pada \${to}. Mau minta kembali?\`,
 invite:(link,code)=>\`Yuk gabung ke perpustakaan rumah kami di Raf İzi! Buka tautan ini: \${link} atau di aplikasi buka menu Pindai Buku → Perpustakaan keluarga → masukkan kode: \${code} (berlaku 7 hari)\`}`
}
};
