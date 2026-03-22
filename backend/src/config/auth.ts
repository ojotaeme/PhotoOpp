import 'dotenv/config';

/**
 * Define a chave secreta para assinatura e verificação de tokens JWT.
 * Prioriza a variável de ambiente para ambientes de produção.
 */
export const JWT_SECRET: string = process.env.JWT_SECRET || 'nexlab_security_default';