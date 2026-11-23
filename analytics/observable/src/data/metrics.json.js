// Loader: counter breakdown plus total users; database errors fail the build.
import { rows, schema } from "../../db.js";

const query = `select c.saved, c.destroyed, c.dead, u.total_users
  from ${schema}.mart_star_counters c
  cross join ${schema}.mart_users_total u`;

const [metrics] = await rows(query);
process.stdout.write(JSON.stringify(metrics));
