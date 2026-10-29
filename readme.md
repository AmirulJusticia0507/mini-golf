# ⛳ Mini Golf — Forest Course

Game Mini Golf sederhana dan interaktif yang dibangun hanya menggunakan teknologi web standar (**HTML5, CSS3, dan Plain JavaScript**). Proyek ini dirancang tanpa *dependency* atau *library* pihak ketiga sehingga sangat ringan dan mudah dikembangkan.

---

## 🚀 Fitur Game

- 🧊 **Tampilan 3D Diorama**: Seluruh lapangan dirender sebagai diorama miring berketebalan (fairway bertekstur rumput, *sand trap*, batu timbul, pohon berlapis, bendera bergoyang) dengan proyeksi orthografis miring — tetap memakai HTML5 Canvas, tanpa engine 3D.
- 🎯 **Drag & Shoot Mechanic**: Mekanisme kontrol bola yang intuitif menggunakan drag-and-drop mouse/touch. Input dipetakan balik dari layar ke lapangan lewat invers proyeksi, jadi dragging tetap presisi di tampilan 3D.
- 🏌️ **Aim Line & Power Meter**: Garis bidik titik-titik dan indikator kekuatan pukulan yang muncul saat bola ditarik.
- 🧱 **Obstacles & Physics**: Fitur fisik dasar seperti pantulan dinding, hambatan tanah (rumput/pasir), dan rintangan.
- 🕳️ **Hole Collision**: Deteksi bola masuk ke dalam lubang golf.
- 📊 **Score & Stroke Tracker**: Penghitung jumlah pukulan (*strokes*), par, progress *course*, dan *score card* (BEST / BEST HOLE).
- 🏆 **High Score**: Rekor *course* dan per-*hole* tersimpan otomatis di `localStorage`.
- 🔊 **Sound Effects**: Efek suara sederhana (Web Audio API) untuk pukulan, tumbukan, bola masuk, dan UI — bisa dimatikan.
- 📱 **Responsive Design**: Tampilan yang menyesuaikan ukuran layar PC maupun *mobile*.

---

## 🛠️ Teknologi yang Digunakan

* **HTML5**: Struktur halaman dan elemen `<canvas>`.
* **CSS3**: Layouting, styling UI, dan animasi menu/skor.
* **JavaScript (ES6+)**: Logika fisika bola, loop game, pemprosesan *input*, dan state management.

---

## 📂 Struktur Proyek

```text
mini-golf/
│
├── index.html                    # Struktur halaman dan Canvas
├── style.css                     # Visual, layout, dan responsive UI
├── LICENSE                       # Lisensi MIT
├── js/
│   ├── main.js                   # Entry point
│   ├── config.js                 # Konfigurasi global game
│   ├── core/game.js              # Orkestrasi state dan game loop
│   ├── components/input.js       # Pointer/touch dan mekanisme drag
│   ├── components/physics.js     # Gerak, gesekan, dan collision
│   ├── components/renderer.js    # Rendering diorama 3D (Canvas 2D)
│   ├── components/ui.js          # Sinkronisasi DOM, skor, dan high score
│   ├── components/sound.js       # Efek suara (Web Audio API)
│   ├── data/levels.js            # Konfigurasi hole
│   ├── utils/projection.js       # Proyeksi 3D -> layar dan inversnya
│   └── utils/vector.js           # Operasi matematika vektor
└── readme.md                     # Dokumentasi proyek
```

---

## 🎮 Cara Menjalankan

1. Jalankan Laragon dan pastikan folder proyek berada di `C:\laragon\www\mini-golf`.
2. Buka `http://localhost/mini-golf/` dari browser modern.

> Game memakai JavaScript ES Modules, jadi jalankan melalui web server (Laragon, Live Server, atau server lokal lain), bukan dengan membuka `index.html` melalui `file://`.

---

## 🕹️ Cara Bermain

1. Klik dan tahan bola golf (atau di area sekitar bola).
2. Tarik kursor/jari ke arah berlawanan dari target untuk mengatur **kekuatan** dan **arah** pukulan (seperti ketapel).
3. Lepaskan klik/sentuhan untuk memukul bola.
4. Masukkan bola ke dalam lubang dengan jumlah pukulan se-minimal mungkin!

---

## 🚧 Rencana Pengembangan (Roadmap)

- [x] Rintangan dan area pasir.
- [x] Fitur *Multi-level / Multi-hole* (5 hole).
- [x] Efek suara sederhana saat memukul bola dan saat bola masuk lubang.
- [x] Fitur menyimpan *High Score* menggunakan `localStorage`.
- [x] Modernisasi tampilan menjadi diorama 3D.

---

## 🧊 Catatan Tampilan 3D

Simulasi fisika tetap berjalan pada bidang 2D persis seperti sebelumnya. Yang berubah adalah cara lapangan digambar: setiap koordinat lapangan `(x, y)` diproyeksikan ke layar sebagai diorama miring dengan ketinggian `z`, memakai `js/utils/projection.js`. Saat pemain menggeser bola, posisi pointer di layar dibalik lewat `unproject()` sehingga terasa alami meskipun lapangan tampak miring.

Parameter tampilan diatur di `js/config.js`: `tilt` (kemiringan kamera), `cameraDistance` (dasar skala proyeksi), `extrusion` (ketebalan papan lapangan), dan `ballHeight` (posisi bola di atas lapangan).

---


Proyek ini dibuat untuk tujuan pembelajaran dan dapat dikembangkan secara bebas di bawah lisensi [MIT License](LICENSE).
