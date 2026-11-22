// Loader: daily save/destroy/signup counts over time.
import { rows, schema } from "../../db.js";

const query = `select event_day, event_type, event_count
  from ${schema}.mart_star_trends
  order by event_day`;

/** Reads the daily counts, or none when the database is unreachable. */
async function loadTrends() {
  try {
    const raw = await rows(query);
    return raw.map((row) => ({ ...row, event_count: Number(row.event_count) }));
  } catch (error) {
    process.stderr.write(`trends loader: database unavailable, emitting empty (${error.message})\n`);
    return [];
  }
}

process.stdout.write(JSON.stringify(await loadTrends()));
