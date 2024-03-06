import {
  boolean,
  pgTable,
  serial,
  text,
  timestamp,
  varchar,
} from "drizzle-orm/pg-core";
import { v4 as uuidv4 } from "uuid";

export const users = pgTable("users", {
  id: varchar("id", { length: 36 }).primaryKey().$defaultFn(uuidv4),
  provider: varchar("provider", { length: 10 }).notNull(),
  name: varchar("name", { length: 40 }).notNull(),
  email: varchar("email", { length: 254 }).notNull(),
  emailVerified: boolean("email_verified").default(false).notNull(),
  password: varchar("password", { length: 100 }),
  picture: text("picture"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const chats = pgTable("chats", {
  id: varchar("id", { length: 36 }).primaryKey().$defaultFn(uuidv4),
  userId: varchar("user_id", { length: 36 })
    .references(() => users.id)
    .notNull(),
  chatName: varchar("chat_name", { length: 25 }).notNull(),
  fileLink: text("file_link").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const chatMessages = pgTable("chat_messages", {
  id: serial("id").primaryKey(),
  chatId: varchar("chat_id", { length: 36 })
    .references(() => chats.id)
    .notNull(),
  role: varchar("role", { length: 10 }).notNull(),
  content: text("content").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const userSubscriptions = pgTable("user_subscriptions", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id", { length: 36 })
    .references(() => users.id)
    .notNull(),
  stripeCustomerId: varchar("stripe_customer_id", { length: 256 })
    .notNull()
    .unique(),
  stripeSubscriptionId: varchar("stripe_subscription_id", { length: 256 })
    .notNull()
    .unique(),
  stripePriceId: varchar("stripe_price_id", { length: 256 }),
  stripeCurrentPeriodEnd: timestamp("stripe_current_period_end"),
});
