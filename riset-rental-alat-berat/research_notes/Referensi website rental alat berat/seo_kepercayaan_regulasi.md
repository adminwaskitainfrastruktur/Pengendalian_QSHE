# SEO, strategi konten, sinyal kepercayaan, dan regulasi/keselamatan untuk website rental alat berat di Indonesia

Catatan metode (penting bagi penulis laporan): WebFetch gagal untuk developers.google.com, sakti.pusri.co.id, dan www.msig.co.id (getaddrinfo ENOTFOUND, host diblokir jaringan sesi; tidak dicoba ulang). Semua temuan di bawah berasal dari ringkasan hasil WebSearch (snippet-only), bukan dari pembacaan naskah penuh. WebSearch juga berbasis AS, jadi SERP Google Indonesia tidak teramati langsung. Setiap klaim diberi label [snippet] bila belum diverifikasi ke naskah primer. Nomor peraturan dan tahun dicatat persis seperti ditemukan; jangan dikutip sebagai dasar hukum tanpa dicek ke JDIH Kemnaker / peraturan.bpk.go.id.

## 1. Perilaku pencarian: pola kata kunci, intent, dan apa yang ranking

### Takeaway
Tidak ditemukan data volume pencarian yang dapat dikutip (tidak ada akses ke Keyword Planner/Semrush), dan tidak ada observasi SERP Indonesia. Yang bisa didukung sumber hanyalah indikasi struktur harga/istilah sewa (per jam, dengan/tanpa operator, minimum jam) yang memengaruhi apa yang dicari orang; pola kata kunci di bawah adalah hipotesis kerja, bukan data.

