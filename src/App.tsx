import React, { useState, useEffect } from 'react';
import { Player, LogEntry, MysteryCard, BoardConfig } from './types';
import SetupScreen from './components/SetupScreen';
import GameBoard from './components/GameBoard';
import LogPanel from './components/LogPanel';
import CyberDice from './components/CyberDice';
import MysteryCardModal from './components/MysteryCardModal';
import WinScreen from './components/WinScreen';
import { soundEngine } from './utils/audio';
import { Volume2, VolumeX, Shield, RefreshCw, LogOut, Terminal, Users, Play, HelpCircle, AlertCircle } from 'lucide-react';
import { motion } from 'motion/react';

// Static Configurations
const BOARD_CONFIG: BoardConfig = {
  ladders: {
    4: 25,
    13: 46,
    29: 49,
    33: 68,
    42: 63,
    50: 69,
    62: 81,
    74: 92,
  },
  snakes: {
    27: 5,
    40: 3,
    43: 18,
    54: 31,
    66: 45,
    76: 58,
    89: 53,
    99: 41,
  },
  mysterySquares: [15, 28, 47, 65, 78, 93],
};

const MYSTERY_CARDS: Omit<MysteryCard, 'id'>[] = [
  {
    title: 'GRID DEFLECTOR SHIELD',
    description: 'Load a protective deflection layer. Immune to the next snake wormhole you touch.',
    flavorText: 'DEFENSIVE BUFFER ONLINE. THREAT REPROGRAMMED.',
    effectType: 'shield',
    color: '#39ff14',
  },
  {
    title: 'QUANTUM VECTOR SWAP',
    description: 'Instantly swap grid coordinate points with the active player nearest to you.',
    flavorText: 'GRID COHERENCE LOST. SWAPPING DATA CHANNELS.',
    effectType: 'switch',
    color: '#00f3ff',
  },
  {
    title: 'SYNAPSE OVERCLOCK',
    description: 'Unleash double velocity! Your next movement roll multiplier is multiplied by x2.',
    flavorText: 'CORE OVERDRIVE ACTIVE. EXTREME THROTTLE COMPILING.',
    effectType: 'overdrive',
    color: '#d346ff',
  },
  {
    title: 'HYPERPLANE GLITCH',
    description: 'Quantum packet skip! Teleport immediately forward 5 steps in the grid.',
    flavorText: 'PACKET SLICE STABILIZED. CODES SHIFTED.',
    effectType: 'glitch',
    color: '#00f3ff',
  },
  {
    title: 'SYSTEM FATAL EXCEPTION',
    description: 'Corrupt sector! Rollback 5 steps in the network grid to re-verify status checks.',
    flavorText: 'SEGMENTATION FAULT. STACK STABILIZING.',
    effectType: 'crash',
    color: '#ff0055',
  },
  {
    title: 'EMP STASIS LOCK',
    description: 'Grid interface frozen! Skip your entire next turn to clear background registry blocks.',
    flavorText: 'SIGNAL DISRUPTED. INITIATING CORE MEMORY FLUSH.',
    effectType: 'freeze',
    color: '#38bdf8',
  },
  {
    title: 'DOUBLE EDGE REBOOT',
    description: 'Gain a bonus roll immediately! But if you roll an ODD number, move back 3 steps.',
    flavorText: 'HIGH-RISK DIRECT KERNEL COMPILER EXECUTION.',
    effectType: 'double_edge',
    color: '#fffb00',
  },
];

