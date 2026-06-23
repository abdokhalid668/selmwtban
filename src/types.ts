export interface Player {
  id: string;
  name: string;
  color: string;       // Hex color (e.g. #39ff14)
  glowColor: string;   // Tailind glow color class (e.g. shadow-[0_0_15px_rgba(57,255,20,0.5)])
  textColor: string;   // Tailwind text class (e.g. text-[#39ff14])
  borderColor: string; // Tailwind border class (e.g. border-[#39ff14])
  position: number;    // 1 to 100
  isFrozen: boolean;   // skipped next turn
  hasShield: boolean;  // immune to next snake
  doubleRoll: boolean; // rolls 2 dice next turn
  doubleEdgeActive: boolean; // odd next roll moves back 3 steps instead
}

export type LogType = 'roll' | 'ladder' | 'snake' | 'mystery' | 'effect' | 'win' | 'system';

export interface LogEntry {
  id: string;
  timestamp: string;
  playerName: string;
  playerColor: string;
  text: string;
  type: LogType;
}

export type EffectType = 'double_edge' | 'switch' | 'shield' | 'glitch' | 'crash' | 'freeze' | 'overdrive';

export interface MysteryCard {
  id: string;
  title: string;
  description: string;
  flavorText: string;
  effectType: EffectType;
  color: string; // Glowing theme color for the card
}

export interface BoardConfig {
  ladders: Record<number, number>;
  snakes: Record<number, number>;
  mysterySquares: number[];
}
