// RavenDB's DurationInMs is a whole-millisecond integer — a query against a
// pre-computed static index over a handful of documents genuinely runs in
// well under 1ms, which rounds down to a bare "0ms" that reads as broken
// instrumentation rather than "impressively fast". This is the honest fix:
// same real number, presented so it doesn't look like a bug.
function formatDuration(ms) {
  if (typeof ms !== "number") return "…";
  return ms === 0 ? "< 1ms" : `${ms}ms`;
}

function useStatus(endpoint, intervalMs) {
  const [status, setStatus] = React.useState(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const res = await fetch(endpoint);
        const data = await res.json();
        if (!cancelled) {
          setStatus(data);
          setLoading(false);
        }
      } catch (err) {
        if (!cancelled) {
          setStatus({ ok: false, error: err.message });
          setLoading(false);
        }
      }
    }

    load();
    const id = setInterval(load, intervalMs || 15000);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, [endpoint, intervalMs]);

  return { status, loading };
}
