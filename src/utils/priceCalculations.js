/**
 * priceCalculations.js
 * All financial computations. Never fabricates or interpolates prices.
 */

import { normalizeName } from "./normalizeData";

/**
 * Get the latest valid record for a commodity in a district.
 */
export function getLatestPrice(records, commodity, state, district) {
  const matches = records.filter(
    r =>
      r.isValid &&
      normalizeName(r.commodity) === normalizeName(commodity) &&
      normalizeName(r.state) === normalizeName(state) &&
      normalizeName(r.district) === normalizeName(district)
  );
  matches.sort((a, b) => new Date(b.arrivalDate) - new Date(a.arrivalDate));
  return matches[0] ?? null;
}

/**
 * Get historical prices for trend chart (one entry per date per market, latest market record).
 * Returns array sorted oldest → newest.
 */
export function getHistoricalPrices(records, commodity, state, district, market = null) {
  let matches = records.filter(
    r =>
      r.isValid &&
      normalizeName(r.commodity) === normalizeName(commodity) &&
      normalizeName(r.state) === normalizeName(state) &&
      normalizeName(r.district) === normalizeName(district) &&
      (market === null || normalizeName(r.market) === normalizeName(market))
  );

  // Group by date, take first (latest upload) if multiple
  const byDate = {};
  matches.forEach(r => {
    if (!byDate[r.arrivalDate]) byDate[r.arrivalDate] = r;
  });

  return Object.values(byDate).sort(
    (a, b) => new Date(a.arrivalDate) - new Date(b.arrivalDate)
  );
}

/**
 * Get latest price per market for a commodity in a district (for comparison).
 */
export function getMandiComparison(records, commodity, state, district) {
  const markets = [
    ...new Set(
      records
        .filter(
          r =>
            r.isValid &&
            normalizeName(r.commodity) === normalizeName(commodity) &&
            normalizeName(r.state) === normalizeName(state) &&
            normalizeName(r.district) === normalizeName(district)
        )
        .map(r => r.market)
    ),
  ];

  return markets
    .map(market => {
      const recs = records.filter(
        r =>
          r.isValid &&
          normalizeName(r.commodity) === normalizeName(commodity) &&
          normalizeName(r.state) === normalizeName(state) &&
          normalizeName(r.district) === normalizeName(district) &&
          normalizeName(r.market) === normalizeName(market)
      );
      recs.sort((a, b) => new Date(b.arrivalDate) - new Date(a.arrivalDate));
      return recs[0];
    })
    .filter(Boolean)
    .sort((a, b) => b.modalPrice - a.modalPrice);
}

/**
 * Price change vs previous report.
 * Returns { change, percent, direction } or null if no previous report.
 */
export function getPriceChange(records, commodity, state, district, market) {
  const hist = records
    .filter(
      r =>
        r.isValid &&
        normalizeName(r.commodity) === normalizeName(commodity) &&
        normalizeName(r.state) === normalizeName(state) &&
        normalizeName(r.district) === normalizeName(district) &&
        normalizeName(r.market) === normalizeName(market)
    )
    .sort((a, b) => new Date(b.arrivalDate) - new Date(a.arrivalDate));

  if (hist.length < 2) return null;
  const change = hist[0].modalPrice - hist[1].modalPrice;
  const percent = ((change / hist[1].modalPrice) * 100).toFixed(1);
  return {
    change,
    percent,
    direction: change > 0 ? "up" : change < 0 ? "down" : "flat",
    prevDate: hist[1].arrivalDate,
    prevPrice: hist[1].modalPrice,
  };
}

/**
 * Estimate net return for a quantity at a given mandi vs base mandi.
 */
export function estimateNetReturn({
  basePrice,
  targetPrice,
  quantityQ,
  extraTransportCost,
}) {
  if (
    !Number.isFinite(basePrice) ||
    !Number.isFinite(targetPrice) ||
    !Number.isFinite(quantityQ) ||
    !Number.isFinite(extraTransportCost)
  )
    return null;

  const revenueBase = basePrice * quantityQ;
  const revenueTarget = targetPrice * quantityQ;
  const extraRevenue = revenueTarget - revenueBase;
  const netAdvantage = extraRevenue - extraTransportCost;

  return {
    revenueBase,
    revenueTarget,
    extraRevenue,
    extraTransportCost,
    netAdvantage,
    worthIt: netAdvantage > 0,
  };
}

/**
 * Check if a price crosses the alert threshold.
 */
export function shouldTriggerAlert(currentPrice, targetPrice) {
  if (!Number.isFinite(currentPrice) || !Number.isFinite(targetPrice)) return false;
  return currentPrice >= targetPrice;
}
