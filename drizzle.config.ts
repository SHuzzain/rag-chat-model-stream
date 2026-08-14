import { defineConfig } from "drizzle-kit";

import { envConfig } from "./lib/env";

export default defineConfig({
  dialect: "postgresql",
  schema: "./db/schema.ts",
  out: "./drizzle/migrations",
  dbCredentials: {
    host: envConfig.DB_HOST,
    port: parseInt(envConfig.DB_PORT),
    user: envConfig.DB_USER,
    password: envConfig.DB_PASSWORD,
    database: envConfig.DB_NAME,
    ssl: envConfig.DB_SSL === "disable" ? false : { rejectUnauthorized: false },
  },
});
