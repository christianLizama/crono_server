import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class TelegramService {
  constructor(private readonly configService: ConfigService) {}

  async sendPhoto(file: Express.Multer.File, caption?: string): Promise<any> {
    const token = this.configService.get<string>('TELEGRAM_BOT_TOKEN');
    const chatId = this.configService.get<string>('TELEGRAM_CHAT_ID');

    if (!token || !chatId) {
      throw new HttpException(
        'TELEGRAM_BOT_TOKEN o TELEGRAM_CHAT_ID no están configurados en las variables de entorno del servidor',
        HttpStatus.BAD_REQUEST,
      );
    }

    try {
      const formData = new FormData();
      formData.append('chat_id', chatId);
      if (caption) {
        formData.append('caption', caption);
      }

      const fileBlob = new Blob([file.buffer as unknown as BlobPart], {
        type: file.mimetype || 'image/png',
      });
      formData.append('photo', fileBlob, file.originalname || 'tiempos.png');

      const url = `https://api.telegram.org/bot${token}/sendPhoto`;
      const response = await fetch(url, {
        method: 'POST',
        body: formData,
      });

      const resData = await response.json();
      if (!response.ok || !resData.ok) {
        throw new Error(
          resData.description || 'Error en la respuesta de Telegram API',
        );
      }

      return resData;
    } catch (error: any) {
      throw new HttpException(
        error.message || 'Error al conectar con la API de Telegram',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
