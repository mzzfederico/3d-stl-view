import { z } from 'zod';

// User schemas
export const createUserSchema = z.object({
  name: z.string(),
});

// Project schemas
export const getProjectSchema = z.object({
  projectId: z.string(),
});

export const createProjectSchema = z.object({
  projectName: z.string(),
});

export const uploadSTLSchema = z.object({
  projectId: z.string(),
  stlFile: z.string(), // Base64 encoded
});

export const addChatMessageSchema = z.object({
  projectId: z.string(),
  userId: z.string(),
  message: z.string(),
});

export const addAnnotationSchema = z.object({
  projectId: z.string(),
  userId: z.string(),
  text: z.string(),
  vertex: z.object({
    x: z.number(),
    y: z.number(),
    z: z.number(),
  }),
});

export const updateCameraSchema = z.object({
  projectId: z.string(),
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
});

export const checkProjectUpdatesSchema = z.object({
  projectId: z.string(),
  since: z.date().optional(), // Timestamp of last update check
});
