
 
import { CATEGORY_COLORS, EXPERIENCE_MULTIPLIERS } from "./api.js";
import { formatCurrency, relativeDate, getPersonalizedPricing } from "./logic.js";
 

 
export function showLoading() {
  document.getElementById("jobs").innerHTML = `
    <div class="spinner-wrap">
      <div class="spinner"><div></div><div></div><div></div><div></div></div>
      <p class="spinner-label">Fetching live market data…</p>
    </div>`;
  document.getElementById("results").innerHTML = Array(4).fill(0).map(() => `
    <div class="stat-card">
      <div class="sk sk-stat-icon"></div>
      <div class="sk sk-stat-label"></div>
      <div class="sk sk-stat-value"></div>
      <div class="sk sk-stat-sub"></div>
    </div>`).join("");
}
 
export function showLoadingMore() {
  const el = document.getElementById("loadMoreSpinner");
  if (el) el.style.display = "flex";
}
export function hideLoadingMore() {
  const el = document.getElementById("loadMoreSpinner");
  if (el) el.style.display = "none";
}
 

export function displayStats(stats) {
  document.getElementById("results").innerHTML = `
    <div class="stat-card animate-up" style="animation-delay:0ms" title="Total jobs fetched from API">
      <div class="stat-icon">📊</div>
      <span class="stat-label">Total Listings</span>
      <h2 class="stat-value counter" data-target="${stats.total}">${stats.total}</h2>
      <div class="stat-sub">${stats.count} with salary data</div>
    </div>
    <div class="stat-card accent animate-up" style="animation-delay:80ms">
      <div class="stat-icon">⚡</div>
      <span class="stat-label">Market Average</span>
      <h2 class="stat-value">${formatCurrency(stats.avg)}</h2>
      <span class="stat-badge">benchmark</span>
    </div>
    <div class="stat-card animate-up" style="animation-delay:160ms">
      <div class="stat-icon">📉</div>
      <span class="stat-label">Recommended Min</span>
      <h2 class="stat-value">${formatCurrency(stats.recommendedMin)}</h2>
      <div class="stat-sub">−20% from average</div>
    </div>
    <div class="stat-card animate-up" style="animation-delay:240ms">
      <div class="stat-icon">📈</div>
      <span class="stat-label">Recommended Max</span>
      <h2 class="stat-value">${formatCurrency(stats.recommendedMax)}</h2>
      <div class="stat-sub">+20% from average</div>
    </div>`;
 
  
  animateCounter(document.querySelector(".stat-value.counter"), stats.total);
}
 
