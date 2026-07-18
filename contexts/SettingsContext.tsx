import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, ReactNode, useCallback, useContext, useEffect, useMemo, useState } from 'react';

import { DEFAULT_ACCENT_COLOR } from '@/constants/theme';
import { setHapticsEnabled } from '@/services/haptics';
import { AppSettings } from '@/types';

const STORAGE_KEY = '@unisquat/settings';

// Defaults preserve today's behavior (panels stay open after a selection, haptics on, the
// existing purple accent) — turning any of these into something else is an opt-in, not a change
// existing users see unprompted.
const DEFAULT_SETTINGS: AppSettings = {
  autoCollapseSearchFilters: false,
  autoCollapseDepartmentFilters: false,
  hapticsEnabled: true,
  accentColor: DEFAULT_ACCENT_COLOR,
};

type SettingsContextValue = {
  settings: AppSettings;
  isLoaded: boolean;
  updateSetting: <K extends keyof AppSettings>(key: K, value: AppSettings[K]) => void;
};

const SettingsContext = createContext<SettingsContextValue | null>(null);

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const stored = await AsyncStorage.getItem(STORAGE_KEY);
        const persisted: Partial<AppSettings> = stored ? JSON.parse(stored) : {};
        // Merge over defaults (not the other way round) so a setting added in a later version —
        // absent from an older persisted blob — still gets its default instead of `undefined`.
        setSettings({ ...DEFAULT_SETTINGS, ...persisted });
      } catch (error) {
        console.error('Failed to load persisted settings:', error);
        setSettings(DEFAULT_SETTINGS);
      } finally {
        setIsLoaded(true);
      }
    })();
  }, []);

  // Bridges the reactive setting into the imperative haptics module — see services/haptics.ts.
  useEffect(() => {
    setHapticsEnabled(settings.hapticsEnabled);
  }, [settings.hapticsEnabled]);

  const persist = useCallback((next: AppSettings) => {
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next)).catch(error => {
      console.error('Failed to persist settings:', error);
    });
  }, []);

  const updateSetting = useCallback(<K extends keyof AppSettings>(key: K, value: AppSettings[K]) => {
    setSettings(prev => {
      const next = { ...prev, [key]: value };
      persist(next);
      return next;
    });
  }, [persist]);

  const value = useMemo(
    () => ({ settings, isLoaded, updateSetting }),
    [settings, isLoaded, updateSetting]
  );

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
}

export function useSettings() {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
}
