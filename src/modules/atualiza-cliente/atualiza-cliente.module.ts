import { Module } from '@nestjs/common';
import { AtualizaClienteGateway } from './atualiza-cliente.gateway';
import { MigrateApiService } from '../migrate-api/migrate-api.service';

@Module({
  providers: [AtualizaClienteGateway, MigrateApiService],
})
export class AtualizaClienteModule {}
