require("dotenv").config();

const express = require("express");
const path = require("path");

const { getSqlStatus } = require("./routes/sqlStatus");
const { getRavenStatus } = require("./routes/ravenStatus");
const { getCaptureStatus, setCaptureEnabled } = require("./routes/cdcCapture");
const {
  getSchema,
  listRows,
  getRow,
  getLookup,
  insertRow,
  updateRow,
  deleteRow,
  friendlyDbError,
} = require("./routes/sqlData");
const { bootstrapRaven } = require("./lib/ravenBootstrap");
const { sendMessage, isAgentEnabled, setAgentEnabled, getCumulativeTokensUsed } = require("./routes/ravenAgent");
const { getPetStats, searchAvailablePets, getTaskStates, toggleTask, getPulseSample, getRescueTimeline } = require("./routes/ravenDashboard");
const { clearRavenDatabase, resetSqlData } = require("./routes/ravenReset");
const { getConnectionInfo: getSqlConnectionInfo, updateConnection: updateSqlConnection } = require("./routes/sqlConnection");
const { getConnectionInfo: getRavenConnectionInfo, updateConnection: updateRavenConnection } = require("./routes/ravenConnection");

const PORT = process.env.PORT || 4000;
const app = express();

app.use((req, res, next) => {
  const start = Date.now();
  res.on("finish", () => {
    const ms = Date.now() - start;
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl} -> ${res.statusCode} (${ms}ms)`);
  });
  next();
});

app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

app.get("/api/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

app.get("/api/sql/status", async (req, res) => {
  res.json(await getSqlStatus());
});

app.get("/api/raven/status", async (req, res) => {
  res.json(await getRavenStatus());
});

app.get("/api/sql/cdc-capture", async (req, res) => {
  res.json(await getCaptureStatus());
});

app.post("/api/sql/cdc-capture", async (req, res) => {
  res.json(await setCaptureEnabled(Boolean(req.body.enabled)));
});

app.get("/api/sql/schema", async (req, res) => {
  try {
    res.json(await getSchema());
  } catch (err) {
    res.status(err.status || 500).json({ error: err.message });
  }
});

app.get("/api/sql/lookup/:table", async (req, res) => {
  try {
    res.json(await getLookup(req.params.table, req.query.search));
  } catch (err) {
    res.status(err.status || 500).json({ error: err.message });
  }
});

app.get("/api/sql/tables/:table", async (req, res) => {
  try {
    res.json(await listRows(req.params.table, req.query));
  } catch (err) {
    res.status(err.status || 500).json({ error: err.message });
  }
});

app.get("/api/sql/tables/:table/:id", async (req, res) => {
  try {
    res.json(await getRow(req.params.table, req.params.id));
  } catch (err) {
    res.status(err.status || 500).json({ error: err.message });
  }
});

app.post("/api/sql/tables/:table", async (req, res) => {
  try {
    const id = await insertRow(req.params.table, req.body);
    res.status(201).json({ id });
  } catch (err) {
    res.status(err.status || (err.number === 547 ? 409 : 500)).json({ error: friendlyDbError(err) });
  }
});

app.put("/api/sql/tables/:table/:id", async (req, res) => {
  try {
    await updateRow(req.params.table, req.params.id, req.body);
    res.json({ ok: true });
  } catch (err) {
    res.status(err.status || (err.number === 547 ? 409 : 500)).json({ error: friendlyDbError(err) });
  }
});

app.delete("/api/sql/tables/:table/:id", async (req, res) => {
  try {
    await deleteRow(req.params.table, req.params.id);
    res.json({ ok: true });
  } catch (err) {
    res.status(err.status || (err.number === 547 ? 409 : 500)).json({ error: friendlyDbError(err) });
  }
});

app.post("/api/raven/chat", async (req, res) => {
  try {
    const { conversationId, message } = req.body;
    if (!message) return res.status(400).json({ error: "message is required" });
    res.json(await sendMessage(conversationId, message));
  } catch (err) {
    res.status(err.status || 500).json({ error: err.message });
  }
});

app.get("/api/raven/agent-state", (req, res) => {
  res.json({ enabled: isAgentEnabled() });
});

app.post("/api/raven/agent-state", (req, res) => {
  res.json({ enabled: setAgentEnabled(req.body.enabled) });
});

app.get("/api/raven/stats", async (req, res) => {
  try {
    const stats = await getPetStats();
    res.json({ ...stats, agentTokensUsed: getCumulativeTokensUsed() });
  } catch (err) {
    res.status(err.status || 500).json({ error: err.message });
  }
});

app.get("/api/raven/pets", async (req, res) => {
  try {
    res.json(await searchAvailablePets(req.query.q));
  } catch (err) {
    res.status(err.status || 500).json({ error: err.message });
  }
});

app.get("/api/raven/timeline", async (req, res) => {
  try {
    res.json(await getRescueTimeline());
  } catch (err) {
    res.status(err.status || 500).json({ error: err.message });
  }
});

app.get("/api/raven/pulse", async (req, res) => {
  try {
    res.json(await getPulseSample());
  } catch (err) {
    res.status(err.status || 500).json({ error: err.message });
  }
});

app.get("/api/raven/tasks", async (req, res) => {
  try {
    res.json(await getTaskStates());
  } catch (err) {
    res.status(err.status || 500).json({ error: err.message });
  }
});

app.post("/api/raven/tasks/:taskId/toggle", async (req, res) => {
  try {
    const { type, disable } = req.body;
    res.json(await toggleTask(Number(req.params.taskId), type, Boolean(disable)));
  } catch (err) {
    res.status(err.status || 500).json({ error: err.message });
  }
});

app.post("/api/raven/clear", async (req, res) => {
  try {
    res.json(await clearRavenDatabase());
  } catch (err) {
    res.status(err.status || 500).json({ error: err.message });
  }
});

app.post("/api/sql/reset", async (req, res) => {
  try {
    res.json(await resetSqlData());
  } catch (err) {
    res.status(err.status || 500).json({ error: err.message });
  }
});

app.get("/api/sql/connection", (req, res) => {
  res.json(getSqlConnectionInfo());
});

app.post("/api/sql/connection", async (req, res) => {
  try {
    res.json(await updateSqlConnection(req.body));
  } catch (err) {
    res.status(err.status || 500).json({ error: err.message });
  }
});

app.get("/api/raven/connection", (req, res) => {
  res.json(getRavenConnectionInfo());
});

app.post("/api/raven/connection", async (req, res) => {
  try {
    res.json(await updateRavenConnection(req.body));
  } catch (err) {
    res.status(err.status || 500).json({ error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`RavenDB CDC Demo web app listening on http://localhost:${PORT}`);
  bootstrapRaven();
});
