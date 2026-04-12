
export function debounce(fn, ms = 350) {
  let timer = null;
  return function debounced(...args) {
    clearTimeout(timer);
    timer = setTimeout(() => {
      fn.apply(this, args);
    }, ms);
  };
}
 

export function throttle(fn, ms = 200) {
  let lastCall = 0;
  let queued   = null;
 
  return function throttled(...args) {
    const now = Date.now();
    const remaining = ms - (now - lastCall);
 
    clearTimeout(queued);
 
    if (remaining <= 0) {
      lastCall = now;
      fn.apply(this, args);
    } else {
      
      queued = setTimeout(() => {
        lastCall = Date.now();
        fn.apply(this, args);
      }, remaining);
    }
  };
}
 

export function createScrollObserver(sentinel, callback, threshold = 0.1) {
  const obs = new IntersectionObserver(
    (entries) => {
      if (entries[0].isIntersecting) callback();
    },
    { threshold }
  );
  obs.observe(sentinel);
  return obs;
}
 

export const store = {
  get(key, fallback = null) {
    try {
      const raw = localStorage.getItem(key);
      return raw !== null ? JSON.parse(raw) : fallback;
    } catch {
      return fallback;
    }
  },
  set(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch {
      return false;
    }
  },
  remove(key) {
    try { localStorage.removeItem(key); return true; }
    catch { return false; }
  },
};
 

export class Paginator {
  constructor(items = [], pageSize = 12) {
    this.all       = items;
    this.pageSize  = pageSize;
    this.page      = 1;
  }
 
  get totalPages() {
    return Math.max(1, Math.ceil(this.all.length / this.pageSize));
  }
 
  get hasMore() {
    return this.page < this.totalPages;
  }
 

  getPage(n) {
    const start = (n - 1) * this.pageSize;
    return this.all.slice(start, start + this.pageSize);
  }
 
   
  getAccumulated() {
    return this.all.slice(0, this.page * this.pageSize);
  }
 
  next() {
    if (this.hasMore) this.page++;
    return this;
  }
 
  prev() {
    if (this.page > 1) this.page--;
    return this;
  }
 
  goTo(n) {
    this.page = Math.max(1, Math.min(n, this.totalPages));
    return this;
  }
 
  reset() {
    this.page = 1;
    return this;
  }
 
  setItems(items) {
    this.all  = items;
    this.page = 1;
    return this;
  }
}
 