// Type definitions for the app

import { AccentColorKey } from '@/constants/theme';

export type Department = {
  name: string;
  id: number;
  campus: string;
  isFavorite: boolean;
  roomLabels: Record<string, string>;
  roomNames: Record<string, string[]>;
  rooms?: Room[];
  urlLink?: string;
  ical?: string;
  downloadTime?: string;
  downloadSuccess?: boolean;
};

export type Room = {
  location: string;
  type: string;
  typeDescription?: string;
  roomEvents: RoomEvent[];
  isFree?: boolean;
  timeData?: string;
  warnings?: string;
};

export type RoomEvent = {
  location: string;
  start: string;
  end: string;
  departmentName: string;
  description: string;
  summary: string;
};

// User-configurable UI preferences, persisted via SettingsContext. Keep every field a plain
// boolean/primitive (not nested objects) so a new field can be added later with just a default
// value in SettingsContext — no migration logic needed, since loading merges persisted data over
// fresh defaults key-by-key.
export type AppSettings = {
  autoCollapseSearchFilters: boolean;
  autoCollapseDepartmentFilters: boolean;
  hapticsEnabled: boolean;
  accentColor: AccentColorKey;
};