import { getDeviceId } from '../utils/deviceFingerprint';

interface DeviceUsageData {
  deviceId: string;
  freeGenerations: number;
  lastGenerationDate: string;
  firstGenerationDate: string;
  blocked: boolean;
}

const STORAGE_KEY = 'device_usage_data';
const MAX_FREE_GENERATIONS = 3;

export class DeviceUsageTracker {
  private static instance: DeviceUsageTracker;
  private usageData: DeviceUsageData;

  private constructor() {
    this.usageData = this.loadUsageData();
  }

  public static getInstance(): DeviceUsageTracker {
    if (!DeviceUsageTracker.instance) {
      DeviceUsageTracker.instance = new DeviceUsageTracker();
    }
    return DeviceUsageTracker.instance;
  }

  private loadUsageData(): DeviceUsageData {
    const deviceId = getDeviceId();
    const storedData = localStorage.getItem(STORAGE_KEY);

    if (storedData) {
      try {
        const parsed = JSON.parse(storedData);
        // Verify this data belongs to current device
        if (parsed.deviceId === deviceId) {
          return parsed;
        }
      } catch (error) {
        console.error('Error parsing device usage data:', error);
      }
    }

    // Create new usage data for this device
    const newData: DeviceUsageData = {
      deviceId,
      freeGenerations: 0,
      lastGenerationDate: new Date().toISOString(),
      firstGenerationDate: new Date().toISOString(),
      blocked: false,
    };

    this.saveUsageData(newData);
    return newData;
  }

  private saveUsageData(data: DeviceUsageData): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    // Also store in sessionStorage as backup
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }

  public canGenerate(): boolean {
    // Always allow generation - unlimited for everyone
    return true;
  }

  public getRemainingGenerations(): number {
    // Return unlimited
    return 999999;
  }

  public incrementUsage(): boolean {
    if (!this.canGenerate()) {
      return false;
    }

    this.usageData.freeGenerations += 1;
    this.usageData.lastGenerationDate = new Date().toISOString();

    // Block device if limit reached
    if (this.usageData.freeGenerations >= MAX_FREE_GENERATIONS) {
      this.usageData.blocked = true;
    }

    this.saveUsageData(this.usageData);
    return true;
  }

  public getUsageInfo(): {
    used: number;
    remaining: number;
    total: number;
    blocked: boolean;
    deviceId: string;
  } {
    return {
      used: this.usageData.freeGenerations,
      remaining: this.getRemainingGenerations(),
      total: MAX_FREE_GENERATIONS,
      blocked: this.usageData.blocked,
      deviceId: this.usageData.deviceId,
    };
  }

  public resetDevice(): void {
    // This method should only be called by admin or for testing
    const deviceId = getDeviceId();
    const newData: DeviceUsageData = {
      deviceId,
      freeGenerations: 0,
      lastGenerationDate: new Date().toISOString(),
      firstGenerationDate: new Date().toISOString(),
      blocked: false,
    };
    this.usageData = newData;
    this.saveUsageData(newData);
  }

  // Additional security: Store device fingerprints on backend
  public async syncWithBackend(userId?: string): Promise<void> {
    // This would sync device usage with your backend
    // Preventing users from clearing localStorage to bypass limits
    try {
      const response = await fetch('/api/device-usage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          deviceId: this.usageData.deviceId,
          usage: this.usageData,
          userId,
        }),
      });

      if (response.ok) {
        const backendData = await response.json();
        // Update local data with backend truth
        if (backendData.freeGenerations > this.usageData.freeGenerations) {
          this.usageData.freeGenerations = backendData.freeGenerations;
          this.usageData.blocked = backendData.blocked;
          this.saveUsageData(this.usageData);
        }
      }
    } catch (error) {
      console.error('Failed to sync with backend:', error);
      // Continue with local tracking if backend is unavailable
    }
  }
}

// Export singleton instance
export const deviceUsageTracker = DeviceUsageTracker.getInstance();