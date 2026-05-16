import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import {
  Carrera,
  EstadoCarrera,
  EstadoResultado,
  FaseCarrera,
} from 'src/esquemas/carrera.schema';
import { Corredor } from 'src/esquemas/corredor.schema';
import { CreateCarreraDto } from 'src/dto/create-carrera.dto';
import { UpdateResultadoDto } from 'src/dto/update-resultado.dto';

@Injectable()
export class CarreraService {
  constructor(
    @InjectModel(Carrera.name) private carreraModel: Model<Carrera>,
    @InjectModel(Corredor.name) private corredorModel: Model<Corredor>,
  ) {}

  // ─── CRUD Básico ───────────────────────────────────────────────

  async findAll(): Promise<Carrera[]> {
    return this.carreraModel
      .find()
      .populate('resultados.corredor')
      .sort({ createdAt: -1 })
      .exec();
  }

  async findOne(id: string): Promise<Carrera> {
    const carrera = await this.carreraModel
      .findById(id)
      .populate('resultados.corredor')
      .exec();
    if (!carrera) {
      throw new NotFoundException('Carrera no encontrada');
    }
    return carrera;
  }

  async findByCategoria(categoria: string): Promise<Carrera[]> {
    return this.carreraModel
      .find({ categoria })
      .populate('resultados.corredor')
      .sort({ createdAt: -1 })
      .exec();
  }

  async findActiveByCategoria(categoria: string): Promise<Carrera> {
    // Primero buscar una carrera activa (pendiente o en_curso)
    let carrera = await this.carreraModel
      .findOne({
        categoria,
        estado: { $in: [EstadoCarrera.PENDIENTE, EstadoCarrera.EN_CURSO] },
      })
      .populate('resultados.corredor')
      .sort({ createdAt: -1 })
      .exec();

    if (carrera) return carrera;

    // Si no hay activa, buscar la última qualy finalizada que NO tenga final generado
    carrera = await this.carreraModel
      .findOne({
        categoria,
        fase: FaseCarrera.QUALY,
        estado: EstadoCarrera.FINALIZADA,
        finalId: null,
      })
      .populate('resultados.corredor')
      .sort({ createdAt: -1 })
      .exec();

    if (carrera) return carrera;

    // Si no, buscar la última final finalizada (para mostrar resultados)
    carrera = await this.carreraModel
      .findOne({
        categoria,
        estado: EstadoCarrera.FINALIZADA,
      })
      .populate('resultados.corredor')
      .sort({ createdAt: -1 })
      .exec();

    return carrera;
  }

  // ─── Crear Carrera (Qualy) ─────────────────────────────────────

  async crearCarrera(dto: CreateCarreraDto): Promise<Carrera> {
    // 1. Verificar que no exista ya una carrera activa (pendiente/en_curso)
    const carreraActiva = await this.carreraModel.findOne({
      categoria: dto.categoria,
      estado: { $in: [EstadoCarrera.PENDIENTE, EstadoCarrera.EN_CURSO] },
    });

    if (carreraActiva) {
      throw new BadRequestException(
        `Ya existe una carrera activa para la categoría ${dto.categoria} (${carreraActiva.fase} - ${carreraActiva.estado}). Debe finalizarla primero.`,
      );
    }

    // 2. Verificar flujo Qualy → Final: si hay una qualy finalizada sin su final, no se puede crear otra qualy
    const qualySinFinal = await this.carreraModel.findOne({
      categoria: dto.categoria,
      fase: FaseCarrera.QUALY,
      estado: EstadoCarrera.FINALIZADA,
      finalId: null,
    });

    if (qualySinFinal && dto.fase !== FaseCarrera.FINAL) {
      throw new BadRequestException(
        `Existe una Qualy finalizada ("${qualySinFinal.nombre}") que aún no tiene Final generada. ` +
          `Debe generar la Final primero o eliminar la Qualy antes de crear una nueva.`,
      );
    }

    // 3. Obtener todos los corredores de esta categoría
    const corredores = await this.corredorModel
      .find({ categoria: dto.categoria })
      .sort({ numero: 1 })
      .exec();

    if (corredores.length === 0) {
      throw new BadRequestException(
        `No hay corredores registrados en la categoría ${dto.categoria}`,
      );
    }

    // 4. Crear resultados iniciales
    const resultados = corredores.map((corredor, index) => ({
      corredor: corredor._id as Types.ObjectId,
      tiempo: 0,
      posicion: index + 1,
      estado: EstadoResultado.PENDIENTE,
      tiempoInicioIndividual: null,
    }));

    const carrera = new this.carreraModel({
      nombre: dto.nombre,
      categoria: dto.categoria,
      fase: dto.fase || FaseCarrera.QUALY,
      estado: EstadoCarrera.PENDIENTE,
      tiempoInicio: null,
      resultados,
    });

    const saved = await carrera.save();
    return this.findOne(saved._id.toString());
  }

