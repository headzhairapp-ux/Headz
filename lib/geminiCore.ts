import { GoogleGenAI, Modality } from '@google/genai';

/**
 * Shared Gemini image-editing call.
 *
 * Used by both the production Vercel function (`api/gemini.ts`) and the local
 * Vite dev middleware (`vite.config.ts`) so the SDK logic lives in exactly one
 * place. The API key is supplied by the caller and never reaches the browser.
 */

export const DEFAULT_MODEL = 'gemini-2.5-flash-image';

export interface GeminiPart {
  inlineData?: { data?: string; mimeType?: string };
  text?: string;
}

export interface GeminiContents {
  parts: GeminiPart[];
}

export interface GeminiResult {
  candidates: Array<{ content: { parts: GeminiPart[] } }>;
  promptFeedback: { blockReason?: string } | null;
}

export const runGemini = async (
  apiKey: string,
  contents: unknown,
  model?: string
): Promise<GeminiResult> => {
  const ai = new GoogleGenAI({ apiKey });
  const response = await ai.models.generateContent({
    model: model || DEFAULT_MODEL,
    contents: contents as never,
    config: {
      responseModalities: [Modality.IMAGE, Modality.TEXT],
    },
  });

  return {
    candidates: (response.candidates ?? []) as GeminiResult['candidates'],
    promptFeedback: response.promptFeedback ?? null,
  };
};
