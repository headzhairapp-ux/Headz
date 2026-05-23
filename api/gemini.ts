import type { VercelRequest, VercelResponse } from '@vercel/node';
import { runGemini } from '../lib/geminiCore';

/**
 * Server-side proxy for the Gemini image-editing call.
 *
 * The browser sends the already-prepared `contents` (image parts + prompt) and
 * this function performs the actual Gemini request using GEMINI_API_KEY, which
 * lives only in the server runtime and is never shipped to the client bundle.
 *
 * Retries and response parsing stay on the client so each invocation is a
 * single Gemini call (keeps us well under the function duration limit).
 */
export const config = {
  maxDuration: 60,
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res
      .status(500)
      .json({ error: 'GEMINI_API_KEY is not configured on the server.' });
  }

  const { contents, model } = (req.body ?? {}) as {
    contents?: unknown;
    model?: string;
  };

  if (!contents) {
    return res.status(400).json({ error: 'Missing "contents" in request body.' });
  }

  try {
    const result = await runGemini(apiKey, contents, model);
    return res.status(200).json(result);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Gemini request failed.';
    return res.status(502).json({ error: message });
  }
}
