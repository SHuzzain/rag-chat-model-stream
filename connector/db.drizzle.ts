import { envConfig } from "@/config/env-conf"
import { drizzle } from "drizzle-orm/postgres-js"
import postgres from "postgres"

const queryClient = postgres({
  host: envConfig.DB_HOST,
  port: parseInt(envConfig.DB_PORT),
  user: envConfig.DB_USER,
  password: envConfig.DB_PASSWORD,
  database: envConfig.DB_NAME,
})

const db = drizzle({ client: queryClient, logger: true })

export default db
