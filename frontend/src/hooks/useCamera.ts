import { useRef, useCallback, useState } from 'react';
import Webcam from 'react-webcam';

/**
 * Gerencia o ciclo de vida da captura de fotos, incluindo reset e configuração de resolução.
 */
export const useCamera = () => {
  const webcamRef = useRef<Webcam>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);

  /** Captura o frame atual da webcam em alta definição (FHD) */
  const capturePhoto = useCallback(() => {
    if (webcamRef.current) {
      const imageSrc = webcamRef.current.getScreenshot({
        width: 1920,
        height: 1080
      });
      setCapturedImage(imageSrc);
    }
  }, []);

  /** Limpa a imagem capturada e reinicia o fluxo da câmera */
  const resetPhoto = () => setCapturedImage(null);

  return { 
    webcamRef, 
    capturedImage, 
    capturePhoto, 
    resetPhoto, 
    setCapturedImage 
  };
};