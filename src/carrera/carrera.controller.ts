import {
  Body,
  Controller,
  Delete,
  Get,
  HttpException,
  HttpStatus,
  Param,
  Patch,
  Post,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { CarreraService } from './carrera.service';
import { CreateCarreraDto } from 'src/dto/create-carrera.dto';
import { UpdateResultadoDto } from 'src/dto/update-resultado.dto';
import { EstadoResultado } from 'src/esquemas/carrera.schema';
import { Categoria } from 'src/esquemas/corredor.schema';
import mongoose from 'mongoose';
import { CorredoresGateway } from 'src/corredores/corredores.gateway';

@Controller('carreras')
export class CarreraController {
  constructor(
    private readonly carreraService: CarreraService,
    private readonly gateway: CorredoresGateway,
  ) {}

  // ─── CRUD ──────────────────────────────────────────────────────

  @Get()
  async findAll() {
    const carreras = await this.carreraService.findAll();
    return { message: 'Carreras obtenidas exitosamente', data: carreras };
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    this.validateObjectId(id);
    const carrera = await this.carreraService.findOne(id);
    return { message: 'Carrera obtenida exitosamente', data: carrera };
  }

  @Get('categoria/:categoria')
  async findByCategoria(@Param('categoria') categoria: string) {
    this.validateCategoria(categoria);
    const carreras = await this.carreraService.findByCategoria(categoria);
    return { message: 'Carreras obtenidas exitosamente', data: carreras };
  }

  @Get('categoria/:categoria/activa')
  async findActiveByCategoria(@Param('categoria') categoria: string) {
    this.validateCategoria(categoria);
    const carrera =
      await this.carreraService.findActiveByCategoria(categoria);
    return { message: 'Carrera activa obtenida', data: carrera };
  }

  @Post()
  @UsePipes(new ValidationPipe())
  async crear(@Body() dto: CreateCarreraDto) {
    const carrera = await this.carreraService.crearCarrera(dto);
    this.gateway.emitCarreraUpdate(carrera);
    return { message: 'Carrera creada exitosamente', data: carrera };
  }

  @Delete(':id')
  async eliminar(@Param('id') id: string) {
    this.validateObjectId(id);
    await this.carreraService.eliminarCarrera(id);
    return { message: 'Carrera eliminada exitosamente' };
  }

  // ─── Control de Carrera ────────────────────────────────────────

  @Patch(':id/iniciar')
  async iniciar(@Param('id') id: string) {
    this.validateObjectId(id);
    const carrera = await this.carreraService.iniciarCarrera(id);
    this.gateway.emitCarreraUpdate(carrera);
    return { message: 'Carrera iniciada exitosamente', data: carrera };
  }

  @Patch(':id/finalizar')
  async finalizar(@Param('id') id: string) {
    this.validateObjectId(id);
    const carrera = await this.carreraService.finalizarCarrera(id);
    this.gateway.emitCarreraUpdate(carrera);
    return { message: 'Carrera finalizada exitosamente', data: carrera };
  }

  // ─── Timer Individual ─────────────────────────────────────────

  @Patch(':id/corredor/:corredorId/iniciar')
  async iniciarTimer(
    @Param('id') id: string,
    @Param('corredorId') corredorId: string,
  ) {
    this.validateObjectId(id);
    this.validateObjectId(corredorId);
    const carrera = await this.carreraService.iniciarTimerCorredor(
      id,
      corredorId,
    );
    this.gateway.emitCarreraUpdate(carrera);
    return {
      message: 'Timer del corredor iniciado exitosamente',
      data: carrera,
    };
  }

  @Patch(':id/corredor/:corredorId/tiempo')
  @UsePipes(new ValidationPipe())
  async registrarTiempo(
    @Param('id') id: string,
    @Param('corredorId') corredorId: string,
    @Body() dto: UpdateResultadoDto,
  ) {
    this.validateObjectId(id);
    this.validateObjectId(corredorId);
    const carrera = await this.carreraService.registrarTiempo(
      id,
      corredorId,
      dto,
    );
    this.gateway.emitCarreraUpdate(carrera);
    return {
      message: 'Tiempo registrado exitosamente',
      data: carrera,
    };
  }

  @Patch(':id/corredor/:corredorId/estado')
  @UsePipes(new ValidationPipe())
  async marcarEstado(
    @Param('id') id: string,
    @Param('corredorId') corredorId: string,
    @Body() body: { estado: EstadoResultado },
  ) {
    this.validateObjectId(id);
    this.validateObjectId(corredorId);
    const carrera = await this.carreraService.marcarEstadoCorredor(
      id,
      corredorId,
      body.estado,
    );
    this.gateway.emitCarreraUpdate(carrera);
    return {
      message: 'Estado del corredor actualizado exitosamente',
      data: carrera,
    };
  }

  @Patch(':id/corredor/:corredorId/reiniciar')
  async reiniciarTimer(
    @Param('id') id: string,
    @Param('corredorId') corredorId: string,
  ) {
    this.validateObjectId(id);
    this.validateObjectId(corredorId);
    const carrera = await this.carreraService.reiniciarTimerCorredor(
      id,
      corredorId,
    );
    this.gateway.emitCarreraUpdate(carrera);
    return {
      message: 'Timer del corredor reiniciado exitosamente',
      data: carrera,
    };
  }

  // ─── Generar Final ─────────────────────────────────────────────

  @Post(':id/generar-final')
  async generarFinal(@Param('id') qualyId: string) {
    this.validateObjectId(qualyId);
    const final =
      await this.carreraService.generarFinalDesdeQualy(qualyId);
    this.gateway.emitCarreraUpdate(final);
    return {
      message: 'Final generada exitosamente desde Qualy',
      data: final,
    };
  }

  // ─── Resultados ────────────────────────────────────────────────

  @Get(':id/resultados')
  async getResultados(@Param('id') id: string) {
    this.validateObjectId(id);
    const resultados = await this.carreraService.getResultadosCarrera(id);
    return { message: 'Resultados obtenidos exitosamente', data: resultados };
  }

  // ─── Validaciones ──────────────────────────────────────────────

  private validateObjectId(id: string): void {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new HttpException('ID no válido', HttpStatus.BAD_REQUEST);
    }
  }

  private validateCategoria(categoria: string): void {
    if (!Object.values(Categoria).includes(categoria as Categoria)) {
      throw new HttpException('Categoría no válida', HttpStatus.BAD_REQUEST);
    }
  }
}
