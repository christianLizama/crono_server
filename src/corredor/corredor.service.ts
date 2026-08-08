import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Corredor } from 'src/esquemas/corredor.schema';
import { CreateCorredorDto } from 'src/dto/create-corredor.dto';
import { UpdateCorredorDto } from 'src/dto/update-corredor.dto';
import { Categoria } from 'src/esquemas/corredor.schema';
import { FirebaseService } from 'src/firebase/firebase.service';

@Injectable()
export class CorredorService {
  private readonly logger = new Logger(CorredorService.name);

  constructor(
    @InjectModel(Corredor.name) private corredorModel: Model<Corredor>,
    private readonly firebaseService: FirebaseService,
  ) {}

  async deleteCorredor(id: string): Promise<Corredor> {
    return this.corredorModel.findByIdAndDelete(id);
  }

  async findAll(): Promise<Corredor[]> {
    return this.corredorModel.find().exec();
  }

  async findOne(id: string): Promise<Corredor> {
    const corredor = await this.corredorModel.findById(id);
    return corredor;
  }

  async createCorredor(
    createCorredorDto: CreateCorredorDto,
  ): Promise<Corredor> {
    // Encuentra el número más alto existente
    const corredorConNumeroMayor = await this.corredorModel
      .findOne()
      .sort({ numero: -1 }) // Ordena por el campo `numero` en orden descendente
      .exec();

    // Si no existen corredores, el número será 1, de lo contrario será el siguiente consecutivo
    const nuevoNumero = corredorConNumeroMayor
      ? corredorConNumeroMayor.numero + 1
      : 1;

    // Crea un nuevo corredor con el número calculado
    const nuevoCorredor = new this.corredorModel({
      ...createCorredorDto,
      numero: nuevoNumero, // Asigna el número calculado
    });

    return nuevoCorredor.save();
  }

  async updateCorredor(
    id: string,
    updateCorredorDto: UpdateCorredorDto,
  ): Promise<Corredor> {
    const corredor = await this.corredorModel.findByIdAndUpdate(
      id,
      updateCorredorDto,
      { new: true },
    );
    return corredor;
  }

  async marcarEntregado(id: string): Promise<Corredor> {
    const corredor = await this.corredorModel.findByIdAndUpdate(
      id,
      { entregado: true },
      { new: true },
    );
    return corredor;
  }

  async getCorredoresPorCategoria(categoria: string): Promise<Corredor[]> {
    const catValida = obtenerCategoriaValida(categoria);
    if (!catValida) {
      throw new BadRequestException('Categoría no válida');
    }
    return this.corredorModel.find({ categoria: catValida }).sort({ numero: 1 }).exec();
  }

  async getCorredoresPorCategoriaYTiempo(
    category: string,
  ): Promise<Corredor[]> {
    const catValida = obtenerCategoriaValida(category);
    if (!catValida) {
      throw new BadRequestException('Categoría no válida');
    }
    return this.corredorModel
      .find({ categoria: catValida, tiempo: { $gt: 0 } }).sort({ tiempo: 1 })
      .exec();
  }

  async updateTime(
    id: string,
    updateCorredorDto: UpdateCorredorDto,
  ): Promise<Corredor> {
    const corredor = await this.corredorModel.findByIdAndUpdate(
      id,
      updateCorredorDto,
      { new: true },
    );
    return corredor;
  }

  async reiniciarTiempos() {
    const result = await this.corredorModel.updateMany(
      {}, // Filtro: todos los documentos
      { $set: { tiempo: 0 } }, // Actualización: setear tiempo a 0
    );
    return result;
  }

  async importarDesdeFirebase(): Promise<{
    importados: number;
    omitidos: number;
    errores: number;
    detalles: string[];
  }> {
    const firestore = this.firebaseService.getFirestore();

    if (!firestore) {
      throw new Error(
        'Firestore no está inicializado. Verifica el archivo firebase-service-account.json',
      );
    }

    const snapshot = await firestore.collection('inscritos').get();

    if (snapshot.empty) {
      return { importados: 0, omitidos: 0, errores: 0, detalles: ['La colección "inscritos" está vacía en Firebase'] };
    }

    let importados = 0;
    let omitidos = 0;
    let errores = 0;
    const detalles: string[] = [];

    for (const doc of snapshot.docs) {
      const data = doc.data();

      try {
        // Obtener la categoría oficial normalizada (sin tildes, mayúsculas o guiones)
        const categoriaValida = obtenerCategoriaValida(data.categoria);

        if (!categoriaValida) {
          this.logger.warn(`Categoría inválida para ${data.nombre}: "${data.categoria}"`);
          detalles.push(`⚠️ ${data.nombre} — categoría inválida: "${data.categoria}"`);
          errores++;
          continue;
        }

        // Verificar si ya existe por RUT
        const existe = await this.corredorModel.findOne({ rut: String(data.rut) });
        if (existe) {
          omitidos++;
          detalles.push(`⏭️ ${data.nombre} (RUT: ${data.rut}) — ya existe`);
          continue;
        }

        // Insertar el corredor con tiempo en 0 y la categoría normalizada del enum
        const nuevoCorredor = new this.corredorModel({
          nombre: String(data.nombre),
          categoria: categoriaValida,
          edad: Number(data.edad),
          numero: Number(data.numero),
          rut: String(data.rut),
          team: String(data.team),
          telefono: String(data.telefono),
          entregado: Boolean(data.entregado),
          tiempo: 0,
        });

        await nuevoCorredor.save();
        importados++;
        this.logger.log(`✅ Importado: ${data.nombre} (${categoriaValida})`);
      } catch (err) {
        this.logger.error(`Error al importar ${data.nombre}: ${err.message}`);
        detalles.push(`❌ ${data.nombre} — error: ${err.message}`);
        errores++;
      }
    }

    return { importados, omitidos, errores, detalles };
  }
}

function normalizarTexto(text: string): string {
  if (!text) return '';
  return text
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[\s\-_]+/g, '');
}

function obtenerCategoriaValida(valor: any): Categoria | null {
  if (typeof valor !== 'string') return null;
  const normalizedInput = normalizarTexto(valor);
  const categorias = Object.values(Categoria) as Categoria[];

  for (const cat of categorias) {
    if (normalizarTexto(cat) === normalizedInput) {
      return cat;
    }
  }
  return null;
}

function isCategoria(value: any): value is Categoria {
  return obtenerCategoriaValida(value) !== null;
}
