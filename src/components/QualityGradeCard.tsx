import React from 'react';
import { Gamepad2, Tv, Video, CloudUpload, Award, CheckCircle2, AlertTriangle, XCircle } from 'lucide-react';
import { TestResults } from '../types';

interface QualityGradeCardProps {
  results: TestResults | null;
}

export const QualityGradeCard: React.FC<QualityGradeCardProps> = ({ results }) => {
  if (!results) {
    return (
      <div className="bg-[#111114] border border-dim rounded-2xl p-6 shadow-xl text-center">
        <div className="flex items-center justify-center space-x-2 text-slate-400 text-sm font-semibold mb-2">
          <Award className="w-5 h-5 text-cyan-400" />
          <span className="font-bold text-white">網路品質與應用場景評級</span>
          <span className="text-[10px] text-slate-500 mono uppercase">Experience Rating</span>
        </div>
        <p className="text-xs text-slate-500 max-w-md mx-auto">
          請點擊「開始完整測速」以獲取針對線上遊戲、4K影音串流、視訊會議及雲端備份之體驗評級報告。
        </p>
      </div>
    );
  }

  const { ping, jitter, downloadSpeed, uploadSpeed, packetLoss } = results;

  // Grade calculations
  const getGamingGrade = () => {
    if (ping <= 20 && jitter <= 5 && packetLoss === 0) return { score: 'A+', label: '極致流暢 (Competitive Grade)', color: 'text-emerald-400', badge: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' };
    if (ping <= 45 && jitter <= 12) return { score: 'A', label: '順暢無延遲 (Smooth)', color: 'text-cyan-400', badge: 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20' };
    if (ping <= 80) return { score: 'B', label: '普通 (Playable)', color: 'text-amber-400', badge: 'bg-amber-500/10 text-amber-400 border border-amber-500/20' };
    return { score: 'C', label: '明顯卡頓 (High Lag)', color: 'text-rose-400', badge: 'bg-rose-500/10 text-rose-400 border border-rose-500/20' };
  };

  const getStreamingGrade = () => {
    if (downloadSpeed >= 100) return { score: '4K / 8K HDR', label: '秒開超高清串流', color: 'text-emerald-400', badge: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' };
    if (downloadSpeed >= 35) return { score: '4K Ultra HD', label: '流暢播放無緩衝', color: 'text-cyan-400', badge: 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20' };
    if (downloadSpeed >= 15) return { score: '1080p FHD', label: '標準高清畫質', color: 'text-amber-400', badge: 'bg-amber-500/10 text-amber-400 border border-amber-500/20' };
    return { score: '720p HD', label: '可能需緩衝載入', color: 'text-rose-400', badge: 'bg-rose-500/10 text-rose-400 border border-rose-500/20' };
  };

  const getMeetingGrade = () => {
    if (uploadSpeed >= 15 && ping <= 35 && jitter <= 10) return { score: '1080p 60fps', label: '水晶清晰多方視訊', color: 'text-emerald-400', badge: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' };
    if (uploadSpeed >= 5 && ping <= 60) return { score: '720p HD', label: '穩定語音與螢幕共享', color: 'text-cyan-400', badge: 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20' };
    return { score: 'SD 畫質', label: '可能有聲音雜訊或畫面延遲', color: 'text-amber-400', badge: 'bg-amber-500/10 text-amber-400 border border-amber-500/20' };
  };

  const getUploadGrade = () => {
    if (uploadSpeed >= 80) return { score: '極速雲端', label: '大型檔案秒傳', color: 'text-emerald-400', badge: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' };
    if (uploadSpeed >= 30) return { score: '高速傳輸', label: '快速備份相片與影片', color: 'text-cyan-400', badge: 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20' };
    return { score: '一般上傳', label: '文書傳輸足夠', color: 'text-slate-300', badge: 'bg-white/5 text-slate-300 border border-dim' };
  };

  const gaming = getGamingGrade();
  const streaming = getStreamingGrade();
  const meeting = getMeetingGrade();
  const uploadGrade = getUploadGrade();

  return (
    <div id="quality-grade-card" className="bg-[#111114] border border-dim rounded-2xl p-6 shadow-xl">
      <div className="flex items-center justify-between pb-4 border-b border-dim">
        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
            <Award className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-white tracking-wide flex items-center gap-2">
              生活與商務應用體驗評級
              <span className="text-[10px] text-slate-500 mono uppercase">Experience Rating</span>
            </h2>
          </div>
        </div>
        <span className="text-xs font-mono font-bold px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
          OVERALL: EXCELLENT
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 mt-5">
        {/* Gaming */}
        <div className="bg-white/[0.02] hover:bg-white/[0.04] p-4 rounded-xl border border-dim flex flex-col justify-between transition">
          <div>
            <div className="flex items-center justify-between">
              <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400">
                <Gamepad2 className="w-5 h-5" />
              </div>
              <span className={`text-xs font-mono font-bold px-2 py-0.5 rounded-full ${gaming.badge}`}>
                {gaming.score}
              </span>
            </div>
            <div className="text-sm font-bold text-white mt-3">線上連線遊戲</div>
            <div className="text-xs text-slate-400 mt-1">{gaming.label}</div>
          </div>
          <div className="mt-4 pt-3 border-t border-dim text-[11px] text-slate-500 font-mono">
            Ping: {ping}ms • Jitter: {jitter}ms
          </div>
        </div>

        {/* Video Streaming */}
        <div className="bg-white/[0.02] hover:bg-white/[0.04] p-4 rounded-xl border border-dim flex flex-col justify-between transition">
          <div>
            <div className="flex items-center justify-between">
              <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-400">
                <Tv className="w-5 h-5" />
              </div>
              <span className={`text-xs font-mono font-bold px-2 py-0.5 rounded-full ${streaming.badge}`}>
                {streaming.score}
              </span>
            </div>
            <div className="text-sm font-bold text-white mt-3">影音影集串流</div>
            <div className="text-xs text-slate-400 mt-1">{streaming.label}</div>
          </div>
          <div className="mt-4 pt-3 border-t border-dim text-[11px] text-slate-500 font-mono">
            Down: {downloadSpeed.toFixed(1)} Mbps
          </div>
        </div>

        {/* Video Conference */}
        <div className="bg-white/[0.02] hover:bg-white/[0.04] p-4 rounded-xl border border-dim flex flex-col justify-between transition">
          <div>
            <div className="flex items-center justify-between">
              <div className="p-2 rounded-lg bg-violet-500/10 text-violet-400">
                <Video className="w-5 h-5" />
              </div>
              <span className={`text-xs font-mono font-bold px-2 py-0.5 rounded-full ${meeting.badge}`}>
                {meeting.score}
              </span>
            </div>
            <div className="text-sm font-bold text-white mt-3">視訊會議 (Zoom/Teams)</div>
            <div className="text-xs text-slate-400 mt-1">{meeting.label}</div>
          </div>
          <div className="mt-4 pt-3 border-t border-dim text-[11px] text-slate-500 font-mono">
            Ping: {ping}ms • Up: {uploadSpeed.toFixed(1)}M
          </div>
        </div>

        {/* Cloud Upload */}
        <div className="bg-white/[0.02] hover:bg-white/[0.04] p-4 rounded-xl border border-dim flex flex-col justify-between transition">
          <div>
            <div className="flex items-center justify-between">
              <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
                <CloudUpload className="w-5 h-5" />
              </div>
              <span className={`text-xs font-mono font-bold px-2 py-0.5 rounded-full ${uploadGrade.badge}`}>
                {uploadGrade.score}
              </span>
            </div>
            <div className="text-sm font-bold text-white mt-3">雲端備份與檔案上傳</div>
            <div className="text-xs text-slate-400 mt-1">{uploadGrade.label}</div>
          </div>
          <div className="mt-4 pt-3 border-t border-dim text-[11px] text-slate-500 font-mono">
            Up: {uploadSpeed.toFixed(1)} Mbps
          </div>
        </div>
      </div>
    </div>
  );
};
