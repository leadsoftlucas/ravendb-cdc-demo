function Pagination({ page, pageSize, total, onPageChange }) {
  const { t } = useI18n();
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  return (
    <div className="sql-pagination">
      <button type="button" disabled={page <= 1} onClick={() => onPageChange(page - 1)}>
        {t("sql.prev")}
      </button>
      <span>{t("sql.pageOf", { page, totalPages, total, plural: total === 1 ? "" : "s" })}</span>
      <button type="button" disabled={page >= totalPages} onClick={() => onPageChange(page + 1)}>
        {t("sql.next")}
      </button>
    </div>
  );
}

function formatCellValue(value, t) {
  if (value === null || value === undefined) return "—";
  if (typeof value === "boolean") return value ? (t ? t("sql.yes") : "Yes") : t ? t("sql.no") : "No";
  if (typeof value === "string" && /^\d{4}-\d{2}-\d{2}T/.test(value)) return value.slice(0, 10);
  return String(value);
}
