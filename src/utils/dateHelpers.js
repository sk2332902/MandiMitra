/**
 * dateHelpers.js
 */

export function formatDate(dateStr, lang = "en") {
  if (!dateStr) return lang === "hi" ? "अज्ञात तारीख" : "Unknown date";
  const d = new Date(dateStr + "T00:00:00");
  if (isNaN(d.getTime())) return dateStr;
  const locale = lang === "hi" ? "hi-IN" : "en-IN";
  return d.toLocaleDateString(locale, { day: "numeric", month: "long", year: "numeric" });
}

export function daysAgo(dateStr) {
  if (!dateStr) return null;
  const d = new Date(dateStr + "T00:00:00");
  if (isNaN(d.getTime())) return null;
  const now = new Date();
  const diff = Math.floor((now - d) / (1000 * 60 * 60 * 24));
  return diff;
}

export function stalenessLabel(dateStr, lang = "en") {
  const days = daysAgo(dateStr);
  if (days === null) return lang === "hi" ? "तारीख अज्ञात" : "Date unknown";
  if (days === 0) return lang === "hi" ? "आज की रिपोर्ट" : "Reported today";
  if (days === 1) return lang === "hi" ? "कल की रिपोर्ट" : "Reported yesterday";
  if (days <= 3) return lang === "hi" ? `${days} दिन पहले` : `Reported ${days} days ago`;
  if (days <= 7) return lang === "hi" ? `${days} दिन पहले (पुरानी)` : `Reported ${days} days ago (stale)`;
  return lang === "hi" ? `${days} दिन पहले (बहुत पुरानी)` : `Reported ${days} days ago (very stale)`;
}

export function isFresh(dateStr, maxDays = 3) {
  const days = daysAgo(dateStr);
  return days !== null && days <= maxDays;
}
