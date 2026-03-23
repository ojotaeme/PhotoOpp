import sharp from 'sharp';
import path from 'path';
import { prisma } from '../config/database';
import { v2 as cloudinary } from 'cloudinary';

// Configuração do Cloudinary usando as variáveis de ambiente
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export class PhotoService {
  async processAndSave(fileBuffer: Buffer, promoterId: string) {
    const framePath = path.resolve(process.cwd(), 'public/templates/frame.png');

    const photo = sharp(fileBuffer);
    const metadata = await photo.metadata();

    const resizedFrame = await sharp(framePath)
      .resize(null, metadata.height)
      .toBuffer();

    const frameMeta = await sharp(resizedFrame).metadata();

    // Composição: Sobrepõe o frame e converte o resultado final num Buffer
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

    // Função auxiliar para fazer upload de um Buffer via stream para o Cloudinary
    const uploadToCloudinary = (buffer: Buffer): Promise<any> => {
      return new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { folder: 'photoopp_uploads' }, // Cria esta pasta lá no Cloudinary
          (error, result) => {
            if (result) resolve(result);
            else reject(error);
          }
        );
        stream.end(buffer);
      });
    };

    // Faz o upload e aguarda a resposta com a URL segura
    const cloudinaryResult = await uploadToCloudinary(finalBuffer);

    // Salva a referência permanente (https://res.cloudinary.com/...) no banco Neon
    return prisma.photo.create({
      data: {
        imageUrl: cloudinaryResult.secure_url,
        promoterId
      }
    });
  }
}