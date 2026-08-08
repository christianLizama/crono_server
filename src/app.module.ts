import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CorredorModule } from 'src/corredor/corredor.module';
import { CarreraModule } from 'src/carrera/carrera.module';
import { CorredoresModule } from './corredores/corredores.module';
import { ConfigModule } from '@nestjs/config';

import { TelegramModule } from './telegram/telegram.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: `.${process.env.NODE_ENV}.env`,
      isGlobal: true,
    }),
    MongooseModule.forRootAsync({
      useFactory: () => {
        // 1. Si pasas una URI directamente en la consola (ej. set MONGO_URI=... && npm run start:dev)
        if (process.env.MONGO_URI) {
          return { uri: process.env.MONGO_URI };
        }

        // 2. Si corre dentro de Docker (gracias a la variable IS_DOCKER que pusimos en docker-compose)
        const isDocker = process.env.IS_DOCKER === 'true';
        if (isDocker) {
          return {
            // IMPORTANTE: Dentro de la red interna de Docker, el contenedor de mongo siempre
            // escucha en el puerto 27017, sin importar a qué puerto esté expuesto hacia el exterior (27018).
            uri: `mongodb://${process.env.MONGO_USERNAME}:${process.env.MONGO_PASSWORD}@${process.env.MONGO_HOST}:27017/${process.env.MONGO_DATABASE}?authSource=admin&retryWrites=true&w=majority`,
          };
        }

        // 3. Si corre en consola de Windows (local) sin variables extra, se conecta a la típica bd local
        return {
          uri: 'mongodb://127.0.0.1:27017/cronometro',
        };
      },
    }),
    CorredorModule,
    CarreraModule,
    CorredoresModule,
    TelegramModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
