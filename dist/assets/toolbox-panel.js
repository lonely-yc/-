const TOOLBOX_STATE = {
  activeTab: "mask",
  transfer: null,
  currentIndex: 0,
  playing: false,
  playTimer: null,
  received: new Map(),
  receiverMeta: null,
  scannerTimer: null,
  scannerStream: null
};

const TOOLBOX_CHUNK_SIZE = 700;

function toolboxEscape(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function safeDownloadUrl(downloadUrl) {
  const marker = "?path=";
  const markerIndex = String(downloadUrl || "").indexOf(marker);
  if (markerIndex < 0) return downloadUrl;
  const base = downloadUrl.slice(0, markerIndex + marker.length);
  const rawPath = downloadUrl.slice(markerIndex + marker.length).replace(/\+/g, "%20");
  let decodedPath = rawPath;
  try {
    decodedPath = decodeURIComponent(rawPath);
  } catch {
    decodedPath = rawPath;
  }
  return base + encodeURIComponent(decodedPath);
}

function ensureToolboxNav() {
  const nav = document.querySelector(".fig-nav");
  if (!nav || document.querySelector("[data-toolbox-nav]")) return;
  const button = document.createElement("button");
  button.className = "fig-nav-item";
  button.type = "button";
  button.dataset.toolboxNav = "true";
  button.innerHTML = `
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <path d="M14.7 6.3a4 4 0 0 0-5.4 5.4L3 18v3h3l6.3-6.3a4 4 0 0 0 5.4-5.4l-2.1 2.1-2.8-2.8 2.1-2.1Z"></path>
    </svg>
    <span>工具箱</span>
  `;
  button.addEventListener("click", openToolboxPage);
  nav.appendChild(button);
}

function openToolboxPage() {
  document.querySelectorAll(".fig-nav-item").forEach((item) => item.classList.remove("active"));
  document.querySelector("[data-toolbox-nav]")?.classList.add("active");
  const title = document.querySelector(".fig-header h1");
  const crumb = document.querySelector(".fig-header p");
  if (title) title.textContent = "工具箱";
  if (crumb) crumb.textContent = "系统概览 > 工具箱";
  const content = document.querySelector(".fig-content");
  const main = document.querySelector(".fig-main");
  if (!content || !main) return;
  content.style.display = "none";
  let host = document.querySelector(".toolbox-host");
  if (!host) {
    host = document.createElement("main");
    host.className = "fig-content toolbox-host";
    main.appendChild(host);
  }
  host.innerHTML = renderToolbox();
  host.style.display = "";
  bindToolboxEvents();
}

function closeToolboxPage() {
  stopQrPlayback();
  stopScanner();
  const host = document.querySelector(".toolbox-host");
  if (host) host.remove();
  const content = document.querySelector(".fig-content:not(.toolbox-host)");
  if (content) content.style.display = "";
}

function renderToolbox() {
  return `
    <div class="fig-page toolbox-page">
      <section class="toolbox-hero">
        <div>
          <h2>交付工具箱</h2>
          <p>面向项目交付、资料外发、现场无网络传输和人员交接前资料处理，先做两个高频实用工具。</p>
        </div>
        <div class="toolbox-tabs">
          <button type="button" data-toolbox-tab="mask" class="${TOOLBOX_STATE.activeTab === "mask" ? "active" : ""}">文档脱敏</button>
          <button type="button" data-toolbox-tab="qr" class="${TOOLBOX_STATE.activeTab === "qr" ? "active" : ""}">离线码传</button>
        </div>
      </section>
      ${TOOLBOX_STATE.activeTab === "mask" ? renderMaskTool() : renderQrTool()}
    </div>
  `;
}

function renderMaskTool() {
  return `
    <div class="toolbox-grid">
      <section class="toolbox-card">
        <h3>文档脱敏</h3>
        <p>上传 Word / Excel 后，自动识别客户、联系人、手机号、接口地址、数据库连接、Token、密码、IP 等敏感信息并替换为 ****。</p>
        <form class="toolbox-form" data-mask-form>
          <label class="toolbox-field">
            <span>文件</span>
            <input type="file" name="file" accept=".docx,.xlsx,.xls" required>
          </label>
          <label class="toolbox-field">
            <span>脱敏模式</span>
            <select name="mode">
              <option value="自动脱敏">自动脱敏</option>
              <option value="关键词补充">关键词补充</option>
            </select>
          </label>
          <label class="toolbox-field">
            <span>补充关键词</span>
            <textarea name="keywords" placeholder="一行一个或用逗号分隔，例如客户简称、现场名称、内部系统账号"></textarea>
          </label>
          <div class="toolbox-actions">
            <button class="toolbox-btn" type="submit">开始脱敏</button>
            <span class="toolbox-muted" data-mask-status>等待上传文件</span>
          </div>
        </form>
        <div data-mask-result></div>
      </section>
      <aside class="toolbox-card">
        <h3>默认规则</h3>
        <ul class="toolbox-list">
          <li>手机号、身份证号、邮箱、IP、接口 URL、JDBC 连接。</li>
          <li>账号、密码、Token、Secret、AccessKey 等凭据字段。</li>
          <li>客户名称、联系人、现场地址、接口地址等业务字段。</li>
          <li>支持关键词补充，适合客户简称、系统简称、现场名称。</li>
        </ul>
      </aside>
    </div>
  `;
}

function renderQrTool() {
  return `
    <div class="qr-layout">
      <section class="toolbox-transfer-panel">
        <h3>发送端</h3>
        <p class="toolbox-muted">上传文件后会在浏览器内分片生成二维码序列，适合现场无网络或隔离环境传递小文件。</p>
        <div class="toolbox-form">
          <label class="toolbox-field">
            <span>选择文件或压缩包</span>
            <input type="file" data-qr-file>
          </label>
          <div data-qr-warning></div>
          <div class="toolbox-stats">
            <div class="toolbox-stat"><span>文件大小</span><b data-qr-size>-</b></div>
            <div class="toolbox-stat"><span>总片数</span><b data-qr-total>-</b></div>
            <div class="toolbox-stat"><span>当前序号</span><b data-qr-index>-</b></div>
          </div>
          <div class="qr-canvas-card"><div data-qr-canvas class="toolbox-muted">选择文件后生成二维码</div></div>
          <div class="qr-progress"><i data-qr-progress></i></div>
          <div class="qr-controls">
            <button class="toolbox-secondary-btn" type="button" data-qr-prev>上一张</button>
            <button class="toolbox-secondary-btn" type="button" data-qr-play>播放</button>
            <button class="toolbox-secondary-btn" type="button" data-qr-next>下一张</button>
            <button class="toolbox-secondary-btn" type="button" data-qr-copy>复制当前码文本</button>
          </div>
        </div>
      </section>
      <section class="toolbox-transfer-panel">
        <h3>接收端</h3>
        <p class="toolbox-muted">可用摄像头连续扫码；摄像头不可用时，也可以手动粘贴二维码文本进行演示验证。</p>
        <div class="toolbox-actions">
          <button class="toolbox-btn" type="button" data-scan-start>开启摄像头扫码</button>
          <button class="toolbox-secondary-btn" type="button" data-scan-stop>停止</button>
        </div>
        <video class="toolbox-receiver-video toolbox-hidden" data-scan-video muted playsinline></video>
        <label class="toolbox-field" style="margin-top: 14px;">
          <span>手动导入二维码文本</span>
          <textarea class="toolbox-textarea" data-qr-import placeholder="粘贴一个二维码 JSON 文本后点击导入"></textarea>
        </label>
        <div class="toolbox-actions">
          <button class="toolbox-secondary-btn" type="button" data-qr-import-btn>导入片段</button>
          <button class="toolbox-btn" type="button" data-qr-assemble>重组下载</button>
        </div>
        <div class="toolbox-result" data-receive-status>尚未接收片段</div>
      </section>
    </div>
  `;
}

function bindToolboxEvents() {
  document.querySelectorAll("[data-toolbox-tab]").forEach((button) => {
    button.addEventListener("click", () => {
      stopQrPlayback();
      stopScanner();
      TOOLBOX_STATE.activeTab = button.dataset.toolboxTab;
      const host = document.querySelector(".toolbox-host");
      if (host) host.innerHTML = renderToolbox();
      bindToolboxEvents();
    });
  });

  document.querySelector("[data-mask-form]")?.addEventListener("submit", handleMaskSubmit);
  document.querySelector("[data-qr-file]")?.addEventListener("change", handleQrFile);
  document.querySelector("[data-qr-prev]")?.addEventListener("click", () => moveQr(-1));
  document.querySelector("[data-qr-next]")?.addEventListener("click", () => moveQr(1));
  document.querySelector("[data-qr-play]")?.addEventListener("click", toggleQrPlayback);
  document.querySelector("[data-qr-copy]")?.addEventListener("click", copyCurrentPacket);
  document.querySelector("[data-qr-import-btn]")?.addEventListener("click", importManualPacket);
  document.querySelector("[data-qr-assemble]")?.addEventListener("click", assembleReceivedFile);
  document.querySelector("[data-scan-start]")?.addEventListener("click", startScanner);
  document.querySelector("[data-scan-stop]")?.addEventListener("click", stopScanner);
  renderQrCurrent();
}

async function handleMaskSubmit(event) {
  event.preventDefault();
  const form = event.currentTarget;
  const status = document.querySelector("[data-mask-status]");
  const resultBox = document.querySelector("[data-mask-result]");
  const data = new FormData(form);
  status.textContent = "正在上传并脱敏...";
  resultBox.innerHTML = "";
  try {
    const response = await fetch("/api/tools/desensitize", { method: "POST", body: data });
    const body = await response.json();
    if (!response.ok || body.code !== 200) throw new Error(body.message || `HTTP ${response.status}`);
    const result = body.data;
    status.textContent = "处理完成";
    resultBox.innerHTML = `
      <div class="toolbox-result">
        <strong>${toolboxEscape(result.maskedFileName)}</strong>
        <div class="toolbox-stats">
          <div class="toolbox-stat"><span>命中数量</span><b>${toolboxEscape(result.matchCount)}</b></div>
          <div class="toolbox-stat"><span>处理状态</span><b>完成</b></div>
          <div class="toolbox-stat"><span>任务ID</span><b>${toolboxEscape(result.taskId)}</b></div>
        </div>
        <p class="toolbox-muted">${toolboxEscape(summaryText(result.ruleSummary))}</p>
        <div class="toolbox-actions"><a class="toolbox-btn" href="${toolboxEscape(safeDownloadUrl(result.downloadUrl))}">下载脱敏文件</a></div>
      </div>
    `;
  } catch (error) {
    status.textContent = "处理失败";
    resultBox.innerHTML = `<div class="toolbox-result toolbox-warning">${toolboxEscape(error.message || "脱敏失败")}</div>`;
  }
}

function summaryText(summary) {
  if (!summary) return "未发现命中项";
  if (typeof summary === "string") return summary;
  return Object.entries(summary).map(([key, value]) => `${key} ${value}处`).join("；") || "未发现命中项";
}

async function handleQrFile(event) {
  const file = event.target.files?.[0];
  if (!file) return;
  const bytes = new Uint8Array(await file.arrayBuffer());
  const checksum = await sha256Hex(bytes);
  const base64 = arrayBufferToBase64(bytes);
  const transferId = `${Date.now()}-${Math.random().toString(16).slice(2)}`;
  const chunks = splitString(base64, TOOLBOX_CHUNK_SIZE);
  TOOLBOX_STATE.transfer = {
    transferId,
    fileName: file.name,
    mimeType: file.type || "application/octet-stream",
    size: file.size,
    checksum,
    total: chunks.length,
    packets: chunks.map((chunk, index) => ({
      transferId,
      fileName: file.name,
      mimeType: file.type || "application/octet-stream",
      size: file.size,
      checksum,
      total: chunks.length,
      index,
      data: chunk
    }))
  };
  TOOLBOX_STATE.currentIndex = 0;
  renderQrCurrent();
}

function splitString(value, size) {
  const chunks = [];
  for (let index = 0; index < value.length; index += size) {
    chunks.push(value.slice(index, index + size));
  }
  return chunks.length ? chunks : [""];
}

function arrayBufferToBase64(bytes) {
  let binary = "";
  for (let index = 0; index < bytes.length; index += 0x8000) {
    binary += String.fromCharCode(...bytes.subarray(index, index + 0x8000));
  }
  return btoa(binary);
}

function base64ToBytes(base64) {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let index = 0; index < binary.length; index++) bytes[index] = binary.charCodeAt(index);
  return bytes;
}

