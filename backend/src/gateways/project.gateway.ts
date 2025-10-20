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

    this.eventsService.on('projectUpdate', (event: ProjectUpdateEvent) => {
      Logger.log(`Project ${event.projectId} updated by user ${event.userId}`);

      void this.server
        .in(`project:${event.projectId}`)
        .fetchSockets()
        .then((sockets) => {
          sockets.forEach((socket) => {
            socket.emit('projectUpdate', event);
          });
        })
        .catch((error) => {
          Logger.error(
            `Error fetching sockets for project ${event.projectId}: ${error}`,
          );
        });
    });
  }

  handleConnection(client: Socket) {
    Logger.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    Logger.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('subscribeToProject')
  handleSubscribeToProject(
    client: Socket,
    payload: { projectId: string; userId?: string },
  ) {
    const { projectId, userId } = payload;

    // Store userId in socket data if provided
    if (userId) {
      (client.data as Record<string, string>).userId = userId;
    }

    client.join(`project:${projectId}`);
    return { success: true };
  }

  @SubscribeMessage('unsubscribeFromProject')
  handleUnsubscribeFromProject(client: Socket, projectId: string) {
    client.leave(`project:${projectId}`);
    return { success: true };
  }
}
