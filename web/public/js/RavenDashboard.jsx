function RavenDashboard() {
  const { t, locale } = useI18n();
  const [stats, setStats] = React.useState(null);
  const [pets, setPets] = React.useState([]);
  const [chatOpen, setChatOpen] = React.useState(false);
  const [chatPrefill, setChatPrefill] = React.useState(null);

  const loadStats = React.useCallback(() => {
    fetch("/api/raven/stats")
      .then((r) => r.json())
      .then((data) => !data.error && setStats(data))
      .catch(() => {});
  }, []);

  React.useEffect(() => {
    loadStats();
    const id = setInterval(loadStats, 20000);
    return () => clearInterval(id);
  }, [loadStats]);

  React.useEffect(() => {
    fetch("/api/raven/pets")
      .then((r) => r.json())
      .then((data) => !data.error && setPets(data.rows))
      .catch(() => {});
  }, []);

  function askAbout(pet) {
    setChatPrefill(
      locale === "pt"
        ? `Tenho interesse no ${pet.Name}, o ${pet.Species.toLowerCase()}. Me conte mais sobre ele.`
        : `I'm interested in ${pet.Name}, the ${pet.Species.toLowerCase()}. Tell me more about them.`
    );
    setChatOpen(true);
  }

  const totalAvailable = stats
    ? stats.rows.filter((r) => r.Status === "InShelter" || r.Status === "PendingAdoption").reduce((s, r) => s + r.Count, 0)
    : null;
  const totalPets = stats ? stats.rows.reduce((s, r) => s + r.Count, 0) : null;

  return (
    <div className="raven-dashboard">
      <div className="raven-dashboard-top">
        <div className="raven-stat-tiles">
          <div className="raven-stat-tile">
            <span className="raven-stat-value">{totalPets ?? "…"}</span>
            <span className="raven-stat-label">{t("raven.statPetsTreated")}</span>
          </div>
          <div className="raven-stat-tile">
            <span className="raven-stat-value">{totalAvailable ?? "…"}</span>
            <span className="raven-stat-label">{t("raven.statAvailable")}</span>
          </div>
          <div className="raven-stat-tile">
            <span className="raven-stat-value">{stats ? formatDuration(stats.durationMs) : "…"}</span>
            <span className="raven-stat-label">
              {t("raven.statQueryTime")} <span className="raven-stat-sub">{t("raven.statQueryTimeSub")}</span>
            </span>
          </div>
          <div className="raven-stat-tile">
            <span className="raven-stat-value">{stats ? stats.agentTokensUsed : "…"}</span>
            <span className="raven-stat-label">{t("raven.statTokens")}</span>
          </div>
        </div>
      </div>

      <div className="raven-charts-grid">
        <div className="raven-chart-card">
          <h4>{t("raven.chartSpecies")}</h4>
          {stats && <SpeciesPieChart rows={stats.rows} />}
        </div>
        <div className="raven-chart-card">
          <h4>{t("raven.chartOrigin")}</h4>
          {stats && <OriginDonutChart rows={stats.rows} />}
        </div>
        <div className="raven-chart-card">
          <h4>{t("raven.chartStatus")}</h4>
          {stats && <StatusBarChart rows={stats.rows} />}
        </div>
        <div className="raven-chart-card">
          <h4>{t("raven.chartPulse")}</h4>
          <CdcPulseChart />
        </div>
        <div className="raven-chart-card raven-chart-card-wide">
          <h4>{t("raven.chartTemperament")}</h4>
          <TemperamentRadarChart pets={pets} />
        </div>
        <div className="raven-chart-card raven-chart-card-wide">
          <h4>{t("raven.chartTimeline")}</h4>
          <RescueTimelineChart />
        </div>
      </div>

      <div className="raven-adoption-section">
        <div className="raven-adoption-header">
          <h3>{t("raven.meetNextPet")}</h3>
          <button type="button" className="raven-chat-open-button" onClick={() => setChatOpen(true)}>
            {t("raven.askConcierge")}
          </button>
        </div>
        <PetGrid onAskAbout={askAbout} />
      </div>

      <ChatDrawer
        open={chatOpen}
        onClose={() => setChatOpen(false)}
        prefill={chatPrefill}
        onConsumePrefill={() => setChatPrefill(null)}
      />
      {chatOpen && <div className="chat-drawer-backdrop" onClick={() => setChatOpen(false)} />}
    </div>
  );
}
