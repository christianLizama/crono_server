import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Corredor, CorredorSchema } from 'src/esquemas/corredor.schema';
import { CorredorService } from './corredor.service';
import { CorredorController } from './Controller/corredor.controller';
import { CorredoresGateway } from 'src/corredores/corredores.gateway';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: Corredor.name,
        schema: CorredorSchema,
      },
    ]),
  ],
  providers: [CorredorService, CorredoresGateway],
  controllers: [CorredorController],
})
export class CorredorModule {}
