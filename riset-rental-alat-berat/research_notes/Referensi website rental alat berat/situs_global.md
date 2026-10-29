# Desain website perusahaan rental alat berat internasional (referensi untuk bisnis rental alat berat Indonesia)

## 1. Perusahaan mana yang menjadi standar, dan apa pembeda pendekatan situs masing-masing?

### Status sumber (penting untuk penulis laporan)
- Semua WebFetch ke situs perusahaan dan media (unitedrentals.com, sunbeltrentals.com, hercrentals.com, boels.com, loxam.com, cat.com, rermag.com, deloittedigital.com, cartermachinery.com, acquia.com) gagal dengan `getaddrinfo ENOTFOUND` = tidak dapat dijangkau dari jaringan sesi (host perlu di-allow di pengaturan jaringan sesi). Satu kegagalan sudah cukup; tidak diulang.
- AKIBATNYA: TIDAK ADA halaman yang benar-benar saya buka. Seluruh isi catatan ini berasal dari ringkasan hasil WebSearch (snippet/ringkasan mesin pencari), bukan pengamatan langsung halaman. Semua klaim di bawah berlabel "[snippet]". Verifikasi manual direkomendasikan sebelum dijadikan dasar keputusan desain.
- Tidak ditemukan sumber (dalam pencarian ini) untuk: Ashtead (grup), Nikken, Kobelco rental, Kanamoto (fitur situs). Lihat Gaps.

### Takeaway
Pemain AS (United Rentals, Sunbelt, Herc) menjadikan situs sebagai kanal e-commerce B2B + portal akun + aplikasi mobile terintegrasi telematika; Cat Rental Store (dealer) masih berpusat pada "Quick Quote" lalu tindak lanjut staf; Boels/Loxam (Eropa) menekankan katalog + harga per hari + konfirmasi oleh cabang. Bukti ini terbatas pada snippet pencarian.

