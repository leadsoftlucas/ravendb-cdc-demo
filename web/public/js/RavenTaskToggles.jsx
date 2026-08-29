const TASK_LABEL_KEYS = {
  CdcSink: "raven.toggleCdcSink",
  GenAi: "raven.toggleGenAi",
  EmbeddingsGeneration: "raven.toggleEmbeddings",
};

const TASK_HINT_KEYS = {
  CdcSink: "hint.cdcSink",
  GenAi: "hint.genAi",
  EmbeddingsGeneration: "hint.embeddings",
};

function TaskToggleSwitch({ label, hint, checked, disabled, onChange }) {
  return (
    <label className="raven-toggle" title={label}>
      <input type="checkbox" checked={checked} disabled={disabled} onChange={onChange} />
      <span className="raven-toggle-track">
        <span className="raven-toggle-thumb" />
      </span>
      <span className="raven-toggle-label">{label}</span>
      {hint && <InfoHint text={hint} />}
    </label>
  );
}

function RavenTaskToggles() {
  const { t } = useI18n();
  const [tasks, setTasks] = React.useState([]);
  const [agentEnabled, setAgentEnabledState] = React.useState(true);
  const [pending, setPending] = React.useState(null);

  const load = React.useCallback(async () => {
    try {
      const [tasksRes, agentRes] = await Promise.all([fetch("/api/raven/tasks"), fetch("/api/raven/agent-state")]);
      setTasks(await tasksRes.json());
      const agentData = await agentRes.json();
      setAgentEnabledState(agentData.enabled);
    } catch {
      // keep last known state on transient failure
    }
  }, []);

  React.useEffect(() => {
    load();
    const id = setInterval(load, 15000);
    return () => clearInterval(id);
  }, [load]);

  async function toggleTask(task) {
    setPending(task.taskId);
    try {
      const res = await fetch(`/api/raven/tasks/${task.taskId}/toggle`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: task.type, disable: task.enabled }),
      });
      setTasks(await res.json());
    } finally {
      setPending(null);
    }
  }

  async function toggleAgent() {
    setPending("agent");
    try {
      const res = await fetch("/api/raven/agent-state", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ enabled: !agentEnabled }),
      });
      const data = await res.json();
      setAgentEnabledState(data.enabled);
    } finally {
      setPending(null);
    }
  }

  return (
    <div className="raven-toggles">
      {tasks.map((task) => (
        <TaskToggleSwitch
          key={task.taskId}
          label={TASK_LABEL_KEYS[task.type] ? t(TASK_LABEL_KEYS[task.type]) : task.type}
          hint={TASK_HINT_KEYS[task.type] && t(TASK_HINT_KEYS[task.type])}
          checked={task.enabled}
          disabled={pending === task.taskId}
          onChange={() => toggleTask(task)}
        />
      ))}
      <TaskToggleSwitch
        label={t("raven.toggleAgent")}
        hint={t("hint.agent")}
        checked={agentEnabled}
        disabled={pending === "agent"}
        onChange={toggleAgent}
      />
    </div>
  );
}
