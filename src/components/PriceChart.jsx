import React from "react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, ReferenceLine, Legend
} from "recharts";
import translations from "../utils/translations";
import { formatDate } from "../utils/dateHelpers";

function CustomDot(props) {
  const { cx, cy, payload } = props;
  if (payload.modalPrice === null) return null;
  return <circle cx={cx} cy={cy} r={5} fill="#22c55e" stroke="#16a34a" strokeWidth={2} />;
}

function CustomTooltip({ active, payload, label, lang }) {
  const t = translations[lang];
  if (!active || !payload || !payload.length) return null;
  const data = payload[0]?.payload;
  return (
    <div className="chart-tooltip">
      <p className="tooltip-date">{formatDate(label, lang)}</p>
      {data?.modalPrice !== null ? (
        <p className="tooltip-price">
          ₹{data.modalPrice.toLocaleString("en-IN")} / {t.perQuintal}
        </p>
      ) : (
        <p className="tooltip-missing">{t.noRate}</p>
      )}
      {data?.minPrice !== null && data?.maxPrice !== null && (
        <p className="tooltip-range">
          Min ₹{data.minPrice?.toLocaleString("en-IN")} – Max ₹{data.maxPrice?.toLocaleString("en-IN")}
        </p>
      )}
    </div>
  );
}

export default function PriceChart({ historicalData, lang }) {
  const t = translations[lang];

  if (!historicalData || historicalData.length === 0) return null;

  // Fill in missing dates as null prices for honest gaps
  const sorted = [...historicalData].sort(
    (a, b) => new Date(a.arrivalDate) - new Date(b.arrivalDate)
  );

  // Build a full date range filling gaps
  const allDates = [];
  if (sorted.length > 0) {
    const start = new Date(sorted[0].arrivalDate + "T00:00:00");
    const end = new Date(sorted[sorted.length - 1].arrivalDate + "T00:00:00");
    const byDate = {};
    sorted.forEach(r => { byDate[r.arrivalDate] = r; });
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      const key = d.toISOString().split("T")[0];
      allDates.push(byDate[key] ?? { arrivalDate: key, modalPrice: null, minPrice: null, maxPrice: null, _missing: true });
    }
  }

  const chartData = allDates.map(r => ({
    date: r.arrivalDate,
    modalPrice: r.modalPrice,
    minPrice: r.minPrice,
    maxPrice: r.maxPrice,
    _missing: r._missing,
  }));

  const prices = chartData.filter(d => d.modalPrice !== null).map(d => d.modalPrice);
  const minY = prices.length ? Math.floor(Math.min(...prices) * 0.97) : 0;
  const maxY = prices.length ? Math.ceil(Math.max(...prices) * 1.03) : 5000;

  return (
    <section className="chart-card" aria-label="Price trend chart">
      <h3 className="section-title">{t.priceHistory}</h3>
      <p className="chart-note">{t.missingDataNote}</p>
      <div className="chart-wrapper">
        <ResponsiveContainer width="100%" height={280}>
          <LineChart data={chartData} margin={{ top: 10, right: 20, left: 10, bottom: 10 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" />
            <XAxis
              dataKey="date"
              tick={{ fill: "#a7f3d0", fontSize: 11 }}
              tickFormatter={v => {
                const d = new Date(v + "T00:00:00");
                return `${d.getDate()}/${d.getMonth() + 1}`;
              }}
              stroke="#4ade80"
            />
            <YAxis
              domain={[minY, maxY]}
              tick={{ fill: "#a7f3d0", fontSize: 11 }}
              tickFormatter={v => `₹${v.toLocaleString("en-IN")}`}
              stroke="#4ade80"
              width={70}
            />
            <Tooltip content={<CustomTooltip lang={lang} />} />
            <Line
              type="monotone"
              dataKey="modalPrice"
              stroke="#22c55e"
              strokeWidth={2.5}
              dot={<CustomDot />}
              connectNulls={false}
              name="Modal Price"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}
