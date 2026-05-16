import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { Categoria } from '../esquemas/corredor.schema';
import { FaseCarrera } from '../esquemas/carrera.schema';

export class CreateCarreraDto {
  @IsString()
  @IsNotEmpty()
  readonly nombre: string;

  @IsEnum(Categoria)
  @IsNotEmpty()
  readonly categoria: Categoria;

  @IsEnum(FaseCarrera)
  @IsOptional()
  readonly fase?: FaseCarrera;
}
