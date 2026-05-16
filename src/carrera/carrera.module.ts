import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Carrera, CarreraSchema } from 'src/esquemas/carrera.schema';
import { Corredor, CorredorSchema } from 'src/esquemas/corredor.schema';
import { CarreraService } from './carrera.service';
import { CarreraController } from './carrera.controller';
import { CorredoresModule } from 'src/corredores/corredores.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Carrera.name, schema: CarreraSchema },
      { name: Corredor.name, schema: CorredorSchema },
    ]),
    CorredoresModule,
  ],
  providers: [CarreraService],
  controllers: [CarreraController],
  exports: [CarreraService],
})
export class CarreraModule {}
