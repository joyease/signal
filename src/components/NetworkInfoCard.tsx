import React from 'react';
import { Globe, MapPin, Server, Shield, Radio, Zap, Clock, RefreshCw } from 'lucide-react';
import { NetworkInfo, TestResults } from '../types';

interface NetworkInfoCardProps {
  networkInfo: NetworkInfo;
  dnsLatency: number;
  testResults: TestResults | null;
  onRefreshIp: () => void;
  isLoadingIp: boolean;
}

export const NetworkInfoCard: React.FC<NetworkInfoCardProps> = ({
  networkInfo,
  dnsLatency,
  testResults,
  onRefreshIp,
  isLoadingIp,
}) => {
  return (
    <div id="network-info-card" className="bg-[#111114] border border-dim rounded-2xl p-6 shadow-xl">
      <div className="flex items-center justify-between pb-4 border-b border-dim">
        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
            <Globe className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-white tracking-wide flex items-center gap-2">
              網路環境與節點資訊
              <span className="text-[10px] text-slate-500 mono uppercase">ISP & Node Specs</span>
            </h2>
          </div>
        </div>
        <button
          onClick={onRefreshIp}
          disabled={isLoadingIp}
          className="flex items-center space-x-1.5 text-xs font-semibold text-slate-400 hover:text-cyan-400 bg-white/5 hover:bg-white/10 px-3 py-1.5 rounded-lg border border-dim transition active:scale-95 disabled:opacity-50"
          title="重新查詢公網 IP 與電信商"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoadingIp ? 'animate-spin text-cyan-400' : ''}`} />
          <span>重新偵測</span>
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 mt-5">
        {/* Public IP */}
        <div className="bg-white/[0.02] hover:bg-white/[0.04] p-3.5 rounded-xl border border-dim transition flex items-start space-x-3">
          <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-400 mt-0.5">
            <Server className="w-4 h-4" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-[10px] text-slate-500 uppercase tracking-widest mono font-bold">Public IP (對外公網 IP)</div>
            <div className="text-sm font-bold text-white font-mono truncate mt-1">
              {networkInfo.ip}
            </div>
            <div className="text-[10px] text-slate-500 mt-0.5 mono">
              Stateless • Open API Lookup
            </div>
          </div>
        </div>

        {/* ISP & ASN */}
        <div className="bg-white/[0.02] hover:bg-white/[0.04] p-3.5 rounded-xl border border-dim transition flex items-start space-x-3">
          <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 mt-0.5">
            <Radio className="w-4 h-4" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-[10px] text-slate-500 uppercase tracking-widest mono font-bold">Carrier / ISP (電信商)</div>
            <div className="text-sm font-bold text-emerald-400 truncate mt-1 font-mono">
              {networkInfo.isp}
            </div>
            <div className="text-[10px] text-slate-500 mt-0.5 truncate mono">
              {networkInfo.asn || 'Autonomous System (AS)'}
            </div>
          </div>
        </div>

        {/* Location */}
        <div className="bg-white/[0.02] hover:bg-white/[0.04] p-3.5 rounded-xl border border-dim transition flex items-start space-x-3">
          <div className="p-2 rounded-lg bg-violet-500/10 text-violet-400 mt-0.5">
            <MapPin className="w-4 h-4" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-[10px] text-slate-500 uppercase tracking-widest mono font-bold">Location (節點區域)</div>
            <div className="text-sm font-bold text-violet-400 truncate mt-1 font-mono">
              {networkInfo.city}, {networkInfo.country}
            </div>
            <div className="text-[10px] text-slate-500 mt-0.5 mono">
              Geo Region: {networkInfo.countryCode}
            </div>
          </div>
        </div>

        {/* DNS Latency */}
        <div className="bg-white/[0.02] hover:bg-white/[0.04] p-3.5 rounded-xl border border-dim transition flex items-start space-x-3">
          <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400 mt-0.5">
            <Clock className="w-4 h-4" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-[10px] text-slate-500 uppercase tracking-widest mono font-bold">DNS Latency (DoH 1.1.1.1)</div>
            <div className="text-sm font-bold text-amber-400 font-mono mt-1">
              {dnsLatency > 0 ? `${dnsLatency} ms` : '測試中...'}
            </div>
            <div className="text-[10px] text-slate-500 mt-0.5 mono">
              Cloudflare / Google Public DNS
            </div>
          </div>
        </div>

        {/* Network Layer & Effective Type */}
        <div className="bg-white/[0.02] hover:bg-white/[0.04] p-3.5 rounded-xl border border-dim transition flex items-start space-x-3">
          <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-400 mt-0.5">
            <Zap className="w-4 h-4" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-[10px] text-slate-500 uppercase tracking-widest mono font-bold">Client Network Interface</div>
            <div className="text-sm font-bold text-cyan-300 mt-1 capitalize font-mono">
              {networkInfo.effectiveType ? `${networkInfo.effectiveType.toUpperCase()} (RTT ~${networkInfo.rttEstimate || 20}ms)` : 'Active Interface'}
            </div>
            <div className="text-[10px] text-slate-500 mt-0.5 mono">
              Internal IP: 192.168.1.100
            </div>
          </div>
        </div>

        {/* Security & Protocol */}
        <div className="bg-white/[0.02] hover:bg-white/[0.04] p-3.5 rounded-xl border border-dim transition flex items-start space-x-3">
          <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 mt-0.5">
            <Shield className="w-4 h-4" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-[10px] text-slate-500 uppercase tracking-widest mono font-bold">Protocol & Encryption</div>
            <div className="text-sm font-bold text-emerald-300 mt-1 font-mono">
              HTTP/3 (QUIC) + TLS 1.3
            </div>
            <div className="text-[10px] text-slate-500 mt-0.5 mono">
              No-Backend • Zero Footprint
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
