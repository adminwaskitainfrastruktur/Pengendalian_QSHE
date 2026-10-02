import React, { useState, useEffect, useRef } from 'react';

import { msalInstance, MsalProvider, AuthGate } from './components/Auth';
import DashboardApp from './components/Dashboard';
import GlobalCSS from './components/GlobalCSS';
import { usePageTransition } from './hooks';
import type { OverlayPhase } from './types';

// ─── Page Transition Overlay ─────────────────────────────────
interface PageTransitionOverlayProps {
  phase: OverlayPhase;
  color?: string;
  onCovered?: () => void;
  onDone?: () => void;
}

const PageTransitionOverlay: React.FC<PageTransitionOverlayProps> = ({
  phase, color = '#0b1120', onCovered, onDone
}) => {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (phase === 'covering') {
      const t = setTimeout(() => onCovered?.(), 550);
      return () => clearTimeout(t);
    }
    if (phase === 'uncovering') {
      const t = setTimeout(() => onDone?.(), 650);
      return () => clearTimeout(t);
    }
  }, [phase, onCovered, onDone]);

  if (phase === 'done') return null;

  const covering = phase === 'covering' || phase === 'covered';

  return (
    <div
      ref={ref}
      style={{
        position: 'fixed', inset: 0, zIndex: 9998, background: color,
        opacity: covering ? 1 : 0,
        transform: phase === 'covering' ? 'scale(1)' : phase === 'covered' ? 'scale(1)' : 'scale(1.04)',
        transition: phase === 'covering'
          ? 'opacity 0.5s cubic-bezier(0.4,0,0.2,1), transform 0.5s cubic-bezier(0.4,0,0.2,1)'
          : phase === 'uncovering'
            ? 'opacity 0.6s cubic-bezier(0.16,1,0.3,1), transform 0.6s cubic-bezier(0.16,1,0.3,1)'
            : 'none',
        pointerEvents: covering ? 'all' : 'none',
        display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '20px',
      }}
    >
      <div style={{
        opacity: phase === 'covered' ? 1 : 0,
        transform: phase === 'covered' ? 'scale(1) translateY(0)' : 'scale(0.8) translateY(10px)',
        transition: 'opacity 0.35s ease 0.1s, transform 0.4s cubic-bezier(0.34,1.56,0.64,1) 0.1s',
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px',
      }}>
        {/* ─── Logo diganti dari "W" ke logo-wki.png ─── */}
        <img
          src="/logo-wki.png"
          alt="WKI Logo"
          style={{
            width: '64px',
            height: '64px',
            objectFit: 'contain',
            borderRadius: '18px',
            background: 'rgba(255,255,255,0.04)',
            padding: '6px',
            boxShadow: '0 12px 40px rgba(59,130,246,0.45)',
            animation: 'overlayLogoPulse 1s ease-in-out infinite',
          }}
        />
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '16px', fontWeight: 700, color: '#f1f5f9', letterSpacing: '-0.02em' }}>
            QSHE <span style={{ color: '#60a5fa' }}>WKI</span>
          </div>
          <div style={{ fontSize: '12px', color: '#64748b', marginTop: '4px' }}>
            Waskita Infrastruktur
          </div>
        </div>
        <div style={{
          width: '28px', height: '28px', borderRadius: '50%',
          border: '2.5px solid rgba(255,255,255,0.15)', borderTopColor: '#3b82f6',
          animation: 'spin 0.75s linear infinite',
        }} />
      </div>
    </div>
  );
};

// ─── Komponen Utama App ──────────────────────────────────────
const App: React.FC = () => {
  const [initialized, setInitialized] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const [dashboardKey] = useState(0);
  const [loginKey] = useState(0);

  const {
    overlayPhase,
    overlayColor,
    triggerTransition,
    handleCovered,
    handleDone,
  } = usePageTransition();

  useEffect(() => {
    msalInstance.initialize()
      .then(() => setInitialized(true))
      .catch((error) => console.error('MSAL initialization failed:', error));
  }, []);

  if (!initialized) {
    return (
      <div style={{
        display: 'flex', height: '100dvh', alignItems: 'center', justifyContent: 'center',
        fontFamily: "'Inter',sans-serif", background: '#0b1120',
        flexDirection: 'column', gap: '16px', animation: 'fadeIn 0.6s ease',
      }}>
        <style>{`
          @keyframes spin { to { transform: rotate(360deg) } }
          @keyframes pulseText { 0%,100%{opacity:1} 50%{opacity:0.5} }
          @keyframes fadeIn { from{opacity:0} to{opacity:1} }
          @keyframes overlayLogoPulse {
            0%,100% { box-shadow: 0 12px 40px rgba(59,130,246,0.35), 0 0 0 0 rgba(59,130,246,0.2); }
            50%      { box-shadow: 0 12px 60px rgba(59,130,246,0.55), 0 0 0 12px rgba(59,130,246,0); }
          }
        `}</style>
        <img
          src="/logo-wki.png"
          alt="WKI Logo"
          style={{
            width: '48px',
            height: '48px',
            objectFit: 'contain',
            borderRadius: '12px',
            background: 'rgba(255,255,255,0.04)',
            padding: '4px',
            boxShadow: '0 8px 32px rgba(59,130,246,0.35)',
          }}
        />
        <p style={{ fontSize: '14px', fontWeight: 500, color: '#94a3b8', animation: 'pulseText 1.5s ease-in-out infinite', margin: 0 }}>
          Memuat sistem keamanan…
        </p>
      </div>
    );
  }

  return (
    <MsalProvider instance={msalInstance}>
      <GlobalCSS
        scrollThumb="#cbd5e1" scrollThumbHover="#94a3b8"
        rowHoverBg="#f8fafc" btnHoverOverlay="rgba(0,0,0,0.03)"
        cardHoverShadow="0 18px 40px rgba(0,0,0,0.10),0 6px 16px rgba(0,0,0,0.05)"
        cardHoverBorder="#93c5fd"
        cardAccentLine="linear-gradient(90deg,#3b82f6,#6366f1,transparent)"
        popupBorder="#e2e8f0"
      />

      {overlayPhase !== 'done' && (
        <PageTransitionOverlay
          phase={overlayPhase}
          color={overlayColor}
          onCovered={handleCovered}
          onDone={handleDone}
        />
      )}

      {isLoading && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(8px)',
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          zIndex: 9999, color: '#fff', fontFamily: "'Inter',sans-serif",
        }}>
          <div style={{ width: '64px', height: '64px', borderRadius: '50%', border: '4px solid rgba(255,255,255,0.1)', borderTopColor: '#3b82f6', animation: 'spin 0.8s linear infinite', marginBottom: '24px' }} />
          <p style={{ fontSize: '18px', fontWeight: 600, animation: 'pulseText 1.5s ease-in-out infinite' }}>Memproses…</p>
          <p style={{ fontSize: '14px', opacity: 0.7, marginTop: '8px' }}>Harap tunggu sebentar…</p>
        </div>
      )}

      <AuthGate
        setIsLoading={setIsLoading}
        triggerTransition={triggerTransition}
        dashboardKey={dashboardKey}
        loginKey={loginKey}
        DashboardApp={DashboardApp}
      />
    </MsalProvider>
  );
};

export default App;