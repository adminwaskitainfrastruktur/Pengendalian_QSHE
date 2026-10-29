---
tags: [teknis, keputusan]
---
# Stack dan lokasi proyek

Repo `Pengendalian_QSHE` saat ini berisi dashboard QSHE (React 19 + TypeScript + Vite 8 + Tailwind 4, plus MSAL, Leaflet, Recharts). Itu proyek berbeda dari website rental.

**Belum diputuskan**: website rental dibangun di repo ini (folder terpisah), repo baru, atau dengan stack lain. Lihat [[Gap dan keputusan terbuka]].
Jika memakai stack yang sama, Leaflet bisa dipakai untuk [[Fitur - Area layanan dan SEO lokal]].

## Penyimpanan data (arah dari pemilik, 2026-10-29)
Data website (daftar unit, tarif, permintaan penawaran) rencananya disimpan di **SharePoint List**, atau paling tidak di **Google Drive**. Ini arah awal dari pemilik, bukan keputusan akhir.

- Repo ini sudah punya MSAL dan hook `useSharePointFile` untuk dashboard QSHE, jadi ada pola akses SharePoint yang bisa dipelajari.
- Pertanyaan yang belum terjawab: bagaimana halaman publik membaca data itu tanpa membuat pengunjung login ke Microsoft. Dugaan saya (belum diverifikasi) perlu lapisan perantara, misalnya sinkronisasi terjadwal ke berkas statis atau layanan kecil yang memanggil Microsoft Graph.
- Pertanyaan lain: tabel mana yang berubah sering (ketersediaan unit) dan mana yang jarang (spesifikasi, dokumen K3).
- Hasil riset: lihat [[Referensi website rental alat berat]] bagian teknologi, dan [[fitur_dan_stack]].
