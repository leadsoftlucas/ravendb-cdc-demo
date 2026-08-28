const { sql, withPool } = require("../db");
const { TABLES } = require("../schema/tables");

// ---------- schema helpers ----------

function requireTable(tableName) {
  const def = TABLES[tableName];
  if (!def) {
    const err = new Error(`Unknown table "${tableName}"`);
    err.status = 404;
    throw err;
  }
  return def;
}

function requireColumn(def, columnName) {
  const col = def.columns.find((c) => c.name === columnName);
  if (!col) {
    const err = new Error(`Unknown column "${columnName}"`);
    err.status = 400;
    throw err;
  }
  return col;
}

// Every relationship is declared once, as the N:1 ("fk") side. The 1:N side
// (what shows up as tabs on the parent's detail view) is derived here.
function buildChildren() {
  const children = {};
  for (const name of Object.keys(TABLES)) children[name] = [];

  for (const [tableName, def] of Object.entries(TABLES)) {
    for (const col of def.columns) {
      if (col.type === "fk" && TABLES[col.ref]) {
        children[col.ref].push({ table: tableName, fk: col.name, label: def.label });
      }
    }
  }
  return children;
}

const CHILDREN = buildChildren();

function labelExpr(def) {
  if (def.labelExpression) return def.labelExpression;
  const cols = def.labelColumns && def.labelColumns.length ? def.labelColumns : [def.pk];
  return cols.map((c) => `ISNULL(CAST(${c} AS NVARCHAR(MAX)), '')`).join(" + ' ' + ");
}

async function getSchema() {
  const tableNames = Object.keys(TABLES);

  return withPool(async (pool) => {
    const tables = {};
    for (const name of tableNames) {
      const def = TABLES[name];
      const countResult = await pool.request().query(`SELECT COUNT(*) AS Cnt FROM dbo.[${name}]`);
      tables[name] = {
        label: def.label,
        pk: def.pk,
        listColumns: def.listColumns,
        searchable: def.searchable || [],
        filters: def.filters || [],
        columns: def.columns,
        children: CHILDREN[name] || [],
        rowCount: countResult.recordset[0].Cnt,
      };
    }
    return { tables, order: tableNames };
  });
}

// ---------- SQL type binding ----------

const SQL_TYPES = {
  int: () => sql.Int,
  decimal: () => sql.Decimal(9, 2),
  text: () => sql.NVarChar(sql.MAX),
  textarea: () => sql.NVarChar(sql.MAX),
  date: () => sql.Date,
  datetime: () => sql.DateTime2,
  boolean: () => sql.Bit,
  select: () => sql.NVarChar(sql.MAX),
  fk: () => sql.Int,
};

// ---------- reads ----------

function addFilters(request, def, query) {
  const whereClauses = [];

  if (query.search && def.searchable && def.searchable.length) {
    request.input("search", sql.NVarChar, `%${query.search}%`);
    whereClauses.push("(" + def.searchable.map((c) => `${c} LIKE @search`).join(" OR ") + ")");
  }

  let filterIndex = 0;
  for (const [key, value] of Object.entries(query)) {
    if (!key.startsWith("filter_") || value === "" || value === undefined) continue;
    const columnName = key.slice("filter_".length);
    const col = requireColumn(def, columnName);
    const paramName = `filter${filterIndex++}`;
    request.input(paramName, SQL_TYPES[col.type](), value);
    whereClauses.push(`${col.name} = @${paramName}`);
  }

  return whereClauses;
}

async function listRows(tableName, query) {
  const def = requireTable(tableName);
  const page = Math.max(1, parseInt(query.page, 10) || 1);
  const pageSize = Math.min(100, Math.max(1, parseInt(query.pageSize, 10) || 20));

  return withPool(async (pool) => {
    const countRequest = pool.request();
    const countWhere = addFilters(countRequest, def, query);
    const countSql = countWhere.length ? `WHERE ${countWhere.join(" AND ")}` : "";
    const countResult = await countRequest.query(`SELECT COUNT(*) AS Cnt FROM dbo.[${tableName}] ${countSql}`);
    const total = countResult.recordset[0].Cnt;

    const listRequest = pool.request();
    const listWhere = addFilters(listRequest, def, query);
    const listSql = listWhere.length ? `WHERE ${listWhere.join(" AND ")}` : "";
    listRequest.input("offset", sql.Int, (page - 1) * pageSize);
    listRequest.input("pageSize", sql.Int, pageSize);
    const columns = def.listColumns.join(", ");
    const result = await listRequest.query(
      `SELECT ${columns} FROM dbo.[${tableName}] ${listSql} ORDER BY ${def.pk} OFFSET @offset ROWS FETCH NEXT @pageSize ROWS ONLY`
    );

    return { rows: result.recordset, total, page, pageSize };
  });
}

