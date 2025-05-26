"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const testing_1 = require("@nestjs/testing");
const migrate_api_service_1 = require("./migrate-api.service");
describe('MigrateApiService', () => {
    let service;
    beforeEach(async () => {
        const module = await testing_1.Test.createTestingModule({
            providers: [migrate_api_service_1.MigrateApiService],
        }).compile();
        service = module.get(migrate_api_service_1.MigrateApiService);
    });
    it('should be defined', () => {
        expect(service).toBeDefined();
    });
});
//# sourceMappingURL=migrate-api.service.spec.js.map