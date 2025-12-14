import React, { useState, useEffect } from 'react';
import { GeneratedScript } from '../types';

interface Props {
  script: GeneratedScript;
  onNext: (finalScript: string) => void;
  onBack: () => void;
}

const StepScript: React.FC<Props> = ({ script, onNext, onBack }) => {
  const [editableScript, setEditableScript] = useState('');

  useEffect(() => {
    // Combine parts for the editable area initially
    setEditableScript(script.fullText);
  }, [script]);

  return (
    <div className="w-full max-w-lg mx-auto bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-700">
      <h2 className="text-2xl font-bold mb-4 text-cyan-400 thai-font">STEP 2: ตรวจสอบสคริปต์</h2>
      <p className="text-gray-400 text-sm mb-6 thai-font">AI เขียนให้แล้ว คุณสามารถแก้ไขได้ก่อนนำไปสร้างเสียง</p>

      <div className="space-y-4 mb-6">
        <div className="bg-gray-700/50 p-3 rounded border-l-4 border-yellow-500">
            <span className="text-xs text-yellow-500 uppercase font-bold block mb-1">Hook</span>
            <p className="text-gray-200 text-sm thai-font">{script.hook}</p>
        </div>
        <div className="bg-gray-700/50 p-3 rounded border-l-4 border-blue-500">
            <span className="text-xs text-blue-500 uppercase font-bold block mb-1">Body</span>
            <p className="text-gray-200 text-sm thai-font">{script.body}</p>
        </div>
        <div className="bg-gray-700/50 p-3 rounded border-l-4 border-green-500">
            <span className="text-xs text-green-500 uppercase font-bold block mb-1">CTA</span>
            <p className="text-gray-200 text-sm thai-font">{script.cta}</p>
        </div>
      </div>

      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-300 mb-1 thai-font">แก้ไขบทพูดเต็ม (สำหรับ AI พากย์เสียง)</label>
        <textarea
          value={editableScript}
          onChange={(e) => setEditableScript(e.target.value)}
          className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-cyan-500 text-white h-32 thai-font"
        />
      </div>

      <div className="flex gap-3">
        <button
          onClick={onBack}
          className="flex-1 bg-gray-700 hover:bg-gray-600 text-white font-bold py-3 rounded-lg transition-colors thai-font"
        >
          กลับ (Back)
        </button>
        <button
          onClick={() => onNext(editableScript)}
          className="flex-2 w-full bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-400 hover:to-purple-500 text-white font-bold py-3 rounded-lg transition-all shadow-lg shadow-pink-500/30 thai-font"
        >
          สร้างวิดีโอ & เสียง (Generate Media)
        </button>
      </div>
    </div>
  );
};

export default StepScript;
