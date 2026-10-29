# Graph Report - riset-rental-alat-berat  (2026-10-29)

## Corpus Check
- Corpus is ~1,955 words - fits in a single context window. You may not need a graph.

## Summary
- 98 nodes · 210 edges · 8 communities
- Extraction: 95% EXTRACTED · 5% INFERRED · 0% AMBIGUOUS · INFERRED: 11 edges (avg confidence: 0.83)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- Harga dan Biaya Sewa
- Template dan Pola Beranda
- Sitemap dan Alur Kontak
- Katalog, Ketersediaan, Pasar
- Keputusan Terbuka dan Stack
- Marketplace dan Studi Akademik
- Area Layanan dan Dealer
- Pemain Besar Indonesia

## God Nodes (most connected - your core abstractions)
1. `Sumber` - 30 edges
2. `00 - Index (MOC)` - 23 edges
3. `Struktur - Sitemap usulan` - 20 edges
4. `Gap dan keputusan terbuka` - 15 edges
5. `Ref - Marketplace dan studi akademik` - 14 edges
6. `Ref - Penyedia lokal Jakarta` - 13 edges
7. `Fitur - Area layanan dan SEO lokal` - 13 edges
8. `Fitur - CTA WhatsApp` - 13 edges
9. `Fitur - Form permintaan penawaran (RFQ)` - 12 edges
10. `Ref - Caterpillar dan dealer alat berat` - 11 edges

## Surprising Connections (you probably didn't know these)
- `Janji layanan: layanan cepat, free konsultasi, 24 jam + operator` --conceptually_related_to--> `Fitur - CTA WhatsApp`  [INFERRED]
  Referensi/Ref - Penyedia lokal Jakarta.md → Fitur/Fitur - CTA WhatsApp.md
- `Katalog WhatsApp Business dan QR code` --cites--> `Sumber`  [EXTRACTED]
  Fitur/Fitur - CTA WhatsApp.md → Sumber.md
- `Slider foto resolusi tinggi dan video` --references--> `Fitur - Katalog dan filter unit`  [EXTRACTED]
  Referensi/Ref - Caterpillar dan dealer alat berat.md → Fitur/Fitur - Katalog dan filter unit.md
- `Sewa sebagai satu halaman layanan dengan hotline rental Jerman` --references--> `Struktur - Sitemap usulan`  [EXTRACTED]
  Referensi/Ref - Liebherr Rental.md → Struktur/Struktur - Sitemap usulan.md
- `Satu halaman per kombinasi alat + kota` --references--> `Fitur - Area layanan dan SEO lokal`  [EXTRACTED]
  Referensi/Ref - Penyedia lokal Jakarta.md → Fitur/Fitur - Area layanan dan SEO lokal.md

## Hyperedges (group relationships)
- **Delapan catatan referensi situs dalam MOC** — referensi_ref___caterpillar_dan_dealer_alat_berat, referensi_ref___template_machima, referensi_ref___template_equipo, referensi_ref___mid_country_machinery, referensi_ref___penyedia_lokal_jakarta, referensi_ref___liebherr_rental, referensi_ref___united_tractors_dan_trakindo, referensi_ref___marketplace_dan_studi_akademik [EXTRACTED 1.00]
- **Keputusan terbuka untuk pemilik proyek** — gap_dan_keputusan_terbuka_keputusan_lokasi_dan_stack, gap_dan_keputusan_terbuka_keputusan_harga_terbuka_atau_hubungi_kami, gap_dan_keputusan_terbuka_keputusan_fase_1_atau_booking_online, gap_dan_keputusan_terbuka_keputusan_jenis_alat_wilayah_merek, teknis_teknis___stack_dan_lokasi_proyek, fitur_fitur___harga_bertingkat, fitur_fitur___kalender_ketersediaan [EXTRACTED 1.00]
- **Pola penyedia lokal: SEO per kota, harga per jam, biaya tambahan** — referensi_ref___penyedia_lokal_jakarta, fitur_fitur___area_layanan_dan_seo_lokal, pasar_pasar___harga_sewa_excavator_jakarta, pasar_pasar___biaya_tambahan_di_luar_tarif [EXTRACTED 1.00]
- **Komponen halaman detail unit** — struktur_struktur___halaman_detail_unit, fitur_fitur___harga_bertingkat, pasar_pasar___biaya_tambahan_di_luar_tarif, fitur_fitur___kalender_ketersediaan, fitur_fitur___cta_whatsapp, fitur_fitur___form_permintaan_penawaran__rfq_ [EXTRACTED 0.95]
- **Alur harga sewa: tarif pasar, biaya tambahan, harga bertingkat, penawaran RFQ** — pasar_pasar___harga_sewa_excavator_jakarta, pasar_pasar___biaya_tambahan_di_luar_tarif, fitur_fitur___harga_bertingkat, fitur_fitur___form_permintaan_penawaran__rfq_ [INFERRED 0.85]
- **Sitemap usulan dan fitur penyusunnya** — struktur_struktur___sitemap_usulan, fitur_fitur___katalog_dan_filter_unit, struktur_struktur___halaman_detail_unit, fitur_fitur___area_layanan_dan_seo_lokal, fitur_fitur___cta_whatsapp, fitur_fitur___form_permintaan_penawaran__rfq_ [EXTRACTED 0.95]

## Communities (8 total, 0 thin omitted)

### Community 0 - "Harga dan Biaya Sewa"
Cohesion: 0.14
Nodes (15): Kolom usulan form RFQ (jenis unit, durasi, tanggal mulai, lokasi proyek, operator, kontak), Tarif per jam, hari, minggu, bulan dengan minimum jam sewa, Pasar - Biaya tambahan di luar tarif, Biaya belum termasuk tarif (mobilisasi-demobilisasi, BBM, uang makan operator, minimum jam sewa), Pasar - Harga sewa excavator Jakarta, Tarif PC200 bulanan Rp55-75jt dan excavator harian Rp5-8jt, Tarif mini excavator PC50-PC75 Rp700rb-1jt/jam, Tarif PC200 per jam (Rp185.000 vendor pool-based min. 50 jam; Rp1,2-1,6jt agregator) (+7 more)

