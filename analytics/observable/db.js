// Shared Postgres access for Observable data loaders.
import pg from "pg";
import dotenv from "dotenv";

dotenv.config({ path: new URL("../.env", import.meta.url) });

export const schema = process.env.ANALYTICS_DB_SCHEMA || "analytics";

/**
 * Runs one query against the marts and closes the pool.
 * @param {string} text SQL to execute.
 * @returns {Promise<object[]>} Result rows.
 */
export async function rows(text) {
  const pool = new pg.Pool({
    host: process.env.ANALYTICS_DB_HOST,
    port: Number(process.env.ANALYTICS_DB_PORT || 5432),
    user: process.env.ANALYTICS_DB_USER,
    password: process.env.ANALYTICS_DB_PASSWORD,
    database: process.env.ANALYTICS_DB_NAME,
  });
  try {
    return (await pool.query(text)).rows;
  } finally {
    await pool.end();
  }
}
