// Type definitions for the app

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