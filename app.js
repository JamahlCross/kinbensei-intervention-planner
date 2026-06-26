const TOTAL_STEPS = 8;
const stepTitles = ["ケース情報", "下位側面", "価値づけ", "現状と理想", "小行動", "cue → behavior", "介入計画書", "日々の記録"];

// フォーム項目はここで一元管理します。保存・復元・テンプレート反映で同じ一覧を使います。
const fieldIds = [
  "caseName",
  "grade",
  "scene",
  "problem",
  "easeValue",
  "personalMeaning",
  "idealSelf",
  "currentState",
  "idealState",
  "stuckPoint",
  "barrier",
  "microAction",
  "twoMinAction",
  "fiveMinAction",
  "tenMinAction",
  "cueWhen",
  "cueWhere",
  "cueSignal",
  "cueBehavior",
  "endCondition",
  "supportPrompt"
];

const fields = {};
let appState = createDefaultState();
let toastTimer;

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initializeApp);
} else {
  initializeApp();
}

function initializeApp() {
  cacheFields();
  setupEventListeners();
  loadData(false);
  renderAll();
}

function createDefaultState() {
  const firstCase = createBlankCase("最初のケース");
  return {
    version: 2,
    plan: "free",
    currentStep: 1,
    activeCaseId: firstCase.id,
    cases: [firstCase]
  };
}

