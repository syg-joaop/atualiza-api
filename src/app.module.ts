import { Module } from "@nestjs/common";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { ConfigModule } from "@nestjs/config";
import { AtualizaClienteModule } from "./modules/atualiza-cliente/atualiza-cliente.module";
import { ScheduleModule } from "@nestjs/schedule";
import { MigrateApiService } from "./modules/migrate-api/migrate-api.service";
@Module({
  imports: [
    AtualizaClienteModule,
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: [".env"],
    }),
    ScheduleModule.forRoot(),
  ],
  controllers: [AppController],
  providers: [AppService, MigrateApiService],
})
export class AppModule {}
