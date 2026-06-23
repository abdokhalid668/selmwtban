import React from 'react';
import { MysteryCard } from '../types';
import { Shield, Shuffle, Zap, AlertTriangle, Snowflake, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface MysteryCardModalProps {
  card: MysteryCard | null;
  playerName: string;
  playerColor: string;
  isOpen: boolean;
  onClose: () => void;
}

export default function MysteryCardModal({
  card,
  playerName,
  playerColor,
  isOpen,
  onClose,
}: MysteryCardModalProps) {
  if (!isOpen || !card) return null;

  // Select appropriate Lucide Icon for effect type
  const renderIcon = () => {
    const sizeClasses = "w-12 h-12 stroke-[1.5]";
    switch (card.effectType) {
      case 'double_edge':
        return <Zap className={`${sizeClasses} text-[#fffb00]`} />;
      case 'switch':
        return <Shuffle className={`${sizeClasses} text-cyan-400`} />;
      case 'shield':
        return <Shield className={`${sizeClasses} text-[#39ff14]`} />;
      case 'glitch':
        return <SparklesIcon className={`${sizeClasses} text-emerald-400`} />;
      case 'crash':
        return <AlertTriangle className={`${sizeClasses} text-[#ff0055]`} />;
      case 'freeze':
        return <Snowflake className={`${sizeClasses} text-sky-400`} />;
      case 'overdrive':
        return <Zap className={`${sizeClasses} text-purple-400 animate-pulse`} />;
      default:
        return <AlertCircle className={`${sizeClasses} text-slate-400`} />;
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md select-none">
        {/* Animated Card Container */}
        <motion.div
          initial={{ scale: 0.9, y: 30, opacity: 0 }}
          animate={{ scale: 1, y: 0, opacity: 1 }}
          exit={{ scale: 0.95, y: 15, opacity: 0 }}
          transition={{ type: 'spring', damping: 20, stiffness: 120 }}
          className="relative w-full max-w-sm overflow-hidden rounded-3xl border bg-[#090915] p-6 shadow-[0_0_50px_rgba(0,0,0,0.9)]"
          style={{ borderColor: `${card.color}77` }} // slightly transparent card theme color border
        >
          {/* Subtle Outer Neon Pulse Ring */}
          <div
            className="absolute inset-0 pointer-events-none opacity-20 animate-pulse rounded-3xl"
            style={{ boxShadow: `inset 0 0 30px ${card.color}` }}
          ></div>

          {/* Top Info Banner */}
          <div className="flex items-center justify-between border-b border-slate-900 pb-3 mb-5">
            <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">
              MYSTERY NODE RECOVERY
            </span>
            <span
              className="text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded"
              style={{
                backgroundColor: `${playerColor}15`,
                color: playerColor,
                border: `1px solid ${playerColor}33`,
              }}
            >
              {playerName}
            </span>
          </div>

          {/* Icon + Glimmer Section */}
          <div className="flex justify-center mb-6 relative">
            {/* Pulsating background circle */}
            <div
              className="absolute w-20 h-20 rounded-full blur-2xl opacity-25 animate-ping"
              style={{ backgroundColor: card.color }}
            ></div>
            <div
              className="w-20 h-20 rounded-2xl flex items-center justify-center relative border backdrop-blur-xl"
              style={{
                backgroundColor: `${card.color}0a`,
                borderColor: `${card.color}44`,
              }}
            >
              {renderIcon()}
            </div>
          </div>

          {/* Text Content */}
          <div className="text-center space-y-3 mb-6">
            <h3
              className="text-xl font-extrabold font-sans tracking-wide uppercase"
              style={{ color: card.color, textShadow: `0 0 10px ${card.color}44` }}
            >
              {card.title}
            </h3>
            
            <p className="text-slate-200 text-sm leading-relaxed font-semibold">
              {card.description}
            </p>

            <div className="pt-2 px-3">
              <p className="text-slate-500 text-[10px] italic font-mono uppercase tracking-wider leading-snug">
                "{card.flavorText}"
              </p>
            </div>
          </div>

          {/* Action Trigger Button */}
          <button
            onClick={onClose}
            className="w-full py-3.5 rounded-xl font-sans font-black text-xs uppercase tracking-widest cursor-pointer text-slate-900 transition-all duration-300 shadow-md hover:scale-[1.01]"
            style={{
              backgroundColor: card.color,
              boxShadow: `0 0 20px ${card.color}55`,
            }}
          >
            EXECUTE ANOMALY DIRECTIVE
          </button>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

// Simple Sparkles fallback icon
function SparklesIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
      <path d="m5 3 1 2.5L8.5 6 6 7 5 9.5 4 7 1.5 6 4 5.5 5 3Z" />
      <path d="m19 17 1 2.5 2.5.5-2.5 1-1 2.5-1-2.5-2.5-1 2.5-1 1-2.5Z" />
    </svg>
  );
}
