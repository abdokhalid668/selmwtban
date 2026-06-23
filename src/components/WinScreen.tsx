import React, { useEffect, useRef } from 'react';
import { Player } from '../types';
import { soundEngine } from '../utils/audio';
import { Trophy, RefreshCw, LogOut } from 'lucide-react';
import { motion } from 'motion/react';

interface WinScreenProps {
  winner: Player;
  onRestart: () => void;
  onExit: () => void;
}

interface Particle {
  x: number;
  y: number;
  radius: number;
  color: string;
  vx: number;
  vy: number;
  rotation: number;
  rotationSpeed: number;
  opacity: number;
  decay: number;
}

export default function WinScreen({ winner, onRestart, onExit }: WinScreenProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    // Play celebratory win chimes
    soundEngine.playWinMusic();

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    // Color choices
    const NEON_COLORS = [
      '#39ff14', // Green
      '#00f3ff', // Cyan
      '#ff007f', // Pink
      '#fffb00', // Yellow
      '#d346ff', // Purple
    ];

    const particles: Particle[] = [];

    const createParticle = (x: number, y: number): Particle => {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 12 + 6;
      return {
        x,
        y,
        radius: Math.random() * 5 + 3,
        color: NEON_COLORS[Math.floor(Math.random() * NEON_COLORS.length)],
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 2, // burst slightly upwards
        rotation: Math.random() * 360,
        rotationSpeed: Math.random() * 10 - 5,
        opacity: 1,
        decay: Math.random() * 0.015 + 0.005,
      };
    };

    // Spawn initial bursts
    const centerBurstX = width / 2;
    const centerBurstY = height / 2;
    for (let i = 0; i < 150; i++) {
      particles.push(createParticle(centerBurstX, centerBurstY));
    }

    // Side canons
    const spawnSideBurst = () => {
      // Left side
      for (let i = 0; i < 20; i++) {
        const p = createParticle(0, height - 50);
        p.vx = Math.random() * 15 + 5;
        p.vy = -Math.random() * 15 - 10;
        particles.push(p);
      }
      // Right side
      for (let i = 0; i < 20; i++) {
        const p = createParticle(width, height - 50);
        p.vx = -Math.random() * 15 - 5;
        p.vy = -Math.random() * 15 - 10;
        particles.push(p);
      }
    };

    spawnSideBurst();

    // Spawn side bursts periodically
    const canonInterval = setInterval(spawnSideBurst, 1500);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    // Animation Loop
    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // Render & update particles
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.25; // gravity
        p.vx *= 0.98; // wind drag
        p.rotation += p.rotationSpeed;
        p.opacity -= p.decay;

        if (p.opacity <= 0) {
          particles.splice(i, 1);
          continue;
        }

        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate((p.rotation * Math.PI) / 180);
        ctx.globalAlpha = p.opacity;

        // Draw glowing particle
        ctx.shadowBlur = 10;
        ctx.shadowColor = p.color;
        ctx.fillStyle = p.color;

        // Render alternating shapes (squares or circles)
        if (i % 2 === 0) {
          ctx.fillRect(-p.radius, -p.radius, p.radius * 2, p.radius * 2);
        } else {
          ctx.beginPath();
          ctx.arc(0, 0, p.radius, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.restore();
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      clearInterval(canonInterval);
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
    };
  }, [winner]);

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#05050dc0] backdrop-blur-md select-none p-4">
      {/* Celebration Canvas */}
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none z-10" />

      {/* Triumphant Win Card */}
      <motion.div
        initial={{ scale: 0.8, rotate: -2, opacity: 0 }}
        animate={{ scale: 1, rotate: 0, opacity: 1 }}
        transition={{ type: 'spring', damping: 15, stiffness: 100 }}
        className="w-full max-w-lg bg-[#0d0d1e]/90 border-2 rounded-3xl p-8 shadow-[0_0_80px_rgba(211,70,255,0.25)] text-center relative z-20 overflow-hidden"
        style={{ borderColor: winner.color }}
      >
        {/* Decorative Neon Ring */}
        <div 
          className="absolute inset-0 pointer-events-none opacity-20"
          style={{ boxShadow: `inset 0 0 30px ${winner.color}` }}
        />

        {/* Huge Trophy Icon */}
        <div className="flex justify-center mb-6 relative">
          <motion.div
            animate={{ scale: [1, 1.1, 1], y: [0, -6, 0] }}
            transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut' }}
            className="w-24 h-24 rounded-full flex items-center justify-center border relative"
            style={{
              backgroundColor: `${winner.color}0a`,
              borderColor: `${winner.color}55`,
              boxShadow: `0 0 25px ${winner.color}22`,
            }}
          >
            <Trophy className="w-12 h-12 text-[#fffb00] drop-shadow-[0_0_12px_#fffb00]" />
          </motion.div>
        </div>

        {/* Victory Header */}
        <div className="space-y-2 mb-8">
          <span className="text-xs font-mono font-bold tracking-widest text-[#fffb00] uppercase block">
            GRID ASCENSION UNLOCKED
          </span>
          <h1 className="text-3xl md:text-4xl font-black font-sans tracking-tight text-white uppercase">
            VICTORY ACHIEVED!
          </h1>
          <p className="text-slate-400 font-mono text-xs uppercase tracking-wide mt-1">
            NODE 100 TERMINAL CONTROL ACQUIRED
          </p>
        </div>

        {/* Champion Name Box */}
        <div className="mb-10 p-5 rounded-2xl bg-black/40 border border-slate-800/80 max-w-xs mx-auto">
          <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest block mb-2">
            CHAMPION LOGIN
          </span>
          <h2
            className="text-2xl font-black font-sans tracking-widest uppercase truncate px-2"
            style={{
              color: winner.color,
              textShadow: `0 0 15px ${winner.color}55`,
            }}
          >
            {winner.name}
          </h2>
        </div>

        {/* Control Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <button
            onClick={onRestart}
            className="w-full sm:w-auto px-8 py-4 rounded-xl font-sans font-black text-xs uppercase tracking-widest text-black bg-gradient-to-r from-cyan-400 to-purple-500 hover:from-cyan-300 hover:to-purple-400 active:scale-95 transition-all duration-300 cursor-pointer flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(0,243,255,0.3)]"
          >
            <RefreshCw className="w-4 h-4" /> PLAY AGAIN
          </button>
          
          <button
            onClick={onExit}
            className="w-full sm:w-auto px-8 py-4 rounded-xl font-sans font-black text-xs uppercase tracking-widest text-slate-300 bg-slate-900 hover:bg-slate-800 active:scale-95 border border-slate-800 hover:border-slate-700 transition-all duration-300 cursor-pointer flex items-center justify-center gap-2"
          >
            <LogOut className="w-4 h-4" /> RETIRE TO SETUP
          </button>
        </div>
      </motion.div>
    </div>
  );
}
