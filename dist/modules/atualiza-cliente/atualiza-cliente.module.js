"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AtualizaClienteModule = void 0;
const common_1 = require("@nestjs/common");
const atualiza_cliente_gateway_1 = require("./atualiza-cliente.gateway");
const migrate_api_service_1 = require("../migrate-api/migrate-api.service");
let AtualizaClienteModule = class AtualizaClienteModule {
};
exports.AtualizaClienteModule = AtualizaClienteModule;
exports.AtualizaClienteModule = AtualizaClienteModule = __decorate([
    (0, common_1.Module)({
        providers: [atualiza_cliente_gateway_1.AtualizaClienteGateway, migrate_api_service_1.MigrateApiService],
    })
], AtualizaClienteModule);
//# sourceMappingURL=atualiza-cliente.module.js.map