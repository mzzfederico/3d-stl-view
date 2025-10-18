import { Injectable } from '@nestjs/common';
import { Router, Query, Mutation, Input } from 'nestjs-trpc';
import {
  createUserSchema,
  getProjectSchema,
  createProjectSchema,
  uploadSTLSchema,
  addChatMessageSchema,
  addAnnotationSchema,
  updateCameraSchema,
} from './trpc.schemas';
import { UserService } from '../services/user.service';
import { ProjectService } from '../services/project.service';
import { z } from 'zod';

@Injectable()
@Router({ alias: 'user' })
export class UserRouter {
  constructor(private readonly userService: UserService) {}

  @Mutation({ input: createUserSchema })
  async create(@Input() input: z.infer<typeof createUserSchema>) {
    return this.userService.createUser(input.name);
  }
}

@Injectable()
@Router({ alias: 'projects' })
export class ProjectsRouter {
  constructor(private readonly projectService: ProjectService) {}

  @Query()
  async list() {
    return this.projectService.listProjects();
  }

  @Query({ input: getProjectSchema })
  async get(@Input() input: z.infer<typeof getProjectSchema>) {
    return this.projectService.getProject(input.projectId);
  }

  @Mutation({ input: createProjectSchema })
  async create(@Input() input: z.infer<typeof createProjectSchema>) {
    return this.projectService.createProject(input.projectName);
  }

  @Mutation({ input: uploadSTLSchema })
  async uploadSTL(@Input() input: z.infer<typeof uploadSTLSchema>) {
    return this.projectService.uploadSTL(input.projectId, input.stlFile);
  }

  @Mutation({ input: addChatMessageSchema })
  async addChatMessage(@Input() input: z.infer<typeof addChatMessageSchema>) {
    return this.projectService.addChatMessage(
      input.projectId,
      input.userId,
      input.message,
    );
  }

  @Mutation({ input: addAnnotationSchema })
  async addAnnotation(@Input() input: z.infer<typeof addAnnotationSchema>) {
    return this.projectService.addAnnotation(
      input.projectId,
      input.userId,
      input.text,
      input.vertex,
    );
  }

  @Mutation({ input: updateCameraSchema })
  async updateCamera(@Input() input: z.infer<typeof updateCameraSchema>) {
    return this.projectService.updateCamera(
      input.projectId,
      input.position,
      input.rotation,
    );
  }
}
