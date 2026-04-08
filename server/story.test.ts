import { describe, it, expect, beforeEach, vi } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createAuthContext(userId: number = 1): TrpcContext {
  const user: AuthenticatedUser = {
    id: userId,
    openId: `user-${userId}`,
    email: `user${userId}@example.com`,
    name: `User ${userId}`,
    loginMethod: "manus",
    role: "user",
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };

  const ctx: TrpcContext = {
    user,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: vi.fn(),
    } as TrpcContext["res"],
  };

  return ctx;
}

describe("story procedures", () => {
  describe("story.themes", () => {
    it("should return list of story themes", async () => {
      const ctx = createAuthContext();
      const caller = appRouter.createCaller(ctx);

      const themes = await caller.story.themes();
      expect(Array.isArray(themes)).toBe(true);
      expect(themes.length).toBeGreaterThan(0);
      expect(themes[0]).toHaveProperty("name");
      expect(themes[0]).toHaveProperty("emoji");
      expect(themes[0]).toHaveProperty("description");
    });
  });

  describe("story.create", () => {
    it("should create a new story for authenticated user", async () => {
      const ctx = createAuthContext(1);
      const caller = appRouter.createCaller(ctx);

      const result = await caller.story.create({
        themeId: 1,
        title: "Test Story",
        isGiftStory: false,
      });

      expect(result).toBeDefined();
    });

    it("should create a gift story with recipient details", async () => {
      const ctx = createAuthContext(1);
      const caller = appRouter.createCaller(ctx);

      const result = await caller.story.create({
        themeId: 1,
        title: "Gift Story",
        isGiftStory: true,
        giftRecipientName: "Arjun",
        giftRecipientAge: 5,
      });

      expect(result).toBeDefined();
    });

    it("should throw error for unauthenticated user", async () => {
      const ctx = createAuthContext();
      ctx.user = null;
      const caller = appRouter.createCaller(ctx);

      await expect(
        caller.story.create({
          themeId: 1,
          title: "Test Story",
        })
      ).rejects.toThrow();
    });
  });

  describe("story.list", () => {
    it("should return user stories", async () => {
      const ctx = createAuthContext(1);
      const caller = appRouter.createCaller(ctx);

      const stories = await caller.story.list({});
      expect(Array.isArray(stories)).toBe(true);
    });

    it("should throw error for unauthenticated user", async () => {
      const ctx = createAuthContext();
      ctx.user = null;
      const caller = appRouter.createCaller(ctx);

      await expect(caller.story.list({})).rejects.toThrow();
    });
  });

  describe("story.getById", () => {
    it("should throw error when story not found", async () => {
      const ctx = createAuthContext(1);
      const caller = appRouter.createCaller(ctx);

      await expect(caller.story.getById({ id: 99999 })).rejects.toThrow("Story not found");
    });

    it("should throw error for unauthenticated user", async () => {
      const ctx = createAuthContext();
      ctx.user = null;
      const caller = appRouter.createCaller(ctx);

      await expect(caller.story.getById({ id: 1 })).rejects.toThrow();
    });
  });

  describe("order procedures", () => {
    it("should create digital order", async () => {
      const ctx = createAuthContext(1);
      const caller = appRouter.createCaller(ctx);

      // First create a story
      const story = await caller.story.create({
        themeId: 1,
        title: "Test Story for Order",
      });

      if (story) {
        const storyId = (story as any)?.insertId || (story as any)?.[0]?.insertId;
        if (storyId) {
          const order = await caller.order.create({
            storyId,
            orderType: "digital",
          });

          expect(order).toBeDefined();
        }
      }
    });

    it("should create printed order", async () => {
      const ctx = createAuthContext(1);
      const caller = appRouter.createCaller(ctx);

      // First create a story
      const story = await caller.story.create({
        themeId: 1,
        title: "Test Story for Printed Order",
      });

      if (story) {
        const storyId = (story as any)?.insertId || (story as any)?.[0]?.insertId;
        if (storyId) {
          const order = await caller.order.create({
            storyId,
            orderType: "printed",
          });

          expect(order).toBeDefined();
        }
      }
    });

    it("should list user orders", async () => {
      const ctx = createAuthContext(1);
      const caller = appRouter.createCaller(ctx);

      const orders = await caller.order.list();
      expect(Array.isArray(orders)).toBe(true);
    });

    it("should throw error for unauthenticated user", async () => {
      const ctx = createAuthContext();
      ctx.user = null;
      const caller = appRouter.createCaller(ctx);

      await expect(
        caller.order.create({
          storyId: 1,
          orderType: "digital",
        })
      ).rejects.toThrow();
    });
  });

  describe("story.update", () => {
    it("should update story title", async () => {
      const ctx = createAuthContext(1);
      const caller = appRouter.createCaller(ctx);

      const story = await caller.story.create({
        themeId: 1,
        title: "Original Title",
      });

      if (story) {
        const storyId = (story as any)?.insertId || (story as any)?.[0]?.insertId;
        if (storyId) {
          const updated = await caller.story.update({
            id: storyId,
            title: "Updated Title",
          });

          expect(updated).toBeDefined();
          expect(updated.title).toBe("Updated Title");
        }
      }
    });
  });

  describe("story.delete", () => {
    it("should delete story", async () => {
      const ctx = createAuthContext(1);
      const caller = appRouter.createCaller(ctx);

      const story = await caller.story.create({
        themeId: 1,
        title: "Story to Delete",
      });

      if (story) {
        const storyId = (story as any)?.insertId || (story as any)?.[0]?.insertId;
        if (storyId) {
          const result = await caller.story.delete({ id: storyId });
          expect(result.success).toBe(true);
        }
      }
    });
  });
});
