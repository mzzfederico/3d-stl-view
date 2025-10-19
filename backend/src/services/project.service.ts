import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Project, Vector3 } from '../schemas/project.schema';
import { EventsService } from './events.service';
import { UserService } from './user.service';

@Injectable()
export class ProjectService {
  constructor(
    @InjectModel(Project.name) private projectModel: Model<Project>,
    private eventsService: EventsService,
    private userService: UserService,
  ) {}

  async listProjects(): Promise<Project[]> {
    return this.projectModel
      .find()
      .select('projectId projectName createdAt updatedAt')
      .exec();
  }

  async getProject(projectId: string): Promise<any> {
    const project = await this.projectModel.findOne({ projectId }).exec();

    if (!project) {
      return null;
    }

    // Collect all unique userIds from chatLog and annotations
    const userIds = new Set<string>();
    project.chatLog?.forEach((log) => userIds.add(log.userId));
    project.annotations?.forEach((annotation) => userIds.add(annotation.userId));

    // Fetch user names for all userIds
    const userMap = await this.userService.getUsersByIds(Array.from(userIds));

    // Map userIds to userNames in the response
    const projectWithNames = project.toObject();

    if (projectWithNames.chatLog) {
      projectWithNames.chatLog = projectWithNames.chatLog.map((log) => ({
        ...log,
        userName: userMap.get(log.userId) || log.userId,
      }));
    }

    if (projectWithNames.annotations) {
      projectWithNames.annotations = projectWithNames.annotations.map((annotation) => ({
        ...annotation,
        userName: userMap.get(annotation.userId) || annotation.userId,
      }));
    }

    return projectWithNames;
  }

  async createProject(projectName: string): Promise<{ projectId: string }> {
    const projectId = Math.random().toString(36).substring(2, 15);

    const project = new this.projectModel({
      projectId,
      projectName,
      chatLog: [],
      annotations: [],
      camera: {
        position: { x: 0, y: 0, z: 5 },
        rotation: { x: 0, y: 0, z: 0 },
      },
      modelTransform: {
        origin: { x: 0, y: 0, z: 0 },
        scale: { x: 1, y: 1, z: 1 },
        rotation: { x: 0, y: 0, z: 0 },
      },
    });

    await project.save();

    return { projectId };
  }

  async uploadSTL(
    projectId: string,
    stlFile: string,
    userId?: string,
  ): Promise<{ success: boolean }> {
    const result = await this.projectModel
      .updateOne({ projectId }, { $set: { stlFile } })
      .exec();

    if (result.modifiedCount > 0) {
      this.eventsService.emitProjectUpdate({
        projectId,
        type: 'stl',
        timestamp: new Date(),
        userId,
      });
    }

    return { success: result.modifiedCount > 0 };
  }

  async addChatMessage(
    projectId: string,
    userId: string,
    message: string,
  ): Promise<{ success: boolean }> {
    const result = await this.projectModel
      .updateOne(
        { projectId },
        {
          $push: {
            chatLog: {
              userId,
              message,
              timestamp: new Date(),
            },
          },
        },
      )
      .exec();

    if (result.modifiedCount > 0) {
      this.eventsService.emitProjectUpdate({
        projectId,
        type: 'chat',
        timestamp: new Date(),
      });
    }

    return { success: result.modifiedCount > 0 };
  }

  async addAnnotation(
    projectId: string,
    userId: string,
    text: string,
    vertex: { x: number; y: number; z: number },
  ): Promise<{ success: boolean }> {
    const result = await this.projectModel
      .updateOne(
        { projectId },
        {
          $push: {
            annotations: {
              text,
              userId,
              vertex,
              timestamp: new Date(),
            },
          },
        },
      )
      .exec();

    if (result.modifiedCount > 0) {
      this.eventsService.emitProjectUpdate({
        projectId,
        type: 'annotation',
        timestamp: new Date(),
      });
    }

    return { success: result.modifiedCount > 0 };
  }

  async updateCamera(
    projectId: string,
    position: { x: number; y: number; z: number },
    rotation: { x: number; y: number; z: number },
    userId?: string,
  ): Promise<{ success: boolean }> {
    const result = await this.projectModel
      .updateOne(
        { projectId },
        {
          $set: {
            camera: {
              position,
              rotation,
            },
          },
        },
      )
      .exec();

    if (result.modifiedCount > 0) {
      this.eventsService.emitProjectUpdate({
        projectId,
        type: 'camera',
        timestamp: new Date(),
        userId,
      });
    }

    return { success: result.modifiedCount > 0 };
  }

  async updateModelTransform(
    projectId: string,
    origin?: { x: number; y: number; z: number },
    scale?: { x: number; y: number; z: number },
    rotation?: { x: number; y: number; z: number },
    userId?: string,
  ): Promise<{ success: boolean }> {
    const updateFields: Record<string, Vector3> = {};

    if (origin) {
      updateFields['modelTransform.origin'] = origin;
    }
    if (scale) {
      updateFields['modelTransform.scale'] = scale;
    }
    if (rotation) {
      updateFields['modelTransform.rotation'] = rotation;
    }

    const result = await this.projectModel
      .updateOne({ projectId }, { $set: updateFields })
      .exec();

    if (result.modifiedCount > 0) {
      this.eventsService.emitProjectUpdate({
        projectId,
        type: 'modelTransform',
        timestamp: new Date(),
        userId,
      });
    }

    return { success: result.modifiedCount > 0 };
  }
}
