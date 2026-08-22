(() => {
  "use strict";

  const STORAGE_COMPANIES = "gongsu_companies_v1";
  const STORAGE_RECORDS = "gongsu_records_v1";
  const STORAGE_SETTINGS = "gongsu_settings_v1";
  const DEFAULT_SETTINGS = { theme: "light", gongsuStep: 0.5, defaultGongsu: 1 };
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

  function loadSettings() {
    try { return Object.assign({}, DEFAULT_SETTINGS, JSON.parse(localStorage.getItem(STORAGE_SETTINGS)) || {}); }
    catch (e) { return Object.assign({}, DEFAULT_SETTINGS); }
  }
  function saveSettings(s) { localStorage.setItem(STORAGE_SETTINGS, JSON.stringify(s)); }
  function getGongsuStep() { return loadSettings().gongsuStep; }
  function getGongsuPresetValues() {
    return getGongsuStep() === 1 ? [1, 2, 3, 4, 5, 6] : [0.5, 1, 1.5, 2, 2.5, 3];
  }
  function getDefaultGongsu() { return loadSettings().defaultGongsu || 1; }
  function applyDefaultGongsu() {
    document.getElementById("input-gongsu").value = getDefaultGongsu();
    updateGongsuPresetHighlight("gongsu-presets", "input-gongsu");
  }
  function applyTheme() {
    document.documentElement.setAttribute("data-theme", loadSettings().theme);
  }

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

  // Keeps (date, company) unique. If a record for that date+company already exists
  // (other than the one being edited, when id is given), the new values overwrite it
  // instead of creating a duplicate row.
  function saveOrMergeRecord({ id, date, companyId, gongsu, memo, isTrip }) {
    const records = loadRecords();
    const dup = records.find((r) => r.date === date && r.companyId === companyId && r.id !== id);
    if (dup) {
      dup.gongsu = gongsu;
      dup.memo = memo;
      dup.isTrip = !!isTrip;
      if (id) {
        const idx = records.findIndex((r) => r.id === id);
        if (idx !== -1) records.splice(idx, 1);
      }
      saveRecords(records);
      return { merged: true };
    }
    if (id) {
      const rec = records.find((r) => r.id === id);
      rec.date = date;
      rec.companyId = companyId;
      rec.gongsu = gongsu;
      rec.memo = memo;
      rec.isTrip = !!isTrip;
    } else {
      records.push({ id: uid(), date, companyId, gongsu, memo, isTrip: !!isTrip, createdAt: Date.now() });
    }
    saveRecords(records);
    return { merged: false };
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
  function formatWon(n) {
    return Math.round(n).toLocaleString("ko-KR") + "원";
  }
  const FREELANCER_WITHHOLDING_RATE = 0.033; // 프리랜서 사업소득 원천징수 3.3% (소득세 3% + 지방소득세 0.3%)
  const VAT_RATE = 0.1; // 부가가치세 10%
  // For companies with a payday configured, returns what actually lands on payday for a
  // given gross (pre-tax) amount: freelancers get it net of 3.3% withholding, while sole
  // proprietors invoice the gross as 공급가액 and receive it plus 10% VAT on top.
  function calcPaydayAmount(company, grossAmount) {
    if (company.taxType === "business") {
      const vat = grossAmount * VAT_RATE;
      return { total: grossAmount + vat, principal: grossAmount, vat };
    }
    const withheld = grossAmount * FREELANCER_WITHHOLDING_RATE;
    return { total: grossAmount - withheld, principal: grossAmount, withheld };
  }
  // Hourly rates are converted to a per-gongsu (per-day) amount assuming an 8-hour standard day,
  // so both rate types reduce to the same "amount per 1 공수" figure for calculations.
  // Trip-marked records use the company's separate 출장 rate (same rate type as the base rate)
  // when one has been configured; otherwise they fall back to the normal rate.
  function getCompanyEffectiveDailyRate(company, isTrip) {
    if (!company) return 0;
    if (isTrip && company.hasTrip && company.tripRate) {
      return company.rateType === "hourly" ? company.tripRate * 8 : company.tripRate;
    }
    if (!company.rate) return 0;
    return company.rateType === "hourly" ? company.rate * 8 : company.rate;
  }
  function calcRecordsAmount(records) {
    return records.reduce((sum, r) => sum + r.gongsu * getCompanyEffectiveDailyRate(getCompanyById(r.companyId), r.isTrip), 0);
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
  const calendarState = { ym: currentMonthYm(), selectedDate: todayStr(), filterCompanyId: null };
  const statsAmountView = { companies: new Set(), months: new Set() };
  let monthAmountView = false;
  const rateModalState = { companyId: null, rateType: "daily" };
  const paydayModalState = { companyId: null, taxType: "freelancer" };

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
    updateInputTripVisibility();
  }
  function refreshEditCompanyChips() {
    renderCompanyChips(document.getElementById("edit-company-chip-row"), editState.companyId, (id) => {
      editState.companyId = id;
      refreshEditCompanyChips();
    });
    updateEditTripVisibility();
  }

  // ---------- generic single-button toggle chips (trip, payday, etc.) ----------
  function isToggleOn(btnId) { return document.getElementById(btnId).classList.contains("selected"); }
  function setToggle(btnId, on) { document.getElementById(btnId).classList.toggle("selected", !!on); }
  function wireToggle(btnId) {
    document.getElementById(btnId).addEventListener("click", () => setToggle(btnId, !isToggleOn(btnId)));
  }

  function updateInputTripVisibility() {
    const company = getCompanyById(inputState.companyId);
    const show = !!(company && company.hasTrip);
    document.getElementById("input-trip-field").style.display = show ? "" : "none";
    if (!show) setToggle("input-trip-toggle", false);
  }
  function updateDayModalTripVisibility() {
    const company = getCompanyById(dayModalState.companyId);
    const show = !!(company && company.hasTrip);
    document.getElementById("day-modal-trip-field").style.display = show ? "" : "none";
    if (!show) setToggle("day-modal-trip-toggle", false);
  }
  function updateEditTripVisibility() {
    const company = getCompanyById(editState.companyId);
    const show = !!(company && company.hasTrip);
    document.getElementById("edit-trip-field").style.display = show ? "" : "none";
    if (!show) setToggle("edit-trip-toggle", false);
  }

  // ---------- gongsu presets ----------
  function promptSetDefaultGongsu(value) {
    if (!confirm(`${formatGongsu(value)}을(를) 공수 기본값으로 하시겠습니까?`)) return;
    const s = loadSettings();
    s.defaultGongsu = value;
    saveSettings(s);
    toast("기본값으로 설정했습니다");
    if (currentView === "settings") renderSettingsTab();
  }

  function renderGongsuPresets(containerId, inputId) {
    const container = document.getElementById(containerId);
    container.innerHTML = "";
    getGongsuPresetValues().forEach((v) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "preset-chip";
      btn.textContent = formatGongsu(v);

      let timer = null, startX = 0, startY = 0, justLongPressed = false;
      btn.addEventListener("touchstart", (e) => {
        if (e.touches.length !== 1) return;
        startX = e.touches[0].clientX;
        startY = e.touches[0].clientY;
        timer = setTimeout(() => {
          timer = null;
          justLongPressed = true;
          promptSetDefaultGongsu(v);
        }, 500);
      }, { passive: true });
      btn.addEventListener("touchmove", (e) => {
        if (!timer) return;
        const dx = e.touches[0].clientX - startX;
        const dy = e.touches[0].clientY - startY;
        if (Math.abs(dx) > 10 || Math.abs(dy) > 10) { clearTimeout(timer); timer = null; }
      }, { passive: true });
      btn.addEventListener("touchend", (e) => {
        if (timer) { clearTimeout(timer); timer = null; }
        if (justLongPressed) e.preventDefault();
      });
      btn.addEventListener("click", (e) => {
        if (justLongPressed) { justLongPressed = false; e.preventDefault(); return; }
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
  function refreshGongsuStepLabels() {
    const step = formatGongsu(getGongsuStep());
    document.querySelectorAll(".gongsu-step-minus").forEach((b) => { b.textContent = "−" + step; });
    document.querySelectorAll(".gongsu-step-plus").forEach((b) => { b.textContent = "+" + step; });
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
        <div class="record-company">${namePart}${record.isTrip ? ' <span class="trip-badge">출장</span>' : ""}</div>
        ${record.memo ? `<div class="record-memo">${escapeHtml(record.memo)}</div>` : ""}
      </div>
      <div class="record-gongsu">${formatGongsu(record.gongsu)}</div>
      ${opts.onDelete && !opts.swipeDelete ? '<button type="button" class="record-delete-btn">삭제</button>' : ""}
    `;

    if (opts.swipeDelete) {
      const wrapper = document.createElement("div");
      wrapper.className = "swipe-wrapper";
      const trash = document.createElement("button");
      trash.type = "button";
      trash.className = "swipe-trash-btn";
      trash.textContent = "🗑";
      trash.addEventListener("click", (e) => {
        e.stopPropagation();
        closeSwipe(wrapper);
        if (opts.onDelete) opts.onDelete(record);
      });
      wrapper.appendChild(el);
      wrapper.appendChild(trash);
      attachSwipeToDelete(wrapper, el);
      el.addEventListener("click", (e) => {
        if (wrapper.classList.contains("swipe-open")) {
          e.preventDefault();
          closeSwipe(wrapper);
          return;
        }
        if (opts.onClick) opts.onClick(record); else openEditModal(record.id);
      });
      return wrapper;
    }

    el.addEventListener("click", () => (opts.onClick ? opts.onClick(record) : openEditModal(record.id)));
    if (opts.onDelete) {
      el.querySelector(".record-delete-btn").addEventListener("click", (e) => {
        e.stopPropagation();
        opts.onDelete(record);
      });
    }
    return el;
  }

  // ---------- swipe-to-delete (used by the input tab's monthly record list) ----------
  // Toggles a class rather than following the finger: dragging the row itself (instead of
  // just growing its right padding) would clip the dot/company text off the left edge once
  // shifted by the trash button's width, since the row is exactly as wide as its container.
  let openSwipeWrapper = null;

  function closeSwipe(wrapper) {
    wrapper.classList.remove("swipe-open");
    if (openSwipeWrapper === wrapper) openSwipeWrapper = null;
  }
  function openSwipe(wrapper) {
    if (openSwipeWrapper && openSwipeWrapper !== wrapper) closeSwipe(openSwipeWrapper);
    wrapper.classList.add("swipe-open");
    openSwipeWrapper = wrapper;
  }

  function attachSwipeToDelete(wrapper, content) {
    let startX = 0, startY = 0, tracking = false, horizontal = false;
    content.addEventListener("touchstart", (e) => {
      if (e.touches.length !== 1) return;
      startX = e.touches[0].clientX;
      startY = e.touches[0].clientY;
      tracking = true;
      horizontal = false;
    }, { passive: true });

    content.addEventListener("touchmove", (e) => {
      if (!tracking) return;
      const dx = e.touches[0].clientX - startX;
      const dy = e.touches[0].clientY - startY;
      if (!horizontal) {
        if (Math.abs(dx) < 8 && Math.abs(dy) < 8) return;
        horizontal = Math.abs(dx) > Math.abs(dy);
        if (!horizontal) { tracking = false; return; }
      }
      if (dx < -24) openSwipe(wrapper);
      else if (dx > 24) closeSwipe(wrapper);
    }, { passive: true });

    content.addEventListener("touchend", () => { tracking = false; });
  }

  function renderGroupedRecordList(container, records, opts = {}) {
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
      byDate[date].sort((a, b) => b.createdAt - a.createdAt).forEach((r) => group.appendChild(createRecordItemEl(r, opts)));
      container.appendChild(group);
    });
  }

  function renderSummaryByCompany(container, records, opts = {}) {
    container.innerHTML = "";
    if (records.length === 0) {
      container.innerHTML = '<div class="summary-empty">기록이 없습니다</div>';
      return;
    }
    const map = new Map();
    records.forEach((r) => {
      const cur = map.get(r.companyId) || { sum: 0, count: 0, records: [] };
      cur.sum += r.gongsu;
      cur.count += 1;
      cur.records.push(r);
      map.set(r.companyId, cur);
    });
    [...map.entries()].sort((a, b) => b[1].sum - a[1].sum).forEach(([companyId, { sum, count, records: companyRecords }]) => {
      const company = getCompanyById(companyId);
      const el = document.createElement("div");
      el.className = "summary-item";
      const showAmount = opts.showAmountToggle && statsAmountView.companies.has(companyId);
      const hasRateInfo = company && (company.rate || (company.hasTrip && company.tripRate));
      const usePayday = opts.showPayday && company && company.paydayEnabled && hasRateInfo;
      let valueHtml = formatGongsuUnit(sum);
      let subHtml = "";
      if (showAmount) {
        if (!hasRateInfo) {
          valueHtml = "단가 미설정";
        } else if (usePayday) {
          const grossAmount = calcRecordsAmount(companyRecords);
          const { total, principal, vat, withheld } = calcPaydayAmount(company, grossAmount);
          valueHtml = formatWon(total);
          subHtml = company.taxType === "business"
            ? `<div class="summary-subline">매달 ${company.payday}일 입금 예정 · 원금 ${formatWon(principal)} + 부가세 ${formatWon(vat)}</div>`
            : `<div class="summary-subline">매달 ${company.payday}일 입금 예정 · 세전 ${formatWon(principal)} − 3.3% 원천징수 ${formatWon(withheld)}</div>`;
        } else {
          valueHtml = formatWon(calcRecordsAmount(companyRecords));
        }
      }
      el.innerHTML = `
        <span class="record-dot" style="background:${company ? company.color : "#ccc"}"></span>
        <span class="summary-name">${company ? escapeHtml(company.name) : "(삭제된 업체)"}</span>
        <span class="summary-count">${count}건</span>
        <span class="summary-value">${valueHtml}</span>
        ${opts.showAmountToggle ? `<button type="button" class="summary-amount-btn${showAmount ? " active" : ""}">${showAmount ? "공수보기" : "금액보기"}</button>` : ""}
        ${subHtml}
      `;
      if (opts.showAmountToggle) {
        el.querySelector(".summary-amount-btn").addEventListener("click", (e) => {
          e.stopPropagation();
          if (statsAmountView.companies.has(companyId)) statsAmountView.companies.delete(companyId);
          else statsAmountView.companies.add(companyId);
          renderSummaryByCompany(container, records, opts);
        });
      }
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
      const cur = map.get(ym) || { sum: 0, count: 0, records: [] };
      cur.sum += r.gongsu;
      cur.count += 1;
      cur.records.push(r);
      map.set(ym, cur);
    });
    [...map.entries()].sort((a, b) => b[0].localeCompare(a[0])).forEach(([ym, { sum, count, records: monthRecords }]) => {
      const el = document.createElement("div");
      el.className = "summary-item clickable";
      const showAmount = statsAmountView.months.has(ym);
      const valueHtml = showAmount ? formatWon(calcRecordsAmount(monthRecords)) : formatGongsuUnit(sum);
      el.innerHTML = `
        <span class="summary-name">${formatMonthLabel(ym)}</span>
        <span class="summary-count">${count}건</span>
        <span class="summary-value">${valueHtml}</span>
        <button type="button" class="summary-amount-btn${showAmount ? " active" : ""}">${showAmount ? "공수보기" : "금액보기"}</button>
      `;
      el.addEventListener("click", () => {
        monthState.ym = ym;
        switchView("month");
      });
      el.querySelector(".summary-amount-btn").addEventListener("click", (e) => {
        e.stopPropagation();
        if (statsAmountView.months.has(ym)) statsAmountView.months.delete(ym);
        else statsAmountView.months.add(ym);
        renderMonthSummary(container, records);
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

  function renderCalendarCompanyFilter() {
    const monthRecords = loadRecords().filter((r) => r.date.slice(0, 7) === calendarState.ym);
    const idsWithRecords = new Set(monthRecords.map((r) => r.companyId));
    if (calendarState.filterCompanyId && !idsWithRecords.has(calendarState.filterCompanyId)) {
      calendarState.filterCompanyId = null;
    }

    const container = document.getElementById("calendar-company-filter");
    container.innerHTML = "";
    const companies = loadCompanies().filter((c) => idsWithRecords.has(c.id));
    if (companies.length === 0) {
      container.style.display = "none";
      return;
    }
    container.style.display = "flex";

    const allBtn = document.createElement("button");
    allBtn.type = "button";
    const allSelected = !calendarState.filterCompanyId;
    allBtn.className = "company-chip" + (allSelected ? " selected" : "");
    allBtn.textContent = "전체";
    if (allSelected) allBtn.style.background = "var(--accent)";
    allBtn.addEventListener("click", () => {
      calendarState.filterCompanyId = null;
      renderCalendarCompanyFilter();
      renderCalendar();
    });
    container.appendChild(allBtn);

    companies.forEach((c) => {
      const btn = document.createElement("button");
      btn.type = "button";
      const selected = calendarState.filterCompanyId === c.id;
      btn.className = "company-chip" + (selected ? " selected" : "");
      btn.textContent = c.name;
      if (selected) btn.style.background = c.color;
      btn.addEventListener("click", () => {
        calendarState.filterCompanyId = c.id;
        renderCalendarCompanyFilter();
        renderCalendar();
      });
      container.appendChild(btn);
    });
  }

  // ---------- calendar long-press-to-delete popup ----------
  const calendarDeleteModalState = { date: null };

  function openCalendarDeleteModal(date) {
    const count = loadRecords().filter((r) => r.date === date).length;
    if (count === 0) return;
    calendarDeleteModalState.date = date;
    document.getElementById("calendar-delete-modal-heading").textContent = formatDateHeading(date);
    document.getElementById("calendar-delete-modal-desc").textContent = `이 날짜의 기록 ${count}건을 모두 삭제합니다.`;
    document.getElementById("calendar-delete-modal").classList.add("active");
    pushModalState(() => closeCalendarDeleteModal(true));
  }
  function closeCalendarDeleteModal(fromPopstate) {
    document.getElementById("calendar-delete-modal").classList.remove("active");
    calendarDeleteModalState.date = null;
    if (!fromPopstate) popModalState();
  }

  function attachCalendarCellGestures(btn, date) {
    let startX = 0, startY = 0, timer = null, justLongPressed = false;

    btn.addEventListener("touchstart", (e) => {
      if (e.touches.length !== 1) return;
      startX = e.touches[0].clientX;
      startY = e.touches[0].clientY;
      timer = setTimeout(() => {
        timer = null;
        if (!loadRecords().some((r) => r.date === date)) return;
        justLongPressed = true;
        openCalendarDeleteModal(date);
      }, 500);
    }, { passive: true });

    btn.addEventListener("touchmove", (e) => {
      if (!timer) return;
      const dx = e.touches[0].clientX - startX;
      const dy = e.touches[0].clientY - startY;
      if (Math.abs(dx) > 10 || Math.abs(dy) > 10) { clearTimeout(timer); timer = null; }
    }, { passive: true });

    btn.addEventListener("touchend", (e) => {
      if (timer) { clearTimeout(timer); timer = null; }
      // Suppress the browser's synthetic click that would otherwise fire at the original touch
      // coordinates, which by now may be covered by the modal overlay just opened underneath it.
      if (justLongPressed) e.preventDefault();
    });

    btn.addEventListener("click", (e) => {
      if (justLongPressed) { justLongPressed = false; e.preventDefault(); return; }
      selectDate(date);
    });

    btn.addEventListener("dblclick", (e) => {
      e.preventDefault();
      openDayModal(date);
    });
  }

  function renderCalendar() {
    renderCalendarCompanyFilter();
    document.getElementById("cal-month-label").textContent = formatMonthLabel(calendarState.ym);
    const sumsByDate = new Map();
    loadRecords().forEach((r) => {
      if (calendarState.filterCompanyId && r.companyId !== calendarState.filterCompanyId) return;
      sumsByDate.set(r.date, (sumsByDate.get(r.date) || 0) + r.gongsu);
    });

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
      attachCalendarCellGestures(btn, date);
      container.appendChild(btn);
    });
  }

  function renderSelectedDateHeading() {
    const suffix = calendarState.selectedDate === todayStr() ? " · 오늘" : "";
    document.getElementById("selected-date-heading").textContent = formatDateHeading(calendarState.selectedDate) + suffix;
  }

  function renderInputMonthList() {
    document.getElementById("day-list-title").textContent = formatMonthLabel(calendarState.ym) + " 기록";
    const records = loadRecords().filter((r) => r.date.slice(0, 7) === calendarState.ym);
    renderGroupedRecordList(document.getElementById("day-record-list"), records, {
      swipeDelete: true,
      onDelete: (rec) => {
        if (!confirm("이 공수 기록을 삭제할까요?")) return;
        saveRecords(loadRecords().filter((x) => x.id !== rec.id));
        toast("삭제했습니다");
        renderCalendar();
        renderInputMonthList();
      },
    });
  }

  function selectDate(dateStr) {
    calendarState.selectedDate = dateStr;
    calendarState.ym = dateStr.slice(0, 7);
    inputState.companyId = getSuggestedCompanyForDate(dateStr);
    renderCalendar();
    renderSelectedDateHeading();
    refreshInputCompanyChips();
    applyDefaultGongsu();
    renderInputMonthList();
  }

  // ---------- day quick-edit modal (double-tap a calendar date) ----------
  const dayModalState = { date: null, companyId: null };

  function refreshDayModalCompanyChips() {
    renderCompanyChips(document.getElementById("day-modal-company-chip-row"), dayModalState.companyId, (id) => {
      dayModalState.companyId = id;
      refreshDayModalCompanyChips();
    });
    updateDayModalTripVisibility();
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
      onClick: (rec) => {
        document.getElementById("day-modal").classList.remove("active");
        openEditModal(rec.id, { replace: true });
      },
      onDelete: (rec) => {
        if (!confirm("이 공수 기록을 삭제할까요?")) return;
        saveRecords(loadRecords().filter((x) => x.id !== rec.id));
        toast("삭제했습니다");
        renderDayModalList();
        renderCalendar();
        if (dayModalState.date.slice(0, 7) === calendarState.ym) renderInputMonthList();
      },
    })));
  }

  function openDayModal(dateStr) {
    dayModalState.date = dateStr;
    dayModalState.companyId = getSuggestedCompanyForDate(dateStr);
    document.getElementById("day-modal-heading").textContent = formatDateHeading(dateStr);
    document.getElementById("day-modal-gongsu").value = getDefaultGongsu();
    document.getElementById("day-modal-memo").value = "";
    setToggle("day-modal-trip-toggle", false);
    renderDayModalList();
    refreshDayModalCompanyChips();
    renderGongsuPresets("day-modal-gongsu-presets", "day-modal-gongsu");
    document.getElementById("day-modal").classList.add("active");
    pushModalState(() => closeDayModal(true));
  }

  function closeDayModal(fromPopstate) {
    document.getElementById("day-modal").classList.remove("active");
    if (!fromPopstate) popModalState();
  }

  function renderMonth() {
    document.getElementById("month-label").textContent = formatMonthLabel(monthState.ym);
    const records = loadRecords().filter((r) => r.date.slice(0, 7) === monthState.ym);
    const total = records.reduce((s, r) => s + r.gongsu, 0);
    document.getElementById("month-total").textContent = monthAmountView ? formatWon(calcRecordsAmount(records)) : formatGongsuUnit(total);
    const toggleBtn = document.getElementById("month-amount-toggle");
    toggleBtn.textContent = monthAmountView ? "공수보기" : "금액보기";
    toggleBtn.classList.toggle("active", monthAmountView);
    renderSummaryByCompany(document.getElementById("month-company-summary"), records, { showAmountToggle: true, showPayday: true });
    renderGroupedRecordList(document.getElementById("month-record-list"), records);
  }

  function renderStats() {
    const records = loadRecords();
    renderSummaryByCompany(document.getElementById("all-company-summary"), records, { showAmountToggle: true });
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
      const rateLabel = c.rate
        ? `${c.rateType === "hourly" ? "시급" : "일급"} ${formatWon(c.rate)}`
        : "단가 미설정";
      const tripLabel = c.hasTrip && c.tripRate ? ` · 출장 ${formatWon(c.tripRate)}` : "";
      const paydayLabel = c.paydayEnabled
        ? `<div class="manage-item-rate">매달 ${c.payday}일 입금 · ${c.taxType === "business" ? "개인사업자 (부가세 별도)" : "프리랜서 (3.3% 원천징수)"}</div>`
        : "";
      el.innerHTML = `
        <div class="manage-item-top">
          <span class="record-dot" style="background:${c.color}"></span>
          <span class="manage-name">${escapeHtml(c.name)}</span>
        </div>
        <div class="manage-item-rate">${rateLabel}${tripLabel}</div>
        ${paydayLabel}
        <div class="manage-item-actions">
          <button type="button" class="manage-btn" data-action="rate">단가 설정</button>
          <button type="button" class="manage-btn" data-action="payday">월급날 설정</button>
          <button type="button" class="manage-btn" data-action="rename">이름변경</button>
          <button type="button" class="manage-btn danger" data-action="delete">삭제</button>
        </div>
      `;
      el.querySelector('[data-action="rate"]').addEventListener("click", () => openRateModal(c.id));
      el.querySelector('[data-action="payday"]').addEventListener("click", () => openPaydayModal(c.id));
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

  // ---------- rate modal (company management) ----------
  function refreshRateTypeOptions() {
    document.querySelectorAll(".rate-type-option").forEach((btn) => {
      btn.classList.toggle("selected", btn.dataset.type === rateModalState.rateType);
    });
  }

  function openRateModal(companyId) {
    const company = getCompanyById(companyId);
    if (!company) return;
    rateModalState.companyId = companyId;
    rateModalState.rateType = company.rateType === "hourly" ? "hourly" : "daily";
    document.getElementById("rate-modal-company-name").textContent = company.name;
    document.getElementById("rate-amount-input").value = company.rate || "";
    setToggle("rate-trip-toggle", !!company.hasTrip);
    document.getElementById("rate-trip-amount-input").value = company.tripRate || "";
    document.getElementById("rate-trip-amount-field").style.display = company.hasTrip ? "" : "none";
    refreshRateTypeOptions();
    document.getElementById("rate-modal").classList.add("active");
    pushModalState(() => closeRateModal(true));
  }

  function closeRateModal(fromPopstate) {
    document.getElementById("rate-modal").classList.remove("active");
    rateModalState.companyId = null;
    if (!fromPopstate) popModalState();
  }

  // ---------- payday / tax-type modal (company management) ----------
  function refreshPaydayTypeOptions() {
    document.querySelectorAll(".payday-type-option").forEach((btn) => {
      btn.classList.toggle("selected", btn.dataset.type === paydayModalState.taxType);
    });
  }

  function openPaydayModal(companyId) {
    const company = getCompanyById(companyId);
    if (!company) return;
    paydayModalState.companyId = companyId;
    paydayModalState.taxType = company.taxType === "business" ? "business" : "freelancer";
    document.getElementById("payday-modal-company-name").textContent = company.name;
    setToggle("payday-toggle", !!company.paydayEnabled);
    document.getElementById("payday-day-input").value = company.payday || "";
    document.getElementById("payday-day-field").style.display = company.paydayEnabled ? "" : "none";
    document.getElementById("payday-type-field").style.display = company.paydayEnabled ? "" : "none";
    refreshPaydayTypeOptions();
    document.getElementById("payday-modal").classList.add("active");
    pushModalState(() => closePaydayModal(true));
  }

  function closePaydayModal(fromPopstate) {
    document.getElementById("payday-modal").classList.remove("active");
    paydayModalState.companyId = null;
    if (!fromPopstate) popModalState();
  }

  // ---------- month-end invoice reminder (개인사업자 계산서 발행) ----------
  function closeInvoiceReminderModal(fromPopstate) {
    document.getElementById("invoice-reminder-modal").classList.remove("active");
    if (!fromPopstate) popModalState();
  }

  function checkInvoiceReminder() {
    const today = todayStr();
    const [y, m] = today.split("-").map(Number);
    const lastDayOfMonth = new Date(y, m, 0).getDate();
    if (parseInt(today.slice(8, 10), 10) !== lastDayOfMonth) return;

    const settings = loadSettings();
    if (settings.lastInvoiceReminderDate === today) return;

    const businessCompanies = loadCompanies().filter((c) => c.paydayEnabled && c.taxType === "business");
    if (businessCompanies.length === 0) return;

    const names = businessCompanies.map((c) => c.name).join(", ");
    document.getElementById("invoice-reminder-desc").textContent = `${names} 업체는 이번 달 계산서 발행을 잊지 마세요!`;
    document.getElementById("invoice-reminder-modal").classList.add("active");
    pushModalState(() => closeInvoiceReminderModal(true));

    settings.lastInvoiceReminderDate = today;
    saveSettings(settings);
  }

  function renderSettingsTab() {
    const settings = loadSettings();
    document.querySelectorAll(".theme-option").forEach((btn) => {
      btn.classList.toggle("selected", btn.dataset.theme === settings.theme);
    });
    document.querySelectorAll(".gongsu-step-option").forEach((btn) => {
      btn.classList.toggle("selected", parseFloat(btn.dataset.step) === settings.gongsuStep);
    });
    document.querySelectorAll(".default-gongsu-option").forEach((btn) => {
      btn.classList.toggle("selected", parseFloat(btn.dataset.value) === settings.defaultGongsu);
    });

    const container = document.getElementById("settings-company-colors");
    container.innerHTML = "";
    const companies = loadCompanies();
    if (companies.length === 0) {
      container.innerHTML = '<div class="record-empty">등록된 업체가 없습니다</div>';
      return;
    }
    companies.forEach((c) => {
      const el = document.createElement("div");
      el.className = "manage-item";
      el.innerHTML = `
        <span class="record-dot" style="background:${c.color}"></span>
        <span class="manage-name">${escapeHtml(c.name)}</span>
        <input type="color" class="company-color-input" value="${c.color}" />
      `;
      el.querySelector(".company-color-input").addEventListener("input", (e) => {
        c.color = e.target.value;
        saveCompanies(companies);
        renderSettingsTab();
      });
      container.appendChild(el);
    });
  }

  // ---------- data backup / restore ----------
  function exportAllData() {
    const payload = {
      app: "gongsu-check",
      version: 1,
      exportedAt: Date.now(),
      companies: loadCompanies(),
      records: loadRecords(),
      settings: loadSettings(),
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `공수체크_백업_${todayStr()}.json`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
    toast("백업 파일을 저장했습니다");
  }

  function importAllData(file) {
    const reader = new FileReader();
    reader.onload = () => {
      let data;
      try { data = JSON.parse(reader.result); }
      catch (e) { return toast("올바른 백업 파일이 아닙니다"); }
      if (!Array.isArray(data.companies) || !Array.isArray(data.records)) {
        return toast("올바른 백업 파일이 아닙니다");
      }
      if (!confirm("현재 기기의 모든 데이터를 이 백업 파일 내용으로 덮어씁니다. 계속할까요?")) return;
      saveCompanies(data.companies);
      saveRecords(data.records);
      if (data.settings) saveSettings(Object.assign({}, DEFAULT_SETTINGS, data.settings));
      applyTheme();
      refreshGongsuStepLabels();
      renderGongsuPresets("gongsu-presets", "input-gongsu");
      toast("복원했습니다");
      renderCurrentView();
    };
    reader.readAsText(file);
  }

  function renderCurrentView() {
    if (currentView === "input") {
      renderCalendar();
      renderSelectedDateHeading();
      refreshInputCompanyChips();
      renderInputMonthList();
    }
    else if (currentView === "month") renderMonth();
    else if (currentView === "stats") renderStats();
    else if (currentView === "companies") renderCompaniesTab();
    else if (currentView === "settings") renderSettingsTab();
  }

  function switchView(view) {
    currentView = view;
    document.querySelectorAll(".view").forEach((v) => v.classList.remove("active"));
    document.getElementById("view-" + view).classList.add("active");
    document.querySelectorAll(".nav-btn").forEach((b) => b.classList.toggle("active", b.dataset.view === view));
    const titles = { input: "공수체크", month: "월별현황", stats: "전체통계", companies: "업체관리", settings: "설정", guide: "기능설명" };
    document.getElementById("header-title").textContent = titles[view];
    renderCurrentView();
  }

  // ---------- back-button-aware modal stack ----------
  // Each open modal pushes a history entry so the hardware/gesture back button closes
  // the modal first instead of leaving the app. popstate (from an actual back press)
  // pops the top entry and closes it WITHOUT calling history.back() again (the browser
  // already did that navigation); a normal UI close (button/outside tap) does the
  // opposite: pop our bookkeeping first, then call history.back() to consume the entry.
  const modalStack = [];

  function pushModalState(closeFn) {
    modalStack.push(closeFn);
    history.pushState({ gongsuModal: true }, "");
  }
  function replaceModalState(closeFn) {
    if (modalStack.length > 0) modalStack[modalStack.length - 1] = closeFn;
    else modalStack.push(closeFn);
    history.replaceState({ gongsuModal: true }, "");
  }
  function popModalState() {
    if (modalStack.length > 0) {
      modalStack.pop();
      history.back();
    }
  }

  // ---------- edge-swipe tab switching ----------
  const TAB_ORDER = ["input", "month", "stats", "companies"];
  function switchToAdjacentTab(direction) {
    const idx = TAB_ORDER.indexOf(currentView);
    if (idx === -1) return;
    const nextIdx = (idx + direction + TAB_ORDER.length) % TAB_ORDER.length;
    switchView(TAB_ORDER[nextIdx]);
  }

  // ---------- edit modal ----------
  function openEditModal(id, opts = {}) {
    const record = loadRecords().find((r) => r.id === id);
    if (!record) return;
    editState.id = id;
    editState.companyId = record.companyId;
    document.getElementById("edit-date").value = record.date;
    document.getElementById("edit-gongsu").value = record.gongsu;
    document.getElementById("edit-memo").value = record.memo || "";
    refreshEditCompanyChips();
    const company = getCompanyById(record.companyId);
    if (company && company.hasTrip) setToggle("edit-trip-toggle", !!record.isTrip);
    document.getElementById("edit-modal").classList.add("active");
    if (opts.replace) replaceModalState(() => closeEditModal(true));
    else pushModalState(() => closeEditModal(true));
  }
  function closeEditModal(fromPopstate) {
    document.getElementById("edit-modal").classList.remove("active");
    editState.id = null;
    if (!fromPopstate) popModalState();
  }

  // ---------- side menu ----------
  function openSideMenu() {
    document.getElementById("side-menu-overlay").classList.add("active");
    pushModalState(() => closeSideMenu(true));
  }
  function closeSideMenu(fromPopstate) {
    document.getElementById("side-menu-overlay").classList.remove("active");
    if (!fromPopstate) popModalState();
  }

  // ---------- init ----------
  function init() {
    applyTheme();
    renderGongsuPresets("gongsu-presets", "input-gongsu");
    refreshGongsuStepLabels();
    applyDefaultGongsu();
    inputState.companyId = getSuggestedCompanyForDate(calendarState.selectedDate);

    document.addEventListener("touchstart", (e) => {
      if (openSwipeWrapper && !openSwipeWrapper.contains(e.target)) closeSwipe(openSwipeWrapper);
    }, { passive: true });
    document.addEventListener("click", (e) => {
      if (openSwipeWrapper && !openSwipeWrapper.contains(e.target)) closeSwipe(openSwipeWrapper);
    });

    const EDGE_ZONE = 24;
    let edgeSwipeStart = null;
    document.addEventListener("touchstart", (e) => {
      if (e.touches.length !== 1 || document.querySelector(".modal-overlay.active")) {
        edgeSwipeStart = null;
        return;
      }
      const t = e.touches[0];
      const w = window.innerWidth;
      if (t.clientX >= w - EDGE_ZONE) edgeSwipeStart = { x: t.clientX, y: t.clientY, edge: "right" };
      else if (t.clientX <= EDGE_ZONE) edgeSwipeStart = { x: t.clientX, y: t.clientY, edge: "left" };
      else edgeSwipeStart = null;
    }, { passive: true });
    document.addEventListener("touchend", (e) => {
      if (!edgeSwipeStart) return;
      const t = e.changedTouches[0];
      const dx = t.clientX - edgeSwipeStart.x;
      const dy = t.clientY - edgeSwipeStart.y;
      if (Math.abs(dx) > 60 && Math.abs(dx) > Math.abs(dy) * 1.5) {
        if (edgeSwipeStart.edge === "right" && dx < 0) switchToAdjacentTab(1);
        else if (edgeSwipeStart.edge === "left" && dx > 0) switchToAdjacentTab(-1);
      }
      edgeSwipeStart = null;
    });

    document.querySelectorAll(".nav-btn").forEach((b) => b.addEventListener("click", () => switchView(b.dataset.view)));

    document.getElementById("menu-btn").addEventListener("click", openSideMenu);
    document.getElementById("side-menu-overlay").addEventListener("click", (e) => {
      if (e.target.id === "side-menu-overlay") closeSideMenu();
    });
    document.getElementById("menu-home-btn").addEventListener("click", () => {
      closeSideMenu();
      switchView("input");
    });
    document.getElementById("menu-guide-btn").addEventListener("click", () => {
      closeSideMenu();
      switchView("guide");
    });
    document.getElementById("menu-settings-btn").addEventListener("click", () => {
      closeSideMenu();
      switchView("settings");
    });

    window.addEventListener("popstate", () => {
      if (modalStack.length === 0) return;
      const closeFn = modalStack.pop();
      closeFn();
    });

    document.querySelectorAll(".theme-option").forEach((btn) => {
      btn.addEventListener("click", () => {
        const s = loadSettings();
        s.theme = btn.dataset.theme;
        saveSettings(s);
        applyTheme();
        renderSettingsTab();
      });
    });
    document.querySelectorAll(".gongsu-step-option").forEach((btn) => {
      btn.addEventListener("click", () => {
        const s = loadSettings();
        s.gongsuStep = parseFloat(btn.dataset.step);
        saveSettings(s);
        refreshGongsuStepLabels();
        renderGongsuPresets("gongsu-presets", "input-gongsu");
        renderSettingsTab();
      });
    });
    document.querySelectorAll(".default-gongsu-option").forEach((btn) => {
      btn.addEventListener("click", () => {
        const s = loadSettings();
        s.defaultGongsu = parseFloat(btn.dataset.value);
        saveSettings(s);
        renderSettingsTab();
      });
    });

    document.getElementById("export-data-btn").addEventListener("click", exportAllData);
    document.getElementById("import-data-btn").addEventListener("click", () => document.getElementById("import-data-input").click());
    document.getElementById("import-data-input").addEventListener("change", (e) => {
      const file = e.target.files[0];
      if (file) importAllData(file);
      e.target.value = "";
    });

    wireToggle("input-trip-toggle");
    wireToggle("day-modal-trip-toggle");
    wireToggle("edit-trip-toggle");

    document.getElementById("cal-prev").addEventListener("click", () => { calendarState.ym = shiftMonth(calendarState.ym, -1); renderCalendar(); });
    document.getElementById("cal-next").addEventListener("click", () => { calendarState.ym = shiftMonth(calendarState.ym, 1); renderCalendar(); });

    document.getElementById("gongsu-minus").addEventListener("click", () => adjustGongsu("input-gongsu", -getGongsuStep(), "gongsu-presets"));
    document.getElementById("gongsu-plus").addEventListener("click", () => adjustGongsu("input-gongsu", getGongsuStep(), "gongsu-presets"));
    document.getElementById("input-gongsu").addEventListener("input", () => updateGongsuPresetHighlight("gongsu-presets", "input-gongsu"));

    document.getElementById("save-btn").addEventListener("click", () => {
      const date = calendarState.selectedDate;
      const gongsu = parseFloat(document.getElementById("input-gongsu").value);
      const memo = document.getElementById("input-memo").value.trim();
      const isTrip = isToggleOn("input-trip-toggle");
      if (!inputState.companyId) return toast("업체를 선택하세요");
      if (!gongsu || gongsu <= 0) return toast("공수를 입력하세요");
      const { merged } = saveOrMergeRecord({ date, companyId: inputState.companyId, gongsu, memo, isTrip });
      document.getElementById("input-memo").value = "";
      setToggle("input-trip-toggle", false);
      toast(merged ? "기존 기록을 수정했습니다" : "저장했습니다");
      renderCalendar();
      renderInputMonthList();
    });

    document.getElementById("month-prev").addEventListener("click", () => { monthState.ym = shiftMonth(monthState.ym, -1); renderMonth(); });
    document.getElementById("month-next").addEventListener("click", () => { monthState.ym = shiftMonth(monthState.ym, 1); renderMonth(); });
    document.getElementById("month-amount-toggle").addEventListener("click", () => {
      monthAmountView = !monthAmountView;
      renderMonth();
    });

    document.getElementById("add-company-btn").addEventListener("click", () => {
      const input = document.getElementById("new-company-name");
      const name = input.value.trim();
      if (!name) return toast("업체명을 입력하세요");
      addCompanyIfNotExists(name);
      input.value = "";
      renderCompaniesTab();
    });

    document.getElementById("edit-gongsu-minus").addEventListener("click", () => adjustGongsu("edit-gongsu", -getGongsuStep()));
    document.getElementById("edit-gongsu-plus").addEventListener("click", () => adjustGongsu("edit-gongsu", getGongsuStep()));
    document.getElementById("edit-cancel-btn").addEventListener("click", closeEditModal);
    document.getElementById("edit-modal").addEventListener("click", (e) => {
      if (e.target.id === "edit-modal") closeEditModal();
    });
    document.getElementById("edit-save-btn").addEventListener("click", () => {
      const date = document.getElementById("edit-date").value;
      const gongsu = parseFloat(document.getElementById("edit-gongsu").value);
      const memo = document.getElementById("edit-memo").value.trim();
      const isTrip = isToggleOn("edit-trip-toggle");
      if (!date) return toast("날짜를 선택하세요");
      if (!editState.companyId) return toast("업체를 선택하세요");
      if (!gongsu || gongsu <= 0) return toast("공수를 입력하세요");
      const { merged } = saveOrMergeRecord({ id: editState.id, date, companyId: editState.companyId, gongsu, memo, isTrip });
      closeEditModal();
      toast(merged ? "같은 날짜·업체 기록에 합쳐서 수정했습니다" : "수정했습니다");
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
    document.getElementById("day-modal-gongsu-minus").addEventListener("click", () => adjustGongsu("day-modal-gongsu", -getGongsuStep(), "day-modal-gongsu-presets"));
    document.getElementById("day-modal-gongsu-plus").addEventListener("click", () => adjustGongsu("day-modal-gongsu", getGongsuStep(), "day-modal-gongsu-presets"));
    document.getElementById("day-modal-gongsu").addEventListener("input", () => updateGongsuPresetHighlight("day-modal-gongsu-presets", "day-modal-gongsu"));
    document.getElementById("day-modal-add-btn").addEventListener("click", () => {
      const gongsu = parseFloat(document.getElementById("day-modal-gongsu").value);
      const memo = document.getElementById("day-modal-memo").value.trim();
      const isTrip = isToggleOn("day-modal-trip-toggle");
      if (!dayModalState.companyId) return toast("업체를 선택하세요");
      if (!gongsu || gongsu <= 0) return toast("공수를 입력하세요");
      const { merged } = saveOrMergeRecord({ date: dayModalState.date, companyId: dayModalState.companyId, gongsu, memo, isTrip });
      document.getElementById("day-modal-memo").value = "";
      setToggle("day-modal-trip-toggle", false);
      toast(merged ? "기존 기록을 수정했습니다" : "저장했습니다");
      renderDayModalList();
      renderCalendar();
      if (dayModalState.date.slice(0, 7) === calendarState.ym) renderInputMonthList();
    });

    document.getElementById("calendar-delete-cancel-btn").addEventListener("click", () => closeCalendarDeleteModal());
    document.getElementById("calendar-delete-modal").addEventListener("click", (e) => {
      if (e.target.id === "calendar-delete-modal") closeCalendarDeleteModal();
    });
    document.getElementById("calendar-delete-confirm-btn").addEventListener("click", () => {
      const date = calendarDeleteModalState.date;
      if (!date) return closeCalendarDeleteModal();
      saveRecords(loadRecords().filter((r) => r.date !== date));
      toast("삭제했습니다");
      closeCalendarDeleteModal();
      renderCalendar();
      if (date.slice(0, 7) === calendarState.ym) renderInputMonthList();
    });

    document.getElementById("rate-modal-close-btn").addEventListener("click", () => closeRateModal());
    document.getElementById("rate-modal").addEventListener("click", (e) => {
      if (e.target.id === "rate-modal") closeRateModal();
    });
    document.querySelectorAll(".rate-type-option").forEach((btn) => {
      btn.addEventListener("click", () => {
        rateModalState.rateType = btn.dataset.type;
        refreshRateTypeOptions();
      });
    });
    document.getElementById("rate-trip-toggle").addEventListener("click", () => {
      const on = !isToggleOn("rate-trip-toggle");
      setToggle("rate-trip-toggle", on);
      document.getElementById("rate-trip-amount-field").style.display = on ? "" : "none";
    });
    document.getElementById("rate-save-btn").addEventListener("click", () => {
      const companies = loadCompanies();
      const company = companies.find((c) => c.id === rateModalState.companyId);
      if (!company) return closeRateModal();
      const amount = parseFloat(document.getElementById("rate-amount-input").value);
      if (!amount || amount <= 0) return toast("단가를 입력하세요");
      company.rateType = rateModalState.rateType;
      company.rate = Math.round(amount);

      if (isToggleOn("rate-trip-toggle")) {
        const tripAmount = parseFloat(document.getElementById("rate-trip-amount-input").value);
        if (!tripAmount || tripAmount <= 0) return toast("출장 단가를 입력하세요");
        company.hasTrip = true;
        company.tripRate = Math.round(tripAmount);
      } else {
        company.hasTrip = false;
        company.tripRate = null;
      }

      saveCompanies(companies);
      closeRateModal();
      toast("단가를 저장했습니다");
      renderCompaniesTab();
    });

    document.getElementById("payday-modal-close-btn").addEventListener("click", () => closePaydayModal());
    document.getElementById("payday-modal").addEventListener("click", (e) => {
      if (e.target.id === "payday-modal") closePaydayModal();
    });
    document.getElementById("payday-toggle").addEventListener("click", () => {
      const on = !isToggleOn("payday-toggle");
      setToggle("payday-toggle", on);
      document.getElementById("payday-day-field").style.display = on ? "" : "none";
      document.getElementById("payday-type-field").style.display = on ? "" : "none";
    });
    document.querySelectorAll(".payday-type-option").forEach((btn) => {
      btn.addEventListener("click", () => {
        paydayModalState.taxType = btn.dataset.type;
        refreshPaydayTypeOptions();
      });
    });
    document.getElementById("payday-save-btn").addEventListener("click", () => {
      const companies = loadCompanies();
      const company = companies.find((c) => c.id === paydayModalState.companyId);
      if (!company) return closePaydayModal();

      if (isToggleOn("payday-toggle")) {
        const day = parseInt(document.getElementById("payday-day-input").value, 10);
        if (!day || day < 1 || day > 31) return toast("월급날을 1~31 사이로 입력하세요");
        company.paydayEnabled = true;
        company.payday = day;
        company.taxType = paydayModalState.taxType;
      } else {
        company.paydayEnabled = false;
        company.payday = null;
        company.taxType = null;
      }

      saveCompanies(companies);
      closePaydayModal();
      toast("월급날 설정을 저장했습니다");
      renderCompaniesTab();
    });

    document.getElementById("invoice-reminder-close-btn").addEventListener("click", () => closeInvoiceReminderModal());
    document.getElementById("invoice-reminder-modal").addEventListener("click", (e) => {
      if (e.target.id === "invoice-reminder-modal") closeInvoiceReminderModal();
    });

    switchView("input");
    checkInvoiceReminder();

    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("sw.js").catch(() => {});
    }
  }

  document.addEventListener("DOMContentLoaded", init);
})();
