import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CorredorModule } from 'src/corredor/corredor.module';
<<<<<<< Updated upstream
import { CorredoresGateway } from './corredores/corredores.gateway';
=======
<<<<<<< Updated upstream
=======
<<<<<<< Updated upstream
import { CorredoresGateway } from './corredores/corredores.gateway';
=======
<<<<<<< Updated upstream
>>>>>>> Stashed changes
>>>>>>> Stashed changes
>>>>>>> Stashed changes

=======
import { CorredoresGateway } from './corredores/corredores.gateway';
import { ConfigModule } from '@nestjs/config';
console.log(
  `mongodb://${process.env.MONGO_USERNAME}:${process.env.MONGO_PASSWORD}` +
    `@${process.env.MONGO_HOST}:${process.env.MONGO_PORT}/${process.env.MONGO_DATABASE}` +
    `?authSource=admin&retryWrites=true&w=majority`,
);
>>>>>>> Stashed changes
@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: `.${process.env.NODE_ENV}.env`,
      isGlobal: true,
    }),
    MongooseModule.forRoot(
      `mongodb://${process.env.MONGO_USERNAME}:${process.env.MONGO_PASSWORD}` +
        `@${process.env.MONGO_HOST}:${process.env.MONGO_PORT}/${process.env.MONGO_DATABASE}` +
        `?authSource=admin&retryWrites=true&w=majority`,
    ),
    CorredorModule,
  ],
  controllers: [],
  providers: [CorredoresGateway],
})
export class AppModule {}
