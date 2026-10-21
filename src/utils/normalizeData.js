/**
 * normalizeData.js
 * Cleans and normalizes raw mandi price CSV records.
 * Never fabricates prices – missing fields are explicitly flagged.
 */

export function normalizeName(value) {
  return String(value ?? "")
    .trim()
    .replace(/\s+/g, " ")
    .toLowerCase();
}

export function parsePrice(value) {
  const num = parseFloat(String(value ?? "").replace(/[^\d.]/g, ""));
  if (!Number.isFinite(num) || num < 0) return null;
  return num;
}

export function parseDate(value) {
  if (!value) return null;
  const d = new Date(String(value).trim());
  if (isNaN(d.getTime())) return null;
  return d.toISOString().split("T")[0]; // yyyy-mm-dd
}

export function normalizeRecord(raw) {
  const state = String(raw["State"] ?? raw["state"] ?? "").trim();
  const district = String(raw["District"] ?? raw["district"] ?? "").trim();
  const market = String(raw["Market"] ?? raw["market"] ?? "").trim();
  const commodity = String(raw["Commodity"] ?? raw["commodity"] ?? "").trim();
  const variety = String(raw["Variety"] ?? raw["variety"] ?? "").trim();
  const arrivalDate = parseDate(raw["Arrival Date"] ?? raw["arrival_date"] ?? raw["date"] ?? "");
  const minPrice = parsePrice(raw["Min Price (Rs./Quintal)"] ?? raw["min_price"] ?? raw["minPrice"] ?? "");
  const maxPrice = parsePrice(raw["Max Price (Rs./Quintal)"] ?? raw["max_price"] ?? raw["maxPrice"] ?? "");
  const modalPrice = parsePrice(raw["Modal Price (Rs./Quintal)"] ?? raw["modal_price"] ?? raw["modalPrice"] ?? "");

  // Price sanity check
  const pricesValid =
    modalPrice !== null &&
    (minPrice === null || minPrice <= modalPrice) &&
    (maxPrice === null || maxPrice >= modalPrice);

  return {
    state,
    district,
    market,
    commodity,
    variety,
    arrivalDate,
    minPrice,
    maxPrice,
    modalPrice: pricesValid ? modalPrice : null,
    stateKey: normalizeName(state),
    districtKey: normalizeName(district),
    marketKey: normalizeName(market),
    commodityKey: normalizeName(commodity),
    isValid: Boolean(state && district && market && commodity && arrivalDate && pricesValid),
    invalidReason: (() => {
      if (!state || !district || !market || !commodity) return "Missing location/commodity";
      if (!arrivalDate) return "Invalid date";
      if (!pricesValid) return "Invalid price";
      return null;
    })(),
  };
}

export function normalizeRecords(rawRecords) {
  return rawRecords.map(normalizeRecord);
}

/** Return unique sorted list of states */
export function getStates(records) {
  return [...new Set(records.filter(r => r.isValid).map(r => r.state))].sort();
}

/** Return districts for a given state */
export function getDistricts(records, state) {
  return [
    ...new Set(
      records
        .filter(r => r.isValid && normalizeName(r.state) === normalizeName(state))
        .map(r => r.district)
    ),
  ].sort();
}

/** Return commodities for a given state+district */
export function getCommodities(records, state, district) {
  return [
    ...new Set(
      records
        .filter(
          r =>
            r.isValid &&
            normalizeName(r.state) === normalizeName(state) &&
            normalizeName(r.district) === normalizeName(district)
        )
        .map(r => r.commodity)
    ),
  ].sort();
}
