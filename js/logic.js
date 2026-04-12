import { EXPERIENCE_MULTIPLIERS } from "./api.js";
 
export function analyzePrices(jobs) {
  const withSalary = jobs.filter(j => j.salary !== null && j.salary > 0);
  if (!withSalary.length) {
    return { avg: 0, min: 0, max: 0, recommendedMin: 0, recommendedMax: 0, count: 0, total: jobs.length };
  }
  const prices = withSalary.map(j => j.salary);
  const sum    = prices.reduce((acc, p) => acc + p, 0);
  const avg    = Math.round(sum / prices.length);
  return {
    avg, min: Math.min(...prices), max: Math.max(...prices),
    recommendedMin: Math.round(avg * 0.80),
    recommendedMax: Math.round(avg * 1.20),
    count: withSalary.length, total: jobs.length,
  };
}
 
export function getCategoryInsights(jobs) {
  const grouped = jobs.filter(j => j.salary > 0).reduce((acc, job) => {
    if (!acc[job.category]) acc[job.category] = [];
    acc[job.category].push(job.salary);
    return acc;
  }, {});
  return Object.entries(grouped).map(([category, salaries]) => {
    const avg = Math.round(salaries.reduce((s, p) => s + p, 0) / salaries.length);
    return { category, avg, min: Math.min(...salaries), max: Math.max(...salaries), count: salaries.length };
  }).sort((a, b) => b.avg - a.avg);
}
 
export function getTopJobs(jobs, n = 5, order = "high") {
  return jobs.filter(j => j.salary > 0)
    .sort((a, b) => order === "high" ? b.salary - a.salary : a.salary - b.salary)
    .slice(0, n);
}
 
export function filterAndSortJobs(jobs, opts) {
  const { search = "", category = "", jobType = "", sort = "newest", minPrice = 0, maxPrice = Infinity } = opts;
  let result = jobs
    .filter(j => {
      const q = search.toLowerCase();
      return !q || j.title.toLowerCase().includes(q) || j.company.toLowerCase().includes(q) || (j.tags||[]).some(t => t.toLowerCase().includes(q));
    })
    .filter(j => !category || j.category === category)
    .filter(j => !jobType  || j.jobType  === jobType)
    .filter(j => { if (!j.salary) return true; return j.salary >= minPrice && j.salary <= maxPrice; });
  if (sort === "low")    result.sort((a, b) => (a.salary ?? 0) - (b.salary ?? 0));
  if (sort === "high")   result.sort((a, b) => (b.salary ?? 0) - (a.salary ?? 0));
  if (sort === "newest") result.sort((a, b) => b.date - a.date);
  if (sort === "alpha")  result.sort((a, b) => a.title.localeCompare(b.title));
  return result;
}
 
export function getPersonalizedPricing(jobs, category, experienceLabel) {
  const multiplier = EXPERIENCE_MULTIPLIERS[experienceLabel] ?? 1.0;
  const relevant   = jobs.filter(j => j.category === category && j.salary > 0);
  if (!relevant.length) return { min: 0, max: 0, recommended: 0, multiplier, count: 0 };
  const prices = relevant.map(j => j.salary);
  const avg    = Math.round(prices.reduce((s, p) => s + p, 0) / prices.length);
  return {
    min: Math.round(avg * 0.80 * multiplier),
    max: Math.round(avg * 1.20 * multiplier),
    recommended: Math.round(avg * multiplier),
    multiplier, count: relevant.length,
  };
}
 
export function getCategories(jobs) {
  return [...new Set(jobs.map(j => j.category))].sort();
}
export function getJobTypes(jobs) {
  return [...new Set(jobs.map(j => j.jobType).filter(Boolean))].sort();
}
export function formatCurrency(n) {
  if (!n && n !== 0) return "N/A";
  return "₹" + n.toLocaleString("en-IN");
}
export function relativeDate(date) {
  const days = Math.floor((Date.now() - date) / 86400000);
  if (days === 0) return "Today";
  if (days === 1) return "Yesterday";
  if (days < 7)  return `${days}d ago`;
  if (days < 30) return `${Math.floor(days / 7)}w ago`;
  return `${Math.floor(days / 30)}mo ago`;
}
 