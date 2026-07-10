import { supabase } from '../lib/supabaseClient';
import { getDeviceId } from '../utils/deviceFingerprint';

const STORAGE_KEY = 'headz_lead_capture';
const SESSION_STORAGE_KEY = 'headz-session-id';

export interface LeadCapturePayload {
  name: string;
  countryCode: string;
  phoneNumber: string;
  location: string;
  userId?: string | null;
}

export interface StoredLeadCapture {
  id?: string;
  name: string;
  countryCode: string;
  phoneNumber: string;
  location: string;
  submittedAt: string;
  sessionId: string;
}

const getOrCreateSessionId = (): string => {
  let sessionId = localStorage.getItem(SESSION_STORAGE_KEY);
  if (!sessionId) {
    sessionId = crypto.randomUUID();
    localStorage.setItem(SESSION_STORAGE_KEY, sessionId);
  }
  return sessionId;
};

export const getStoredLeadCapture = (): StoredLeadCapture | null => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;

    const parsed = JSON.parse(raw) as StoredLeadCapture;
    if (
      parsed?.name &&
      parsed?.countryCode &&
      parsed?.phoneNumber &&
      parsed?.location &&
      parsed?.sessionId
    ) {
      return parsed;
    }
  } catch (error) {
    console.error('Error reading lead capture state:', error);
  }

  return null;
};

export const hasCompletedLeadCapture = (): boolean => {
  return getStoredLeadCapture() !== null;
};

export const saveLeadCapture = async (
  payload: LeadCapturePayload,
): Promise<{ lead: StoredLeadCapture | null; error: Error | null }> => {
  const sessionId = getOrCreateSessionId();
  const submittedAt = new Date().toISOString();
  const cleanPayload = {
    name: payload.name.trim(),
    countryCode: payload.countryCode.trim(),
    phoneNumber: payload.phoneNumber.replace(/\D/g, ''),
    location: payload.location.trim().toUpperCase(),
  };

  try {
    const { data, error } = await supabase
      .from('lead_captures')
      .insert({
        name: cleanPayload.name,
        country_code: cleanPayload.countryCode,
        phone_number: cleanPayload.phoneNumber,
        full_mobile_number: `${cleanPayload.countryCode}${cleanPayload.phoneNumber}`,
        location: cleanPayload.location,
        session_id: sessionId,
        device_id: getDeviceId(),
        user_id: payload.userId || null,
        source_path: window.location.pathname,
        user_agent: navigator.userAgent,
      })
      .select('id')
      .single();

    if (error) {
      console.error('Error saving lead capture:', error);
      return { lead: null, error: new Error(error.message) };
    }

    const storedLead: StoredLeadCapture = {
      id: data?.id,
      ...cleanPayload,
      submittedAt,
      sessionId,
    };

    localStorage.setItem(STORAGE_KEY, JSON.stringify(storedLead));
    return { lead: storedLead, error: null };
  } catch (error) {
    console.error('Lead capture failed:', error);
    return {
      lead: null,
      error: error instanceof Error ? error : new Error('Failed to save lead capture'),
    };
  }
};
