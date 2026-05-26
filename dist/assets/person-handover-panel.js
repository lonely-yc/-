const STATUS_TEXT = {
  PLANNING: "规划中",
  IN_PROGRESS: "进行中",
  COMPLETED: "已完成",
  ARCHIVED: "已归档",
  IN_HANDOVER: "交接中",
  NEED_MORE: "需补充",
  DONE: "已交接"
};

const FALLBACK_IDS = {
  PM001: 1,
  DEV001: 2,
  FE001: 3,
  BE001: 4,
  IM001: 5,
  DS001: 6,
  QA001: 7
};

const state = {
  selectedPerson: null,
  people: [],
  handover: null,
  loading: false,
  error: ""
};

let lastPeopleSignature = "";
let lastPageSignature = "";

const escapeHtml = (value) => String(value ?? "")
  .replace(/&/g, "&amp;")
  .replace(/</g, "&lt;")
  .replace(/>/g, "&gt;")
  .replace(/"/g, "&quot;");

const formatDate = (value) => {
  if (!value) return "-";
  return String(value).replace("T", " ").slice(0, 16);
};

const displayStatus = (value) => STATUS_TEXT[value] || value || "未交接";

async function requestJson(url, options) {
  const response = await fetch(url, options);
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  const text = await response.text();
  const body = text ? JSON.parse(text) : {};
  return body.data ?? body;
}

async function loadPeople() {
  try {
    const data = await requestJson("/api/users");
    state.people = Array.isArray(data) ? data : [];
  } catch {
    state.people = [];
  }
}

async function loadHandover(person) {
  state.loading = true;
  state.error = "";
  state.handover = null;
  renderPanel();
  try {
    state.handover = await requestJson(`/api/people/${person.id}/project-handover`);
  } catch {
    state.error = "后端接口暂不可用，当前仅展示人员选择状态。";
  } finally {
    state.loading = false;
    renderPanel();
  }
}

function isPeoplePage() {
  const pageText = document.querySelector(".fig-page")?.textContent || document.body.textContent || "";
  return pageText.includes("人员列表") && pageText.includes("新增人员");
}

function findPeopleSection() {
  const candidates = Array.from(document.querySelectorAll("section.fig-card, section.card, .fig-card.fill, .card.fill"));
  const matched = candidates
    .find((node) => {
      const text = node.textContent || "";
      const hasPeopleTitle = text.includes("人员列表") || text.includes("人员台账");
      const hasPeopleColumns = text.includes("工号") && text.includes("手机号") && text.includes("岗位");
      return hasPeopleTitle && hasPeopleColumns && node.querySelector("table tbody tr");
    });
  if (matched) return matched;

  const table = Array.from(document.querySelectorAll("table"))
    .find((node) => {
      const text = node.textContent || "";
      return text.includes("工号") && text.includes("手机号") && text.includes("岗位");
    });
  return table?.closest("section.fig-card, section.card, .fig-card, .card") || null;
}

function readPersonFromRow(row) {
  const cells = Array.from(row.querySelectorAll("td")).map((cell) => cell.textContent.trim());
  if (cells.length < 5) return null;
  const employeeNo = cells.find((text) => /^[A-Z]{1,4}\d{3,}$/.test(text)) || cells[1];
  const apiPerson = state.people.find((person) => person.employeeNo === employeeNo);
  return {
    id: apiPerson?.id || FALLBACK_IDS[employeeNo],
    employeeNo,
    realName: apiPerson?.realName || cells[0].replace(/\s+/g, " ").split(" ").pop(),
    phone: apiPerson?.phone || cells[3],
    role: apiPerson?.role || cells[4]
  };
}

function enhancePeopleRows(section) {
  const rows = Array.from(section.querySelectorAll("tbody tr"));
  const signature = rows.map((row) => row.textContent.trim()).join("|");
  if (signature === lastPeopleSignature) return;
  lastPeopleSignature = signature;

  rows.forEach((row) => {
    row.style.cursor = "pointer";
    row.addEventListener("click", (event) => {
      if (event.target.closest("button, a")) return;
      const person = readPersonFromRow(row);
      if (!person?.id) return;
      state.selectedPerson = person;
      section.querySelectorAll("tbody tr").forEach((item) => item.classList.remove("handover-selected-row"));
      row.classList.add("handover-selected-row");
      loadHandover(person);
    });
  });

  ensurePanel(section);
}

function ensurePanel(section) {
  let panel = document.querySelector(".person-handover-panel");
  if (!panel) {
    panel = document.createElement("section");
    panel.className = "person-handover-panel";
  }
  if (panel.previousElementSibling !== section || panel.parentElement !== section.parentElement) {
    section.insertAdjacentElement("afterend", panel);
  }
  renderPanel();
}

function renderPanel() {
  const panel = document.querySelector(".person-handover-panel");
  if (!panel) return;

  const selected = state.selectedPerson;
  const projects = state.handover?.projects || [];
  panel.innerHTML = `
    <div class="person-handover-header">
      <div>
        <h3>个人项目交接展板</h3>
        <p>表格中选中成员后，下方展示该成员参与项目的交接概览；完整资料放在详情中查看。</p>
      </div>
      ${selected ? `<span class="handover-person-pill">${escapeHtml(selected.realName)} · ${escapeHtml(selected.employeeNo)}</span>` : ""}
    </div>
    ${renderPanelBody(selected, projects)}
  `;
}

function renderPanelBody(selected, projects) {
  if (!selected) {
    return `<div class="handover-empty">请选择人员查看项目交接资料</div>`;
  }
  if (state.loading) {
    return `<div class="handover-empty">正在读取 ${escapeHtml(selected.realName)} 的项目交接资料...</div>`;
  }
  if (state.error) {
    return `<div class="handover-empty">${escapeHtml(state.error)}</div>`;
  }
  if (!projects.length) {
    return `<div class="handover-empty">该人员暂未参与项目</div>`;
  }
  return `<div class="person-handover-grid">${projects.map(renderProjectCard).join("")}</div>`;
}

function renderProjectCard(project) {
  const docs = project.documents || [];
  return `
    <article class="person-handover-card" data-project-id="${project.projectId}">
      <div class="handover-card-top">
        <div class="handover-project-main">
          <h4 class="handover-card-title">${escapeHtml(project.projectName)}</h4>
          <div class="handover-card-meta">${escapeHtml(project.projectCode || "-")} · ${escapeHtml(project.customer || "-")}</div>
        </div>
        <span class="handover-state-dot" title="${escapeHtml(displayStatus(project.status))}"></span>
      </div>
      <div class="handover-quick-lines">
        <div><span>负责人</span><b>${escapeHtml(project.manager || "-")}</b></div>
        <div><span>项目状态</span><b>${escapeHtml(displayStatus(project.status))}</b></div>
        <div><span>当前职责</span><b>${escapeHtml(project.role || "-")}</b></div>
        <div><span>加入时间</span><b>${formatDate(project.joinedAt)}</b></div>
      </div>
      <div class="handover-card-footer">
        <div class="handover-mini-summary">
          <span>${docs.length ? `${docs.length} 份个人资料` : "暂无个人资料"}</span>
          <span>${escapeHtml(displayStatus(project.handoverStatus))}</span>
        </div>
        <div class="handover-card-actions">
          <button data-action="detail" data-project-id="${project.projectId}">详情</button>
          <button class="primary" data-action="upload" data-project-id="${project.projectId}">上传</button>
        </div>
      </div>
    </article>
  `;
}

function renderDoc(doc) {
  return `
    <div class="handover-doc-item" data-doc-id="${doc.id || ""}">
      <div>
        <strong>${escapeHtml(doc.fileName)}</strong>
        <p>${escapeHtml(doc.summary || "暂无摘要")}</p>
      </div>
      <div class="handover-doc-actions">
        <span>${escapeHtml(doc.documentType || "资料")}</span>
        ${doc.storedPath ? `<a href="/api/files/download?path=${encodeURIComponent(doc.storedPath)}">下载</a>` : ""}
        ${doc.id ? `<button type="button" data-action="delete-doc" data-project-id="${doc.projectId}" data-doc-id="${doc.id}">删除</button>` : ""}
      </div>
    </div>
  `;
}

function openModal(title, subtitle, bodyHtml, onSubmit) {
  const backdrop = document.createElement("div");
  backdrop.className = "handover-modal-backdrop";
  backdrop.innerHTML = `
    <section class="handover-modal">
      <header>
        <div>
          <h3>${escapeHtml(title)}</h3>
          <p>${escapeHtml(subtitle)}</p>
        </div>
        <button type="button" data-close>×</button>
      </header>
      <form class="handover-form">${bodyHtml}</form>
      <footer class="handover-modal-actions">
        <button type="button" data-close>取消</button>
        <button type="button" class="primary" data-submit>确认保存</button>
      </footer>
    </section>
  `;
  document.body.appendChild(backdrop);
  backdrop.addEventListener("click", (event) => {
    if (event.target === backdrop || event.target.closest("[data-close]")) backdrop.remove();
    if (event.target.closest("[data-submit]")) onSubmit(backdrop);
  });
}

function openDetailModal(project) {
  const docs = project.documents || [];
  const backdrop = document.createElement("div");
  backdrop.className = "handover-modal-backdrop";
  backdrop.innerHTML = `
    <section class="handover-modal detail">
      <header>
        <div>
          <h3>${escapeHtml(project.projectName)}</h3>
          <p>${escapeHtml(project.projectCode || "-")} · ${escapeHtml(project.customer || "-")} · ${escapeHtml(displayStatus(project.status))}</p>
        </div>
        <button type="button" data-close>×</button>
      </header>
      <div class="handover-detail-body">
        <div class="handover-detail-grid">
          <article>
            <span>项目负责人</span>
            <strong>${escapeHtml(project.manager || "-")}</strong>
          </article>
          <article>
            <span>当前人员职责</span>
            <strong>${escapeHtml(project.role || "-")}</strong>
          </article>
          <article>
            <span>加入时间</span>
            <strong>${formatDate(project.joinedAt)}</strong>
          </article>
          <article>
            <span>交接状态</span>
            <strong>${escapeHtml(displayStatus(project.handoverStatus))}</strong>
          </article>
          <article>
            <span>交接人</span>
            <strong>${escapeHtml(project.handoverToName || "未指定")}</strong>
          </article>
          <article>
            <span>交接时间</span>
            <strong>${formatDate(project.handoverAt)}</strong>
          </article>
        </div>
        <section class="handover-detail-section">
          <h4>交接说明</h4>
          <p>${escapeHtml(project.handoverRemark || "暂无交接说明")}</p>
        </section>
        <section class="handover-detail-section">
          <h4>个人项目资料</h4>
          ${docs.length ? `<div class="handover-doc-list">${docs.map(renderDoc).join("")}</div>` : `<div class="handover-empty compact">暂无个人理解资料</div>`}
        </section>
      </div>
      <footer class="handover-modal-actions">
        <button type="button" data-action="upload" data-project-id="${project.projectId}">上传个人资料</button>
        <button type="button" class="primary" data-action="edit" data-project-id="${project.projectId}">编辑交接信息</button>
      </footer>
    </section>
  `;
  document.body.appendChild(backdrop);
  backdrop.addEventListener("click", (event) => {
    if (event.target === backdrop || event.target.closest("[data-close]")) backdrop.remove();
  });
}

async function submitHandover(modal, projectId) {
  const form = modal.querySelector(".handover-form");
  const payload = Object.fromEntries(new FormData(form).entries());
  await requestJson(`/api/people/${state.selectedPerson.id}/projects/${projectId}/handover`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });
  modal.remove();
  loadHandover(state.selectedPerson);
}

