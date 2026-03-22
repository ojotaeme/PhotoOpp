import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import path from 'path';
import { routes } from './routes'; 
import { logMiddleware } from './middlewares/LogMiddleware';

const app = express();

/**
 * CONFIGURAÇÃO DE SEGURANÇA (CORS)
 * Define quais domínios podem consumir esta API. 
 * Inclui ambientes de desenvolvimento, preview e produção.
 */
const allowedOrigins = [
  'http://localhost:5173', 
  'http://localhost:4173', 
  process.env.FRONTEND_URL  
].filter(Boolean) as string[];

app.use(cors({
  origin: (origin, callback) => {
    // Permite requisições sem origin (como ferramentas de teste ou mobile)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Acesso recusado: Origem não autorizada pela política Nexlab.'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

/**
 * MIDDLEWARES DE PARSING E ESTÁTICOS
 * - Suporta payloads de até 50mb para processamento de imagens base64.
 * - Serve a pasta /public para acesso direto às molduras e uploads.
 */
app.use(express.json({ limit: '50mb' }));
app.use('/public', express.static(path.resolve(process.cwd(), 'public')));

/**
 * CAMADA DE INFRAESTRUTURA E ROTAS
 * - LogMiddleware: Auditoria automática de cada requisição.
 * - Routes: Agregador de endpoints sob o prefixo /api.
 */
app.use(logMiddleware);
app.use('/api', routes);

/**
 * INICIALIZAÇÃO DO SERVIÇO
 */
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`\nPhotoOpp API running...`);
  console.log(`Porta: ${PORT}`);
});