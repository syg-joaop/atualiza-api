import knex from 'knex';
import { IClienteDb } from '../interfaces/cliente.interface';
import { IMigration } from '../interfaces/migration.interface';

export class KnexConnection {
  private connection: knex.Knex;

  /**
   *? Cria uma instância do Knex com as configurações de conexão.
   * @param clienteDb - Objeto contendo as informações do cliente.
   * @returns Uma instância do Knex configurada para o banco de dados.
   */
  private createKnex(clienteDb?: IClienteDb): knex.Knex {
    return knex({
      client: 'pg',
      connection: {
        host: clienteDb?.host ?? process.env.DB_HOST,
        port: clienteDb?.port ?? Number(process.env.DB_PORT),
        user: clienteDb?.user ?? process.env.DB_USER,
        database: clienteDb?.database ?? process.env.DB_NAME,
        password: clienteDb?.password ?? process.env.DB_PASS,
      },
    });
  }

  /**
   *? Cria uma conexão com o banco de dados.
   * @param clienteDb - Objeto contendo as informações do cliente.
   * @returns Uma instância do Knex conectada ao banco de dados.
   */

  public async conexao(clienteDb?: IClienteDb): Promise<knex.Knex> {
    if (clienteDb) return this.createKnex(clienteDb);
    if (!this.connection) this.connection = this.createKnex();

    return this.connection;
  }

  /**
   *? Cria uma conexão com o banco de dados do cliente.
   * @param idEmpresa - ID da empresa para a qual se deseja criar a conexão.
   * @returns
   */
  public async conexaoCliente(idEmpresa: number) {
    try {
      const knex = await this.conexao();
      const clienteDb = await knex('conexoes_clientes_cloud')
        .where({ idempresa: idEmpresa })
        .first();

      if (!clienteDb) throw new Error('Cliente não encontrado');

      return this.createKnex(clienteDb);
    } catch (error) {
      console.error('Erro ao criar conexão com o cliente:', error);
      throw new Error('Erro ao criar conexão com o cliente: ' + error.message);
    }
  }

  /**
   *? Atualiza a tabela central de migrações.
   * @param migration - Objeto contendo as informações da migração.
   * @returns O resultado da migração.
   */
  public async makeMigration(migration: IMigration) {
    try {
      const { name, directory } = migration;

      const knex = await this.conexao();
      const migrate = await knex.migrate.up({
        name: name,
        directory: directory,
      });

      return migrate;
    } catch (error) {
      console.error('Erro ao atualizar tabela central:', error);
      throw new Error('Erro ao atualizar tabela central: ' + error.message);
    }
  }
}