async function submitDocument(modal, projectId) {
  const form = modal.querySelector(".handover-form");
  const fileInput = form.querySelector('input[name="file"]');
  if (!fileInput?.files?.length) {
    fileInput?.focus();
    alert("请选择要上传的个人项目资料");
    return;
  }
  const data = new FormData(form);
  const response = await fetch(`/api/people/${state.selectedPerson.id}/projects/${projectId}/handover-documents`, {
    method: "POST",
    body: data
  });
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  modal.remove();
  document.querySelector(".handover-modal-backdrop")?.remove();
  await loadHandover(state.selectedPerson);
  const refreshedProject = state.handover?.projects?.find((item) => String(item.projectId) === String(projectId));
  if (refreshedProject) {
    openDetailModal(refreshedProject);
  }
}

async function deleteDocument(projectId, documentId) {
  if (!window.confirm("确认删除这份个人项目资料吗？")) return;
  await requestJson(`/api/people/${state.selectedPerson.id}/projects/${projectId}/handover-documents/${documentId}`, {
    method: "DELETE"
  });
  document.querySelector(".handover-modal-backdrop")?.remove();
  await loadHandover(state.selectedPerson);
  const refreshedProject = state.handover?.projects?.find((item) => String(item.projectId) === String(projectId));
  if (refreshedProject) {
    openDetailModal(refreshedProject);
  }
}

