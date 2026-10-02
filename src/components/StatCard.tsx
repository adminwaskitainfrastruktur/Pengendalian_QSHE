// src/components/StatCard.tsx
import { motion } from 'framer-motion';
import type { Variants } from 'framer-motion';
import type { ReactNode } from 'react';

interface StatCardProps {
  title: string;
  value: string;
  icon: ReactNode;
  subtitle: ReactNode;
  color: 'blue' | 'emerald' | 'indigo';
}

// SOLUSI ERROR TS: Menggunakan tipe Variants yang diimpor dari framer-motion
export const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
};

export default function StatCard({ title, value, icon, subtitle, color }: StatCardProps) {
  const bgColors = {
    blue: 'bg-blue-500/20',
    emerald: 'bg-emerald-500/20',
    indigo: 'from-indigo-900/50 to-blue-900/50 border-blue-500/20'
  };

  const isGradient = color === 'indigo';

  return (
    <motion.div 
      variants={itemVariants} 
      whileHover={{ y: -5 }} 
      className={
        isGradient 
        ? `bg-gradient-to-br ${bgColors.indigo} backdrop-blur-xl p-6 rounded-3xl border shadow-xl flex items-center justify-between`
        : `bg-white/5 backdrop-blur-xl p-6 rounded-3xl border border-white/10 shadow-xl overflow-hidden relative`
      }
    >
      {!isGradient && (
        <div className={`absolute -right-4 -top-4 w-24 h-24 ${bgColors[color]} rounded-full blur-2xl`} />
      )}
      
      <div>
        <div className="text-gray-400 text-sm font-medium mb-2">{title}</div>
        <div className={`text-3xl font-bold mb-1 ${color === 'emerald' ? 'text-emerald-400' : 'text-white'}`}>
          {value}
        </div>
        <div className="text-xs text-blue-400/80 flex items-center gap-1">
          {subtitle}
        </div>
      </div>

      {isGradient && (
        <div className="p-4 bg-white/10 rounded-full border border-white/10">
          {icon}
        </div>
      )}
    </motion.div>
  );
}