import React, { useEffect, useState } from 'react';
import { PublicClientApplication } from '@azure/msal-browser';
import { MsalProvider, useMsal, useIsAuthenticated } from '@azure/msal-react';

export const msalConfig = {
  auth: {
    clientId: 'f536a53d-8a16-45cf-9acf-d8c77212b605',
    authority: 'https://login.microsoftonline.com/94526da5-8783-4516-9eb7-8c58bbf66a2d',
    redirectUri: window.location.origin,
  },
  cache: {
    cacheLocation: 'sessionStorage',
    storeAuthStateInCookie: false,
  },
  system: {
    allowRedirectInIframe: true,
  },
};

export const loginRequest      = { scopes: ['User.Read'] };
export const graphFilesRequest = { scopes: ['Files.Read.All', 'Sites.Read.All'] };

export const graphConfig = {
  graphEndpoint:       'https://graph.microsoft.com/v1.0',
  sharePointHost:      'waskitainfra.sharepoint.com',
  sharePointSitePath:  '/sites/PengendalianQSHE',
  targetFileName:      'Data base dashboard_update1.xlsx',
};

export const msalInstance = new PublicClientApplication(msalConfig);

// ─── Theme tokens ─────────────────────────────────────────────
const themes = {
  dark: {
    pageBg:        'linear-gradient(135deg, #0b1120 0%, #1a2332 50%, #0f1729 100%)',
    cardBg:        '#ffffff',
    leftBg:        'linear-gradient(145deg, #1a2332 0%, #0f1729 100%)',
    leftTitle:     '#f8fafc',
    leftSub:       '#94a3b8',
    leftText:      '#cbd5e1',
    rightBg:       '#ffffff',
    rightTitle:    '#0f172a',
    rightSub:      '#64748b',
    rightFooter:   '#94a3b8',
    footerBorder:  '#f1f5f9',
    btnBg:         '#ffffff',
    btnBorder:     '#e2e8f0',
    btnText:       '#0f172a',
    btnHoverBg:    '#f8faff',
    btnHoverBorder:'#3b82f6',
    toggleBg:      'rgba(255,255,255,0.08)',
    toggleColor:   '#94a3b8',
    toggleHover:   'rgba(255,255,255,0.14)',
    featureBg:     'rgba(255,255,255,0.06)',
    orb1:          'rgba(59,130,246,0.06)',
    orb2:          'rgba(99,102,241,0.07)',
    orb3:          'rgba(59,130,246,0.04)',
    particleColor: '59,130,246',
  },
  light: {
    pageBg:        'linear-gradient(135deg, #e8f0fe 0%, #f0f4ff 50%, #e8f0fe 100%)',
    cardBg:        '#ffffff',
    leftBg:        'linear-gradient(145deg, #1e40af 0%, #1d4ed8 60%, #2563eb 100%)',
    leftTitle:     '#f8fafc',
    leftSub:       '#bfdbfe',
    leftText:      '#dbeafe',
    rightBg:       '#ffffff',
    rightTitle:    '#0f172a',
    rightSub:      '#475569',
    rightFooter:   '#64748b',
    footerBorder:  '#e2e8f0',
    btnBg:         '#ffffff',
    btnBorder:     '#cbd5e1',
    btnText:       '#0f172a',
    btnHoverBg:    '#eff6ff',
    btnHoverBorder:'#2563eb',
    toggleBg:      'rgba(0,0,0,0.07)',
    toggleColor:   '#475569',
    toggleHover:   'rgba(0,0,0,0.12)',
    featureBg:     'rgba(255,255,255,0.15)',
    orb1:          'rgba(37,99,235,0.10)',
    orb2:          'rgba(99,102,241,0.09)',
    orb3:          'rgba(37,99,235,0.06)',
    particleColor: '37,99,235',
  },
} as const;
type ThemeKey = keyof typeof themes;