async function sha256Hex(bytes) {
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(digest)).map((value) => value.toString(16).padStart(2, "0")).join("");
}

function renderQrCurrent() {
  const transfer = TOOLBOX_STATE.transfer;
  const sizeEl = document.querySelector("[data-qr-size]");
  const totalEl = document.querySelector("[data-qr-total]");
  const indexEl = document.querySelector("[data-qr-index]");
  const warningEl = document.querySelector("[data-qr-warning]");
  const progressEl = document.querySelector("[data-qr-progress]");
  const target = document.querySelector("[data-qr-canvas]");
  if (!target) return;
  if (!transfer) {
    if (sizeEl) sizeEl.textContent = "-";
    if (totalEl) totalEl.textContent = "-";
    if (indexEl) indexEl.textContent = "-";
    if (warningEl) warningEl.innerHTML = "";
    if (progressEl) progressEl.style.width = "0";
    return;
  }
  if (sizeEl) sizeEl.textContent = readableSize(transfer.size);
  if (totalEl) totalEl.textContent = String(transfer.total);
  if (indexEl) indexEl.textContent = `${TOOLBOX_STATE.currentIndex + 1}/${transfer.total}`;
  if (progressEl) progressEl.style.width = `${((TOOLBOX_STATE.currentIndex + 1) / transfer.total) * 100}%`;
  if (warningEl) warningEl.innerHTML = transfer.size > 10 * 1024 * 1024
    ? `<div class="toolbox-warning">文件超过 10MB，演示可用，但实际扫描耗时会很长，建议压缩或改用服务器中转。</div>`
    : transfer.size > 1024 * 1024
      ? `<div class="toolbox-warning">文件超过 1MB，将生成较多二维码，建议压缩后再传。</div>`
      : "";
  renderQrCanvas(JSON.stringify(transfer.packets[TOOLBOX_STATE.currentIndex]), target);
}

