/**
 * mandiDataService.js
 * Loads mandi price data: tries live API first, falls back to bundled CSV.
 */

import Papa from "papaparse";
import { normalizeRecords } from "../utils/normalizeData";

const BUNDLED_CSV = "/data/mandi-prices.csv";

// data.gov.in Agmarknet API
const API_BASE = "https://api.data.gov.in/resource/9ef84268-d588-465a-a308-a864a43d0070";

async function fetchFromAPI(apiKey) {
  const url = new URL(API_BASE);
  url.searchParams.set("api-key", apiKey);
  url.searchParams.set("format", "json");
  url.searchParams.set("limit", "500");
  const res = await fetch(url.toString(), { signal: AbortSignal.timeout(8000) });
  if (!res.ok) throw new Error(`API error ${res.status}`);
  const json = await res.json();
  const records = json?.records ?? [];
  if (!records.length) throw new Error("API returned no records");
  return normalizeRecords(records);
}

async function fetchBundledCSV() {
  const res = await fetch(BUNDLED_CSV);
  if (!res.ok) throw new Error(`CSV fetch error ${res.status}`);
  const text = await res.text();
  return new Promise((resolve, reject) => {
    Papa.parse(text, {
      header: true,
      skipEmptyLines: true,
      complete: result => resolve(normalizeRecords(result.data)),
      error: err => reject(err),
    });
  });
}

/**
 * Main entry point.
 * Returns { records, source: 'api' | 'cache', loadedAt }
 */
export async function loadMandiData(apiKey = null) {
  if (apiKey) {
    try {
      const records = await fetchFromAPI(apiKey);
      return { records, source: "api", loadedAt: new Date().toISOString() };
    } catch (e) {
      console.warn("API load failed, falling back to CSV:", e.message);
    }
  }
  const records = await fetchBundledCSV();
  return { records, source: "cache", loadedAt: new Date().toISOString() };
}
