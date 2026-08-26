// Loader: daily save/destroy/signup counts over time.
import { rows, schema } from "../../db.js";

const sql = `select event_day, event_type, event_count
  from ${schema}.mart_star_trends
  order by event_day`;

let trends = [];
try {
  trends = await rows(sql);
} catch (error) {
  process.stderr.write(`trends loader: database unavailable, emitting empty (${error.message})\n`);
}

process.stdout.write(JSON.stringify(trends));