function renderQrCanvas(text, target) {
  target.innerHTML = "";
  const canvas = document.createElement("canvas");
  target.appendChild(canvas);
  if (window.QRCode?.toCanvas) {
    window.QRCode.toCanvas(canvas, text, { width: 320, margin: 1 }, (error) => {
      if (error) target.textContent = "二维码生成失败，请复制当前码文本演示。";
    });
  } else {
    canvas.remove();
    target.innerHTML = `<textarea class="toolbox-textarea" readonly>${toolboxEscape(text)}</textarea><p class="toolbox-muted">未加载二维码库，当前以文本方式展示。</p>`;
  }
}

function moveQr(step) {
  const transfer = TOOLBOX_STATE.transfer;
  if (!transfer) return;
  TOOLBOX_STATE.currentIndex = (TOOLBOX_STATE.currentIndex + step + transfer.total) % transfer.total;
  renderQrCurrent();
}

function toggleQrPlayback() {
  if (TOOLBOX_STATE.playing) {
    stopQrPlayback();
  } else {
    TOOLBOX_STATE.playing = true;
    document.querySelector("[data-qr-play]").textContent = "暂停";
    TOOLBOX_STATE.playTimer = setInterval(() => moveQr(1), 900);
  }
}

function stopQrPlayback() {
  TOOLBOX_STATE.playing = false;
  if (TOOLBOX_STATE.playTimer) clearInterval(TOOLBOX_STATE.playTimer);
  TOOLBOX_STATE.playTimer = null;
  const button = document.querySelector("[data-qr-play]");
  if (button) button.textContent = "播放";
}

