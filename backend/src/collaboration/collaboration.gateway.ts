import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  ConnectedSocket,
  MessageBody,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';

interface UserPresence {
  socketId: string;
  userId: string;
  userName: string;
  userColor: string;
  x: number;
  y: number;
  roomId: string;
}

@WebSocketGateway({
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
  namespace: 'collaboration',
})
export class CollaborationGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(CollaborationGateway.name);
  private roomUsers = new Map<string, Map<string, UserPresence>>();

  handleConnection(client: Socket) {
    this.logger.log(`Client connected to collaboration gateway: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
    // Clean up user from all rooms
    for (const [roomId, users] of this.roomUsers.entries()) {
      if (users.has(client.id)) {
        users.delete(client.id);
        client.to(roomId).emit('user-left', { socketId: client.id });
        this.broadcastRoomUsers(roomId);
      }
    }
  }

  @SubscribeMessage('join-room')
  handleJoinRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody()
    data: {
      roomId: string;
      userId: string;
      userName: string;
      userColor: string;
    },
  ) {
    const roomId = data.roomId || 'global';
    client.join(roomId);

    if (!this.roomUsers.has(roomId)) {
      this.roomUsers.set(roomId, new Map());
    }

    const presence: UserPresence = {
      socketId: client.id,
      userId: data.userId || client.id,
      userName: data.userName || `User-${client.id.slice(0, 4)}`,
      userColor: data.userColor || '#3b82f6',
      x: 0,
      y: 0,
      roomId,
    };

    this.roomUsers.get(roomId).set(client.id, presence);
    this.logger.log(`User ${presence.userName} joined room ${roomId}`);

    // Notify others in room
    client.to(roomId).emit('user-joined', presence);

    // Send existing users to this new client
    const existingUsers = Array.from(this.roomUsers.get(roomId).values());
    client.emit('room-users', existingUsers);
  }

  @SubscribeMessage('cursor-move')
  handleCursorMove(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { roomId: string; x: number; y: number },
  ) {
    const roomId = data.roomId || 'global';
    const room = this.roomUsers.get(roomId);
    if (room && room.has(client.id)) {
      const user = room.get(client.id);
      user.x = data.x;
      user.y = data.y;

      // Broadcast cursor coordinates to all other clients in this room
      client.to(roomId).emit('cursor-moved', {
        socketId: client.id,
        userName: user.userName,
        userColor: user.userColor,
        x: data.x,
        y: data.y,
      });
    }
  }

  @SubscribeMessage('element-update')
  handleElementUpdate(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { roomId: string; element: any; action: 'create' | 'update' | 'delete' },
  ) {
    const roomId = data.roomId || 'global';
    client.to(roomId).emit('element-updated', {
      element: data.element,
      action: data.action,
      fromSocketId: client.id,
    });
  }

  @SubscribeMessage('canvas-clear')
  handleCanvasClear(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { roomId: string },
  ) {
    const roomId = data.roomId || 'global';
    client.to(roomId).emit('canvas-cleared', { fromSocketId: client.id });
  }

  private broadcastRoomUsers(roomId: string) {
    const room = this.roomUsers.get(roomId);
    const users = room ? Array.from(room.values()) : [];
    this.server.to(roomId).emit('room-users', users);
  }
}
