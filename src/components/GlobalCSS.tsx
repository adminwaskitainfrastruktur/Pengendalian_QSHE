import React from 'react';

interface Props {
  scrollThumb: string;
  scrollThumbHover: string;
  rowHoverBg: string;
  btnHoverOverlay: string;
  cardHoverShadow: string;
  cardHoverBorder: string;
  cardAccentLine: string;
  popupBorder: string;
}

const GlobalCSS: React.FC<Props> = (p) => (
  <style>{`
    *{box-sizing:border-box;margin:0;padding:0}
    html{-webkit-font-smoothing:antialiased;-moz-osx-font-smoothing:grayscale;text-rendering:optimizeLegibility}
    /* Transisi warna tema HANYA saat toggle: kelas .theme-transition ditempel sesaat
       (±400ms) ke <html> ketika mode gelap diganti, lalu dilepas. Transisi permanen di
       semua elemen membuat SELURUH interaksi berat karena browser mengevaluasi ribuan node */
    .theme-transition,.theme-transition *{transition:background-color .3s ease,color .3s ease,border-color .3s ease,fill .3s ease!important}
    :root{
      --radius-xs:4px;--radius-sm:6px;--radius-md:8px;--radius-lg:12px;--radius-xl:16px;--radius-2xl:20px;--radius-full:9999px;
      --shadow-xs:0 1px 2px rgba(0,0,0,0.04);
      --shadow-sm:0 1px 3px rgba(0,0,0,0.06),0 1px 2px rgba(0,0,0,0.04);
      --shadow-md:0 4px 6px rgba(0,0,0,0.05),0 2px 4px rgba(0,0,0,0.04);
      --shadow-lg:0 10px 25px rgba(0,0,0,0.07),0 4px 10px rgba(0,0,0,0.04);
      --shadow-xl:0 20px 50px rgba(0,0,0,0.10),0 8px 20px rgba(0,0,0,0.05);
      --shadow-2xl:0 30px 70px rgba(0,0,0,0.14),0 12px 30px rgba(0,0,0,0.06);
      --ease-out:cubic-bezier(0.16,1,0.3,1);
      --ease-spring:cubic-bezier(0.34,1.56,0.64,1);
      --ease-smooth:cubic-bezier(0.4,0,0.2,1);
      --scroll-thumb:${p.scrollThumb};
      --scroll-thumb-hover:${p.scrollThumbHover};
      --row-hover-bg:${p.rowHoverBg};
      --btn-hover-overlay:${p.btnHoverOverlay};
      --card-hover-shadow:${p.cardHoverShadow};
      --card-hover-border:${p.cardHoverBorder};
      --card-accent-line:${p.cardAccentLine};
      --popup-border:${p.popupBorder};
    }
    /* Scrollbar halus: Firefox pakai scrollbar-width/color, Chrome/Edge/Safari pakai ::-webkit-scrollbar */
    .sn-scroll{scrollbar-width:thin;scrollbar-color:var(--scroll-thumb) transparent}
    .sn-scroll::-webkit-scrollbar{width:5px;height:5px}
    .sn-scroll::-webkit-scrollbar-track{background:transparent;border-radius:10px}
    .sn-scroll::-webkit-scrollbar-thumb{background:var(--scroll-thumb);border-radius:10px;transition:background .3s ease}
    .sn-scroll::-webkit-scrollbar-thumb:hover{background:var(--scroll-thumb-hover)}
    .sn-row{transition:background .18s var(--ease-out),transform .15s var(--ease-out)}
    .sn-row:hover{background:var(--row-hover-bg)!important;transform:translateX(2px)}
    .sn-btn{transition:all .2s var(--ease-out);position:relative;overflow:hidden}
    .sn-btn:active{transform:scale(0.95)}
    .sn-btn::after{content:'';position:absolute;inset:0;background:transparent;transition:background .3s ease;border-radius:inherit;pointer-events:none}
    .sn-btn:hover::after{background:var(--btn-hover-overlay)}
    /* Tanpa translateZ/will-change permanen: layer GPU menetap di puluhan kartu justru
       membebani memori & compositor; browser sudah otomatis mempromosikan saat animasi */
    .sn-card{transition:transform .3s var(--ease-out),box-shadow .3s var(--ease-out),border-color .3s var(--ease-out),background .25s ease;position:relative;overflow:hidden}
    .sn-card:hover{transform:translateY(-4px);box-shadow:var(--card-hover-shadow);border-color:var(--card-hover-border)}
    .sn-card::before{content:'';position:absolute;top:0;left:0;right:0;height:2px;background:var(--card-accent-line);opacity:0;transition:opacity .3s ease;border-radius:var(--radius-lg) var(--radius-lg) 0 0}
    .sn-card:hover::before{opacity:1}
    .sn-badge{transition:all .2s ease;letter-spacing:.01em}
    .sn-badge:hover{transform:translateY(-1px);box-shadow:0 2px 8px rgba(0,0,0,.08)}
    .sn-progress-bar{transition:width .8s var(--ease-out);position:relative;overflow:hidden}
    .sn-progress-bar::after{content:'';position:absolute;top:0;left:0;right:0;bottom:0;background:linear-gradient(90deg,transparent,rgba(255,255,255,.3),transparent);animation:shimmer 2s ease-in-out 3}
    .sn-chip-btn{transition:all .2s var(--ease-out);position:relative}
    .sn-chip-btn:hover{transform:translateY(-2px);box-shadow:0 4px 12px rgba(0,0,0,.1)}
    .sn-chip-btn:active{transform:translateY(0) scale(0.96)}
    .sn-chevron{transition:transform .3s var(--ease-spring)}
    .sn-dropdown-enter{animation:dropdownOpen .22s var(--ease-spring) both;transform-origin:top left}
    .sn-input{transition:all .25s var(--ease-out)}
    .sn-input:focus{outline:none;border-color:#3b82f6!important;box-shadow:0 0 0 4px rgba(59,130,246,.12)!important}
    .sn-table-row{animation:rowSlideIn .35s var(--ease-out) both}
    .sn-view-enter{animation:viewFadeUp .5s var(--ease-out) both}
    .sn-filter-refresh{animation:filterRefresh .55s var(--ease-out) both}
    .sn-gauge-ring{transition:stroke-dashoffset 1.1s var(--ease-out),stroke .5s ease}
    .sn-search-wrap{width:300px;transition:width .45s var(--ease-out)}
    .sn-search-wrap:focus-within{width:480px}
    .sn-select{transition:border-color .25s var(--ease-out),box-shadow .25s var(--ease-out),transform .2s var(--ease-out)}
    .sn-select:hover{border-color:#3b82f6!important}
    .sn-select:focus{outline:none;border-color:#3b82f6!important;box-shadow:0 0 0 4px rgba(59,130,246,.12)}
    .sn-fade-in{animation:fadeIn .5s var(--ease-out) both}
    .sn-slide-up{animation:slideUp .5s var(--ease-out) both}
    .sn-scale-in{animation:scaleIn .4s var(--ease-spring) both}
    .sn-item-refresh{animation:itemRefresh .55s cubic-bezier(0.22,1,0.36,1) both}
    .sn-kpi-icon{transition:transform .4s var(--ease-spring),box-shadow .3s ease}
    .sn-card:hover .sn-kpi-icon{transform:scale(1.18) rotate(-8deg)}

    @keyframes fadeIn{from{opacity:0}to{opacity:1}}
    @keyframes slideUp{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}
    @keyframes scaleIn{from{opacity:0;transform:scale(0.92)}to{opacity:1;transform:scale(1)}}
    @keyframes viewFadeUp{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}
    @keyframes filterRefresh{from{opacity:.45;transform:translateY(6px)}to{opacity:1;transform:translateY(0)}}
    @keyframes itemRefresh{from{opacity:0;transform:translateY(16px) scale(.98)}60%{opacity:1}to{opacity:1;transform:translateY(0) scale(1)}}
    @keyframes dropdownOpen{from{opacity:0;transform:translateY(-8px) scale(0.94)}to{opacity:1;transform:translateY(0) scale(1)}}
    @keyframes rowSlideIn{from{opacity:0;transform:translateX(-8px)}to{opacity:1;transform:translateX(0)}}
    @keyframes shimmer{0%{transform:translateX(-100%)}100%{transform:translateX(200%)}}
    @keyframes spin{to{transform:rotate(360deg)}}
    @keyframes float{0%,100%{transform:translateY(0px)}50%{transform:translateY(-6px)}}
    @keyframes pulseText{0%,100%{opacity:1}50%{opacity:0.5}}
    @keyframes overlayLogoPulse{
      0%,100%{box-shadow:0 12px 40px rgba(59,130,246,.35),0 0 0 0 rgba(59,130,246,.2)}
      50%{box-shadow:0 12px 60px rgba(59,130,246,.55),0 0 0 12px rgba(59,130,246,0)}
    }
    @keyframes loginCardEnter{from{opacity:0;transform:translateY(40px) scale(0.97)}to{opacity:1;transform:translateY(0) scale(1)}}
    @keyframes loginLeftEnter{from{opacity:0;transform:translateX(-30px)}to{opacity:1;transform:translateX(0)}}
    @keyframes loginRightEnter{from{opacity:0;transform:translateX(30px)}to{opacity:1;transform:translateX(0)}}
    @keyframes featureItemSlide{from{opacity:0;transform:translateX(-16px)}to{opacity:1;transform:translateX(0)}}
    @keyframes bgShift{0%{background-position:0% 50%}50%{background-position:100% 50%}100%{background-position:0% 50%}}
    @keyframes borderSpin{0%{background-position:0% 50%}50%{background-position:100% 50%}100%{background-position:0% 50%}}
    @keyframes dashboardReveal{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}
    @keyframes sidebarReveal{from{opacity:0;transform:translateX(-24px)}to{opacity:1;transform:translateX(0)}}
    @keyframes headerReveal{from{opacity:0;transform:translateY(-16px)}to{opacity:1;transform:translateY(0)}}

    .login-card-enter{animation:loginCardEnter .65s cubic-bezier(0.34,1.56,.64,1) both}
    .login-left-enter{animation:loginLeftEnter .55s cubic-bezier(0.16,1,.3,1) .15s both}
    .login-right-enter{animation:loginRightEnter .55s cubic-bezier(0.16,1,.3,1) .25s both}
    .dashboard-reveal{animation:dashboardReveal .55s cubic-bezier(0.16,1,.3,1) .1s both}
    .sidebar-reveal{animation:sidebarReveal .5s cubic-bezier(0.16,1,.3,1) .05s both}
    .header-reveal{animation:headerReveal .45s cubic-bezier(0.16,1,.3,1) .1s both}

    .stagger-1{animation-delay:.05s}
    .stagger-2{animation-delay:.10s}
    .stagger-3{animation-delay:.15s}
    .stagger-4{animation-delay:.20s}
    .stagger-5{animation-delay:.25s}

    .login-btn{position:relative;overflow:hidden}
    .login-btn::before{
      content:'';position:absolute;inset:-2px;border-radius:10px;padding:2px;
      background:linear-gradient(135deg,#3b82f6,#6366f1,#3b82f6);background-size:200% 200%;
      -webkit-mask:linear-gradient(#fff 0 0) content-box,linear-gradient(#fff 0 0);
      mask:linear-gradient(#fff 0 0) content-box,linear-gradient(#fff 0 0);
      -webkit-mask-composite:xor;mask-composite:exclude;
      opacity:0;transition:opacity .4s ease;pointer-events:none;
      animation:borderSpin 3s linear infinite;
    }
    .login-btn:hover::before{opacity:1}

    .leaflet-container{z-index:0!important;font-family:'Inter',sans-serif!important;border-radius:var(--radius-lg)!important}
    .leaflet-popup-content-wrapper{border-radius:var(--radius-lg)!important;box-shadow:var(--shadow-xl)!important;border:1px solid var(--popup-border)!important;animation:scaleIn .2s var(--ease-spring) both;padding:0!important;overflow:hidden}
    .leaflet-popup-content{margin:0!important;padding:14px 18px!important;min-width:200px}
    .leaflet-popup-close-button{top:8px!important;right:8px!important;color:#71717a!important;font-size:18px!important;width:24px!important;height:24px!important;display:flex!important;align-items:center!important;justify-content:center!important;border-radius:50%!important;transition:background .2s ease}
    .leaflet-popup-close-button:hover{background:rgba(0,0,0,.05)}
    .leaflet-marker-icon{transition:transform .25s var(--ease-spring)!important}
    .leaflet-marker-icon:hover{transform:scale(1.25)!important;z-index:1000!important}
    .leaflet-tooltip{border-radius:var(--radius-md)!important;box-shadow:var(--shadow-lg)!important;border:1px solid var(--popup-border)!important;padding:6px 10px!important}
    .map-dark{filter:invert(94%) hue-rotate(180deg) brightness(92%) contrast(88%) saturate(60%)}

    /* Perangkat sentuh: hover suka "nyangkut" setelah tap — netralkan efeknya */
    @media(hover:none){
      .sn-row:hover{transform:none}
      .sn-card:hover{transform:translateZ(0);box-shadow:none;border-color:inherit}
      .sn-card:hover::before{opacity:0}
      .sn-badge:hover,.sn-chip-btn:hover{transform:none;box-shadow:none}
      .sn-btn:hover::after{background:transparent}
      .sn-card:hover .sn-kpi-icon{transform:none}
      .sn-card:hover h3{transform:none}
    }

    /* Sidebar: di desktop selalu terlihat & statis (tanpa reflow); di layar sempit jadi
       laci geser ber-transform (GPU). Tombol menu/backdrop hanya tampil di mode laci. */
    .sn-backdrop{display:none}
    @media(max-width:1024px){
      .sn-sidebar{position:fixed!important;left:0;top:0;bottom:0;transform:translateX(-100%);transition:transform .45s var(--ease-out),box-shadow .3s ease;box-shadow:none!important;will-change:transform}
      .sn-sidebar.open{transform:translateX(0);box-shadow:var(--shadow-2xl)!important}
      .sn-backdrop{display:block}
    }
    @media(min-width:1025px){
      .sn-mobile-only{display:none!important}
    }

    /* Navigasi keyboard: cincin fokus yang jelas tanpa mengganggu klik mouse */
    .sn-btn:focus-visible,.sn-input:focus-visible,.sn-select:focus-visible,.sn-chip-btn:focus-visible{outline:2px solid #3b82f6;outline-offset:2px}

    /* ── Grid responsif ─────────────────────────────────────────────
       Layout dasar ditulis inline di komponen; kelas rg-* meng-override
       lewat media query (!important menang atas inline style) sehingga
       kolom melebur bertahap di layar sempit. */
    /* 5 kartu KPI: 5 → 3 → 2 → 1 kolom */
    @media(max-width:1500px){.rg-kpi{grid-template-columns:repeat(3,minmax(0,1fr))!important}}
    @media(max-width:980px){.rg-kpi{grid-template-columns:repeat(2,minmax(0,1fr))!important}}
    @media(max-width:600px){.rg-kpi{grid-template-columns:1fr!important}}
    /* Panel dua kolom umum (chart berdampingan, hero QSHE, 1fr+380px) */
    @media(max-width:1100px){.rg-2{grid-template-columns:1fr!important}}
    /* Tiga kolom (Operational Performance): 3 → 2 → 1 */
    @media(max-width:1280px){.rg-3{grid-template-columns:1fr 1fr!important}}
    @media(max-width:860px){.rg-3{grid-template-columns:1fr!important}}
    /* Split dua tabel lebar (Kinerja S.D Bulan + Breakdown) pecah lebih awal */
    @media(max-width:1380px){
      .rg-split{grid-template-columns:1fr!important}
      .rg-split>div:first-child{border-right:none!important;border-bottom:1px solid var(--popup-border)}
    }
    /* Peta: daftar provinsi pindah ke atas peta, lebih pendek */
    @media(max-width:900px){
      .rg-map{grid-template-columns:1fr!important}
      .rg-map-list{max-height:230px!important;border-right:none!important;border-bottom:1px solid var(--popup-border)}
    }
    /* Chip statistik PortfolioAnalytics: 5 → 3 → 2 kolom */
    @media(max-width:1100px){.rg-chips{grid-template-columns:repeat(3,minmax(0,1fr))!important}}
    @media(max-width:640px){.rg-chips{grid-template-columns:repeat(2,minmax(0,1fr))!important}}
    /* Header: kotak cari menyempit di layar kecil agar tidak mendesak tombol lain */
    @media(max-width:700px){
      .sn-search-wrap{width:160px}
      .sn-search-wrap:focus-within{width:220px}
    }
    /* Padding konten utama lebih rapat di ponsel */
    @media(max-width:768px){.sn-main{padding:14px 12px!important}}
    /* Elemen header sekunder disembunyikan di layar sangat sempit */
    @media(max-width:560px){.sn-hide-sm{display:none!important}}

    /* ── Penyempurnaan mobile & sentuh ─────────────────────────────── */
    html{scroll-behavior:smooth}
    button,a,input,select,[role="button"]{-webkit-tap-highlight-color:transparent;touch-action:manipulation}

    /* Umpan balik sentuhan pengganti hover: tekan = respons halus */
    @media(hover:none){
      .sn-row:active{background:var(--row-hover-bg)!important}
      .sn-btn:active,.sn-chip-btn:active{transform:scale(0.94);transition:transform .12s var(--ease-out)}
      .sn-card:active{transform:scale(0.995)}
    }

    /* Grup pill/tab: di layar sempit tidak melipat ke bawah, melainkan bisa
       digeser horizontal dengan momentum — scrollbar disembunyikan */
    @media(max-width:760px){
      .sn-pill-scroll{flex-wrap:nowrap!important;overflow-x:auto;max-width:100%;
        -webkit-overflow-scrolling:touch;scrollbar-width:none;scroll-snap-type:x proximity}
      .sn-pill-scroll::-webkit-scrollbar{display:none}
      .sn-pill-scroll>button{scroll-snap-align:start;flex-shrink:0}
    }

    /* Area tabel yang bisa digeser: momentum scroll + isyarat gradasi di tepi */
    .sn-table-wrap{-webkit-overflow-scrolling:touch;position:relative}
    /* Tabel di ponsel: sel lebih rapat & huruf sedikit lebih kecil supaya muat */
    @media(max-width:768px){
      .sn-table-wrap table{font-size:11px!important}
      .sn-table-wrap th,.sn-table-wrap td{padding:8px 10px!important}
    }

    /* Header Detail Matrix: susun vertikal di layar sempit — judul, search
       full-width, lalu pill yang bisa digeser */
    @media(max-width:900px){
      .dm-head{flex-direction:column!important;align-items:stretch!important;gap:12px!important}
      .dm-search{min-width:0!important}
      .dm-search>div{width:100%!important}
    }

    /* Kartu & grid lebih rapat di ponsel supaya konten dapat ruang */
    @media(max-width:600px){
      .rg-kpi,.rg-2,.rg-3,.rg-chips{gap:10px!important}
      .sn-main{padding:12px 10px!important}
    }

    /* ── Area potret paparan ─────────────────────────────────────────
       Komponen web asli dirender di luar layar untuk dipotret ke slide PPT.
       Kontrol interaktif (cari, filter, tombol, halaman) tidak relevan di
       slide, jadi disembunyikan; area gulir dibuka agar isinya ikut terpotret. */
    .paparan-potret input,.paparan-potret select,.paparan-potret .sn-chip-btn,
    .paparan-potret .dm-search,.paparan-potret .sn-search-wrap{display:none!important}
    .paparan-potret .sn-table-wrap,.paparan-potret .sn-scroll{
      max-height:none!important;overflow:visible!important}
    .paparan-potret *{animation:none!important;transition:none!important}
    .paparan-potret .sn-card{box-shadow:none!important;transform:none!important}

    @media(prefers-reduced-motion:reduce){*{animation-duration:.01ms!important;animation-iteration-count:1!important;transition-duration:.01ms!important;scroll-behavior:auto}}
  `}</style>
);

export default GlobalCSS;