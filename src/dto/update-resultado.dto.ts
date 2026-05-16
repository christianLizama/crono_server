import { IsEnum, IsNumber, IsOptional, IsString } from 'class-validator';
import { EstadoResultado } from '../esquemas/carrera.schema';

export class UpdateResultadoDto {
  @IsString()
  @IsOptional()
  readonly corredorId?: string;

  @IsNumber()
  @IsOptional()
  readonly tiempo?: number;

  @IsEnum(EstadoResultado)
  @IsOptional()
  readonly estado?: EstadoResultado;
}
