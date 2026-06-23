import React, { useState } from 'react';
import { soundEngine } from '../utils/audio';

interface CyberDiceProps {
  onRollComplete: (value: number) => void;
  disabled?: boolean;
}

export default function CyberDice({ onRollComplete, disabled = false }: CyberDiceProps) {
  const [isRolling, setIsRolling] = useState<boolean>(false);
  const [rotations, setRotations] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [currentValue, setCurrentValue] = useState<number>(1);

  const getFaceRotations = (val: number) => {
    // Exact degree mapping for 3D faces
    switch (val) {
      case 1: return { x: 0, y: 0 };
      case 2: return { x: 180, y: 0 };
      case 3: return { x: 0, y: -90 };
      case 4: return { x: 0, y: 90 };
      case 5: return { x: 90, y: 0 };
      case 6: return { x: -90, y: 0 };
      default: return { x: 0, y: 0 };
    }
  };

  const rollDice = () => {
    if (disabled || isRolling) return;

    soundEngine.playDiceRoll();
    setIsRolling(true);

    // Roll result
    const result = Math.floor(Math.random() * 6) + 1;
    setCurrentValue(result);

    // Spin at least 3-4 full rotations (1080 to 1440 degrees) plus the final face angle
    const extraSpinsX = (Math.floor(Math.random() * 3) + 3) * 360;
    const extraSpinsY = (Math.floor(Math.random() * 3) + 3) * 360;
    const targetRot = getFaceRotations(result);

    setRotations({
      x: extraSpinsX + targetRot.x,
      y: extraSpinsY + targetRot.y,
    });

    setTimeout(() => {
      setIsRolling(false);
      onRollComplete(result);
    }, 850); // duration of rolling phase
  };

  // Render LED dots on dice faces helper
  const renderDots = (value: number) => {
    const dotsMap: Record<number, boolean[]> = {
      1: [false, false, false, false, true, false, false, false, false],
      2: [true, false, false, false, false, false, false, false, true],
      3: [true, false, false, false, true, false, false, false, true],
      4: [true, false, true, false, false, false, true, false, true],
      5: [true, false, true, false, true, false, true, false, true],
      6: [true, false, true, true, false, true, true, false, true],
    };

    return (
      <div className="grid grid-cols-3 gap-1 w-full h-full p-2.5">
        {dotsMap[value].map((hasDot, i) => (
          <div key={i} className="flex items-center justify-center w-full h-full">
            {hasDot && (
              <div className="w-2 md:w-2.5 h-2 md:h-2.5 rounded-full bg-cyan-400 shadow-[0_0_8px_#00f3ff,0_0_3px_#00f3ff_inset]" />
            )}
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="flex flex-col items-center gap-4">
      {/* 3D Scene Wrapper with Perspective */}
      <div 
        className="w-20 h-20 md:w-24 md:h-24 flex items-center justify-center cursor-pointer relative"
        style={{ perspective: '600px' }}
        onClick={rollDice}
      >
        {/* Cube structure */}
        <div
          className={`w-14 h-14 md:w-16 md:h-16 relative transform-style-3d ${
            isRolling ? 'transition-transform duration-[800ms] ease-out' : 'transition-transform duration-300'
          }`}
          style={{
            transform: `rotateX(${rotations.x}deg) rotateY(${rotations.y}deg)`,
          }}
        >
          {/* FACE 1 (FRONT) */}
          <div
            className="absolute inset-0 bg-slate-950/95 border border-cyan-500/80 rounded-xl flex items-center justify-center backface-hidden shadow-[inset_0_0_12px_rgba(0,243,255,0.25)]"
            style={{ transform: 'rotateY(0deg) translateZ(2rem)' }}
          >
            {renderDots(1)}
          </div>

          {/* FACE 2 (BACK) */}
          <div
            className="absolute inset-0 bg-slate-950/95 border border-cyan-500/80 rounded-xl flex items-center justify-center backface-hidden shadow-[inset_0_0_12px_rgba(0,243,255,0.25)]"
            style={{ transform: 'rotateY(180deg) translateZ(2rem)' }}
          >
            {renderDots(2)}
          </div>

          {/* FACE 3 (LEFT) */}
          <div
            className="absolute inset-0 bg-slate-950/95 border border-cyan-500/80 rounded-xl flex items-center justify-center backface-hidden shadow-[inset_0_0_12px_rgba(0,243,255,0.25)]"
            style={{ transform: 'rotateY(-90deg) translateZ(2rem)' }}
          >
            {renderDots(3)}
          </div>

          {/* FACE 4 (RIGHT) */}
          <div
            className="absolute inset-0 bg-slate-950/95 border border-cyan-500/80 rounded-xl flex items-center justify-center backface-hidden shadow-[inset_0_0_12px_rgba(0,243,255,0.25)]"
            style={{ transform: 'rotateY(90deg) translateZ(2rem)' }}
          >
            {renderDots(4)}
          </div>

          {/* FACE 5 (TOP) */}
          <div
            className="absolute inset-0 bg-slate-950/95 border border-cyan-500/80 rounded-xl flex items-center justify-center backface-hidden shadow-[inset_0_0_12px_rgba(0,243,255,0.25)]"
            style={{ transform: 'rotateX(90deg) translateZ(2rem)' }}
          >
            {renderDots(5)}
          </div>

          {/* FACE 6 (BOTTOM) */}
          <div
            className="absolute inset-0 bg-slate-950/95 border border-cyan-500/80 rounded-xl flex items-center justify-center backface-hidden shadow-[inset_0_0_12px_rgba(0,243,255,0.25)]"
            style={{ transform: 'rotateX(-90deg) translateZ(2rem)' }}
          >
            {renderDots(6)}
          </div>
        </div>
      </div>

      {/* Button helper */}
      <button
        disabled={disabled || isRolling}
        onClick={rollDice}
        className={`w-full py-2.5 px-6 font-mono font-bold text-xs uppercase tracking-widest rounded-xl transition-all duration-300 select-none cursor-pointer border ${
          disabled || isRolling
            ? 'bg-slate-900/30 border-slate-800 text-slate-600 cursor-not-allowed'
            : 'bg-cyan-500/10 border-cyan-400 text-cyan-300 hover:bg-cyan-500/20 active:scale-95 shadow-[0_0_12px_rgba(0,243,255,0.15)]'
        }`}
      >
        {isRolling ? 'ROLLING...' : 'TRIGGER ROLL'}
      </button>
    </div>
  );
}