export default function App() {
  const [gameState, setGameState] = useState<'setup' | 'playing' | 'winner'>('setup');
  const [players, setPlayers] = useState<Player[]>([]);
  const [activePlayerIndex, setActivePlayerIndex] = useState<number>(0);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [winner, setWinner] = useState<Player | null>(null);
  const [activeCard, setActiveCard] = useState<MysteryCard | null>(null);
  const [cardModalOpen, setCardModalOpen] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(soundEngine.getMutedState());
  const [isMoving, setIsMoving] = useState<boolean>(false);

  // Sync mute state on startup
  useEffect(() => {
    setIsMuted(soundEngine.getMutedState());
  }, []);

  // System log utility
  const addLog = (playerName: string, playerColor: string, text: string, type: LogEntry['type']) => {
    const time = new Date();
    const timestamp = time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    const newLog: LogEntry = {
      id: Math.random().toString(36).substr(2, 9),
      timestamp,
      playerName,
      playerColor,
      text,
      type,
    };
    setLogs((prev) => [...prev, newLog]);
  };

  // Skip frozen player logic when turn changes
  useEffect(() => {
    if (gameState !== 'playing') return;

    const activePlayer = players[activePlayerIndex];
    if (activePlayer && activePlayer.isFrozen) {
      // Unfreeze them in state immediately
      setPlayers((prev) =>
        prev.map((p) => (p.id === activePlayer.id ? { ...p, isFrozen: false } : p))
      );
      
      addLog(
        activePlayer.name,
        activePlayer.color,
        `EMP stasis lock active! Losing turn to defragment state registers.`,
        'effect'
      );

      // Auto pass turn with a read-time delay
      const timer = setTimeout(() => {
        passTurn();
      }, 1500);

      return () => clearTimeout(timer);
    }
  }, [activePlayerIndex, gameState]);

  const handleStartGame = (configuredPlayers: Player[]) => {
    setPlayers(configuredPlayers);
    setActivePlayerIndex(0);
    setLogs([]);
    setWinner(null);
    setActiveCard(null);
    setCardModalOpen(false);

    // Initial system boot terminal entries
    const firstPlayer = configuredPlayers[0];
    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    setLogs([
      {
        id: 'boot',
        timestamp,
        playerName: '',
        playerColor: '',
        text: 'CYBERGRID KERNEL v4.19 STABLE. NEURAL CONNECTIONS ACTIVE.',
        type: 'system',
      },
      {
        id: 'start-notif',
        timestamp,
        playerName: '',
        playerColor: '',
        text: `Grid link synced. Turn sequence loaded. First login: ${firstPlayer.name}`,
        type: 'system',
      },
    ]);

    setGameState('playing');
  };

  const handleMuteToggle = () => {
    const nextMute = soundEngine.toggleMute();
    setIsMuted(nextMute);
    soundEngine.playClick();
  };

  // Rotates to the next player index
  const passTurn = () => {
    setPlayers((currentPlayers) => {
      setActivePlayerIndex((prevIndex) => (prevIndex + 1) % currentPlayers.length);
      return currentPlayers;
    });
  };

  // Step-by-step moving animation
  const movePlayerStepByStep = async (playerToMove: Player, finalTarget: number): Promise<number> => {
    setIsMoving(true);
    let currentPos = playerToMove.position;

    while (currentPos !== finalTarget) {
      if (currentPos < finalTarget) {
        currentPos++;
      } else {
        currentPos--;
      }

      soundEngine.playClick();

      // Update state for active player position
      setPlayers((prev) =>
        prev.map((p) => (p.id === playerToMove.id ? { ...p, position: currentPos } : p))
      );

      // Slow down between squares
      await new Promise((resolve) => setTimeout(resolve, 200));
    }

    setIsMoving(false);
    return currentPos;
  };

  // Land checks (snakes, ladders, mysteries)
  const evaluateLandingSquare = async (player: Player, square: number) => {
    // 1. Victory reached
    if (square === 100) {
      addLog(player.name, player.color, `fully linked with Core 100! Host connection complete.`, 'win');
      setWinner(player);
      setGameState('winner');
      return;
    }

    // 2. Snake head landed
    const snakeTail = BOARD_CONFIG.snakes[square];
    if (snakeTail !== undefined) {
      // Re-read player from latest state to ensure shield accuracy
      let latestPlayer = player;
      setPlayers((prev) => {
        const found = prev.find((p) => p.id === player.id);
        if (found) latestPlayer = found;
        return prev;
      });

      if (latestPlayer.hasShield) {
        // Shield absorbs the snake block!
        setPlayers((prev) =>
          prev.map((p) => (p.id === player.id ? { ...p, hasShield: false } : p))
        );
        addLog(
          player.name,
          player.color,
          `Snake wormhole avoided! Defensive grid shield absorbed failure at node ${square}.`,
          'effect'
        );
        soundEngine.playLadderUp(); // Positive sweep
        passTurn();
      } else {
        addLog(
          player.name,
          player.color,
          `Glided down crimson laser wormhole from node ${square} to tail node ${snakeTail}!`,
          'snake'
        );
        soundEngine.playSnakeDown();

        // Single smooth slide down using Framer motion
        setPlayers((prev) =>
          prev.map((p) => (p.id === player.id ? { ...p, position: snakeTail } : p))
        );
        await new Promise((resolve) => setTimeout(resolve, 600));
        passTurn();
      }
      return;
    }

    // 3. Ladder base landed
    const ladderTop = BOARD_CONFIG.ladders[square];
    if (ladderTop !== undefined) {
      addLog(
        player.name,
        player.color,
        `Ascended cyan hyperloop booster from node ${square} directly to node ${ladderTop}!`,
        'ladder'
      );
      soundEngine.playLadderUp();

      // Single smooth slide up using Framer motion
      setPlayers((prev) =>
        prev.map((p) => (p.id === player.id ? { ...p, position: ladderTop } : p))
      );
      await new Promise((resolve) => setTimeout(resolve, 600));
      passTurn();
      return;
    }

    // 4. Mystery node landed
    if (BOARD_CONFIG.mysterySquares.includes(square)) {
      const drawn = {
        ...MYSTERY_CARDS[Math.floor(Math.random() * MYSTERY_CARDS.length)],
        id: Math.random().toString(36).substr(2, 9),
      };
      soundEngine.playCardReveal();
      setActiveCard(drawn);
      setCardModalOpen(true);
      return; // Close card modal triggers final effects/passTurn
    }

    // 5. Normal safe node landing
    passTurn();
  };

  // Closed action card triggers
  const handleCloseCardModal = async () => {
    if (!activeCard) return;

    const activePlayer = players[activePlayerIndex];
    setCardModalOpen(false);

    const effect = activeCard.effectType;
    let text = '';

    switch (effect) {
      case 'shield':
        setPlayers((prev) =>
          prev.map((p) => (p.id === activePlayer.id ? { ...p, hasShield: true } : p))
        );
        text = 'Passive Deflection Shield uploaded to active system memory.';
        addLog(activePlayer.name, activePlayer.color, text, 'effect');
        passTurn();
        break;

      case 'overdrive':
        setPlayers((prev) =>
          prev.map((p) => (p.id === activePlayer.id ? { ...p, doubleRoll: true } : p))
        );
        text = 'Overclock Overdrive fully configured. Next movement velocity multiplied.';
        addLog(activePlayer.name, activePlayer.color, text, 'effect');
        passTurn();
        break;

      case 'freeze':
        setPlayers((prev) =>
          prev.map((p) => (p.id === activePlayer.id ? { ...p, isFrozen: true } : p))
        );
        text = 'Neural link locked in stasis! Active node skip loaded for next sequence.';
        addLog(activePlayer.name, activePlayer.color, text, 'effect');
        passTurn();
        break;

      case 'double_edge':
        setPlayers((prev) =>
          prev.map((p) => (p.id === activePlayer.id ? { ...p, doubleEdgeActive: true } : p))
        );
        text = 'Double Edge compiler ready! Initiating high-risk bonus roll sequence.';
        addLog(activePlayer.name, activePlayer.color, text, 'effect');
        // Do NOT pass turn so active player rolls again immediately
        break;

      case 'glitch':
        const forwardTarget = Math.min(100, activePlayer.position + 5);
        text = `Tunneling forward +5 sectors! Displaced directly to square ${forwardTarget}.`;
        addLog(activePlayer.name, activePlayer.color, text, 'effect');
        setPlayers((prev) =>
          prev.map((p) => (p.id === activePlayer.id ? { ...p, position: forwardTarget } : p))
        );
        await new Promise((resolve) => setTimeout(resolve, 600));
        await evaluateLandingSquare(activePlayer, forwardTarget);
        break;

      case 'crash':
        const backwardTarget = Math.max(1, activePlayer.position - 5);
        text = `System segment rollback -5 steps! Teleporting to square ${backwardTarget}.`;
        addLog(activePlayer.name, activePlayer.color, text, 'effect');
        setPlayers((prev) =>
          prev.map((p) => (p.id === activePlayer.id ? { ...p, position: backwardTarget } : p))
        );
        await new Promise((resolve) => setTimeout(resolve, 600));
        await evaluateLandingSquare(activePlayer, backwardTarget);
        break;

      case 'switch':
        const listToCompare = players.filter((p) => p.id !== activePlayer.id);
        if (listToCompare.length > 0) {
          let closest = listToCompare[0];
          let closestDist = Math.abs(closest.position - activePlayer.position);

          listToCompare.forEach((p) => {
            const distance = Math.abs(p.position - activePlayer.position);
            if (distance < closestDist) {
              closestDist = distance;
              closest = p;
            }
          });

          const currentActivePos = activePlayer.position;
          const targetPos = closest.position;

          text = `Quantum-swapped coordinate values with ${closest.name}! Swapped positions: ${currentActivePos} ↔ ${targetPos}.`;
          addLog(activePlayer.name, activePlayer.color, text, 'effect');

          setPlayers((prev) =>
            prev.map((p) => {
              if (p.id === activePlayer.id) return { ...p, position: targetPos };
              if (p.id === closest.id) return { ...p, position: currentActivePos };
              return p;
            })
          );
          await new Promise((resolve) => setTimeout(resolve, 600));
        } else {
          addLog(activePlayer.name, activePlayer.color, 'Swap sequence failed: No neighboring endpoints.', 'system');
        }
        passTurn();
        break;

      default:
        passTurn();
        break;
    }

    setActiveCard(null);
  };

  // Main Dice Rolled Trigger
  const handleRollComplete = async (rollValue: number) => {
    if (gameState !== 'playing' || isMoving) return;

    const activePlayer = players[activePlayerIndex];
    let movementSpeed = rollValue;
    let actionDescription = `rolled a ${rollValue}`;

    // Apply Overclock overdrive (double roll)
    if (activePlayer.doubleRoll) {
      movementSpeed = rollValue * 2;
      actionDescription = `rolled a ${rollValue} • OVERDRIVE SPEED DOUBLED to ${movementSpeed}!`;
      // Clear multiplier in state immediately
      setPlayers((prev) =>
        prev.map((p) => (p.id === activePlayer.id ? { ...p, doubleRoll: false } : p))
      );
    }

    addLog(activePlayer.name, activePlayer.color, actionDescription, 'roll');

    let targetSquare = activePlayer.position;

    // Handle high-risk double edge odd check
    if (activePlayer.doubleEdgeActive) {
      setPlayers((prev) =>
        prev.map((p) => (p.id === activePlayer.id ? { ...p, doubleEdgeActive: false } : p))
      );

      if (rollValue % 2 !== 0) {
        targetSquare = Math.max(1, activePlayer.position - 3);
        addLog(
          activePlayer.name,
          activePlayer.color,
          `Double Edge feedback loop! Odd roll (${rollValue}) forced 3 steps backward! Target: ${targetSquare}`,
          'effect'
        );
      } else {
        targetSquare = activePlayer.position + movementSpeed;
        addLog(
          activePlayer.name,
          activePlayer.color,
          `Double Edge success! Even roll (${rollValue}) allowed safe movement.`,
          'effect'
        );
      }
    } else {
      targetSquare = activePlayer.position + movementSpeed;
    }

    // Bounce back from 100 rule
    if (targetSquare > 100) {
      const remainder = targetSquare - 100;
      targetSquare = 100 - remainder;
      addLog(
        activePlayer.name,
        activePlayer.color,
        `Core overload! Over-rolled past 100. Bounce feedback back ${remainder} nodes. Target: ${targetSquare}`,
        'roll'
      );
    }

    // Step-by-step movement slide sequence
    const finalSquare = await movePlayerStepByStep(activePlayer, targetSquare);

    // Evaluate the new square
    await evaluateLandingSquare(activePlayer, finalSquare);
  };

  const resetToSetup = () => {
    soundEngine.playClick();
    setGameState('setup');
  };

  // Display setup phase
  if (gameState === 'setup') {
    return <SetupScreen onStartGame={handleStartGame} />;
  }

  const activePlayer = players[activePlayerIndex];

  return (
    <div className="min-h-screen bg-[#06060e] text-slate-100 p-4 md:p-6 lg:p-8 relative select-none">
      {/* Background Neon Glow Rings */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.015)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.015)_1px,transparent_1px)] bg-[size:30px_30px] pointer-events-none opacity-50"></div>
      <div className="absolute top-1/4 -left-60 w-[500px] h-[500px] rounded-full bg-cyan-600/5 blur-[150px] pointer-events-none"></div>
      <div className="absolute bottom-1/4 -right-60 w-[500px] h-[500px] rounded-full bg-purple-600/5 blur-[150px] pointer-events-none"></div>

      <div className="max-w-7xl mx-auto flex flex-col gap-6 relative z-10">
        {/* Top Header Row */}
        <header className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-slate-900 pb-5 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-slate-950 border border-slate-800 rounded-xl">
              <Terminal className="w-5 h-5 text-cyan-400" />
            </div>
            <div>
              <h1 className="text-xl font-bold font-sans tracking-widest text-slate-100 bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-purple-400">
                CYBERGRID BOARD
              </h1>
              <p className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">
                PORTAL LINKED • LOCAL SQUAD SESSION
              </p>
            </div>
          </div>

          {/* Top Control Panel */}
          <div className="flex items-center gap-3">
            <button
              onClick={handleMuteToggle}
              className="p-2.5 bg-slate-950 border border-slate-900 hover:border-slate-800 rounded-xl transition text-slate-400 hover:text-white flex items-center justify-center cursor-pointer"
              title="Toggle Audio"
            >
              {isMuted ? <VolumeX className="w-4 h-4 text-red-500" /> : <Volume2 className="w-4 h-4 text-cyan-400" />}
            </button>

            <button
              onClick={resetToSetup}
              className="px-4 py-2 bg-slate-950 border border-slate-900 hover:border-slate-800 hover:text-white rounded-xl transition text-slate-400 font-mono text-xs flex items-center gap-2 cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5 text-pink-500" /> DISCONNECT
            </button>
          </div>
        </header>

        {/* Play Main Grid Board & Console */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* LEFT: Game Board Grid (Col span 7) */}
          <main className="lg:col-span-7 flex flex-col items-center">
            <GameBoard
              players={players}
              config={BOARD_CONFIG}
              activePlayerId={activePlayer?.id}
            />
          </main>

          {/* RIGHT: Active Turn & Terminal Data (Col span 5) */}
          <aside className="lg:col-span-5 flex flex-col gap-6">
            {/* Active Turn Controller Card */}
            <div className="p-6 rounded-2xl bg-[#0b0b1a]/95 border border-slate-800/85 shadow-lg backdrop-blur-xl relative overflow-hidden">
              {/* Highlight accent of active player */}
              <div
                className="absolute top-0 left-0 w-full h-1 transition-colors duration-500"
                style={{ backgroundColor: activePlayer?.color }}
              />

              <div className="flex items-center justify-between mb-5">
                <span className="text-[10px] font-mono uppercase tracking-widest text-slate-400">
                  SEQUENCE UPLINK
                </span>
                <span className="text-[10px] font-mono text-[#fffb00] px-2 py-0.5 rounded bg-[#fffb00]/10 border border-[#fffb00]/20 animate-pulse">
                  ONLINE
                </span>
              </div>

              {/* Active Name & Core */}
              <div className="flex items-center gap-4 mb-6">
                <div
                  className="w-12 h-12 rounded-2xl flex items-center justify-center border-2 transition-colors duration-500 relative shrink-0"
                  style={{
                    borderColor: activePlayer?.color,
                    backgroundColor: `${activePlayer?.color}1a`,
                    boxShadow: `0 0 15px ${activePlayer?.color}22`,
                  }}
                >
                  <Users className="w-5 h-5" style={{ color: activePlayer?.color }} />
                  {activePlayer?.hasShield && (
                    <div className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-[#39ff14] border border-black rounded-full flex items-center justify-center">
                      <Shield className="w-2.5 h-2.5 text-black" />
                    </div>
                  )}
                </div>

                <div className="overflow-hidden">
                  <h2
                    className="text-lg md:text-xl font-black font-sans tracking-wide uppercase truncate transition-colors duration-500"
                    style={{ color: activePlayer?.color }}
                  >
                    {activePlayer?.name}
                  </h2>
                  <p className="text-xs font-mono text-slate-400 mt-0.5">
                    Currently Syncing Node: <span className="text-slate-200 font-bold">{activePlayer?.position}</span>
                  </p>
                </div>
              </div>

              {/* Special buffs overlay tags */}
              {(activePlayer?.hasShield || activePlayer?.doubleRoll || activePlayer?.doubleEdgeActive) && (
                <div className="flex flex-wrap gap-2 mb-6">
                  {activePlayer.hasShield && (
                    <span className="px-2 py-0.5 rounded text-[8px] font-mono font-bold bg-[#39ff14]/15 border border-[#39ff14]/30 text-[#39ff14] flex items-center gap-1">
                      GRID SHIELD ACTIVE
                    </span>
                  )}
                  {activePlayer.doubleRoll && (
                    <span className="px-2 py-0.5 rounded text-[8px] font-mono font-bold bg-[#d346ff]/15 border border-[#d346ff]/30 text-[#d346ff] flex items-center gap-1">
                      OVERDRIVE ROLL ENABLED
                    </span>
                  )}
                  {activePlayer.doubleEdgeActive && (
                    <span className="px-2 py-0.5 rounded text-[8px] font-mono font-bold bg-[#fffb00]/15 border border-[#fffb00]/30 text-[#fffb00] flex items-center gap-1">
                      DOUBLE EDGE RISK PRIME
                    </span>
                  )}
                </div>
              )}

              {/* Rolling Device Interface */}
              <div className="bg-slate-950/55 rounded-xl border border-slate-900 p-4 flex items-center justify-around gap-4 shadow-inner">
                <CyberDice
                  onRollComplete={handleRollComplete}
                  disabled={isMoving}
                />
              </div>
            </div>

            {/* Leaderboard + Logs */}
            <LogPanel
              players={players}
              activePlayerId={activePlayer?.id}
              logs={logs}
              onMuteToggle={handleMuteToggle}
              isMuted={isMuted}
            />
          </aside>
        </div>
      </div>

      {/* Action Mystery Card Dialog overlay */}
      <MysteryCardModal
        card={activeCard}
        playerName={activePlayer?.name || ''}
        playerColor={activePlayer?.color || '#00f3ff'}
        isOpen={cardModalOpen}
        onClose={handleCloseCardModal}
      />

      {/* Celebratory Win Modal overlay */}
      {gameState === 'winner' && winner && (
        <WinScreen
          winner={winner}
          onRestart={() => handleStartGame(players.map((p) => ({ ...p, position: 1 })))}
          onExit={resetToSetup}
        />
      )}
    </div>
  );
}
