export const generateDeviceFingerprint = (): string => {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  if (!ctx) {
    return 'default-fingerprint';
  }

  // Canvas fingerprinting
  ctx.textBaseline = 'top';
  ctx.font = '14px Arial';
  ctx.textBaseline = 'alphabetic';
  ctx.fillStyle = '#f60';
  ctx.fillRect(125, 1, 62, 20);
  ctx.fillStyle = '#069';
  ctx.fillText('Canvas fingerprint', 2, 15);
  ctx.fillStyle = 'rgba(102, 204, 0, 0.7)';
  ctx.fillText('Canvas fingerprint', 4, 17);

  const canvasData = canvas.toDataURL();

  // Combine multiple browser characteristics
  const fingerprint = {
    userAgent: navigator.userAgent,
    language: navigator.language,
    colorDepth: screen.colorDepth,
    deviceMemory: (navigator as any).deviceMemory || 0,
    hardwareConcurrency: navigator.hardwareConcurrency || 0,
    screenResolution: `${screen.width}x${screen.height}`,
    availableScreenResolution: `${screen.availWidth}x${screen.availHeight}`,
    timezoneOffset: new Date().getTimezoneOffset(),
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    sessionStorage: typeof sessionStorage !== 'undefined',
    localStorage: typeof localStorage !== 'undefined',
    indexedDb: !!window.indexedDB,
    platform: navigator.platform,
    plugins: Array.from(navigator.plugins || []).map(p => p.name).join(','),
    canvas: canvasData,
    webgl: getWebGLFingerprint(),
  };

  // Generate hash from fingerprint
  const fingerprintString = JSON.stringify(fingerprint);
  return hashString(fingerprintString);
};

const getWebGLFingerprint = (): string => {
  const canvas = document.createElement('canvas');
  const gl = canvas.getContext('webgl') as WebGLRenderingContext | null;

  if (!gl) {
    return 'no-webgl';
  }

  const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
  if (debugInfo) {
    return `${gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL)}_${gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL)}`;
  }

  return 'webgl-supported';
};

const hashString = (str: string): string => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return Math.abs(hash).toString(36);
};

export const getDeviceId = (): string => {
  const storageKey = 'device_id_v2';

  // Check if we already have a device ID stored
  let deviceId = localStorage.getItem(storageKey);

  if (!deviceId) {
    // Generate new device ID based on fingerprint
    deviceId = `device_${generateDeviceFingerprint()}_${Date.now()}`;
    localStorage.setItem(storageKey, deviceId);
  }

  return deviceId;
};