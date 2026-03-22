import { Router } from 'express';
import { authRoutes } from './auth.routes';
import { photoRoutes } from './photo.routes';
import { adminRoutes } from './admin.routes';

const routes = Router();

/**
 * Mapeamento de domínios da API PhotoOpp
 * /auth   -> Autenticação e Segurança
 * /photos -> Captura e Gestão de Imagens
 * /admin  -> Inteligência e Auditoria
 */
routes.use('/auth', authRoutes);
routes.use('/photos', photoRoutes);
routes.use('/admin', adminRoutes);

export { routes };