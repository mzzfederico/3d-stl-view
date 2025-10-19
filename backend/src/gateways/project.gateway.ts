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
    Logger.log('Project Gateway initialized');

    this.eventsService.on('projectUpdate', async (event: ProjectUpdateEvent) => {
      Logger.log(`Project ${event.projectId} updated by user ${event.userId}`);

      if (event.userId) {
        // Broadcast to all clients in the project room except the user who triggered it
        const sockets = await this.server.in(`project:${event.projectId}`).fetchSockets();
        sockets.forEach(socket => {
          // Only emit if this socket doesn't belong to the user who triggered the event
          if (socket.data.userId !== event.userId) {
            socket.emit('projectUpdate', event);
          }
        });
      } else {
        // If no userId, broadcast to everyone (backward compatibility)
        this.server.to(`project:${event.projectId}`).emit('projectUpdate', event);
      }
    });
  }

  handleConnection(client: Socket) {
    Logger.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    Logger.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('subscribeToProject')
  handleSubscribeToProject(client: Socket, payload: { projectId: string; userId?: string }) {
    const { projectId, userId } = payload;

    // Store userId in socket data if provided
    if (userId) {
      client.data.userId = userId;
    }

    client.join(`project:${projectId}`);
    Logger.log(`Client ${client.id} (userId: ${client.data.userId}) subscribed to project ${projectId}`);
    return { success: true };
  }

  @SubscribeMessage('unsubscribeFromProject')
  handleUnsubscribeFromProject(client: Socket, projectId: string) {
    client.leave(`project:${projectId}`);
    Logger.log(`Client ${client.id} unsubscribed from project ${projectId}`);
    return { success: true };
  }
}
