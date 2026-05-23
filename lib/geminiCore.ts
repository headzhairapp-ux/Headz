/**
 * Shared Gemini image-editing call.
 *
 * Used by both the production Vercel function (`api/gemini.ts`) and the local
 * Vite dev middleware (`vite.config.ts`). The API key is supplied by the caller
 * and never reaches the browser.
 *
 * Implemented with a direct REST `fetch` (not the @google/genai SDK) so the
 * Vercel serverless function has no ESM-only dependency to bundle — the SDK
 * import was crashing the function at load time (FUNCTION_INVOCATION_FAILED).
 */

export const DEFAULT_MODEL = 'gemini-2.5-flash-image';

const GEMINI_ENDPOINT = 'https://generativelanguage.googleapis.com/v1beta/models';

export interface GeminiPart {
  inlineData?: { data?: string; mimeType?: string };
  text?: string;
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
  const targetModel = model || DEFAULT_MODEL;

  // The client sends a single Content object ({ parts: [...] }); the REST API
  // expects an array of Content objects.
  const contentsArray = Array.isArray(contents) ? contents : [contents];

  const response = await fetch(
    `${GEMINI_ENDPOINT}/${targetModel}:generateContent`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': apiKey,
      },
      body: JSON.stringify({
        contents: contentsArray,
        generationConfig: {
          responseModalities: ['IMAGE', 'TEXT'],
        },
      }),
    }
  );

  const data = (await response.json()) as {
    candidates?: GeminiResult['candidates'];
    promptFeedback?: GeminiResult['promptFeedback'];
    error?: { message?: string };
  };

  if (!response.ok) {
    throw new Error(
      data?.error?.message || `Gemini API request failed (${response.status}).`
    );
  }

  return {
    candidates: data.candidates ?? [],
    promptFeedback: data.promptFeedback ?? null,
  };
};
