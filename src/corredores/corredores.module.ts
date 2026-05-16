import { Module } from '@nestjs/common';
import { CorredoresGateway } from './corredores.gateway';

@Module({
  providers: [CorredoresGateway],
  exports: [CorredoresGateway],
})
export class CorredoresModule {}
