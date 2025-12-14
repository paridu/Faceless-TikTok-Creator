import React, { useState } from 'react';
import { Persona, ProductData } from '../types';
import { generateProductImage } from '../services/geminiService';

interface Props {
  onNext: (data: ProductData) => void;
  isLoading: boolean;
}

const StepInput: React.FC<Props> = ({ onNext, isLoading }) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [persona, setPersona] = useState<Persona>(Persona.REAL_USER);
  
  // Image Generation State
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [isImageLoading, setIsImageLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name && description) {
      onNext({ name, description, persona });
    }
  };

  const handleGenerateImage = async () => {
    if (!name || !description) {
        alert("กรุณากรอกชื่อสินค้าและรายละเอียดก่อน (Please enter product info first)");
        return;
    }
    setIsImageLoading(true);
    try {
        const imageUrl = await generateProductImage(name, description);
        setGeneratedImage(imageUrl);
    } catch (e) {
        console.error(e);
        alert("เกิดข้อผิดพลาดในการสร้างภาพ (Failed to generate image)");
    } finally {
        setIsImageLoading(false);
    }
  };

  return (
    <div className="w-full max-w-lg mx-auto bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-700">
      <h2 className="text-2xl font-bold mb-6 text-cyan-400 thai-font">STEP 1: ข้อมูลสินค้า & บทบาท</h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1 thai-font">ชื่อสินค้า (Product Name)</label>
          <input
            type="text"
            className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-cyan-500 text-white"
            placeholder="e.g. ครีมกันแดดล่องหน"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1 thai-font">จุดเด่น / รายละเอียด (Selling Points)</label>
          <textarea
            className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-cyan-500 text-white h-24"
            placeholder="e.g. ซึมไว ไม่เหนียว หน้าไม่ลอย กันน้ำดีเยี่ยม"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
          />
        </div>

        {/* AI Image Generation Section */}
        <div className="py-2">
            {!generatedImage ? (
                <button
                    type="button"
                    onClick={handleGenerateImage}
                    disabled={isImageLoading || !name || !description}
                    className="flex items-center justify-center gap-2 w-full py-2 border border-dashed border-cyan-500/50 bg-cyan-900/10 hover:bg-cyan-900/20 text-cyan-400 rounded-lg text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed thai-font"
                >
                    {isImageLoading ? (
                        <>
                           <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                           กำลังวาดภาพ... (Drawing...)
                        </>
                    ) : (
                        <>
                           ✨ สร้างภาพตัวอย่างสินค้าด้วย AI (Generate Example Image)
                        </>
                    )}
                </button>
            ) : (
                <div className="relative group">
                    <div className="text-xs text-gray-400 mb-1 thai-font">ภาพตัวอย่างสินค้า (Generated Placeholder):</div>
                    <img 
                        src={generatedImage} 
                        alt="AI Generated Product" 
                        className="w-full h-48 object-cover rounded-lg border border-gray-600 shadow-md"
                    />
                     <button
                        type="button"
                        onClick={handleGenerateImage}
                        disabled={isImageLoading}
                        className="absolute top-8 right-2 bg-black/60 hover:bg-black/80 text-white p-2 rounded-full text-xs backdrop-blur-sm transition-all"
                        title="Regenerate"
                    >
                        🔄
                    </button>
                </div>
            )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1 thai-font">เลือกบทบาท (Persona)</label>
          <div className="grid grid-cols-1 gap-2">
            {Object.values(Persona).map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => setPersona(p)}
                className={`text-left px-4 py-3 rounded-lg border transition-all thai-font ${
                  persona === p
                    ? 'bg-cyan-900/50 border-cyan-500 text-cyan-100'
                    : 'bg-gray-700 border-gray-600 text-gray-400 hover:bg-gray-600'
                }`}
              >
                {p}
              </button>
            ))}
          </div>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full mt-6 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold py-3 rounded-lg transition-all transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed thai-font"
        >
          {isLoading ? 'กำลังคิดสคริปต์...' : 'ไปต่อ: สร้างสคริปต์ (Next)'}
        </button>
      </form>
    </div>
  );
};

export default StepInput;