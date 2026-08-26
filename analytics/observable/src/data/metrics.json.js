// Loader: counter breakdown plus total users.
import { rows, schema } from "../../db.js";

const sql = `select c.saved, c.destroyed, c.dead, u.total_users
  from ${schema}.mart_star_counters c
  cross join ${schema}.mart_users_total u`;

let metrics = { saved: 0, destroyed: 0, dead: 0, total_users: 0 };
try {
  metrics = (await rows(sql))[0] ?? metrics;
} catch (error) {
  process.stderr.write(`metrics loader: database unavailable, emitting zeros (${error.message})\n`);
}

process.stdout.write(JSON.stringify(metrics));