function openEditModal(projectId) {
  const project = state.handover?.projects?.find((item) => String(item.projectId) === String(projectId)) || {};
  openModal(
    "编辑交接信息",
    `${state.selectedPerson.realName} 在 ${project.projectName || "项目"} 中的个人交接说明`,
    `
      <label>交接人<input name="handoverToName" value="${escapeHtml(project.handoverToName || "")}"></label>
      <label>交接状态<select name="handoverStatus">
        ${["未交接", "交接中", "已交接", "需补充"].map((status) => `<option ${status === project.handoverStatus ? "selected" : ""}>${status}</option>`).join("")}
      </select></label>
      <label>交接时间<input name="handoverAt" type="datetime-local" value="${formatDate(project.handoverAt).replace(" ", "T")}"></label>
      <label class="wide">交接说明<textarea name="handoverRemark">${escapeHtml(project.handoverRemark || "")}</textarea></label>
    `,
    (modal) => submitHandover(modal, projectId)
  );
}

function openUploadModal(projectId) {
  openModal(
    "上传个人项目资料",
    "资料只绑定当前人员和当前项目，不进入项目公共资料库",
    `
      <label class="wide">选择文件<input name="file" type="file" required></label>
      <label>资料类型<input name="documentType" value="个人理解资料"></label>
      <label class="wide">资料摘要<textarea name="summary" placeholder="例如接口来源、现场联系人、交接注意事项"></textarea></label>
    `,
    (modal) => submitDocument(modal, projectId)
  );
}

function bindPanelActions() {
  document.addEventListener("click", (event) => {
    const button = event.target.closest("[data-action][data-project-id]");
    if (!button || !state.selectedPerson) return;
    const projectId = button.dataset.projectId;
    const project = state.handover?.projects?.find((item) => String(item.projectId) === String(projectId)) || {};

    if (button.dataset.action === "detail") {
      openDetailModal(project);
    }
    if (button.dataset.action === "edit") {
      openEditModal(projectId);
    }
    if (button.dataset.action === "upload") {
      openUploadModal(projectId);
    }
    if (button.dataset.action === "delete-doc") {
      deleteDocument(projectId, button.dataset.docId);
    }
  });
}

async function tick() {
  if (!isPeoplePage()) {
    lastPeopleSignature = "";
    return;
  }
  const pageSignature = document.querySelector(".fig-page")?.textContent?.slice(0, 300) || "";
  if (pageSignature !== lastPageSignature) {
    lastPageSignature = pageSignature;
    lastPeopleSignature = "";
  }
  if (!state.people.length) await loadPeople();
  const section = findPeopleSection();
  if (section) enhancePeopleRows(section);
}

bindPanelActions();
setInterval(tick, 1000);
setTimeout(tick, 600);
