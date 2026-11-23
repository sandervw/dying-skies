// Loader: daily save/destroy/signup counts; database errors fail the build.
import { rows, schema } from "../../db.js";

const query = `select event_day, event_type, event_count
  from ${schema}.mart_star_trends
  order by event_day`;

const trends = (await rows(query)).map((row) => ({ ...row, event_count: Number(row.event_count) }));
process.stdout.write(JSON.stringify(trends));