function createBlankCase(name = "新しいケース") {
  const data = {};
  fieldIds.forEach((id) => {
    data[id] = "";
  });
  data.caseName = name;
  data.traits = [];
  data.records = [];

  return {
    id: makeId(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    data
  };
}

function cacheFields() {
  fieldIds.forEach((id) => {
    fields[id] = document.getElementById(id);
  });
}

function setupEventListeners() {
  fieldIds.forEach((id) => fields[id].addEventListener("input", handleInputChange));
  document.querySelectorAll("#traitsGroup input").forEach((checkbox) => checkbox.addEventListener("change", handleInputChange));

  document.getElementById("recordDate").valueAsDate = new Date();
  bindClick("addRecordBtn", addRecord);
  bindClick("saveBtn", () => saveData(true));
  bindClick("loadBtn", () => loadData(true));
  bindClick("resetBtn", resetCurrentCase);
  bindClick("printBtn", () => window.print());
  bindClick("prevStepBtn", () => moveStep(-1));
  bindClick("nextStepBtn", () => moveStep(1));
  bindClick("addCaseBtn", addCase);
  bindClick("deleteCaseBtn", deleteActiveCase);
  bindClick("csvBtn", exportCsv);
  bindClick("pdfBtn", handlePdfExport);
  bindClick("weeklyReviewBtn", renderWeeklyReview);
  bindClick("parentLetterBtn", renderParentLetter);
  bindClick("shareBtn", () => showUpgradeModal("共有機能は近日対応予定です。Pro/Team向け機能として設計しています。"));
  bindClick("exportJsonBtn", exportJsonBackup);
  bindClick("importJsonBtn", () => document.getElementById("jsonImportInput").click());
  bindClick("deleteAllDataBtn", deleteAllData);
  bindClick("modalCloseBtn", closeUpgradeModal);
  bindClick("modalUpgradeBtn", closeUpgradeModal);
  bindClick("navCreateBtn", () => showPlannerView({ step: 1 }));
  bindClick("navRecordsBtn", () => showPlannerView({ step: 8 }));
  bindClick("navPlansBtn", showPlansPage);
  bindClick("navEvidenceBtn", showEvidencePage);
  bindClick("scienceStartPlanBtn", () => showPlannerView({ step: 1 }));
  bindClick("scienceTemplateBtn", () => showPlannerView({ step: 1, targetId: "templateSection" }));
  bindClick("scienceProBtn", showPlansPage);

  document.getElementById("demoPlanSelect").addEventListener("change", (event) => setPlan(event.target.value));
  document.getElementById("caseSelect").addEventListener("change", (event) => switchCase(event.target.value));
  document.getElementById("jsonImportInput").addEventListener("change", importJsonBackup);
  document.querySelectorAll("[data-step-target]").forEach((button) => {
    button.addEventListener("click", () => showStep(Number(button.dataset.stepTarget)));
  });
}

function bindClick(id, handler) {
  const element = document.getElementById(id);
  if (element) element.addEventListener("click", handler);
}

function showPlannerView(options = {}) {
  document.getElementById("plannerPage").hidden = false;
  document.getElementById("plansPage").hidden = true;
  document.getElementById("evidencePage").hidden = true;
  document.querySelector(".progress-panel").hidden = false;
  setActiveNav(options.step === 8 ? "navRecordsBtn" : "navCreateBtn");

  if (options.step) showStep(options.step);
  else renderStep();

  requestAnimationFrame(() => {
    const target = options.targetId ? document.getElementById(options.targetId) : document.getElementById("plannerPage");
    if (target) target.scrollIntoView({ behavior: "smooth", block: "start" });
  });
}

function showPlansPage() {
  document.getElementById("plannerPage").hidden = true;
  document.getElementById("plansPage").hidden = false;
  document.getElementById("evidencePage").hidden = true;
  document.querySelector(".progress-panel").hidden = true;
  setActiveNav("navPlansBtn");
  requestAnimationFrame(() => window.scrollTo({ top: 0, behavior: "smooth" }));
}

function showEvidencePage() {
  document.getElementById("plannerPage").hidden = true;
  document.getElementById("plansPage").hidden = true;
  document.getElementById("evidencePage").hidden = false;
  document.querySelector(".progress-panel").hidden = true;
  setActiveNav("navEvidenceBtn");
  requestAnimationFrame(() => window.scrollTo({ top: 0, behavior: "smooth" }));
}

function setActiveNav(activeId) {
  document.querySelectorAll(".nav-link").forEach((button) => {
    button.classList.toggle("active", button.id === activeId);
  });
}

function handleInputChange() {
  updateActiveCaseFromForm();
  renderPlan();
  renderCaseManager();
  saveData(false);
}

function getCurrentPlan() {
  return planConfig[appState.plan] || planConfig.free;
}

function hasFeature(featureName) {
  return Boolean(getCurrentPlan().features[featureName]);
}

function setPlan(planName) {
  if (!planConfig[planName] || planName === "team") return;
  appState.plan = planName;
  saveData(false);
  renderAll();
  showToast(`${planConfig[planName].name}プランに切り替えました。`);
}

function getActiveCase() {
  const found = appState.cases.find((item) => item.id === appState.activeCaseId);
  if (found) return found;
  appState.activeCaseId = appState.cases[0]?.id;
  return appState.cases[0];
}

function getActiveData() {
  return getActiveCase().data;
}

function updateActiveCaseFromForm() {
  const activeCase = getActiveCase();
  if (!activeCase) return;
  fieldIds.forEach((id) => {
    activeCase.data[id] = fields[id].value.trim();
  });
  activeCase.data.traits = getSelectedTraits();
  activeCase.updatedAt = new Date().toISOString();
}

function applyCaseToForm() {
  const data = getActiveData();
  fieldIds.forEach((id) => {
    fields[id].value = data[id] || "";
  });
  setSelectedTraits(Array.isArray(data.traits) ? data.traits : []);
}

function getSelectedTraits() {
  return Array.from(document.querySelectorAll("#traitsGroup input:checked")).map((item) => item.value);
}

function setSelectedTraits(values) {
  document.querySelectorAll("#traitsGroup input").forEach((item) => {
    item.checked = values.includes(item.value);
  });
}

function addCase() {
  const plan = getCurrentPlan();
  if (appState.cases.length >= plan.caseLimit) {
    showUpgradeModal("Freeプランではケースは1件までです。複数ケースを管理するにはProをご利用ください。");
    return;
  }

  updateActiveCaseFromForm();
  const newCase = createBlankCase(`ケース${appState.cases.length + 1}`);
  appState.cases.push(newCase);
  appState.activeCaseId = newCase.id;
  appState.currentStep = 1;
  renderAll();
  saveData(false);
  showToast("ケースを追加しました。");
}

function switchCase(caseId) {
  if (!appState.cases.some((item) => item.id === caseId)) return;
  updateActiveCaseFromForm();
  appState.activeCaseId = caseId;
  renderAll();
  saveData(false);
}

function deleteActiveCase() {
  if (appState.cases.length <= 1) {
    showToast("最後の1件は削除できません。全削除はデータ管理から行えます。");
    return;
  }
  if (!window.confirm("現在のケースを削除しますか？")) return;

  appState.cases = appState.cases.filter((item) => item.id !== appState.activeCaseId);
  appState.activeCaseId = appState.cases[0].id;
  renderAll();
  saveData(false);
  showToast("ケースを削除しました。");
}

function resetCurrentCase() {
  if (!window.confirm("現在のケースの入力内容と記録をリセットしますか？")) return;
  const currentIndex = appState.cases.findIndex((item) => item.id === appState.activeCaseId);
  if (currentIndex < 0) return;

  const resetCase = createBlankCase("リセットしたケース");
  appState.cases[currentIndex] = resetCase;
  appState.activeCaseId = resetCase.id;
  appState.currentStep = 1;
  renderAll();
  saveData(false);
  showToast("現在のケースをリセットしました。");
}

function addRecord() {
  const records = getActiveData().records;
  const plan = getCurrentPlan();
  const recordDate = document.getElementById("recordDate");

  if (!recordDate.value) {
    showToast("日付を入力してください。");
    return;
  }
  if (Number.isFinite(plan.recordLimit) && records.length >= plan.recordLimit) {
    showUpgradeModal("Freeプランでは記録は7日分までです。長期記録を残すにはProをご利用ください。");
    return;
  }

  records.push({
    id: makeId(),
    date: recordDate.value,
    done: document.getElementById("recordDone").value,
    prompts: Math.max(0, Number(document.getElementById("promptCount").value || 0)),
    mood: document.getElementById("mood").value,
    memo: document.getElementById("recordMemo").value.trim()
  });

  records.sort((a, b) => a.date.localeCompare(b.date));
  document.getElementById("promptCount").value = 0;
  document.getElementById("recordMemo").value = "";
  renderRecords();
  saveData(false);
  showToast("記録を追加しました。");
}

function deleteRecord(id) {
  const records = getActiveData().records;
  const index = records.findIndex((record) => record.id === id);
  if (index < 0) return;

  records.splice(index, 1);
  renderRecords();
  saveData(false);
  showToast("記録を削除しました。");
}

function renderAll() {
  applyCaseToForm();
  renderStep();
  renderPlanStatus();
  renderPricingCards();
  renderCaseManager();
  renderTemplates();
  renderPlan();
  renderRecords();
  renderLockedFeatures();
}

function renderStep() {
  document.querySelectorAll("[data-step]").forEach((panel) => {
    panel.classList.toggle("active", Number(panel.dataset.step) === appState.currentStep);
  });
  document.querySelectorAll("[data-step-target]").forEach((button) => {
    button.classList.toggle("active", Number(button.dataset.stepTarget) === appState.currentStep);
  });

  document.getElementById("progressLabel").textContent = `Step ${appState.currentStep} / ${TOTAL_STEPS}`;
  document.getElementById("progressTitle").textContent = stepTitles[appState.currentStep - 1];
  document.getElementById("progressFill").style.width = `${(appState.currentStep / TOTAL_STEPS) * 100}%`;
  document.getElementById("prevStepBtn").disabled = appState.currentStep === 1;
  document.getElementById("nextStepBtn").disabled = appState.currentStep === TOTAL_STEPS;
  document.getElementById("nextStepBtn").textContent = appState.currentStep === TOTAL_STEPS ? "完了" : "次へ";
}

function showStep(step) {
  appState.currentStep = clampStep(step);
  renderStep();
  saveData(false);
}

function moveStep(amount) {
  showStep(appState.currentStep + amount);
}

function renderPlanStatus() {
  const plan = getCurrentPlan();
  document.getElementById("currentPlanBadge").textContent = plan.statusText;
  document.getElementById("demoPlanSelect").value = appState.plan;
}

function renderPricingCards() {
  const container = document.getElementById("pricingCards");
  container.innerHTML = Object.entries(planConfig).map(([key, plan]) => {
    const isCurrent = key === appState.plan;
    const action = key === "pro"
      ? `<button type="button" data-upgrade-button>アップグレード</button>`
      : key === "team"
        ? `<button type="button" class="ghost" data-upgrade-button>相談する</button>`
        : "";
    return `
      <article class="pricing-card ${isCurrent ? "current" : ""}">
        <h3>${escapeHtml(plan.name)} ${isCurrent ? `<span class="current-badge">現在</span>` : ""}</h3>
        <p class="price">${escapeHtml(plan.price)}</p>
        <ul class="feature-list">${plan.bullets.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul>
        ${action}
      </article>
    `;
  }).join("");

  container.querySelectorAll("[data-upgrade-button]").forEach((button) => {
    button.addEventListener("click", () => showUpgradeModal("現在はデモ版です。将来的に決済機能を接続します。"));
  });
}

function renderCaseManager() {
  const data = getActiveData();
  const plan = getCurrentPlan();
  const select = document.getElementById("caseSelect");

  select.innerHTML = appState.cases.map((item, index) => {
    const label = item.data.caseName || `ケース${index + 1}`;
    return `<option value="${escapeHtml(item.id)}">${escapeHtml(label)}</option>`;
  }).join("");
  select.value = appState.activeCaseId;

  document.getElementById("activeCaseLabel").textContent = `現在のケース：${data.caseName || "名称未設定のケース"}`;
  document.getElementById("caseLimitNote").textContent = `${plan.name}プラン：${appState.cases.length}/${plan.caseLimit}ケースを使用中`;
}

function renderTemplates() {
  const container = document.getElementById("templateList");
  const canUseAll = getCurrentPlan().templates === "all";

  container.innerHTML = templates.map((template) => {
    const locked = template.tier === "pro" && !canUseAll;
    return `
      <article class="template-card ${locked ? "locked" : ""}">
        <strong>${escapeHtml(template.name)} ${locked ? `<span class="pro-badge">Pro</span>` : ""}</strong>
        <button type="button" class="${locked ? "ghost" : ""}" data-template-id="${escapeHtml(template.id)}">${locked ? "ロック中" : "使う"}</button>
        ${locked ? `<span class="lock-note">Proで利用できます。</span>` : ""}
      </article>
    `;
  }).join("");

  container.querySelectorAll("[data-template-id]").forEach((button) => {
    button.addEventListener("click", () => applyTemplate(button.dataset.templateId));
  });
}

function applyTemplate(templateId) {
  const template = templates.find((item) => item.id === templateId);
  if (!template) return;

  if (template.tier === "pro" && getCurrentPlan().templates !== "all") {
    showUpgradeModal("このテンプレートはPro限定です。全テンプレートを使うにはProをご利用ください。");
    return;
  }

  Object.entries(template.values).forEach(([key, value]) => {
    if (key === "traits") setSelectedTraits(value);
    else if (fields[key]) fields[key].value = value;
  });

  updateActiveCaseFromForm();
  renderPlan();
  renderCaseManager();
  saveData(false);
  showToast("テンプレートを反映しました。");
}

function renderPlan() {
  const data = getActiveData();
  const behaviorSentence = buildBehaviorSentence(data);
  const caseSummary = compactJoin([
    plain(data.caseName),
    plain(data.grade),
    plain(data.scene) ? `場面：${plain(data.scene)}` : "",
    plain(data.problem) ? `困りごと：${plain(data.problem)}` : ""
  ], " / ");
  const valueItems = [labeledText("楽になること", data.easeValue), labeledText("本人にとっての意味", data.personalMeaning), labeledText("理想の自分", data.idealSelf)].filter(Boolean);
  const currentIdealItems = [labeledText("現状", data.currentState), labeledText("理想", data.idealState), labeledText("詰まりポイント", data.stuckPoint), labeledText("邪魔しているもの", data.barrier)].filter(Boolean);

  const planBlocks = [
    sectionBlock("ケース概要", caseSummary),
    sectionBlock("狙う下位側面", data.traits.length ? data.traits.join("、") : ""),
    listBlock("本人にとっての価値", valueItems),
    listBlock("現状と理想", currentIdealItems),
    sectionBlock("最小行動", plain(data.microAction)),
    behaviorSentence ? sectionBlock("cue → behavior文", behaviorSentence, "behavior-sentence") : "",
    sectionBlock("支援者の声かけ例", plain(data.supportPrompt) ? `「${plain(data.supportPrompt)}」` : ""),
    weeklyRecordBlock(),
    sectionBlock("見直し基準", "成功率80%以上なら少し難易度を上げます。50〜79%なら同じ行動を継続します。50%未満なら行動をもっと小さくし、cueや邪魔しているものを見直します。")
  ].filter(Boolean);

  document.getElementById("planOutput").innerHTML = planBlocks.length ? planBlocks.join("") : `<p>入力を進めると、ここに介入計画書が表示されます。</p>`;
}

function buildBehaviorSentence(data) {
  const cueParts = compactJoin([plain(data.cueWhen), plain(data.cueWhere), plain(data.cueSignal)], "、");
  const behavior = plain(data.cueBehavior) || plain(data.microAction);
  const end = plain(data.endCondition);
  if (!cueParts && !behavior && !end) return "";

  const firstSentence = compactJoin([cueParts, behavior], "、");
  return `${firstSentence ? `${firstSentence}。` : ""}${end ? `終わったら${end}。` : ""}`;
}

function renderRecords() {
  const body = document.getElementById("recordsBody");
  const records = getActiveData().records;

  body.innerHTML = records.length ? records.map((record) => `
    <tr>
      <td>${escapeHtml(formatDate(record.date))}</td>
      <td>${record.done === "yes" ? "できた" : "できなかった"}</td>
      <td>${escapeHtml(String(record.prompts))}回</td>
      <td>${escapeHtml(record.mood)}</td>
      <td>${escapeHtml(record.memo || "")}</td>
      <td class="no-print"><button type="button" class="small-btn" data-delete-id="${escapeHtml(record.id)}">削除</button></td>
    </tr>
  `).join("") : `<tr><td colspan="6">まだ記録がありません。</td></tr>`;

  body.querySelectorAll("[data-delete-id]").forEach((button) => {
    button.addEventListener("click", () => deleteRecord(button.dataset.deleteId));
  });

  renderStats();
}

function renderStats() {
  const records = getActiveData().records;
  const stats = calculateRecordStats(records);
  document.getElementById("successRate").textContent = `${stats.rate}%`;
  document.getElementById("recordCount").textContent = `${stats.total}件`;
  document.getElementById("suggestion").textContent = hasFeature("detailedSuggestion")
    ? getDetailedSuggestion(records)
    : getSimpleSuggestion(stats.rate, stats.total);
}

function renderWeeklyReview() {
  if (!hasFeature("weeklyReview")) {
    showUpgradeModal("週次レビューはPro機能です。記録内容に基づく振り返りを使うにはProをご利用ください。");
    return;
  }
  showGeneratedText("weeklyReviewOutput", "週次レビュー", generateWeeklyReview(getActiveData().records));
}

function renderParentLetter() {
  if (!hasFeature("parentLetter")) {
    showUpgradeModal("保護者説明文生成はPro機能です。家庭向けの説明文を使うにはProをご利用ください。");
    return;
  }
  showGeneratedText("parentLetterOutput", "保護者説明文", generateParentLetter(getActiveData(), buildBehaviorSentence(getActiveData())));
}

function showGeneratedText(id, title, body) {
  const output = document.getElementById(id);
  output.classList.add("show");
  output.innerHTML = `<h3>${escapeHtml(title)}</h3><p>${escapeHtml(body)}</p>`;
}

function exportCsv() {
  if (!hasFeature("csvExport")) {
    showUpgradeModal("CSV出力はPro機能です。記録データを書き出すにはProをご利用ください。");
    return;
  }

  const records = getActiveData().records;
  const headers = ["日付", "実行できたか", "声かけ回数", "気分", "メモ"];
  const rows = records.map((record) => [record.date, record.done === "yes" ? "できた" : "できなかった", record.prompts, record.mood, record.memo]);
  const csv = [headers, ...rows].map((row) => row.map(csvCell).join(",")).join("\n");
  downloadFile("\uFEFF" + csv, `${fileSafeName(getActiveData().caseName || "records")}.csv`, "text/csv;charset=utf-8");
}

function handlePdfExport() {
  if (!hasFeature("pdfExport")) {
    showUpgradeModal("PDF出力はPro機能です。今回は実装しやすい構造としてボタンを用意しています。");
    return;
  }
  window.print();
  showToast("現在のデモ版では印刷画面からPDF保存してください。");
}

function renderLockedFeatures() {
  document.querySelectorAll("[data-feature]").forEach((button) => {
    const locked = !hasFeature(button.dataset.feature);
    button.classList.toggle("locked", locked);
    button.title = locked ? "この機能はProプランで利用できます。" : "";
  });

  const isFree = appState.plan === "free";
  document.getElementById("planFeatureLockNote").textContent = isFree ? "PDF出力、CSV出力、保護者説明文、共有機能はPro機能です。" : "共有機能は近日対応予定です。";
  document.getElementById("recordFeatureLockNote").textContent = isFree ? "週次レビューはPro機能です。" : "";
}

function exportJsonBackup() {
  updateActiveCaseFromForm();
  downloadFile(serializeAppStateForBackup(appState), "kinbensei-backup.json", "application/json");
}

function importJsonBackup(event) {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = () => {
    try {
      appState = normalizeState(parseAppStateBackup(reader.result));
      persistAppState(appState);
      renderAll();
      showToast("JSONバックアップを読み込みました。");
    } catch (error) {
      showToast("JSONファイルを読み込めませんでした。");
    } finally {
      event.target.value = "";
    }
  };
  reader.readAsText(file);
}

function deleteAllData() {
  if (!window.confirm("全ケース・記録・プラン設定を削除しますか？")) return;
  clearPersistedAppState();
  appState = createDefaultState();
  renderAll();
  showToast("全データを削除しました。");
}

function saveData(showMessage = true) {
  updateActiveCaseFromForm();
  persistAppState(appState);
  if (showMessage) showToast("保存しました。");
}

function loadData(showMessage = true) {
  try {
    const raw = fetchAppState();
    if (!raw) {
      if (showMessage) showToast("保存データはまだありません。");
      return;
    }
    appState = normalizeState(raw);
    renderAll();
    if (showMessage) showToast("読み込みました。");
  } catch (error) {
    showToast("保存データを読み込めませんでした。");
  }
}

function normalizeState(raw) {
  if (raw && Array.isArray(raw.cases)) {
    const state = {
      version: 2,
      plan: planConfig[raw.plan] ? raw.plan : "free",
      currentStep: clampStep(raw.currentStep),
      activeCaseId: raw.activeCaseId,
      cases: raw.cases.map(normalizeCase).filter(Boolean)
    };
    if (!state.cases.length) state.cases = [createBlankCase("最初のケース")];
    if (!state.cases.some((item) => item.id === state.activeCaseId)) state.activeCaseId = state.cases[0].id;
    return state;
  }

  const migratedCase = createBlankCase(raw?.caseName || "移行したケース");
  migratedCase.data = normalizeCaseData(raw || {});
  return { version: 2, plan: "free", currentStep: clampStep(raw?.currentStep), activeCaseId: migratedCase.id, cases: [migratedCase] };
}

function normalizeCase(rawCase) {
  if (!rawCase) return null;
  return {
    id: rawCase.id || makeId(),
    createdAt: rawCase.createdAt || new Date().toISOString(),
    updatedAt: rawCase.updatedAt || new Date().toISOString(),
    data: normalizeCaseData(rawCase.data || rawCase)
  };
}

function normalizeCaseData(rawData) {
  const data = {};
  fieldIds.forEach((id) => {
    data[id] = rawData[id] || "";
  });
  data.traits = Array.isArray(rawData.traits) ? rawData.traits : [];
  data.records = Array.isArray(rawData.records) ? rawData.records.map(normalizeRecord) : [];
  return data;
}

function normalizeRecord(record) {
  return {
    id: record.id || makeId(),
    date: record.date || "",
    done: record.done === "no" ? "no" : "yes",
    prompts: Math.max(0, Number(record.prompts || 0)),
    mood: record.mood || "ふつう",
    memo: record.memo || ""
  };
}

function showUpgradeModal(message) {
  document.getElementById("upgradeModalMessage").textContent = message;
  document.getElementById("upgradeModal").hidden = false;
}

function closeUpgradeModal() {
  document.getElementById("upgradeModal").hidden = true;
}

function plain(value) {
  return value && String(value).trim() ? String(value).trim() : "";
}

function compactJoin(items, separator) {
  return items.filter(Boolean).join(separator);
}

function labeledText(label, value) {
  const cleanValue = plain(value);
  return cleanValue ? `${label}：${cleanValue}` : "";
}

function sectionBlock(title, body, className = "") {
  if (!body) return "";
  const classAttribute = className ? ` class="${className}"` : "";
  return `<h3>${escapeHtml(title)}</h3><p${classAttribute}>${escapeHtml(body)}</p>`;
}

function listBlock(title, items) {
  if (!items.length) return "";
  return `<h3>${escapeHtml(title)}</h3><ul class="plan-list">${items.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul>`;
}

function weeklyRecordBlock() {
  const rows = Array.from({ length: 7 }, (_, index) => `<tr><td>${index + 1}日目</td><td></td><td></td><td></td></tr>`).join("");
  return `<h3>1週間の記録欄</h3><table class="weekly-record"><thead><tr><th>日</th><th>実行</th><th>声かけ回数</th><th>メモ</th></tr></thead><tbody>${rows}</tbody></table>`;
}

function formatDate(value) {
  if (!value) return "";
  const [year, month, day] = value.split("-");
  return `${year}/${month}/${day}`;
}

function csvCell(value) {
  return `"${String(value ?? "").replaceAll('"', '""')}"`;
}

function downloadFile(content, fileName, type) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  link.click();
  URL.revokeObjectURL(url);
}

function fileSafeName(value) {
  return String(value).replace(/[\\/:*?"<>|]/g, "_") || "download";
}

function clampStep(value) {
  return Math.min(TOTAL_STEPS, Math.max(1, Number(value) || 1));
}

function makeId() {
  return window.crypto && window.crypto.randomUUID ? window.crypto.randomUUID() : `${Date.now()}-${Math.random()}`;
}

function showToast(message) {
  const toast = document.getElementById("toast");
  toast.textContent = message;
  toast.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove("show"), 2200);
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
