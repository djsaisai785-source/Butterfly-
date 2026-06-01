import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { bearer } from "better-auth/plugins";
import { autumn } from "autumn-js/better-auth";
import { Autumn } from "autumn-js";
import { db } from "./database";
import { authUser, authSession, authAccount, authVerification, users } from "./database/schema";

const autumnSdk = new Autumn();

export const auth = betterAuth({
  secret: process.env.BETTER_AUTH_SECRET!,
  baseURL: process.env.WEBSITE_URL ?? "http://localhost:4200",
  database: drizzleAdapter(db, {
    provider: "sqlite",
    schema: {
      user: authUser,
      session: authSession,
      account: authAccount,
      verification: authVerification,
    },
  }),
  emailAndPassword: {
    enabled: true,
  },
  plugins: [bearer(), autumn()],
  databaseHooks: {
    user: {
      create: {
        async after(user) {
          // Mirror into app users table so FK constraints work
          try {
            await db.insert(users).values({
              id: user.id,
              name: user.name ?? user.email,
              email: user.email,
              type: "user",
              verified: false,
              rating: 0,
              reviewCount: 0,
            }).onConflictDoNothing();
          } catch (e) {
            console.error("[auth] Failed to mirror user:", e);
          }

          // Create Autumn customer
          try {
            await autumnSdk.customers.getOrCreate({
              customerId: user.id,
              name: user.name,
              email: user.email,
            });
          } catch (e) {
            console.error("[autumn] Failed to create customer:", e);
          }
        },
      },
    },
  },
});