### Cited Findings
- Tidak ditemukan satu pun angka volume pencarian atau tingkat persaingan untuk "sewa excavator", "rental crane", "sewa alat berat" dsb.; pencarian hanya menghasilkan makalah akademik dan dokumen pemerintah tentang sewa alat berat — [hasil WebSearch "sewa alat berat keyword research" (snippet)](https://ojs.poltekba.ac.id/ojs/index.php/jutateks/article/download/28/19)
- Skripsi/riset mengangkat sewa sebagai pengungkit biaya proyek dan perbandingan sewa vs beli (studi Ciplaz Garut: leasing lebih menguntungkan daripada membeli); ini mengindikasikan adanya intent komparatif "sewa vs beli" [snippet] — [Garuda/Kemdiktisaintek](https://garuda.kemdiktisaintek.go.id/author/view/210665)
- Listing vendor Caterpillar (tak bertanggal) memuat tarif excavator kelas 200 (bucket 0,8–0,9 m3) Rp120.000–140.000/jam tergantung tahun, lokasi, pekerjaan; long arm kelas 200 Rp170.000–200.000/jam; stone breaker Rp270.000–300.000/jam; mini excavator Rp100.000–120.000/jam [snippet] — [Indotrading / Trakindo](https://en.indotrading.com/trakindoutama/mesin-caterpillar-p185482.aspx)
- Studi akademik (2021) membandingkan sewa PC-200 Rp508.940/jam dan 320D Rp519.630/jam [snippet]; tidak jelas apakah sudah termasuk BBM/operator — [Jurnal Umbuton](https://jurnal-umbuton.ac.id/index.php/SCEJ/article/download/2115/1123/6537)
- Tarif retribusi pemda (Perda Kota Banjarbaru 9/2016): excavator Kobelco SK 200 Rp750.000/jam, excavator mini Caterpillar 304CR Rp500.000/jam [snippet] — [pasal.id](https://pasal.id/peraturan/perda/perda-kota-banjarbaru-9-2016)
- Satu vendor mencantumkan dozer D65 Rp175.000/jam dengan minimum 100 jam (2022) [snippet] — hasil pencarian "sewa excavator per jam harga 2026" (sumber individual tidak teridentifikasi jelas; pakai hati-hati)
- Gaji pokok operator alat berat Jakarta sekitar Rp5,39 juta/bulan (data Indeed via IDX Channel); sumber lain menyebut operator excavator Rp7–10 juta/bulan [snippet] — [IDX Channel](https://www.idxchannel.com/milenomic/7-gaji-pokok-operator-alat-berat-di-indonesia-rata-rata-gapok-rp571-per-bulan/all)

### Inferences
- Rentang tarif per jam sangat lebar (Rp100 ribu hingga >Rp500 ribu) karena perbedaan cakupan (BBM, operator, mobilisasi, minimum jam), tahun, dan lokasi. Maka halaman "harga sewa alat berat per jam" yang jujur harus menjelaskan komponen harga dan variabelnya, bukan satu angka; ini juga membedakan dari kompetitor yang memajang angka tanpa konteks.
- Pola kata kunci hipotesis (BELUM diverifikasi volumenya): [jenis alat] + sewa/rental + [kota] (transaksional lokal, mis. "sewa excavator bekasi"); "harga sewa [alat] per jam/hari/bulan" (komersial-investigatif, berpotensi dapat panduan harga); "sewa alat berat dengan operator" / "tanpa operator" (transaksional dengan pertanyaan terms); "sewa vs beli alat berat", "spesifikasi PC200", "kapasitas crane 50 ton" (informasional). Perlu divalidasi dengan Google Keyword Planner / Search Console setelah situs live.
- Ketergantungan harga pada lokasi/tahun alat membuat kueri berbasis kota bernilai komersial tinggi, tetapi risiko halaman kota tipis (lihat bagian 2).

### Gaps
- Tidak ada data volume pencarian (sumber dan tanggal) ditemukan; perlu Keyword Planner/Semrush/Ahrefs atau Google Search Console.
- Tidak ada analisis SERP "apa yang ranking sekarang" untuk Google Indonesia (marketplace seperti Indotrading, direktori, situs vendor lokal diduga mendominasi, tetapi ini belum terverifikasi); perlu cek manual SERP dari IP Indonesia.
- Tidak ditemukan sumber praktisi SEO Indonesia bertanggal khusus niche alat berat.

## 2. SEO lokal: Google Business Profile, halaman kota, risiko doorway/scaled content, structured data, CWV, image SEO, konten pemancing tautan

### Takeaway
Kebijakan spam Google menyebut halaman yang menarget banyak kota yang pada dasarnya sama sebagai doorway abuse; halaman kota harus berisi informasi lokal yang unik dan benar-benar berguna. GBP untuk bisnis tanpa etalase dikelola sebagai service-area business dengan satu profil per lokasi. Rich result FAQ sudah dihentikan Google (2026), sehingga schema FAQ tidak lagi layak jadi taktik utama.

### Cited Findings
- Kebijakan spam Google (doorway abuse): situs/halaman dibuat untuk meranking kueri serupa dan mengarahkan pengguna ke halaman perantara yang kurang berguna. Contoh dari Google: banyak domain/halaman yang menargetkan wilayah atau kota yang menggiring pengguna ke satu halaman, dan halaman yang substansinya serupa dan lebih mirip hasil pencarian daripada hierarki yang jelas dan dapat dijelajahi [snippet/cermin teks; halaman asli gagal di-fetch] — [Spam policies for Google web search](https://developers.google.com/search/docs/essentials/spam-policies)
- Panduan pihak ketiga: halaman lokasi harus memuat detail unik tiap cabang (alamat, jam, staf) agar tidak dibaca sebagai doorway [snippet] — [Search Engine Land: Doorway pages deep dive](https://searchengineland.com/doorway-pages-seo-deep-dive-389786)
- Scaled content abuse: membuat banyak halaman terutama untuk memanipulasi ranking, baik ditulis manusia, AI, maupun template [secondhand, sumber vendor SEO]; pemisahnya adalah apakah tiap halaman memberi informasi lokal yang berbeda dan berguna — [layer3labs](https://www.layer3labs.io/guides/scaled-content-abuse), [obrienmedia](https://obrienmedia.co.uk/?p=212222)
- Satu-satunya komentar publik Google tentang halaman kota yang dikutip: John Mueller 2019, rencana 1.300 landing page kota "sounds like doorway pages" [secondhand] — [digitalshiftmedia](https://digitalshiftmedia.com/search-intelligence/google-june-2026-spam-update-home-services/)
- Spam update Google 24–26 Juni 2026 dilaporkan; dashboard Google tidak menjelaskan rincian [secondhand, blog vendor] — [digitalshiftmedia](https://digitalshiftmedia.com/search-intelligence/google-june-2026-spam-update-home-services/)
- Studi kasus vendor: perusahaan atap AS dengan 150+ halaman kota palsu (tanpa foto lokal/studi kasus/nama tim) kehilangan 43% trafik [klaim vendor, tidak independen; juga merujuk "sistem Google bocor" yang tidak dapat diverifikasi] — [BlitzMetrics](https://blitzmetrics.com/seo-audit-how-a-national-roofing-company-built-150-fake-city-pages-and-lost-43-of-its-traffic/)
- GBP: bisnis yang melayani di lokasi pelanggan (service-area business) sebaiknya satu profil untuk kantor pusat dengan area layanan; alamat disembunyikan bila tidak menerima pelanggan; hingga 20 area layanan, umumnya tidak melebihi sekitar 2 jam berkendara dari basis; alamat yang ditampilkan harus nyata dan dijaga staf; virtual office tidak memenuhi syarat [snippet, panduan pihak ketiga, rujuk halaman bantuan Google] — [Google Business Profile Help](https://support.google.com/business/answer/3038177?hl=en), [Whitespark](https://whitespark.ca/guides/can-your-business-be-on-google-a-guide-to-gbp-eligibility-by-business-type/)
- Update Juni 2025 dilaporkan melarang "negara atau provinsi/negara bagian" sebagai area layanan GBP [sumber sekunder, perlu verifikasi] — [PPC Land](https://ppc.land/google-bans-countries-and-states-from-business-profile-service-areas/)
- FAQ rich result: sejak Agustus 2023 hanya untuk situs pemerintah/kesehatan terkemuka — [Google Search Central blog 2023](https://developers.google.com/search/blog/2023/08/howto-faq-changes); catatan di dokumentasi Google dikutip: FAQ rich results tidak lagi muncul dan fitur FAQ (tampilan pencarian, laporan, dukungan Rich Results Test) akan dihentikan pada Juni 2026 [snippet] — [Search Engine Journal](https://www.searchenginejournal.com/google-drops-faq-rich-results-from-search/574429/). Markup FAQPage tetap valid di schema.org.
- Kecepatan internet seluler Indonesia: median unduh Ookla Mei 2026 62,54 Mbps, peringkat 74 dari 101 negara; di Asia Tenggara hanya mengungguli Filipina dan Laos [snippet] — [Databoks / Ookla](https://databoks.katadata.co.id/en/technology-telecommunications/statistics/69d771c379203/indonesias-mobile-internet-speed-lags-southeast-asia-in-early-2026); kota tercepat paruh pertama 2026 Tangerang Selatan 67,16 Mbps — [Databoks](https://databoks.katadata.co.id/en/technology-telecommunications/statistics/6aa787af2879a/tangsel-the-city-with-indonesias-fastest-median-mobile-download-speed). Angka sebelumnya (Ookla via DataReportal) median 45,01 Mbps untuk data Agustus 2025 (metode/periode berbeda, tidak langsung sebanding).

### Inferences
- Praktik aman: satu halaman layanan per jenis alat (excavator, crane, dll.), dan halaman kota/area hanya bila ada konten unik yang nyata (basis/depo terdekat, waktu mobilisasi, kondisi tanah/proyek lokal, proyek referensi di kota itu, foto lokal, nama koordinator lokal). Halaman template yang hanya mengganti nama kota berisiko doorway/scaled content.
- GBP: jika perusahaan punya kantor/depo bemanusia, tampilkan alamat dan buat profil per lokasi sungguhan; jika tidak, SAB dengan area layanan. Jangan membuat profil dengan alamat fiktif/virtual untuk banyak kota.
- FAQ schema tidak lagi bernilai untuk rich result; FAQ tetap berguna sebagai konten bagi pengguna. LocalBusiness/Organization, Product/Offer tetap relevan sebagai markup deskriptif, tetapi tidak ada sumber yang ditemukan untuk eligibility rich result-nya (lihat Gaps). Offer untuk sewa tidak punya harga tunggal, jadi gunakan price range / minta penawaran, bukan angka palsu.
- Karena kecepatan seluler Indonesia di peringkat bawah ASEAN dan bervariasi antar kota, mobile performance (gambar teknis dioptimalkan, lazy load, WebP/AVIF, ukuran lampiran PDF) layak jadi prioritas. Ini inferensi; tidak ada data CWV lapangan Indonesia.
- Konten yang layak mengundang tautan: panduan spesifikasi per model (kapasitas, bucket, bobot operasi), panduan komponen harga sewa, studi kasus proyek, checklist K3 pra-sewa. Belum ada sumber yang menguji efektivitas link-earning di niche ini.

### Gaps
- Dokumentasi Google (spam policies, structured data LocalBusiness/Product/Offer, CWV, image SEO) tidak dapat dibaca langsung karena developers.google.com gagal resolve; teks di atas dari snippet. Perlu izinkan host itu untuk verifikasi kutipan persis.
- Tidak ada data Core Web Vitals (CrUX/HTTP Archive) khusus Indonesia.
- Tidak ada sumber yang ditemukan untuk image SEO peralatan atau untuk efektivitas jenis konten pemancing tautan.
- Panduan GBP memakai blog pihak ketiga, bukan halaman bantuan Google yang dibaca penuh.

## 3. Sinyal kepercayaan yang dicari pembeli / tim procurement

### Takeaway
Contoh dokumen persyaratan penyedia nyata (PT PP, tender migas) menunjukkan procurement meminta sertifikat kelayakan alat dari pihak ketiga, SILO dari Disnaker setempat, sertifikat kompetensi operator (SIO/BNSP), surat komitmen K3, dan daftar peralatan, selain dokumen legalitas usaha. Bukti ini harus bisa ditunjukkan per unit dan per operator.

### Cited Findings
- Dokumen persyaratan penyedia PT PP meminta: sertifikat kelayakan alat berat dan alat angkat-angkut dari pihak ketiga (uji riksa, uji beban, uji tarik); SILO alat berat dari Disnaker tempat alat dioperasikan; sertifikat kompetensi operator dari Kemnaker atau BNSP termasuk SIO untuk alat angkat-angkut; SIM B2 untuk pengemudi kendaraan berat; sertifikat tenaga ahli (rigger, scaffolder, K3 listrik, welder, dll.); surat komitmen/Statement Letter pemenuhan K3 ditandatangani pimpinan puncak; daftar peralatan; rencana tanggap darurat dan sertifikat CSMS untuk pekerjaan berisiko tinggi [snippet] — [PT PP Dokumen Persyaratan Penyedia](https://homepage.ptpp.co.id/storage/6507/Dokumen-Persyaratan-Penyedia.pdf)
- Tender PSC migas biasanya mensyaratkan pernyataan kebenaran data kualifikasi dan dokumen legalitas/perizinan usaha [snippet] — [Petromindo tender](https://petromindo.com/tender/detail/rental-vessel-for-oil-spill-equipment)
- SMK3: PP 50 Tahun 2012 Pasal 5 mewajibkan SMK3 bagi perusahaan yang mempekerjakan paling sedikit 100 pekerja atau memiliki tingkat potensi bahaya tinggi; kriteria audit 166 elemen (besar/risiko tinggi), 122 (sedang), 64 (kecil/rendah) [snippet teks PP] — [PP 50/2012 (JDIH Sumsel)](https://jdih.sumselprov.go.id/storage/userfiles/PP%20Nomor%2050%20Tahun%202012.pdf), [salinan UM](https://k3.um.ac.id/wp-content/uploads/2019/04/PP-No.-50-Tahun-2012-Penerapan-Sistem-Manajemen-K3.pdf)
- Legalitas usaha: KBLI 2020 77393 dicatat sebagai sewa mesin/peralatan konstruksi dan teknik sipil tanpa operator; sewa alat konstruksi dengan operator dicatat pada KBLI 43905 di listing lama; OSS disebut mengadopsi KBLI 2025 untuk pengajuan baru sejak 16 Juni 2026 [snippet, situs konsultan, bukan sumber resmi] — [kbli.co.id/77393](https://kbli.co.id/77393), [izin.co.id](https://izin.co.id/en/kbli-terbaru). Tingkat risiko KBLI 77393 TIDAK ditemukan (hanya KBLI 77392 dinyatakan risiko rendah oleh satu situs) — [kbli.co.id/id/77392](https://kbli.co.id/id/77392)
- Skema sertifikasi kompetensi alat berat mengikuti BNSP [snippet] — [UGM Teknik Mesin SV (April 2025)](https://teknikmesin.sv.ugm.ac.id/tag/ugm)

### Inferences
- Sinyal yang layak dipamerkan: NIB dengan KBLI yang sesuai (pastikan sewa dengan/tanpa operator dicakup), NPWP, daftar unit lengkap dengan tahun/merek/serial, foto asli, SILO + sertifikat uji riksa terkini per unit (tampilkan nomor dan tanggal berlaku), SIO + sertifikat BNSP per operator, polis asuransi alat/TPL, sertifikat ISO 9001/14001/45001 dan/atau SMK3 bila ada, logo klien dan referensi proyek yang bisa diverifikasi, catatan perawatan berkala, CSMS/prakualifikasi.
- Kemungkinan procurement mengecek hal-hal ini sebelum kontrak; situs yang menyediakan "paket dokumen vendor" yang bisa diunduh (dengan penyamaran data pribadi operator) bisa menjadi pembeda. Ini inferensi.

### Gaps
- Tidak ditemukan survei tentang apa yang paling dipercaya pembeli alat berat Indonesia; bukti hanya dari dua contoh dokumen tender.
- Tidak ditemukan sumber resmi yang menyatakan risiko perizinan KBLI sewa alat berat di OSS/PP 28/2025 atau pengaruh KBLI 2025 pada rental; periksa OSS langsung.
- Tidak ditemukan sumber yang menjelaskan standar SBU/izin lain yang berlaku untuk rental alat berat dengan operator.
- Nilai ISO 9001/45001 dan SMK3 sebagai pembeda tidak diverifikasi dengan sumber lembaga sertifikasi; tidak dicari ulang karena batas panggilan.

## 4. Regulasi dan keselamatan Indonesia: pesawat angkat-angkut, SIO, SILO, pemeriksaan berkala, perubahan 2023-2026, dokumen per unit/operator

### Takeaway
Rujukan inti adalah Permenaker 8 Tahun 2020 (K3 pesawat angkat dan pesawat angkut, mencabut PER-05/MEN/1985 dan PER.09/MEN/VII/2010) dan Permenaker 38 Tahun 2016 (K3 pesawat tenaga dan produksi). Pada 2026, Permenaker 11 Tahun 2026 (Tata Cara Pengawasan Ketenagakerjaan) dilaporkan mencabut sebagian pasal keduanya, dan status 8/2020 di BPK tampil ambigu. Rental wajib memverifikasi status terkini sebelum mencantumkan dasar hukum di situs.

### Cited Findings
- Permenaker 8/2020 ditetapkan 8 Juni 2020 dan diundangkan 12 Juni 2020; mencabut PER-05/MEN/1985 dan PER.09/MEN/VII/2010; Berita Negara No. 609/2020 — [BPK: Permenaker 8/2020](https://peraturan.bpk.go.id/Details/163270/permenaker-no-8-tahun-2020), [Berita Negara bn609-2020](https://peraturan.go.id/files/bn609-2020.pdf)
- Status di BPK: halaman Permenaker 8/2020 menampilkan status "Tidak Berlaku" sekaligus keterangan dicabut sebagian oleh Permenaker 11 Tahun 2026 (Pasal 1 angka 5, Pasal 141 ayat (4), Pasal 173 ayat (3)) [snippet; ambigu, perlu dicek] — [BPK](https://peraturan.bpk.go.id/Details/163270/permenaker-no-8-tahun-2020). Sumber berita Desember 2024 dan artikel 2026 masih menyebut 8/2020 sebagai rujukan berlaku — [Kompas Lestari 4 Des 2024](https://lestari.kompas.com/read/2024/12/04/161122386/tingkatkan-kesadaran-k3-pt-gni-adakan-pelatihan-dan-sertifikasi-sio-bagi)
- Permenaker 11 Tahun 2026 tentang Tata Cara Pengawasan Ketenagakerjaan: ditetapkan 29 Juni 2026, diundangkan 3 Juli 2026; mencabut Permenaker 33/2016 jo. Permenaker 1/2020; arah pengawasan menekankan pencegahan lewat data dan teknologi digital [snippet] — [BPK](https://peraturan.bpk.go.id/Details/351282/permenaker-no-11-tahun-2026), [Pasal.id](https://pasal.id/peraturan/permen/permenaker-no-11-tahun-2026), [Gebrak.id Juli 2026](https://www.gebrak.id/2026/07/menaker-yassierli-ubah-arah-pengawasan-ketenagakerjaan-kini-fokus-cegah-pelanggaran-sejak-dini.html)
- Perubahan atas Permenaker 11/2026: dokumen JDIH menyebut Permenaker No. 15 (BN 2026/No. 681); rekaman harmonisasi 2 September 2026 merujuk rancangan perubahan; teks final dan tanggal berlaku TIDAK ditemukan [snippet] — [JDIH Kemnaker](https://jdih.kemnaker.go.id/asset/data_puu/DataDukung_Permenaker_15_2026.pdf)
- Permenaker 38 Tahun 2016 (K3 pesawat tenaga dan produksi), berlaku 27 Desember 2016, mencabut PER.04/MEN/1985; dilaporkan dicabut sebagian oleh Permenaker 11/2026 (Pasal 1 angka 2, 137, 138, 143) [snippet] — [BPK: Permenaker 38/2016](https://peraturan.bpk.go.id/Details/146207/permenaker-no-38-tahun-2016), [JDIH Kemnaker](https://jdih.kemnaker.go.id/peraturan/detail/1430/peraturan-menteri-nomor-38-tahun-2016). Definisi: pesawat tetap atau berpindah yang membangkitkan/memindahkan tenaga atau mengolah bahan dan berpotensi menimbulkan kecelakaan. Apakah excavator/dozer masuk kategori ini TIDAK dinyatakan eksplisit di hasil.
- Lampiran 8/2020 memuat Lampiran 1 Kualifikasi Operator dengan Kelas I, II, III per jenis dan kapasitas alat; daftar pesawat angkat dan angkut mencakup antara lain overhead crane (angkat) serta excavator, loader dan sejenisnya (angkut) [snippet, kolom kelas tidak terbaca penuh]; juga formulir pemeriksaan dan pengujian serta stiker dan surat keterangan memenuhi/tidak memenuhi syarat K3 — [BPK PDF Permen 8/2020](https://peraturan.bpk.go.id/Download/156001/Permen_8_Tahun_2020_2.pdf)
- SIA vs SIO: SIA (Surat Izin Alat) adalah izin untuk perusahaan yang memakai alat (disebut untuk forklift); SIO adalah izin perorangan kelayakan mengoperasikan; dikutip merujuk Permenaker 08/2020 Pasal 165 tentang syarat operator [snippet panduan asuransi, 2022] — [MSIG Loss Prevention E60](https://www.msig.co.id/sites/msig_id/files/2022-02/E60%20DID%20YOU%20KNOW%20-%20LOSS%20PREVENTION%20EDITION%20SIA%20and%20SIO.pdf)
- Uji pembebanan crane: statis 125% dan dinamis 110% dari kapasitas maksimum, dikaitkan dengan Permenaker 8/2020 [secondhand, artikel jurnal; belum diverifikasi ke naskah] — [Jurnal UMB](https://jurnal.umb.ac.id/index.php/JAMS/article/download/9294/6062/43717)
- Operator harus memiliki SIO; pejabat Disnaker Jawa Tengah menyatakannya setelah kecelakaan lift crane Blora Februari 2025 [snippet] — [Kompas TV](https://www.kompas.tv/regional/573601/kelalaian-dalam-tragedi-lift-crane-proyek-jatuh)
- Kepmenaker No. 277 Tahun 2026 menetapkan SKKNI operator alat angkat konstruksi (tower crane, truck mounted crane) yang menyebut kebutuhan kompetensi untuk sistem kontrol berbasis komputer, sensor keselamatan, dan monitoring beban [snippet] — [JDIH Kemnaker 2026kmnaker277](https://jdih.kemnaker.go.id/asset/data_puu/2026kmnaker277.pdf)
- Permenaker No. 13 Tahun 2025 dilaporkan efektif 17 November 2025 dan mewajibkan P2K3 aktif [satu sumber sekunder tanpa kutipan resmi; belum terverifikasi] — [hasil WebSearch PP 50/2012 (xpnd.co.id)](https://xpnd.co.id/id/services/asesmen-risiko/)
- Referensi SILO dalam dokumen tender PT PP: "SILO alat berat dari disnaker setempat tempat alat dioperasikan" (sertifikat kelayakan operasi) — [PT PP](https://homepage.ptpp.co.id/storage/6507/Dokumen-Persyaratan-Penyedia.pdf). Kepanjangan SILO dan dasar pasalnya TIDAK dikonfirmasi oleh sumber yang ditemukan.

### Inferences
- Kandidat daftar dokumen per unit: SILO (bila diminta pemberi kerja/Disnaker), sertifikat/surat keterangan pemeriksaan dan pengujian K3 (stiker), laporan uji beban untuk crane, SIA/izin alat bila berlaku, STNK/KIR untuk unit on-road, polis asuransi, catatan perawatan, manual dan load chart. Per operator: SIO (kelas sesuai alat), sertifikat BNSP, SIM B2 bila mengemudi, bukti pelatihan K3/Ahli K3 umum, medical check-up. Ini sintesis dari dokumen tender dan regulasi; format wajib persisnya harus dicek ke naskah.
- Untuk situs: tampilkan ringkasan status kepatuhan per unit (nomor dan tanggal kadaluwarsa; mis. tabel "Dokumen unit"), dan hindari klaim hukum spesifik di halaman publik tanpa verifikasi karena ada indikasi perubahan 2026.
- Konflik status (BPK "Tidak Berlaku" vs pencabutan sebagian) kemungkinan merupakan artefak tampilan; belum terselesaikan.

### Gaps
- Naskah penuh Permenaker 8/2020 (pasal tentang SIO, kelas, masa berlaku, interval pemeriksaan berkala) tidak terbaca karena host gagal; masa berlaku SIO dan interval pemeriksaan berkala TIDAK ditemukan.
- Tidak ditemukan konfirmasi perubahan 2023-2025 tentang SIO (termasuk SIO digital); satu-satunya perubahan terkait 2026: Permenaker 11/2026, Permenaker 15/2026 (perubahan), dan Kepmenaker 277/2026.
- Kepanjangan SILO, dan apakah excavator/dozer wajib SILO/SIO menurut Permenaker 8/2020 vs 38/2016, tidak terkonfirmasi.
- Tidak diverifikasi: PP 34/2018? atau regulasi lain (dugaan awal), hanya PP 50/2012 yang ditemukan.

## 5. Ide konten yang menghubungkan QSHE/K3 sebagai pembeda

### Takeaway
Tidak ada sumber khusus yang meneliti konten QSHE rental alat berat; ide di bawah adalah inferensi dari temuan bagian 3 dan 4 (apa yang diminta procurement dan apa yang diatur regulasi).

### Cited Findings
- Procurement meminta komitmen K3 bertanda tangan pimpinan puncak, rencana tanggap darurat, CSMS, dan kompetensi personel [snippet] — [PT PP](https://homepage.ptpp.co.id/storage/6507/Dokumen-Persyaratan-Penyedia.pdf)
- Pengawasan ketenagakerjaan 2026 diarahkan ke pencegahan berbasis data dan teknologi digital [snippet] — [Gebrak.id](https://www.gebrak.id/2026/07/menaker-yassierli-ubah-arah-pengawasan-ketenagakerjaan-kini-fokus-cegah-pelanggaran-sejak-dini.html)
- Kecelakaan crane sebagai konteks risiko dan penegakan: lift crane Blora, Februari 2025 [snippet] — [Kompas TV](https://www.kompas.tv/regional/573601/kelalaian-dalam-tragedi-lift-crane-proyek-jatuh)

### Inferences
- Ide konten (hipotesis, belum diuji): (1) "Dokumen apa yang harus Anda minta dari rental alat berat" (checklist untuk procurement, menyasar kueri informasional sekaligus menunjukkan kepatuhan); (2) halaman profil keselamatan per unit/operator (nomor SILO/SIO, tanggal berlaku); (3) SOP pra-operasi dan inspeksi harian excavator/crane yang dapat diunduh; (4) penjelasan sewa dengan vs tanpa operator beserta tanggung jawab K3; (5) studi kasus proyek dengan metrik keselamatan (jam kerja tanpa LTI) bila datanya benar-benar ada; (6) panduan load chart dan zona aman crane; (7) lingkungan: manajemen BBM/tumpahan oli dan emisi; (8) panduan mobilisasi dan lowbed. Untuk menghindari skala-konten, setiap panduan harus ditulis dengan keahlian sungguhan, bukan di-generate massal.

### Gaps
- Tidak ada data tentang konten QSHE mana yang menaikkan ranking atau konversi di niche ini.
- Metrik keselamatan (LTI, TRIR) milik perusahaan tidak tersedia; jangan diisi tanpa data nyata.
