function PetCard({ pet, onAskAbout }) {
  const { t } = useI18n();
  return (
    <div className="pet-card">
      <div className="pet-card-header">
        <h3>{pet.Name}</h3>
        <span className="pet-card-species">{pet.Species}</span>
      </div>
      <p className="pet-card-meta">
        {pet.Breed || t("raven.mixedBreed")} · {pet.Sex}
      </p>
      <p className="pet-card-health">
        <span className={pet.isVaccinated ? "pet-card-health-ok" : "pet-card-health-warn"}>
          {pet.isVaccinated
            ? pet.lastVaccineName
              ? t("raven.vaccinated", { vaccine: pet.lastVaccineName })
              : t("raven.vaccinatedNoName")
            : t("raven.notVaccinated")}
        </span>
        {typeof pet.medicalVisitCount === "number" && pet.medicalVisitCount > 0 && (
          <span className="pet-card-health-visits">
            {" · "}
            {t("raven.vetVisits", { count: pet.medicalVisitCount, plural: pet.medicalVisitCount === 1 ? "" : "s" })}
          </span>
        )}
      </p>
      {pet.AdoptionBio ? (
        <p className="pet-card-bio">{pet.AdoptionBio}</p>
      ) : (
        <p className="pet-card-bio pet-card-bio-pending">{t("raven.bioPending")}</p>
      )}
      {pet.TemperamentTags && pet.TemperamentTags.length > 0 && (
        <div className="pet-card-tags">
          {pet.TemperamentTags.map((tag) => (
            <span key={tag} className="pet-card-tag">
              {tag}
            </span>
          ))}
        </div>
      )}
      <button type="button" className="pet-card-ask" onClick={() => onAskAbout(pet)}>
        {t("raven.askAbout", { name: pet.Name })}
      </button>
    </div>
  );
}

function PetGrid({ onAskAbout }) {
  const { t } = useI18n();
  const [query, setQuery] = React.useState("");
  const [pets, setPets] = React.useState(null);
  const [loading, setLoading] = React.useState(true);
  const [meta, setMeta] = React.useState(null);
  const [error, setError] = React.useState(null);

  const load = React.useCallback(() => {
    setLoading(true);
    const params = query.trim() ? `?q=${encodeURIComponent(query.trim())}` : "";
    fetch(`/api/raven/pets${params}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.error) {
          setError(data.error);
        } else {
          setPets(data.rows);
          setMeta({ durationMs: data.durationMs, isSemantic: data.isSemantic });
          setError(null);
        }
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [query]);

  React.useEffect(() => {
    const id = setTimeout(load, 300);
    return () => clearTimeout(id);
  }, [load]);

  // Live refresh: re-runs the same search/filter every few seconds so a pet
  // added or changed via CDC Sink shows up without the visitor having to
  // touch the search box. `load` only changes identity when `query` does,
  // so this always polls with whatever's currently typed.
  React.useEffect(() => {
    const id = setInterval(load, 5000);
    return () => clearInterval(id);
  }, [load]);

  return (
    <div className="pet-grid-wrap">
      <div className="pet-search-row">
        <input
          type="search"
          className="pet-search-input"
          placeholder={t("raven.searchPlaceholder")}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        {meta && (
          <span className="pet-search-meta">
            {meta.isSemantic ? t("raven.semanticSearch") : t("raven.allAvailablePets")} · {formatDuration(meta.durationMs)}
          </span>
        )}
      </div>

      {error && <div className="raven-error">{error}</div>}
      {loading && !pets && <div className="raven-loading">{t("raven.loadingPets")}</div>}

      {pets && (
        <div className="pet-grid">
          {pets.length === 0 && <p className="raven-loading">{t("raven.noPetsMatched")}</p>}
          {pets.map((pet) => (
            <PetCard key={pet.PetId} pet={pet} onAskAbout={onAskAbout} />
          ))}
        </div>
      )}
    </div>
  );
}
