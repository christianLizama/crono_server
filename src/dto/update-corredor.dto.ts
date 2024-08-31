import {
  IsEnum,
  IsOptional,
  IsNumber,
  IsString,
  IsBoolean,
} from 'class-validator';
import { Categoria } from '../esquemas/corredor.schema';

export class UpdateCorredorDto {
  @IsString()
  @IsOptional()
  readonly nombre?: string;

  @IsEnum(Categoria)
  @IsOptional()
  readonly categoria?: Categoria;

  @IsNumber()
  @IsOptional()
  readonly edad?: number;

  @IsNumber()
  @IsOptional()
  readonly numero?: number;

  @IsNumber()
  @IsOptional()
  readonly tiempo?: number;

  @IsString()
  @IsOptional()
  readonly rut?: string;

  @IsString()
  @IsOptional()
  readonly team?: string;

  @IsString()
  @IsOptional()
  readonly telefono?: string;

  @IsBoolean()
  @IsOptional()
  readonly entregado?: boolean;
}
