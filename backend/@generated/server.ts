import { initTRPC } from "@trpc/server";
import { z } from "zod";

const t = initTRPC.create();
const publicProcedure = t.procedure;

const appRouter = t.router({
  user: t.router({
    create: publicProcedure.input(z.object({
      name: z.string(),
    })).mutation(async () => "PLACEHOLDER_DO_NOT_REMOVE" as any)
  }),
  projects: t.router({
    list: publicProcedure.query(async () => "PLACEHOLDER_DO_NOT_REMOVE" as any),
    get: publicProcedure.input(z.object({
      projectId: z.string(),
    })).query(async () => "PLACEHOLDER_DO_NOT_REMOVE" as any),
    create: publicProcedure.input(z.object({
      title: z.string(),
    })).mutation(async () => "PLACEHOLDER_DO_NOT_REMOVE" as any),
    updateTitle: publicProcedure.input(z.object({
      projectId: z.string(),
      title: z.string(),
      userId: z.string().optional(),
    })).mutation(async () => "PLACEHOLDER_DO_NOT_REMOVE" as any),
    uploadSTL: publicProcedure.input(z.object({
      projectId: z.string(),
      stlFile: z.string(), // Base64 encoded
      userId: z.string().optional(),
    })).mutation(async () => "PLACEHOLDER_DO_NOT_REMOVE" as any),
    addChatMessage: publicProcedure.input(z.object({
      projectId: z.string(),
      userId: z.string(),
      message: z.string(),
    })).mutation(async () => "PLACEHOLDER_DO_NOT_REMOVE" as any),
    addAnnotation: publicProcedure.input(z.object({
      projectId: z.string(),
      userId: z.string(),
      text: z.string(),
      vertex: z.object({
        x: z.number(),
        y: z.number(),
        z: z.number(),
      }),
    })).mutation(async () => "PLACEHOLDER_DO_NOT_REMOVE" as any),
    updateCamera: publicProcedure.input(z.object({
      projectId: z.string(),
      userId: z.string().optional(),
      position: z.object({
        x: z.number(),
        y: z.number(),
        z: z.number(),
      }),
      rotation: z.object({
        x: z.number(),
        y: z.number(),
        z: z.number(),
      }),
    })).mutation(async () => "PLACEHOLDER_DO_NOT_REMOVE" as any),
    updateModelTransform: publicProcedure.input(z.object({
      projectId: z.string(),
      userId: z.string().optional(),
      origin: z
        .object({
          x: z.number(),
          y: z.number(),
          z: z.number(),
        })
        .optional(),
      scale: z
        .object({
          x: z.number(),
          y: z.number(),
          z: z.number(),
        })
        .optional(),
      rotation: z
        .object({
          x: z.number(),
          y: z.number(),
          z: z.number(),
        })
        .optional(),
    })).mutation(async () => "PLACEHOLDER_DO_NOT_REMOVE" as any)
  })
});
export type AppRouter = typeof appRouter;

