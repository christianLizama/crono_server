import { Body, Controller, Post } from '@nestjs/common';
import { CorredorService } from '../corredor.service';
import { CreateCorredorDto } from 'src/dto/create-corredor.dto';

@Controller('corredores')
export class CorredorController {
  constructor(private corredorService: CorredorService) {}

  @Post()
  createCorredor(@Body() createCorredorDto: CreateCorredorDto) {
    console.log(createCorredorDto);
  }
}
