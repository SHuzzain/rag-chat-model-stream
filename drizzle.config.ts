import { defineConfig } from "drizzle-kit"
import { envConfig } from "./config/env-conf"

export default defineConfig({
  dialect: "postgresql",
  schema: "./schema/index.ts",
  out: "./drizzle",
  dbCredentials: {
    host: envConfig.DB_HOST,
    port: parseInt(envConfig.DB_PORT),
    user: envConfig.DB_USER,
    password: envConfig.DB_PASSWORD,
    database: envConfig.DB_NAME,
    ssl: envConfig.DB_SSL === "disable" ? false : { rejectUnauthorized: false },
  },
})
