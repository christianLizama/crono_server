import { Test, TestingModule } from '@nestjs/testing';
import { CorredoresGateway } from './corredores.gateway';

describe('CorredoresGateway', () => {
  let gateway: CorredoresGateway;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CorredoresGateway],
    }).compile();

    gateway = module.get<CorredoresGateway>(CorredoresGateway);
  });

  it('should be defined', () => {
    expect(gateway).toBeDefined();
  });
});
