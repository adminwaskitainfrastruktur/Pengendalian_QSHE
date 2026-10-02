import React, { useEffect, useRef } from 'react';

interface AnimatedNumberProps {
  value: number;
  format: (n: number) => string;
}

// Menulis angka langsung ke DOM (textContent) tanpa setState per frame,
// sehingga puluhan angka bisa beranimasi serentak — mis. saat ganti filter —
// tanpa membanjiri React dengan render. Ini kunci supaya tidak patah-patah.
const AnimatedNumber: React.FC<AnimatedNumberProps> = ({ value, format }) => {
  const ref = useRef<HTMLSpanElement>(null);
  const fromRef = useRef(0);
  const rafRef = useRef(0);
  const formatRef = useRef(format);
  formatRef.current = format;

  useEffect(() => {
    const duration = 600;
    const from = fromRef.current;
    const start = performance.now();
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - t, 4);
      const cur = from + (value - from) * eased;
      // simpan posisi terakhir supaya animasi yang terpotong (ganti filter
      // beruntun) melanjut dari nilai yang sedang tampil, bukan melompat
      fromRef.current = cur;
      if (ref.current) ref.current.textContent = formatRef.current(cur);
      if (t < 1) rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [value]);

  return <span ref={ref}>{format(fromRef.current)}</span>;
};

export default AnimatedNumber;
