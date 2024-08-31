import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CorredorModule } from 'src/corredor/corredor.module';
import { CorredoresGateway } from './corredores/corredores.gateway';

@Module({
  imports: [
    MongooseModule.forRoot('mongodb://127.0.0.1/cronometro'),
    CorredorModule,
  ],
  controllers: [],
  providers: [CorredoresGateway],
})
export class AppModule {}
