import React from "react";
import translations from "../utils/translations";

export default function Header({ lang, setLang, dataSource, loadedAt }) {
  const t = translations[lang];

  const handleVoiceGreeting = () => {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const msg = new SpeechSynthesisUtterance(
      lang === "hi"
        ? "मंडीमित्र में आपका स्वागत है। कृपया राज्य, जिला और फसल चुनें।"
        : "Welcome to MandiMitra. Please select your state, district and crop to see prices."
    );
    msg.lang = lang === "hi" ? "hi-IN" : "en-IN";
    msg.rate = 0.9;
    window.speechSynthesis.speak(msg);
  };

  return (
    <header className="header">
      <div className="header-inner">
        <div className="logo-area">
          <span className="logo-icon">🌾</span>
          <div>
            <h1 className="app-name">{t.appName}</h1>
            <p className="tagline">{t.tagline}</p>
          </div>
        </div>

        <div className="header-controls">
          <button
            className="btn-voice-header"
            onClick={handleVoiceGreeting}
            title={t.voiceRead}
            aria-label="Voice greeting"
          >
            🔊
          </button>

          <div className="lang-toggle">
            <button
              className={`lang-btn ${lang === "en" ? "active" : ""}`}
              onClick={() => setLang("en")}
              id="lang-en"
            >
              EN
            </button>
            <button
              className={`lang-btn ${lang === "hi" ? "active" : ""}`}
              onClick={() => setLang("hi")}
              id="lang-hi"
            >
              हि
            </button>
          </div>
        </div>
      </div>

      {dataSource && (
        <div className="data-banner">
          <span className={`data-badge ${dataSource === "api" ? "live" : "cache"}`}>
            {dataSource === "api" ? "🟢 Live" : "🟡 Cached"}
          </span>
          <span className="data-source-text">{t.dataSource}</span>
          {loadedAt && (
            <span className="load-time">
              · Loaded {new Date(loadedAt).toLocaleTimeString(lang === "hi" ? "hi-IN" : "en-IN")}
            </span>
          )}
        </div>
      )}
    </header>
  );
}
