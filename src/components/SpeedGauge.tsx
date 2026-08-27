import React from 'react';
import { TestState } from '../types';

interface SpeedGaugeProps {
  currentSpeed: number; // in Mbps
  peakSpeed: number;
  testState: TestState;
  progressPercent?: number;
}

export const SpeedGauge: React.FC<SpeedGaugeProps> = ({
  currentSpeed,
  peakSpeed,
  testState,
}) => {
  // Map speed from 0 - 1000 Mbps to angle in degrees (-120 to +120, total 240 degrees)
  const getAngle = (speed: number): number => {
    if (speed <= 0) return -120;
    // Logarithmic scale so lower speeds (<50 Mbps) have good visibility, but can scale up to 1000 Mbps
    // 0 -> -120 deg, 10 -> -60 deg, 50 -> 0 deg, 200 -> 60 deg, 1000 -> 120 deg
    let normalized = 0;
    if (speed < 10) {
      normalized = (speed / 10) * 0.25;
    } else if (speed < 100) {
      normalized = 0.25 + ((speed - 10) / 90) * 0.35;
    } else if (speed < 500) {
      normalized = 0.6 + ((speed - 100) / 400) * 0.25;
    } else {
      normalized = 0.85 + (Math.min(speed - 500, 500) / 500) * 0.15;
    }
    return -120 + normalized * 240;
  };

  const angle = getAngle(currentSpeed);

  // Pick color theme based on stage
  const getPhaseColor = () => {
    switch (testState) {
      case 'ping':
        return { text: 'text-amber-400', stroke: '#f59e0b', glow: 'rgba(245, 158, 11, 0.35)' };
      case 'download':
        return { text: 'text-cyan-400', stroke: '#06b6d4', glow: 'rgba(6, 182, 212, 0.4)' };
      case 'upload':
        return { text: 'text-violet-400', stroke: '#8b5cf6', glow: 'rgba(139, 92, 246, 0.4)' };
      case 'completed':
        return { text: 'text-emerald-400', stroke: '#10b981', glow: 'rgba(16, 185, 129, 0.35)' };
      default:
        return { text: 'text-cyan-400', stroke: '#06b6d4', glow: 'rgba(6, 182, 212, 0.2)' };
    }
  };

  const colors = getPhaseColor();

  // Tick marks along the arc (-120 to +120)
  const ticks = [
    { label: '0', val: 0, ang: -120 },
    { label: '5', val: 5, ang: -90 },
    { label: '25', val: 25, ang: -50 },
    { label: '50', val: 50, ang: -15 },
    { label: '100', val: 100, ang: 24 },
    { label: '250', val: 250, ang: 58 },
    { label: '500', val: 500, ang: 88 },
    { label: '1000', val: 1000, ang: 120 },
  ];

  return (
    <div id="speedometer-container" className="relative flex flex-col items-center justify-center p-4">
      {/* SVG Radial Gauge */}
      <div className="relative w-72 h-72 md:w-84 md:h-84 flex items-center justify-center">
        <svg
          viewBox="0 0 300 300"
          className="w-full h-full transform transition-all duration-300 drop-shadow-2xl"
          style={{ filter: `drop-shadow(0 0 24px ${colors.glow})` }}
        >
          <defs>
            <linearGradient id="gaugeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#06b6d4" />
              <stop offset="50%" stopColor="#10b981" />
              <stop offset="100%" stopColor="#8b5cf6" />
            </linearGradient>
          </defs>

          {/* Background Track Arc */}
          <path
            d="M 60 220 A 110 110 0 1 1 240 220"
            fill="none"
            stroke="rgba(255, 255, 255, 0.06)"
            strokeWidth="14"
            strokeLinecap="round"
          />

          {/* Active Colored Arc */}
          <path
            d="M 60 220 A 110 110 0 1 1 240 220"
            fill="none"
            stroke="url(#gaugeGradient)"
            strokeWidth="14"
            strokeLinecap="round"
            strokeDasharray="540"
            strokeDashoffset={Math.max(0, 540 - ((angle + 120) / 240) * 540)}
            className="transition-all duration-150 ease-out"
          />

          {/* Ticks & Labels */}
          {ticks.map((t, idx) => {
            const rad = ((t.ang - 90) * Math.PI) / 180;
            const x1 = 150 + 118 * Math.cos(rad);
            const y1 = 150 + 118 * Math.sin(rad);
            const x2 = 150 + 128 * Math.cos(rad);
            const y2 = 150 + 128 * Math.sin(rad);
            const tx = 150 + 138 * Math.cos(rad);
            const ty = 150 + 138 * Math.sin(rad) + 3;

            return (
              <g key={idx}>
                <line x1={x1} y1={y1} x2={x2} y2={y2} stroke="rgba(255, 255, 255, 0.15)" strokeWidth="1.5" strokeLinecap="round" />
                <text
                  x={tx}
                  y={ty}
                  fill="#64748b"
                  fontSize="9"
                  fontWeight="600"
                  textAnchor="middle"
                  className="font-mono select-none"
                >
                  {t.label}
                </text>
              </g>
            );
          })}

          {/* Rotating Needle */}
          <g
            transform={`rotate(${angle}, 150, 150)`}
            className="transition-transform duration-100 ease-out"
          >
            {/* Needle line */}
            <line
              x1="150"
              y1="150"
              x2="150"
              y2="52"
              stroke={colors.stroke}
              strokeWidth="3"
              strokeLinecap="round"
            />
            {/* Pointer glow arrow */}
            <circle cx="150" cy="52" r="3" fill="#ffffff" />
          </g>

          {/* Center Hub */}
          <circle cx="150" cy="150" r="14" fill="#0a0a0b" stroke="rgba(255, 255, 255, 0.15)" strokeWidth="2" />
          <circle cx="150" cy="150" r="6" fill={colors.stroke} />
        </svg>

        {/* Center Digital Readout */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pt-8 pointer-events-none">
          <div className="text-[11px] uppercase font-bold tracking-[0.2em] text-slate-500 mb-0.5 mono">
            {testState === 'download' && 'DOWNLINK SPEED'}
            {testState === 'upload' && 'UPLINK SPEED'}
            {testState === 'ping' && 'TESTING LATENCY'}
            {testState === 'completed' && 'DIAGNOSTIC COMPLETE'}
            {testState === 'idle' && 'READY TO TEST'}
            {testState === 'error' && 'CONNECTION TIMEOUT'}
          </div>

          <div
            id="current-speed-display"
            className="text-5xl md:text-6xl font-black tracking-tighter text-white tabular-nums"
          >
            {testState === 'ping' ? '--' : currentSpeed.toFixed(1)}
          </div>

          <div className="text-xs font-mono font-bold text-cyan-500 tracking-widest uppercase mt-0.5">
            Mbps
          </div>

          {peakSpeed > 0 && (
            <div className="mt-2 text-[10px] font-mono text-slate-400 bg-white/[0.04] px-2.5 py-0.5 rounded-full border border-dim">
              PEAK: <span className="text-cyan-400 font-bold">{peakSpeed.toFixed(1)}</span> Mbps
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
