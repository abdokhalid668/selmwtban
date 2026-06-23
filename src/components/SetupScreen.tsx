import React, { useState } from 'react';
import { Player } from '../types';
import { soundEngine } from '../utils/audio';
import { Users, Shield, Zap, Sparkles, Volume2, VolumeX } from 'lucide-react';
import { motion } from 'motion/react';

interface SetupScreenProps {
  onStartGame: (players: Player[]) => void;
}

const PLAYER_PRESETS = [
  {
    id: '1',
    defaultName: 'Hyperion',
    color: '#39ff14', // Neon Green
    glowColor: 'shadow-[0_0_15px_rgba(57,255,20,0.5)]',
    textColor: 'text-[#39ff14]',
    borderColor: 'border-[#39ff14]',
    bgGlow: 'bg-[#39ff14]/10',
  },
  {
    id: '2',
    defaultName: 'Daedalus',
    color: '#00f3ff', // Neon Cyan
    glowColor: 'shadow-[0_0_15px_rgba(0,243,255,0.5)]',
    textColor: 'text-[#00f3ff]',
    borderColor: 'border-[#00f3ff]',
    bgGlow: 'bg-[#00f3ff]/10',
  },
  {
    id: '3',
    defaultName: 'Valkyrie',
    color: '#ff007f', // Neon Magenta/Pink
    glowColor: 'shadow-[0_0_15px_rgba(255,0,127,0.5)]',
    textColor: 'text-[#ff007f]',
    borderColor: 'border-[#ff007f]',
    bgGlow: 'bg-[#ff007f]/10',
  },
  {
    id: '4',
    defaultName: 'Phoenix',
    color: '#fffb00', // Neon Yellow
    glowColor: 'shadow-[0_0_15px_rgba(255,251,0,0.5)]',
    textColor: 'text-[#fffb00]',
    borderColor: 'border-[#fffb00]',
    bgGlow: 'bg-[#fffb00]/10',
  },
];

