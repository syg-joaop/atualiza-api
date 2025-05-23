import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { AtualizaClienteModule } from './modules/atualiza-cliente/atualiza-cliente.module';

@Module({
  imports: [
    AtualizaClienteModule,
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env'],
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})

export class AppModule {}
