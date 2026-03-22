import sharp from 'sharp';
import path from 'path';
import { prisma } from '../config/database';

export class PhotoService {
  async processAndSave(fileBuffer: Buffer, promoterId: string) {
    const framePath = path.resolve(__dirname, '../../public/templates/frame.png');
    const fileName = `${Date.now()}.png`;
    const outputPath = path.resolve(__dirname, '../../public/uploads', fileName);

    const photo = sharp(fileBuffer);
    const metadata = await photo.metadata();

    const resizedFrame = await sharp(framePath)
      .resize(null, metadata.height)
      .toBuffer();

    const frameMeta = await sharp(resizedFrame).metadata();

    await photo
      .composite([{ input: resizedFrame, gravity: 'center' }])
      .extract({
        left: Math.round((metadata.width! - frameMeta.width!) / 2),
        top: 0,
        width: frameMeta.width!,
        height: metadata.height!
      })
      .toFile(outputPath);

    return prisma.photo.create({
      data: {
        imageUrl: `/api/photos/download/${fileName}`,
        promoterId
      }
    });
  }
}