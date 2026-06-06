import type { VercelRequest, VercelResponse } from '@vercel/node';

/**
 * Server-side proxy for the Gemini image-editing call.
 *
 * The browser sends the already-prepared `contents` (image parts + prompt) and
 * this function performs the actual Gemini REST request using GEMINI_API_KEY,
 * which lives only in the server runtime and is never shipped to the client.
 *
 * Self-contained on purpose: no imports outside this file (and no ESM-only SDK)
 * so the Vercel function can never fail to bundle / load at runtime.
 */
export const config = {
  maxDuration: 60,
};

const DEFAULT_MODEL = 'gemini-2.5-flash-image';
const GEMINI_ENDPOINT = 'https://generativelanguage.googleapis.com/v1beta/models';

/**
 * Best-effort log of one successful generation into the `gemini_calls` table.
 *
 * Uses the Supabase REST API directly (no SDK) to keep this function
 * self-contained, and never throws: a logging failure must not break the
 * user's generation. This is the only server-side record of anonymous usage.
 */
async function recordGeminiCall(args: {
  deviceId: unknown;
  userId: unknown;
  model: string;
}): Promise<void> {
  const supabaseUrl =
    process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const supabaseKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.SUPABASE_ANON_KEY ||
    process.env.VITE_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) return;

  const deviceId = typeof args.deviceId === 'string' ? args.deviceId : null;
  const userId = typeof args.userId === 'string' ? args.userId : null;

  try {
    await fetch(`${supabaseUrl}/rest/v1/gemini_calls`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        apikey: supabaseKey,
        Authorization: `Bearer ${supabaseKey}`,
        Prefer: 'return=minimal',
      },
      body: JSON.stringify({
        device_id: deviceId,
        user_id: userId,
        is_anonymous: !userId,
        model: args.model,
      }),
    });
  } catch {
    // Swallow: logging is best-effort and must never affect the response.
  }
}

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

  const { contents, model, deviceId, userId } = (req.body ?? {}) as {
    contents?: unknown;
    model?: string;
    deviceId?: unknown;
    userId?: unknown;
  };

  if (!contents) {
    return res.status(400).json({ error: 'Missing "contents" in request body.' });
  }

  try {
    // The client sends a single Content object ({ parts: [...] }); the REST API
    // expects an array of Content objects.
    const contentsArray = Array.isArray(contents) ? contents : [contents];

    const apiResponse = await fetch(
      `${GEMINI_ENDPOINT}/${model || DEFAULT_MODEL}:generateContent`,
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

    const data = (await apiResponse.json()) as {
      candidates?: unknown;
      promptFeedback?: unknown;
      error?: { message?: string };
    };

    if (!apiResponse.ok) {
      return res.status(502).json({
        error:
          data?.error?.message ||
          `Gemini API request failed (${apiResponse.status}).`,
      });
    }

    // Record the successful generation (best-effort; never blocks the response).
    await recordGeminiCall({
      deviceId,
      userId,
      model: model || DEFAULT_MODEL,
    });

    return res.status(200).json({
      candidates: data.candidates ?? [],
      promptFeedback: data.promptFeedback ?? null,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Gemini request failed.';
    return res.status(502).json({ error: message });
  }
}
