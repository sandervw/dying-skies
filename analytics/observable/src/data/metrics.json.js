// Loader: counter breakdown plus total users; database errors fail the build.
import { rows, schema } from "../../db.js";

const query = `select c.saved, c.destroyed, c.dead, u.total_users
  from ${schema}.mart_star_counters c
  cross join ${schema}.mart_users_total u`;

// pg returns counts as strings; numbers get thousands separators.
const [row] = await rows(query);
const metrics = {
  saved: Number(row.saved),
  destroyed: Number(row.destroyed),
  dead: Number(row.dead),
  total_users: Number(row.total_users),
};
process.stdout.write(JSON.stringify(metrics));
