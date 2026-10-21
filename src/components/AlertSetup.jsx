import React, { useState } from "react";
import translations from "../utils/translations";
import { shouldTriggerAlert } from "../utils/priceCalculations";

export default function AlertSetup({ currentPrice, commodity, lang }) {
  const t = translations[lang];
  const [alertPrice, setAlertPrice] = useState("");
  const [saved, setSaved] = useState(false);
  const [alerts, setAlerts] = useState([]);

  const saveAlert = () => {
    const ap = parseFloat(alertPrice);
    if (!Number.isFinite(ap) || ap <= 0) return;
    const newAlert = { commodity, targetPrice: ap, savedAt: new Date().toLocaleString() };
    setAlerts(prev => [...prev, newAlert]);
    setSaved(true);
    setAlertPrice("");
    setTimeout(() => setSaved(false), 3000);
  };

  const triggered = alerts.filter(a =>
    shouldTriggerAlert(currentPrice, a.targetPrice) &&
    a.commodity === commodity
  );

  return (
    <section className="alert-card" aria-label="Price alert setup">
      <h3 className="section-title">{t.alertSetup}</h3>

      {triggered.length > 0 && (
        <div className="alert-triggered">
          {triggered.map((a, i) => (
            <div key={i} className="alert-msg">
              {t.alertTriggered} — {a.commodity} reached ₹{currentPrice?.toLocaleString("en-IN")} (target: ₹{a.targetPrice.toLocaleString("en-IN")})
            </div>
          ))}
        </div>
      )}

      <div className="alert-form">
        <label htmlFor="alert-price-input" className="select-label">
          {t.alertPrice} ({commodity})
        </label>
        <div className="alert-input-row">
          <input
            id="alert-price-input"
            type="number"
            min="0"
            className="num-input"
            placeholder="e.g. 2600"
            value={alertPrice}
            onChange={e => setAlertPrice(e.target.value)}
          />
          <button
            id="save-alert-btn"
            className="btn-save-alert"
            onClick={saveAlert}
            disabled={!alertPrice}
          >
            {t.saveAlert}
          </button>
        </div>
        {saved && <p className="alert-saved-msg">✅ Alert saved!</p>}
      </div>

      {alerts.length > 0 && (
        <div className="alert-list">
          <p className="alert-list-title">Active Alerts:</p>
          {alerts.map((a, i) => (
            <div key={i} className={`alert-item ${shouldTriggerAlert(currentPrice, a.targetPrice) && a.commodity === commodity ? "alert-active" : ""}`}>
              {a.commodity} → ₹{a.targetPrice.toLocaleString("en-IN")} {shouldTriggerAlert(currentPrice, a.targetPrice) && a.commodity === commodity ? "🔔" : "🔕"}
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
