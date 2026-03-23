import sharp from 'sharp';
import path from 'path';
import { prisma } from '../config/database';
import { v2 as cloudinary } from 'cloudinary';

// Configuração do Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export class PhotoService {
  async processAndSave(fileBuffer: Buffer, promoterId: string) {
    // Caminho blindado: resolve a partir de onde o código compilado está rodando
    const framePath = path.resolve(__dirname, '../../public/templates/frame.png');

    const photo = sharp(fileBuffer);
    const metadata = await photo.metadata();

    const resizedFrame = await sharp(framePath)
      .resize(null, metadata.height)
      .toBuffer();

    const frameMeta = await sharp(resizedFrame).metadata();

    // Aplica a moldura e gera o buffer final
    const finalBuffer = await photo
      .composite([{ input: resizedFrame, gravity: 'center' }])
      .extract({
        left: Math.round((metadata.width! - frameMeta.width!) / 2),
        top: 0,
        width: frameMeta.width!,
        height: metadata.height!
      })
      .png()
      .toBuffer();

    // Upload via Stream para o Cloudinary
    const uploadToCloudinary = (buffer: Buffer): Promise<any> => {
      return new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { folder: 'photoopp_uploads' },
          (error, result) => {
            if (result) resolve(result);
            else reject(error);
          }
        );
        stream.end(buffer);
      });
    };

    const cloudinaryResult = await uploadToCloudinary(finalBuffer);

    // Salva a URL pública do Cloudinary no banco de dados
    return prisma.photo.create({
      data: {
        imageUrl: cloudinaryResult.secure_url,
        promoterId
      }
    });
  }
}