// ui.js — All DOM rendering functions
 
import { CATEGORY_COLORS } from "./api.js";
import { formatCurrency, relativeDate } from "./logic.js";
 
// ── Skeleton loader ──────────────────────────────────────────────────────────
 
export function showLoading() {
  document.getElementById("jobs").innerHTML = Array(6).fill(0).map(() => `
    <div class="job-card skeleton-card">
      <div class="sk sk-title"></div>
      <div class="sk sk-company"></div>
      <div class="sk sk-row">
        <div class="sk sk-badge"></div>
        <div class="sk sk-price"></div>
      </div>
    </div>
  `).join("");
 
  document.getElementById("results").innerHTML = Array(4).fill(0).map(() => `
    <div class="stat-card">
      <div class="sk sk-stat-icon"></div>
      <div class="sk sk-stat-label"></div>
      <div class="sk sk-stat-value"></div>
    </div>
  `).join("");
}
 
// ── Stats ────────────────────────────────────────────────────────────────────
 
export function displayStats(stats) {
  document.getElementById("results").innerHTML = `
    <div class="stat-card animate-up" style="animation-delay:0ms">
      <div class="stat-icon">📊</div>
      <span class="stat-label">Total Listings</span>
      <h2 class="stat-value">${stats.total}</h2>
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
    </div>
  `;
}
 
// ── Job cards ────────────────────────────────────────────────────────────────
 
export function displayJobs(jobs, favorites, onToggleFav) {
  const container = document.getElementById("jobs");
 
  if (!jobs.length) {
    container.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">🔍</div>
        <p>No listings match your filters.</p>
        <button onclick="window.resetFilters()">Clear filters</button>
      </div>`;
    return;
  }
 
  container.innerHTML = jobs.map((job, i) => {
    const color     = CATEGORY_COLORS[job.category] || "#94a3b8";
    const isFav     = favorites.has(job.id);
    const salary    = job.salary ? formatCurrency(job.salary) : "Salary not listed";
    const tierLabel = job.salary > 80000 ? "High Paying" : job.salary > 30000 ? "Mid Range" : job.salary ? "Entry" : "Unlisted";
    const tierClass = job.salary > 80000 ? "tier-high" : job.salary > 30000 ? "tier-mid" : "tier-entry";
 
    return `
      <div class="job-card animate-up" style="animation-delay:${i * 35}ms">
        <button class="fav-btn${isFav ? " active" : ""}" data-id="${job.id}" aria-label="Favourite">${isFav ? "♥" : "♡"}</button>
        <div class="cat-bar" style="background:${color}22; border-left:3px solid ${color}">
          <span class="cat-label" style="color:${color}">${job.category}</span>
        </div>
        <h3 class="job-title">${esc(job.title)}</h3>
        <p class="job-company">${esc(job.company)}</p>
        <div class="job-footer">
          <span class="job-price">${salary}</span>
          <div class="job-meta">
            <span class="tier-badge ${tierClass}">${tierLabel}</span>
            <span class="job-date">${relativeDate(job.date)}</span>
          </div>
        </div>
        ${job.url !== "#" ? `<a class="job-link" href="${job.url}" target="_blank" rel="noopener">View listing ↗</a>` : ""}
      </div>`;
  }).join("");
 
  container.querySelectorAll(".fav-btn").forEach(btn => {
    btn.addEventListener("click", () => onToggleFav(Number(btn.dataset.id)));
  });
}
 
// ── Category dropdown ────────────────────────────────────────────────────────
 
export function populateCategories(categories) {
  const sel = document.getElementById("category");
  categories.forEach(cat => {
    const opt = document.createElement("option");
    opt.value = cat; opt.textContent = cat;
    sel.appendChild(opt);
  });
}
 
// ── Count label ──────────────────────────────────────────────────────────────
 
export function updateCount(n, total) {
  const el = document.getElementById("countLabel");
  if (el) el.textContent = `${n} of ${total} listings`;
}
 
// ── Toast ────────────────────────────────────────────────────────────────────
 
export function showToast(msg) {
  const t = document.getElementById("toast");
  t.textContent = msg; t.classList.add("show");
  setTimeout(() => t.classList.remove("show"), 2200);
}
 
// ── Error ────────────────────────────────────────────────────────────────────
 
export function showError(msg) {
  const el = document.getElementById("errorBanner");
  if (el) { el.textContent = msg; el.style.display = "block"; }
}
 
function esc(s) {
  return s.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;");
}
 