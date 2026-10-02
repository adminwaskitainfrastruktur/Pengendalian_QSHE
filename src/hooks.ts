import { useState, useEffect, useRef } from 'react';
import type { OverlayPhase } from './types';

// ─── Animated number counter ───────────────────────────────
export const useCountUp = (target: number, duration = 800): number => {
  const [value, setValue] = useState(0);
  const fromRef = useRef(0);
  const rafRef  = useRef(0);

  useEffect(() => {
    const from  = fromRef.current;
    const start = performance.now();
    const tick  = (now: number) => {
      const t     = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - t, 4);
      const cur   = from + (target - from) * eased;
      // simpan posisi terakhir supaya animasi yang terpotong (mis. ganti filter
      // beruntun) melanjut dari nilai yang sedang tampil, bukan melompat
      fromRef.current = cur;
      setValue(cur);
      if (t < 1) rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [target, duration]);

  return value;
};

// ─── Page transition overlay ───────────────────────────────
export function usePageTransition() {
  const [overlayPhase, setOverlayPhase] = useState<OverlayPhase>('done');
  const [overlayColor, setOverlayColor] = useState('#0b1120');
  const callbackRef = useRef<(() => void) | null>(null);

  const triggerTransition = (cb: () => void, color = '#0b1120') => {
    callbackRef.current = cb;
    setOverlayColor(color);
    setOverlayPhase('covering');
  };

  const handleCovered = () => {
    callbackRef.current?.();
    callbackRef.current = null;
    setOverlayPhase('uncovering');
  };

  const handleDone = () => setOverlayPhase('done');

  return { overlayPhase, overlayColor, triggerTransition, handleCovered, handleDone };
}