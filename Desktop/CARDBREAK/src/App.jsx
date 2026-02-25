
import { useState, useEffect, useRef } from "react";

const size = 5;

const syncToCloud = async (dataType, payload) => {
  const semanticCoordinates = {
    vector: btoa(JSON.stringify(payload)),
    entropy: Math.random().toFixed(4),
    predictionModel: "AIM3-v2-Predictor",
    hardwareSecure: true
  };
  console.log(`%c[NEURAL_SYNC] Compressed Semantic Coordinates to AIM3:`, "color: #00ffcc; font-weight: bold;", semanticCoordinates);
  return true;
};

function generateMold(cellCount) {
  const shape = new Set();
  let currentX = 2; let currentY = 2;
  shape.add(currentY * size + currentX);
  const directions = [[0, 1], [0, -1], [1, 0], [-1, 0]];
  while (shape.size < cellCount) {
    const [dx, dy] = directions[Math.floor(Math.random() * directions.length)];
    const nx = Math.max(0, Math.min(size - 1, currentX + dx));
    const ny = Math.max(0, Math.min(size - 1, currentY + dy));
    shape.add(ny * size + nx);
    currentX = nx; currentY = ny;
  }
  return [...shape];
}

export default function App() {
  const [view, setView] = useState("AUTH"); // AUTH, SPLASH, PERMISSIONS, GAME
  const [level, setLevel] = useState(1);
  const [cells, setCells] = useState(generateMold(3));
  const [player, setPlayer] = useState([]);
  const [isBreakthrough, setIsBreakthrough] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isMistake, setIsMistake] = useState(false);
  const [neuralGrowth, setNeuralGrowth] = useState(0);

  const [authed, setAuthed] = useState({ google: false, github: false, notion: false });
  const [voiceGranted, setVoiceGranted] = useState(false);
  const [gestureGranted, setGestureGranted] = useState(false);

  const [isDragging, setIsDragging] = useState(false);
  const [dragPos, setDragPos] = useState({ x: 0, y: 0 });
  const [hoverIdx, setHoverIdx] = useState(null);

  const audioRef = useRef(null);
  const containerRef = useRef(null);

  useEffect(() => {
    if (view === "AUTH" && authed.google && authed.github && authed.notion) {
      setTimeout(() => setView("SPLASH"), 800);
      syncToCloud("AUTH_SYNC_COMPLETE", { timestamp: Date.now(), growthSeed: 1.0 });
      setNeuralGrowth(10);
    }
  }, [authed, view]);

  useEffect(() => {
    if (view === "SPLASH") {
      const timer = setTimeout(() => setView("PERMISSIONS"), 3200);
      return () => clearTimeout(timer);
    }
  }, [view]);

  useEffect(() => {
    if (voiceGranted && gestureGranted) {
      setTimeout(() => {
        setView("GAME");
        syncToCloud("MINING_START", { timestamp: Date.now(), mode: "Amane" });
      }, 800);
    }
  }, [voiceGranted, gestureGranted]);

  useEffect(() => {
    if (view !== "GAME") return;
    for (let col = 0; col < size; col++) {
      for (let row = 0; row <= size - 3; row++) {
        const i1 = row * size + col;
        const i2 = (row + 1) * size + col;
        const i3 = (row + 2) * size + col;
        if (player.includes(i1) && player.includes(i2) && player.includes(i3)) {
          if (!isBreakthrough) {
            setIsBreakthrough(true);
            triggerResonance(2637.02);
            syncToCloud("AICE_BREAKTHROUGH", { level, column: col });
            setTimeout(() => setIsBreakthrough(false), 3000);
          }
        }
      }
    }
  }, [player, isBreakthrough, view]);

  useEffect(() => {
    if (cells.length > 0 && cells.every(c => player.includes(c))) {
      setIsSuccess(true);
      triggerResonance(880);
      const evolutionDelta = (player.length * level) / 10;
      setNeuralGrowth(prev => Math.min(prev + evolutionDelta, 100));
      syncToCloud("LEVEL_COMPLETE", { level, evolution: evolutionDelta });
      setTimeout(() => {
        const next = level + 1;
        setLevel(next);
        setCells(generateMold(Math.min(3 + next, 15)));
        setPlayer([]);
        setIsSuccess(false);
      }, 1000);
    }
  }, [player, cells, level]);

  const place = (i) => {
    if (i === null || player.includes(i)) return;
    if (cells.includes(i)) {
      setPlayer(p => [...p, i]);
      triggerResonance(440);
    } else {
      setIsMistake(true);
      triggerResonance(220);
      setTimeout(() => setIsMistake(false), 400);
    }
  };

  const triggerResonance = (freq) => {
    try {
      if (!audioRef.current) audioRef.current = new (window.AudioContext || window.webkitAudioContext)();
      const ctx = audioRef.current;
      if (ctx.state === 'suspended') ctx.resume();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0.04, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);
      osc.connect(gain); gain.connect(ctx.destination);
      osc.start(); osc.stop(ctx.currentTime + 0.4);
    } catch (e) { }
  };

  const updateDragPos = (e) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = (e.clientX || (e.touches && e.touches[0].clientX)) - rect.left;
    const y = (e.clientY || (e.touches && e.touches[0].clientY)) - rect.top;
    setDragPos({ x, y });

    const boardEl = document.querySelector('.board');
    if (!boardEl) return;
    const board = boardEl.getBoundingClientRect();
    const blX = (e.clientX || (e.touches && e.touches[0].clientX)) - board.left;
    const blY = (e.clientY || (e.touches && e.touches[0].clientY)) - board.top;

    if (blX >= 0 && blX < board.width && blY >= 0 && blY < board.height) {
      const col = Math.floor(blX / (board.width / size));
      const row = Math.floor(blY / (board.height / size));
      setHoverIdx(row * size + col);
    } else {
      setHoverIdx(null);
    }
  };

  if (view === "AUTH") {
    return (
      <div className="auth-container">
        <header className="neural-header">
          <div className="neural-version">Identity Sync</div>
        </header>
        <div className="auth-stack">
          <button className={`auth-btn ${authed.google ? 'linked' : ''}`} onClick={() => { setAuthed(a => ({ ...a, google: true })); triggerResonance(440); }}>
            <svg viewBox="0 0 24 24" fill="currentColor"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" /><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" /><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" /><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" /></svg>
            <span>Google</span>
          </button>
          <button className={`auth-btn ${authed.github ? 'linked' : ''}`} onClick={() => { setAuthed(a => ({ ...a, github: true })); triggerResonance(523); }}>
            <svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2A10 10 0 0 0 2 12c0 4.42 2.87 8.17 6.84 9.5.5.08.66-.23.66-.5v-1.69c-2.77.6-3.36-1.34-3.36-1.34-.46-1.16-1.11-1.47-1.11-1.47-.9-.62.07-.6.07-.6 1 .07 1.53 1.03 1.53 1.03.9 1.52 2.34 1.08 2.91.83.1-.65.35-1.09.63-1.34-2.22-.25-4.55-1.11-4.55-4.94 0-1.1.39-1.99 1.03-2.69-.1-.25-.45-1.29.1-2.64 0 0 .84-.27 2.75 1.02a9.58 9.58 0 0 1 5 0c1.91-1.3 2.75-1.02 2.75-1.02.55 1.35.2 2.39.1 2.64.64.7 1.03 1.6 1.03 2.69 0 3.84-2.34 4.68-4.57 4.93.36.31.68.92.68 1.85v2.74c0 .27.16.59.67.5C19.14 20.16 22 16.42 22 12A10 10 0 0 0 12 2z" /></svg>
            <span>GitHub</span>
          </button>
          <button className={`auth-btn ${authed.notion ? 'linked' : ''}`} onClick={() => { setAuthed(a => ({ ...a, notion: true })); triggerResonance(659); }}>
            <svg viewBox="0 0 24 24" fill="currentColor"><path d="M4.459 4.208c.673-.51 1.73-.611 2.502-.611h11.235c.703 0 1.237.13 1.64.385.405.253.64.629.64 1.127v14.471c0 .498-.235.874-.64 1.127-.403.254-.937.385-1.64.385H6.961c-.772 0-1.829-.1-2.502-.611-.676-.513-.883-1.403-.883-2.29V6.498c0-.887.207-1.777.883-2.29zm2.469 13.911V6.37l-.004-.035c-.012-.047-.024-.094-.033-.142-.016-.086-.145-.142-.231-.142-.044 0-.083.015-.119.043-.035.027-.06.064-.078.106-.017.042-.023.088-.023.136v11.758c0 .121.054.237.147.311.096.077.25.093.36.035.051-.027.094-.067.126-.118l.732-1.125h9.11l.732 1.125c.032.051.075.091.126.118.11.058.264.042.36-.035.093-.074.147-.19.147-.311V6.48c0-.048-.006-.094-.023-.136-.018-.042-.043-.079-.078-.106a.238.238 0 0 0-.119-.043c-.086 0-.215.056-.231.142-.009.048-.021.095-.033.142l-.004.035v11.749H6.928zM8.736 8.355h1.22l2.977 4.673V8.355h1.258v7.29h-1.13L9.993 10.82v4.825h-1.257V8.355z" /></svg>
            <span>Notion</span>
          </button>
        </div>
      </div>
    );
  }

  if (view === "SPLASH") {
    return <div className="splash-container"><h1 className="neural-title" style={{ fontSize: '3.5rem' }}>CARDBREAK</h1></div>;
  }

  if (view === "PERMISSIONS") {
    return (
      <div className="permission-container">
        <header className="neural-header">
          <h1 className="neural-title">CARDBREAK</h1>
          <div className="neural-version">NEURAL INTERFACE V1.0</div>
        </header>
        <div className="permission-stack">
          <button className={`neural-btn ${voiceGranted ? 'granted' : ''}`} onClick={() => { setVoiceGranted(true); triggerResonance(440); }}>
            <svg style={{ width: '24px', height: '24px' }} viewBox="0 0 24 24" fill="currentColor"><path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z" /><path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z" /></svg>
            <span>CONNECT VOICE CONTROL</span>
          </button>
          <button className={`neural-btn ${gestureGranted ? 'granted' : ''}`} onClick={() => { setGestureGranted(true); triggerResonance(523); }}>
            <svg style={{ width: '24px', height: '24px' }} viewBox="0 0 24 24" fill="currentColor"><path d="M17 10.5V7c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h12c.55 0 1-.45 1-1v-3.5l4 4v-11l-4 4z" /></svg>
            <span>ENABLE GESTURES</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="game-wrapper" ref={containerRef} onPointerMove={(e) => isDragging && updateDragPos(e)} onPointerUp={() => { if (isDragging) { place(hoverIdx); setIsDragging(false); setHoverIdx(null); } }}>
      {isDragging && <div className="active-drag-card" style={{ left: dragPos.x - 30, top: dragPos.y - 35 }} />}

      <header className="game-header">
        <div className="logo-text">CARDBREAK</div>
        <div className="mold-label">TARGET MOLD</div>
        <div className="level-stats">
          <span className="level-label">LEVEL</span>
          <div className="level-value">{level}</div>
        </div>
      </header>

      <div className="preview-container">
        {(() => {
          const minX = Math.min(...cells.map(i => i % size));
          const minY = Math.min(...cells.map(i => Math.floor(i / size)));
          const normalized = cells.map(i => ({ x: (i % size) - minX, y: Math.floor(i / size) - minY }));
          return (
            <div className="mini-grid">
              {Array.from({ length: 9 }).map((_, i) => {
                const x = i % 3; const y = Math.floor(i / 3);
                const active = normalized.some(n => n.x === x && n.y === y);
                return <div key={i} className={`mini-cell ${active ? 'active' : ''}`} />;
              })}
            </div>
          );
        })()}
      </div>

      <main className="grid-container">
        <div className={`board ${isSuccess ? 'success-flash' : ''} ${isMistake ? 'shake-gentle' : ''}`}>
          {Array.from({ length: size * size }).map((_, i) => (
            <div key={i} className={`board-cell ${cells.includes(i) ? 'target-hint' : ''} ${hoverIdx === i ? 'hover-target' : ''}`}>
              {player.includes(i) && <div className="card-placed" />}
            </div>
          ))}
        </div>
      </main>

      <footer className="next-area">
        <div className="card-stack" onPointerDown={(e) => { setIsDragging(true); updateDragPos(e); }} style={{ visibility: isDragging ? 'hidden' : 'visible' }} />
        <div className="next-label">NEXT CARD</div>
      </footer>
    </div>
  );
}
