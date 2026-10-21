# 🌾 MandiMitra — Agricultural Mandi Price Transparency

> **Know your market before you sell.**

MandiMitra gives Indian farmers real-time mandi price information from government Agmarknet data — presented clearly, honestly, and in their language.

---

## ✨ Features

| Feature | Description |
|---------|-------------|
| 🏷️ Latest Reported Price | Largest number on screen — date, source, freshness |
| 📈 Price Trend Chart | Honest gaps for missing dates — never interpolated |
| ⚖️ Mandi Comparison | Side-by-side price comparison across nearby markets |
| 🚚 Transport Cost Calculator | Estimated net return after your transport costs |
| 🔔 Price Alerts | Get notified when a crop hits your target price |
| 🗣️ Voice Readout | Press 🔊 to hear prices read aloud (Hindi & English) |
| 🇮🇳 Hindi / English | Full bilingual UI toggle |
| 📴 Offline Mode | Bundled CSV snapshot works without internet |
| 📱 Mobile-first | Responsive on all screen sizes |

---

## 🚀 Quick Start

```bash
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173)

---

## 🗂️ Project Structure

```
mandimitra/
├── public/
│   ├── data/
│   │   └── mandi-prices.csv     ← Bundled offline snapshot
│   └── favicon.svg
├── src/
│   ├── components/
│   │   ├── Header.jsx           ← App header + language toggle
│   │   ├── Selector.jsx         ← State/district/crop selection
│   │   ├── PriceCard.jsx        ← Headline price display + voice
│   │   ├── PriceChart.jsx       ← Historical trend chart (Recharts)
│   │   ├── MandiComparison.jsx  ← Multi-market comparison table
│   │   ├── AlertSetup.jsx       ← Price threshold alerts
│   │   └── DataStatus.jsx       ← Live/cache status bar
│   ├── pages/
│   │   └── Dashboard.jsx        ← Main page orchestrator
│   ├── services/
│   │   └── mandiDataService.js  ← API + CSV fallback loader
│   ├── utils/
│   │   ├── normalizeData.js     ← Data cleaning & normalization
│   │   ├── priceCalculations.js ← Price logic, transport ROI
│   │   ├── dateHelpers.js       ← Formatting & staleness checks
│   │   └── translations.js      ← EN/HI UI strings
│   ├── App.jsx
│   ├── main.jsx
│   └── index.css                ← Full design system
└── package.json
```

---

## 📡 Data Source

- **Primary**: [data.gov.in Agmarknet API](https://data.gov.in/resource/9ef84268-d588-465a-a308-a864a43d0070)
- **Fallback**: `public/data/mandi-prices.csv` (bundled snapshot)

### To use the live API:
1. Register at [data.gov.in](https://data.gov.in) and get your free API key
2. Open `src/pages/Dashboard.jsx`
3. Replace `const API_KEY = null` with `const API_KEY = "your-key-here"`

---

## ⚠️ Data Integrity Principles

- **Missing prices are shown as gaps** — never interpolated or fabricated
- **Stale reports are clearly labeled** (🟡) vs fresh (🟢)
- **All prices are in ₹ per quintal** (1 quintal = 100 kg)
- **Modal price** = the price at which the most transactions occurred
- Transport cost comparisons are **estimates** — actual returns vary

---

## 🏆 Hackathon Checklist

- [x] Real government data source
- [x] Bundled offline CSV snapshot
- [x] Data normalization & validation
- [x] Missing date gaps (never fabricated)
- [x] Staleness indicators
- [x] Price trend chart
- [x] Mandi comparison table
- [x] Transport cost calculator
- [x] Net return per market
- [x] Hindi + English UI
- [x] Voice readout (Web Speech API)
- [x] Price threshold alerts
- [x] Mobile-responsive design
- [x] Offline fallback mode

---

## 📦 Tech Stack

- **React 18 + Vite** — Frontend framework
- **Recharts** — Price trend charts
- **PapaParse** — CSV parsing
- **Web Speech API** — Voice readout (built-in browser API)
- **Vanilla CSS** — Custom design system

---

## 📄 License

Built for educational and hackathon purposes. Data © Government of India / Agmarknet.
