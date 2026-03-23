import { useState, useEffect } from 'react';
import Webcam from 'react-webcam';
import { QRCodeSVG } from 'qrcode.react';
import { useCamera } from '../hooks/useCamera';
import { api } from '../services/api';
import { Button } from '../components/Button';

import logoNexlab from '../assets/logo.png';
import frameSVG from '../assets/frame.svg';

/**
 * Definição dos estados possíveis no fluxo da experiência do usuário.
 */
type Step = 'HOME' | 'CAMERA' | 'COUNTDOWN' | 'REVIEW' | 'FINAL' | 'LAST';

/**
 * Componente principal da experiência do Totem.
 * Gerencia o ciclo de captura, processamento de imagem e entrega via QR Code.
 */
export const TotemExperience = () => {
  const [step, setStep] = useState<Step>('HOME');
  const [timer, setTimer] = useState(3);
  const [showThanks, setShowThanks] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [qrCodeData, setQrCodeData] = useState<string | null>(null);

  const { webcamRef, capturedImage, capturePhoto, resetPhoto } = useCamera();

  const videoConstraints = { width: 1920, height: 1080, facingMode: "user" };

  /**
   * Envia a imagem capturada para o backend para aplicação de moldura e armazenamento.
   */
  const handleUpload = async () => {
    if (!capturedImage) return;
    setIsProcessing(true);
    setError(null);
    
    try {
      const data = await api.uploadPhoto(capturedImage);
      // Agora usa a URL direta do Cloudinary retornada pela API
      setQrCodeData(data.photo.imageUrl);
      setStep('FINAL');
    } catch (err: any) {
      setError('Falha ao processar imagem. Tente novamente.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRetake = () => {
    resetPhoto();
    setQrCodeData(null);
    setStep('CAMERA');
  };

  const finishExperience = () => {
    setShowThanks(true);
    setTimeout(() => {
      setShowThanks(false);
      setStep('LAST');
    }, 2500);
  };

  // Lógica do temporizador para captura automática
  useEffect(() => {
    if (step === 'COUNTDOWN') {
      const interval = setInterval(() => {
        setTimer((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            capturePhoto();
            setStep('REVIEW');
            return 3;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [step, capturePhoto]);

  // Retorno automático para a Home após 15 segundos de inatividade no último step
  useEffect(() => {
    if (step === 'LAST') {
      const timeout = setTimeout(() => {
        handleRetake();
        setStep('HOME');
      }, 15000);
      return () => clearTimeout(timeout);
    }
  }, [step]);

  /** Renderização das Etapas */
  if (step === 'HOME') return (
    <div className="flex flex-col h-full w-full p-8 text-center">
      <img src={logoNexlab} alt="Logo" className="h-12 object-contain mt-8 self-center" />
      <div className="flex-1 flex flex-col justify-center">
        <h1 className="text-6xl font-bold text-black tracking-tighter leading-tight uppercase">Photo<br />Opp</h1>
      </div>
      <Button label="Iniciar" onClick={() => setStep('CAMERA')} />
    </div>
  );

  if (step === 'CAMERA' || step === 'COUNTDOWN') return (
    <div className="flex flex-col h-full w-full p-8 relative">
      <div className="flex-1 flex items-center justify-center pb-24">
        <div className="relative h-full aspect-[887/1577]">
          <div className="absolute inset-0 bg-black rounded-2xl overflow-hidden border-2 border-dashed border-gray-400">
            <Webcam audio={false} ref={webcamRef} screenshotFormat="image/jpeg" videoConstraints={videoConstraints} width={1920} height={1080} mirrored className="w-full h-full object-cover" />
            {step === 'COUNTDOWN' && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                <span className="text-9xl font-black text-white animate-pulse">{timer}</span>
              </div>
            )}
          </div>
          <div className="absolute top-full left-0 w-full mt-6 flex justify-center">
            <button onClick={() => setStep('COUNTDOWN')} disabled={step === 'COUNTDOWN'} className="w-20 h-20 rounded-full border-4 border-gray-400 flex items-center justify-center transition-opacity disabled:opacity-50">
              <div className="w-16 h-16 rounded-full border-2 border-gray-300" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  if (step === 'REVIEW') return (
    <div className="flex flex-col h-full w-full p-8">
      <div className="flex-1 flex items-center justify-center pb-24">
        <div className="relative h-full aspect-[887/1577]">
          <div className="absolute inset-[2px] bg-[#2a2a2a] rounded-2xl overflow-hidden">
            <img src={capturedImage!} alt="Review" className="w-full h-full object-cover" />
          </div>
          <img src={frameSVG} alt="Frame" className="absolute inset-0 w-full h-full pointer-events-none z-10" />
          <div className="absolute top-full left-0 w-full mt-6 flex gap-4">
            <Button label="Refazer" variant="secondary" onClick={handleRetake} />
            <Button label={isProcessing ? 'Enviando...' : 'Continuar'} onClick={handleUpload} disabled={isProcessing} />
          </div>
        </div>
      </div>
      {error && <p className="absolute bottom-4 left-0 w-full text-center text-red-500 font-bold text-xs uppercase">{error}</p>}
    </div>
  );

  if (step === 'FINAL') return (
    <div className="flex flex-col h-full w-full p-8 relative">
      <div className="flex-1 flex items-center justify-center pb-24">
        <div className="relative h-full aspect-[887/1577]">
          <div className="absolute inset-[2px] bg-[#2a2a2a] rounded-2xl overflow-hidden">
            <img src={capturedImage!} alt="Final" className="w-full h-full object-cover" />
          </div>
          <img src={frameSVG} className="absolute inset-0 w-full h-full pointer-events-none z-10" />
          <div className="absolute bottom-[10%] right-[6%] bg-white p-3 rounded-xl shadow-2xl z-20 flex flex-col items-center border">
            <span className="text-[9px] uppercase font-bold text-gray-500 mb-2">Download</span>
            {qrCodeData ? <QRCodeSVG value={qrCodeData} size={80} /> : <div className="w-20 h-20 bg-gray-100 animate-pulse" />}
          </div>
          <div className="absolute top-full left-0 w-full mt-6">
            <Button label="Finalizar" onClick={finishExperience} />
          </div>
        </div>
      </div>
      {showThanks && (
        <div className="absolute inset-0 bg-black/60 z-50 flex items-center justify-center p-8 backdrop-blur-sm transition-opacity">
          <div className="bg-white w-full max-w-xs py-10 px-6 shadow-2xl text-center rounded-xl border">
            <h2 className="text-3xl font-black mb-2 tracking-tighter uppercase">Obrigado!</h2>
            <p className="text-gray-500 text-xs font-medium uppercase tracking-widest">Digitalize o código para baixar sua foto.</p>
          </div>
        </div>
      )}
    </div>
  );

  // STEP: LAST
  return (
    <div className="flex flex-col h-full w-full p-8 text-center relative">
      <img src={logoNexlab} alt="Logo" className="h-12 self-center mt-8" />
      <div className="flex-1 flex flex-col items-center justify-center">
        <h2 className="text-5xl font-bold text-gray-800 mb-4 uppercase">Obrigado!</h2>
        <p className="text-gray-600 mb-10 text-base uppercase">Escaneie o código para baixar sua lembrança.</p>
        <div className="bg-white p-6 shadow-2xl rounded-2xl border">
          <QRCodeSVG value={qrCodeData!} size={250} includeMargin={false} />
        </div>
      </div>
      <Button label="Novo Participante" onClick={() => { handleRetake(); setStep('HOME'); }} />
    </div>
  );
};