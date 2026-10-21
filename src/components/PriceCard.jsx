import React from "react";
import translations from "../utils/translations";
import { formatDate, stalenessLabel, isFresh } from "../utils/dateHelpers";

export default function PriceCard({ latestRecord, priceChange, lang }) {
  const t = translations[lang];

  const speakPrice = () => {
    if (!window.speechSynthesis || !latestRecord) return;
    window.speechSynthesis.cancel();
    const price = latestRecord.modalPrice;
    const market = latestRecord.market;
    const crop = latestRecord.commodity;
    const date = formatDate(latestRecord.arrivalDate, lang);

    let text;
    if (lang === "hi") {
      const dir = priceChange
        ? priceChange.direction === "up"
          ? `भाव ${Math.abs(priceChange.change)} रुपए बढ़ा है।`
          : priceChange.direction === "down"
          ? `भाव ${Math.abs(priceChange.change)} रुपए घटा है।`
          : "भाव में कोई बदलाव नहीं है।"
        : "";
      text = `${crop} का मोडल भाव ${market} मंडी में ${date} को ${price} रुपए प्रति क्विंटल था। ${dir}`;
    } else {
      const dir = priceChange
        ? priceChange.direction === "up"
          ? `Price increased by ₹${Math.abs(priceChange.change)}.`
          : priceChange.direction === "down"
          ? `Price decreased by ₹${Math.abs(priceChange.change)}.`
          : "No price change."
        : "";
      text = `${crop} modal price at ${market} was ₹${price} per quintal on ${date}. ${dir}`;
    }

    const msg = new SpeechSynthesisUtterance(text);
    msg.lang = lang === "hi" ? "hi-IN" : "en-IN";
    msg.rate = 0.88;
    window.speechSynthesis.speak(msg);
  };

  if (!latestRecord) {
    return (
      <section className="price-card no-data-card">
        <div className="no-data-icon">📭</div>
        <p className="no-data-msg">{t.noData}</p>
      </section>
    );
  }

  const fresh = isFresh(latestRecord.arrivalDate);
  const directionClass =
    priceChange?.direction === "up"
      ? "price-up"
      : priceChange?.direction === "down"
      ? "price-down"
      : "price-flat";

  const directionArrow =
    priceChange?.direction === "up" ? "↑" : priceChange?.direction === "down" ? "↓" : "→";
  const directionLabel =
    priceChange?.direction === "up"
      ? t.priceUp
      : priceChange?.direction === "down"
      ? t.priceDown
      : t.priceFlat;

  return (
    <section className="price-card" aria-label="Latest price card">
      <div className="price-card-header">
        <div>
          <span className="crop-badge">{latestRecord.commodity}</span>
          {latestRecord.variety && (
            <span className="variety-badge">{latestRecord.variety}</span>
          )}
          <h2 className="market-name">{latestRecord.market}</h2>
        </div>
        <button
          id="voice-read-btn"
          className="btn-voice"
          onClick={speakPrice}
          title={t.voiceRead}
          aria-label="Read price aloud"
        >
          {t.voiceRead}
        </button>
      </div>

      <div className="price-main-section">
        <div className="price-number-wrap">
          <span className="price-rupee">₹</span>
          <span className="price-number">
            {latestRecord.modalPrice !== null
              ? latestRecord.modalPrice.toLocaleString("en-IN")
              : t.noRate}
          </span>
          {latestRecord.modalPrice !== null && (
            <span className="price-unit">/{t.perQuintal}</span>
          )}
        </div>

        {priceChange && latestRecord.modalPrice !== null && (
          <div className={`price-change ${directionClass}`}>
            <span className="change-arrow">{directionArrow}</span>
            <span className="change-text">
              ₹{Math.abs(priceChange.change).toLocaleString("en-IN")}{" "}
              {directionLabel} {t.vs}{" "}
              {formatDate(priceChange.prevDate, lang)}
            </span>
            <span className="change-percent">({priceChange.percent}%)</span>
          </div>
        )}

        <div className={`freshness-badge ${fresh ? "fresh" : "stale"}`}>
          {fresh ? "🟢" : "🟡"} {stalenessLabel(latestRecord.arrivalDate, lang)}
        </div>

        <div className="reported-on">
          {t.reportedOn}: <strong>{formatDate(latestRecord.arrivalDate, lang)}</strong>
        </div>
      </div>

      {latestRecord.minPrice !== null && latestRecord.maxPrice !== null && (
        <div className="price-range-row">
          <div className="price-range-item">
            <span className="range-label">Min</span>
            <span className="range-val">₹{latestRecord.minPrice.toLocaleString("en-IN")}</span>
          </div>
          <div className="price-range-item highlight-modal">
            <span className="range-label">Modal</span>
            <span className="range-val">₹{latestRecord.modalPrice?.toLocaleString("en-IN") ?? "—"}</span>
          </div>
          <div className="price-range-item">
            <span className="range-label">Max</span>
            <span className="range-val">₹{latestRecord.maxPrice.toLocaleString("en-IN")}</span>
          </div>
        </div>
      )}
    </section>
  );
}
