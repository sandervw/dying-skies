// Loader: counter breakdown plus total users.
import { rows, schema } from "../../db.js";

const query = `select c.saved, c.destroyed, c.dead, u.total_users
  from ${schema}.mart_star_counters c
  cross join ${schema}.mart_users_total u`;

const zeros = { saved: 0, destroyed: 0, dead: 0, total_users: 0 };

/** Reads the counters, or zeros when the database is unreachable. */
async function loadMetrics() {
  try {
    return (await rows(query))[0] ?? zeros;
  } catch (error) {
    process.stderr.write(`metrics loader: database unavailable, emitting zeros (${error.message})\n`);
    return zeros;
  }
}

process.stdout.write(JSON.stringify(await loadMetrics()));
