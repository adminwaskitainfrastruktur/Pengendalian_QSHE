# Mockup website rental alat berat

Mockup awal untuk dilihat dan dinilai. Semua unit, harga, dan dokumen adalah data contoh.

## Menjalankan di komputer Anda

Perlu Node.js 20 atau lebih baru.

```bash
cd rental-web
npm install
npm run dev
```

Buka alamat yang tampil di terminal, biasanya http://localhost:5173.

Untuk membangun versi produksi dan mencobanya:

```bash
npm run build
npm run preview
```

## Yang bisa diganti

| Ingin mengganti | Ubah berkas |
|---|---|
| Nama perusahaan, nomor WhatsApp, alamat | `src/config.ts` |
| Daftar unit contoh | `src/data/units.sample.ts` |
| Sumber data (SharePoint List atau Google Drive nanti) | `getUnits()` di `src/data/index.ts` |
| Menghilangkan bilah "data contoh" | `DATA_ADALAH_CONTOH` di `src/data/index.ts` |
| Warna dan tipografi | variabel di bagian atas `src/styles.css` |

Komponen lain hanya membaca data lewat `getUnits()`, jadi pindah sumber data tidak menyentuh tampilan.

## Yang belum ada

- Formulir penawaran belum mengirim ke mana pun. Tombol "Lihat ringkasan permintaan" hanya menyusun pesan, lalu pengunjung bisa mengirimnya lewat WhatsApp.
- Foto unit asli, peta wilayah, dan halaman per depo.
- Render di server. Untuk SEO, versi produksi sebaiknya memakai Astro atau prerender, bukan SPA murni. Alasannya ada di laporan riset (`riset-rental-alat-berat/reports`).

## Pratinjau sebagai halaman Artifact

```bash
npm run artifact
```

Menghasilkan `dist-artifact/artifact.html`, satu berkas untuk dipratinjau di claude.ai.
