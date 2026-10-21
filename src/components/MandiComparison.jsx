import React, { useState } from "react";
import translations from "../utils/translations";
import { formatDate, isFresh } from "../utils/dateHelpers";
import { estimateNetReturn } from "../utils/priceCalculations";

export default function MandiComparison({ comparisonData, lang }) {
  const t = translations[lang];
  const [baseIdx, setBaseIdx] = useState(0);
  const [quantity, setQuantity] = useState(50);
  const [transportCosts, setTransportCosts] = useState({});

  if (!comparisonData || comparisonData.length === 0) return null;

  const baseRecord = comparisonData[baseIdx];

  const speakComparison = () => {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const lines = comparisonData.map((r, i) => {
      const extra = transportCosts[i] ? parseInt(transportCosts[i]) : 0;
      const netCalc = estimateNetReturn({
        basePrice: baseRecord.modalPrice,
        targetPrice: r.modalPrice,
        quantityQ: quantity,
        extraTransportCost: i === baseIdx ? 0 : extra,
      });
      const netStr = netCalc
        ? (lang === "hi"
          ? `शुद्ध लाभ ${netCalc.netAdvantage >= 0 ? "+" : ""}${Math.round(netCalc.netAdvantage).toLocaleString("en-IN")} रुपए`
          : `Net advantage ₹${netCalc.netAdvantage >= 0 ? "+" : ""}${Math.round(netCalc.netAdvantage).toLocaleString("en-IN")}`)
        : "";
      return `${r.market}: ₹${r.modalPrice} per quintal. ${netStr}`;
    });
    const text = (lang === "hi" ? "मंडी तुलना: " : "Mandi comparison: ") + lines.join(". ");
    const msg = new SpeechSynthesisUtterance(text);
    msg.lang = lang === "hi" ? "hi-IN" : "en-IN";
    msg.rate = 0.88;
    window.speechSynthesis.speak(msg);
  };

  return (
    <section className="comparison-card" aria-label="Mandi comparison">
      <div className="section-header-row">
        <h3 className="section-title">{t.compareMandis}</h3>
        <button className="btn-voice-sm" onClick={speakComparison} title={t.voiceRead}>
          {t.voiceRead}
        </button>
      </div>

      <div className="base-selector">
        <label className="select-label">Base mandi (your nearest):</label>
        <select
          className="select-input-sm"
          value={baseIdx}
          onChange={e => setBaseIdx(parseInt(e.target.value))}
          id="base-mandi-select"
        >
          {comparisonData.map((r, i) => (
            <option key={i} value={i}>{r.market}</option>
          ))}
        </select>
      </div>

      <div className="quantity-row">
        <label className="select-label" htmlFor="quantity-input">{t.quantity}</label>
        <input
          id="quantity-input"
          type="number"
          min="1"
          max="1000"
          className="num-input"
          value={quantity}
          onChange={e => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
        />
      </div>

      <div className="mandi-table-wrap">
        <table className="mandi-table" aria-label="Mandi price comparison table">
          <thead>
            <tr>
              <th>Mandi</th>
              <th>Modal ₹/Q</th>
              <th>Date</th>
              <th>{t.extraTransport}</th>
              <th>{t.netAdvantage}</th>
            </tr>
          </thead>
          <tbody>
            {comparisonData.map((record, i) => {
              const isBase = i === baseIdx;
              const extra = isBase ? 0 : (parseInt(transportCosts[i]) || 0);
              const netCalc = estimateNetReturn({
                basePrice: baseRecord.modalPrice,
                targetPrice: record.modalPrice,
                quantityQ: quantity,
                extraTransportCost: isBase ? 0 : extra,
              });
              const fresh = isFresh(record.arrivalDate);

              let rowClass = "mandi-row";
              if (isBase) rowClass += " base-row";
              else if (netCalc?.worthIt) rowClass += " best-row";

              return (
                <tr key={i} className={rowClass}>
                  <td className="mandi-name-cell">
                    <span className="mandi-dot" style={{ background: isBase ? "#f59e0b" : netCalc?.worthIt ? "#22c55e" : "#64748b" }} />
                    <span>{record.market}</span>
                    {isBase && <span className="base-tag">Base</span>}
                    {!isBase && netCalc?.worthIt && <span className="best-tag">Best</span>}
                  </td>
                  <td className="price-cell">
                    {record.modalPrice !== null ? (
                      <strong>₹{record.modalPrice.toLocaleString("en-IN")}</strong>
                    ) : (
                      <span className="no-rate">{t.noRate}</span>
                    )}
                  </td>
                  <td className="date-cell">
                    <span className={fresh ? "fresh-dot" : "stale-dot"}>
                      {fresh ? "🟢" : "🟡"}
                    </span>
                    {record.arrivalDate}
                  </td>
                  <td>
                    {isBase ? (
                      <span className="base-tag">{t.baseMandiNote}</span>
                    ) : (
                      <input
                        type="number"
                        min="0"
                        className="transport-input"
                        placeholder="₹ 0"
                        value={transportCosts[i] ?? ""}
                        onChange={e =>
                          setTransportCosts(prev => ({ ...prev, [i]: e.target.value }))
                        }
                        id={`transport-input-${i}`}
                        aria-label={`Transport cost for ${record.market}`}
                      />
                    )}
                  </td>
                  <td className="net-cell">
                    {isBase ? (
                      <span className="flat-label">—</span>
                    ) : netCalc ? (
                      <span className={netCalc.worthIt ? "net-positive" : "net-negative"}>
                        {netCalc.netAdvantage >= 0 ? "+" : ""}
                        ₹{Math.round(netCalc.netAdvantage).toLocaleString("en-IN")}
                        <span className="net-icon">{netCalc.worthIt ? " ✅" : " ❌"}</span>
                      </span>
                    ) : (
                      <span className="no-rate">—</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <p className="disclaimer">
        ⚠️ Net advantage is an estimate based on reported modal prices and your transport cost entry. Actual returns may vary.
      </p>
    </section>
  );
}
