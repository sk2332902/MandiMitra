import React from "react";
import translations from "../utils/translations";
import { getStates, getDistricts, getCommodities } from "../utils/normalizeData";

export default function Selector({ records, lang, state, district, commodity, onStateChange, onDistrictChange, onCommodityChange, onSearch, loading }) {
  const t = translations[lang];
  const states = getStates(records);
  const districts = state ? getDistricts(records, state) : [];
  const commodities = state && district ? getCommodities(records, state, district) : [];

  return (
    <section className="selector-card" aria-label="Crop and location selector">
      <div className="selector-grid">
        <div className="select-group">
          <label htmlFor="state-select" className="select-label">{t.selectState}</label>
          <select
            id="state-select"
            className="select-input"
            value={state}
            onChange={e => onStateChange(e.target.value)}
          >
            <option value="">-- {t.selectState} --</option>
            {states.map(s => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>

        <div className="select-group">
          <label htmlFor="district-select" className="select-label">{t.selectDistrict}</label>
          <select
            id="district-select"
            className="select-input"
            value={district}
            disabled={!state}
            onChange={e => onDistrictChange(e.target.value)}
          >
            <option value="">-- {t.selectDistrict} --</option>
            {districts.map(d => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>
        </div>

        <div className="select-group">
          <label htmlFor="commodity-select" className="select-label">{t.selectCrop}</label>
          <select
            id="commodity-select"
            className="select-input"
            value={commodity}
            disabled={!district}
            onChange={e => onCommodityChange(e.target.value)}
          >
            <option value="">-- {t.selectCrop} --</option>
            {commodities.map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
      </div>

      <button
        id="find-price-btn"
        className={`btn-find-price ${loading ? "loading" : ""}`}
        onClick={onSearch}
        disabled={!state || !district || !commodity || loading}
      >
        {loading ? "⏳ Loading…" : `🔍 ${t.findPrice}`}
      </button>
    </section>
  );
}
