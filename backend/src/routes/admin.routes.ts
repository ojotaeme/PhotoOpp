import { Router } from 'express';
import { prisma } from '../config/database';
import { authMiddleware, isAdmin } from '../middlewares/auth.middleware';
import { parse } from 'json2csv';

const adminRoutes = Router();

// Proteção de camada: Apenas administradores autenticados acessam estas rotas
adminRoutes.use(authMiddleware, isAdmin);

/**
 * Utilitário para normalização de filtros por período de tempo.
 */
const getWhereClause = (query: any) => {
  const { startDate, endDate } = query;
  if (!startDate || !endDate) return {};

  const start = new Date(startDate as string);
  start.setUTCHours(0, 0, 0, 0);

  const end = new Date(endDate as string);
  end.setUTCHours(23, 59, 59, 999);

  return { createdAt: { gte: start, lte: end } };
};

/**
 * Retorna KPIs gerais (Total de fotos, fotos no período e promotores ativos).
 */
adminRoutes.get('/stats', async (req, res) => {
  try {
    const where = getWhereClause(req.query);
    
    const [totalPhotos, fotosPeriodo, groups] = await Promise.all([
      prisma.photo.count(),
      prisma.photo.count({ where }),
      prisma.photo.groupBy({ by: ['promoterId'], where })
    ]);

    res.json({
      totalPhotos,
      fotosHoje: fotosPeriodo,
      totalPromotores: groups.length
    });
  } catch (error) {
    res.status(500).json({ error: 'Falha ao processar indicadores estatísticos.' });
  }
});

/**
 * [NOVA] Retorna dados para o gráfico de fluxo por hora (Distribuição horária).
 */
adminRoutes.get('/stats/chart', async (req, res) => {
  try {
    const where = getWhereClause(req.query);
    const photos = await prisma.photo.findMany({ 
      where, 
      select: { createdAt: true } 
    });

    const chartData = photos.reduce((acc: any, p) => {
      const hour = p.createdAt.getHours() + ":00";
      acc[hour] = (acc[hour] || 0) + 1;
      return acc;
    }, {});

    const formattedData = Object.entries(chartData).map(([hour, count]) => ({ hour, count }));
    res.json(formattedData);
  } catch (error) {
    res.status(500).json({ error: 'Falha ao gerar dados do gráfico horário.' });
  }
});

/**
 * [NOVA] Retorna dados para o gráfico de evolução diária (Distribuição por dias).
 */
adminRoutes.get('/stats/days', async (req, res) => {
  try {
    const photos = await prisma.photo.findMany({ 
      select: { createdAt: true } 
    });

    const dailyData = photos.reduce((acc: any, p) => {
      const date = p.createdAt.toISOString().split('T')[0];
      acc[date] = (acc[date] || 0) + 1;
      return acc;
    }, {});

    const formattedData = Object.entries(dailyData)
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => a.date.localeCompare(b.date));

    res.json(formattedData);
  } catch (error) {
    res.status(500).json({ error: 'Falha ao gerar dados evolutivos.' });
  }
});

/**
 * Listagem paginada de capturas para a galeria do administrador.
 */
adminRoutes.get('/photos', async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.max(1, parseInt(req.query.limit as string) || 10);
    const where = getWhereClause(req.query);

    const [photos, total] = await prisma.$transaction([
      prisma.photo.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: { promoter: { select: { email: true } } }
      }),
      prisma.photo.count({ where })
    ]);

    res.json({
      data: photos,
      pagination: { 
        totalPages: Math.ceil(total / limit), 
        currentPage: page 
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Falha ao recuperar galeria de fotos.' });
  }
});

/**
 * Gera ranking de produtividade dos promotores (Top 5).
 */
adminRoutes.get('/stats/promoters', async (req, res) => {
  try {
    const ranking = await prisma.user.findMany({
      where: { role: 'PROMOTER' },
      select: { email: true, _count: { select: { photos: true } } },
      orderBy: { photos: { _count: 'desc' } },
      take: 5
    });
    res.json(ranking.map(p => ({ email: p.email, total: p._count.photos })));
  } catch (e) {
    res.json([]); 
  }
});

/**
 * [NOVA/CORRIGIDA] Retorna a lista de logs para a tabela de Auditoria Live.
 */
adminRoutes.get('/logs', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit as string) || 30;
    const logs = await prisma.log.findMany({
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: { user: { select: { email: true } } }
    });
    res.json(logs);
  } catch (error) {
    res.status(500).json({ error: 'Falha ao recuperar logs de auditoria.' });
  }
});

/**
 * Exportação de logs de auditoria em formato CSV.
 */
adminRoutes.get('/logs/download', async (req, res) => {
  try {
    const logs = await prisma.log.findMany({
      orderBy: { createdAt: 'desc' },
      include: { user: { select: { email: true } } }
    });

    const flattenedLogs = logs.map(log => ({
      Data: log.createdAt.toLocaleString(),
      IP: log.ipAddress,
      Metodo: log.method,
      Rota: log.route,
      Status: log.responseStatus,
      Evento: log.eventType || 'N/A',
      Usuario: log.user?.email || 'Sistema/Totem'
    }));

    const csv = parse(flattenedLogs);
    const filename = `relatorio-auditoria-${new Date().toISOString().split('T')[0]}.csv`;

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=${filename}`);
    res.status(200).send(csv);
  } catch (error) {
    res.status(500).json({ error: 'Falha ao gerar arquivo de exportação.' });
  }
});

export { adminRoutes };