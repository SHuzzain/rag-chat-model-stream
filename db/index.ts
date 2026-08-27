import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

import { envConfig } from "@/lib/env";

import * as relations from "./relations";

export * from "./schema";

const queryClient = postgres({
  host: envConfig.DB_HOST,
  port: parseInt(envConfig.DB_PORT),
  user: envConfig.DB_USER,
  password: envConfig.DB_PASSWORD,
  database: envConfig.DB_NAME,
});

export const db = drizzle({ client: queryClient, logger: true, relations });
