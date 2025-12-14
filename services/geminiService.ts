import { GoogleGenAI, Modality, Type } from "@google/genai";
import { GeneratedScript, Persona } from "../types";

// Fix: Add webkitAudioContext to Window interface to resolve type error
declare global {
  interface Window {
    webkitAudioContext: typeof AudioContext;
  }
}

// Helper to ensure we have a client instance with the latest key
const getAiClient = () => {
  return new GoogleGenAI({ apiKey: process.env.API_KEY });
};

// --- Script Generation ---

export const generateSalesScript = async (
  productName: string,
  productDesc: string,
  persona: Persona
): Promise<GeneratedScript> => {
  const ai = getAiClient();
  
  const prompt = `
    You are an expert TikTok scriptwriter specializing in "Faceless" sales videos for the Thai market.
    
    Product Name: ${productName}
    Product Description: ${productDesc}
    Persona: ${persona}
    
    Task: Write a short, punchy 3-part script (Thai language).
    Structure:
    1. Hook (Problem/Attention Grabber) - max 2 sentences.
    2. Body (Product intro + Benefit) - max 3 sentences.
    3. Call to Action (CTA) - 1 short sentence.

    Return the result in JSON format.
  `;

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          hook: { type: Type.STRING },
          body: { type: Type.STRING },
          cta: { type: Type.STRING },
          fullText: { type: Type.STRING, description: "Combined text for TTS" }
        },
        required: ["hook", "body", "cta", "fullText"]
      }
    }
  });

  const text = response.text;
  if (!text) throw new Error("No script generated");
  return JSON.parse(text) as GeneratedScript;
};

// --- Image Generation ---

export const generateProductImage = async (
  productName: string,
  productDesc: string
): Promise<string> => {
  const ai = getAiClient();
  const prompt = `Product photography of ${productName}. Description: ${productDesc}. Professional studio lighting, aesthetic, suitable for social media marketing, high resolution.`;

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: {
      parts: [{ text: prompt }],
    },
    config: {
      imageConfig: {
        aspectRatio: "1:1",
      },
    },
  });

  const parts = response.candidates?.[0]?.content?.parts;
  if (parts) {
    for (const part of parts) {
      if (part.inlineData && part.inlineData.data) {
        return `data:${part.inlineData.mimeType || 'image/png'};base64,${part.inlineData.data}`;
      }
    }
  }

  throw new Error("No image generated");
};

// --- Visual Prompt Optimization (Helper) ---
// Veo works best with English visual descriptions. We translate/enhance the product info.
const optimizeVisualPrompt = async (productName: string, productDesc: string): Promise<string> => {
  const ai = getAiClient();
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: `Create a high-quality, cinematic AI video generation prompt (in English) for the following product. 
    Focus on the product appearance, lighting, and "b-roll" style suitable for a sales video background.
    Product: ${productName}
    Details: ${productDesc}
    
    Output ONLY the prompt string. keep it under 40 words.`,
  });
  return response.text || `Cinematic shot of ${productName}, high quality, commercial lighting`;
};

// --- Video Generation (Veo) ---

export const generateMarketingVideo = async (
  productName: string,
  productDesc: string
): Promise<string> => {
  const ai = getAiClient();
  
  // 1. Optimize prompt for Veo
  const visualPrompt = await optimizeVisualPrompt(productName, productDesc);
  console.log("Veo Prompt:", visualPrompt);

  // 2. Start Generation
  let operation = await ai.models.generateVideos({
    model: 'veo-3.1-fast-generate-preview',
    prompt: visualPrompt,
    config: {
      numberOfVideos: 1,
      resolution: '720p',
      aspectRatio: '9:16' // Portrait for TikTok
    }
  });

  // 3. Poll for completion
  while (!operation.done) {
    await new Promise(resolve => setTimeout(resolve, 5000)); // Poll every 5s
    operation = await ai.operations.getVideosOperation({ operation });
  }

  const videoUri = operation.response?.generatedVideos?.[0]?.video?.uri;
  if (!videoUri) throw new Error("Video generation failed or returned no URI");

  // 4. Fetch the actual video blob
  const videoRes = await fetch(`${videoUri}&key=${process.env.API_KEY}`);
  if (!videoRes.ok) throw new Error("Failed to download generated video");
  
  const videoBlob = await videoRes.blob();
  return URL.createObjectURL(videoBlob);
};

// --- Audio Generation (TTS) ---

export const generateVoiceover = async (text: string): Promise<string> => {
  const ai = getAiClient();
  
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash-preview-tts",
    contents: [{ parts: [{ text: text }] }],
    config: {
      responseModalities: [Modality.AUDIO],
      speechConfig: {
        voiceConfig: {
          prebuiltVoiceConfig: { voiceName: 'Puck' } // Puck is usually energetic/neutral
        },
      },
    },
  });

  const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
  if (!base64Audio) throw new Error("No audio data returned");

  // Convert Base64 PCM to a playable WAV Blob
  const audioContext = new (window.AudioContext || window.webkitAudioContext)({ sampleRate: 24000 });
  
  // Helper to decode base64
  const binaryString = atob(base64Audio);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }

  // Decode audio data
  const audioBuffer = await decodeAudioData(bytes, audioContext, 24000, 1);
  
  // Convert AudioBuffer to WAV for download/playback
  const wavBlob = bufferToWav(audioBuffer);
  return URL.createObjectURL(wavBlob);
};

// --- Audio Helpers ---

async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number,
  numChannels: number,
): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}

// Simple WAV encoder to make the blob downloadable/playable easily
function bufferToWav(abuffer: AudioBuffer) {
  const numOfChan = abuffer.numberOfChannels;
  const length = abuffer.length * numOfChan * 2 + 44;
  const buffer = new ArrayBuffer(length);
  const view = new DataView(buffer);
  const channels = [];
  let i;
  let sample;
  let offset = 0;
  let pos = 0;

  // write WAVE header
  setUint32(0x46464952); // "RIFF"
  setUint32(length - 8); // file length - 8
  setUint32(0x45564157); // "WAVE"

  setUint32(0x20746d66); // "fmt " chunk
  setUint32(16); // length = 16
  setUint16(1); // PCM (uncompressed)
  setUint16(numOfChan);
  setUint32(abuffer.sampleRate);
  setUint32(abuffer.sampleRate * 2 * numOfChan); // avg. bytes/sec
  setUint16(numOfChan * 2); // block-align
  setUint16(16); // 16-bit (hardcoded in this example)

  setUint32(0x61746164); // "data" - chunk
  setUint32(length - pos - 4); // chunk length

  // write interleaved data
  for (i = 0; i < abuffer.numberOfChannels; i++)
    channels.push(abuffer.getChannelData(i));

  while (pos < abuffer.length) {
    for (i = 0; i < numOfChan; i++) {
      sample = Math.max(-1, Math.min(1, channels[i][pos])); // clamp
      sample = (0.5 + sample < 0 ? sample * 32768 : sample * 32767) | 0; // scale to 16-bit signed int
      view.setInt16(44 + offset, sample, true);
      offset += 2;
    }
    pos++;
  }

  return new Blob([buffer], { type: "audio/wav" });

  function setUint16(data: number) {
    view.setUint16(pos, data, true);
    pos += 2;
  }

  function setUint32(data: number) {
    view.setUint32(pos, data, true);
    pos += 4;
  }
}