import { drizzleAdapter } from "@better-auth/drizzle-adapter";
import { betterAuth } from "better-auth";
import { nextCookies } from "better-auth/next-js";
import { admin, magicLink, organization, username } from "better-auth/plugins";
import { openAPI } from "better-auth/plugins";

import { db } from "@/db";
import * as schema from "@/db/schema";
import { sendMagicLinkEmail } from "@/lib/email";
import { envConfig } from "@/lib/env";

export const auth = betterAuth({
  appName: "Chatbot Champs",
  secret: envConfig.BETTER_AUTH_SECRET,
  baseURL: envConfig.BETTER_AUTH_URL,
  database: drizzleAdapter(db, {
    provider: "pg",
    schema,
  }),
  emailAndPassword: {
    enabled: true,
    autoSignInAfterVerification: true,
  },
  plugins: [
    magicLink({
      async sendMagicLink({ email, url }) {
        await sendMagicLinkEmail({ email, url });
      },
    }),
    openAPI(),
    admin({}),
    username(),
    organization({
      allowUserToCreateOrganization: true,
    }),
    nextCookies(),
  ],
});
