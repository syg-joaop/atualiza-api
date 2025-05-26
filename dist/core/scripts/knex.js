"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.KnexConnection = void 0;
const knex_1 = require("knex");
class KnexConnection {
    createKnex(clienteDb) {
        return (0, knex_1.default)({
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
    async conexao(clienteDb) {
        if (clienteDb)
            return this.createKnex(clienteDb);
        if (!this.connection)
            this.connection = this.createKnex();
        return this.connection;
    }
    async conexaoCliente(idEmpresa) {
        try {
            const knex = await this.conexao();
            const clienteDb = await knex('conexoes_clientes_cloud')
                .where({ idempresa: idEmpresa })
                .first();
            if (!clienteDb)
                throw new Error('Cliente não encontrado');
            return this.createKnex(clienteDb);
        }
        catch (error) {
            console.error('Erro ao criar conexão com o cliente:', error);
            throw new Error('Erro ao criar conexão com o cliente: ' + error.message);
        }
    }
    async makeMigration(migration) {
        try {
            const { name, directory } = migration;
            const knex = await this.conexao();
            const migrate = await knex.migrate.up({
                name: name,
                directory: directory,
            });
            return migrate;
        }
        catch (error) {
            console.error('Erro ao atualizar tabela central:', error);
            throw new Error('Erro ao atualizar tabela central: ' + error.message);
        }
    }
}
exports.KnexConnection = KnexConnection;
//# sourceMappingURL=knex.js.map