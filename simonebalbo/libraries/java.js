// Lightweight statistics helpers (no external deps)

function toNumbers(values) {
    const numbers = [];
    for (let i = 0; i < values.length; i++) {
      const n = Number(values[i]);
      if (Number.isFinite(n)) numbers.push(n);
    }
    return numbers;
  }
  
  function mean(values) {
    const nums = toNumbers(values);
    if (nums.length === 0) return NaN;
    let sum = 0;
    for (let i = 0; i < nums.length; i++) sum += nums[i];
    return sum / nums.length;
  }
  
  function stddev(values, useSample = false) {
    const nums = toNumbers(values);
    const n = nums.length;
    if (n === 0) return NaN;
    if (useSample && n < 2) return NaN;
    const mu = mean(nums);
    let sumSq = 0;
    for (let i = 0; i < n; i++) {
      const d = nums[i] - mu;
      sumSq += d * d;
    }
    const denom = useSample ? (n - 1) : n;
    return Math.sqrt(sumSq / denom);
  }
  
  function median(values) {
    const nums = toNumbers(values).sort((a, b) => a - b);
    const n = nums.length;
    if (n === 0) return NaN;
    const mid = Math.floor(n / 2);
    if (n % 2 === 0) return (nums[mid - 1] + nums[mid]) / 2;
    return nums[mid];
  }
  
  function mode(values) {
    const freq = new Map();
    for (let i = 0; i < values.length; i++) {
      const key = String(values[i]);
      freq.set(key, (freq.get(key) || 0) + 1);
    }
    let maxKey = null;
    let maxCount = 0;
    for (const [k, c] of freq.entries()) {
      if (c > maxCount) { maxCount = c; maxKey = k; }
    }
    return maxKey;
  }
  
  // Expose globally for sketch.js
  window.Stats = { mean, stddev, median, mode };