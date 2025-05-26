import { Test, TestingModule } from '@nestjs/testing';
import { MigrateApiService } from './migrate-api.service';

describe('MigrateApiService', () => {
  let service: MigrateApiService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MigrateApiService],
    }).compile();

    service = module.get<MigrateApiService>(MigrateApiService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
