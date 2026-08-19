(() => {
  "use strict";

  const STORAGE_COMPANIES = "gongsu_companies_v1";
  const STORAGE_RECORDS = "gongsu_records_v1";
  const PALETTE = ["#2563eb", "#dc2626", "#16a34a", "#d97706", "#7c3aed", "#0891b2", "#db2777", "#65a30d", "#ea580c", "#4f46e5"];
  const WEEKDAY = ["일", "월", "화", "수", "목", "금", "토"];

  // Korean public holidays (fixed + lunar-based, incl. substitute holidays). Data beyond this
  // range simply renders with no holiday label; gongsu tracking itself is unaffected.
  const HOLIDAYS = {
    "2025-01-01": "신정",
    "2025-01-28": "설날 연휴",
    "2025-01-29": "설날",
    "2025-01-30": "설날 연휴",
    "2025-03-01": "삼일절",
    "2025-03-03": "대체공휴일",
    "2025-05-01": "근로자의 날",
    "2025-05-05": "어린이날·부처님오신날",
    "2025-05-06": "대체공휴일",
    "2025-06-06": "현충일",
    "2025-08-15": "광복절",
    "2025-10-03": "개천절",
    "2025-10-05": "추석 연휴",
    "2025-10-06": "추석",
    "2025-10-07": "추석 연휴",
    "2025-10-08": "대체공휴일",
    "2025-10-09": "한글날",
    "2025-12-25": "성탄절",

    "2026-01-01": "신정",
    "2026-02-16": "설날 연휴",
    "2026-02-17": "설날",
    "2026-02-18": "설날 연휴",
    "2026-03-01": "삼일절",
    "2026-03-02": "대체공휴일",
    "2026-05-01": "근로자의 날",
    "2026-05-05": "어린이날",
    "2026-05-24": "부처님오신날",
    "2026-05-25": "대체공휴일",
    "2026-06-06": "현충일",
    "2026-07-17": "제헌절",
    "2026-08-15": "광복절",
    "2026-08-17": "대체공휴일",
    "2026-09-24": "추석 연휴",
    "2026-09-25": "추석",
    "2026-09-26": "추석 연휴",
    "2026-10-03": "개천절",
    "2026-10-05": "대체공휴일",
    "2026-10-09": "한글날",
    "2026-12-25": "성탄절",

    "2027-01-01": "신정",
    "2027-02-06": "설날 연휴",
    "2027-02-07": "설날",
    "2027-02-08": "설날 연휴",
    "2027-02-09": "대체공휴일",
    "2027-03-01": "삼일절",
    "2027-05-01": "근로자의 날",
    "2027-05-05": "어린이날",
    "2027-05-13": "부처님오신날",
    "2027-06-06": "현충일",
    "2027-07-17": "제헌절",
    "2027-08-15": "광복절",
    "2027-08-16": "대체공휴일",
    "2027-09-14": "추석 연휴",
    "2027-09-15": "추석",
    "2027-09-16": "추석 연휴",
    "2027-10-03": "개천절",
    "2027-10-04": "대체공휴일",
    "2027-10-09": "한글날",
    "2027-10-11": "대체공휴일",
    "2027-12-25": "성탄절",
    "2027-12-27": "대체공휴일",

    "2028-01-01": "신정",
    "2028-01-26": "설날 연휴",
    "2028-01-27": "설날",
    "2028-01-28": "설날 연휴",
    "2028-03-01": "삼일절",
    "2028-05-01": "근로자의 날",
    "2028-05-02": "부처님오신날",
    "2028-05-05": "어린이날",
    "2028-06-06": "현충일",
    "2028-07-17": "제헌절",
    "2028-08-15": "광복절",
    "2028-10-02": "추석 연휴",
    "2028-10-03": "추석·개천절",
    "2028-10-04": "추석 연휴",
    "2028-10-05": "대체공휴일",
    "2028-10-09": "한글날",
    "2028-12-25": "성탄절",
  };

  // ---------- storage ----------
  function loadCompanies() {
    try { return JSON.parse(localStorage.getItem(STORAGE_COMPANIES)) || []; }
    catch (e) { return []; }
  }
  function saveCompanies(list) { localStorage.setItem(STORAGE_COMPANIES, JSON.stringify(list)); }
  function loadRecords() {
    try { return JSON.parse(localStorage.getItem(STORAGE_RECORDS)) || []; }
    catch (e) { return []; }
  }
  function saveRecords(list) { localStorage.setItem(STORAGE_RECORDS, JSON.stringify(list)); }
  function getCompanyById(id) { return loadCompanies().find((c) => c.id === id); }

  function uid() { return Date.now().toString(36) + Math.random().toString(36).slice(2, 8); }

  function addCompanyIfNotExists(name) {
    const companies = loadCompanies();
    const existing = companies.find((c) => c.name === name);
    if (existing) return existing;
    const company = { id: uid(), name, color: PALETTE[companies.length % PALETTE.length] };
    companies.push(company);
    saveCompanies(companies);
    return company;
  }

  // ---------- formatting ----------
  function escapeHtml(str) {
    return String(str).replace(/[&<>"']/g, (ch) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[ch]));
  }
  function formatGongsu(v) {
    const n = Math.round(v * 100) / 100;
    return parseFloat(n.toFixed(2)).toString();
  }
  function formatGongsuUnit(v) {
    return formatGongsu(v) + " 공수";
  }
  function toLocalDateStr(d) {
    const y = d.getFullYear(), m = String(d.getMonth() + 1).padStart(2, "0"), day = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
  }
  function todayStr() { return toLocalDateStr(new Date()); }
  function currentMonthYm() { return todayStr().slice(0, 7); }
  function formatShortDate(dateStr) {
    const [, m, d] = dateStr.split("-");
    return `${parseInt(m, 10)}/${parseInt(d, 10)}`;
  }
  function formatDateHeading(dateStr) {
    const d = new Date(dateStr + "T00:00:00");
    return `${d.getMonth() + 1}월 ${d.getDate()}일 (${WEEKDAY[d.getDay()]})`;
  }
  function formatMonthLabel(ym) {
    const [y, m] = ym.split("-");
    return `${y}년 ${parseInt(m, 10)}월`;
  }
  function shiftMonth(ym, delta) {
    const [y, m] = ym.split("-").map(Number);
    const d = new Date(y, m - 1 + delta, 1);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
  }

  // ---------- toast ----------
  let toastTimer;
  function toast(msg) {
    const el = document.getElementById("toast");
    el.textContent = msg;
    el.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => el.classList.remove("show"), 1800);
  }

  // ---------- state ----------
  let currentView = "input";
  const inputState = { companyId: null };
  const editState = { id: null, companyId: null };
  const monthState = { ym: currentMonthYm() };
  const calendarState = { ym: currentMonthYm(), selectedDate: todayStr() };

  function getSuggestedCompanyForDate(dateStr) {
    const records = loadRecords();
    const companies = loadCompanies();
    const prior = records
      .filter((r) => r.date < dateStr)
      .sort((a, b) => b.date.localeCompare(a.date) || b.createdAt - a.createdAt);
    if (prior.length && companies.some((c) => c.id === prior[0].companyId)) return prior[0].companyId;
    return companies.length ? companies[0].id : null;
  }

  // ---------- company chip selector (shared) ----------
  function renderCompanyChips(container, selectedId, onSelect) {
    container.innerHTML = "";
    const companies = loadCompanies();
    companies.forEach((c) => {
      const btn = document.createElement("button");
      btn.type = "button";
      const selected = c.id === selectedId;
      btn.className = "company-chip" + (selected ? " selected" : "");
      btn.textContent = c.name;
      if (selected) btn.style.background = c.color;
      btn.addEventListener("click", () => onSelect(c.id));
      container.appendChild(btn);
    });
    const addBtn = document.createElement("button");
    addBtn.type = "button";
    addBtn.className = "company-chip add-new";
    addBtn.textContent = "+ 새 업체";
    addBtn.addEventListener("click", () => {
      const name = prompt("업체명을 입력하세요");
      if (!name || !name.trim()) return;
      const company = addCompanyIfNotExists(name.trim());
      onSelect(company.id);
    });
    container.appendChild(addBtn);
  }

  function refreshInputCompanyChips() {
    renderCompanyChips(document.getElementById("company-chip-row"), inputState.companyId, (id) => {
      inputState.companyId = id;
      refreshInputCompanyChips();
    });
  }
  function refreshEditCompanyChips() {
    renderCompanyChips(document.getElementById("edit-company-chip-row"), editState.companyId, (id) => {
      editState.companyId = id;
      refreshEditCompanyChips();
    });
  }

  // ---------- gongsu presets ----------
  const GONGSU_PRESETS = [0.5, 1, 1.5, 2, 2.5, 3];
  function renderGongsuPresets(containerId, inputId) {
    const container = document.getElementById(containerId);
    container.innerHTML = "";
    GONGSU_PRESETS.forEach((v) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "preset-chip";
      btn.textContent = formatGongsu(v);
      btn.addEventListener("click", () => {
        document.getElementById(inputId).value = v;
        updateGongsuPresetHighlight(containerId, inputId);
      });
      container.appendChild(btn);
    });
    updateGongsuPresetHighlight(containerId, inputId);
  }
  function updateGongsuPresetHighlight(containerId, inputId) {
    const val = parseFloat(document.getElementById(inputId).value);
    document.querySelectorAll("#" + containerId + " .preset-chip").forEach((btn) => {
      btn.classList.toggle("selected", parseFloat(btn.textContent) === val);
    });
  }
  function adjustGongsu(elId, delta, presetContainerId) {
    const el = document.getElementById(elId);
    let v = (parseFloat(el.value) || 0) + delta;
    v = Math.max(0, Math.round(v * 100) / 100);
    el.value = v;
    if (presetContainerId) updateGongsuPresetHighlight(presetContainerId, elId);
  }

  // ---------- record list rendering ----------
  function createRecordItemEl(record, opts = {}) {
    const company = getCompanyById(record.companyId);
    const el = document.createElement("div");
    el.className = "record-item";
    const namePart = (opts.showDate ? formatShortDate(record.date) + " · " : "") + (company ? escapeHtml(company.name) : "(삭제된 업체)");
    el.innerHTML = `
      <span class="record-dot" style="background:${company ? company.color : "#ccc"}"></span>
      <div class="record-main">
        <div class="record-company">${namePart}</div>
        ${record.memo ? `<div class="record-memo">${escapeHtml(record.memo)}</div>` : ""}
      </div>
      <div class="record-gongsu">${formatGongsu(record.gongsu)}</div>
      ${opts.onDelete ? '<button type="button" class="record-delete-btn">삭제</button>' : ""}
    `;
    el.addEventListener("click", () => (opts.onClick ? opts.onClick(record) : openEditModal(record.id)));
    if (opts.onDelete) {
      el.querySelector(".record-delete-btn").addEventListener("click", (e) => {
        e.stopPropagation();
        opts.onDelete(record);
      });
    }
    return el;
  }

  function renderFlatRecordList(container, records, opts = { showDate: true }) {
    container.innerHTML = "";
    if (records.length === 0) {
      container.innerHTML = '<div class="record-empty">입력된 기록이 없습니다</div>';
      return;
    }
    records.forEach((r) => container.appendChild(createRecordItemEl(r, opts)));
  }

  function renderGroupedRecordList(container, records) {
    container.innerHTML = "";
    if (records.length === 0) {
      container.innerHTML = '<div class="record-empty">이번 달 기록이 없습니다</div>';
      return;
    }
    const byDate = {};
    records.forEach((r) => { (byDate[r.date] = byDate[r.date] || []).push(r); });
    Object.keys(byDate).sort((a, b) => b.localeCompare(a)).forEach((date) => {
      const heading = document.createElement("div");
      heading.className = "record-date-heading";
      heading.textContent = formatDateHeading(date);
      container.appendChild(heading);
      const group = document.createElement("div");
      group.className = "record-date-group";
      byDate[date].sort((a, b) => b.createdAt - a.createdAt).forEach((r) => group.appendChild(createRecordItemEl(r)));
      container.appendChild(group);
    });
  }

  function renderSummaryByCompany(container, records) {
    container.innerHTML = "";
    if (records.length === 0) {
      container.innerHTML = '<div class="summary-empty">기록이 없습니다</div>';
      return;
    }
    const map = new Map();
    records.forEach((r) => {
      const cur = map.get(r.companyId) || { sum: 0, count: 0 };
      cur.sum += r.gongsu;
      cur.count += 1;
      map.set(r.companyId, cur);
    });
    [...map.entries()].sort((a, b) => b[1].sum - a[1].sum).forEach(([companyId, { sum, count }]) => {
      const company = getCompanyById(companyId);
      const el = document.createElement("div");
      el.className = "summary-item";
      el.innerHTML = `
        <span class="record-dot" style="background:${company ? company.color : "#ccc"}"></span>
        <span class="summary-name">${company ? escapeHtml(company.name) : "(삭제된 업체)"}</span>
        <span class="summary-count">${count}건</span>
        <span class="summary-value">${formatGongsuUnit(sum)}</span>
      `;
      container.appendChild(el);
    });
  }

  function renderMonthSummary(container, records) {
    container.innerHTML = "";
    if (records.length === 0) {
      container.innerHTML = '<div class="summary-empty">기록이 없습니다</div>';
      return;
    }
    const map = new Map();
    records.forEach((r) => {
      const ym = r.date.slice(0, 7);
      const cur = map.get(ym) || { sum: 0, count: 0 };
      cur.sum += r.gongsu;
      cur.count += 1;
      map.set(ym, cur);
    });
    [...map.entries()].sort((a, b) => b[0].localeCompare(a[0])).forEach(([ym, { sum, count }]) => {
      const el = document.createElement("div");
      el.className = "summary-item clickable";
      el.innerHTML = `
        <span class="summary-name">${formatMonthLabel(ym)}</span>
        <span class="summary-count">${count}건</span>
        <span class="summary-value">${formatGongsuUnit(sum)}</span>
      `;
      el.addEventListener("click", () => {
        monthState.ym = ym;
        switchView("month");
      });
      container.appendChild(el);
    });
  }

  // ---------- calendar (input tab) ----------
  function getCalendarCells(ym) {
    const [y, m] = ym.split("-").map(Number);
    const firstWeekday = new Date(y, m - 1, 1).getDay();
    const daysInMonth = new Date(y, m, 0).getDate();
    const cells = [];
    for (let i = 0; i < firstWeekday; i++) {
      cells.push({ date: toLocalDateStr(new Date(y, m - 1, 1 - (firstWeekday - i))), inMonth: false });
    }
    for (let day = 1; day <= daysInMonth; day++) {
      cells.push({ date: toLocalDateStr(new Date(y, m - 1, day)), inMonth: true });
    }
    while (cells.length % 7 !== 0) {
      const last = new Date(cells[cells.length - 1].date + "T00:00:00");
      last.setDate(last.getDate() + 1);
      cells.push({ date: toLocalDateStr(last), inMonth: false });
    }
    return cells;
  }

  function renderCalendar() {
    document.getElementById("cal-month-label").textContent = formatMonthLabel(calendarState.ym);
    const sumsByDate = new Map();
    loadRecords().forEach((r) => sumsByDate.set(r.date, (sumsByDate.get(r.date) || 0) + r.gongsu));

    const container = document.getElementById("calendar-grid");
    container.innerHTML = "";
    const today = todayStr();
    getCalendarCells(calendarState.ym).forEach(({ date, inMonth }) => {
      const d = new Date(date + "T00:00:00");
      const weekday = d.getDay();
      const holidayLabel = HOLIDAYS[date];
      const classes = ["calendar-cell"];
      if (!inMonth) classes.push("out-month");
      if (weekday === 0) classes.push("sunday");
      if (weekday === 6) classes.push("saturday");
      if (holidayLabel) classes.push("holiday");
      if (date === today) classes.push("today");
      if (date === calendarState.selectedDate) classes.push("selected");

      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = classes.join(" ");
      const sum = sumsByDate.get(date);
      btn.innerHTML = `
        <span class="cell-day-num">${d.getDate()}</span>
        ${holidayLabel ? `<span class="cell-holiday-label">${escapeHtml(holidayLabel)}</span>` : ""}
        ${sum ? `<span class="cell-gongsu-badge">${formatGongsu(sum)}</span>` : ""}
      `;
      btn.addEventListener("click", () => selectDate(date));
      btn.addEventListener("dblclick", (e) => {
        e.preventDefault();
        openDayModal(date);
      });
      container.appendChild(btn);
    });
  }

  function renderSelectedDateHeading() {
    const suffix = calendarState.selectedDate === todayStr() ? " · 오늘" : "";
    document.getElementById("selected-date-heading").textContent = formatDateHeading(calendarState.selectedDate) + suffix;
  }

  function renderDayRecordList() {
    const records = loadRecords()
      .filter((r) => r.date === calendarState.selectedDate)
      .sort((a, b) => b.createdAt - a.createdAt);
    renderFlatRecordList(document.getElementById("day-record-list"), records, { showDate: false });
  }

  function selectDate(dateStr) {
    calendarState.selectedDate = dateStr;
    calendarState.ym = dateStr.slice(0, 7);
    inputState.companyId = getSuggestedCompanyForDate(dateStr);
    renderCalendar();
    renderSelectedDateHeading();
    refreshInputCompanyChips();
    renderDayRecordList();
  }

  // ---------- day quick-edit modal (double-tap a calendar date) ----------
  const dayModalState = { date: null, companyId: null };

  function refreshDayModalCompanyChips() {
    renderCompanyChips(document.getElementById("day-modal-company-chip-row"), dayModalState.companyId, (id) => {
      dayModalState.companyId = id;
      refreshDayModalCompanyChips();
    });
  }

  function renderDayModalList() {
    const records = loadRecords()
      .filter((r) => r.date === dayModalState.date)
      .sort((a, b) => b.createdAt - a.createdAt);
    const container = document.getElementById("day-modal-list");
    container.innerHTML = "";
    if (records.length === 0) {
      container.innerHTML = '<div class="record-empty">입력된 기록이 없습니다</div>';
      return;
    }
    records.forEach((r) => container.appendChild(createRecordItemEl(r, {
      showDate: false,
      onClick: (rec) => { closeDayModal(); openEditModal(rec.id); },
      onDelete: (rec) => {
        if (!confirm("이 공수 기록을 삭제할까요?")) return;
        saveRecords(loadRecords().filter((x) => x.id !== rec.id));
        toast("삭제했습니다");
        renderDayModalList();
        renderCalendar();
        if (calendarState.selectedDate === dayModalState.date) renderDayRecordList();
      },
    })));
  }

  function openDayModal(dateStr) {
    dayModalState.date = dateStr;
    dayModalState.companyId = getSuggestedCompanyForDate(dateStr);
    document.getElementById("day-modal-heading").textContent = formatDateHeading(dateStr);
    document.getElementById("day-modal-gongsu").value = 1;
    document.getElementById("day-modal-memo").value = "";
    renderDayModalList();
    refreshDayModalCompanyChips();
    renderGongsuPresets("day-modal-gongsu-presets", "day-modal-gongsu");
    document.getElementById("day-modal").classList.add("active");
  }

  function closeDayModal() {
    document.getElementById("day-modal").classList.remove("active");
  }

  function renderMonth() {
    document.getElementById("month-label").textContent = formatMonthLabel(monthState.ym);
    const records = loadRecords().filter((r) => r.date.slice(0, 7) === monthState.ym);
    const total = records.reduce((s, r) => s + r.gongsu, 0);
    document.getElementById("month-total").textContent = formatGongsuUnit(total);
    renderSummaryByCompany(document.getElementById("month-company-summary"), records);
    renderGroupedRecordList(document.getElementById("month-record-list"), records);
  }

  function renderStats() {
    const records = loadRecords();
    renderSummaryByCompany(document.getElementById("all-company-summary"), records);
    renderMonthSummary(document.getElementById("all-month-summary"), records);
  }

  function renderCompaniesTab() {
    const container = document.getElementById("company-manage-list");
    container.innerHTML = "";
    const companies = loadCompanies();
    const records = loadRecords();
    if (companies.length === 0) {
      container.innerHTML = '<div class="record-empty">등록된 업체가 없습니다</div>';
      return;
    }
    companies.forEach((c) => {
      const usedCount = records.filter((r) => r.companyId === c.id).length;
      const el = document.createElement("div");
      el.className = "manage-item";
      el.innerHTML = `
        <span class="record-dot" style="background:${c.color}"></span>
        <span class="manage-name">${escapeHtml(c.name)}</span>
        <button type="button" class="manage-btn" data-action="rename">이름변경</button>
        <button type="button" class="manage-btn danger" data-action="delete">삭제</button>
      `;
      el.querySelector('[data-action="rename"]').addEventListener("click", () => {
        const name = prompt("새 업체명을 입력하세요", c.name);
        if (!name || !name.trim()) return;
        c.name = name.trim();
        saveCompanies(companies);
        renderCompaniesTab();
      });
      el.querySelector('[data-action="delete"]').addEventListener("click", () => {
        const msg = usedCount > 0
          ? `이 업체는 ${usedCount}건의 기록에 사용 중입니다. 삭제해도 기록은 남지만 업체명이 "(삭제된 업체)"로 표시됩니다. 삭제할까요?`
          : `"${c.name}" 업체를 삭제할까요?`;
        if (!confirm(msg)) return;
        const idx = companies.findIndex((x) => x.id === c.id);
        companies.splice(idx, 1);
        saveCompanies(companies);
        renderCompaniesTab();
      });
      container.appendChild(el);
    });
  }

  function renderCurrentView() {
    if (currentView === "input") {
      renderCalendar();
      renderSelectedDateHeading();
      refreshInputCompanyChips();
      renderDayRecordList();
    }
    else if (currentView === "month") renderMonth();
    else if (currentView === "stats") renderStats();
    else if (currentView === "companies") renderCompaniesTab();
  }

  function switchView(view) {
    currentView = view;
    document.querySelectorAll(".view").forEach((v) => v.classList.remove("active"));
    document.getElementById("view-" + view).classList.add("active");
    document.querySelectorAll(".nav-btn").forEach((b) => b.classList.toggle("active", b.dataset.view === view));
    const titles = { input: "공수체크", month: "월별현황", stats: "전체통계", companies: "업체관리" };
    document.getElementById("header-title").textContent = titles[view];
    renderCurrentView();
  }

  // ---------- edit modal ----------
  function openEditModal(id) {
    const record = loadRecords().find((r) => r.id === id);
    if (!record) return;
    editState.id = id;
    editState.companyId = record.companyId;
    document.getElementById("edit-date").value = record.date;
    document.getElementById("edit-gongsu").value = record.gongsu;
    document.getElementById("edit-memo").value = record.memo || "";
    refreshEditCompanyChips();
    document.getElementById("edit-modal").classList.add("active");
  }
  function closeEditModal() {
    document.getElementById("edit-modal").classList.remove("active");
    editState.id = null;
  }

  // ---------- init ----------
  function init() {
    renderGongsuPresets("gongsu-presets", "input-gongsu");
    inputState.companyId = getSuggestedCompanyForDate(calendarState.selectedDate);

    document.querySelectorAll(".nav-btn").forEach((b) => b.addEventListener("click", () => switchView(b.dataset.view)));

    document.getElementById("cal-prev").addEventListener("click", () => { calendarState.ym = shiftMonth(calendarState.ym, -1); renderCalendar(); });
    document.getElementById("cal-next").addEventListener("click", () => { calendarState.ym = shiftMonth(calendarState.ym, 1); renderCalendar(); });

    document.getElementById("gongsu-minus").addEventListener("click", () => adjustGongsu("input-gongsu", -0.5, "gongsu-presets"));
    document.getElementById("gongsu-plus").addEventListener("click", () => adjustGongsu("input-gongsu", 0.5, "gongsu-presets"));
    document.getElementById("input-gongsu").addEventListener("input", () => updateGongsuPresetHighlight("gongsu-presets", "input-gongsu"));

    document.getElementById("save-btn").addEventListener("click", () => {
      const date = calendarState.selectedDate;
      const gongsu = parseFloat(document.getElementById("input-gongsu").value);
      const memo = document.getElementById("input-memo").value.trim();
      if (!inputState.companyId) return toast("업체를 선택하세요");
      if (!gongsu || gongsu <= 0) return toast("공수를 입력하세요");
      const records = loadRecords();
      records.push({ id: uid(), date, companyId: inputState.companyId, gongsu, memo, createdAt: Date.now() });
      saveRecords(records);
      document.getElementById("input-memo").value = "";
      toast("저장했습니다");
      renderCalendar();
      renderDayRecordList();
    });

    document.getElementById("month-prev").addEventListener("click", () => { monthState.ym = shiftMonth(monthState.ym, -1); renderMonth(); });
    document.getElementById("month-next").addEventListener("click", () => { monthState.ym = shiftMonth(monthState.ym, 1); renderMonth(); });

    document.getElementById("add-company-btn").addEventListener("click", () => {
      const input = document.getElementById("new-company-name");
      const name = input.value.trim();
      if (!name) return toast("업체명을 입력하세요");
      addCompanyIfNotExists(name);
      input.value = "";
      renderCompaniesTab();
    });

    document.getElementById("edit-gongsu-minus").addEventListener("click", () => adjustGongsu("edit-gongsu", -0.5));
    document.getElementById("edit-gongsu-plus").addEventListener("click", () => adjustGongsu("edit-gongsu", 0.5));
    document.getElementById("edit-cancel-btn").addEventListener("click", closeEditModal);
    document.getElementById("edit-modal").addEventListener("click", (e) => {
      if (e.target.id === "edit-modal") closeEditModal();
    });
    document.getElementById("edit-save-btn").addEventListener("click", () => {
      const records = loadRecords();
      const record = records.find((r) => r.id === editState.id);
      if (!record) return closeEditModal();
      const date = document.getElementById("edit-date").value;
      const gongsu = parseFloat(document.getElementById("edit-gongsu").value);
      const memo = document.getElementById("edit-memo").value.trim();
      if (!date) return toast("날짜를 선택하세요");
      if (!editState.companyId) return toast("업체를 선택하세요");
      if (!gongsu || gongsu <= 0) return toast("공수를 입력하세요");
      record.date = date;
      record.companyId = editState.companyId;
      record.gongsu = gongsu;
      record.memo = memo;
      saveRecords(records);
      closeEditModal();
      toast("수정했습니다");
      renderCurrentView();
    });
    document.getElementById("edit-delete-btn").addEventListener("click", () => {
      if (!confirm("이 기록을 삭제할까요?")) return;
      const records = loadRecords().filter((r) => r.id !== editState.id);
      saveRecords(records);
      closeEditModal();
      toast("삭제했습니다");
      renderCurrentView();
    });

    document.getElementById("day-modal-close-btn").addEventListener("click", closeDayModal);
    document.getElementById("day-modal").addEventListener("click", (e) => {
      if (e.target.id === "day-modal") closeDayModal();
    });
    document.getElementById("day-modal-gongsu-minus").addEventListener("click", () => adjustGongsu("day-modal-gongsu", -0.5, "day-modal-gongsu-presets"));
    document.getElementById("day-modal-gongsu-plus").addEventListener("click", () => adjustGongsu("day-modal-gongsu", 0.5, "day-modal-gongsu-presets"));
    document.getElementById("day-modal-gongsu").addEventListener("input", () => updateGongsuPresetHighlight("day-modal-gongsu-presets", "day-modal-gongsu"));
    document.getElementById("day-modal-add-btn").addEventListener("click", () => {
      const gongsu = parseFloat(document.getElementById("day-modal-gongsu").value);
      const memo = document.getElementById("day-modal-memo").value.trim();
      if (!dayModalState.companyId) return toast("업체를 선택하세요");
      if (!gongsu || gongsu <= 0) return toast("공수를 입력하세요");
      const records = loadRecords();
      records.push({ id: uid(), date: dayModalState.date, companyId: dayModalState.companyId, gongsu, memo, createdAt: Date.now() });
      saveRecords(records);
      document.getElementById("day-modal-memo").value = "";
      toast("저장했습니다");
      renderDayModalList();
      renderCalendar();
      if (calendarState.selectedDate === dayModalState.date) renderDayRecordList();
    });

    switchView("input");

    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("sw.js").catch(() => {});
    }
  }

  document.addEventListener("DOMContentLoaded", init);
})();
