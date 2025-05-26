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
exports.AtualizaClienteGateway = void 0;
const ioClient = require("socket.io-client");
const common_1 = require("@nestjs/common");
const migrate_api_service_1 = require("../migrate-api/migrate-api.service");
let AtualizaClienteGateway = class AtualizaClienteGateway {
    constructor(migrateApi) {
        this.migrateApi = migrateApi;
    }
    onModuleInit() {
        const token = {
            data: [{ nomegeral: 'sagi-db-migration-web', homol: false }],
        };
        this.server = ioClient(process.env.URL_API_SAGI_V1, {
            transports: ['websocket'],
            reconnection: true,
            reconnectionAttempts: 5,
            reconnectionDelay: 2000,
            query: { token: JSON.stringify(token) },
        });
        this.server.on('migration-cliente', (payload) => {
            this.migrateApi.atualizaClienteEspecifico(payload);
        });
        this.server.on('connect', () => {
            this.server.emit('migration-cliente');
        });
        this.server.on('connect_error', (err) => console.error('[SAGI-DB-MIGRATION-WEB] ❌ Erro:', err.message));
        this.server.on('disconnect', (reason) => console.warn('[SAGI-DB-MIGRATION-WEB] 🔌 Desconectado:', reason));
        this.server.on('reconnect_attempt', (n) => console.warn('[SAGI-DB-MIGRATION-WEB] tentando reconnexão #', n));
    }
};
exports.AtualizaClienteGateway = AtualizaClienteGateway;
exports.AtualizaClienteGateway = AtualizaClienteGateway = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [migrate_api_service_1.MigrateApiService])
], AtualizaClienteGateway);
//# sourceMappingURL=atualiza-cliente.gateway.js.map