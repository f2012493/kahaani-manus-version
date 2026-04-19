import { eq, leftJoin } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, users, childProfiles, storyThemes, stories, orders } from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

export async function getChildProfiles(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(childProfiles).where(eq(childProfiles.userId, userId));
}

export async function createChildProfile(userId: number, name: string, age: number, gender?: string, imageUrl?: string) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.insert(childProfiles).values({ userId, name, age, gender, imageUrl });
  return result;
}

export async function updateChildProfileImage(childProfileId: number, imageUrl: string) {
  const db = await getDb();
  if (!db) return null;
  return db.update(childProfiles).set({ imageUrl }).where(eq(childProfiles.id, childProfileId));
}

export async function getStoryThemes() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(storyThemes);
}

export async function getUserStories(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(stories).where(eq(stories.userId, userId));
}

export async function createStory(
  userId: number,
  themeId: number,
  title: string,
  childProfileId?: number,
  isGiftStory?: boolean,
  kidImageUrl?: string,
  giftRecipientName?: string,
  giftRecipientAge?: number
) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.insert(stories).values({
    userId,
    themeId,
    title,
    childProfileId,
    kidImageUrl,
    isGiftStory: isGiftStory || false,
    giftRecipientName,
    giftRecipientAge,
    status: 'draft',
  });
  return result;
}

export async function getStoryById(id: number) {
  const db = await getDb();
  if (!db) return null;
  
  const result = await db
    .select({
      story: stories,
      childProfile: childProfiles,
      theme: storyThemes,
    })
    .from(stories)
    .leftJoin(childProfiles, eq(stories.childProfileId, childProfiles.id))
    .leftJoin(storyThemes, eq(stories.themeId, storyThemes.id))
    .where(eq(stories.id, id))
    .limit(1);

  if (result.length === 0) return null;

  const { story, childProfile, theme } = result[0];
  return {
    ...story,
    childName: story.isGiftStory ? story.giftRecipientName : childProfile?.name,
    childAge: story.isGiftStory ? story.giftRecipientAge : childProfile?.age,
    themeName: theme?.name,
    themeEmoji: theme?.emoji,
    kidImageUrl: story.kidImageUrl || childProfile?.imageUrl,
  };
}

export async function updateStoryContent(id: number, storyContent: string, storyJson: any, status: 'draft' | 'generated' | 'preview' | 'published') {
  const db = await getDb();
  if (!db) return null;
  return db.update(stories).set({ storyContent, storyJson, status }).where(eq(stories.id, id));
}

export async function updateStoryIllustrations(id: number, illustrations: any[]) {
  const db = await getDb();
  if (!db) return null;
  return db.update(stories).set({ illustrations, status: 'generated' }).where(eq(stories.id, id));
}

export async function createOrder(userId: number, storyId: number, orderType: 'digital' | 'printed', price: string) {
  const db = await getDb();
  if (!db) return null;
  return db.insert(orders).values({
    userId,
    storyId,
    orderType,
    price,
    status: 'pending',
  });
}

export async function getUserOrders(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(orders).where(eq(orders.userId, userId));
}

export async function updateStory(id: number, updates: { title?: string; themeId?: number }) {
  const db = await getDb();
  if (!db) return null;
  return db.update(stories).set(updates).where(eq(stories.id, id));
}

export async function deleteStory(id: number) {
  const db = await getDb();
  if (!db) return null;
  return db.delete(stories).where(eq(stories.id, id));
}

export async function updateStoryKidImage(storyId: number, kidImageUrl: string) {
  const db = await getDb();
  if (!db) return null;
  return db.update(stories).set({ kidImageUrl }).where(eq(stories.id, storyId));
}

// TODO: add feature queries here as your schema grows.