  // ─── Iniciar Carrera ───────────────────────────────────────────

  async iniciarCarrera(id: string): Promise<Carrera> {
    const carrera = await this.carreraModel.findById(id);
    if (!carrera) {
      throw new NotFoundException('Carrera no encontrada');
    }

    if (carrera.estado !== EstadoCarrera.PENDIENTE) {
      throw new BadRequestException(
        `La carrera no puede iniciarse. Estado actual: ${carrera.estado}`,
      );
    }

    // Usar Date.now() para timestamp consistente del servidor
    carrera.estado = EstadoCarrera.EN_CURSO;
    carrera.tiempoInicio = Date.now();

    await carrera.save();
    return this.findOne(id);
  }

  // ─── Iniciar Timer Individual ──────────────────────────────────

  async iniciarTimerCorredor(
    carreraId: string,
    corredorId: string,
  ): Promise<Carrera> {
    const carrera = await this.carreraModel.findById(carreraId);
    if (!carrera) {
      throw new NotFoundException('Carrera no encontrada');
    }

    if (carrera.estado !== EstadoCarrera.EN_CURSO) {
      throw new BadRequestException('La carrera no está en curso');
    }

    const resultado = carrera.resultados.find(
      (r) => r.corredor.toString() === corredorId,
    );

    if (!resultado) {
      throw new NotFoundException(
        'Corredor no encontrado en esta carrera',
      );
    }

    if (resultado.estado !== EstadoResultado.PENDIENTE) {
      throw new BadRequestException(
        `El corredor ya tiene estado: ${resultado.estado}`,
      );
    }

    resultado.estado = EstadoResultado.CORRIENDO;
    resultado.tiempoInicioIndividual = Date.now();

    await carrera.save();
    return this.findOne(carreraId);
  }

  // ─── Registrar Tiempo (Detener Timer) ──────────────────────────

  async registrarTiempo(
    carreraId: string,
    corredorId: string,
    dto: UpdateResultadoDto,
  ): Promise<Carrera> {
    const carrera = await this.carreraModel.findById(carreraId);
    if (!carrera) {
      throw new NotFoundException('Carrera no encontrada');
    }

    if (carrera.estado !== EstadoCarrera.EN_CURSO) {
      throw new BadRequestException('La carrera no está en curso');
    }

    const resultado = carrera.resultados.find(
      (r) => r.corredor.toString() === corredorId,
    );

    if (!resultado) {
      throw new NotFoundException(
        'Corredor no encontrado en esta carrera',
      );
    }

    // Permitir sobrescribir tiempo si está corriendo o ya finalizado (corrección)
    if (
      resultado.estado !== EstadoResultado.CORRIENDO &&
      resultado.estado !== EstadoResultado.FINALIZADO
    ) {
      throw new BadRequestException(
        `No se puede registrar tiempo. Estado actual: ${resultado.estado}`,
      );
    }

    // Guardar el tiempo enviado desde el cliente (ya calculado en ms)
    const tiempo = dto.tiempo;
    if (tiempo === undefined || tiempo === null || tiempo < 0) {
      throw new BadRequestException('El tiempo debe ser un número positivo');
    }

    resultado.tiempo = Math.max(0, Math.round(tiempo)); // Sanitizar: nunca negativo, redondeado
    resultado.estado = EstadoResultado.FINALIZADO;

    // Recalcular posiciones basándose en tiempos
    this.recalcularPosiciones(carrera);

    await carrera.save();
    return this.findOne(carreraId);
  }

