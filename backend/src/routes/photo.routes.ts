import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import { authMiddleware } from '../middlewares/auth.middleware';
import { PhotoService } from '../services/PhotoService';

const photoRoutes = Router();

// Garante que o arquivo fique na memória (Buffer) para envio ao Cloudinary
const upload = multer({ storage: multer.memoryStorage() });
const photoService = new PhotoService();

/**
 * Recebe imagem binária, aplica moldura e persiste no sistema (Cloudinary).
 */
photoRoutes.post('/upload', authMiddleware, upload.single('photo'), async (req: any, res): Promise<any> => {
    try {
        // Verifica se a foto e o buffer realmente chegaram na requisição
        if (!req.file || !req.file.buffer) {
            return res.status(400).json({ error: 'Nenhuma imagem identificada no payload ou buffer vazio.' });
        }
        
        const photo = await photoService.processAndSave(req.file.buffer, req.user.userId);
        
        res.locals.eventType = 'PHOTO_PROCESSED_SUCCESS';
        res.locals.userId = req.user.userId;

        return res.json({ photo });
    } catch (error) {
        console.error("ERRO NO UPLOAD:", error);
        
        return res.status(500).json({ error: 'Falha técnica ao processar a imagem. Verifique os logs do servidor.' });
    }
});

/**
 * Endpoint legado para visualização direta e download de capturas.
 * (Novas fotos usarão a URL direta do Cloudinary, mas mantemos isso para compatibilidade se houver fotos antigas)
 */
photoRoutes.get('/download/:filename', (req, res) => {
    const filePath = path.resolve(process.cwd(), 'public/uploads', req.params.filename);
    res.download(filePath, (err) => {
      if (err) res.status(404).json({ error: 'Arquivo não encontrado no servidor.' });
    });
});

export { photoRoutes };