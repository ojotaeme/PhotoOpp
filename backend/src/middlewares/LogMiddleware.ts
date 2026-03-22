import { Request, Response, NextFunction } from 'express';
import { prisma } from '../config/database';

/**
 * Registra eventos de API de forma assíncrona após a conclusão da resposta.
 * Filtra dados sensíveis e rotas de baixo valor estatístico.
 */
export const logMiddleware = (req: Request, res: Response, next: NextFunction) => {
  // Ignora rotas de polling e estatísticas para evitar poluição visual nos logs
  const ignoredRoutes = ['/logs', '/stats', '/chart'];
  if (req.method === 'GET' && ignoredRoutes.some(r => req.originalUrl.includes(r))) {
    return next();
  }

  // Mascara informações sensíveis antes do registro
  const safeBody = { ...req.body };
  if (safeBody.password) safeBody.password = '********';

  // O registro ocorre no evento 'finish' para capturar o status code real enviado ao cliente
  res.on('finish', async () => {
    const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    
    try {
      await prisma.log.create({
        data: {
          ipAddress: String(ip),
          route: req.originalUrl,
          method: req.method,
          requestBody: Object.keys(safeBody).length > 0 ? safeBody : null,
          responseStatus: res.statusCode,
          eventType: res.locals.eventType || null,
          userId: res.locals.userId || null,
        }
      });
    } catch (err) {
      console.error('[Audit Log Error]: Falha ao persistir log no banco de dados.');
    }
  });

  next();
};