import {
  Body,
  Controller,
  HttpException,
  HttpStatus,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { TelegramService } from './telegram.service';

@Controller('telegram')
export class TelegramController {
  constructor(private readonly telegramService: TelegramService) {}

  @Post('send-photo')
  @UseInterceptors(FileInterceptor('image'))
  async sendPhoto(
    @UploadedFile() file: Express.Multer.File,
    @Body('caption') caption?: string,
  ) {
    if (!file) {
      throw new HttpException(
        'Se requiere un archivo de imagen (image)',
        HttpStatus.BAD_REQUEST,
      );
    }
    const result = await this.telegramService.sendPhoto(file, caption);
    return {
      message: 'Foto enviada a Telegram exitosamente',
      data: result,
    };
  }
}
