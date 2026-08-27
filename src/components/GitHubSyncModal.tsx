import React, { useState } from 'react';
import {
  Github,
  GitBranch,
  ExternalLink,
  Copy,
  Check,
  Download,
  Globe,
  Smartphone,
  FolderGit2,
  Terminal,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
} from 'lucide-react';
import JSZip from 'jszip';
import { MONO_REPO_FILES } from '../data/repoTemplates';

export const GitHubSyncModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({
  isOpen,
  onClose,
}) => {
  const [copiedCmd, setCopiedCmd] = useState<string | null>(null);
  const [repoName, setRepoName] = useState('signal');
  const [githubUser, setGithubUser] = useState('joyease');
  const [isZipping, setIsZipping] = useState(false);
  const [zipSuccess, setZipSuccess] = useState(false);

  if (!isOpen) return null;

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCmd(id);
    setTimeout(() => setCopiedCmd(null), 2000);
  };

  const handleDownloadZip = async () => {
    setIsZipping(true);
    try {
      const zip = new JSZip();

      // Add all mono-repo files into zip preserving structure with dynamic username replacement if needed
      MONO_REPO_FILES.forEach((f) => {
        let content = f.content;
        if (f.path === 'docs/index.html' && githubUser !== 'YOUR_GITHUB_USERNAME') {
          content = content.replace(/YOUR_USER\/YOUR_REPO/g, `${githubUser}/${repoName}`);
        }
        zip.file(f.path, content);
      });

      // Add gradle wrapper script
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
      a.download = `${repoName}-monorepo.zip`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      setZipSuccess(true);
      setTimeout(() => setZipSuccess(false), 3000);
    } catch (err) {
      console.error('Failed to zip files', err);
    } finally {
      setIsZipping(false);
    }
  };

  const gitCliCommands = `# 1. 解壓縮下載的專案檔後進入資料夾
cd ${repoName}

# 2. 初始化 Git 倉庫並提交代碼
git init
git add .
git commit -m "feat: initial release with Android APK CI/CD and Web SpeedTest"

# 3. 關聯至您的 GitHub Repository
git branch -M main
git remote add origin https://github.com/${githubUser}/${repoName}.git

# 4. 推送至 GitHub（自動觸發 APK 編譯與 Web 發布）
git push -u origin main`;

  const webUrl = `https://${githubUser.toLowerCase()}.github.io/${repoName}/`;
  const releasesUrl = `https://github.com/${githubUser}/${repoName}/releases`;
  const actionsUrl = `https://github.com/${githubUser}/${repoName}/actions`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
      <div
        id="github-sync-modal"
        className="bg-[#111114] border border-dim rounded-2xl max-w-3xl w-full shadow-2xl overflow-hidden my-8"
      >
        {/* Modal Header */}
        <div className="p-6 border-b border-dim bg-[#0a0a0b]/60 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <Github className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white flex items-center space-x-2">
                <span>同步至 GitHub Repository</span>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  Web 網頁 + APK 雙發布
                </span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5 mono">
                提供完整的 GitHub Pages 網頁測速託管與 GitHub Actions 自動編譯 APK 產出
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-2 rounded-lg hover:bg-white/5 transition"
          >
            ✕
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          {/* Dual Output Banner */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Output 1: Web URL */}
            <div className="p-4 rounded-xl bg-[#0a0a0b]/80 border border-cyan-500/20 flex flex-col justify-between">
              <div>
                <div className="flex items-center space-x-2 text-cyan-400 text-xs font-bold mb-1.5">
                  <Globe className="w-4 h-4" />
                  <span>1. 網頁版 (Web SpeedTest)</span>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed mb-3">
                  透過 GitHub Pages 自動免費託管，免安裝即可在手機、平板或電腦瀏覽器執行測速。
                </p>
              </div>
              <div className="p-2.5 bg-black/40 rounded-lg border border-dim text-[11px] font-mono text-cyan-300 break-all flex items-center justify-between">
                <span>{webUrl}</span>
              </div>
            </div>

            {/* Output 2: APK Release */}
            <div className="p-4 rounded-xl bg-[#0a0a0b]/80 border border-emerald-500/20 flex flex-col justify-between">
              <div>
                <div className="flex items-center space-x-2 text-emerald-400 text-xs font-bold mb-1.5">
                  <Smartphone className="w-4 h-4" />
                  <span>2. Android APK 安裝包</span>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed mb-3">
                  GitHub Actions 雲端 CI/CD 自動編譯原生 Kotlin Compose App 並發布至 Releases。
                </p>
              </div>
              <div className="p-2.5 bg-black/40 rounded-lg border border-dim text-[11px] font-mono text-emerald-300 break-all flex items-center justify-between">
                <span>{releasesUrl}</span>
              </div>
            </div>
          </div>

          {/* Configuration Inputs */}
          <div className="p-4 bg-white/[0.02] rounded-xl border border-dim space-y-4">
            <h3 className="text-xs font-bold text-slate-200 flex items-center space-x-2">
              <FolderGit2 className="w-4 h-4 text-cyan-400" />
              <span>自訂您的 GitHub 倉庫資訊（即時生成對應指令）</span>
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-mono text-slate-400 mb-1">
                  GitHub 使用者帳號 (Username)
                </label>
                <input
                  type="text"
                  value={githubUser}
                  onChange={(e) => setGithubUser(e.target.value.trim() || 'YOUR_GITHUB_USERNAME')}
                  className="w-full bg-[#0a0a0b] border border-dim rounded-lg px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-cyan-500"
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
                  className="w-full bg-[#0a0a0b] border border-dim rounded-lg px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-cyan-500"
                  placeholder="如: net-diagnostic-pro"
                />
              </div>
            </div>
          </div>

          {/* Step by Step Workflow */}
          <div className="space-y-4">
            <div className="text-xs font-bold text-white uppercase tracking-wider mono flex items-center space-x-2">
              <Terminal className="w-4 h-4 text-cyan-400" />
              <span>3 步驟完成同步與部署 (Step-by-Step Guide)</span>
            </div>

            {/* Step 1 */}
            <div className="p-4 rounded-xl bg-[#0a0a0b]/60 border border-dim space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-cyan-400 flex items-center space-x-2">
                  <span className="w-5 h-5 rounded-full bg-cyan-500/20 text-cyan-300 flex items-center justify-center text-[10px]">
                    1
                  </span>
                  <span>下載完整 Mono-Repo 原始碼套件包 (.ZIP)</span>
                </span>
                <button
                  onClick={handleDownloadZip}
                  disabled={isZipping}
                  className="flex items-center space-x-1.5 bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-bold px-3.5 py-1.5 rounded-lg glow-emerald transition disabled:opacity-50"
                >
                  <Download className={`w-3.5 h-3.5 ${isZipping ? 'animate-bounce' : ''}`} />
                  <span>{isZipping ? '打包中...' : zipSuccess ? '已下載 ZIP！' : '下載專案壓縮包'}</span>
                </button>
              </div>
              <p className="text-[11px] text-slate-400">
                壓縮包包含完整 Android Kotlin/Compose 原生源碼、<code>.github/workflows/build-apk.yml</code> CI/CD 腳本與 <code>docs/index.html</code> 網頁測速端點。
              </p>
            </div>

            {/* Step 2 */}
            <div className="p-4 rounded-xl bg-[#0a0a0b]/60 border border-dim space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-cyan-400 flex items-center space-x-2">
                  <span className="w-5 h-5 rounded-full bg-cyan-500/20 text-cyan-300 flex items-center justify-center text-[10px]">
                    2
                  </span>
                  <span>在 GitHub 建立新 Repository 並 Push 代碼</span>
                </span>
                <button
                  onClick={() => copyToClipboard(gitCliCommands, 'git-cli')}
                  className="flex items-center space-x-1 text-xs text-slate-300 hover:text-white bg-white/5 px-2.5 py-1 rounded border border-dim transition"
                >
                  {copiedCmd === 'git-cli' ? (
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                  <span>{copiedCmd === 'git-cli' ? '已複製！' : '複製指令'}</span>
                </button>
              </div>

              <div className="p-3 bg-black/60 rounded-lg border border-dim font-mono text-[11px] text-slate-300 overflow-x-auto leading-relaxed">
                <pre>{gitCliCommands}</pre>
              </div>
            </div>

            {/* Step 3 */}
            <div className="p-4 rounded-xl bg-[#0a0a0b]/60 border border-dim space-y-3">
              <span className="text-xs font-bold text-cyan-400 flex items-center space-x-2">
                <span className="w-5 h-5 rounded-full bg-cyan-500/20 text-cyan-300 flex items-center justify-center text-[10px]">
                  3
                </span>
                <span>啟用 GitHub Pages（開啟網頁版測速網址）</span>
              </span>
              <div className="text-[11px] text-slate-300 space-y-2 leading-relaxed">
                <div className="flex items-start space-x-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 mt-0.5 flex-shrink-0" />
                  <span>
                    前往您的 GitHub 專案 <strong>Settings &gt; Pages</strong>
                  </span>
                </div>
                <div className="flex items-start space-x-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 mt-0.5 flex-shrink-0" />
                  <span>
                    在 <strong>Build and deployment</strong> 區塊，Branch 選擇 <code className="text-cyan-300 font-mono">main</code>，資料夾選擇 <code className="text-cyan-300 font-mono">/docs</code> 並點擊 <strong>Save</strong>
                  </span>
                </div>
                <div className="flex items-start space-x-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 mt-0.5 flex-shrink-0" />
                  <span>
                    GitHub Actions 會在約 1 分鐘內自動完成部署，並於 <strong>Releases</strong> 產出 APK 安裝包！
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-dim bg-[#0a0a0b]/80 flex items-center justify-between">
          <a
            href="https://github.com/new"
            target="_blank"
            rel="noreferrer"
            className="flex items-center space-x-1.5 text-xs text-cyan-400 hover:text-cyan-300 underline underline-offset-4"
          >
            <span>前往 GitHub 建立新 Repository</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
          <button
            onClick={onClose}
            className="bg-white/10 hover:bg-white/20 text-white text-xs font-bold px-4 py-2 rounded-xl transition"
          >
            關閉
          </button>
        </div>
      </div>
    </div>
  );
};
