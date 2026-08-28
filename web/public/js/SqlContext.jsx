const SqlContext = React.createContext(null);

function SqlProvider({ children }) {
  const [schema, setSchema] = React.useState(null);
  const [schemaError, setSchemaError] = React.useState(null);
  const [selectedTable, setSelectedTable] = React.useState("Pets");
  const [view, setView] = React.useState("list");
  const [selectedId, setSelectedId] = React.useState(null);
  const [listStates, setListStates] = React.useState({});
  const [refreshToken, setRefreshToken] = React.useState(0);

  const loadSchema = React.useCallback(() => {
    fetch("/api/sql/schema")
      .then((r) => r.json())
      .then((data) => {
        if (data.error) {
          setSchemaError(data.error);
        } else {
          setSchema(data);
          setSchemaError(null);
        }
      })
      .catch((err) => setSchemaError(err.message));
  }, []);

  React.useEffect(() => {
    loadSchema();
  }, [loadSchema]);

  function openTable(table) {
    setSelectedTable(table);
    setView("list");
    setSelectedId(null);
  }

  function openRecord(table, id) {
    setSelectedTable(table);
    setView("detail");
    setSelectedId(id);
  }

  function openNew(table) {
    setSelectedTable(table);
    setView("new");
    setSelectedId(null);
  }

  function backToList() {
    setView("list");
    setSelectedId(null);
  }

  function getListState(key) {
    return listStates[key] || { page: 1, search: "", filters: {} };
  }

  function setListState(key, patch) {
    setListStates((s) => ({ ...s, [key]: { ...getListState(key), ...patch } }));
  }

  function refreshAll() {
    loadSchema();
    setRefreshToken((t) => t + 1);
  }

  const value = {
    schema,
    schemaError,
    selectedTable,
    view,
    selectedId,
    refreshToken,
    openTable,
    openRecord,
    openNew,
    backToList,
    getListState,
    setListState,
    refreshAll,
  };

  return <SqlContext.Provider value={value}>{children}</SqlContext.Provider>;
}

function useSql() {
  return React.useContext(SqlContext);
}
