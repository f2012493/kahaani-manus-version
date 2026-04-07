import {
  int,
  mysqlEnum,
  mysqlTable,
  text,
  timestamp,
  varchar,
  decimal,
  boolean,
  json,
  longtext,
} from "drizzle-orm/mysql-core";
import { sql } from "drizzle-orm";

/**
 * Core user table backing auth flow.
 */
export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Story themes available on the platform
 */
export const storyThemes = mysqlTable("storyThemes", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  emoji: varchar("emoji", { length: 10 }).notNull(),
  description: text("description"),
  isCustom: boolean("isCustom").default(false).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type StoryTheme = typeof storyThemes.$inferSelect;
export type InsertStoryTheme = typeof storyThemes.$inferInsert;

/**
 * Child profiles for story creation
 */
export const childProfiles = mysqlTable("childProfiles", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  name: varchar("name", { length: 100 }).notNull(),
  age: int("age").notNull(),
  gender: varchar("gender", { length: 20 }),
  favoriteThemes: json("favoriteThemes").$type<number[]>().notNull().default(sql`json_array()`),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type ChildProfile = typeof childProfiles.$inferSelect;
export type InsertChildProfile = typeof childProfiles.$inferInsert;

/**
 * Generated stories
 */
export const stories = mysqlTable("stories", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  childProfileId: int("childProfileId"),
  themeId: int("themeId").notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  status: mysqlEnum("status", ["draft", "generated", "preview", "published"]).default("draft").notNull(),
  storyContent: longtext("storyContent"),
  storyJson: json("storyJson").$type<{ pages: { title: string; content: string; imagePrompt: string }[] }>(),
  illustrations: json("illustrations").$type<{ pageIndex: number; url: string; prompt: string }[]>().default(sql`json_array()`),
  isGiftStory: boolean("isGiftStory").default(false).notNull(),
  giftRecipientName: varchar("giftRecipientName", { length: 100 }),
  giftRecipientAge: int("giftRecipientAge"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Story = typeof stories.$inferSelect;
export type InsertStory = typeof stories.$inferInsert;

/**
 * Story orders/purchases
 */
export const orders = mysqlTable("orders", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  storyId: int("storyId").notNull(),
  orderType: mysqlEnum("orderType", ["digital", "printed"]).notNull(),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  status: mysqlEnum("status", ["pending", "completed", "shipped", "delivered", "cancelled"]).default("pending").notNull(),
  paymentMethod: varchar("paymentMethod", { length: 50 }),
  transactionId: varchar("transactionId", { length: 255 }),
  deliveryAddress: json("deliveryAddress").$type<{
    name: string;
    phone: string;
    address: string;
    city: string;
    state: string;
    pincode: string;
  }>(),
  trackingNumber: varchar("trackingNumber", { length: 255 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Order = typeof orders.$inferSelect;
export type InsertOrder = typeof orders.$inferInsert;

/**
 * Story previews (free samples)
 */
export const storyPreviews = mysqlTable("storyPreviews", {
  id: int("id").autoincrement().primaryKey(),
  storyId: int("storyId").notNull(),
  previewContent: longtext("previewContent"),
  previewImageUrl: varchar("previewImageUrl", { length: 500 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type StoryPreview = typeof storyPreviews.$inferSelect;
export type InsertStoryPreview = typeof storyPreviews.$inferInsert;

/**
 * User ratings and reviews
 */
export const reviews = mysqlTable("reviews", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  storyId: int("storyId"),
  rating: int("rating").notNull(),
  comment: text("comment"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Review = typeof reviews.$inferSelect;
export type InsertReview = typeof reviews.$inferInsert;
