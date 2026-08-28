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
