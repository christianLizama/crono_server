import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Corredor } from 'src/esquemas/corredor.schema';
import { CreateCorredorDto } from 'src/dto/create-corredor.dto';
import { UpdateCorredorDto } from 'src/dto/update-corredor.dto';
import { Categoria } from 'src/esquemas/corredor.schema';

@Injectable()
export class CorredorService {
  constructor(
    @InjectModel(Corredor.name) private corredorModel: Model<Corredor>,
  ) {}

  async deleteCorredor(id: string): Promise<Corredor> {
    return this.corredorModel.findByIdAndDelete(id);
  }

  async findAll(): Promise<Corredor[]> {
    return this.corredorModel.find().exec();
  }

  async findOne(id: string): Promise<Corredor> {
    const corredor = await this.corredorModel.findById(id);
    return corredor;
  }

  async createCorredor(
    createCorredorDto: CreateCorredorDto,
  ): Promise<Corredor> {
    // Encuentra el número más alto existente
    const corredorConNumeroMayor = await this.corredorModel
      .findOne()
      .sort({ numero: -1 }) // Ordena por el campo `numero` en orden descendente
      .exec();

    // Si no existen corredores, el número será 1, de lo contrario será el siguiente consecutivo
    const nuevoNumero = corredorConNumeroMayor
      ? corredorConNumeroMayor.numero + 1
      : 1;

    // Crea un nuevo corredor con el número calculado
    const nuevoCorredor = new this.corredorModel({
      ...createCorredorDto,
      numero: nuevoNumero, // Asigna el número calculado
    });

    return nuevoCorredor.save();
  }

  async updateCorredor(
    id: string,
    updateCorredorDto: UpdateCorredorDto,
  ): Promise<Corredor> {
    const corredor = await this.corredorModel.findByIdAndUpdate(
      id,
      updateCorredorDto,
      { new: true },
    );
    return corredor;
  }

  async marcarEntregado(id: string): Promise<Corredor> {
    const corredor = await this.corredorModel.findByIdAndUpdate(
      id,
      { entregado: true },
      { new: true },
    );
    return corredor;
  }

  async getCorredoresPorCategoria(categoria: string): Promise<Corredor[]> {
    // Convierte el string a enum
    if (!isCategoria(categoria)) {
      throw new BadRequestException('Categoría no válida');
    }
    return this.corredorModel.find({ categoria }).exec();
  }

  async getCorredoresPorCategoriaYTiempo(
    category: string,
  ): Promise<Corredor[]> {
    if (!isCategoria(category)) {
      throw new BadRequestException('Categoría no válida');
    }
    return this.corredorModel
      .find({ categoria: category, tiempo: { $gt: 0 } })
      .exec();
  }

  async updateTime(
    id: string,
    updateCorredorDto: UpdateCorredorDto,
  ): Promise<Corredor> {
    const corredor = await this.corredorModel.findByIdAndUpdate(
      id,
      updateCorredorDto,
      { new: true },
    );
    return corredor;
  }
}

function isCategoria(value: any): value is Categoria {
  return Object.values(Categoria).includes(value as Categoria);
}
