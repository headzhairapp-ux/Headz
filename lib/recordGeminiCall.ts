/**
 * Best-effort log of one successful Gemini generation into the `gemini_calls`
 * Supabase table. Shared by the local dev middleware (vite.config.ts); the
 * Vercel function (api/gemini.ts) keeps its own self-contained copy on purpose.
 *
 * Uses the Supabase REST API directly (no SDK) and never throws: a logging
 * failure must not break the user's generation. This is the only server-side
 * record of anonymous (not-logged-in) usage.
 */
export interface RecordGeminiCallArgs {
  supabaseUrl?: string;
  supabaseKey?: string;
  deviceId?: unknown;
  userId?: unknown;
  model: string;
}

export async function recordGeminiCall(args: RecordGeminiCallArgs): Promise<void> {
  const { supabaseUrl, supabaseKey } = args;
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
