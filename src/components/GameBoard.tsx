import React from 'react';
import { Player, BoardConfig } from '../types';
import { HelpCircle, ChevronUp, AlertCircle } from 'lucide-react';
import { motion } from 'motion/react';

interface GameBoardProps {
  players: Player[];
  config: BoardConfig;
  activePlayerId: string;
}

// Convert a square number (1 to 100) to grid coordinates (0 to 9)
// where row 0 is bottom, row 9 is top, col 0 is left, col 9 is right.
export const getSquareCoords = (square: number) => {
  const zeroIndexed = square - 1;
  const row = Math.floor(zeroIndexed / 10);
  const colInRow = zeroIndexed % 10;
  const col = row % 2 === 0 ? colInRow : 9 - colInRow;
  return { col, row };
};

// Convert a square number to percentage coordinates (5% to 95%)
export const getSquareCenterPercent = (square: number) => {
  const { col, row } = getSquareCoords(square);
  return {
    x: (col + 0.5) * 10,
    y: (9 - row + 0.5) * 10, // row 9 is top of the grid
  };
};

export default function GameBoard({ players, config, activePlayerId }: GameBoardProps) {
  const squares = Array.from({ length: 100 }, (_, i) => i + 1);

  return (
    <div className="w-full aspect-square relative rounded-2xl border border-slate-800 bg-slate-950/60 p-1 md:p-2 shadow-[0_0_30px_rgba(0,0,0,0.8)] overflow-hidden">
      {/* Dynamic Cyber Grid Lines (Static Background Decor) */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:10%_10%] pointer-events-none"></div>

      {/* 1. Interactive 10x10 Grid Layer */}
      <div className="w-full h-full grid grid-cols-10 grid-rows-10 gap-0.5 md:gap-1 relative z-10">
        {squares.map((s) => {
          const { col, row } = getSquareCoords(s);
          const isMystery = config.mysterySquares.includes(s);
          const isSnakeHead = config.snakes[s] !== undefined;
          const isLadderStart = config.ladders[s] !== undefined;

          // Grid row/col placement in CSS grid (1-indexed, row 1 is top, row 10 is bottom)
          const gridRow = 10 - row;
          const gridCol = col + 1;

          // Specialized styling
          let borderStyle = 'border-slate-900/40';
          let bgStyle = 'bg-slate-950/40 hover:bg-slate-900/20';
          let glowEffect = '';

          if (s === 1) {
            borderStyle = 'border-[#39ff14]/60';
            bgStyle = 'bg-[#39ff14]/5';
            glowEffect = 'shadow-[inset_0_0_8px_rgba(57,255,20,0.1)]';
          } else if (s === 100) {
            borderStyle = 'border-purple-500/80';
            bgStyle = 'bg-purple-500/10 animate-pulse';
            glowEffect = 'shadow-[inset_0_0_12px_rgba(168,85,247,0.2)]';
          } else if (isMystery) {
            borderStyle = 'border-[#fffb00]/60';
            bgStyle = 'bg-[#fffb00]/5';
            glowEffect = 'shadow-[0_0_10px_rgba(255,251,0,0.05),inset_0_0_6px_rgba(255,251,0,0.1)]';
          }

          return (
            <div
              key={s}
              id={`square-${s}`}
              className={`relative rounded-md md:rounded-lg border ${borderStyle} ${bgStyle} ${glowEffect} flex flex-col justify-between p-1 select-none transition-all duration-300`}
              style={{
                gridRow,
                gridColumn: gridCol,
              }}
            >
              {/* Corner Coordinate Number */}
              <span className="font-mono text-[9px] md:text-xs font-semibold text-slate-600">
                {s}
              </span>

              {/* Special Indicator overlays */}
              {s === 1 && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <span className="text-[8px] md:text-[10px] font-mono font-black text-[#39ff14]/80 tracking-widest uppercase">
                    START
                  </span>
                </div>
              )}

              {s === 100 && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <span className="text-[8px] md:text-[10px] font-mono font-black text-purple-400 animate-pulse tracking-widest uppercase">
                    CORE
                  </span>
                </div>
              )}

              {isMystery && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <motion.div
                    animate={{ scale: [0.9, 1.1, 0.9], opacity: [0.5, 0.8, 0.5] }}
                    transition={{ repeat: Infinity, duration: 2 }}
                    className="flex flex-col items-center justify-center"
                  >
                    <HelpCircle className="w-4 h-4 md:w-5 md:h-5 text-[#fffb00]/80" />
                  </motion.div>
                </div>
              )}

              {isSnakeHead && (
                <div className="absolute top-1 right-1 flex items-center justify-center pointer-events-none">
                  <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping" />
                </div>
              )}

              {isLadderStart && (
                <div className="absolute top-1 right-1 flex items-center justify-center pointer-events-none">
                  <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* 2. SVG Neon Vectors Layer (Ladders and Snakes Paths) */}
      <svg
        className="absolute inset-0 w-full h-full pointer-events-none z-20"
        style={{ overflow: 'visible' }}
      >
        <defs>
          {/* Cyber Neon Glow Filters */}
          <filter id="cyan-glow" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <filter id="crimson-glow" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          {/* Markers for Arrows */}
          <marker
            id="ladder-arrow"
            viewBox="0 0 10 10"
            refX="8"
            refY="5"
            markerWidth="5"
            markerHeight="5"
            orient="auto-start-reverse"
          >
            <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#00f3ff" />
          </marker>
        </defs>

        {/* Render Vector Ladders */}
        {Object.entries(config.ladders).map(([startStr, end]) => {
          const start = parseInt(startStr);
          const p1 = getSquareCenterPercent(start);
          const p2 = getSquareCenterPercent(end);

          // Calculate offset points for realistic ladder rails
          const dx = p2.x - p1.x;
          const dy = p2.y - p1.y;
          const len = Math.sqrt(dx * dx + dy * dy);
          const ux = dx / len;
          const uy = dy / len;
          const px = -uy;
          const py = ux;
          
          // Outer spacing for rails
          const railOffset = 1.2; 
          const l1x = p1.x + px * railOffset;
          const l1y = p1.y + py * railOffset;
          const l2x = p2.x + px * railOffset;
          const l2y = p2.y + py * railOffset;

          const r1x = p1.x - px * railOffset;
          const r1y = p1.y - py * railOffset;
          const r2x = p2.x - px * railOffset;
          const r2y = p2.y - py * railOffset;

          // Generate Rungs
          const rungs = [];
          const numRungs = Math.max(3, Math.floor(len / 4.5));
          for (let i = 1; i < numRungs; i++) {
            const t = i / numRungs;
            const rx_left = l1x + (l2x - l1x) * t;
            const ry_left = l1y + (l2y - l1y) * t;
            const rx_right = r1x + (r2x - r1x) * t;
            const ry_right = r1y + (r2y - r1y) * t;
            rungs.push(
              <line
                key={`rung-${start}-${i}`}
                x1={`${rx_left}%`}
                y1={`${ry_left}%`}
                x2={`${rx_right}%`}
                y2={`${ry_right}%`}
                stroke="#00f3ff"
                strokeWidth="1.2"
                filter="url(#cyan-glow)"
                opacity="0.65"
              />
            );
          }

          return (
            <g key={`ladder-group-${start}`}>
              {/* Left rail */}
              <line
                x1={`${l1x}%`}
                y1={`${l1y}%`}
                x2={`${l2x}%`}
                y2={`${l2y}%`}
                stroke="#00f3ff"
                strokeWidth="2.2"
                filter="url(#cyan-glow)"
              />
              {/* Right rail */}
              <line
                x1={`${r1x}%`}
                y1={`${r1y}%`}
                x2={`${r2x}%`}
                y2={`${r2y}%`}
                stroke="#00f3ff"
                strokeWidth="2.2"
                filter="url(#cyan-glow)"
              />
              {/* Ladder rungs */}
              {rungs}
              {/* Central flow helper line with arrow markers */}
              <line
                x1={`${p1.x}%`}
                y1={`${p1.y}%`}
                x2={`${p2.x}%`}
                y2={`${p2.y}%`}
                stroke="rgba(0, 243, 255, 0.2)"
                strokeWidth="1"
                strokeDasharray="4 8"
                markerEnd="url(#ladder-arrow)"
              />
            </g>
          );
        })}

        {/* Render Vector Snakes as animated Bezier plasma lines */}
        {Object.entries(config.snakes).map(([startStr, end]) => {
          const start = parseInt(startStr);
          const p1 = getSquareCenterPercent(start); // Snake Head (High)
          const p2 = getSquareCenterPercent(end);   // Snake Tail (Low)

          const dx = p2.x - p1.x;
          const dy = p2.y - p1.y;
          const len = Math.sqrt(dx * dx + dy * dy);
          const ux = dx / len;
          const uy = dy / len;
          const px = -uy;
          const py = ux;

          // Create an organic double-bend S-curve via a Cubic Bezier
          // First control point goes left, second control point goes right
          // Using start to randomize wave orientation slightly
          const directionMultiplier = start % 2 === 0 ? 1 : -1;
          const waveAmp = Math.min(8, len * 0.15); // cap wave size
          
          const cp1x = p1.x + dx * 0.33 + px * waveAmp * directionMultiplier;
          const cp1y = p1.y + dy * 0.33 + py * waveAmp * directionMultiplier;

          const cp2x = p1.x + dx * 0.66 - px * waveAmp * directionMultiplier;
          const cp2y = p1.y + dy * 0.66 - py * waveAmp * directionMultiplier;

          const pathD = `M ${p1.x} ${p1.y} C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p2.x} ${p2.y}`;

          return (
            <g key={`snake-group-${start}`}>
              {/* Outer Glow Path */}
              <path
                d={pathD}
                fill="none"
                stroke="#ff0055"
                strokeWidth="4"
                filter="url(#crimson-glow)"
                strokeLinecap="round"
                opacity="0.85"
              />
              {/* Inner Hot Core */}
              <path
                d={pathD}
                fill="none"
                stroke="#ff99bb"
                strokeWidth="1.2"
                strokeLinecap="round"
              />
              {/* Crawling energy pulses using stroke-dashoffset */}
              <path
                d={pathD}
                fill="none"
                stroke="#ff00a0"
                strokeWidth="2.5"
                strokeDasharray="6 20"
                strokeLinecap="round"
                className="animate-snake-flow"
              />
              {/* Snake Head Indicator */}
              <circle
                cx={`${p1.x}%`}
                cy={`${p1.y}%`}
                r="4.5"
                fill="#ff0055"
                className="animate-pulse"
                filter="url(#crimson-glow)"
              />
              {/* Snake Tail Dot */}
              <circle
                cx={`${p2.x}%`}
                cy={`${p2.y}%`}
                r="3"
                fill="#ff99bb"
              />
            </g>
          );
        })}
      </svg>

      {/* 3. Floating Animated Player Tokens Layer */}
      <div className="absolute inset-0 w-full h-full pointer-events-none z-30">
        {players.map((p) => {
          const { x, y } = getSquareCenterPercent(p.position);

          // Prevent token overlap if multiple players are on the same square
          const playersOnSameSquare = players.filter((pl) => pl.position === p.position);
          const playerIdx = playersOnSameSquare.findIndex((pl) => pl.id === p.id);
          const countOnSquare = playersOnSameSquare.length;

          let offsetX = 0;
          let offsetY = 0;

          if (countOnSquare > 1) {
            const spacing = 12; // offset in pixels
            if (countOnSquare === 2) {
              offsetX = playerIdx === 0 ? -spacing : spacing;
            } else if (countOnSquare === 3) {
              if (playerIdx === 0) { offsetX = -spacing; offsetY = -spacing / 2; }
              else if (playerIdx === 1) { offsetX = spacing; offsetY = -spacing / 2; }
              else { offsetX = 0; offsetY = spacing; }
            } else { // 4 players
              if (playerIdx === 0) { offsetX = -spacing; offsetY = -spacing; }
              else if (playerIdx === 1) { offsetX = spacing; offsetY = -spacing; }
              else if (playerIdx === 2) { offsetX = -spacing; offsetY = spacing; }
              else { offsetX = spacing; offsetY = spacing; }
            }
          }

          const isActive = p.id === activePlayerId;

          return (
            <motion.div
              key={p.id}
              className="absolute pointer-events-auto"
              style={{
                left: `${x}%`,
                top: `${y}%`,
                x: offsetX,
                y: offsetY,
              }}
              animate={{
                scale: isActive ? 1.25 : 1.0,
                zIndex: isActive ? 50 : 30,
              }}
              transition={{
                type: 'spring',
                stiffness: 100,
                damping: 14,
              }}
            >
              {/* Token Core */}
              <div
                className={`w-5 h-5 md:w-6 md:h-6 rounded-full border-2 flex items-center justify-center transition-all duration-300 relative ${p.borderColor} ${p.glowColor}`}
                style={{
                  backgroundColor: `${p.color}33`, // 20% alpha
                }}
              >
                {/* Active pulsating beacon ring */}
                {isActive && (
                  <span className="absolute -inset-1.5 md:-inset-2 border border-dashed rounded-full animate-spin border-cyan-400 opacity-60"></span>
                )}

                {/* Micro active indicator */}
                <div
                  className="w-2 h-2 md:w-2.5 md:h-2.5 rounded-full"
                  style={{ backgroundColor: p.color }}
                ></div>

                {/* Passive Shield/Frozen mini indicators */}
                {p.hasShield && (
                  <div className="absolute -top-1.5 -right-1.5 w-2.5 h-2.5 bg-[#39ff14] rounded-full border border-black flex items-center justify-center shadow-[0_0_5px_#39ff14]">
                    <span className="text-[6px] font-black text-black">S</span>
                  </div>
                )}
                {p.isFrozen && (
                  <div className="absolute -top-1.5 -left-1.5 w-2.5 h-2.5 bg-sky-400 rounded-full border border-black flex items-center justify-center shadow-[0_0_5px_#38bdf8]">
                    <span className="text-[6px] font-black text-black">F</span>
                  </div>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
