import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Corredor } from 'src/esquemas/corredor.schema';
import { CreateCorredorDto } from 'src/dto/create-corredor.dto';
import { UpdateCorredorDto } from 'src/dto/update-corredor.dto';

@Injectable()
export class CorredorService {
  constructor(
    @InjectModel(Corredor.name) private corredorModel: Model<Corredor>,
  ) {}

  async findAll(): Promise<Corredor[]> {
    return this.corredorModel.find().exec();
  }

  async findOne(id: string): Promise<Corredor> {
    return this.corredorModel.findById(id);
  }

  async createCorredor(
    createCorredorDto: CreateCorredorDto,
  ): Promise<Corredor> {
    const nuevoCorredor = new this.corredorModel(createCorredorDto);
    return nuevoCorredor.save();
  }

  async updateCorredor(
    id: string,
    updateCorredorDto: UpdateCorredorDto,
  ): Promise<Corredor> {
    return this.corredorModel.findByIdAndUpdate(id, updateCorredorDto, {
      new: true,
    });
  }
}
