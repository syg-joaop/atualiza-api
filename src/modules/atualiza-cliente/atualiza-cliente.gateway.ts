import * as ioClient from 'socket.io-client';
import { Injectable, OnModuleInit } from '@nestjs/common';
import { MigrateApiService } from '../migrate-api/migrate-api.service';
type ClientSocket = ioClient.Socket;
@Injectable()
export class AtualizaClienteGateway implements OnModuleInit {
  private server: ClientSocket;
  private migrateApi: MigrateApiService;

  constructor(migrateApi: MigrateApiService) {
    this.migrateApi = migrateApi;
  }

  onModuleInit() {
    const token = {
      data: [{ nomegeral: 'sagi-db-migration-web', homol: false }],
    };
    this.server = ioClient(process.env.URL_API_SAGI_V1, {
      transports: ['websocket'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 2000,
      query: { token: JSON.stringify(token) },
    });

    this.server.on('migration-cliente', (payload) => {
      this.migrateApi.atualizaClienteEspecifico(payload);
    });

    this.server.on('connect', () => {
      this.server.emit('migration-cliente');
    });

    this.server.on('connect_error', (err) =>
      console.error('[SAGI-DB-MIGRATION-WEB] ❌ Erro:', err.message),
    );
    this.server.on('disconnect', (reason) =>
      console.warn('[SAGI-DB-MIGRATION-WEB] 🔌 Desconectado:', reason),
    );
    this.server.on('reconnect_attempt', (n) =>
      console.warn('[SAGI-DB-MIGRATION-WEB] tentando reconnexão #', n),
    );
  }
}
