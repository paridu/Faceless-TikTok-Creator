import React from 'react';
import { GeneratedAssets } from '../types';

interface Props {
  assets: GeneratedAssets;
  onReset: () => void;
}

const StepResult: React.FC<Props> = ({ assets, onReset }) => {
  return (
    <div className="w-full max-w-lg mx-auto bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-700">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-500/20 text-green-400 mb-4">
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
        </div>
        <h2 className="text-2xl font-bold text-white mb-2 thai-font">เสร็จเรียบร้อย! (Success)</h2>
        <p className="text-gray-400 text-sm thai-font">ดาวน์โหลดไฟล์แล้วนำไปตัดต่อใน TikTok ได้เลย</p>
      </div>

      <div className="space-y-6">
        {/* Video Section */}
        {assets.videoUrl && (
          <div className="bg-gray-900 rounded-lg p-4 border border-gray-700">
            <h3 className="text-sm font-semibold text-gray-300 mb-3 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-purple-500"></span>
              AI Video (Veo)
            </h3>
            <div className="relative aspect-[9/16] w-full max-w-[180px] mx-auto bg-black rounded overflow-hidden shadow-lg mb-3">
              <video 
                src={assets.videoUrl} 
                controls 
                loop 
                className="w-full h-full object-cover"
              />
            </div>
            <a 
              href={assets.videoUrl} 
              download="tiktok_faceless_video.mp4"
              className="block w-full text-center py-2 bg-gray-700 hover:bg-gray-600 rounded text-sm text-white transition-colors thai-font"
            >
              ดาวน์โหลดวิดีโอ ⬇️
            </a>
          </div>
        )}

        {/* Audio Section */}
        {assets.audioUrl && (
          <div className="bg-gray-900 rounded-lg p-4 border border-gray-700">
            <h3 className="text-sm font-semibold text-gray-300 mb-3 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-cyan-500"></span>
              AI Voiceover
            </h3>
            <audio controls src={assets.audioUrl} className="w-full mb-3 h-8" />
            <a 
              href={assets.audioUrl} 
              download="tiktok_faceless_audio.wav"
              className="block w-full text-center py-2 bg-gray-700 hover:bg-gray-600 rounded text-sm text-white transition-colors thai-font"
            >
              ดาวน์โหลดเสียง ⬇️
            </a>
          </div>
        )}
      </div>

      <div className="mt-8 pt-6 border-t border-gray-700">
        <button
          onClick={onReset}
          className="w-full bg-transparent border border-gray-600 hover:bg-gray-700 text-gray-300 font-bold py-3 rounded-lg transition-colors thai-font"
        >
          เริ่มทำคลิปใหม่ (Create New)
        </button>
      </div>
    </div>
  );
};

export default StepResult;
