import { Schema, Document } from 'mongoose';

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

export interface Corredor extends Document {
  nombre: string;
  categoria: Categoria;
  edad: number;
  numero: number;
  tiempo: string;
  rut: string;
  team: string;
  telefono: string;
}

// Define el esquema de Mongoose para Corredor
export const CorredorSchema = new Schema({
  nombre: { type: String, required: true },
  categoria: {
    type: String,
    required: true,
    enum: Object.values(Categoria), // Validación usando los valores del enum
  },
  edad: { type: Number, required: true },
  numero: { type: Number, required: true },
  tiempo: { type: String, required: true },
  rut: { type: String, required: true },
  team: { type: String, required: true },
  telefono: { type: String, required: true },
});
