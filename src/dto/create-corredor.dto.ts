import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsString,
  IsBoolean,
} from 'class-validator';
import { Categoria } from '../esquemas/corredor.schema';

export class CreateCorredorDto {
  @IsString()
  @IsNotEmpty()
  readonly nombre: string;

  @IsEnum(Categoria)
  @IsNotEmpty()
  readonly categoria: Categoria;

  @IsNumber()
  @IsNotEmpty()
  readonly edad: number;

  @IsNumber()
  @IsNotEmpty()
  readonly tiempo: number;

  @IsString()
  @IsNotEmpty()
  readonly rut: string;

  @IsString()
  @IsNotEmpty()
  readonly team: string;

  @IsString()
  @IsNotEmpty()
  readonly telefono: string;

  @IsBoolean()
  @IsNotEmpty()
  readonly entregado: boolean;
}
