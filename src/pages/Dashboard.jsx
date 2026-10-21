import React, { useState, useEffect } from "react";
import Header from "../components/Header";
import Selector from "../components/Selector";
import PriceCard from "../components/PriceCard";
import PriceChart from "../components/PriceChart";
import MandiComparison from "../components/MandiComparison";
import AlertSetup from "../components/AlertSetup";
import DataStatus from "../components/DataStatus";
import { loadMandiData } from "../services/mandiDataService";
import {
  getLatestPrice,
  getHistoricalPrices,
  getMandiComparison,
  getPriceChange,
} from "../utils/priceCalculations";
import translations from "../utils/translations";

// Replace with your data.gov.in API key if you have one
const API_KEY = null; // e.g. "your-key-here"

export default function Dashboard() {
  const [lang, setLang] = useState("en");
  const t = translations[lang];

  const [records, setRecords] = useState([]);
  const [dataSource, setDataSource] = useState(null);
  const [loadedAt, setLoadedAt] = useState(null);
  const [loading, setLoading] = useState(true);
  const [dataError, setDataError] = useState(false);

  const [state, setState] = useState("");
  const [district, setDistrict] = useState("");
  const [commodity, setCommodity] = useState("");
  const [searched, setSearched] = useState(false);
  const [searching, setSearching] = useState(false);

  const [latestRecord, setLatestRecord] = useState(null);
  const [priceChange, setPriceChange] = useState(null);
  const [historicalData, setHistoricalData] = useState([]);
  const [comparisonData, setComparisonData] = useState([]);

  const loadData = async () => {
    setLoading(true);
    setDataError(false);
    try {
      const result = await loadMandiData(API_KEY);
      setRecords(result.records);
      setDataSource(result.source);
      setLoadedAt(result.loadedAt);
    } catch (e) {
      console.error("Data load failed:", e);
      setDataError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  const handleStateChange = v => { setState(v); setDistrict(""); setCommodity(""); setSearched(false); };
  const handleDistrictChange = v => { setDistrict(v); setCommodity(""); setSearched(false); };
  const handleCommodityChange = v => { setCommodity(v); setSearched(false); };

  const handleSearch = () => {
    if (!state || !district || !commodity) return;
    setSearching(true);
    setTimeout(() => {
      const latest = getLatestPrice(records, commodity, state, district);
      const hist = getHistoricalPrices(records, commodity, state, district);
      const comparison = getMandiComparison(records, commodity, state, district);
      const change = latest ? getPriceChange(records, commodity, state, district, latest.market) : null;

      setLatestRecord(latest);
      setPriceChange(change);
      setHistoricalData(hist);
      setComparisonData(comparison);
      setSearched(true);
      setSearching(false);

      // Scroll to results
      setTimeout(() => {
        document.getElementById("results-section")?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    }, 400);
  };

  const speakHint = () => {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const text = lang === "hi"
      ? "राज्य, जिला और फसल चुनें। फिर मेरा भाव खोजें बटन दबाएं।"
      : "Select your state, district, and crop. Then press Find My Price.";
    const msg = new SpeechSynthesisUtterance(text);
    msg.lang = lang === "hi" ? "hi-IN" : "en-IN";
    msg.rate = 0.88;
    window.speechSynthesis.speak(msg);
  };

  return (
    <div className="dashboard">
      <Header lang={lang} setLang={setLang} dataSource={dataSource} loadedAt={loadedAt} />

      {dataSource && <DataStatus source={dataSource} lang={lang} onRefresh={loadData} />}

      <main className="main-content">
        {loading ? (
          <div className="loading-screen">
            <div className="spinner" />
            <p>{t.loadingData}</p>
          </div>
        ) : dataError ? (
          <div className="error-banner">⚠️ {t.errorLoading}</div>
        ) : (
          <>
            {/* Hero section */}
            <section className="hero-section">
              <div className="hero-text">
                <h2 className="hero-heading">
                  {lang === "hi" ? "आज आपकी फसल का भाव क्या है?" : "What Is Your Crop Worth Today?"}
                </h2>
                <p className="hero-sub">
                  {lang === "hi"
                    ? "सरकारी अग्मार्कनेट डेटा से सीधे — बिना अनुमान, बिना झूठे नंबर।"
                    : "Directly from government Agmarknet data — no guesswork, no fabricated numbers."}
                </p>
                <button className="btn-voice-hint" onClick={speakHint}>
                  🔊 {lang === "hi" ? "निर्देश सुनें" : "Hear instructions"}
                </button>
              </div>
              <div className="hero-stats">
                <div className="stat-pill">
                  <span className="stat-num">{[...new Set(records.map(r => r.state))].filter(Boolean).length}</span>
                  <span className="stat-label">{lang === "hi" ? "राज्य" : "States"}</span>
                </div>
                <div className="stat-pill">
                  <span className="stat-num">{[...new Set(records.map(r => r.market))].filter(Boolean).length}</span>
                  <span className="stat-label">{lang === "hi" ? "मंडियाँ" : "Mandis"}</span>
                </div>
                <div className="stat-pill">
                  <span className="stat-num">{[...new Set(records.map(r => r.commodity))].filter(Boolean).length}</span>
                  <span className="stat-label">{lang === "hi" ? "फसलें" : "Crops"}</span>
                </div>
              </div>
            </section>

            <Selector
              records={records}
              lang={lang}
              state={state}
              district={district}
              commodity={commodity}
              onStateChange={handleStateChange}
              onDistrictChange={handleDistrictChange}
              onCommodityChange={handleCommodityChange}
              onSearch={handleSearch}
              loading={searching}
            />

            {!searched && !searching && (
              <div className="select-hint">
                <span className="hint-icon">👆</span>
                <p>{t.selectHint}</p>
              </div>
            )}

            {searched && (
              <div id="results-section" className="results-section">
                <PriceCard latestRecord={latestRecord} priceChange={priceChange} lang={lang} />
                {historicalData.length > 0 && (
                  <PriceChart historicalData={historicalData} lang={lang} />
                )}
                {comparisonData.length > 0 && (
                  <MandiComparison comparisonData={comparisonData} lang={lang} />
                )}
                {latestRecord && (
                  <AlertSetup
                    currentPrice={latestRecord.modalPrice}
                    commodity={commodity}
                    lang={lang}
                  />
                )}
              </div>
            )}
          </>
        )}
      </main>

      <footer className="footer">
        <p>
          {t.dataSource} ·{" "}
          <a href="https://agmarknet.gov.in" target="_blank" rel="noopener noreferrer">
            agmarknet.gov.in
          </a>{" "}
          ·{" "}
          <a href="https://data.gov.in" target="_blank" rel="noopener noreferrer">
            data.gov.in
          </a>
        </p>
        <p className="footer-note">
          {lang === "hi"
            ? "कीमतें क्विंटल प्रति रुपए में। मोडल भाव वह है जिस पर सबसे अधिक लेन-देन हुआ। यह व्यापार सलाह नहीं है।"
            : "Prices in ₹ per quintal. Modal price = most frequent transaction price. Not trading advice."}
        </p>
      </footer>
    </div>
  );
}
