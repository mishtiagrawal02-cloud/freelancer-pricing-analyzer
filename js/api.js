// api.js — Fetch and normalise job data
// Tries Remotive (real freelance jobs), falls back to FakeStore
 
const REMOTIVE_URL = "https://remotive.com/api/remote-jobs?limit=60";
const FAKESTORE_URL = "https://fakestoreapi.com/products";
 
export const CATEGORY_COLORS = {
  "Software Development": "#22d3ee",
  "Design":              "#a78bfa",
  "Marketing":           "#f472b6",
  "Finance":             "#34d399",
  "Writing":             "#fb923c",
  "Customer Service":    "#60a5fa",
  "Other":               "#94a3b8",
};
 
export async function fetchJobs() {
  try {
    const res = await fetch(REMOTIVE_URL);
    if (!res.ok) throw new Error("Remotive failed");
    const data = await res.json();
    return data.jobs.map((job, i) => ({
      id:       i,
      title:    job.title        || "Untitled Role",
      company:  job.company_name || "Unknown Company",
      category: normalizeCategory(job.category || ""),
      salary:   extractSalary(job.salary || ""),
      url:      job.url          || "#",
      date:     job.publication_date ? new Date(job.publication_date) : new Date(),
    }));
  } catch (_) {
    try {
      const res = await fetch(FAKESTORE_URL);
      const data = await res.json();
      return data.map((item, i) => ({
        id:       i,
        title:    item.title || "Freelance Project",
        company:  "Various Clients",
        category: fakeCategory(item.category),
        salary:   Math.round(item.price * 80),
        url:      "#",
        date:     new Date(Date.now() - i * 86400000),
      }));
    } catch (err) {
      console.error("Both APIs failed:", err);
      return [];
    }
  }
}
 
export function extractSalary(raw) {
  if (!raw) return null;
  const cleaned = raw.replace(/[₹$€£,]/g, "");
  const nums = [...cleaned.matchAll(/(\d+(?:\.\d+)?)\s*[kK]?/g)]
    .map(m => {
      const n = parseFloat(m[1]);
      return /[kK]/.test(m[0]) ? n * 1000 : n;
    })
    .filter(n => n > 100);
  if (!nums.length) return null;
  return Math.round(nums.reduce((s, n) => s + n, 0) / nums.length);
}
 
function normalizeCategory(raw) {
  const map = {
    software: "Software Development", dev: "Software Development",
    engineer: "Software Development", design: "Design",
    ui: "Design", ux: "Design", marketing: "Marketing",
    content: "Writing", writing: "Writing", finance: "Finance",
    accounting: "Finance", customer: "Customer Service", support: "Customer Service",
  };
  const lower = raw.toLowerCase();
  for (const [key, val] of Object.entries(map)) {
    if (lower.includes(key)) return val;
  }
  return "Other";
}
 
function fakeCategory(cat) {
  return { "electronics": "Software Development", "men's clothing": "Design",
           "women's clothing": "Marketing", "jewelery": "Finance" }[cat] || "Other";
}
 