async function getRow(tableName, id) {
  const def = requireTable(tableName);

  return withPool(async (pool) => {
    const request = pool.request();
    request.input("id", sql.Int, id);
    const result = await request.query(`SELECT * FROM dbo.[${tableName}] WHERE ${def.pk} = @id`);
    const row = result.recordset[0];
    if (!row) {
      const err = new Error(`${tableName} #${id} not found`);
      err.status = 404;
      throw err;
    }

    const parents = [];
    for (const col of def.columns) {
      if (col.type !== "fk") continue;
      const refId = row[col.name];
      if (refId === null || refId === undefined) {
        parents.push({ column: col.name, table: col.ref, label: col.label, refId: null, refLabel: null });
        continue;
      }
      const refDef = requireTable(col.ref);
      const refRequest = pool.request();
      refRequest.input("id", sql.Int, refId);
      const refResult = await refRequest.query(
        `SELECT ${refDef.pk} AS Id, (${labelExpr(refDef)}) AS Label FROM dbo.[${col.ref}] WHERE ${refDef.pk} = @id`
      );
      const refRow = refResult.recordset[0];
      parents.push({
        column: col.name,
        table: col.ref,
        label: col.label,
        refId,
        refLabel: refRow ? refRow.Label : `#${refId}`,
      });
    }

    return { row, parents };
  });
}

async function getLookup(tableName, search) {
  const def = requireTable(tableName);

  return withPool(async (pool) => {
    const request = pool.request();
    let whereSql = "";
    if (search && def.searchable && def.searchable.length) {
      request.input("search", sql.NVarChar, `%${search}%`);
      whereSql = "WHERE " + def.searchable.map((c) => `${c} LIKE @search`).join(" OR ");
    }
    const result = await request.query(
      `SELECT TOP 200 ${def.pk} AS Id, (${labelExpr(def)}) AS Label FROM dbo.[${tableName}] ${whereSql} ORDER BY Label`
    );
    return result.recordset;
  });
}

// ---------- writes ----------

function buildWritePayload(def, body) {
  const columnsUsed = [];
  const inputs = [];

  for (const col of def.columns) {
    if (col.pk) continue;
    if (!(col.name in body)) continue;
    let value = body[col.name];
    if (value === "" && col.nullable) value = null;
    if (col.type === "boolean") value = value ? 1 : 0;
    columnsUsed.push(col.name);
    inputs.push({ name: col.name, type: SQL_TYPES[col.type](), value });
  }

  return { columnsUsed, inputs };
}

async function insertRow(tableName, body) {
  const def = requireTable(tableName);
  const { columnsUsed, inputs } = buildWritePayload(def, body);

  return withPool(async (pool) => {
    const request = pool.request();
    for (const input of inputs) request.input(input.name, input.type, input.value);

    const columnList = columnsUsed.join(", ");
    const paramList = columnsUsed.map((c) => `@${c}`).join(", ");
    const result = await request.query(
      `INSERT INTO dbo.[${tableName}] (${columnList}) OUTPUT INSERTED.${def.pk} AS NewId VALUES (${paramList})`
    );
    return result.recordset[0].NewId;
  });
}

async function updateRow(tableName, id, body) {
  const def = requireTable(tableName);
  const { columnsUsed, inputs } = buildWritePayload(def, body);

  return withPool(async (pool) => {
    const request = pool.request();
    request.input("id", sql.Int, id);
    for (const input of inputs) request.input(input.name, input.type, input.value);

    const setSql = columnsUsed.map((c) => `${c} = @${c}`).join(", ");
    await request.query(`UPDATE dbo.[${tableName}] SET ${setSql} WHERE ${def.pk} = @id`);
  });
}

async function deleteRow(tableName, id) {
  const def = requireTable(tableName);

  return withPool(async (pool) => {
    const request = pool.request();
    request.input("id", sql.Int, id);
    await request.query(`DELETE FROM dbo.[${tableName}] WHERE ${def.pk} = @id`);
  });
}

function friendlyDbError(err) {
  if (err.number === 547) {
    return "This record is referenced by other records and can't be deleted or changed that way. Remove the related records first.";
  }
  if (err.number === 2627 || err.number === 2601) {
    return "A record with that value already exists.";
  }
  return err.message;
}

module.exports = {
  getSchema,
  listRows,
  getRow,
  getLookup,
  insertRow,
  updateRow,
  deleteRow,
  friendlyDbError,
};
