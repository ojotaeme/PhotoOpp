import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../config/database';
import { JWT_SECRET } from '../config/auth';

const authRoutes = Router();

/**
 * Autentica usuários e fornece token JWT para sessões de longa duração (1 dia).
 */
authRoutes.post('/login', async (req, res): Promise<any> => {
  try {
    const { email, password } = req.body;
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
      res.locals.eventType = 'LOGIN_FAILED';
      return res.status(401).json({ error: 'Credenciais inválidas: Verifique e-mail e senha.' });
    }

    const token = jwt.sign(
      { userId: user.id, role: user.role }, 
      JWT_SECRET as string,
      { expiresIn: '1d' }
    );

    res.locals.eventType = 'LOGIN_SUCCESS';
    res.locals.userId = user.id;

    return res.json({ 
      token, 
      user: { id: user.id, email: user.email, role: user.role } 
    });
  } catch (error) {
    return res.status(500).json({ error: 'Falha na comunicação com o serviço de autenticação.' });
  }
});

export { authRoutes };