  // ─── Reiniciar Timer Individual (Reset a pendiente) ────────────

  async reiniciarTimerCorredor(
    carreraId: string,
    corredorId: string,
  ): Promise<Carrera> {
    const carrera = await this.carreraModel.findById(carreraId);
    if (!carrera) {
      throw new NotFoundException('Carrera no encontrada');
    }

    if (carrera.estado !== EstadoCarrera.EN_CURSO) {
      throw new BadRequestException('La carrera no está en curso');
    }

    const resultado = carrera.resultados.find(
      (r) => r.corredor.toString() === corredorId,
    );

    if (!resultado) {
      throw new NotFoundException(
        'Corredor no encontrado en esta carrera',
      );
    }

    // Solo se puede reiniciar si está corriendo o finalizado
    if (
      resultado.estado !== EstadoResultado.CORRIENDO &&
      resultado.estado !== EstadoResultado.FINALIZADO
    ) {
      throw new BadRequestException(
        `No se puede reiniciar. Estado actual: ${resultado.estado}`,
      );
    }

    resultado.estado = EstadoResultado.PENDIENTE;
    resultado.tiempo = 0;
    resultado.tiempoInicioIndividual = null;

    this.recalcularPosiciones(carrera);

    await carrera.save();
    return this.findOne(carreraId);
  }

  // ─── Marcar DNS/DNF ────────────────────────────────────────────

  async marcarEstadoCorredor(
    carreraId: string,
    corredorId: string,
    estado: EstadoResultado,
  ): Promise<Carrera> {
    if (
      estado !== EstadoResultado.DNS &&
      estado !== EstadoResultado.DNF
    ) {
      throw new BadRequestException('Solo se puede marcar como DNS o DNF');
    }

    const carrera = await this.carreraModel.findById(carreraId);
    if (!carrera) {
      throw new NotFoundException('Carrera no encontrada');
    }

    const resultado = carrera.resultados.find(
      (r) => r.corredor.toString() === corredorId,
    );

    if (!resultado) {
      throw new NotFoundException(
        'Corredor no encontrado en esta carrera',
      );
    }

    resultado.estado = estado;
    resultado.tiempo = 0;
    resultado.tiempoInicioIndividual = null;

    this.recalcularPosiciones(carrera);

    await carrera.save();
    return this.findOne(carreraId);
  }

  // ─── Cerrar/Finalizar Carrera ──────────────────────────────────

  async finalizarCarrera(id: string): Promise<Carrera> {
    const carrera = await this.carreraModel.findById(id);
    if (!carrera) {
      throw new NotFoundException('Carrera no encontrada');
    }

    if (carrera.estado !== EstadoCarrera.EN_CURSO) {
      throw new BadRequestException(
        `La carrera no puede finalizarse. Estado actual: ${carrera.estado}`,
      );
    }

    // Marcar como DNS a los que están pendientes (no largaron)
    carrera.resultados.forEach((r) => {
      if (r.estado === EstadoResultado.PENDIENTE) {
        r.estado = EstadoResultado.DNS;
      }
      // Marcar como DNF a los que están corriendo (no terminaron)
      if (r.estado === EstadoResultado.CORRIENDO) {
        r.estado = EstadoResultado.DNF;
      }
    });

    this.recalcularPosiciones(carrera);
    carrera.estado = EstadoCarrera.FINALIZADA;

    await carrera.save();
    return this.findOne(id);
  }

  // ─── Generar Final desde Qualy ─────────────────────────────────

