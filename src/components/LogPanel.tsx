import React, { useRef, useEffect } from 'react';
import { Player, LogEntry } from '../types';
import { Trophy, Shield, VolumeX, ShieldAlert, Sparkles, MessageSquare, ListCollapse, Play, SquareTerminal } from 'lucide-react';

interface LogPanelProps {
  players: Player[];
  activePlayerId: string;
  logs: LogEntry[];
  onMuteToggle: () => void;
  isMuted: boolean;
}

export default function LogPanel({
  players,
  activePlayerId,
  logs,
  onMuteToggle,
  isMuted,
}: LogPanelProps) {
  const terminalEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll action terminal to bottom when new logs arrive
  useEffect(() => {
    terminalEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  // Sort players by board position descending for the Leaderboard
  const rankedPlayers = [...players].sort((a, b) => b.position - a.position);

  const getLogColorClass = (type: string) => {
    switch (type) {
      case 'roll': return 'text-slate-300';
      case 'ladder': return 'text-[#00f3ff] font-bold';
      case 'snake': return 'text-[#ff0055] font-bold';
      case 'mystery': return 'text-[#fffb00] font-bold';
      case 'effect': return 'text-purple-400 font-bold';
      case 'win': return 'text-green-400 font-extrabold animate-pulse';
      case 'system': return 'text-slate-500 italic';
      default: return 'text-slate-400';
    }
  };

  return (
    <div className="w-full flex flex-col gap-6 h-full">
      {/* 1. Leaderboard Ranking */}
      <div className="bg-[#0d0d1e]/80 border border-slate-800/85 rounded-2xl p-5 shadow-lg backdrop-blur-xl relative">
        <div className="absolute top-0 left-6 w-12 h-[1.5px] bg-cyan-400"></div>
        <h2 className="text-xs font-mono uppercase tracking-widest text-slate-400 mb-4 flex items-center gap-2">
          <Trophy className="w-4 h-4 text-amber-400" /> REALTIME LEADERBOARD
        </h2>

        <div className="space-y-3">
          {rankedPlayers.map((p, idx) => {
            const isCurrent = p.id === activePlayerId;
            return (
              <div
                key={p.id}
                className={`flex items-center justify-between p-3 rounded-xl border transition-all duration-300 ${
                  isCurrent
                    ? 'bg-slate-900/60 border-cyan-500/50 shadow-[0_0_12px_rgba(0,243,255,0.05)]'
                    : 'bg-slate-950/40 border-slate-900'
                }`}
              >
                <div className="flex items-center gap-3">
                  {/* Position number or Trophy */}
                  <span className="font-mono text-xs font-bold text-slate-500 w-4">
                    {idx === 0 ? '👑' : `#${idx + 1}`}
                  </span>

                  {/* Player Dot */}
                  <div
                    className="w-2.5 h-2.5 rounded-full"
                    style={{
                      backgroundColor: p.color,
                      boxShadow: `0 0 8px ${p.color}`,
                    }}
                  />

                  {/* Nickname and Grid Status */}
                  <div className="flex flex-col">
                    <span className="text-sm font-bold text-slate-100 tracking-wide flex items-center gap-1.5">
                      {p.name}
                      {isCurrent && (
                        <span className="text-[8px] font-mono font-bold uppercase tracking-wider text-cyan-400 bg-cyan-400/10 px-1.5 py-0.5 rounded border border-cyan-400/30">
                          ACTIVE
                        </span>
                      )}
                    </span>
                    <span className="text-[10px] font-mono text-slate-500 uppercase">
                      Position: <span className="text-slate-300 font-semibold">{p.position} / 100</span>
                    </span>
                  </div>
                </div>

                {/* Status Badges */}
                <div className="flex items-center gap-1.5">
                  {p.hasShield && (
                    <div className="px-2 py-0.5 rounded bg-[#39ff14]/10 border border-[#39ff14]/30 flex items-center gap-1 shadow-[0_0_8px_rgba(57,255,20,0.1)]">
                      <Shield className="w-3 h-3 text-[#39ff14]" />
                      <span className="text-[8px] font-mono font-bold text-[#39ff14]">SHIELD</span>
                    </div>
                  )}
                  {p.isFrozen && (
                    <div className="px-2 py-0.5 rounded bg-sky-500/10 border border-sky-400/30 flex items-center gap-1 shadow-[0_0_8px_rgba(56,189,248,0.1)]">
                      <ShieldAlert className="w-3 h-3 text-sky-400 animate-pulse" />
                      <span className="text-[8px] font-mono font-bold text-sky-400">FROZEN</span>
                    </div>
                  )}
                  {p.doubleRoll && (
                    <div className="px-2 py-0.5 rounded bg-amber-500/10 border border-amber-400/30 flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-amber-400" />
                      <span className="text-[8px] font-mono font-bold text-amber-400">2X ROLLS</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 2. Cyber action terminal */}
      <div className="bg-[#0c0c16] border border-slate-900 rounded-2xl flex-1 flex flex-col p-4 shadow-lg min-h-[220px] max-h-[300px]">
        <div className="flex items-center justify-between border-b border-slate-900 pb-3 mb-3 shrink-0">
          <div className="flex items-center gap-2">
            <SquareTerminal className="w-4 h-4 text-purple-400" />
            <h3 className="text-xs font-mono font-semibold tracking-wider text-slate-400 uppercase">
              GRID ACTION TERMINAL
            </h3>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
            <span className="text-[9px] font-mono text-slate-500 uppercase tracking-widest">
              LIVE LINK
            </span>
          </div>
        </div>

        {/* Scrollable logs */}
        <div className="flex-1 overflow-y-auto space-y-2 pr-1 scrollbar-thin">
          {logs.map((log) => (
            <div
              key={log.id}
              className="flex items-start gap-2.5 text-xs font-mono border-b border-slate-950 pb-1.5 leading-relaxed"
            >
              <span className="text-[9px] text-slate-600 mt-0.5 shrink-0 select-none">
                [{log.timestamp}]
              </span>

              {log.playerName && (
                <span
                  className="font-bold shrink-0 select-none"
                  style={{ color: log.playerColor }}
                >
                  {log.playerName}:
                </span>
              )}

              <span className={getLogColorClass(log.type)}>{log.text}</span>
            </div>
          ))}
          <div ref={terminalEndRef} />
        </div>
      </div>
    </div>
  );
}