// ─── Inline keyframes injected once ──────────────────────────
const CSS = `
  @keyframes bgShift       { 0%,100%{background-position:0% 50%} 50%{background-position:100% 50%} }
  @keyframes fadeIn        { from{opacity:0} to{opacity:1} }
  @keyframes slideUp       { from{opacity:0;transform:translateY(18px)} to{opacity:1;transform:translateY(0)} }
  @keyframes scaleIn       { from{opacity:0;transform:scale(0.88)} to{opacity:1;transform:scale(1)} }
  @keyframes float         { 0%,100%{transform:translateY(0) rotate(0deg)} 33%{transform:translateY(-22px) rotate(6deg)} 66%{transform:translateY(-10px) rotate(-4deg)} }
  @keyframes spin          { to{transform:rotate(360deg)} }
  @keyframes pulseText     { 0%,100%{opacity:1} 50%{opacity:0.5} }
  @keyframes logoPulse     { 0%,100%{box-shadow:0 8px 32px rgba(59,130,246,0.35),0 0 0 0 rgba(59,130,246,0.2)} 50%{box-shadow:0 8px 48px rgba(59,130,246,0.55),0 0 0 10px rgba(59,130,246,0)} }
  @keyframes featureSlide  { from{opacity:0;transform:translateX(-14px)} to{opacity:1;transform:translateX(0)} }
  @keyframes cardEntrance  { from{opacity:0;transform:translateY(32px) scale(0.97)} to{opacity:1;transform:translateY(0) scale(1)} }
  @keyframes shimmer       { 0%{background-position:-200% 0} 100%{background-position:200% 0} }
  @keyframes gradientShift { 0%,100%{opacity:1} 50%{opacity:0.75} }
  @keyframes dotPop        { 0%,80%,100%{transform:scale(1);opacity:0.4} 40%{transform:scale(1.5);opacity:1} }
  @keyframes borderGlow    { 0%,100%{box-shadow:0 0 0 0 rgba(59,130,246,0)} 50%{box-shadow:0 0 0 4px rgba(59,130,246,0.15)} }

  @keyframes neonBlink     { 0%,100%{opacity:1} 50%{opacity:0.6} }

  .login-card   { animation: cardEntrance 0.7s cubic-bezier(0.16,1,0.3,1) both; }
  .login-left   { animation: fadeIn 0.6s ease 0.15s both; }
  .login-right  { animation: fadeIn 0.6s ease 0.25s both; }

  /* ── Neon border pada tombol login saat hover (statis, tidak berputar) ── */
  .neon-wrap { position: relative; transition: transform 0.35s cubic-bezier(0.34,1.56,0.64,1); }
  .neon-wrap:hover  { transform: translateY(-3px); }
  .neon-wrap:active { transform: translateY(-1px) scale(0.99); }
  /* Halo neon lembut di belakang tombol (berkedip halus) */
  .neon-glow {
    position: absolute; inset: -3px; border-radius: 16px; z-index: 0; pointer-events: none;
    background: linear-gradient(135deg, #3b82f6, #22d3ee, #a78bfa);
    filter: blur(13px); opacity: 0; transition: opacity 0.4s ease;
  }
  .neon-wrap:hover .neon-glow { opacity: 0.55; animation: neonBlink 1.6s ease-in-out infinite; }
  .neon-btn { position: relative; z-index: 1; border-radius: 14px; }
  /* Garis neon gradient tepat di border tombol */
  .neon-btn::before {
    content: ''; position: absolute; inset: 0; border-radius: 14px; padding: 2px; z-index: 0;
    background: linear-gradient(135deg, #3b82f6, #22d3ee, #a78bfa);
    -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
    -webkit-mask-composite: xor; mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0); mask-composite: exclude;
    opacity: 0; transition: opacity 0.35s ease;
  }
  .neon-wrap:hover .neon-btn::before { opacity: 1; }
  .neon-btn > .login-btn { position: relative; z-index: 1; width: 100%; }
  .login-btn:active { transform: scale(0.985); }

  /* ── Responsivitas HP, tablet, Android ── */
  @media (max-width: 900px) {
    .login-split-left  { flex: 0 0 42% !important; padding: 40px 30px !important; }
    .login-split-right { padding: 44px 38px !important; }
  }
  @media (max-width: 680px) {
    .login-split-left  { display: none !important; }
    .login-split-right { padding: 40px 28px !important; }
    .login-card        { min-height: auto !important; border-radius: 24px !important; }
  }
  @media (max-width: 430px) {
    .login-page        { padding: 12px !important; }
    .login-split-right { padding: 30px 20px !important; }
    .login-h1          { font-size: 23px !important; }
    .login-badge-wrap  { margin-bottom: 14px !important; }
  }
  @media (max-height: 720px) {
    .login-page { align-items: flex-start !important; overflow-y: auto !important; -webkit-overflow-scrolling: touch; }
  }
`;