function animateCounter(el, target) {
  if (!el || !target) return;
  let current = 0;
  const step  = Math.ceil(target / 40);
  const timer = setInterval(() => {
    current = Math.min(current + step, target);
    el.textContent = current.toLocaleString("en-IN");
    if (current >= target) clearInterval(timer);
  }, 30);
}
 

 
export function displayJobs(jobs, favorites, onToggleFav, onViewMore, appendMode = false) {
  const container = document.getElementById("jobs");
 
  if (!jobs.length && !appendMode) {
    container.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">🔍</div>
        <p>No listings match your filters.</p>
        <button onclick="window.resetFilters()">Clear filters</button>
      </div>`;
    return;
  }
 
  const html = jobs.map((job, i) => {
    const color     = CATEGORY_COLORS[job.category] || "#94a3b8";
    const isFav     = favorites.has(job.id);
    const salary    = job.salary ? formatCurrency(job.salary) : null;
    const tierLabel = job.salary > 80000 ? "High Paying" : job.salary > 30000 ? "Mid Range" : job.salary ? "Entry" : "Unlisted";
    const tierClass = job.salary > 80000 ? "tier-high" : job.salary > 30000 ? "tier-mid" : job.salary ? "tier-entry" : "tier-unknown";
    const borderColor = job.salary > 80000 ? "var(--green)" : job.salary > 30000 ? "var(--amber)" : job.salary ? "var(--red)" : "var(--border)";
 
    return `
      <div class="job-card animate-up" style="animation-delay:${(i%12)*30}ms;border-bottom:3px solid ${borderColor}" data-id="${job.id}">
        <button class="fav-btn${isFav?" active":""}" data-id="${job.id}" aria-label="Favourite">${isFav?"♥":"♡"}</button>
        <div class="cat-bar" style="background:${color}18;border-left:3px solid ${color}">
          <span class="cat-label" style="color:${color}">${job.category}</span>
          <span class="job-type-tag">${job.jobType||"Remote"}</span>
        </div>
        <h3 class="job-title">${esc(job.title)}</h3>
        <p class="job-company">🏢 ${esc(job.company)}</p>
        <p class="job-loc">📍 ${esc(job.location||"Worldwide")}</p>
        ${job.description ? `<p class="job-desc">${esc(job.description.slice(0,100))}…</p>` : ""}
        ${job.tags?.length ? `<div class="job-tags">${job.tags.slice(0,3).map(t=>`<span class="job-tag">${esc(t)}</span>`).join("")}</div>` : ""}
        <div class="job-footer">
          <div class="salary-block">
            ${salary ? `<span class="job-price">${salary}</span>` : `<span class="job-price unlisted">Salary not listed</span>`}
            <span class="tier-badge ${tierClass}">${tierLabel}</span>
          </div>
          <span class="job-date">${relativeDate(job.date)}</span>
        </div>
        <div class="card-actions">
          <button class="view-more-btn" data-id="${job.id}">View Details</button>
          ${job.url && job.url !== "#" ? `<a class="apply-link" href="${job.url}" target="_blank" rel="noopener">Apply ↗</a>` : ""}
        </div>
      </div>`;
  }).join("");
 
  if (appendMode) {
    const sentinel = document.getElementById("scrollSentinel");
    if (sentinel) sentinel.remove();
    container.insertAdjacentHTML("beforeend", html);
  } else {
    container.innerHTML = html;
  }
 
  container.querySelectorAll(".fav-btn").forEach(b =>
    b.addEventListener("click", () => onToggleFav(Number(b.dataset.id)))
  );
  container.querySelectorAll(".view-more-btn").forEach(b =>
    b.addEventListener("click", () => onViewMore(Number(b.dataset.id)))
  );
}
 

 
export function appendScrollSentinel() {
  const container = document.getElementById("jobs");
  let sentinel = document.getElementById("scrollSentinel");
  if (!sentinel) {
    sentinel = document.createElement("div");
    sentinel.id = "scrollSentinel";
    sentinel.style.cssText = "height:20px;width:100%;grid-column:1/-1;";
    container.appendChild(sentinel);
  }
  return sentinel;
}
export function removeScrollSentinel() {
  document.getElementById("scrollSentinel")?.remove();
}
 

 
export function displayPagination(paginator, onPage) {
  const el = document.getElementById("pagination");
  if (!el) return;
  const { page, totalPages } = paginator;
  if (totalPages <= 1) { el.innerHTML = ""; return; }
 
  const range = [];
  const left  = Math.max(1, page - 2);
  const right = Math.min(totalPages, page + 2);
  if (left > 1)  { range.push(1); if (left > 2) range.push("…"); }
  for (let i = left; i <= right; i++) range.push(i);
  if (right < totalPages) { if (right < totalPages-1) range.push("…"); range.push(totalPages); }
 
  el.innerHTML = `
    <div class="pagination-inner">
      <button class="page-nav" id="prevPage" ${page<=1?"disabled":""}>← Prev</button>
      <div class="page-numbers">
        ${range.map(p => p==="…"
          ? `<span class="page-ellipsis">…</span>`
          : `<button class="page-btn${p===page?" active":""}" data-page="${p}">${p}</button>`
        ).join("")}
      </div>
      <button class="page-nav" id="nextPage" ${page>=totalPages?"disabled":""}>Next →</button>
    </div>
    <p class="page-info">Page ${page} of ${totalPages} · ${paginator.all.length} results</p>`;
 
  el.querySelectorAll(".page-btn[data-page]").forEach(b =>
    b.addEventListener("click", () => onPage(Number(b.dataset.page)))
  );
  el.querySelector("#prevPage")?.addEventListener("click", () => onPage(page-1));
  el.querySelector("#nextPage")?.addEventListener("click", () => onPage(page+1));
}
 
export function setScrollMode(isInfinite) {
  const paginationEl = document.getElementById("pagination");
  const modeBtn      = document.getElementById("scrollModeBtn");
  if (paginationEl) paginationEl.style.display = isInfinite ? "none" : "";
  if (modeBtn) {
    modeBtn.textContent = isInfinite ? "⇌ Use Pagination" : "∞ Infinite Scroll";
    modeBtn.classList.toggle("active", isInfinite);
  }
}
 

 
export function displayCategoryInsights(insights) {
  const el = document.getElementById("categoryInsights");
  if (!el || !insights.length) return;
  const maxAvg = Math.max(...insights.map(i => i.avg));
  el.innerHTML = insights.map((ins, idx) => {
    const color = CATEGORY_COLORS[ins.category] || "#94a3b8";
    const pct   = Math.round((ins.avg / maxAvg) * 100);
    return `
      <div class="insight-row animate-up" style="animation-delay:${idx*55}ms">
        <div class="insight-left">
          <span class="insight-dot" style="background:${color}"></span>
          <span class="insight-cat">${ins.category}</span>
          <span class="insight-count">${ins.count} jobs</span>
        </div>
        <div class="insight-bar-wrap">
          <div class="insight-bar" style="width:${pct}%;background:${color}22;border-right:2px solid ${color}"></div>
        </div>
        <div class="insight-right">
          <span class="insight-avg" style="color:${color}">${formatCurrency(ins.avg)}</span>
          <span class="insight-range">${formatCurrency(ins.min)} – ${formatCurrency(ins.max)}</span>
        </div>
      </div>`;
  }).join("");
}
 

 
export function displayTopJobs(topHigh, topLow, favorites, onToggleFav, onViewMore) {
  renderTopSection("topHighJobs", topHigh, "🏆 Top 5 Highest Paying", favorites, onToggleFav, onViewMore);
  renderTopSection("topLowJobs",  topLow,  "💡 Top 5 Entry Level",    favorites, onToggleFav, onViewMore);
}
 
function renderTopSection(id, jobs, title, favorites, onToggleFav, onViewMore) {
  const el = document.getElementById(id);
  if (!el) return;
  el.closest(".top-section")?.querySelector(".top-section-title") && (el.closest(".top-section").querySelector(".top-section-title").textContent = title);
  el.innerHTML = jobs.map(job => {
    const color  = CATEGORY_COLORS[job.category] || "#94a3b8";
    const isFav  = favorites.has(job.id);
    return `
      <div class="top-card">
        <button class="fav-btn${isFav?" active":""}" data-id="${job.id}">${isFav?"♥":"♡"}</button>
        <span class="top-cat" style="color:${color};border-color:${color}33">${job.category}</span>
        <p class="top-title">${esc(job.title)}</p>
        <p class="top-company">${esc(job.company)}</p>
        <div class="top-footer">
          <span class="top-price">${formatCurrency(job.salary)}</span>
          <button class="view-btn" data-id="${job.id}">View ↗</button>
        </div>
      </div>`;
  }).join("");
  el.querySelectorAll(".fav-btn").forEach(b => b.addEventListener("click", () => onToggleFav(Number(b.dataset.id))));
  el.querySelectorAll(".view-btn").forEach(b  => b.addEventListener("click", () => onViewMore(Number(b.dataset.id))));
}
 

 
export function renderPricingCalculator(categories) {
  const catSel = document.getElementById("calcCategory");
  const expSel = document.getElementById("calcExperience");
  if (!catSel || !expSel) return;
  categories.forEach(cat => {
    const o = document.createElement("option");
    o.value = cat; o.textContent = cat; catSel.appendChild(o);
  });
  Object.keys(EXPERIENCE_MULTIPLIERS).forEach(exp => {
    const o = document.createElement("option");
    o.value = exp; o.textContent = exp; expSel.appendChild(o);
  });
}
 

export function updatePricingResult(allJobs) {
  const cat = document.getElementById("calcCategory")?.value;
  const exp = document.getElementById("calcExperience")?.value;
  const out = document.getElementById("calcResult");
  if (!out) return;
 
  if (!cat || !exp) {
    out.innerHTML = `<p class="calc-empty">Select a category and experience level above.</p>`;
    return;
  }
 
  const result = getPersonalizedPricing(allJobs, cat, exp);
  const color  = CATEGORY_COLORS[cat] || "#22d3ee";
 
  if (!result.count) {
    out.innerHTML = `<p class="calc-empty">No market data for <strong>${cat}</strong>. Try another category.</p>`;
    return;
  }
 
  out.innerHTML = `
    <div class="calc-out-grid">
      <div class="calc-out-card">
        <span>Floor Rate</span>
        <strong style="color:${color}">${formatCurrency(result.min)}</strong>
        <small>−20% of avg</small>
      </div>
      <div class="calc-out-card highlight" style="border-color:${color}">
        <span>✦ Recommended</span>
        <strong style="color:${color}">${formatCurrency(result.recommended)}</strong>
        <small>based on ${result.count} listings</small>
      </div>
      <div class="calc-out-card">
        <span>Ceiling Rate</span>
        <strong style="color:${color}">${formatCurrency(result.max)}</strong>
        <small>+20% of avg</small>
      </div>
    </div>
    <p class="calc-note">
      ${exp} · ${cat} · <span style="color:${color}">${(result.multiplier*100).toFixed(0)}% of market rate</span>
    </p>`;
}
 

 
export function displaySavedJobs(jobs, favorites, onToggleFav, onViewMore) {
  const el = document.getElementById("savedJobsList");
  if (!el) return;
  const saved = jobs.filter(j => favorites.has(j.id));
  const countEl = document.getElementById("savedCount");
  if (countEl) countEl.textContent = saved.length;
 
  if (!saved.length) {
    el.innerHTML = `<p class="saved-empty">No saved jobs yet. Click ♡ on any card to save it here.</p>`;
    return;
  }
  el.innerHTML = saved.map(job => {
    const color = CATEGORY_COLORS[job.category] || "#94a3b8";
    return `
      <div class="saved-card">
        <div class="saved-left">
          <span class="saved-dot" style="background:${color}"></span>
          <div>
            <p class="saved-title">${esc(job.title)}</p>
            <p class="saved-company">${esc(job.company)} · ${job.jobType||"Remote"}</p>
          </div>
        </div>
        <div class="saved-right">
          <span class="saved-price">${formatCurrency(job.salary)}</span>
          <button class="view-btn" data-id="${job.id}">View</button>
          <button class="unsave-btn" data-id="${job.id}" title="Remove">✕</button>
        </div>
      </div>`;
  }).join("");
  el.querySelectorAll(".unsave-btn").forEach(b => b.addEventListener("click", () => onToggleFav(Number(b.dataset.id))));
  el.querySelectorAll(".view-btn").forEach(b  => b.addEventListener("click", () => onViewMore(Number(b.dataset.id))));
}
 
// ── Job Detail Modal ──────────────────────────────────────────────────────────
 
export function openJobModal(job, isFav, onToggleFav) {
  const color = CATEGORY_COLORS[job.category] || "#94a3b8";
  const modal = document.getElementById("jobModal");
  const body  = document.getElementById("modalBody");
 
  body.innerHTML = `
    <div class="modal-header" style="border-top:3px solid ${color}">
      <div class="modal-cat" style="color:${color}">${job.category} · ${job.jobType||"Remote"}</div>
      <h2 class="modal-title">${esc(job.title)}</h2>
      <p class="modal-company">🏢 ${esc(job.company)} &nbsp;·&nbsp; 📍 ${esc(job.location||"Worldwide")}</p>
    </div>
    <div class="modal-stats">
      <div class="modal-stat"><span>Salary</span><strong style="color:${color}">${formatCurrency(job.salary)}</strong></div>
      <div class="modal-stat"><span>Posted</span><strong>${relativeDate(job.date)}</strong></div>
      <div class="modal-stat"><span>Type</span><strong>${job.jobType||"Remote"}</strong></div>
    </div>
    <div class="modal-desc">
      <h4>Description</h4>
      <p>${esc(job.description||"No description available.")}</p>
    </div>
    ${job.tags?.length ? `<div class="modal-tags">${job.tags.map(t=>`<span class="modal-tag">${esc(t)}</span>`).join("")}</div>` : ""}
    <div class="modal-actions">
      <button class="modal-fav-btn${isFav?" active":""}" data-id="${job.id}">
        ${isFav ? "♥ Saved" : "♡ Save Job"}
      </button>
      ${job.url && job.url !== "#"
        ? `<a class="modal-apply-btn" href="${job.url}" target="_blank" rel="noopener">Apply Now ↗</a>`
        : `<span class="modal-apply-btn disabled">No link available</span>`}
    </div>`;
 
  modal.classList.add("open");
  document.body.style.overflow = "hidden";
 
  body.querySelector(".modal-fav-btn")?.addEventListener("click", () => {
    onToggleFav(job.id);
    closeModal();
  });
}
 
export function closeModal() {
  document.getElementById("jobModal")?.classList.remove("open");
  document.body.style.overflow = "";
}
 
 
export function populateCategories(categories) {
  const sel = document.getElementById("category");
  if (!sel) return;
  categories.forEach(cat => {
    const o = document.createElement("option");
    o.value = cat; o.textContent = cat; sel.appendChild(o);
  });
}
 
export function populateJobTypes(types) {
  const sel = document.getElementById("jobType");
  if (!sel) return;
  types.forEach(t => {
    const o = document.createElement("option");
    o.value = t; o.textContent = t; sel.appendChild(o);
  });
}
 
 
export function showInstallBanner(onInstall) {
  const banner = document.getElementById("installBanner");
  if (!banner) return;
  banner.style.display = "flex";
  banner.querySelector("#installBtn")?.addEventListener("click", onInstall);
  banner.querySelector("#dismissInstall")?.addEventListener("click", () => {
    banner.style.display = "none";
  });
}
 
export function updateOnlineStatus(online) {
  const el = document.getElementById("onlineStatus");
  if (!el) return;
  el.textContent = online ? "● Online" : "● Offline";
  el.className   = "status-dot " + (online ? "online" : "offline");
}
 
 
export function updateCount(n, total) {
  const el = document.getElementById("countLabel");
  if (el) el.textContent = `Showing ${n} of ${total}`;
}
 
export function showToast(msg, type = "info") {
  const t = document.getElementById("toast");
  t.textContent = msg;
  t.className   = `toast show toast-${type}`;
  clearTimeout(t._timer);
  t._timer = setTimeout(() => t.classList.remove("show"), 2600);
}
 
export function showError(msg) {
  const el = document.getElementById("errorBanner");
  if (el) { el.textContent = msg; el.style.display = "block"; }
}
 
function esc(s) {
  return String(s).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;");
}
 