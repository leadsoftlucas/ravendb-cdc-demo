// Minimal RFC4180-ish CSV parser (quoted fields, embedded commas, escaped
// "" quotes) — used to read the seed data CSVs directly in Node so they can
// be streamed to SQL Server as a client-side bulk copy (see sqlProvision.js),
// instead of relying on server-side BULK INSERT ... FROM '<path>', which
// only works when the file is reachable from the SQL Server host itself.

function parseCsv(text) {
  const rows = [];
  let row = [];
  let field = "";
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (inQuotes) {
      if (c === '"') {
        if (text[i + 1] === '"') {
          field += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        field += c;
      }
      continue;
    }

    if (c === '"') {
      inQuotes = true;
    } else if (c === ",") {
      row.push(field);
      field = "";
    } else if (c === "\r") {
      // skip — \n (or \r\n) below ends the row
    } else if (c === "\n") {
      row.push(field);
      rows.push(row);
      row = [];
      field = "";
    } else {
      field += c;
    }
  }
  if (field.length || row.length) {
    row.push(field);
    rows.push(row);
  }

  const header = rows.shift();
  return rows.filter((r) => r.length > 1 || r[0] !== "").map((r) => {
    const obj = {};
    header.forEach((h, idx) => {
      obj[h] = r[idx];
    });
    return obj;
  });
}

module.exports = { parseCsv };
