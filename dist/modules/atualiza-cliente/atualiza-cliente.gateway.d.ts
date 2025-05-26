import { OnModuleInit } from '@nestjs/common';
import { MigrateApiService } from '../migrate-api/migrate-api.service';
export declare class AtualizaClienteGateway implements OnModuleInit {
    private server;
    private migrateApi;
    constructor(migrateApi: MigrateApiService);
    onModuleInit(): void;
}
