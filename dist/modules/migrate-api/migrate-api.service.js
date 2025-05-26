"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MigrateApiService = void 0;
const common_1 = require("@nestjs/common");
const schedule_1 = require("@nestjs/schedule");
const fs_1 = require("fs");
const path_1 = require("path");
const knex_1 = require("../../core/scripts/knex");
let MigrateApiService = class MigrateApiService {
    constructor() {
        this.connection = new knex_1.KnexConnection();
    }
    async atualizaTabelaCentral() {
        try {
            const baseDir = process.cwd();
            const migCentralDir = (0, path_1.join)(baseDir, 'src', 'core', 'migrations-knex');
            const knexCentral = await this.connection.conexao();
            const centralFiles = (0, fs_1.readdirSync)(migCentralDir)
                .filter((f) => f.endsWith('.js'))
                .sort();
            const appliedCentral = await knexCentral('knex_migrations').select('name');
            const appliedNames = appliedCentral.map((r) => r.name);
            const pendentesCentral = centralFiles.filter((f) => !appliedNames.includes(f));
            for (const nome of pendentesCentral) {
                await this.connection.makeMigration({
                    name: nome,
                    directory: migCentralDir,
                });
            }
            const clientes = await knexCentral
                .select('idempresa')
                .from('conexoes_clientes_cloud');
            const migClientesDir = migCentralDir;
            const clientFiles = (0, fs_1.readdirSync)(migClientesDir)
                .filter((f) => f.endsWith('.js'))
                .sort();
            for (const idempresa of clientes) {
                try {
                    const knexCliente = await this.connection.conexaoCliente(idempresa);
                    const historico = await knexCliente
                        .select('script')
                        .from('controle_versao');
                    const aplicados = historico.map((r) => r.script);
                    const arquivos = clientFiles.filter((f) => {
                        const versaoCli = Number(f.split('_')[0]);
                        return versaoCli >= 2 && !aplicados.includes(f);
                    });
                    for (const arq of arquivos) {
                        await knexCliente.migrate.up({
                            name: arq,
                            directory: migClientesDir,
                        });
                        const versaoCli = arq.split('_')[0];
                        await knexCliente('controle_versao')
                            .insert({
                            versao: versaoCli,
                            script: arq,
                            aplicado_em: new Date(),
                        })
                            .onConflict('script')
                            .merge({
                            versao: versaoCli,
                            aplicado_em: new Date(),
                        });
                        await knexCentral('versao_esperada_cliente')
                            .insert({
                            cliente_id: idempresa,
                            versao_instalada: versaoCli,
                            status_conexao: 'ativo',
                        })
                            .onConflict('cliente_id')
                            .merge({
                            versao_instalada: versaoCli,
                            status_conexao: 'ativo',
                        });
                    }
                }
                catch (err) {
                    console.error(`Erro ao migrar cliente ${idempresa.idempresa}: `, err);
                    await knexCentral('versao_esperada_cliente')
                        .update({ status_conexao: 'offline' })
                        .where({ cliente_id: idempresa })
                        .onConflict('cliente_id')
                        .merge({ status_conexao: 'offline' });
                }
            }
        }
        catch (error) {
            console.error('Erro ao atualizar tabela central: ', error);
            throw new Error('Erro ao atualizar tabela central: ' + error.message);
        }
    }
    async atualizaClienteEspecifico(idempresa) {
        try {
            const baseDir = process.cwd();
            const migCentralDir = (0, path_1.join)(baseDir, 'src', 'core', 'migrations-knex');
            const knexCentral = await this.connection.conexao();
            const clienteExiste = await knexCentral('conexoes_clientes_cloud')
                .where({ idempresa })
                .first();
            if (!clienteExiste) {
                throw new Error(`Cliente com ID ${idempresa} não encontrado`);
            }
            const clientFiles = (0, fs_1.readdirSync)(migCentralDir)
                .filter((f) => f.endsWith('.js'))
                .sort();
            try {
                const knexCliente = await this.connection.conexaoCliente(idempresa);
                const historico = await knexCliente
                    .select('script')
                    .from('controle_versao');
                const aplicados = historico.map((r) => r.script);
                const arquivos = clientFiles.filter((f) => {
                    const versaoCli = Number(f.split('_')[0]);
                    return versaoCli >= 2 && !aplicados.includes(f);
                });
                for (const arq of arquivos) {
                    await knexCliente.migrate.up({
                        name: arq,
                        directory: migCentralDir,
                    });
                    const versaoCli = arq.split('_')[0];
                    await knexCliente('controle_versao')
                        .insert({
                        versao: versaoCli,
                        script: arq,
                        aplicado_em: new Date(),
                    })
                        .onConflict('script')
                        .merge({
                        versao: versaoCli,
                        aplicado_em: new Date(),
                    });
                    await knexCentral('versao_esperada_cliente')
                        .insert({
                        cliente_id: idempresa,
                        versao_instalada: versaoCli,
                        status_conexao: 'ativo',
                    })
                        .onConflict('cliente_id')
                        .merge({
                        versao_instalada: versaoCli,
                        status_conexao: 'ativo',
                    });
                }
                console.log(`Cliente ${idempresa} atualizado com sucesso`);
                return {
                    success: true,
                    message: `Cliente ${idempresa} atualizado com sucesso`,
                };
            }
            catch (err) {
                console.error(`Erro ao migrar cliente ${idempresa}: `, err);
                await knexCentral('versao_esperada_cliente')
                    .update({ status_conexao: 'offline' })
                    .where({ cliente_id: idempresa })
                    .onConflict('cliente_id')
                    .merge({ status_conexao: 'offline' });
                throw new Error(`Erro ao atualizar cliente ${idempresa}: ${err.message}`);
            }
        }
        catch (error) {
            console.error(`Erro ao atualizar cliente específico ${idempresa}: `, error);
            throw new Error(`Erro ao atualizar cliente específico ${idempresa}: ${error.message}`);
        }
    }
};
exports.MigrateApiService = MigrateApiService;
__decorate([
    (0, schedule_1.Cron)(schedule_1.CronExpression.EVERY_DAY_AT_3AM),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], MigrateApiService.prototype, "atualizaTabelaCentral", null);
exports.MigrateApiService = MigrateApiService = __decorate([
    (0, common_1.Injectable)()
], MigrateApiService);
//# sourceMappingURL=migrate-api.service.js.map