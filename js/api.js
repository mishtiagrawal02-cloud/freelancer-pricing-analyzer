
 
import { store } from "./perf.js";
 
const REMOTIVE_URL  = "https://remotive.com/api/remote-jobs?limit=80";
const FAKESTORE_URL = "https://fakestoreapi.com/products";
const CACHE_KEY     = "fa_jobs_cache";
const CACHE_TTL     = 5 * 60 * 1000; 
 
export const CATEGORY_COLORS = {
  "Software Development": "#22d3ee",
  "Design":               "#a78bfa",
  "Marketing":            "#f472b6",
  "Finance":              "#34d399",
  "Writing":              "#fb923c",
  "Customer Service":     "#60a5fa",
  "Other":                "#94a3b8",
};
 
export const EXPERIENCE_MULTIPLIERS = {
  "Beginner (0–1 yrs)":   0.65,
  "Junior (1–3 yrs)":     0.85,
  "Mid-level (3–5 yrs)":  1.00,
  "Senior (5–8 yrs)":     1.30,
  "Expert (8+ yrs)":      1.65,
};
 
export async function fetchJobs() {
  // Check sessionStorage cache
  const cached = sessionStorage.getItem(CACHE_KEY);
  if (cached) {
    try {
      const { data, ts } = JSON.parse(cached);
      if (Date.now() - ts < CACHE_TTL) {
        // Re-hydrate Date objects
        return data.map(j => ({ ...j, date: new Date(j.date) }));
      }
    } catch { }
  }
 
  let jobs = [];
 
  try {
    const res = await fetch(REMOTIVE_URL);
    if (!res.ok) throw new Error("Remotive failed");
    const data = await res.json();
    jobs = data.jobs.map((job, i) => ({
      id:          i,
      title:       job.title                           || "Untitled Role",
      company:     job.company_name                    || "Unknown Company",
      category:    normalizeCategory(job.category      || ""),
      salary:      extractSalary(job.salary            || ""),
      salaryRaw:   job.salary                          || "",
      url:         job.url                             || "#",
      jobType:     job.job_type                        || "Full-time",
      location:    job.candidate_required_location     || "Worldwide",
      description: stripHtml(job.description           || "No description available."),
      date:        job.publication_date ? new Date(job.publication_date) : new Date(),
      tags:        Array.isArray(job.tags) ? job.tags  : [],
    }));
  } catch (_) {
    try {
      const res  = await fetch(FAKESTORE_URL);
      const data = await res.json();
      const types = ["Contract", "Freelance", "Part-time", "Full-time"];
      jobs = data.map((item, i) => ({
        id:          i,
        title:       item.title       || "Freelance Project",
        company:     "Various Clients",
        category:    fakeCategory(item.category),
        salary:      Math.round(item.price * 80),
        salaryRaw:   `$${item.price}`,
        url:         "#",
        jobType:     types[i % types.length],
        location:    "Remote",
        description: (item.description || "No description available.").slice(0, 400),
        date:        new Date(Date.now() - i * 86400000),
        tags:        [],
      }));
    } catch (err) {
      console.error("Both APIs failed:", err);
      return [];
    }
  }
 
  
  try {
    sessionStorage.setItem(CACHE_KEY, JSON.stringify({ data: jobs, ts: Date.now() }));
  } catch {  }
 
  return jobs;
}
 
export function extractSalary(raw) {
  if (!raw) return null;
  const cleaned = raw.replace(/[₹$€£,\s]/g, "");
  const nums = [...cleaned.matchAll(/(\d+(?:\.\d+)?)[kK]?/g)]
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
  return {
    "electronics":      "Software Development",
    "men's clothing":   "Design",
    "women's clothing": "Marketing",
    "jewelery":         "Finance",
  }[cat] || "Other";
}
 
function stripHtml(html) {
  return html.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim().slice(0, 500);
}
 