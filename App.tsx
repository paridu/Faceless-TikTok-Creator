import React, { useState, useEffect } from 'react';
import { AppStep, ProductData, GeneratedScript, GeneratedAssets } from './types';
import StepInput from './components/StepInput';
import StepScript from './components/StepScript';
import StepResult from './components/StepResult';
import { generateSalesScript, generateMarketingVideo, generateVoiceover } from './services/geminiService';

// Removed conflicting type declaration for aistudio

const App: React.FC = () => {
  const [step, setStep] = useState<AppStep>(AppStep.INPUT);
  const [hasKey, setHasKey] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingStatus, setLoadingStatus] = useState('');
  
  // Data State
  const [productData, setProductData] = useState<ProductData | null>(null);
  const [script, setScript] = useState<GeneratedScript | null>(null);
  const [assets, setAssets] = useState<GeneratedAssets>({ videoUrl: null, audioUrl: null });

  // Initial Key Check
  useEffect(() => {
    checkKey();
  }, []);

  const checkKey = async () => {
    // Cast window to any to access aistudio to avoid type conflicts with existing definitions
    if ((window as any).aistudio) {
      const selected = await (window as any).aistudio.hasSelectedApiKey();
      setHasKey(selected);
    }
  };

  const handleSelectKey = async () => {
    if ((window as any).aistudio) {
      await (window as any).aistudio.openSelectKey();
      // Assume success as per instructions
      setHasKey(true);
    }
  };

  // Step 1 -> 2: Generate Script
  const handleProductSubmit = async (data: ProductData) => {
    setProductData(data);
    setIsLoading(true);
    setLoadingStatus('กำลังวิเคราะห์สินค้าและเขียนบท... (Writing Script)');
    
    try {
      const generatedScript = await generateSalesScript(data.name, data.description, data.persona);
      setScript(generatedScript);
      setStep(AppStep.SCRIPTING);
    } catch (error) {
      console.error(error);
      alert('เกิดข้อผิดพลาดในการสร้างสคริปต์ กรุณาลองใหม่');
    } finally {
      setIsLoading(false);
    }
  };

  // Step 2 -> 3 -> 4: Generate Media
  const handleScriptConfirm = async (finalScriptText: string) => {
    if (!productData) return;
    
    setStep(AppStep.GENERATING);
    setIsLoading(true);

    try {
      // Parallel execution is possible, but doing serial for better status updates in UI
      // 1. Voiceover
      setLoadingStatus('กำลังสร้างเสียงพากย์ AI... (Generating Voiceover)');
      const audioUrl = await generateVoiceover(finalScriptText);
      
      // 2. Video (Veo) - Takes longer
      setLoadingStatus('กำลังสร้างวิดีโอด้วย Veo 3.1 (อาจใช้เวลา 1-2 นาที)... (Generating Video)');
      const videoUrl = await generateMarketingVideo(productData.name, productData.description);

      setAssets({ videoUrl, audioUrl });
      setStep(AppStep.RESULT);
    } catch (error) {
      console.error(error);
      alert('เกิดข้อผิดพลาดในการสร้างสื่อ (อาจเป็นปัญหาที่ API Key หรือ Quota)');
      // Go back to script step if failed
      setStep(AppStep.SCRIPTING); 
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setProductData(null);
    setScript(null);
    setAssets({ videoUrl: null, audioUrl: null });
    setStep(AppStep.INPUT);
  };

  // View for API Key Selection
  if (!hasKey) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900 p-4">
        <div className="text-center space-y-6 max-w-md">
           <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-pink-500">
            Faceless TikTok Creator
          </h1>
          <p className="text-gray-300 thai-font">
            ในการใช้งาน Veo (สร้างวิดีโอ) และ Gemini คุณต้องเชื่อมต่อ API Key ก่อน
          </p>
          <button 
            onClick={handleSelectKey}
            className="bg-white text-gray-900 px-6 py-3 rounded-full font-bold shadow-lg hover:bg-gray-100 transition-transform hover:scale-105"
          >
            🔑 เชื่อมต่อ Google AI Studio Key
          </button>
          <div className="text-xs text-gray-500 mt-4">
            <a href="https://ai.google.dev/gemini-api/docs/billing" target="_blank" rel="noreferrer" className="underline hover:text-cyan-400">
              Billing Documentation
            </a>
          </div>
        </div>
      </div>
    );
  }

  // Loading Overlay
  if (step === AppStep.GENERATING) {
    return (
      <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center p-4">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-cyan-500 mb-6"></div>
        <h2 className="text-xl font-bold text-white mb-2 thai-font text-center">{loadingStatus}</h2>
        <p className="text-gray-400 text-sm animate-pulse text-center">AI กำลังทำงาน... ห้ามปิดหน้าต่างนี้</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white pb-20">
      {/* Header */}
      <header className="p-4 border-b border-gray-800 bg-gray-900/95 sticky top-0 z-10 backdrop-blur">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-pink-500">
            Faceless Creator
          </h1>
          <div className="text-xs text-gray-500 border border-gray-700 px-2 py-1 rounded">
             Powered by Gemini 2.5 & Veo
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto p-4 mt-6">
        {step === AppStep.INPUT && (
          <StepInput onNext={handleProductSubmit} isLoading={isLoading} />
        )}
        
        {step === AppStep.SCRIPTING && script && (
          <StepScript 
            script={script} 
            onNext={handleScriptConfirm} 
            onBack={() => setStep(AppStep.INPUT)} 
          />
        )}

        {step === AppStep.RESULT && (
          <StepResult assets={assets} onReset={handleReset} />
        )}
      </main>
    </div>
  );
};

export default App;