function PetCard({ pet, onAskAbout }) {
  return (
    <div className="pet-card">
      <div className="pet-card-header">
        <h3>{pet.Name}</h3>
        <span className="pet-card-species">{pet.Species}</span>
      </div>
      <p className="pet-card-meta">
        {pet.Breed || "Mixed breed"} · {pet.Sex}
      </p>
      {pet.AdoptionBio ? (
        <p className="pet-card-bio">{pet.AdoptionBio}</p>
      ) : (
        <p className="pet-card-bio pet-card-bio-pending">AI bio not generated yet — check back shortly.</p>
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
        Ask the concierge about {pet.Name} →
      </button>
    </div>
  );
}

function PetGrid({ onAskAbout }) {
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

  return (
    <div className="pet-grid-wrap">
      <div className="pet-search-row">
        <input
          type="search"
          className="pet-search-input"
          placeholder="Describe the perfect pet… e.g. 'calm dog good with kids'"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        {meta && (
          <span className="pet-search-meta">
            {meta.isSemantic ? "Semantic search" : "All available pets"} · {meta.durationMs}ms
          </span>
        )}
      </div>

      {error && <div className="raven-error">{error}</div>}
      {loading && !pets && <div className="raven-loading">Loading pets…</div>}

      {pets && (
        <div className="pet-grid">
          {pets.length === 0 && <p className="raven-loading">No pets matched — try different words.</p>}
          {pets.map((pet) => (
            <PetCard key={pet.PetId} pet={pet} onAskAbout={onAskAbout} />
          ))}
        </div>
      )}
    </div>
  );
}
