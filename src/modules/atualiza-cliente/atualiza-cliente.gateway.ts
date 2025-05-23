import { Server, Socket } from 'socket.io';
import { Injectable, OnModuleInit } from '@nestjs/common';
import migrateApi from 'src/core/scripts/migrate-api';
@Injectable()
export class AtualizaClienteGateway implements OnModuleInit {

  private server: Server;
  private migrateApi: migrateApi;

  constructor(migrateApi: migrateApi) {
    this.migrateApi = migrateApi;
  }

  onModuleInit() {
    this.server = new Server(3001, {
      cors: { origin: '*' },
      path: '/atualiza-cliente',
    });

    this.server.on('connection', (socket: Socket) => {
      console.log('Cliente conectado:', socket.id);

      socket.on('migration-tb-central', () => {
        this.migrateApi.atualizaTabelaCentral()
      });

      socket.on('migration-clientes', (payload) => {

      })

      socket.on('disconnect', () => {
        console.log('Cliente desconectado:', socket.id);
      });
    });

    console.log('Socket.io Gateway de migração iniciado na porta 3001');
  }
}