async function copyCurrentPacket() {
  const packet = TOOLBOX_STATE.transfer?.packets?.[TOOLBOX_STATE.currentIndex];
  if (!packet) return;
  await navigator.clipboard.writeText(JSON.stringify(packet));
}

function importManualPacket() {
  const textarea = document.querySelector("[data-qr-import]");
  if (!textarea?.value.trim()) return;
  try {
    acceptPacket(JSON.parse(textarea.value.trim()));
    textarea.value = "";
  } catch (error) {
    updateReceiveStatus(`导入失败：${error.message || "不是有效二维码内容"}`);
  }
}

function acceptPacket(packet) {
  if (!packet || !packet.transferId || typeof packet.index !== "number" || !packet.total) {
    throw new Error("二维码片段格式不正确");
  }
  if (!TOOLBOX_STATE.receiverMeta || TOOLBOX_STATE.receiverMeta.transferId !== packet.transferId) {
    TOOLBOX_STATE.receiverMeta = {
      transferId: packet.transferId,
      fileName: packet.fileName,
      mimeType: packet.mimeType,
      size: packet.size,
      checksum: packet.checksum,
      total: packet.total
    };
    TOOLBOX_STATE.received = new Map();
  }
  TOOLBOX_STATE.received.set(packet.index, packet.data);
  updateReceiveStatus();
}

