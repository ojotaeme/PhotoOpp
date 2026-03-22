import React, { useState } from 'react';
import { Mail, Lock } from 'lucide-react';
import { authApi } from '../services/auth';
import { Input } from '../components/Input';
import { Button } from '../components/Button';
import logoNexlab from '../assets/logo.png';

/**
 * Interface de autenticação centralizada. 
 * Redireciona usuários conforme privilégios (ADMIN -> Dashboard, PROMOTER -> Totem).
 */
export const Login = () => {
  const [credentials, setCredentials] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const data = await authApi.login(credentials);
      localStorage.setItem('@Nexlab:token', data.token);
      localStorage.setItem('@Nexlab:role', data.user.role);

      window.location.href = data.user.role === 'ADMIN' ? '/admin' : '/totem';
    } catch (err: any) {
      setError('Credenciais inválidas. Verifique os dados e tente novamente.');
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleLogin} className="flex flex-col h-full w-full p-10 bg-white">
      <img src={logoNexlab} alt="Nexlab" className="h-10 object-contain mt-10 self-center" />
      
      <div className="flex-1 flex flex-col justify-center gap-8">
        <div className="text-center">
          <h1 className="text-4xl font-black text-black uppercase tracking-tighter">Login</h1>
        </div>

        <div className="space-y-4">
          <Input name="email" type="email" placeholder="E-mail profissional" icon={Mail} required value={credentials.email} onChange={e => setCredentials({...credentials, email: e.target.value})} />
          <Input name="password" type="password" placeholder="Senha" icon={Lock} required value={credentials.password} onChange={e => setCredentials({...credentials, password: e.target.value})} />
          {error && <p className="text-red-500 text-[10px] font-bold text-center uppercase">{error}</p>}
        </div>
      </div>

      <Button type="submit" disabled={loading} label={loading ? 'Carregando...' : 'Entrar'} />
    </form>
  );
};