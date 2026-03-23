import sharp from 'sharp';
import path from 'path';
import { prisma } from '../config/database';

/**
 * Serviço responsável pelo processamento de imagem e persistência.
 * Utiliza process.cwd() para garantir compatibilidade com ambientes de deploy (Render).
 */
export class PhotoService {
  async processAndSave(fileBuffer: Buffer, promoterId: string) {
    // process.cwd() aponta para a raiz da pasta 'backend' no servidor
    const framePath = path.resolve(process.cwd(), 'public/templates/frame.png');
    const fileName = `${Date.now()}.png`;
    const outputPath = path.resolve(process.cwd(), 'public/uploads', fileName);

    const photo = sharp(fileBuffer);
    const metadata = await photo.metadata();

    // Redimensiona o frame para casar com a altura da foto capturada
    const resizedFrame = await sharp(framePath)
      .resize(null, metadata.height)
      .toBuffer();

    const frameMeta = await sharp(resizedFrame).metadata();

    // Composição: Sobrepõe o frame e extrai a área útil
    await photo
      .composite([{ input: resizedFrame, gravity: 'center' }])
      .extract({
        left: Math.round((metadata.width! - frameMeta.width!) / 2),
        top: 0,
        width: frameMeta.width!,
        height: metadata.height!
      })
      .toFile(outputPath);

    // Salva a referência no banco de dados Neon
    return prisma.photo.create({
      data: {
        imageUrl: `/api/photos/download/${fileName}`,
        promoterId
      }
    });
  }
}