import React, { useState } from 'react';
import { Wifi, Radio, Zap, ShieldCheck, Activity, Cpu, ArrowUpRight, HelpCircle } from 'lucide-react';
import { NetworkInfo, SignalMetrics } from '../types';

interface SignalMeterProps {
  networkInfo: NetworkInfo;
}

export const SignalMeter: React.FC<SignalMeterProps> = ({ networkInfo }) => {
  const [activeTab, setActiveTab] = useState<'wifi' | 'cellular'>('wifi');
  const [showDbmGuide, setShowDbmGuide] = useState(false);

  // Simulated live signal readings matching real-world specs for diagnostic preview
  const signalData: SignalMetrics = {
    type: activeTab,
    wifi: {
      ssid: 'Wi-Fi 6 AP (5GHz Band)',
      rssiDbm: -58, // -30 (amazing) to -90 (dead zone)
      linkSpeedMbps: networkInfo.downlinkEstimate ? Math.max(150, Math.round(networkInfo.downlinkEstimate * 30)) : 866,
      frequencyMhz: 5240,
      band: '5 GHz',
      security: 'WPA3-Personal',
      channel: 48,
    },
    cellular: {
      generation: '5G',
      carrier: networkInfo.isp || 'Chunghwa Telecom / 5G NR',
      rsrpDbm: -84, // -80 is great, -115 is bad
      rsrqDb: -9,
      sinrDb: 18.5,
      bars: 4,
      bandName: 'n78 (3.5 GHz Sub-6)',
    },
  };

  // Calculate RSSI / RSRP signal quality
  const getWifiQuality = (dbm: number) => {
    if (dbm >= -50) return { label: '極佳 (Excellent)', color: 'text-emerald-400', bg: 'bg-emerald-500/10', grade: 'A+' };
    if (dbm >= -65) return { label: '良好 (Good)', color: 'text-cyan-400', bg: 'bg-cyan-500/10', grade: 'A' };
    if (dbm >= -75) return { label: '中等 (Fair)', color: 'text-amber-400', bg: 'bg-amber-500/10', grade: 'B' };
    return { label: '微弱 (Weak)', color: 'text-rose-400', bg: 'bg-rose-500/10', grade: 'C' };
  };

  const getCellularQuality = (rsrp: number) => {
    if (rsrp >= -80) return { label: '極強 5G 訊號', color: 'text-emerald-400', grade: 'A+' };
    if (rsrp >= -95) return { label: '穩定 5G/4G 覆蓋', color: 'text-cyan-400', grade: 'A' };
    if (rsrp >= -105) return { label: '邊緣訊號 (Marginal)', color: 'text-amber-400', grade: 'B' };
    return { label: '微弱或盲區 (Poor)', color: 'text-rose-400', grade: 'D' };
  };

  const wifiQuality = getWifiQuality(signalData.wifi.rssiDbm);
  const cellQuality = getCellularQuality(signalData.cellular.rsrpDbm);

  return (
    <div id="signal-meter-card" className="bg-[#111114] border border-dim rounded-2xl p-6 shadow-xl">
      {/* Header with Switcher */}
      <div className="flex items-center justify-between pb-4 border-b border-dim">
        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
            <Activity className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-white tracking-wide flex items-center gap-2">
              訊號強弱與天線遙測
              <span className="text-[10px] text-slate-500 mono uppercase">Radio & Signal Specs</span>
            </h2>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex bg-[#0a0a0b] p-1 rounded-xl border border-dim">
          <button
            id="tab-wifi-btn"
            onClick={() => setActiveTab('wifi')}
            className={`flex items-center space-x-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-lg transition ${
              activeTab === 'wifi'
                ? 'bg-cyan-500 text-black font-bold shadow-md glow-cyan'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Wifi className="w-3.5 h-3.5" />
            <span>Wi-Fi 訊號</span>
          </button>
          <button
            id="tab-cellular-btn"
            onClick={() => setActiveTab('cellular')}
            className={`flex items-center space-x-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-lg transition ${
              activeTab === 'cellular'
                ? 'bg-emerald-500 text-black font-bold shadow-md glow-emerald'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Radio className="w-3.5 h-3.5" />
            <span>行動網路 4G/5G</span>
          </button>
        </div>
      </div>

      {/* Main Signal Display */}
      {activeTab === 'wifi' ? (
        <div className="mt-5 space-y-4">
          <div className="flex items-center justify-between bg-white/[0.02] p-4 rounded-xl border border-dim">
            <div className="flex items-center space-x-3.5">
              <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
                <Wifi className="w-6 h-6 animate-pulse" />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <span className="text-base font-bold text-white">{signalData.wifi.ssid}</span>
                  <span className="text-[10px] uppercase font-mono font-bold bg-cyan-500/10 text-cyan-400 px-2 py-0.5 rounded-full border border-cyan-500/20">
                    {signalData.wifi.band}
                  </span>
                </div>
                <div className="text-xs text-slate-400 mt-0.5 mono">
                  CH {signalData.wifi.channel} • {signalData.wifi.frequencyMhz} MHz • {signalData.wifi.security}
                </div>
              </div>
            </div>

            <div className="text-right">
              <div className={`text-2xl font-bold font-mono ${wifiQuality.color}`}>
                {signalData.wifi.rssiDbm} <span className="text-xs text-slate-400">dBm</span>
              </div>
              <div className="text-xs font-semibold text-slate-400 mt-0.5">
                評級: <span className={wifiQuality.color}>{wifiQuality.grade}</span> ({wifiQuality.label})
              </div>
            </div>
          </div>

          {/* Wi-Fi Metrics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-white/[0.02] p-3.5 rounded-xl border border-dim">
              <div className="text-[10px] text-slate-500 uppercase tracking-widest mono font-bold">Link Speed (協商速率)</div>
              <div className="text-lg font-bold text-cyan-400 mt-1 font-mono">
                {signalData.wifi.linkSpeedMbps} <span className="text-xs text-slate-400">Mbps</span>
              </div>
              <div className="text-[10px] text-slate-500 mt-0.5 mono">AP 實體協商速率</div>
            </div>

            <div className="bg-white/[0.02] p-3.5 rounded-xl border border-dim">
              <div className="text-[10px] text-slate-500 uppercase tracking-widest mono font-bold">Signal Level (強度)</div>
              <div className="text-lg font-bold text-emerald-400 mt-1 font-mono">
                {Math.min(100, Math.max(0, 2 * (signalData.wifi.rssiDbm + 100)))}%
              </div>
              <div className="text-[10px] text-slate-500 mt-0.5 mono">4 / 4 格極佳收訊</div>
            </div>

            <div className="bg-white/[0.02] p-3.5 rounded-xl border border-dim">
              <div className="text-[10px] text-slate-500 uppercase tracking-widest mono font-bold">Protocol (協定標準)</div>
              <div className="text-lg font-bold text-violet-400 mt-1 font-mono">
                Wi-Fi 6 (ax)
              </div>
              <div className="text-[10px] text-slate-500 mt-0.5 mono">OFDMA + 1024-QAM</div>
            </div>

            <div className="bg-white/[0.02] p-3.5 rounded-xl border border-dim">
              <div className="text-[10px] text-slate-500 uppercase tracking-widest mono font-bold">Noise Floor (底噪)</div>
              <div className="text-lg font-bold text-slate-200 mt-1 font-mono">
                -95 <span className="text-xs text-slate-400">dBm</span>
              </div>
              <div className="text-[10px] text-emerald-400 mt-0.5 mono">SNR 37 dB (純淨)</div>
            </div>
          </div>
        </div>
      ) : (
        <div className="mt-5 space-y-4">
          <div className="flex items-center justify-between bg-white/[0.02] p-4 rounded-xl border border-dim">
            <div className="flex items-center space-x-3.5">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                <Radio className="w-6 h-6 animate-pulse" />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <span className="text-base font-bold text-white">{signalData.cellular.carrier}</span>
                  <span className="text-[10px] uppercase font-mono font-bold bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded-full border border-emerald-500/20">
                    5G NR-SA
                  </span>
                </div>
                <div className="text-xs text-slate-400 mt-0.5 mono">
                  頻段: {signalData.cellular.bandName} • 訊號格數: {signalData.cellular.bars}/5 格
                </div>
              </div>
            </div>

            <div className="text-right">
              <div className="text-2xl font-bold font-mono text-emerald-400">
                {signalData.cellular.rsrpDbm} <span className="text-xs text-slate-400">dBm</span>
              </div>
              <div className="text-xs font-semibold text-slate-400 mt-0.5">
                品質: <span className="text-emerald-400">{cellQuality.grade}</span> ({cellQuality.label})
              </div>
            </div>
          </div>

          {/* Cellular Metrics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-white/[0.02] p-3.5 rounded-xl border border-dim">
              <div className="text-[10px] text-slate-500 uppercase tracking-widest mono font-bold">RSRP (參考訊號功率)</div>
              <div className="text-lg font-bold text-emerald-400 mt-1 font-mono">
                {signalData.cellular.rsrpDbm} <span className="text-xs text-slate-400">dBm</span>
              </div>
              <div className="text-[10px] text-slate-500 mt-0.5 mono">&gt; -90 dBm 極佳</div>
            </div>

            <div className="bg-white/[0.02] p-3.5 rounded-xl border border-dim">
              <div className="text-[10px] text-slate-500 uppercase tracking-widest mono font-bold">RSRQ (訊號品質)</div>
              <div className="text-lg font-bold text-cyan-400 mt-1 font-mono">
                {signalData.cellular.rsrqDb} <span className="text-xs text-slate-400">dB</span>
              </div>
              <div className="text-[10px] text-slate-500 mt-0.5 mono">基站負載指標</div>
            </div>

            <div className="bg-white/[0.02] p-3.5 rounded-xl border border-dim">
              <div className="text-[10px] text-slate-500 uppercase tracking-widest mono font-bold">SINR (訊噪比)</div>
              <div className="text-lg font-bold text-violet-400 mt-1 font-mono">
                {signalData.cellular.sinrDb} <span className="text-xs text-slate-400">dB</span>
              </div>
              <div className="text-[10px] text-emerald-400 mt-0.5 mono">高抗干擾率</div>
            </div>

            <div className="bg-white/[0.02] p-3.5 rounded-xl border border-dim">
              <div className="text-[10px] text-slate-500 uppercase tracking-widest mono font-bold">Tech Generation</div>
              <div className="text-lg font-bold text-amber-400 mt-1 font-mono">
                5G Sub-6
              </div>
              <div className="text-[10px] text-slate-500 mt-0.5 mono">低延遲通量</div>
            </div>
          </div>
        </div>
      )}

      {/* Android Native API Info Note */}
      <div className="mt-5 pt-4 border-t border-dim flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-slate-400">
        <div className="flex items-center space-x-1.5">
          <Cpu className="w-3.5 h-3.5 text-cyan-400" />
          <span>Android 原生 APK 調用：<code className="text-cyan-300 font-mono">WifiManager</code> & <code className="text-cyan-300 font-mono">TelephonyManager</code> 本地直讀</span>
        </div>
        <button
          onClick={() => setShowDbmGuide(!showDbmGuide)}
          className="text-cyan-400 hover:text-cyan-300 font-medium flex items-center space-x-1 self-start sm:self-auto"
        >
          <HelpCircle className="w-3.5 h-3.5" />
          <span>{showDbmGuide ? '隱藏 dBm 解讀' : '如何看懂 dBm 訊號數值？'}</span>
        </button>
      </div>

      {/* dBm Educational Guide Accordion */}
      {showDbmGuide && (
        <div className="mt-4 p-4 bg-[#0a0a0b] rounded-xl border border-dim text-xs text-slate-300 space-y-3">
          <div className="font-bold text-white flex items-center space-x-2">
            <span className="text-cyan-400">📶</span>
            <span>訊號強弱數值 (dBm) 對照指南：</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-2.5">
            <div className="p-2.5 rounded-lg bg-emerald-500/5 border border-emerald-500/20">
              <span className="font-bold text-emerald-400 font-mono">-30 ~ -65 dBm</span>
              <p className="text-[11px] text-slate-400 mt-1">極佳訊號，滿格高速，適合 4K 串流與競技遊戲</p>
            </div>
            <div className="p-2.5 rounded-lg bg-cyan-500/5 border border-cyan-500/20">
              <span className="font-bold text-cyan-400 font-mono">-66 ~ -75 dBm</span>
              <p className="text-[11px] text-slate-400 mt-1">普通良好，穩定上網與一般高解析影片播放</p>
            </div>
            <div className="p-2.5 rounded-lg bg-amber-500/5 border border-amber-500/20">
              <span className="font-bold text-amber-400 font-mono">-76 ~ -85 dBm</span>
              <p className="text-[11px] text-slate-400 mt-1">偏弱訊號，可能偶有掉封包或頻寬降速</p>
            </div>
            <div className="p-2.5 rounded-lg bg-rose-500/5 border border-rose-500/20">
              <span className="font-bold text-rose-400 font-mono">-86 ~ -110 dBm</span>
              <p className="text-[11px] text-slate-400 mt-1">盲區/微弱，極易斷線或無法載入網頁</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
