import { Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { JWT_SECRET } from '../config/auth';

/**
 * Valida o token Bearer enviado no header Authorization.
 */
export const authMiddleware = (req: any, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    res.locals.eventType = 'AUTH_MISSING_TOKEN';
    return res.status(401).json({ error: 'Acesso negado: Token não fornecido.' });
  }

  const parts = authHeader.split(' ');
  if (parts.length !== 2) {
    return res.status(401).json({ error: 'Erro de protocolo: Formato do token inválido.' });
  }

  const [scheme, token] = parts;

  if (!/^Bearer$/i.test(scheme)) {
    return res.status(401).json({ error: 'Erro de protocolo: Esquema do token malformado.' });
  }

  try {
    const decoded: any = jwt.verify(token, JWT_SECRET);
    
    // Injeta os dados do usuário no ciclo de vida da requisição
    req.user = decoded; 
    res.locals.userId = decoded.userId; 

    return next();
  } catch (err) {
    res.locals.eventType = 'AUTH_INVALID_TOKEN';
    return res.status(401).json({ error: 'Sessão inválida: Token expirado ou nulo.' });
  }
};

/**
 * Restringe o acesso apenas a usuários com privilégios de Administrador.
 */
export const isAdmin = (req: any, res: Response, next: NextFunction) => {
  if (req.user?.role !== 'ADMIN') {
    return res.status(403).json({ error: 'Acesso restrito: Requer privilégios de administrador.' });
  }
  next();
};