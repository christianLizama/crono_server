import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';

// Define el enumerado de categorías
export enum Categoria {
  KIDS = 'Kids',
  INFANTIL = 'Infantil',
  JUNIOR = 'Junior',
  DAMAS = 'Damas',
  NOVICIOS = 'Novicios',
  RIGIDO = 'Rígido',
  EXPERTO = 'Experto',
  ELITE = 'Elite',
  MASTER_A = 'Master A',
  OPEN_MASTER = 'Open Master',
}

@Schema()
export class Corredor {
  @Prop({ required: true })
  nombre: string;

  @Prop({ required: true, enum: Object.values(Categoria) })
  categoria: string;

  @Prop({ required: true })
  edad: number;

  @Prop({ required: true })
  numero: number;

  @Prop({ required: true })
  tiempo: number;

  @Prop({ required: true })
  rut: string;

  @Prop({ required: true })
  team: string;

  @Prop({ required: true })
  telefono: string;

  @Prop({ required: true })
  entregado: boolean;
}

export const CorredorSchema = SchemaFactory.createForClass(Corredor);
