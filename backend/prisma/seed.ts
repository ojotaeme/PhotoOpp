import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import bcrypt from 'bcryptjs';

// 1. Pega a URL do banco do .env
const connectionString = process.env.DATABASE_URL;

// 2. Configura o adaptador do Postgres para o Prisma 7
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);

// 3. Inicializa o Prisma passando o adaptador!
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('Iniciando o seed do banco de dados...');

  // Gerando os hashes para as senhas
  const adminPassword = await bcrypt.hash('admin123', 10);
  const promoterPassword = await bcrypt.hash('promotor123', 10);

  // Criando o usuário Admin
  const admin = await prisma.user.upsert({
    where: { email: 'admin@nexlab.com' },
    update: {}, 
    create: {
      email: 'admin@nexlab.com',
      passwordHash: adminPassword,
      role: 'ADMIN',
    },
  });

  // Criando o usuário Promotor
  const promoter = await prisma.user.upsert({
    where: { email: 'promotor@nexlab.com' },
    update: {},
    create: {
      email: 'promotor@nexlab.com',
      passwordHash: promoterPassword,
      role: 'PROMOTER',
    },
  });

  console.log('Seed executado com sucesso!');
  console.log('Usuários criados:');
  console.log(`- Admin: ${admin.email} | Senha: admin123`);
  console.log(`- Promotor: ${promoter.email} | Senha: promotor123`);
}

main()
  .catch((e) => {
    console.error('Erro ao rodar o seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });