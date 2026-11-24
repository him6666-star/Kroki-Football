# Scribble Kick tanıtım videosu

Yatay (1920×1080) ve dikey (1080×1920), ~24,5 sn, 30 fps.

1. Görüntüleri al (oyun dili tr veya en):
   `node capture_oyun.js tr 1500` · `node capture_gol.js tr` · `node capture_menu.js tr` (kareler /tmp/vid altına)
2. Videoyu üret: `python3 make_video.py <dil> <yatay|dikey> cikti.mp4`
3. Müzik + gol sesi: ffmpeg ile eklenir (sport-beach-vibes, 6. saniyeden; goal.mp3 golde).

Yeni dil: `strings.json`'a çeviriyi ekle (es, pt, de, fr, id hazır). Oyun şimdilik sadece TR/EN olduğu için
diğer dillerde oyun içi görüntü İngilizce kalır, yazılar o dilde olur.
