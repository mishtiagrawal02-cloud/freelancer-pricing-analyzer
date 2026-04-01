// logic.js — Pure data processing (no DOM)
 
// Uses map(), filter(), reduce() as required
 
export function analyzePrices(jobs) {
  // filter() — only jobs with valid salary
  const withSalary = jobs.filter(j => j.salary !== null && j.salary > 0);
 
  if (!withSalary.length) {
    return { avg: 0, min: 0, max: 0, recommendedMin: 0, recommendedMax: 0, count: 0, total: jobs.length };
  }
 
  // map() — extract salary values
  const prices = withSalary.map(j => j.salary);
 
  // reduce() — compute sum for average
  const sum = prices.reduce((acc, p) => acc + p, 0);
 
  const avg = Math.round(sum / prices.length);
  const min = Math.min(...prices);
  const max = Math.max(...prices);
 
  return {
    avg,
    min,
    max,
    recommendedMin: Math.round(avg * 0.80),   // −20%
    recommendedMax: Math.round(avg * 1.20),   // +20%
    count: withSalary.length,
    total: jobs.length,
  };
}
 
export function filterAndSortJobs(jobs, opts) {
  const { search = "", category = "", sort = "newest", minPrice = 0, maxPrice = Infinity } = opts;
 
  // filter() — keyword search
  let result = jobs.filter(j => {
    const q = search.toLowerCase();
    return !q || j.title.toLowerCase().includes(q) || j.company.toLowerCase().includes(q);
  });
 
  // filter() — category
  result = result.filter(j => !category || j.category === category);
 
  // filter() — price range
  result = result.filter(j => {
    if (!j.salary) return true;
    return j.salary >= minPrice && j.salary <= maxPrice;
  });
 
  // sort
  if (sort === "low")    result.sort((a, b) => (a.salary ?? 0) - (b.salary ?? 0));
  if (sort === "high")   result.sort((a, b) => (b.salary ?? 0) - (a.salary ?? 0));
  if (sort === "newest") result.sort((a, b) => b.date - a.date);
  if (sort === "alpha")  result.sort((a, b) => a.title.localeCompare(b.title));
 
  return result;
}
 
export function getCategories(jobs) {
  return [...new Set(jobs.map(j => j.category))].sort();
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
 