### Cited Findings
- [snippet] United Rentals: per panduan pelatihan Agustus 2024, semua pelanggan dipindah ke satu sistem pemesanan online di UnitedRentals.com (pengguna Total Control diarahkan ke sana untuk menyewa); fitur yang disebut: ketersediaan real-time, saran substitusi saat stok rendah, konfirmasi instan bila lead time memungkinkan, riwayat pesanan dengan "rent again" satu klik, katalog lebih besar dengan gambar resolusi tinggi, saran "greener choice" — [TCtoORSOrderEntryTrainingGuide.pdf (fr.unitedrentals.com)](https://fr.unitedrentals.com/sites/default/files/press-releases/TCtoORSOrderEntryTrainingGuide.pdf)
- [snippet] United Rentals, narasi digital 2022: target pengalaman desktop+mobile yang lebih nyaman, mulus lintas perangkat, disesuaikan per peran pekerjaan, transaksi lebih sederhana dan transparansi sepanjang siklus sewa; aplikasi mobile juga didesain ulang — [DigitalNarrative_2022.pdf](https://fr.unitedrentals.com/sites/default/files/press-releases/DigitalNarrative_2022.pdf)
- [snippet] United Rentals sebelumnya memiliki banyak properti digital terpisah (situs utama, portal B2B e-commerce, portal pelatihan online, situs penjualan alat bekas) dan membangun portal "UR One" untuk menyatukannya — [Chief Marketer](https://www.chiefmarketer.com/b2b-ecommerce-portal-helps-united-rentals-improve-customer-experience/%20); studi kasus Acquia tentang penjualan alat bekas: [Acquia](https://www.acquia.com/resources/customer-stories/united-rentals-used-equipment-sales) (isi halaman tidak dibuka; hanya judul/ringkasan).
- [snippet] Sunbelt Rentals (AS): aplikasi mobile diluncurkan 16 Maret 2022 (iOS/Android, versi ponsel & tablet); membuat reservasi dengan memilih tanggal/jam pengantaran atau sewa online lalu ambil di cabang terdekat; organisasi sewa per proyek; lihat/unduh invoice, bayar sebagian/berulang dengan kartu kredit — [Equipment World](https://www.equipmentworld.com/big-iron-dealer/article/15289492/sunbelt-rentals-enables-rental-and-payment-process-by-mobile-app), [Sunbelt IR press release](https://ir.sunbeltrentals.com/news-events/press-releases/detail/90/sunbelt-rentals-launches-new-mobile-app-to-simplify-rental-experience)
- [snippet] Sunbelt: setelah login pelanggan melihat ketersediaan di area dan inventori real-time di keranjang — [sunbeltrentals.com/resources/blog/services/use-account](https://sunbeltrentals.com/resources/blog/services/use-account). Peluncuran situs lama (tidak bertanggal di hasil) disebut punya pencarian peralatan dinamis, reservasi, permintaan pickup/service call, manajemen jobsite — [RER](https://www.rermag.com/news-analysis/bricks-clicks/article/20936756/sunbelt-rentals-launches-new-website)
- [snippet] Herc Rentals: platform ProControl NextGen diluncurkan 2022 (proyek "Project Elevate"), memakai AWS, Adobe, Salesforce, Magento; tujuan "semudah memesan taksi ke bandara" menggantikan pemesanan via telepon dengan account manager; fitur app pelanggan: peringatan telematika dan service call digital (naik >150% dan 100% setahun setelah rilis, klaim studi kasus Deloitte Digital, bukan audit independen) — [Deloitte Digital](https://www.deloittedigital.com/ca/en/work/herc-rentals.html), [Deloitte](https://www2.deloitte.com/us/en/pages/consulting/articles/fleet-management-customer-experience.html)
- [snippet] Cat Rental Store (jaringan dealer, masing-masing independen): jalur utama "Quick Quote" online lalu spesialis rental menindaklanjuti, atau telepon (mis. 1.800.RENT.CAT); registrasi portal per dealer; portal menampilkan tarif, rental yang cocok untuk pekerjaan, info rental berjalan, minta quote, perpanjang/akhiri rental; pembayaran via rental account (invoice) atau Cat Card (kredit); bukti asuransi mungkin diminta — [Carter Machinery](https://www.cartermachinery.com/blog/cat-rental-stores-online-customer-portal/), [Cat Rental Store Carolina](https://www.catrentalstore.com/carolina/en_US/about/getting-started.html), [Foley](https://catrentalstore.com/foley-rental/en_US/services/getting-started.html)
- [snippet] Boels (Eropa, situs per negara): harga sering tampil di web tetapi banyak mesin "price on request" (FAQ Jerman); minimum sewa 24 jam; booking online dikonfirmasi staf dalam 1 hari kerja; harga web tidak termasuk perawatan, BBM, transport, pembersihan, aksesori, biaya lingkungan, damage waiver — [Boels FAQ NL/BE](https://www.boels.com/en-be/customer-service/faq), [Boels HR](https://www.boels.com/en-hr/how-it-works), [Boels SI](https://www.boels.com/en-si/how-it-works)
- [snippet] Loxam (Prancis/Eropa): situs memuat agence, katalog, promosi bulanan, webshop; Loxam Club (diskon s.d. 35% menurut snippet); quote bisa diminta online atau di agence; tidak ada sewa setengah hari menurut ulasan pelanggan; paket jangka panjang MINILEASE (≥1 tahun, termasuk servis & asuransi, tagihan bulanan) — [CustPlace](https://fr.custplace.com/loxam/), [Brosur MINILEASE (CAPEB)](https://www.capeb.fr/www/capeb/media/loxam-plaquette-minilease-location-longue-duree.pdf), [promocatalogues.fr](https://www.promocatalogues.fr/magasins/loxam/catalogues-promotions). Jumlah agence tidak konsisten antarsumber (500 / >800 di Prancis; 1.091 agence di 30 negara grup 2023).
- [snippet] Komatsu Rental AU/NZ (Juli 2019): situs rental khusus (komatsu.com.au/rental, komatsu.co.nz/rental), responsif perangkat, geolokasi menampilkan perwakilan rental terdekat, formulir enquiry online, menonjolkan iMC, hybrid excavator, KOMTRAX — [HeavyQuip](https://heavyquipmag.com/?p=97147). Sudah lama (2019).
- [snippet] Jepang: Actio meluncurkan layanan pemesanan online 24 jam untuk rental alat konstruksi (26 Okt 2020, gratis bagi korporasi; keranjang & pemesanan/pengembalian kapan saja) — [Actio Newsrelease](https://www.aktio.co.jp/news/2020/file/NewsRelease_20201021.pdf). Kanamoto disebut peringkat 2 rental alat konstruksi domestik (Yearbook 2023) menurut laman karier; tidak ada detail fitur situs — [onecareer.jp](https://www.onecareer.jp/events/internship/64911). Tidak ditemukan info situs Nikken/Kobelco.

### Inferences
- Pembeda utama: (a) AS = self-service penuh + app + telematika (UR, Herc, Sunbelt); (b) dealer Cat = quote-first, human-in-the-loop; (c) Eropa = katalog + harga/hari + konfirmasi cabang; (d) Jepang (Actio) = nilai jual "pesan 24 jam" mengatasi keterbatasan jam telepon.
- Untuk Indonesia, model hibrida (katalog + harga indikatif + "Minta Penawaran", reservasi instan hanya untuk unit/area tertentu) paling realistis dan konsisten dengan pola Cat/Boels.

### Gaps
- Tidak ada halaman situs yang berhasil dibuka; seluruh struktur halaman aktual (2026) belum terverifikasi.
- Tidak ada info untuk Ashtead (sebagai grup), Nikken, Kobelco rental, fitur situs Kanamoto; tidak ada pencarian khusus Asia Tenggara.
- Domain yang perlu di-allow untuk verifikasi: unitedrentals.com, sunbeltrentals.com, hercrentals.com, boels.com, loxam.fr, cat.com/catrentalstore.com, rermag.com.

## 2. Bagaimana homepage distrukturkan (hero, pencarian, kategori, CTA, trust signal)?

### Takeaway
Tidak dapat diverifikasi dari halaman nyata. Dari snippet hanya ada petunjuk bahwa pencarian/lokasi (ZIP) dan login adalah pintu masuk utama; struktur hero/kategori lengkap tidak terdokumentasi dalam sumber yang diperoleh.

### Cited Findings
- [snippet] Halaman kategori/armada United Rentals meminta kode ZIP untuk menampilkan tarif harian/mingguan/bulanan (28 hari) — [UR Fleet](https://www.unitedrentals.com/marketplace/equipment#/), [UR Forklifts](https://www.unitedrentals.com/marketplace/equipment/forklifts)
- [snippet] Navigasi UR memuat "UR Mobile App" di bawah Total Control; kategori URL berpola `/marketplace/equipment/<kategori>/<subkategori>` (mis. earthmoving-equipment/skid-steers-compact-track-loaders) — [UR Skid Steers](https://www.unitedrentals.com/marketplace/equipment/earthmoving-equipment/skid-steers-compact-track-loaders), [UR training nav (search result)](https://www.unitedrentals.com/training/osha30)
- [snippet] Situs Loxam menurut agregator: jam buka & alamat agence, katalog, newsletter, promo bulanan, webshop — [promocatalogues.fr](https://www.promocatalogues.fr/magasins/loxam/catalogues-promotions)
- [snippet] Boels punya halaman "how it works" dan FAQ per negara, dengan nomor telepon "hire directly?" ditampilkan di judul halaman (CTA telepon menonjol) — [Boels HR how-it-works](https://www.boels.com/en-hr/how-it-works), [Boels GB FAQ](https://www.boels.com/en-gb/customer-service/faq)

### Inferences
- Pola yang terlihat dari judul/URL (bukan homepage): lokasi/ZIP sebagai input awal, kategori hirarkis, nomor telepon sebagai CTA sekunder pada Boels. Ini bukan deskripsi hero yang terverifikasi.

### Gaps
- Susunan hero, tile kategori, logo klien, sertifikasi, angka cabang di homepage: tidak ditemukan/tidak terverifikasi (semua homepage tidak terjangkau).

## 3. Bagaimana katalog dan halaman detail alat bekerja (filter, spesifikasi, tampilan tarif harian/mingguan/bulanan, ketersediaan, "request a quote" vs "reserve online")?

### Takeaway
Tarif harian/mingguan/bulanan (28 hari) ditampilkan setelah memasukkan lokasi pada UR; pemesanan online dengan ketersediaan real-time pada UR/Sunbelt; Cat dan Boels masih banyak "quote" / "price on request". Dasar tarif satu shift 8 jam/hari sangat penting dan eksplisit.

### Cited Findings
- [snippet] UR: tarif harian, mingguan, bulanan (28 hari) tampil setelah input ZIP; ada "exclusive online rates" bila sewa lewat web/app — [UR Fleet](https://www.unitedrentals.com/marketplace/equipment#/)
- [snippet] Syarat sewa UR AS: tarif berlaku untuk satu shift = 8 jam/hari, 40 jam/minggu, 160 jam/4 minggu; shift ganda 1,5x, tiga shift 2x — [Rental Service Terms US](https://www.unitedrentals.com/legal/rental-service-terms-us)
- [snippet] UR: app menampilkan pricing khusus akun, reservasi 24 jam, dengan checkout lebih ringkas — [UR Mobile App](https://www.unitedrentals.com/services/online-services/mobile-app), [BIC Magazine](https://www.bicmagazine.com/resources/products-services/united-rentals-introduces-new-features-in-mobile-app/)
- [snippet] UR: sistem pesanan 2024 mendukung ketersediaan real-time dan substitusi — lihat sumber di Pertanyaan 1 (TCtoORSOrderEntryTrainingGuide.pdf). Ulasan RER (judul "United Rentals Launches Automated Online Equipment Rental Ordering System", tahun tidak jelas, kemungkinan lebih lama) menyebut kuotasi instan dengan opsi mengubah tanggal/model/term dan kalender ketersediaan — [RER](https://www.rermag.com/bricks-clicks/united-rentals-launches-automated-online-equipment-rental-ordering-system) (isi tidak dibuka; hanya ringkasan search).
- [snippet] Herc ProControl: pencarian/reservasi "kapan saja dari mana saja"; filter kategori, tipe, merek, cabang; alur: menu kategori -> detail jobsite (ZIP, jangka waktu) -> keranjang -> email konfirmasi; fitur "Rent Again". Ringkasan search menyatakan TIDAK ADA sumber yang mengonfirmasi harga/stock real-time pada alur ini — [Herc Quick Start Guide (H&E customers)](https://www.hercrentals.com/content/dam/hercrentals/us/commerce/static/training/ProControl-by-Herc-Rentals-Quick-Start-Guide-for-HE-Customers.pdf), [Herc ProControl](https://www.hercrentals.com/procontrol); studi kasus Deloitte menyebut spesifikasi per model ditampilkan — [Deloitte Digital](https://www.deloittedigital.com/ca/en/work/herc-rentals.html)
- [snippet] Sunbelt: filter berdasarkan ZIP untuk melihat tarif harian/mingguan/bulanan (28 hari) — klaim berasal dari salinan situs pihak ketiga, TIDAK terverifikasi — lihat hasil pencarian yang mereferensikan [una.com/sunbelt](https://una.com/sunbelt/). Diskon program kontraktor: 7,5% harian/10% mingguan/15% 4-minggu dari tarif regional (PWNA) — [PWNA](https://www.pwna.org/post/sunbelt-rentals-pwna-discount); GPO Una: 10%/15%/20% — [Una Sunbelt PDF](https://una.com/wp-content/uploads/2024/06/Una-Sunbelt.pdf)
- [snippet] Boels: tarif harian dengan minimum 24 jam; akhir pekan s.d. 72 jam = 2x tarif harian (halaman Kroasia/Slovenia); mesin berjam: tarif harian dasar 8 jam, mingguan 40 jam, kelebihan dikenakan surcharge; harga web tidak termasuk BBM, transport, dll. — [Boels HR](https://www.boels.com/en-hr/how-it-works), [Boels SI](https://www.boels.com/en-si/how-it-works)
- [snippet] Cat Rental Store: Quick Quote online lalu ditindaklanjuti spesialis — [Cat Rental Store Foley](https://catrentalstore.com/foley-rental/en_US/services/getting-started.html)
- [snippet] Loxam: quote online atau via agence; tidak ada setengah hari — [CustPlace](https://fr.custplace.com/loxam/)
- [snippet] Sumber vendor/trade (bukan riset UX formal): model hibrida lazim — pesan langsung untuk item standar dengan harga & ketersediaan terlihat, quote untuk pesanan besar/butuh persetujuan; studi kasus vendor melaporkan langkah reservasi dipangkas dari 5 ke 3 dan penghapusan kewajiban login untuk melihat harga — [Renterra](https://getrenterra.com/streamline-operations/scheduling-and-quoting), [Booqable](https://booqable.com/online-bookings), [RentalHawk via ForConstructionPros](https://www.forconstructionpros.com/rental/press-release/10367212/rentalhawk-allows-users-to-reserve-equipment-online). Tidak ditemukan data uji usability yang membandingkan quote vs reserve.

### Inferences
- Pola yang dapat dipinjam: tarif 3 tingkat (harian/mingguan/"bulanan" = 28 hari) tergantung lokasi; kejelasan basis jam operasi dan surcharge; label "belum termasuk" (BBM, mobilisasi, operator); hybrid quote/reserve.
- Spesifikasi apa saja yang ditampilkan pada halaman detail (kapasitas, bobot operasi, dsb.) tidak terdokumentasi dalam sumber ini — jangan dianggap bukti.

### Gaps
- Daftar filter spesifik (kapasitas, bobot, tenaga, dll.), isi halaman detail alat, tampilan ketersediaan per unit: tidak terverifikasi.
- Tarif aktual 2026: tidak ada (price list ditemukan hanya tahun 2017 dan 2019: eandi.org).
- Apakah Sunbelt/Herc mendukung "reserve online" dengan harga langsung vs "request quote" tidak dapat dikonfirmasi dari situs resmi.

## 4. Fitur akun/pemesanan online, pengantaran/penjemputan, dan konten keselamatan/pelatihan

### Takeaway
UR memiliki ekosistem paling lengkap yang terdokumentasi: Total Control (manajemen jobsite), app dengan pelacakan pengantaran & pickup, PIN akses, invoice, serta United Academy (pelatihan keselamatan). Sunbelt dan Herc menawarkan app dengan reservasi, pembayaran, dan service call.

### Cited Findings
- [snippet] UR app: telusuri katalog & harga, reservasi 24 jam; lihat penggunaan dan lokasi unit (armada telematika); status pengantaran dari persiapan hingga tiba; perpanjang, minta pickup, ajukan service request; dasbor on-rent/overdue; lihat PIN akses peralatan untuk pengguna berizin; lihat/bagikan/bayar invoice; terintegrasi Total Control (alat cloud manajemen worksite) — [UR Mobile App](https://www.unitedrentals.com/services/online-services/mobile-app), [App Store UR](https://apps.apple.com/us/app/-/id808843193), [BIC Magazine](https://www.bicmagazine.com/resources/products-services/united-rentals-introduces-new-features-in-mobile-app/). Artikel 2019 tentang fitur serupa: [Lift and Access](https://www.liftandaccess.com/news/united-rentals-unveils-new-app-updates-united-academy)
- [snippet] UR United Academy: kursus keselamatan online, tatap muka, di jobsite (UnitedAcademy.UR.com); contoh: Electrical Safety General Awareness (25 menit online), OSHA 30, Job Safety Analysis Procedures (45-60 menit online); blog keselamatan "Project Uptime" — [UR Electrical Safety](https://www.unitedrentals.com/training/electrical-safety/awareness), [UR OSHA 30](https://www.unitedrentals.com/training/osha30), [UR JSA](https://www.unitedrentals.com/training/job-safety-analysis/procedures), [5 building blocks safer construction sites](https://www.unitedrentals.com/project-uptime/safety/5-building-blocks-safer-construction-sites)
- [snippet] Sunbelt app: pengantaran dengan jadwal tanggal/jam atau pickup di cabang; kelola per proyek; invoice & pembayaran parsial — sumber di Pertanyaan 1. Sunbelt Rentals juga memiliki halaman layanan seperti permintaan pickup/service call (situs lama, RER).
- [snippet] Herc: telematika dan service call digital pada app — [Deloitte Digital](https://www.deloittedigital.com/ca/en/work/herc-rentals.html); ProControl: halaman "Apply for Credit" dan "real-time fleet management" — [Herc ProControl](https://www.hercrentals.com/procontrol.html)
- [snippet] Cat Rental Store: pembayaran via rental account atau Cat Card, bukti asuransi diminta; kebutuhan registrasi per dealer — lihat sumber Pertanyaan 1.
- [snippet] Jepang: Actio menawarkan pemesanan/pengembalian online 24 jam; i-Rental (SORABITO) aplikasi pemesanan terhubung ke LINE WORKS — [LINE WORKS PR](https://line-works.com/pr/20220804/) (hanya judul/ringkasan).

### Inferences
- Fitur "bukan sekadar sewa" yang diulang lintas pemain: akun/riwayat, perpanjang & off-rent online, minta pickup, service call, invoice online, pelacakan lokasi/jam pakai.
- Untuk konteks QSHE Indonesia: konten keselamatan/pelatihan sebagai bagian situs (kursus singkat, JSA, blog keselamatan) adalah pembeda UR; pengaitan dengan K3/SIO-SIPA tidak ada di sumber — itu usulan, bukan temuan.

### Gaps
- Fitur pengantaran/penjadwalan di situs desktop (bukan app) tidak terverifikasi.
- Konten keselamatan Sunbelt/Herc/Boels/Loxam: tidak ditemukan.
- Trust signal (sertifikasi, ulasan, logo klien, angka cabang) di situs: tidak terdokumentasi; hanya angka cabang Loxam (tidak konsisten) dan klaim UR "armada telematika terbesar" (dari deskripsi app, klaim perusahaan).

## 5. Praktik mobile dan performa yang menonjol

### Takeaway
Bukti kuat hanya untuk strategi "app + web" (UR, Sunbelt, Herc) dan pemesanan 24 jam; tidak ada data performa (kecepatan, Core Web Vitals) yang ditemukan.

### Cited Findings
- [snippet] UR mengejar pengalaman "lebih mulus lintas perangkat" dan mendesain ulang app; sebelumnya merilis situs mobile (older, tahun tidak jelas) — [DigitalNarrative_2022.pdf](https://fr.unitedrentals.com/sites/default/files/press-releases/DigitalNarrative_2022.pdf), [Canadian Rental Service](https://www.canadianrentalservice.com/united-rentals-launches-mobile-website-with-smart-phone-interface-1780/)
- [snippet] Sunbelt app tersedia versi ponsel dan tablet; Komatsu Rental AU/NZ situs responsif dengan geolokasi menemukan perwakilan terdekat (2019) — sumber di Pertanyaan 1.
- [snippet] Stack teknis yang dipublikasikan: Herc memakai Magento/Adobe/Salesforce/AWS (Deloitte); UR memakai Drupal/Acquia untuk situs alat bekas (studi kasus Acquia; ringkasan, tidak dibuka).
- [snippet] Kemudahan "mobile ordering" UR pernah menjadi studi kasus Acquia — [Acquia mobile ordering](https://www.acquia.com/index%2ephp/resources/customer-stories/united-rentals-mobile-ordering.md) (hanya judul).

### Inferences
- Pola yang dapat dipinjam tanpa bukti performa: antarmuka mobile-first untuk pekerja lapangan, login/riwayat dan "sewa lagi", geolokasi cabang terdekat, tombol telepon/WhatsApp (analog dengan nomor telepon menonjol pada Boels). Ini inferensi, bukan temuan terverifikasi.

### Gaps
- Tidak ada metrik performa/aksesibilitas, tidak ada teardown UX independen atau riset Baymard terkait rental alat berat yang ditemukan.
- Tidak ada pengamatan langsung UI mobile.
