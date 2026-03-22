const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export const authApi = {
  async login(credentials: { email: string; password: string }) {
    const response = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'E-mail ou senha incorretos');
    }

    return data;
  },

  logout() {
    localStorage.removeItem('@Nexlab:token');
    localStorage.removeItem('@Nexlab:role');
    window.location.href = '/';
  }
};