import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayInit,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  MessageBody,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';
import { UserService } from '../services/user.service';

@WebSocketGateway({
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
  },
})
export class UserGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  // Map to track userId per socket
  private socketUserMap = new Map<string, string>();

  constructor(private readonly userService: UserService) {}

  afterInit() {
    Logger.log('User Gateway initialized');
  }

  handleConnection(client: Socket) {
    Logger.log(`Client connected: ${client.id}`);

    // Check if client is reconnecting with existing userId
    const existingUserId = (client.handshake.auth?.userId as string) ?? null;
    const userId = existingUserId || this.generateUserId();

    // Store userId in socket data and our map
    (client.data as Record<string, string>).userId = userId;
    this.socketUserMap.set(client.id, userId);

    // Send userId back to client
    client.emit('userId', userId);
    Logger.log(`Assigned userId ${userId} to client ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    const userId = this.socketUserMap.get(client.id);
    Logger.log(`Client disconnected: ${client.id} (userId: ${userId})`);
    this.socketUserMap.delete(client.id);
  }

  @SubscribeMessage('setUserName')
  async handleSetUserName(
    @MessageBody() data: { userId: string; userName: string },
  ) {
    const { userId, userName } = data;
    Logger.log(`Setting userName for ${userId}: ${userName}`);

    try {
      // Create or update user in database
      await this.userService.createOrUpdateUser(userId, userName);
      Logger.log(`Successfully saved userName for ${userId}`);
    } catch (error) {
      Logger.error(`Failed to save userName for ${userId}:`, error);
    }
  }

  /**
   * Get userId for a given socket ID
   */
  getUserIdBySocketId(socketId: string): string | undefined {
    return this.socketUserMap.get(socketId);
  }

  /**
   * Generate a unique user ID
   */
  private generateUserId(): string {
    return `user_${Math.random().toString(36).substring(2, 15)}_${Date.now()}`;
  }
}
