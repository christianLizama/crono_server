import {
  Body,
  Controller,
  Post,
  Get,
  Delete,
  Param,
  HttpException,
  Patch,
  UsePipes,
  ValidationPipe,
  HttpStatus,
} from '@nestjs/common';
import { CorredorService } from '../corredor.service';
import { CreateCorredorDto } from 'src/dto/create-corredor.dto';
import { UpdateCorredorDto } from 'src/dto/update-corredor.dto';
import mongoose from 'mongoose';

@Controller('corredores')
export class CorredorController {
  constructor(private corredorService: CorredorService) {}

  @Post()
  @UsePipes(new ValidationPipe())
  async createCorredor(@Body() createCorredorDto: CreateCorredorDto) {
    const corredor =
      await this.corredorService.createCorredor(createCorredorDto);
    return {
      message: 'Corredor creado exitosamente',
      data: corredor,
    };
  }

  @Get()
  async getAllCorredores() {
    const corredores = await this.corredorService.findAll();
    return {
      message: 'Corredores obtenidos exitosamente',
      data: corredores,
    };
  }

  @Get(':id')
  async getCorredor(@Param('id') id: string) {
    const isValid = mongoose.Types.ObjectId.isValid(id);
    if (!isValid) {
      throw new HttpException('ID no válido', HttpStatus.BAD_REQUEST);
    }
    const corredor = await this.corredorService.findOne(id);
    if (!corredor) {
      throw new HttpException('Corredor no encontrado', HttpStatus.NOT_FOUND);
    }
    return {
      message: 'Corredor obtenido exitosamente',
      data: corredor,
    };
  }

  @Patch(':id')
  @UsePipes(new ValidationPipe())
  async updateCorredor(
    @Param('id') id: string,
    @Body() updateCorredorDto: UpdateCorredorDto,
  ) {
    const isValid = mongoose.Types.ObjectId.isValid(id);
    if (!isValid) {
      throw new HttpException('ID no válido', HttpStatus.BAD_REQUEST);
    }
    const corredor = await this.corredorService.updateCorredor(
      id,
      updateCorredorDto,
    );
    if (!corredor) {
      throw new HttpException('Corredor no encontrado', HttpStatus.NOT_FOUND);
    }
    return {
      message: 'Corredor actualizado exitosamente',
      data: corredor,
    };
  }

  @Delete(':id')
  async deleteCorredor(@Param('id') id: string) {
    const isValid = mongoose.Types.ObjectId.isValid(id);
    if (!isValid) {
      throw new HttpException('ID no válido', HttpStatus.BAD_REQUEST);
    }
    const result = await this.corredorService.deleteCorredor(id);
    if (!result) {
      throw new HttpException('Corredor no encontrado', HttpStatus.NOT_FOUND);
    }
    return {
      message: 'Corredor eliminado exitosamente',
    };
  }
}
