import React from 'react';
import { SpeedPoint } from '../types';

interface LiveChartProps {
  dataPoints: SpeedPoint[];
  currentType: 'download' | 'upload' | 'idle';
}

export const LiveChart: React.FC<LiveChartProps> = ({ dataPoints }) => {
  if (dataPoints.length < 2) {
    return (
      <div className="w-full h-24 bg-[#111114] rounded-2xl border border-dim flex items-center justify-center text-xs text-slate-500 font-mono tracking-wider">
        THROUGHPUT WAVEFORM MONITOR (STANDBY)
      </div>
    );
  }

  const width = 600;
  const height = 90;
  const padding = 10;

  const maxSpeed = Math.max(...dataPoints.map((p) => p.speedMbps), 20);

  // Generate SVG path points
  const points = dataPoints.map((d, i) => {
    const x = padding + (i / (dataPoints.length - 1)) * (width - 2 * padding);
    const y = height - padding - (d.speedMbps / maxSpeed) * (height - 2 * padding);
    return { x, y, type: d.type };
  });

  const pathD = points.reduce((acc, p, i) => `${acc} ${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`, '');
  const areaD = `${pathD} L ${points[points.length - 1].x} ${height - padding} L ${points[0].x} ${height - padding} Z`;

  const lastPoint = dataPoints[dataPoints.length - 1];
  const isUpload = lastPoint?.type === 'upload';
  const strokeColor = isUpload ? '#8b5cf6' : '#06b6d4';
  const fillColor = isUpload ? 'url(#uploadAreaGrad)' : 'url(#downAreaGrad)';

  return (
    <div className="w-full bg-[#111114] rounded-2xl border border-dim p-4 shadow-xl">
      <div className="flex items-center justify-between text-[11px] font-semibold text-slate-400 mb-2">
        <span className="flex items-center space-x-2">
          <span
            className={`w-2 h-2 rounded-full animate-pulse ${
              isUpload ? 'bg-violet-500' : 'bg-cyan-500'
            }`}
          />
          <span className="mono uppercase tracking-widest text-slate-400 text-[10px]">Real-time Waveform</span>
        </span>
        <span className="font-mono text-xs text-cyan-400 font-bold">
          MAX: {maxSpeed.toFixed(1)} Mbps
        </span>
      </div>

      <div className="w-full h-20 overflow-hidden">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full preserve-3d">
          <defs>
            <linearGradient id="downAreaGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.35" />
              <stop offset="100%" stopColor="#06b6d4" stopOpacity="0.0" />
            </linearGradient>
            <linearGradient id="uploadAreaGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.35" />
              <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Grid lines */}
          <line x1={padding} y1={height / 2} x2={width - padding} y2={height / 2} stroke="rgba(255, 255, 255, 0.05)" strokeDasharray="3 3" strokeWidth="0.8" />
          <line x1={padding} y1={height - padding} x2={width - padding} y2={height - padding} stroke="rgba(255, 255, 255, 0.08)" strokeWidth="1" />

          {/* Area Fill */}
          <path d={areaD} fill={fillColor} />

          {/* Stroke Line */}
          <path d={pathD} fill="none" stroke={strokeColor} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />

          {/* Current pulse dot */}
          {points.length > 0 && (
            <circle
              cx={points[points.length - 1].x}
              cy={points[points.length - 1].y}
              r="4"
              fill="#ffffff"
              stroke={strokeColor}
              strokeWidth="2"
            />
          )}
        </svg>
      </div>
    </div>
  );
};
