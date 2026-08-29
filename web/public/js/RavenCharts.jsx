const CHART_PALETTE = ["#388ee9", "#7b51ff", "#37c4ac", "#e5484d", "#f5a623", "#ff7ac6", "#98a7b7"];

function useChartCanvas(buildConfig, deps) {
  const canvasRef = React.useRef(null);
  const chartRef = React.useRef(null);

  React.useEffect(() => {
    if (!canvasRef.current) return undefined;
    const config = buildConfig();
    if (!config) return undefined;

    // Without an explicit size + a relatively-positioned parent, Chart.js's
    // resize observer can't tell the canvas's real CSS box from its default
    // 300x150 intrinsic size, and stretches the drawing to fill it —
    // exactly the "ovals instead of circles" distortion this fixes.
    config.options = { responsive: true, maintainAspectRatio: false, ...config.options };

    if (chartRef.current) chartRef.current.destroy();
    chartRef.current = new Chart(canvasRef.current, config);

    return () => {
      if (chartRef.current) {
        chartRef.current.destroy();
        chartRef.current = null;
      }
    };
    // eslint-disable-next-line
  }, deps);

  return canvasRef;
}

const CHART_TEXT_COLOR = "#d6dae3";
const CHART_GRID_COLOR = "rgba(255,255,255,0.08)";

function groupSum(rows, key) {
  const totals = {};
  for (const row of rows) {
    const k = row[key] || "Unknown";
    totals[k] = (totals[k] || 0) + row.Count;
  }
  return totals;
}

function SpeciesPieChart({ rows }) {
  const totals = groupSum(rows, "Species");
  const labels = Object.keys(totals);
  const canvasRef = useChartCanvas(
    () =>
      labels.length && {
        type: "pie",
        data: {
          labels,
          datasets: [{ data: labels.map((l) => totals[l]), backgroundColor: CHART_PALETTE }],
        },
        options: {
          plugins: { legend: { position: "bottom", labels: { color: CHART_TEXT_COLOR, boxWidth: 12 } } },
        },
      },
    [JSON.stringify(rows)]
  );
  return (
    <div className="raven-chart-canvas-box">
      <canvas ref={canvasRef} />
    </div>
  );
}

function OriginDonutChart({ rows }) {
  const totals = groupSum(rows, "Origin");
  const labels = Object.keys(totals);
  const canvasRef = useChartCanvas(
    () =>
      labels.length && {
        type: "doughnut",
        data: {
          labels,
          datasets: [{ data: labels.map((l) => totals[l]), backgroundColor: [CHART_PALETTE[1], CHART_PALETTE[2]] }],
        },
        options: {
          plugins: { legend: { position: "bottom", labels: { color: CHART_TEXT_COLOR, boxWidth: 12 } } },
        },
      },
    [JSON.stringify(rows)]
  );
  return (
    <div className="raven-chart-canvas-box">
      <canvas ref={canvasRef} />
    </div>
  );
}

function StatusBarChart({ rows }) {
  const totals = groupSum(rows, "Status");
  const labels = Object.keys(totals);
  const canvasRef = useChartCanvas(
    () =>
      labels.length && {
        type: "bar",
        data: {
          labels,
          datasets: [{ label: "Pets", data: labels.map((l) => totals[l]), backgroundColor: CHART_PALETTE[0] }],
        },
        options: {
          plugins: { legend: { display: false } },
          scales: {
            x: { ticks: { color: CHART_TEXT_COLOR }, grid: { color: CHART_GRID_COLOR } },
            y: { ticks: { color: CHART_TEXT_COLOR, precision: 0 }, grid: { color: CHART_GRID_COLOR } },
          },
        },
      },
    [JSON.stringify(rows)]
  );
  return (
    <div className="raven-chart-canvas-box">
      <canvas ref={canvasRef} />
    </div>
  );
}

const TEMPERAMENT_OPTIONS = [
  "Calm",
  "Energetic",
  "GoodWithKids",
  "GoodWithOtherDogs",
  "GoodWithCats",
  "ApartmentFriendly",
  "Affectionate",
  "Playful",
];