// ─── Particle canvas (memoised) ───────────────────────────────
const ParticlesBg: React.FC<{ color: string }> = ({ color }) => {
  const ref = React.useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current!;
    const ctx    = canvas.getContext('2d')!;
    let W = 0, H = 0, raf = 0;

    const particles: { x:number; y:number; r:number; dx:number; dy:number; o:number }[] = [];

    const resize = () => {
      W = canvas.width  = canvas.offsetWidth;
      H = canvas.height = canvas.offsetHeight;
    };

    const init = () => {
      particles.length = 0;
      const n = Math.min(Math.floor((W * H) / 12000), 70);
      for (let i = 0; i < n; i++) {
        particles.push({
          x: Math.random() * W, y: Math.random() * H,
          r: 0.6 + Math.random() * 2,
          dx: (Math.random() - 0.5) * 0.25,
          dy: (Math.random() - 0.5) * 0.20,
          o: 0.08 + Math.random() * 0.28,
        });
      }
    };

    const draw = () => {
      ctx.clearRect(0, 0, W, H);
      for (const p of particles) {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${color},${p.o})`;
        ctx.fill();
        p.x += p.dx; p.y += p.dy;
        if (p.x < -4) p.x = W + 4;
        if (p.x > W + 4) p.x = -4;
        if (p.y < -4) p.y = H + 4;
        if (p.y > H + 4) p.y = -4;
      }
      raf = requestAnimationFrame(draw);
    };

    const ro = new ResizeObserver(() => { resize(); init(); });
    ro.observe(canvas.parentElement!);
    resize(); init(); draw();

    return () => { cancelAnimationFrame(raf); ro.disconnect(); };
  }, [color]);

  return (
    <canvas
      ref={ref}
      style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 0 }}
    />
  );
};

// ─── Sun / Moon toggle ────────────────────────────────────────
const ThemeToggle: React.FC<{ theme: ThemeKey; onToggle: () => void }> = ({ theme, onToggle }) => {
  const t = themes[theme];
  return (
    <button
      onClick={onToggle}
      title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
      style={{
        position: 'fixed', top: '20px', right: '20px', zIndex: 100,
        width: '42px', height: '42px', borderRadius: '50%',
        background: t.toggleBg, border: 'none', cursor: 'pointer',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: '20px', transition: 'background 0.25s, transform 0.3s cubic-bezier(0.34,1.56,0.64,1)',
        color: t.toggleColor,
        backdropFilter: 'blur(8px)',
        boxShadow: '0 2px 12px rgba(0,0,0,0.12)',
      }}
      onMouseEnter={e => { e.currentTarget.style.background = t.toggleHover; e.currentTarget.style.transform = 'scale(1.12)'; }}
      onMouseLeave={e => { e.currentTarget.style.background = t.toggleBg;    e.currentTarget.style.transform = 'scale(1)'; }}
    >
      {theme === 'dark' ? '☀️' : '🌙'}
    </button>
  );
};

// ─── LoginPage ────────────────────────────────────────────────
interface LoginPageProps {
  onLoginStart: () => void;
  onLoginEnd:   () => void;
  animKey?:     number;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onLoginStart, onLoginEnd, animKey = 0 }) => {
  const { instance } = useMsal();
  const [theme, setTheme]       = useState<ThemeKey>('dark');
  const [hovering, setHovering] = useState(false);
  const t = themes[theme];

  const handleLogin = async () => {
    onLoginStart();
    try {
      await instance.loginRedirect(loginRequest);
    } catch (e) {
      onLoginEnd();
      console.error('Login failed', e);
    }
  };

  const features = [
    { icon: '📊', label: 'Dashboard Kinerja & Peta Persebaran' },
    { icon: '🛡️', label: 'Kinerja QSHE per Unit & Proyek' },
    { icon: '📋', label: 'Database All Proyek 2021–2026' },
    { icon: '📽️', label: 'Paparan Otomatis ke PowerPoint' },
  ];

  return (
    <div
      key={animKey}
      className="login-page"
      style={{
        display: 'flex', minHeight: '100dvh', height: '100dvh',
        alignItems: 'center', justifyContent: 'center',
        background: t.pageBg, backgroundSize: '200% 200%',
        animation: 'bgShift 14s ease infinite, fadeIn 0.4s ease both',
        fontFamily: "'Inter',-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif",
        padding: '20px',
        position: 'relative', overflow: 'hidden',
        transition: 'background 0.5s ease',
        WebkitTapHighlightColor: 'transparent',
      }}
    >
      <style>{CSS}</style>

      {/* Particle background */}
      <div style={{ position: 'fixed', inset: 0, zIndex: 0 }}>
        <ParticlesBg color={t.particleColor} />
      </div>

      {/* Ambient orbs */}
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', overflow: 'hidden', zIndex: 0 }}>
        {[
          { w: 500, h: 500, top: '-120px', left: '-120px', color: t.orb1, dur: '20s' },
          { w: 350, h: 350, top: '60%',    right: '-80px', color: t.orb2, dur: '26s' },
          { w: 220, h: 220, bottom: '10%', left: '35%',    color: t.orb3, dur: '18s' },
        ].map((p, i) => (
          <div key={i} style={{
            position: 'absolute',
            width: p.w, height: p.h,
            top: (p as any).top, left: (p as any).left,
            right: (p as any).right, bottom: (p as any).bottom,
            borderRadius: '50%',
            background: `radial-gradient(circle, ${p.color} 0%, transparent 70%)`,
            animation: `float ${p.dur} ease-in-out ${i * 3}s infinite`,
          }} />
        ))}
      </div>

      {/* Theme toggle */}
      <ThemeToggle theme={theme} onToggle={() => setTheme(th => th === 'dark' ? 'light' : 'dark')} />

      {/* Card */}
      <div
        className="login-card"
        style={{
          position: 'relative', zIndex: 1,
          display: 'flex', maxWidth: '1020px', width: '100%',
          background: t.cardBg, borderRadius: '28px', overflow: 'hidden',
          boxShadow: theme === 'dark'
            ? '0 48px 120px rgba(0,0,0,0.55), 0 16px 48px rgba(0,0,0,0.25), 0 0 0 1px rgba(255,255,255,0.04)'
            : '0 32px 80px rgba(37,99,235,0.15), 0 8px 32px rgba(0,0,0,0.10), 0 0 0 1px rgba(37,99,235,0.08)',
          minHeight: '540px',
          transition: 'box-shadow 0.4s ease',
        }}
      >
        {/* ── Left panel ── */}
        <div
          className="login-left login-split-left"
          style={{
            flex: '0 0 44%',
            background: t.leftBg,
            padding: '52px 44px',
            display: 'flex', flexDirection: 'column', justifyContent: 'center',
            position: 'relative', overflow: 'hidden',
            transition: 'background 0.5s ease',
          }}
        >
          {/* Decorative glow blobs */}
          <div style={{ position: 'absolute', top: '-80px', right: '-80px', width: '320px', height: '320px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(59,130,246,0.15) 0%, transparent 70%)', pointerEvents: 'none' }} />
          <div style={{ position: 'absolute', bottom: '-70px', left: '-70px', width: '240px', height: '240px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(99,102,241,0.12) 0%, transparent 70%)', pointerEvents: 'none' }} />
          {/* Subtle grid overlay */}
          <div style={{
            position: 'absolute', inset: 0, pointerEvents: 'none',
            backgroundImage: 'linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)',
            backgroundSize: '40px 40px',
          }} />

          <div style={{ position: 'relative', zIndex: 1 }}>
            {/* Logo + brand */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '36px', animation: 'fadeIn 0.7s ease 0.3s both' }}>
              <img
                src="/logo-wki.png"
                alt="WKI Logo"
                style={{
                  width: '52px', height: '52px', objectFit: 'contain',
                  borderRadius: '14px',
                  background: 'rgba(255,255,255,0.10)',
                  padding: '6px',
                  boxShadow: '0 8px 24px rgba(59,130,246,0.35)',
                  animation: 'logoPulse 3s ease-in-out infinite 1s',
                }}
              />
              <div>
                <div style={{ fontSize: '19px', fontWeight: 700, color: t.leftTitle, letterSpacing: '-0.03em' }}>
                  Pengendalian <span style={{ color: '#60a5fa' }}>& QSHE</span>
                </div>
                <div style={{ fontSize: '12px', color: t.leftSub, fontWeight: 400 }}>PT Waskita Karya Infrastruktur</div>
              </div>
            </div>

            <h2 style={{ fontSize: '30px', fontWeight: 800, color: t.leftTitle, letterSpacing: '-0.04em', lineHeight: 1.2, marginBottom: '14px', animation: 'slideUp 0.6s ease 0.4s both' }}>
              Dashboard<br />
              <span style={{
                background: 'linear-gradient(90deg, #60a5fa, #a78bfa)',
                WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
              }}>
                Pengendalian &amp; QSHE
              </span>
            </h2>

            <p style={{ fontSize: '13.5px', color: t.leftText, lineHeight: 1.75, maxWidth: '300px', marginBottom: '36px', animation: 'fadeIn 0.6s ease 0.55s both' }}>
              Monitoring real‑time RKAP, realisasi PU/BK/Laba, kinerja QSHE, dan paparan otomatis proyek infrastruktur.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {features.map((item, i) => (
                <div
                  key={i}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '12px',
                    fontSize: '13px', color: t.leftText, fontWeight: 500,
                    animation: `featureSlide 0.5s cubic-bezier(0.16,1,0.3,1) ${0.65 + i * 0.1}s both`,
                  }}
                >
                  <span style={{
                    fontSize: '15px',
                    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                    width: '34px', height: '34px',
                    background: t.featureBg,
                    borderRadius: '9px', flexShrink: 0,
                    backdropFilter: 'blur(4px)',
                  }}>{item.icon}</span>
                  {item.label}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Right panel ── */}
        <div
          className="login-right login-split-right"
          style={{
            flex: 1, padding: '52px 48px',
            display: 'flex', flexDirection: 'column', justifyContent: 'center',
            background: t.rightBg,
            transition: 'background 0.4s ease',
          }}
        >
          <div style={{ marginBottom: '8px' }}>
            <div className="login-badge-wrap" style={{
              display: 'inline-flex', alignItems: 'center', gap: '6px',
              background: theme === 'dark' ? 'rgba(59,130,246,0.08)' : 'rgba(37,99,235,0.07)',
              borderRadius: '99px', padding: '5px 12px', marginBottom: '20px',
              border: `1px solid ${theme === 'dark' ? 'rgba(59,130,246,0.18)' : 'rgba(37,99,235,0.15)'}`,
              animation: 'fadeIn 0.5s ease 0.3s both',
            }}>
              <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#22c55e', display: 'inline-block', animation: 'dotPop 1.8s ease-in-out infinite' }} />
              <span style={{ fontSize: '12px', fontWeight: 600, color: theme === 'dark' ? '#60a5fa' : '#1d4ed8' }}>Sistem Aktif</span>
            </div>

            <h1 className="login-h1" style={{ fontSize: '28px', fontWeight: 800, color: t.rightTitle, letterSpacing: '-0.035em', marginBottom: '6px', animation: 'slideUp 0.5s ease 0.35s both' }}>
              Selamat Datang 👋
            </h1>
            <p style={{ fontSize: '14px', color: t.rightSub, animation: 'fadeIn 0.5s ease 0.5s both', lineHeight: 1.6 }}>
              Masuk dengan akun Microsoft organisasi Anda untuk mengakses dashboard.
            </p>
          </div>

          {/* Microsoft login button — neon rotating border on hover */}
          <div style={{ marginTop: '36px', animation: 'scaleIn 0.55s cubic-bezier(0.34,1.56,0.64,1) 0.55s both' }}>
            <div className="neon-wrap">
              <span className="neon-glow" aria-hidden="true" />
              <div className="neon-btn">
                <button
                  className="login-btn"
                  onClick={handleLogin}
                  onMouseEnter={() => setHovering(true)}
                  onMouseLeave={() => setHovering(false)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '14px',
                    width: '100%', padding: '15px 22px', borderRadius: '12px',
                    border: `1.5px solid ${hovering ? t.btnHoverBorder : t.btnBorder}`,
                    background: hovering ? t.btnHoverBg : t.btnBg,
                    color: t.btnText,
                    fontSize: '15px', fontWeight: 600, cursor: 'pointer',
                    transition: 'background 0.3s ease, border-color 0.3s ease, box-shadow 0.3s ease, transform 0.15s ease',
                    boxShadow: hovering
                      ? `0 10px 36px rgba(59,130,246,0.22), 0 2px 8px rgba(0,0,0,0.06)`
                      : '0 1px 4px rgba(0,0,0,0.05)',
                    fontFamily: "'Inter',sans-serif",
                  }}
                >
                  {/* Microsoft logo */}
                  <svg width="22" height="22" viewBox="0 0 21 21" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ flexShrink: 0 }}>
                    <rect x="1"  y="1"  width="8" height="8" fill="#F25022"/>
                    <rect x="12" y="1"  width="8" height="8" fill="#7FBA00"/>
                    <rect x="1"  y="12" width="8" height="8" fill="#00A4EF"/>
                    <rect x="12" y="12" width="8" height="8" fill="#FFB900"/>
                  </svg>
                  <span style={{ flex: 1, textAlign: 'left' }}>Masuk dengan Akun Microsoft</span>
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ opacity: hovering ? 1 : 0.35, transition: 'opacity 0.3s, transform 0.3s', transform: hovering ? 'translateX(3px)' : 'translateX(0)' }}>
                    <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>
              </div>
            </div>

            {/* Shimmer hint */}
            <div style={{
              marginTop: '14px', borderRadius: '10px', overflow: 'hidden',
              background: theme === 'dark'
                ? 'linear-gradient(90deg, rgba(59,130,246,0.06), rgba(99,102,241,0.08), rgba(59,130,246,0.06))'
                : 'linear-gradient(90deg, rgba(37,99,235,0.05), rgba(99,102,241,0.07), rgba(37,99,235,0.05))',
              backgroundSize: '200% 100%',
              animation: 'shimmer 3s linear infinite',
              padding: '10px 14px',
              display: 'flex', alignItems: 'center', gap: '8px',
            }}>
              <span style={{ fontSize: '13px' }}>🔐</span>
              <span style={{ fontSize: '12px', color: t.rightSub, fontWeight: 500 }}>
                Login aman via Microsoft SSO · Hanya akun internal WKI
              </span>
            </div>
          </div>

          {/* Footer */}
          <div style={{
            marginTop: 'auto', paddingTop: '28px',
            borderTop: `1px solid ${t.footerBorder}`,
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            animation: 'fadeIn 0.5s ease 0.85s both',
            transition: 'border-color 0.4s ease',
          }}>
            <span style={{ fontSize: '12px', color: t.rightFooter }}>© 2026 Waskita Infrastruktur</span>
            <div style={{ display: 'flex', gap: '14px', fontSize: '12px', color: t.rightFooter }}>
              <span>🔒 Keamanan</span><span>·</span><span>🛡️ Microsoft SSO</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── AuthGate ─────────────────────────────────────────────────
interface AuthGateProps {
  setIsLoading:     (v: boolean) => void;
  triggerTransition:(cb: () => void, color?: string) => void;
  dashboardKey:     number;
  loginKey:         number;
  DashboardApp: React.ComponentType<{
    setIsLoading:     (v: boolean) => void;
    triggerTransition:(cb: () => void, color?: string) => void;
    dashboardKey:     number;
  }>;
}

export const AuthGate: React.FC<AuthGateProps> = ({
  setIsLoading, triggerTransition, dashboardKey, loginKey, DashboardApp,
}) => {
  const isAuthenticated    = useIsAuthenticated();
  const { instance, inProgress } = useMsal();

  useEffect(() => {
    if (!instance) return;
    instance.handleRedirectPromise()
      .then(res  => { if (res) setIsLoading(false); })
      .catch(err => { console.error('Redirect error:', err); setIsLoading(false); });
  }, [instance, setIsLoading]);

  if (inProgress !== 'none') {
    return (
      <div style={{
        display: 'flex', height: '100dvh', alignItems: 'center', justifyContent: 'center',
        background: '#0b1120', flexDirection: 'column', gap: '20px',
        fontFamily: "'Inter',sans-serif",
      }}>
        <style>{`@keyframes spin{to{transform:rotate(360deg)}} @keyframes pulseText{0%,100%{opacity:1}50%{opacity:0.5}}`}</style>
        <img
          src="/logo-wki.png"
          alt="WKI"
          style={{
            width: '52px', height: '52px', objectFit: 'contain',
            borderRadius: '14px', background: 'rgba(255,255,255,0.05)', padding: '6px',
            boxShadow: '0 8px 32px rgba(59,130,246,0.35)',
            animation: 'logoPulse 2s ease-in-out infinite',
          }}
        />
        <div style={{ width: '36px', height: '36px', borderRadius: '50%', border: '3px solid rgba(255,255,255,0.10)', borderTopColor: '#3b82f6', animation: 'spin 0.8s linear infinite' }} />
        <p style={{ fontSize: '13px', color: '#94a3b8', fontWeight: 500, animation: 'pulseText 1.5s ease-in-out infinite' }}>
          Memeriksa status login…
        </p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <LoginPage
        animKey={loginKey}
        onLoginStart={() => setIsLoading(true)}
        onLoginEnd={()   => setIsLoading(false)}
      />
    );
  }

  return (
    <DashboardApp
      setIsLoading={setIsLoading}
      triggerTransition={triggerTransition}
      dashboardKey={dashboardKey}
    />
  );
};

export { MsalProvider };