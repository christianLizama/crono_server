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

@WebSocketGateway(81, {
  cors: { origin: '*' },
})
export class CorredoresGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  afterInit() {
    console.log('WebSocket Gateway Initialized in server:');
  }

  handleConnection(client: Socket) {
    console.log('Client connected:', client.id);
  }

  handleDisconnect(client: Socket) {
    console.log('Client disconnected:', client.id);
  }

  @SubscribeMessage('updateTime')
  emitUpdateTime(
    @MessageBody()
    data: {
      numero: number;
      nombre: string;
      tiempo: number;
      team: string;
      rut: string;
    },
  ): void {
    console.log('updateTime received in socket:', data);
    this.server.emit('updateTime', data); // Broadcast the update to all connected clients
  }
}
