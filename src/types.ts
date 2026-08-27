export type TestState = 'idle' | 'ping' | 'download' | 'upload' | 'completed' | 'error';

export interface SpeedPoint {
  timestamp: number;
  speedMbps: number;
  type: 'download' | 'upload';
}

export interface NetworkInfo {
  ip: string;
  isp: string;
  org: string;
  city: string;
  country: string;
  countryCode: string;
  asn?: string;
  localIp?: string;
  connectionType: 'wifi' | 'cellular' | 'ethernet' | 'unknown';
  effectiveType?: string; // 4g, 3g, etc.
  downlinkEstimate?: number; // navigator.connection.downlink in Mbps
  rttEstimate?: number; // navigator.connection.rtt in ms
}

export interface TestResults {
  ping: number; // ms
  jitter: number; // ms
  minPing: number;
  maxPing: number;
  downloadSpeed: number; // Mbps
  uploadSpeed: number; // Mbps
  downloadPeak: number; // Mbps
  uploadPeak: number; // Mbps
  downloadBytes: number; // Bytes
  uploadBytes: number; // Bytes
  downloadDuration: number; // ms
  uploadDuration: number; // ms
  dnsLatency: number; // ms
  packetLoss: number; // percentage
  timestamp: number;
}

export interface SignalMetrics {
  type: 'wifi' | 'cellular';
  wifi: {
    ssid: string;
    rssiDbm: number; // e.g. -55 dBm
    linkSpeedMbps: number; // e.g. 866 Mbps
    frequencyMhz: number; // 2412, 5180, 5745, 6000
    band: '2.4 GHz' | '5 GHz' | '6 GHz' | 'Wi-Fi 6/6E';
    security: string;
    channel: number;
  };
  cellular: {
    generation: '5G' | '4G LTE' | '3G';
    carrier: string;
    rsrpDbm: number; // Reference Signal Received Power e.g. -85 dBm
    rsrqDb: number; // Reference Signal Received Quality e.g. -10 dB
    sinrDb: number; // Signal to Interference plus Noise Ratio e.g. 18 dB
    bars: number; // 0 to 5
    bandName: string;
  };
}

export interface RepoFile {
  path: string;
  name: string;
  type: 'file' | 'dir';
  language: string;
  content: string;
  description: string;
}
