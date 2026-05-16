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
    console.log('WebSocket Gateway Initialized');
  }

  handleConnection(client: Socket) {
    console.log('Client connected:', client.id);
  }

  handleDisconnect(client: Socket) {
    console.log('Client disconnected:', client.id);
  }

  // Evento legacy para compatibilidad con el sistema de tiempos individual
  @SubscribeMessage('updateTime')
  handleUpdateTime(
    @MessageBody()
    data: {
      numero: number;
      nombre: string;
      tiempo: number;
      team: string;
      rut: string;
    },
  ): void {
    console.log('updateTime received:', data);
    this.server.emit('updateTime', data);
  }

  // ─── Nuevos eventos para el sistema de carreras ────────────────

  /**
   * Emite una actualización completa de la carrera a todos los clientes.
   * Se usa después de cada operación que modifica el estado de la carrera.
   */
  emitCarreraUpdate(carrera: any): void {
    console.log(
      `[WS] carreraUpdate: ${carrera.nombre} (${carrera.fase} - ${carrera.estado})`,
    );
    this.server.emit('carreraUpdate', carrera);
  }

  /**
   * Escucha solicitudes de sincronización desde el cliente.
   * Útil cuando un cliente se reconecta y necesita el estado actual.
   */
  @SubscribeMessage('requestCarreraSync')
  handleCarreraSync(@MessageBody() data: { carreraId: string }): void {
    console.log('[WS] Sync requested for carrera:', data.carreraId);
    // El cliente solicitará la data vía HTTP, este evento es solo un trigger
    this.server.emit('carreraSyncRequest', data);
  }
}
