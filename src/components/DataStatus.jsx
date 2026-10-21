import React from "react";
import translations from "../utils/translations";

export default function DataStatus({ source, lang, onRefresh }) {
  const t = translations[lang];
  return (
    <div className={`data-status-bar ${source === "api" ? "status-live" : "status-cache"}`}>
      <span>
        {source === "api" ? `🟢 ${t.freshData}` : `🟡 ${t.offlineNote}`}
      </span>
      <button className="btn-refresh" onClick={onRefresh} id="refresh-btn">
        🔄 Refresh
      </button>
    </div>
  );
}
