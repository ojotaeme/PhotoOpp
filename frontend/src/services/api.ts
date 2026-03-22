const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export const api = {
  async uploadPhoto(capturedImage: string) {
    const token = localStorage.getItem('@Nexlab:token');
    
    if (!token) throw new Error("Sessão expirada. Faça login novamente.");

    const fetchResponse = await fetch(capturedImage);
    const blob = await fetchResponse.blob();
    
    const formData = new FormData();
    formData.append('photo', blob, 'capture.jpg');

    const response = await fetch(`${BASE_URL}/api/photos/upload`, {
      method: 'POST',
      headers: { 
        'Authorization': `Bearer ${token}` // Garante o formato correto
      },
      body: formData
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Erro no upload');
    }

    return response.json();
  }
};