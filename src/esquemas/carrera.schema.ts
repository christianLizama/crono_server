import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { Categoria } from './corredor.schema';

// Estados posibles de un resultado individual
export enum EstadoResultado {
  PENDIENTE = 'pendiente',
  CORRIENDO = 'corriendo',
  FINALIZADO = 'finalizado',
  DNS = 'dns', // Did Not Start
  DNF = 'dnf', // Did Not Finish
}

// Fases de la carrera
export enum FaseCarrera {
  QUALY = 'qualy',
  FINAL = 'final',
}

// Estados de la carrera
export enum EstadoCarrera {
  PENDIENTE = 'pendiente',
  EN_CURSO = 'en_curso',
  FINALIZADA = 'finalizada',
}

// Sub-documento: resultado de un corredor en una carrera
@Schema({ _id: false })
export class Resultado {
  @Prop({ type: Types.ObjectId, ref: 'Corredor', required: true })
  corredor: Types.ObjectId;

  @Prop({ required: true, default: 0 })
  tiempo: number; // Tiempo en milisegundos

  @Prop({ required: true, default: 0 })
  posicion: number;

  @Prop({
    required: true,
    enum: Object.values(EstadoResultado),
    default: EstadoResultado.PENDIENTE,
  })
  estado: string;

  // Timestamp del servidor cuando el corredor inició su cronómetro
  @Prop({ default: null })
  tiempoInicioIndividual: number;
}

export const ResultadoSchema = SchemaFactory.createForClass(Resultado);

@Schema({ timestamps: true })
export class Carrera extends Document {
  @Prop({ required: true })
  nombre: string;

  @Prop({ required: true, enum: Object.values(Categoria) })
  categoria: string;

  @Prop({
    required: true,
    enum: Object.values(FaseCarrera),
    default: FaseCarrera.QUALY,
  })
  fase: string;

  @Prop({
    required: true,
    enum: Object.values(EstadoCarrera),
    default: EstadoCarrera.PENDIENTE,
  })
  estado: string;

  @Prop({ default: null })
  tiempoInicio: number; // Timestamp del servidor al iniciar la carrera

  @Prop({ type: [ResultadoSchema], default: [] })
  resultados: Resultado[];

  // ID de la carrera de qualy asociada (solo para carreras finales)
  @Prop({ type: Types.ObjectId, ref: 'Carrera', default: null })
  qualyId: Types.ObjectId;

  // ID de la carrera final generada desde esta qualy (solo para qualys)
  @Prop({ type: Types.ObjectId, ref: 'Carrera', default: null })
  finalId: Types.ObjectId;
}

export const CarreraSchema = SchemaFactory.createForClass(Carrera);