  async generarFinalDesdeQualy(qualyId: string): Promise<Carrera> {
    const qualy = await this.carreraModel
      .findById(qualyId)
      .populate('resultados.corredor')
      .exec();

    if (!qualy) {
      throw new NotFoundException('Qualy no encontrada');
    }

    if (qualy.fase !== FaseCarrera.QUALY) {
      throw new BadRequestException('La carrera especificada no es una Qualy');
    }

    if (qualy.estado !== EstadoCarrera.FINALIZADA) {
      throw new BadRequestException(
        'La Qualy debe estar finalizada para generar la Final',
      );
    }

    // Verificar que no exista ya una final para esta qualy
    if (qualy.finalId) {
      throw new BadRequestException(
        'Ya existe una Final generada para esta Qualy',
      );
    }

    const finalExistente = await this.carreraModel.findOne({
      qualyId: qualy._id,
    });

    if (finalExistente) {
      throw new BadRequestException(
        'Ya existe una Final generada para esta Qualy',
      );
    }

    // Ordenar resultados: finalizados por tiempo ASC, luego DNS/DNF al final
    const resultadosOrdenados = [...qualy.resultados].sort((a, b) => {
      const aFinalizado = a.estado === EstadoResultado.FINALIZADO;
      const bFinalizado = b.estado === EstadoResultado.FINALIZADO;

      if (aFinalizado && bFinalizado) {
        return a.tiempo - b.tiempo; // Menor tiempo primero
      }
      if (aFinalizado) return -1;
      if (bFinalizado) return 1;
      return 0; // DNS/DNF mantienen orden
    });

    // Crear resultados para la final manteniendo el orden de clasificación
    const resultadosFinal = resultadosOrdenados.map((r, index) => ({
      corredor: r.corredor._id || r.corredor,
      tiempo: 0,
      posicion: index + 1,
      estado: EstadoResultado.PENDIENTE,
      tiempoInicioIndividual: null,
    }));

    const final = new this.carreraModel({
      nombre: `Final - ${qualy.nombre.replace(/^Qualy\s*-?\s*/i, '')}`,
      categoria: qualy.categoria,
      fase: FaseCarrera.FINAL,
      estado: EstadoCarrera.PENDIENTE,
      tiempoInicio: null,
      resultados: resultadosFinal,
      qualyId: qualy._id,
    });

    const saved = await final.save();

    // Vincular la qualy con su final
    qualy.finalId = saved._id as Types.ObjectId;
    await qualy.save();

    return this.findOne(saved._id.toString());
  }

  // ─── Obtener Resultados Separados ──────────────────────────────

  async getResultadosCarrera(id: string) {
    const carrera = await this.findOne(id);

    const finalizados = carrera.resultados
      .filter((r) => r.estado === EstadoResultado.FINALIZADO)
      .sort((a, b) => a.tiempo - b.tiempo);

    const dns = carrera.resultados.filter(
      (r) => r.estado === EstadoResultado.DNS,
    );

    const dnf = carrera.resultados.filter(
      (r) => r.estado === EstadoResultado.DNF,
    );

    const pendientes = carrera.resultados.filter(
      (r) =>
        r.estado === EstadoResultado.PENDIENTE ||
        r.estado === EstadoResultado.CORRIENDO,
    );

    return {
      carrera,
      finalizados,
      dns,
      dnf,
      pendientes,
    };
  }

  // ─── Eliminar Carrera ──────────────────────────────────────────

  async eliminarCarrera(id: string): Promise<void> {
    const carrera = await this.carreraModel.findById(id);
    if (!carrera) {
      throw new NotFoundException('Carrera no encontrada');
    }

    // Si es una qualy con final asociada, limpiar el vínculo
    if (carrera.fase === FaseCarrera.QUALY && carrera.finalId) {
      await this.carreraModel.findByIdAndDelete(carrera.finalId);
    }

    // Si es una final, limpiar el finalId de la qualy asociada
    if (carrera.fase === FaseCarrera.FINAL && carrera.qualyId) {
      await this.carreraModel.findByIdAndUpdate(carrera.qualyId, {
        $set: { finalId: null },
      });
    }

    await this.carreraModel.findByIdAndDelete(id);
  }

  // ─── Utilidades Privadas ───────────────────────────────────────

  private recalcularPosiciones(carrera: Carrera): void {
    // DESHABILITADO: El usuario solicitó que no se reordenen.
    // Ahora 'posicion' representa únicamente el "Orden de Largada" (Starting Grid).
    // La posición final (ranking) se calcula dinámicamente en el frontend (RankView) basándose en el tiempo.
  }
}
