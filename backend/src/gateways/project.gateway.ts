import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayInit,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { EventsService, ProjectUpdateEvent } from '../services/events.service';
import { Logger } from '@nestjs/common';

@WebSocketGateway({
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
  },
})
export class ProjectGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  constructor(private readonly eventsService: EventsService) {}

  afterInit() {
    Logger.log('WebSocket Gateway initialized');

    this.eventsService.on('projectUpdate', (event: ProjectUpdateEvent) => {
      Logger.log(`Project ${event.projectId} updated`);
      this.server.to(`project:${event.projectId}`).emit('projectUpdate', event);
    });
  }

  handleConnection(client: Socket) {
    Logger.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    Logger.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('subscribeToProject')
  handleSubscribeToProject(client: Socket, projectId: string) {
    client.join(`project:${projectId}`);
    Logger.log(`Client ${client.id} subscribed to project ${projectId}`);
    return { success: true };
  }

  @SubscribeMessage('unsubscribeFromProject')
  handleUnsubscribeFromProject(client: Socket, projectId: string) {
    client.leave(`project:${projectId}`);
    Logger.log(`Client ${client.id} unsubscribed from project ${projectId}`);
    return { success: true };
  }
}
