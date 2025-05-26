import knex from 'knex';
import { IClienteDb } from '../interfaces/cliente.interface';
import { IMigration } from '../interfaces/migration.interface';
export declare class KnexConnection {
    private connection;
    private createKnex;
    conexao(clienteDb?: IClienteDb): Promise<knex.Knex>;
    conexaoCliente(idEmpresa: number): Promise<knex.Knex<any, any[]>>;
    makeMigration(migration: IMigration): Promise<any>;
}