export default function SetupScreen({ onStartGame }: SetupScreenProps) {
  const [playerCount, setPlayerCount] = useState<number>(2);
  const [names, setNames] = useState<string[]>(['Hyperion', 'Daedalus', 'Valkyrie', 'Phoenix']);
  const [muted, setMuted] = useState<boolean>(soundEngine.getMutedState());

  const handleMuteToggle = () => {
    const isMuted = soundEngine.toggleMute();
    setMuted(isMuted);
    soundEngine.playClick();
  };

  const handleNameChange = (index: number, val: string) => {
    const nextNames = [...names];
    nextNames[index] = val;
    setNames(nextNames);
  };

  const handleStart = () => {
    soundEngine.playLadderUp();
    const activePlayers: Player[] = Array.from({ length: playerCount }).map((_, idx) => {
      const preset = PLAYER_PRESETS[idx];
      return {
        id: preset.id,
        name: names[idx].trim() || preset.defaultName,
        color: preset.color,
        glowColor: preset.glowColor,
        textColor: preset.textColor,
        borderColor: preset.borderColor,
        position: 1, // Start at square 1
        isFrozen: false,
        hasShield: false,
        doubleRoll: false,
        doubleEdgeActive: false,
      };
    });
    onStartGame(activePlayers);
  };

  return (
    <div className="min-h-screen bg-[#06060e] bg-radial-gradient flex flex-col items-center justify-center p-4 relative overflow-hidden select-none">
      {/* Background Tech Hexagons/Rays */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(18,18,36,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(18,18,36,0.1)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none opacity-40"></div>
      <div className="absolute -top-40 -left-40 w-96 h-96 rounded-full bg-purple-600/10 blur-[120px] pointer-events-none"></div>
      <div className="absolute -bottom-40 -right-40 w-96 h-96 rounded-full bg-cyan-600/10 blur-[120px] pointer-events-none"></div>

      {/* Mute Button top right */}
      <div className="absolute top-6 right-6 z-20">
        <button
          onClick={handleMuteToggle}
          className="p-3 bg-slate-900/80 border border-slate-800 rounded-xl hover:border-slate-700 transition-all text-slate-400 hover:text-white cursor-pointer flex items-center justify-center"
        >
          {muted ? <VolumeX className="w-5 h-5 text-red-500" /> : <Volume2 className="w-5 h-5 text-cyan-400" />}
        </button>
      </div>

      <div className="w-full max-w-2xl relative z-10 flex flex-col items-center">
        {/* Title Block */}
        <div className="text-center mb-8 relative">
          <div className="absolute -inset-1 rounded-lg bg-gradient-to-r from-purple-600 to-cyan-500 blur opacity-30"></div>
          <div className="relative bg-black/40 px-8 py-5 rounded-2xl border border-slate-800/80 backdrop-blur-xl">
            <h1 className="text-4xl md:text-5xl font-extrabold font-sans tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-[#00f3ff] via-[#d346ff] to-[#ff007f]">
              CYBERGRID
            </h1>
            <p className="text-xs md:text-sm font-mono text-cyan-400/80 mt-1 uppercase tracking-widest">
              SNAKES & LADDERS • MULTIPLAYER CORE
            </p>
          </div>
        </div>

        {/* Setup Panel */}
        <div className="w-full bg-[#0d0d1e]/90 border border-slate-800/80 rounded-3xl p-6 md:p-8 shadow-2xl backdrop-blur-2xl relative">
          {/* Subtle Cyber Accent lines */}
          <div className="absolute top-0 left-10 w-20 h-[1px] bg-gradient-to-r from-transparent to-cyan-400"></div>
          <div className="absolute bottom-0 right-10 w-20 h-[1px] bg-gradient-to-r from-purple-400 to-transparent"></div>

          {/* Player Count Selector */}
          <div className="mb-8">
            <label className="block text-xs font-mono uppercase text-slate-400 tracking-wider mb-3 flex items-center gap-2">
              <Users className="w-4 h-4 text-purple-400" /> SELECT SQUAD COUNT
            </label>
            <div className="grid grid-cols-3 gap-3">
              {[2, 3, 4].map((num) => (
                <button
                  key={num}
                  onClick={() => {
                    soundEngine.playClick();
                    setPlayerCount(num);
                  }}
                  className={`py-3 rounded-xl border font-mono font-bold text-sm tracking-widest transition-all duration-300 cursor-pointer ${
                    playerCount === num
                      ? 'bg-gradient-to-r from-cyan-500/20 to-purple-500/20 border-cyan-400 text-cyan-300 shadow-[0_0_15px_rgba(0,243,255,0.2)]'
                      : 'bg-slate-900/50 border-slate-800 text-slate-500 hover:border-slate-700 hover:text-slate-300'
                  }`}
                >
                  {num} PLAYERS
                </button>
              ))}
            </div>
          </div>

          {/* Nickname Inputs */}
          <div className="space-y-4 mb-8">
            <label className="block text-xs font-mono uppercase text-slate-400 tracking-wider">
              CONFIGURE LOGINS / NICKNAMES
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Array.from({ length: playerCount }).map((_, idx) => {
                const preset = PLAYER_PRESETS[idx];
                return (
                  <div
                    key={idx}
                    className={`p-4 rounded-2xl bg-slate-900/40 border border-slate-800/80 flex flex-col gap-2 relative transition-all duration-300 hover:border-slate-700/50`}
                  >
                    <div className="absolute top-3 right-3 w-3 h-3 rounded-full bg-slate-800 flex items-center justify-center overflow-hidden">
                      <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: preset.color }}></div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] font-mono font-semibold uppercase ${preset.textColor} px-2 py-0.5 rounded ${preset.bgGlow}`}>
                        CORE {preset.id}
                      </span>
                    </div>
                    <input
                      type="text"
                      maxLength={12}
                      value={names[idx]}
                      onChange={(e) => handleNameChange(idx, e.target.value)}
                      placeholder={preset.defaultName}
                      className={`bg-slate-950/80 border ${preset.borderColor} ${preset.glowColor} focus:outline-none focus:ring-1 text-slate-100 rounded-xl px-3 py-2 text-sm font-semibold tracking-wider w-full`}
                    />
                  </div>
                );
              })}
            </div>
          </div>

          {/* Action Features Info */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 bg-slate-950/40 border border-slate-800/80 rounded-2xl mb-8">
            <div className="flex items-start gap-2.5">
              <Zap className="w-4 h-4 text-[#00f3ff] mt-0.5 shrink-0" />
              <div>
                <p className="text-[10px] font-mono uppercase text-slate-300 tracking-wide">HYPER-LADDERS</p>
                <p className="text-[9px] text-slate-500">Fast-track uplink conduits to rocket you forward.</p>
              </div>
            </div>
            <div className="flex items-start gap-2.5 border-t sm:border-t-0 sm:border-l border-slate-800/80 pt-2 sm:pt-0 sm:pl-3">
              <Shield className="w-4 h-4 text-[#39ff14] mt-0.5 shrink-0" />
              <div>
                <p className="text-[10px] font-mono uppercase text-slate-300 tracking-wide">ENERGY SHIELDS</p>
                <p className="text-[9px] text-slate-500">Protect core grid progress from crimson wormholes.</p>
              </div>
            </div>
            <div className="flex items-start gap-2.5 border-t sm:border-t-0 sm:border-l border-slate-800/80 pt-2 sm:pt-0 sm:pl-3">
              <Sparkles className="w-4 h-4 text-[#fffb00] mt-0.5 shrink-0" />
              <div>
                <p className="text-[10px] font-mono uppercase text-slate-300 tracking-wide">MYSTERY NODE TWISTS</p>
                <p className="text-[9px] text-slate-500">Anomalies with teleports, freezes, and position swaps.</p>
              </div>
            </div>
          </div>

          {/* Start Button */}
          <button
            onClick={handleStart}
            className="w-full relative py-4 rounded-2xl font-sans font-black text-base uppercase tracking-widest cursor-pointer text-black bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-500 hover:from-cyan-300 hover:via-purple-400 hover:to-pink-400 active:scale-[0.98] transition-all duration-300 shadow-[0_0_30px_rgba(211,70,255,0.4)]"
          >
            INITIALIZE NEURAL LINK
          </button>
        </div>

        <p className="text-[10px] font-mono text-slate-600 mt-6 uppercase tracking-wider">
          CYBERGRID OS v4.19 • PREPARING NEON COMPILERS
        </p>
      </div>
    </div>
  );
}
