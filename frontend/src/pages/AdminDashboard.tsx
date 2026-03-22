import { useEffect, useState, useCallback } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  LineChart, Line 
} from 'recharts';
import { 
  Users, Image as ImageIcon, Download, LogOut, Clock, Calendar, 
  ChevronLeft, ChevronRight, QrCode, ShieldCheck 
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { adminApi } from '../services/admin';
import { StatCard } from "../components/StatCard";
import { Button } from "../components/Button";
import logoNexlab from '../assets/logo.png';

const EVENT_LABELS: Record<string, string> = {
  'LOGIN_SUCCESS': 'Login Realizado',
  'PHOTO_PROCESSED_SUCCESS': 'Nova Foto Capturada',
  'ADMIN_DOWNLOAD_LOG_SUCCESS': 'Relatório Exportado',
  'AUTH_INVALID_TOKEN': 'Token Inválido',
  'LOGIN_FAILED': 'Falha no Login'
};

/**
 * Painel Administrativo Nexlab - Versão Final de Produção.
 * Gerencia inteligência de dados, evolução histórica e auditoria de segurança.
 */
export const AdminDashboard = () => {
  const [data, setData] = useState<any>({ 
    stats: null, 
    chart: [], 
    photos: { data: [], pagination: { totalPages: 1 } }, 
    promoters: [], 
    days: [] 
  });
  const [logs, setLogs] = useState<any[]>([]);
  const [selectedPhoto, setSelectedPhoto] = useState<any>(null);

  const today = new Date().toISOString().split('T')[0];
  const [filters, setFilters] = useState({ startDate: today, endDate: today, page: 1, limit: 5 });

  /** Traduz eventos técnicos para rótulos legíveis e trata rotas de upload */
  const formatEvent = (log: any) => {
    if (log.eventType && EVENT_LABELS[log.eventType]) return EVENT_LABELS[log.eventType];
    if (log.route?.includes('/upload')) return 'Upload de Foto';
    return log.eventType?.replace(/_/g, ' ') || 'Ação do Sistema';
  };

  /** Carrega KPIs, Galeria e Dados de Gráficos de forma assíncrona */
  const loadData = useCallback(async () => {
    try {
      const query = `?page=${filters.page}&limit=${filters.limit}&startDate=${filters.startDate}&endDate=${filters.endDate}`;
      const result = await adminApi.getDashboardData(query);
      
      setData({
        stats: result.stats || null,
        chart: Array.isArray(result.chart) ? result.chart : [],
        photos: result.photos?.data ? result.photos : { data: [], pagination: { totalPages: 1 } },
        promoters: Array.isArray(result.promoters) ? result.promoters : [],
        days: Array.isArray(result.days) ? result.days : []
      });
    } catch (e: any) { 
      console.error("Dashboard Load Error:", e);
      if (e.message?.includes("401") || e.message?.includes("Não autorizado")) {
        handleLogout();
      }
    } finally {}
  }, [filters]);

  /** Atualiza a trilha de auditoria filtrando os 10 eventos mais recentes e relevantes */
  const refreshLogs = useCallback(async () => {
    try {
      const result = await adminApi.fetchLogs();
      if (Array.isArray(result)) {
        // Exibe apenas os 10 logs mais recentes que sejam de interesse administrativo
        const filteredLogs = result
          .filter((log: any) => 
            log.route?.includes('/upload') || 
            log.eventType || 
            log.responseStatus >= 400 // Inclui erros de sistema automaticamente
          )
          .slice(0, 10);
        setLogs(filteredLogs);
      }
    } catch (e) { console.error("Logs Error:", e); }
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    window.location.href = '/';
  };

  useEffect(() => { loadData(); }, [loadData]);
  
  useEffect(() => {
    const interval = setInterval(refreshLogs, 2000);
    return () => clearInterval(interval);
  }, [refreshLogs]);

  const handleExport = async () => {
    try {
        const blob = await adminApi.downloadLogs();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `auditoria-${today}.csv`;
        a.click();
    } catch (e) { alert("Erro ao baixar logs."); }
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-white to-[#b3b3b3] font-sans flex flex-col text-black pb-20">
      <nav className="bg-white/80 backdrop-blur-md border-b border-gray-200 px-8 py-4 flex justify-between items-center sticky top-0 z-50 shadow-sm">
        <div className="flex items-center gap-4">
          <img src={logoNexlab} alt="Nexlab" className="h-8" />
          <h1 className="text-black font-bold tracking-tight uppercase text-sm border-l pl-4 border-gray-300">Admin</h1>
        </div>
        <button onClick={handleLogout} className="flex items-center gap-2 text-gray-600 hover:text-black font-bold text-sm uppercase">
          <LogOut size={18} /> Sair
        </button>
      </nav>

      <main className="p-8 max-w-[1400px] mx-auto w-full space-y-8">
        {/* FILTROS */}
        <div className="bg-white p-6 rounded-sm shadow-lg flex flex-wrap items-end gap-6 border border-gray-100">
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-bold uppercase text-gray-400">Início</label>
            <input type="date" value={filters.startDate} onChange={e => setFilters({...filters, startDate: e.target.value, page: 1})} className="border p-2 rounded-sm text-sm outline-none font-bold" />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-bold uppercase text-gray-400">Fim</label>
            <input type="date" value={filters.endDate} onChange={e => setFilters({...filters, endDate: e.target.value, page: 1})} className="border p-2 rounded-sm text-sm outline-none font-bold" />
          </div>
          <button onClick={() => setFilters({...filters, startDate: today, endDate: today, page: 1})} className="flex items-center gap-2 bg-gray-100 px-4 py-2 rounded-sm text-[10px] font-black uppercase hover:bg-black hover:text-white transition-all mb-[1px]">
            <Calendar size={12} /> Hoje
          </button>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <StatCard title="Total Filtrado" value={data.stats?.fotosHoje ?? 0} icon={<ImageIcon size={20} />} />
          <StatCard title="Promotores Ativos" value={data.stats?.totalPromotores ?? 0} icon={<Users size={20} />} />
        </div>

        {/* GRÁFICOS */}
        <div className="grid grid-cols-12 gap-6">
          <div className="col-span-12 lg:col-span-8 bg-white p-8 rounded-sm shadow-xl border border-gray-100">
            <h3 className="text-[10px] font-bold text-black mb-8 uppercase tracking-widest flex items-center gap-2"><Clock size={14}/> Fluxo por Hora</h3>
            <div className="h-[300px] w-full min-h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.chart}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                  <XAxis dataKey="hour" axisLine={false} tickLine={false} tick={{fill: '#999', fontSize: 10}} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#999', fontSize: 10}} />
                  <Tooltip cursor={{fill: '#f8f9fa'}} contentStyle={{borderRadius: '4px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)'}} />
                  <Bar dataKey="count" fill="#000" radius={[2, 2, 0, 0]} barSize={32} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="col-span-12 lg:col-span-4 bg-white p-8 rounded-sm shadow-xl border border-gray-100 flex flex-col">
            <h3 className="text-[10px] font-bold text-black mb-8 uppercase tracking-widest flex items-center gap-2"><Users size={14}/> Ranking</h3>
            <div className="space-y-4 flex-1">
              {data.promoters?.length > 0 ? data.promoters.map((p: any, i: number) => (
                <div key={i} className="flex items-center justify-between border-b border-gray-50 pb-3">
                  <span className="text-xs font-bold text-gray-600">#{i+1} {p.email?.split('@')[0]}</span>
                  <span className="text-[9px] font-black bg-black text-white px-2 py-1 rounded-sm uppercase">{p.total} fotos</span>
                </div>
              )) : <p className="text-[10px] text-gray-400 uppercase text-center mt-10">Sem dados no período.</p>}
            </div>
          </div>
        </div>

        {/* EVOLUÇÃO DIÁRIA */}
        <div className="bg-white p-8 rounded-sm shadow-xl border border-gray-100">
          <h3 className="text-[10px] font-bold text-black mb-8 uppercase tracking-widest flex items-center gap-2"><Calendar size={14}/> Evolução Histórica (Fotos/Dia)</h3>
          <div className="h-[250px] w-full min-h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data.days}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fill: '#999', fontSize: 10}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#999', fontSize: 10}} />
                <Tooltip />
                <Line type="monotone" dataKey="count" stroke="#000" strokeWidth={3} dot={{r: 4, fill: '#000'}} activeDot={{r: 6}} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* GALERIA */}
        <div className="bg-white rounded-sm shadow-xl border border-gray-100 overflow-hidden">
          <div className="px-8 py-5 border-b flex justify-between items-center bg-white">
            <div className="flex items-baseline gap-4">
              <h3 className="font-bold text-black uppercase tracking-widest text-[10px]">Repositório de Capturas</h3>
              <span className="text-[10px] font-black text-gray-400 uppercase">Total Real: {data.stats?.totalPhotos ?? 0}</span>
            </div>
            <select value={filters.limit} onChange={e => setFilters({...filters, limit: Number(e.target.value), page: 1})} className="text-[10px] border p-1 rounded-sm font-bold uppercase outline-none">
              <option value={5}>5 por pág</option>
              <option value={10}>10 por pág</option>
            </select>
          </div>
          <div className="p-8 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-6 min-h-[400px]">
            {data.photos?.data?.length > 0 ? data.photos.data.map((photo: any) => (
              <div key={photo.id} onClick={() => setSelectedPhoto(photo)} className="group relative aspect-[9/16] bg-black rounded-sm overflow-hidden border border-gray-200 cursor-pointer shadow-md">
                <img src={`http://localhost:3000${photo.imageUrl}`} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-center items-center">
                  <QrCode size={24} className="text-white mb-2" />
                  <span className="text-[9px] text-white font-bold uppercase tracking-widest">Ver QR</span>
                </div>
              </div>
            )) : <div className="col-span-full py-20 text-center text-gray-400 text-[10px] uppercase tracking-widest">Nenhuma foto encontrada</div>}
          </div>
          <div className="px-8 py-4 border-t flex justify-center items-center gap-8 bg-gray-50/30 font-bold">
            <button disabled={filters.page === 1} onClick={() => setFilters({...filters, page: filters.page - 1})} className="p-2 disabled:opacity-10 hover:bg-white rounded-full transition-all"><ChevronLeft size={20}/></button>
            <span className="text-[10px] uppercase tracking-widest text-gray-400">Pág {filters.page} de {data.photos?.pagination?.totalPages || 1}</span>
            <button disabled={filters.page >= (data.photos?.pagination?.totalPages || 1)} onClick={() => setFilters({...filters, page: filters.page + 1})} className="p-2 disabled:opacity-10 hover:bg-white rounded-full transition-all"><ChevronRight size={20}/></button>
          </div>
        </div>

        {/* AUDITORIA */}
        <div className="bg-white rounded-sm shadow-xl border border-gray-100 overflow-hidden">
          <div className="px-8 py-5 border-b flex justify-between items-center bg-white">
            <h3 className="font-bold text-black uppercase tracking-widest text-[10px] flex items-center gap-3">
              <ShieldCheck size={14} className="text-green-600"/> Monitoramento Live
              <span className="flex h-2 w-2 rounded-full bg-green-500 animate-ping"></span>
            </h3>
            <button onClick={handleExport} className="bg-black text-white text-[9px] font-black px-4 py-2 rounded-sm flex items-center gap-2 uppercase hover:bg-gray-800 transition-colors">
              <Download size={12} /> Logs completos
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-gray-50/50 border-b">
                  <th className="px-8 py-4 text-[9px] font-black uppercase text-gray-400">Data</th>
                  <th className="px-6 py-4 text-[9px] font-black uppercase text-gray-400">Usuário</th>
                  <th className="px-6 py-4 text-[9px] font-black uppercase text-gray-400 text-center">Ação Realizada</th>
                  <th className="px-6 py-4 text-[9px] font-black uppercase text-gray-400 text-right">Status</th>
                </tr>
              </thead>
              <tbody>
                {logs.length > 0 ? logs.map((log: any) => (
                  <tr key={log.id} className="border-b hover:bg-gray-50/30 transition-colors">
                    <td className="px-8 py-4 text-[10px] font-medium text-gray-500">{new Date(log.createdAt).toLocaleString()}</td>
                    <td className="px-6 py-4 text-xs font-bold text-gray-800">{log.user?.email || 'Sistema'}</td>
                    <td className="px-6 py-4 text-center">
                      <span className={`text-[9px] font-black px-3 py-1.5 rounded-sm uppercase tracking-tighter ${log.responseStatus >= 400 ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'}`}>
                        {formatEvent(log)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right font-mono text-[10px] font-bold text-gray-400">{log.responseStatus}</td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan={4} className="p-10 text-center text-gray-400 text-[10px] uppercase tracking-widest animate-pulse">
                      Aguardando sincronização de dados...
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* MODAL QR CODE */}
      {selectedPhoto && (
        <div className="fixed inset-0 bg-black/90 z-[100] flex items-center justify-center p-4 backdrop-blur-sm" onClick={() => setSelectedPhoto(null)}>
          <div className="bg-white p-10 rounded-sm max-w-sm w-full flex flex-col items-center shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="bg-white p-2 mb-8 border border-gray-100">
              <QRCodeSVG value={`http://localhost:3000${selectedPhoto.imageUrl}`} size={220} includeMargin={false} />
            </div>
            <p className="text-[10px] font-bold text-gray-400 uppercase mb-8 text-center tracking-widest">Escaneie para download</p>
            <Button label="Fechar Visualização" onClick={() => setSelectedPhoto(null)} />
          </div>
        </div>
      )}
    </div>
  );
};