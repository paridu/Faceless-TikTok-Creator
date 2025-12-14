export enum Persona {
  REAL_USER = 'Real User (ผู้ใช้จริง)',
  REVIEWER = 'Honest Reviewer (นักรีวิวตรงไปตรงมา)',
  FRIEND = 'Best Friend (เพื่อนแนะนำเพื่อน)',
  EXPERT = 'Expert (ผู้เชี่ยวชาญเฉพาะทาง)'
}

export enum AppStep {
  INPUT = 'INPUT',
  SCRIPTING = 'SCRIPTING',
  GENERATING = 'GENERATING',
  RESULT = 'RESULT'
}

export interface ProductData {
  name: string;
  description: string;
  persona: Persona;
}

export interface GeneratedScript {
  hook: string;
  body: string;
  cta: string;
  fullText: string;
}

export interface GeneratedAssets {
  videoUrl: string | null;
  audioUrl: string | null;
}