function TemperamentRadarChart({ pets }) {
  const { t } = useI18n();
  const counts = TEMPERAMENT_OPTIONS.map(
    (tag) => pets.filter((p) => (p.TemperamentTags || []).includes(tag)).length
  );
  const hasData = counts.some((c) => c > 0);
  const canvasRef = useChartCanvas(
    () =>
      hasData && {
        type: "radar",
        data: {
          labels: TEMPERAMENT_OPTIONS,
          datasets: [
            {
              label: "Pets with this trait",
              data: counts,
              backgroundColor: "rgba(123, 81, 255, 0.25)",
              borderColor: CHART_PALETTE[1],
              pointBackgroundColor: CHART_PALETTE[1],
            },
          ],
        },
        options: {
          plugins: { legend: { display: false } },
          scales: {
            r: {
              angleLines: { color: CHART_GRID_COLOR },
              grid: { color: CHART_GRID_COLOR },
              pointLabels: { color: CHART_TEXT_COLOR, font: { size: 10 } },
              ticks: { display: false, precision: 0 },
            },
          },
        },
      },
    [JSON.stringify(counts)]
  );
  return hasData ? (
    <div className="raven-chart-canvas-box">
      <canvas ref={canvasRef} />
    </div>
  ) : (
    <p className="raven-chart-empty">{t("raven.chartTemperamentEmpty")}</p>
  );
}

// Four scattered date fields (rescue intake, medical visits, vaccinations,
// approved adoption decisions) aligned onto one monthly timeline — an
// experiment in whether volume across the pipeline (rescues in -> care
// given -> adoptions out) has a visible shape, not a load-bearing dashboard
// number like the other charts.
function RescueTimelineChart() {
  const { t, locale } = useI18n();
  const [timeline, setTimeline] = React.useState(null);

  React.useEffect(() => {
    fetch("/api/raven/timeline")
      .then((r) => r.json())
      .then((data) => !data.error && setTimeline(data))
      .catch(() => {});
  }, []);

  const canvasRef = useChartCanvas(
    () =>
      timeline &&
      timeline.months.length > 0 && {
        type: "line",
        data: {
          labels: timeline.months,
          datasets: [
            { label: t("raven.timelineRescues"), data: timeline.rescues, borderColor: CHART_PALETTE[3], tension: 0.3, pointRadius: 2 },
            { label: t("raven.timelineVisits"), data: timeline.visits, borderColor: CHART_PALETTE[0], tension: 0.3, pointRadius: 2 },
            { label: t("raven.timelineVaccinations"), data: timeline.vaccinations, borderColor: CHART_PALETTE[2], tension: 0.3, pointRadius: 2 },
            { label: t("raven.timelineAdoptions"), data: timeline.adoptions, borderColor: CHART_PALETTE[1], tension: 0.3, pointRadius: 2 },
          ],
        },
        options: {
          plugins: { legend: { position: "bottom", labels: { color: CHART_TEXT_COLOR, boxWidth: 12 } } },
          scales: {
            x: { ticks: { color: CHART_TEXT_COLOR }, grid: { color: CHART_GRID_COLOR } },
            y: { beginAtZero: true, ticks: { color: CHART_TEXT_COLOR, precision: 0 }, grid: { color: CHART_GRID_COLOR } },
          },
        },
      },
    [timeline && JSON.stringify(timeline), locale]
  );

  if (!timeline || timeline.months.length === 0) {
    return <p className="raven-chart-empty">{t("raven.chartTimelineEmpty")}</p>;
  }

  return (
    <div className="raven-chart-canvas-box">
      <canvas ref={canvasRef} />
    </div>
  );
}

const PULSE_WINDOW = 30;

function CdcPulseChart() {
  const { t } = useI18n();
  const [samples, setSamples] = React.useState([]);
  const lastEtag = React.useRef(null);

  React.useEffect(() => {
    let cancelled = false;

    async function poll() {
      try {
        const res = await fetch("/api/raven/pulse");
        const data = await res.json();
        if (cancelled) return;
        const delta = lastEtag.current === null ? 0 : Math.max(0, data.lastDocEtag - lastEtag.current);
        lastEtag.current = data.lastDocEtag;
        setSamples((prev) => [...prev.slice(-(PULSE_WINDOW - 1)), delta]);
      } catch {
        // ignore transient failures, keep the chart's last known shape
      }
    }

    poll();
    const id = setInterval(poll, 2000);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, []);

  const labels = samples.map((_, i) => i);
  const canvasRef = useChartCanvas(
    () => ({
      type: "line",
      data: {
        labels,
        datasets: [
          {
            label: t("raven.pulseLegend"),
            data: samples,
            borderColor: CHART_PALETTE[2],
            backgroundColor: "rgba(55, 196, 172, 0.2)",
            fill: true,
            tension: 0.3,
            pointRadius: 0,
          },
        ],
      },
      options: {
        animation: false,
        plugins: { legend: { display: false } },
        scales: {
          x: { display: false },
          y: { beginAtZero: true, ticks: { color: CHART_TEXT_COLOR, precision: 0 }, grid: { color: CHART_GRID_COLOR } },
        },
      },
    }),
    [JSON.stringify(samples)]
  );

  return (
    <div className="raven-chart-canvas-box">
      <canvas ref={canvasRef} />
    </div>
  );
}