### Community 1 - "Template dan Pola Beranda"
Cohesion: 0.17
Nodes (15): Ref - Liebherr Rental, Sewa sebagai satu halaman layanan dengan hotline rental Jerman, Liebherr Rental Indonesia, Ref - Template Equipo, Carousel testimoni pelanggan (bukti sosial), Ref - Template Machima, Form kontak dan sistem inquiry, Bagian How It Works (alur sewa) (+7 more)

### Community 2 - "Sitemap dan Alur Kontak"
Cohesion: 0.22
Nodes (14): Fitur - CTA WhatsApp, Katalog WhatsApp Business dan QR code, Pesan WhatsApp otomatis berisi nama unit, Fitur - Form permintaan penawaran (RFQ), Lima halaman umum situs rental: home, services, about, equipments, contact, Struktur - Halaman detail unit, Foto/video dan spesifikasi unit (kapasitas, bobot, tahun), Tombol minta penawaran (+6 more)

### Community 3 - "Katalog, Ketersediaan, Pasar"
Cohesion: 0.21
Nodes (11): 00 - Index (MOC), Fitur - Kalender ketersediaan, Label status tersedia / disewa / perawatan (fase 1), Masa penyangga (buffer) perawatan, Fitur - Katalog dan filter unit, Filter unit (tipe, merek, kelas tonase, lokasi, status tersedia), Pasar - Ukuran pasar Indonesia, Estimasi MarkNtel Advisors: USD 389,6 juta (≈Rp5,9 triliun), tumbuh 7,4% per tahun sampai 2030 (+3 more)

### Community 4 - "Keputusan Terbuka dan Stack"
Cohesion: 0.27
Nodes (5): Fitur - Harga bertingkat, Gap dan keputusan terbuka, Teknis - Stack dan lokasi proyek, Leaflet, Stack dashboard QSHE (React 19, TypeScript, Vite 8, Tailwind 4, MSAL, Leaflet, Recharts)

### Community 5 - "Marketplace dan Studi Akademik"
Cohesion: 0.27
Nodes (10): Tombol WhatsApp melayang di semua halaman, Fitur - Kontrak digital dan pengingat jatuh tempo, Notifikasi Telegram jatuh tempo pengembalian, Ref - Marketplace dan studi akademik, CV Harto Joyo Pati - notifikasi Telegram jatuh tempo, Equiptrent (tesis Prasetiya Mulya 2019), HK Equipment (Sragen) - aplikasi web rental Laravel+MySQL, Scanina (marketplace alat berat bekas) (+2 more)

### Community 6 - "Area Layanan dan Dealer"
Cohesion: 0.31
Nodes (8): Fitur - Area layanan dan SEO lokal, Dealer locator, Halaman layanan per kota/wilayah, Ref - Caterpillar dan dealer alat berat, Dropdown menu, pencarian, live chat, dealer locator, Palet kuning-hitam, Slider foto resolusi tinggi dan video, Halaman Area layanan

### Community 7 - "Pemain Besar Indonesia"
Cohesion: 0.25
Nodes (7): Caterpillar (model situs alat berat menurut Cyberoptik), Ref - United Tractors dan Trakindo, Hexindo (hanya entri tabel perbandingan), Trakindo (dealer resmi Caterpillar Indonesia), United Tractors (Komatsu, UD Trucks, Scania, Bomag, Tadano), Sumber #10 - United Tractors (Astra), Sumber #2 - Cyberoptik: desain situs alat berat

## Knowledge Gaps
- **13 isolated node(s):** `Sumber #7 - Launchrock: Q&A fitur rental`, `Palet kuning-hitam`, `Carousel testimoni pelanggan (bukti sosial)`, `Hexindo (hanya entri tabel perbandingan)`, `Masa penyangga (buffer) perawatan` (+8 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 16 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `Sumber` connect `Template dan Pola Beranda` to `Harga dan Biaya Sewa`, `Sitemap dan Alur Kontak`, `Katalog, Ketersediaan, Pasar`, `Keputusan Terbuka dan Stack`, `Marketplace dan Studi Akademik`, `Area Layanan dan Dealer`, `Pemain Besar Indonesia`?**
  _High betweenness centrality (0.346) - this node is a cross-community bridge._
- **What connects `Sumber #7 - Launchrock: Q&A fitur rental`, `Palet kuning-hitam`, `Carousel testimoni pelanggan (bukti sosial)` to the rest of the system?**
  _13 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Harga dan Biaya Sewa` be split into smaller, more focused modules?**
  _Cohesion score 0.13970588235294118 - nodes in this community are weakly interconnected._
- **Why does `00 - Index (MOC)` connect `Katalog, Ketersediaan, Pasar` to `Harga dan Biaya Sewa`, `Template dan Pola Beranda`, `Sitemap dan Alur Kontak`, `Keputusan Terbuka dan Stack`, `Marketplace dan Studi Akademik`, `Area Layanan dan Dealer`, `Pemain Besar Indonesia`?**
  _High betweenness centrality (0.243) - this node is a cross-community bridge._
- **Why does `Struktur - Sitemap usulan` connect `Sitemap dan Alur Kontak` to `Template dan Pola Beranda`, `Katalog, Ketersediaan, Pasar`, `Marketplace dan Studi Akademik`, `Area Layanan dan Dealer`?**
  _High betweenness centrality (0.148) - this node is a cross-community bridge._