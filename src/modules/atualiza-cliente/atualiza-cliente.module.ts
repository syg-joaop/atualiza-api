import { Module } from '@nestjs/common';
import { AtualizaClienteGateway } from './atualiza-cliente.gateway';
import migrateApi from 'src/core/scripts/migrate-api';



@Module({
  providers: [AtualizaClienteGateway, migrateApi],
})
export class AtualizaClienteModule { }
