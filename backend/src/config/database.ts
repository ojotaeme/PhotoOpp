import { PrismaClient } from '@prisma/client';
import 'dotenv/config'; 

// Validação preventiva da string de conexão
if (!process.env.DATABASE_URL) {
  console.warn("[Database] Atenção: DATABASE_URL não identificada no ambiente.");
}

/**
 * Instância global do Prisma para operações de banco de dados.
 * Configurada com carregamento dinâmico da URL via env.
 */
export const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
});