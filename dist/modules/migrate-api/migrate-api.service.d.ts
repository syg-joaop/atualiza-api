export declare class MigrateApiService {
    private connection;
    atualizaTabelaCentral(): Promise<void>;
    atualizaClienteEspecifico(idempresa: number): Promise<{
        success: boolean;
        message: string;
    }>;
}
