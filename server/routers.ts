import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router, protectedProcedure } from "./_core/trpc";
import { z } from "zod";

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  story: router({
    themes: publicProcedure.query(async () => {
      const { getStoryThemes } = await import("./db");
      return getStoryThemes();
    }),

    childProfiles: protectedProcedure.query(async ({ ctx }) => {
      const { getChildProfiles } = await import("./db");
      return getChildProfiles(ctx.user.id);
    }),

    createChildProfile: protectedProcedure
      .input(z.object({ name: z.string(), age: z.number(), gender: z.string().optional() }))
      .mutation(async ({ ctx, input }) => {
        const { createChildProfile } = await import("./db");
        return createChildProfile(ctx.user.id, input.name, input.age, input.gender);
      }),

    create: protectedProcedure
      .input(z.object({
        themeId: z.number(),
        title: z.string(),
        childProfileId: z.number().optional(),
        kidImageUrl: z.string().optional(),
        isGiftStory: z.boolean().optional(),
        giftRecipientName: z.string().optional(),
        giftRecipientAge: z.number().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const { createStory } = await import("./db");
        return createStory(ctx.user.id, input.themeId, input.title, input.childProfileId, input.isGiftStory, input.kidImageUrl);
      }),

    uploadKidImage: protectedProcedure
      .input(z.object({
        storyId: z.number(),
        imageBase64: z.string(),
      }))
      .mutation(async ({ ctx, input }) => {
        const { getStoryById, updateStoryKidImage } = await import("./db");
        const { storagePut } = await import("./storage");

        const story = await getStoryById(input.storyId);
        if (!story || story.userId !== ctx.user.id) {
          throw new Error("Story not found");
        }

        const buffer = Buffer.from(input.imageBase64, 'base64');
        const fileKey = `stories/${ctx.user.id}/${input.storyId}/kid-image-${Date.now()}.jpg`;
        const { url } = await storagePut(fileKey, buffer, 'image/jpeg');
        
        // Persist the URL to the database
        await updateStoryKidImage(input.storyId, url);
        
        return { url };
      }),

    list: protectedProcedure
      .input(z.object({
        themeId: z.number().optional(),
        status: z.enum(["draft", "generated", "preview", "published"]).optional(),
        search: z.string().optional(),
      }))
      .query(async ({ ctx, input }) => {
        const { getUserStories } = await import("./db");
        let stories = await getUserStories(ctx.user.id);

        // Apply filters
        if (input.themeId) {
          stories = stories.filter((s: any) => s.themeId === input.themeId);
        }
        if (input.status) {
          stories = stories.filter((s: any) => s.status === input.status);
        }
        if (input.search) {
          const searchLower = input.search.toLowerCase();
          stories = stories.filter((s: any) => s.title.toLowerCase().includes(searchLower));
        }

        return stories;
      }),

    getById: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ ctx, input }) => {
        const { getStoryById } = await import("./db");
        const story = await getStoryById(input.id);
        if (!story || story.userId !== ctx.user.id) {
          throw new Error("Story not found");
        }
        return story;
      }),

    generateContent: protectedProcedure
      .input(z.object({
        storyId: z.number(),
        childName: z.string(),
        childAge: z.number(),
        themeName: z.string(),
      }))
      .mutation(async ({ ctx, input }) => {
        const { getStoryById, updateStoryContent } = await import("./db");
        const { invokeLLM } = await import("./_core/llm");

        const story = await getStoryById(input.storyId);
        if (!story || story.userId !== ctx.user.id) {
          throw new Error("Story not found");
        }

        const prompt = `Create a personalized children's story for ${input.childName}, age ${input.childAge}, with theme: ${input.themeName}. 
        The story should be 3-4 pages long, engaging, age-appropriate, and feature ${input.childName} as the hero. 
        Include Indian values and cultural elements. Format as JSON with pages array containing title, content, and imagePrompt for each page.`;

        const response = await invokeLLM({
          messages: [
            { role: "system", content: "You are a creative children's story writer. Create engaging, personalized stories." },
            { role: "user", content: prompt },
          ],
          response_format: {
            type: "json_schema",
            json_schema: {
              name: "story_content",
              strict: true,
              schema: {
                type: "object",
                properties: {
                  pages: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        title: { type: "string" },
                        content: { type: "string" },
                        imagePrompt: { type: "string" },
                      },
                      required: ["title", "content", "imagePrompt"],
                    },
                  },
                },
                required: ["pages"],
                additionalProperties: false,
              },
            },
          },
        });

        const content = response.choices[0].message.content;
        const storyJson = JSON.parse(typeof content === 'string' ? content : '');
        const storyContent = storyJson.pages.map((p: any) => `${p.title}\n${p.content}`).join("\n\n");

        await updateStoryContent(input.storyId, storyContent, storyJson, "generated");
        return { storyJson, storyContent };
      }),

    generateIllustrations: protectedProcedure
      .input(z.object({ storyId: z.number() }))
      .mutation(async ({ ctx, input }) => {
        const { getStoryById, updateStoryIllustrations } = await import("./db");
        const { generateImage } = await import("./_core/imageGeneration");

        const story = await getStoryById(input.storyId);
        if (!story || story.userId !== ctx.user.id) {
          throw new Error("Story not found");
        }

        if (!story.storyJson) {
          throw new Error("Story content not generated yet");
        }

        const pages = (story.storyJson as any).pages || [];
        const illustrations = [];

        for (let i = 0; i < pages.length; i++) {
          const page = pages[i];
          try {
            let imagePrompt = page.imagePrompt;
            
            // Include kid's image reference if available
            if (story.kidImageUrl) {
              imagePrompt = `${imagePrompt}. Include a photo of the child from this image in the scene: ${story.kidImageUrl}`;
            }
            
            const { url } = await generateImage({ prompt: imagePrompt });
            illustrations.push({ pageIndex: i, url, prompt: imagePrompt });
          } catch (error) {
            console.error(`Failed to generate image for page ${i}:`, error);
          }
        }

        await updateStoryIllustrations(input.storyId, illustrations);
        return illustrations;
      }),

    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        title: z.string().optional(),
        themeId: z.number().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const { getStoryById, updateStory } = await import("./db");
        const story = await getStoryById(input.id);
        if (!story || story.userId !== ctx.user.id) {
          throw new Error("Story not found");
        }
        const updates: any = {};
        if (input.title !== undefined) updates.title = input.title;
        if (input.themeId !== undefined) updates.themeId = input.themeId;
        if (Object.keys(updates).length > 0) {
          await updateStory(input.id, updates);
        }
        return { ...story, ...updates };
      }),

    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ ctx, input }) => {
        const { getStoryById, deleteStory } = await import("./db");
        const story = await getStoryById(input.id);
        if (!story || story.userId !== ctx.user.id) {
          throw new Error("Story not found");
        }
        await deleteStory(input.id);
        return { success: true };
      }),
  }),

  order: router({
    create: protectedProcedure
      .input(z.object({
        storyId: z.number(),
        orderType: z.enum(["digital", "printed"]),
      }))
      .mutation(async ({ ctx, input }) => {
        const { getStoryById, createOrder } = await import("./db");

        const story = await getStoryById(input.storyId);
        if (!story || story.userId !== ctx.user.id) {
          throw new Error("Story not found");
        }

        const price = input.orderType === "digital" ? "199" : "499";
        return createOrder(ctx.user.id, input.storyId, input.orderType, price);
      }),

    list: protectedProcedure.query(async ({ ctx }) => {
      const { getUserOrders } = await import("./db");
      return getUserOrders(ctx.user.id);
    }),
  }),
});

export type AppRouter = typeof appRouter;
