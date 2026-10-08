# ⛳ Mini Golf Web Game

Game Mini Golf sederhana dan interaktif yang dibangun hanya menggunakan teknologi web standar (**HTML5, CSS3, dan Plain JavaScript**). Proyek ini dirancang tanpa *dependency* atau *library* pihak ketiga sehingga sangat ringan dan mudah dikembangkan.

---

## 🚀 Fitur Game

- 🎨 **Canvas Graphics**: Render visual game menggunakan HTML5 Canvas 2D.
- 🎯 **Drag & Shoot Mechanic**: Mekanisme kontrol bola yang intuitif menggunakan drag-and-drop mouse/touch.
- 🧱 **Obstacles & Physics**: Fitur fisik dasar seperti pantulan dinding, hambatan tanah (rumput/pasir), dan rintangan.
- 🕳️ **Hole Collision**: Deteksi bola masuk ke dalam lubang golf.
- 📊 **Score & Stroke Tracker**: Penghitung jumlah pukulan (*strokes*) untuk setiap *hole*.
- 📱 **Responsive Design**: Tampilan yang menyesuaikan ukuran layar PC maupun *mobile*.

---

## 🛠️ Teknologi yang Digunakan

* **HTML5**: Struktur halaman dan elemen `<canvas>`.
* **CSS3**: Layouting, styling UI, dan animasi menu/skor.
* **JavaScript (ES6+)**: Logika fisika bola, loop game, pemprosesan *input*, dan state management.

---

## 📂 Struktur Proyek

```text
mini-golf-game/
│
├── index.html          # Struktur utama & elemen Canvas
├── style.css           # Styling tampilan & UI overlay
├── script.js           # Engine game, fisika, dan kontrol
└── README.md           # Dokumentasi proyek
```

---

## 🎮 Cara Menjalankan

1. **Clone atau Unduh Repository**
   ```bash
   git clone https://github.com/username/mini-golf-game.git
   ```
2. **Buka Proyek**
   - Masuk ke direktori proyek.
   - Buka berkas `index.html` langsung di browser favoritmu (Chrome, Firefox, Edge, Safari, dll).
   - *Atau* gunakan extension **Live Server** di Visual Studio Code untuk pengalaman pengujian yang lebih baik.

---

## 🕹️ Cara Bermain

1. Klik dan tahan bola golf (atau di area sekitar bola).
2. Tarik kursor/jari ke arah berlawanan dari target untuk mengatur **kekuatan** dan **arah** pukulan (seperti ketapel).
3. Lepaskan klik/sentuhan untuk memukul bola.
4. Masukkan bola ke dalam lubang dengan jumlah pukulan se-minimal mungkin!

---

## 🚧 Rencana Pengembangan (Roadmap)

- [ ] Penambahan berbagai jenis rintangan baru (kincir angin, pasir/hazard, air).
- [ ] Fitur *Multi-level / Multi-hole*.
- [ ] Efek suara (SFX) saat memukul bola dan saat bola masuk lubang.
- [ ] Fitur menyimpan *High Score* menggunakan `localStorage`.

---

## 📜 Lisensi

Proyek ini dibuat untuk tujuan pembelajaran dan dapat dikembangkan secara bebas di bawah lisensi [MIT License](LICENSE).