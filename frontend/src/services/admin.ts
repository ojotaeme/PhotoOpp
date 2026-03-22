const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

/**
 * Serviço de integração para o Dashboard Administrativo.
 * Centraliza as chamadas de métricas, galeria de fotos e auditoria.
 */
export const adminApi = {
  /**
   * Agrega múltiplas chamadas em uma promessa única para o Dashboard.
   * @param query Parâmetros de filtro (?startDate=...&endDate=...)
   */
  async getDashboardData(query: string) {
    const token = localStorage.getItem('@Nexlab:token');
    const headers = { 'Authorization': `Bearer ${token}` };

    const fetchJson = async (endpoint: string) => {
      // Normalização da URL para evitar erros de concatenação de query strings
      const url = `${BASE_URL}/api/admin${endpoint}${query}`;
      const res = await fetch(url, { headers });
      if (res.status === 401) throw new Error("Sessão expirada");
      if (!res.ok) return null;
      return res.json();
    };

    const [stats, chart, photos, promoters, days] = await Promise.all([
      fetchJson('/stats'),          // GET /api/admin/stats
      fetchJson('/stats/chart'),    // GET /api/admin/stats/chart
      fetchJson('/photos'),         // GET /api/admin/photos
      fetchJson('/stats/promoters'),// GET /api/admin/stats/promoters
      fetchJson('/stats/days')      // GET /api/admin/stats/days
    ]);

    return { stats, chart, photos, promoters, days };
  },

  /** Recupera a lista de logs de auditoria */
  async fetchLogs() {
    const token = localStorage.getItem('@Nexlab:token');
    const res = await fetch(`${BASE_URL}/api/admin/logs?limit=30`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    return res.ok ? res.json() : [];
  },

  /** Gera o blob para exportação do relatório CSV */
  async downloadLogs() {
    const token = localStorage.getItem('@Nexlab:token');
    const res = await fetch(`${BASE_URL}/api/admin/logs/download`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!res.ok) throw new Error("Falha no download");
    return res.blob();
  }
};