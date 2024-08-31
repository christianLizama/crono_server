import { IsEnum, IsNotEmpty, IsNumber, IsString } from 'class-validator';
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
  readonly numero: number;

  @IsString()
  @IsNotEmpty()
  readonly tiempo: string;

  @IsString()
  @IsNotEmpty()
  readonly rut: string;

  @IsString()
  @IsNotEmpty()
  readonly team: string;

  @IsString()
  @IsNotEmpty()
  readonly telefono: string;
}