function updateReceiveStatus(message) {
  const target = document.querySelector("[data-receive-status]");
  if (!target) return;
  if (message) {
    target.textContent = message;
    return;
  }
  const meta = TOOLBOX_STATE.receiverMeta;
  if (!meta) {
    target.textContent = "尚未接收片段";
    return;
  }
  const missing = [];
  for (let index = 0; index < meta.total; index++) {
    if (!TOOLBOX_STATE.received.has(index)) missing.push(index + 1);
  }
  target.innerHTML = `
    <strong>${toolboxEscape(meta.fileName)}</strong>
    <p class="toolbox-muted">已接收 ${TOOLBOX_STATE.received.size}/${meta.total} 片，${missing.length ? `缺失：${missing.slice(0, 20).join(", ")}${missing.length > 20 ? "..." : ""}` : "片段完整，可以重组下载。"}</p>
  `;
}

async function assembleReceivedFile() {
  const meta = TOOLBOX_STATE.receiverMeta;
  if (!meta) return updateReceiveStatus("尚未接收任何二维码片段");
  for (let index = 0; index < meta.total; index++) {
    if (!TOOLBOX_STATE.received.has(index)) return updateReceiveStatus(`还有缺失片段，无法重组：第 ${index + 1} 片`);
  }
  const base64 = Array.from({ length: meta.total }, (_, index) => TOOLBOX_STATE.received.get(index)).join("");
  const bytes = base64ToBytes(base64);
  const checksum = await sha256Hex(bytes);
  if (checksum !== meta.checksum) return updateReceiveStatus("校验失败，文件可能缺片或内容不一致");
  const blob = new Blob([bytes], { type: meta.mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = meta.fileName || "qr-transfer-file";
  link.click();
  URL.revokeObjectURL(url);
  updateReceiveStatus("校验通过，已生成下载。");
}

async function startScanner() {
  const video = document.querySelector("[data-scan-video]");
  if (!video) return;
  if (!("BarcodeDetector" in window)) {
    updateReceiveStatus("当前浏览器不支持原生二维码识别，请使用手动导入二维码文本。");
    return;
  }
  try {
    const detector = new BarcodeDetector({ formats: ["qr_code"] });
    const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
    TOOLBOX_STATE.scannerStream = stream;
    video.srcObject = stream;
    video.classList.remove("toolbox-hidden");
    await video.play();
    TOOLBOX_STATE.scannerTimer = setInterval(async () => {
      try {
        const codes = await detector.detect(video);
        for (const code of codes) {
          acceptPacket(JSON.parse(code.rawValue));
        }
      } catch {
        // Keep scanning; invalid frames should not stop the receiver.
      }
    }, 500);
  } catch (error) {
    updateReceiveStatus(`摄像头不可用：${error.message || "请检查权限"}`);
  }
}

function stopScanner() {
  if (TOOLBOX_STATE.scannerTimer) clearInterval(TOOLBOX_STATE.scannerTimer);
  TOOLBOX_STATE.scannerTimer = null;
  if (TOOLBOX_STATE.scannerStream) {
    TOOLBOX_STATE.scannerStream.getTracks().forEach((track) => track.stop());
  }
  TOOLBOX_STATE.scannerStream = null;
  const video = document.querySelector("[data-scan-video]");
  if (video) {
    video.pause();
    video.srcObject = null;
    video.classList.add("toolbox-hidden");
  }
}

function readableSize(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

function loadQrLibrary() {
  if (window.QRCode) return;
  const script = document.createElement("script");
  script.src = "/dist/assets/qrcode-local.js?v=20260525-1";
  document.head.appendChild(script);
}

function bootToolbox() {
  ensureToolboxNav();
  loadQrLibrary();
  document.addEventListener("click", (event) => {
    const navItem = event.target.closest(".fig-nav-item");
    if (navItem && !navItem.matches("[data-toolbox-nav]")) {
      closeToolboxPage();
    }
  }, true);
}

bootToolbox();
new MutationObserver(ensureToolboxNav).observe(document.body, { childList: true, subtree: true });
