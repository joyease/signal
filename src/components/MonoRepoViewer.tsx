import React, { useState } from 'react';
import {
  FolderTree,
  FileCode,
  Download,
  Copy,
  Check,
  GitBranch,
  PlayCircle,
  ExternalLink,
  Smartphone,
  Globe,
  Layers,
  Terminal,
  ChevronRight,
  Sparkles,
  Github,
  CheckCircle2,
  FolderGit2,
} from 'lucide-react';
import JSZip from 'jszip';
import { MONO_REPO_FILES } from '../data/repoTemplates';
import { RepoFile } from '../types';

export const MonoRepoViewer: React.FC<{ onOpenGithubSync?: () => void }> = ({ onOpenGithubSync }) => {
  const [selectedFile, setSelectedFile] = useState<RepoFile>(MONO_REPO_FILES[0]);
  const [copied, setCopied] = useState(false);
  const [isZipping, setIsZipping] = useState(false);
  const [zipSuccess, setZipSuccess] = useState(false);
  const [activeTab, setActiveTab] = useState<'files' | 'workflow' | 'guide' | 'github'>('files');
  const [githubUser, setGithubUser] = useState('YOUR_GITHUB_USERNAME');
  const [repoName, setRepoName] = useState('net-diagnostic-pro');
  const [copiedCmd, setCopiedCmd] = useState<string | null>(null);

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCmd(id);
    setTimeout(() => setCopiedCmd(null), 2000);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(selectedFile.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadZip = async () => {
    setIsZipping(true);
    try {
      const zip = new JSZip();

      // Add all mono-repo files into zip preserving structure
      MONO_REPO_FILES.forEach((f) => {
        zip.file(f.path, f.content);
      });

      // Add empty gradle wrapper placeholder script
      zip.file(
        'gradlew',
        `#!/usr/bin/env sh
exec ./gradle/wrapper/gradle-wrapper.jar "$@"
`
      );

      const blob = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'NetDiagnostic-MonoRepo.zip';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      setZipSuccess(true);
      setTimeout(() => setZipSuccess(false), 3000);
    } catch (err) {
      console.error('Failed to generate ZIP', err);
    } finally {
      setIsZipping(false);
    }
  };

  return (
    <div id="monorepo-explorer" className="bg-[#111114] border border-dim rounded-2xl shadow-xl overflow-hidden">
      {/* Top Header */}
      <div className="p-6 border-b border-dim bg-[#0a0a0b]/40 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
              <FolderTree className="w-4 h-4" />
            </div>
            <h2 className="text-base font-bold text-white tracking-wide">
              Mono-Repo 原始碼結構與 GitHub CI/CD 配置
            </h2>
            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              Android + Web 同步發布
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1.5 mono">
            免自建後台 (Client-Side Only) • GitHub Actions 自動編譯 APK • GitHub Pages 自動託管網頁測速
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center space-x-3">
          {onOpenGithubSync && (
            <button
              onClick={onOpenGithubSync}
              className="flex items-center space-x-2 bg-white/10 hover:bg-white/20 text-white text-xs font-bold px-4 py-2.5 rounded-xl border border-dim transition active:scale-95"
            >
              <Github className="w-4 h-4 text-cyan-400" />
              <span>同步至 GitHub (教學與指令)</span>
            </button>
          )}
          <button
            onClick={handleDownloadZip}
            disabled={isZipping}
            className="flex items-center space-x-2 bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-bold px-4 py-2.5 rounded-xl shadow-lg glow-emerald transition active:scale-95 disabled:opacity-50"
          >
            <Download className={`w-4 h-4 ${isZipping ? 'animate-bounce' : ''}`} />
            <span>{isZipping ? '打包中...' : zipSuccess ? '已下載 ZIP！' : '下載完整 Mono-Repo (.ZIP)'}</span>
          </button>
        </div>
      </div>

      {/* Nav Tabs */}
      <div className="flex border-b border-dim bg-[#0a0a0b]/60 px-6 gap-2 overflow-x-auto scrollbar-none">
        <button
          onClick={() => setActiveTab('files')}
          className={`flex items-center space-x-2 py-3.5 px-3 text-xs font-bold border-b-2 transition whitespace-nowrap ${
            activeTab === 'files'
              ? 'border-cyan-400 text-cyan-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <FileCode className="w-4 h-4" />
          <span>檔案清單與代碼預覽 ({MONO_REPO_FILES.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('github')}
          className={`flex items-center space-x-2 py-3.5 px-3 text-xs font-bold border-b-2 transition whitespace-nowrap ${
            activeTab === 'github'
              ? 'border-cyan-400 text-cyan-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Github className="w-4 h-4 text-emerald-400" />
          <span>同步 GitHub & 雙發布指南</span>
        </button>

        <button
          onClick={() => setActiveTab('workflow')}
          className={`flex items-center space-x-2 py-3.5 px-3 text-xs font-bold border-b-2 transition whitespace-nowrap ${
            activeTab === 'workflow'
              ? 'border-cyan-400 text-cyan-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <GitBranch className="w-4 h-4" />
          <span>雙軌並行運作流程 (Actions + Pages)</span>
        </button>

        <button
          onClick={() => setActiveTab('guide')}
          className={`flex items-center space-x-2 py-3.5 px-3 text-xs font-bold border-b-2 transition whitespace-nowrap ${
            activeTab === 'guide'
              ? 'border-cyan-400 text-cyan-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>免後台技術原理解析</span>
        </button>
      </div>

      {/* Tab 1: File Tree & Code Preview */}
      {activeTab === 'files' && (
        <div className="grid grid-cols-1 md:grid-cols-12 min-h-[460px]">
          {/* File List Tree Sidebar */}
          <div className="md:col-span-4 border-r border-dim bg-[#0a0a0b]/30 p-3 space-y-1 overflow-y-auto max-h-[520px]">
            <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mono px-2 py-1.5 flex items-center justify-between">
              <span>專案目錄檔案</span>
              <span className="font-mono text-[10px] text-slate-500">Mono-Repo</span>
            </div>

            {MONO_REPO_FILES.map((file) => {
              const isSelected = selectedFile.path === file.path;
              const isAndroid = file.path.startsWith('app/');
              const isWorkflow = file.path.includes('.github');
              const isWeb = file.path.startsWith('docs/');

              return (
                <button
                  key={file.path}
                  onClick={() => setSelectedFile(file)}
                  className={`w-full text-left px-3 py-2 rounded-xl text-xs flex items-center justify-between transition ${
                    isSelected
                      ? 'bg-cyan-500/10 text-cyan-300 font-semibold border border-cyan-500/30'
                      : 'text-slate-300 hover:bg-white/[0.04] hover:text-white border border-transparent'
                  }`}
                >
                  <div className="flex items-center space-x-2 truncate">
                    {isWorkflow && <GitBranch className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />}
                    {isAndroid && <Smartphone className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />}
                    {isWeb && <Globe className="w-3.5 h-3.5 text-cyan-400 flex-shrink-0" />}
                    {!isWorkflow && !isAndroid && !isWeb && <FileCode className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />}
                    <span className="truncate font-mono">{file.path}</span>
                  </div>
                  <ChevronRight className={`w-3.5 h-3.5 text-slate-500 ${isSelected ? 'opacity-100 text-cyan-400' : 'opacity-0'}`} />
                </button>
              );
            })}
          </div>

          {/* Code Viewer */}
          <div className="md:col-span-8 flex flex-col bg-[#0a0a0b]/80">
            {/* Viewer Header */}
            <div className="px-4 py-3 bg-[#111114] border-b border-dim flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className="text-xs font-mono font-bold text-white">{selectedFile.path}</span>
                <span className="text-[10px] font-mono uppercase bg-white/5 text-slate-300 px-2 py-0.5 rounded border border-dim">
                  {selectedFile.language}
                </span>
              </div>

              <button
                onClick={handleCopy}
                className="flex items-center space-x-1.5 text-xs text-slate-300 hover:text-white bg-white/5 hover:bg-white/10 px-3 py-1.5 rounded-lg border border-dim transition active:scale-95"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? '已複製！' : '複製代碼'}</span>
              </button>
            </div>

            {/* Description Bar */}
            <div className="px-4 py-2.5 bg-white/[0.01] border-b border-dim text-xs text-slate-400 flex items-center space-x-2 mono">
              <Sparkles className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
              <span>{selectedFile.description}</span>
            </div>

            {/* Code Body */}
            <div className="p-4 overflow-x-auto overflow-y-auto max-h-[440px] font-mono text-xs text-slate-200 leading-relaxed">
              <pre>
                <code>{selectedFile.content}</code>
              </pre>
            </div>
          </div>
        </div>
      )}

      {/* Tab: GitHub Sync & Dual Release Guide */}
      {activeTab === 'github' && (
        <div className="p-6 space-y-6 text-xs text-slate-300">
          {/* Dual Output Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-5 rounded-2xl bg-[#0a0a0b]/80 border border-cyan-500/20">
              <div className="flex items-center space-x-2 text-cyan-400 font-bold mb-2">
                <Globe className="w-4 h-4" />
                <span className="text-sm">1. 網頁版 (Web SpeedTest)</span>
              </div>
              <p className="text-slate-400 leading-relaxed mb-3">
                利用 GitHub Pages 託管 <code>docs/index.html</code>，免建後台伺服器，任何設備打開網址即可測速。
              </p>
              <div className="p-2.5 bg-black/40 rounded-xl border border-dim font-mono text-[11px] text-cyan-300 break-all">
                https://{githubUser.toLowerCase()}.github.io/{repoName}/
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-[#0a0a0b]/80 border border-emerald-500/20">
              <div className="flex items-center space-x-2 text-emerald-400 font-bold mb-2">
                <Smartphone className="w-4 h-4" />
                <span className="text-sm">2. Android 原生 APK 下載</span>
              </div>
              <p className="text-slate-400 leading-relaxed mb-3">
                利用 GitHub Actions CI/CD 在雲端自動執行 Gradle 編譯，自動上傳 <code>app-debug.apk</code> 並產生 Release！
              </p>
              <div className="p-2.5 bg-black/40 rounded-xl border border-dim font-mono text-[11px] text-emerald-300 break-all">
                https://github.com/{githubUser}/{repoName}/releases
              </div>
            </div>
          </div>

          {/* Config Input Form */}
          <div className="p-5 bg-[#0a0a0b]/70 rounded-2xl border border-dim space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2 text-white font-bold text-sm">
                <FolderGit2 className="w-4 h-4 text-cyan-400" />
                <span>自訂 GitHub Repository 資訊（即時生成 Git 指令）</span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-mono text-slate-400 mb-1">
                  GitHub 帳號 (Username)
                </label>
                <input
                  type="text"
                  value={githubUser}
                  onChange={(e) => setGithubUser(e.target.value.trim() || 'YOUR_GITHUB_USERNAME')}
                  className="w-full bg-[#111114] border border-dim rounded-xl px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-cyan-500"
                  placeholder="如: hermanntalk"
                />
              </div>
              <div>
                <label className="block text-[11px] font-mono text-slate-400 mb-1">
                  Repository 倉庫名稱
                </label>
                <input
                  type="text"
                  value={repoName}
                  onChange={(e) => setRepoName(e.target.value.trim() || 'net-diagnostic-pro')}
                  className="w-full bg-[#111114] border border-dim rounded-xl px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-cyan-500"
                  placeholder="如: net-diagnostic-pro"
                />
              </div>
            </div>
          </div>

          {/* 3 Steps */}
          <div className="space-y-4">
            {/* Step 1 */}
            <div className="p-5 rounded-2xl bg-[#0a0a0b]/70 border border-dim space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2 font-bold text-white">
                  <span className="w-6 h-6 rounded-full bg-cyan-500/20 text-cyan-400 flex items-center justify-center font-mono text-xs">
                    1
                  </span>
                  <span>下載 Mono-Repo 專案包並解壓縮</span>
                </div>
                <button
                  onClick={handleDownloadZip}
                  disabled={isZipping}
                  className="flex items-center space-x-1.5 bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-bold px-3.5 py-1.5 rounded-xl glow-emerald transition disabled:opacity-50"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>下載 ZIP 套件包</span>
                </button>
              </div>
              <p className="text-slate-400 leading-relaxed">
                解壓縮後即可獲得包含 <code>app/</code> 原生 Android Kotlin 專案、<code>docs/index.html</code> 網頁版測速與 <code>.github/workflows/build-apk.yml</code> 自動化編譯工作流。
              </p>
            </div>

            {/* Step 2 */}
            <div className="p-5 rounded-2xl bg-[#0a0a0b]/70 border border-dim space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2 font-bold text-white">
                  <span className="w-6 h-6 rounded-full bg-cyan-500/20 text-cyan-400 flex items-center justify-center font-mono text-xs">
                    2
                  </span>
                  <span>在 GitHub 建立 Repository 並執行 Push</span>
                </div>
                <button
                  onClick={() =>
                    copyToClipboard(
                      `cd ${repoName}\ngit init\ngit add .\ngit commit -m "feat: initial commit with Android APK CI/CD & Web SpeedTest"\ngit branch -M main\ngit remote add origin https://github.com/${githubUser}/${repoName}.git\ngit push -u origin main`,
                      'tab-git-cli'
                    )
                  }
                  className="flex items-center space-x-1.5 text-xs text-slate-300 hover:text-white bg-white/5 px-3 py-1.5 rounded-lg border border-dim transition"
                >
                  {copiedCmd === 'tab-git-cli' ? (
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                  <span>{copiedCmd === 'tab-git-cli' ? '已複製！' : '複製完整終端指令'}</span>
                </button>
              </div>

              <div className="p-4 bg-black/60 rounded-xl border border-dim font-mono text-[11px] text-slate-300 overflow-x-auto leading-relaxed">
                <pre>{`cd ${repoName}
git init
git add .
git commit -m "feat: initial commit with Android APK CI/CD & Web SpeedTest"
git branch -M main
git remote add origin https://github.com/${githubUser}/${repoName}.git
git push -u origin main`}</pre>
              </div>
            </div>

            {/* Step 3 */}
            <div className="p-5 rounded-2xl bg-[#0a0a0b]/70 border border-dim space-y-3">
              <div className="flex items-center space-x-2 font-bold text-white">
                <span className="w-6 h-6 rounded-full bg-cyan-500/20 text-cyan-400 flex items-center justify-center font-mono text-xs">
                  3
                </span>
                <span>啟用 GitHub Pages（獲得即時網頁版測速 URL）</span>
              </div>
              <div className="space-y-2 text-slate-300">
                <div className="flex items-start space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" />
                  <span>進入 GitHub 倉庫頁面點擊 <strong>Settings &gt; Pages</strong></span>
                </div>
                <div className="flex items-start space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" />
                  <span>在 <strong>Branch</strong> 選擇 <code className="text-cyan-300 mono">main</code>，資料夾選擇 <code className="text-cyan-300 mono">/docs</code> 並儲存。</span>
                </div>
                <div className="flex items-start space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" />
                  <span>
                    完成！前往 <strong>Actions</strong> 可看見 APK 編譯進度，完成後可於 <strong>Releases</strong> 與 <strong>GitHub Pages 網頁端</strong> 下載 APK。
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Workflow & CI/CD Diagram */}
      {activeTab === 'workflow' && (
        <div className="p-6 space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* GitHub Pages Track */}
            <div className="bg-[#0a0a0b]/70 p-6 rounded-2xl border border-cyan-500/20 relative overflow-hidden">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center font-bold">
                  <Globe className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">軌道一：Web 網頁端 (GitHub Pages)</h3>
                  <p className="text-xs text-cyan-400 mono">支援 iPad / iPhone / Mac / Windows 免安裝即測</p>
                </div>
              </div>

              <div className="space-y-2.5 text-xs text-slate-300 mt-4">
                <div className="p-3 bg-[#111114] rounded-xl border border-dim">
                  <span className="font-bold text-white">1. 代碼位置：</span>
                  <code className="text-cyan-300 ml-1 mono">docs/index.html</code>
                </div>
                <div className="p-3 bg-[#111114] rounded-xl border border-dim">
                  <span className="font-bold text-white">2. 發布設定：</span>
                  <span className="text-slate-300 ml-1">進入 Repo Settings &gt; Pages &gt; Branch: <code className="text-cyan-300 mono">main</code>, Folder: <code className="text-cyan-300 mono">/docs</code></span>
                </div>
                <div className="p-3 bg-[#111114] rounded-xl border border-dim">
                  <span className="font-bold text-white">3. 自動生成網址：</span>
                  <div className="text-emerald-400 font-mono mt-1">https://&lt;username&gt;.github.io/&lt;repo&gt;/</div>
                </div>
                <div className="p-3 bg-[#111114] rounded-xl border border-dim">
                  <span className="font-bold text-white">4. 內建 APK 下載：</span>
                  <span className="text-slate-300 ml-1">網頁右上角直接附帶「下載 Android APK」連結，直通 GitHub Releases！</span>
                </div>
              </div>
            </div>

            {/* GitHub Actions Track */}
            <div className="bg-[#0a0a0b]/70 p-6 rounded-2xl border border-emerald-500/20 relative overflow-hidden">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
                  <Smartphone className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">軌道二：Android APK (GitHub Actions)</h3>
                  <p className="text-xs text-emerald-400 mono">Push 代碼即自動編譯 APK 產出安裝包</p>
                </div>
              </div>

              <div className="space-y-2.5 text-xs text-slate-300 mt-4">
                <div className="p-3 bg-[#111114] rounded-xl border border-dim">
                  <span className="font-bold text-white">1. 工作流配置：</span>
                  <code className="text-emerald-300 ml-1 mono">.github/workflows/build-apk.yml</code>
                </div>
                <div className="p-3 bg-[#111114] rounded-xl border border-dim">
                  <span className="font-bold text-white">2. 自動觸發條件：</span>
                  <span className="text-slate-300 ml-1">每次 <code className="text-emerald-300 mono">git push origin main</code> 或打 Release Tag</span>
                </div>
                <div className="p-3 bg-[#111114] rounded-xl border border-dim">
                  <span className="font-bold text-white">3. 雲端編譯流程：</span>
                  <span className="text-slate-300 ml-1">Ubuntu VM &gt; JDK 17 &gt; <code className="text-emerald-300 mono">./gradlew assembleDebug</code></span>
                </div>
                <div className="p-3 bg-[#111114] rounded-xl border border-dim">
                  <span className="font-bold text-white">4. 產物產出：</span>
                  <span className="text-slate-300 ml-1">自動上傳 Artifacts 並發布至 GitHub Releases 提供下載安裝！</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: No-Backend Deep Dive */}
      {activeTab === 'guide' && (
        <div className="p-6 space-y-4 text-xs text-slate-300">
          <div className="p-5 bg-[#0a0a0b]/70 rounded-xl border border-dim">
            <h3 className="text-sm font-bold text-white mb-2 flex items-center space-x-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              <span>為什麼「完全不需要自建後台」也能實現完整測速與診斷？</span>
            </h3>
            <p className="text-slate-400 leading-relaxed mb-4">
              傳統測速軟體常需耗費昂貴伺服器頻寬。本架構採用「純客戶端（Client-side only）＋ 公開網路基礎建設」模式，零維護成本且高可靠度：
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-3.5 bg-[#111114] rounded-lg border border-dim">
                <div className="font-bold text-cyan-400 mb-1">1. Wi-Fi 與 4G/5G 訊號數據（免外網）</div>
                <p className="text-slate-400 leading-relaxed">
                  直接調用 Android 系統內部 <code className="text-cyan-300 mono">WifiManager</code>（Link Speed、RSSI dBm、SSID）、<code className="text-cyan-300 mono">TelephonyManager</code>（RSRP、RSRQ、SINR 5G訊號格數）與 <code className="text-cyan-300 mono">NetworkInterface</code> 本機內網 IP。完全在手機本機運算，不耗流量。
                </p>
              </div>

              <div className="p-3.5 bg-[#111114] rounded-lg border border-dim">
                <div className="font-bold text-emerald-400 mb-1">2. 延遲與 DNS 測試（公共基礎節點）</div>
                <p className="text-slate-400 leading-relaxed">
                  Ping/Jitter/DNS 解析直接向全球超高速 Anycast DNS（如 Cloudflare <code className="text-emerald-300 mono">1.1.1.1</code> 或 Google <code className="text-emerald-300 mono">8.8.8.8</code>）發起 HEAD/GET 探針，即時計算往返 RTT。
                </p>
              </div>

              <div className="p-3.5 bg-[#111114] rounded-lg border border-dim">
                <div className="font-bold text-violet-400 mb-1">3. 公網 IP 與電信商/ISP（免費開放 API）</div>
                <p className="text-slate-400 leading-relaxed">
                  以非同步 GET 請求至公開 IP 查詢服務（如 <code className="text-violet-300 mono">ipwho.is</code> 或 <code className="text-violet-300 mono">ipapi.co</code>），即時取得對外公網 IP、ISP 名稱、ASN 與城市定位，不需維護資料庫。
                </p>
              </div>

              <div className="p-3.5 bg-[#111114] rounded-lg border border-dim">
                <div className="font-bold text-amber-400 mb-1">4. 上下行速度 Throughput 測試</div>
                <p className="text-slate-400 leading-relaxed">
                  下載測速透過 OkHttp 或 Fetch 流式下載 Cloudflare/公共 CDN 大檔案，計算 Byte/時間後即丟棄；上行測速產生隨機 Byte 陣列 POST 傳送至端點，即開即測、不留紀錄。
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
