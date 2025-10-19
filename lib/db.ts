import { Pool, PoolClient, QueryResult, QueryResultRow } from "pg";

const pool = new Pool({
  host: process.env.DB_HOST || "localhost",
  port: parseInt(process.env.DB_PORT || "9432"),
  database: process.env.DB_NAME || "dink_house",
  user: process.env.DB_USER || "postgres",
  password: process.env.DB_PASSWORD || "postgres",
  ssl: process.env.DB_SSL === "true" ? { rejectUnauthorized: false } : false,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

pool.on("error", (err) => {
  console.error("Unexpected error on idle PostgreSQL client", err);
});

export default pool;

/**
 * Execute a SQL query
 */
export async function query<T extends QueryResultRow = any>(
  text: string,
  params?: any[],
): Promise<QueryResult<T>> {
  return pool.query(text, params);
}

/**
 * Execute a transaction
 */
export async function transaction<T>(
  callback: (client: PoolClient) => Promise<T>,
): Promise<T> {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");
    const result = await callback(client);

    await client.query("COMMIT");

    return result;
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

/**
 * Call a PostgreSQL function using SELECT syntax
 */
export async function callFunction<T extends QueryResultRow = any>(
  functionName: string,
  params: Record<string, any> = {},
): Promise<T> {
  const paramNames = Object.keys(params);
  const paramValues = Object.values(params);

  // Build the function call SQL
  const paramPlaceholders = paramNames
    .map((name, index) => `${name} := $${index + 1}`)
    .join(", ");

  const sql = `SELECT * FROM ${functionName}(${paramPlaceholders})`;

  const result = await query<T>(sql, paramValues);

  // For functions that return a single row
  if (result.rows.length === 1) {
    return result.rows[0] as T;
  }

  // For functions that return multiple rows or void
  return result.rows as any;
}
