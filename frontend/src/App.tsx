import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { TotemLayout } from './layouts/TotemLayout';
import { Login } from './pages/Login';
import { TotemExperience } from './pages/TotemExperience';
import { AdminDashboard } from './pages/AdminDashboard';

/**
 * Guarda de Rota: Restringe o acesso apenas a usuários autenticados como Admin.
 */
const AdminRoute = ({ children }: { children: React.ReactNode }) => {
  const token = localStorage.getItem('@Nexlab:token');
  const role = localStorage.getItem('@Nexlab:role');
  
  if (!token || role !== 'ADMIN') return <Navigate to="/" />;
  return <>{children}</>;
};

/**
 * Guarda de Rota: Garante que o usuário esteja autenticado para acessar o Totem.
 */
const TotemRoute = ({ children }: { children: React.ReactNode }) => {
  const token = localStorage.getItem('@Nexlab:token');
  if (!token) return <Navigate to="/" />;
  return <>{children}</>;
};

/**
 * Configuração central de roteamento da aplicação Nexlab PhotoOpp.
 */
function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Portal de Acesso */}
        <Route path="/" element={
          <TotemLayout>
            <Login />
          </TotemLayout>
        } />

        {/* Interface Operacional do Totem */}
        <Route path="/totem" element={
          <TotemRoute>
            <TotemLayout>
              <TotemExperience />
            </TotemLayout>
          </TotemRoute>
        } />

        {/* Gestão e Auditoria (Admin) */}
        <Route path="/admin" element={
          <AdminRoute>
            <AdminDashboard />
          </AdminRoute>
        } />

        {/* Fallback de Segurança */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;