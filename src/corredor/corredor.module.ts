import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Corredor, CorredorSchema } from 'src/esquemas/corredor.schema';
import { CorredorService } from './corredor.service';
import { CorredorController } from './Controller/corredor.controller';
import { FirebaseModule } from 'src/firebase/firebase.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: Corredor.name,
        schema: CorredorSchema,
      },
    ]),
    FirebaseModule,
  ],
  providers: [CorredorService],
  controllers: [CorredorController],
})
export class CorredorModule {}
