function RavenDashboard() {
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
    setChatPrefill(`I'm interested in ${pet.Name}, the ${pet.Species.toLowerCase()}. Tell me more about them.`);
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
            <span className="raven-stat-label">Pets treated by this clinic</span>
          </div>
          <div className="raven-stat-tile">
            <span className="raven-stat-value">{totalAvailable ?? "…"}</span>
            <span className="raven-stat-label">Available for adoption</span>
          </div>
          <div className="raven-stat-tile">
            <span className="raven-stat-value">{stats ? `${stats.durationMs}ms` : "…"}</span>
            <span className="raven-stat-label">
              Query time <span className="raven-stat-sub">(static index)</span>
            </span>
          </div>
          <div className="raven-stat-tile">
            <span className="raven-stat-value">{stats ? stats.agentTokensUsed : "…"}</span>
            <span className="raven-stat-label">AI tokens spent this session</span>
          </div>
        </div>
      </div>

      <div className="raven-charts-grid">
        <div className="raven-chart-card">
          <h4>Pets by species</h4>
          {stats && <SpeciesPieChart rows={stats.rows} />}
        </div>
        <div className="raven-chart-card">
          <h4>Owned vs. rescued</h4>
          {stats && <OriginDonutChart rows={stats.rows} />}
        </div>
        <div className="raven-chart-card">
          <h4>Pets by status</h4>
          {stats && <StatusBarChart rows={stats.rows} />}
        </div>
        <div className="raven-chart-card">
          <h4>Live CDC activity</h4>
          <CdcPulseChart />
        </div>
        <div className="raven-chart-card raven-chart-card-wide">
          <h4>Temperament of available pets (AI-generated)</h4>
          <TemperamentRadarChart pets={pets} />
        </div>
        <div className="raven-chart-card raven-chart-card-wide">
          <h4>Rescue-to-adoption timeline</h4>
          <RescueTimelineChart />
        </div>
      </div>

      <div className="raven-adoption-section">
        <div className="raven-adoption-header">
          <h3>Meet your next pet</h3>
          <button type="button" className="raven-chat-open-button" onClick={() => setChatOpen(true)}>
            💬 Ask the Concierge
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
