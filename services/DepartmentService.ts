import { Department, Room, RoomEvent } from '@/types';
import ICAL from 'ical.js';

/**
 * Strip iCal description noise: escaped newlines/backslashes, repeated spaces,
 * and "(Modifié le: ...)" edit-timestamp suffixes left in by the source system.
 */
export function cleanDescription(description: string): string {
  return description
    .replace(/\\n/g, ' ')
    .replace(/\n/g, ' ')
    .replace(/\\/g, '')
    .replace(/\(Modifié le\s*:.*?\)/gi, '')
    .replace(/\s{2,}/g, ' ')
    .trim();
}

export class DepartmentService {

  /**
   * Generate the iCal download URL for a department
   */
  static generateICalUrl(departmentId: number, date: Date = new Date()): string {
    const dateFormatter = new Intl.DateTimeFormat('en-CA'); // ISO format YYYY-MM-DD
    const start = dateFormatter.format(date);
    const end = dateFormatter.format(date);

    return `https://adecons.unistra.fr/jsp/custom/modules/plannings/anonymous_cal.jsp?resources=${departmentId}&projectId=4&calType=ical&firstDate=${start}&lastDate=${end}`;
  }

  /**
   * Download and parse iCal data for a department
   */
  static async downloadICalData(department: Department, selectedDate: Date = new Date()): Promise<Department> {
    try {
      const url = this.generateICalUrl(department.id, selectedDate);
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const icalData = await response.text();

      // Validate iCal data
      if (!icalData || !icalData.includes('BEGIN:VCALENDAR')) {
        throw new Error('Invalid iCal data format');
      }

      // Update department with downloaded data
      const updatedDepartment: Department = {
        ...department,
        ical: icalData,
        downloadTime: new Date().toISOString(),
        downloadSuccess: true,
        rooms: this.createRooms(department, icalData)
      };

      // Calculate room availability relative to the selected moment (which already carries
      // whatever date/time the caller intends — live "now" or a user-picked date/time).
      this.calculateAvailability(updatedDepartment, selectedDate);

      return updatedDepartment;

    } catch (error) {
      console.error('Error downloading iCal data:', error);
      return {
        ...department,
        downloadSuccess: false,
        downloadTime: new Date().toISOString()
      };
    }
  }

  /**
   * Create rooms from department roomNames and roomLabels
   */
  static createRooms(department: Department, icalData?: string): Room[] {
    const rooms: Room[] = [];

    // Create rooms from roomNames
    for (const [type, roomList] of Object.entries(department.roomNames)) {
      for (const roomName of roomList) {
        const room: Room = {
          location: roomName,
          type: type,
          typeDescription: department.roomLabels[type] || type,
          roomEvents: []
        };
        rooms.push(room);
      }
    }

    // Parse events if iCal data is available
    if (icalData) {
      this.parseRoomEvents(rooms, icalData, department.name);
    }

    return rooms;
  }

  /**
   * Parse iCal data and assign events to rooms
   */
  static parseRoomEvents(rooms: Room[], icalData: string, departmentName: string): void {
    try {
      if (!icalData || icalData.trim().length === 0) {
        return;
      }

      let jcalData;
      try {
        jcalData = ICAL.parse(icalData);
      } catch (parseError) {
        console.error('Error parsing iCal string:', parseError);
        return;
      }

      if (!jcalData || !Array.isArray(jcalData)) {
        console.error('Invalid jcalData structure');
        return;
      }

      const comp = new ICAL.Component(jcalData);
      if (!comp) {
        console.error('Failed to create ICAL.Component');
        return;
      }

      const vevents = comp.getAllSubcomponents('vevent');

      vevents.forEach((vevent, index) => {
        try {
          const event = new ICAL.Event(vevent);

          const location = event.location;
          const summary = event.summary;
          const description = event.description || '';
          const startDate = event.startDate?.toJSDate();
          const endDate = event.endDate?.toJSDate();

          if (location && startDate && endDate && summary) {
            // Improved room matching - try multiple strategies
            let room = rooms.find(r => {
              // Exact match
              if (r.location === location) return true;

              // Case-insensitive exact match
              if (r.location.toLowerCase() === location.toLowerCase()) return true;

              // Partial match both ways
              if (location.toLowerCase().includes(r.location.toLowerCase()) ||
                  r.location.toLowerCase().includes(location.toLowerCase())) return true;

              // Extract room code (e.g., "C42" from "C42 MAI")
              const locationCode = location.split(' ')[0];
              if (r.location === locationCode || r.location.toLowerCase() === locationCode.toLowerCase()) return true;

              // Try with room prefixes (T, C, etc.)
              if (locationCode && r.location.includes(locationCode)) return true;

              return false;
            });

            // If no room found, create a temporary room for this location
            if (!room) {
              room = {
                location: location,
                type: 'unknown',
                typeDescription: 'Salle',
                roomEvents: []
              };
              rooms.push(room);
            }

            // If the iCal location carries extra text beyond the configured room
            // name (e.g. "C42 MAI Info" vs configured "C42 MAI"), surface it as a warning.
            if (location !== room.location) {
              const extra = location.toLowerCase().startsWith(room.location.toLowerCase())
                ? location.slice(room.location.length)
                : location;
              const warning = extra.trim();
              if (warning) {
                room.warnings = warning;
              }
            }

            const roomEvent: RoomEvent = {
              location: location,
              start: startDate.toISOString(),
              end: endDate.toISOString(),
              departmentName: departmentName,
              description: description,
              summary: summary
            };

            room.roomEvents.push(roomEvent);
          }
        } catch (eventError) {
          console.error(`Error processing event ${index}:`, eventError);
        }
      });
    } catch (error) {
      console.error('Error parsing iCal data:', error);
    }
  }

  /**
   * Pure version of availability calculation: returns a NEW array of rooms with `isFree`/
   * `timeData` computed against `now`, without touching the input. Events themselves only
   * change on a real re-download, but which event is "current" shifts every minute purely
   * because time passes — this lets a screen re-bucket rooms locally on a timer without
   * re-fetching iCal data or mutating the shared department object.
   */
  static computeAvailability(rooms: Room[], now: Date): Room[] {
    return rooms.map(room => {
      const sortedEvents = [...room.roomEvents].sort(
        (a, b) => new Date(a.start).getTime() - new Date(b.start).getTime()
      );

      const currentEvent = sortedEvents.find(event => {
        const start = new Date(event.start);
        const end = new Date(event.end);
        return start <= now && now < end;
      });

      if (currentEvent) {
        // A room isn't actually free the instant this event ends if another booking follows
        // immediately (or overlaps) — walk forward through any back-to-back events to find
        // when there's a real gap, so "dans 1h30" reflects when the room truly becomes free.
        let chainEnd = new Date(currentEvent.end).getTime();
        for (const event of sortedEvents) {
          const eventStart = new Date(event.start).getTime();
          const eventEnd = new Date(event.end).getTime();
          if (eventStart <= chainEnd && eventEnd > chainEnd) {
            chainEnd = eventEnd;
          }
        }
        return { ...room, isFree: false, timeData: new Date(chainEnd).toISOString() };
      }

      const nextEvent = sortedEvents.find(event => new Date(event.start) > now);

      if (nextEvent) {
        return { ...room, isFree: true, timeData: nextEvent.start };
      }

      const endOfDay = new Date(now);
      endOfDay.setHours(23, 59, 59, 999);
      return { ...room, isFree: true, timeData: endOfDay.toISOString() };
    });
  }

  /**
   * Calculate room availability based on `now` (defaults to the real current time) and events.
   */
  static calculateAvailability(department: Department, now: Date = new Date()): void {
    if (!department.rooms) {
      return;
    }

    department.rooms = this.computeAvailability(department.rooms, now);
  }

  /**
   * Get available rooms (free now)
   */
  static getAvailableRooms(department: Department): Room[] {
    return department.rooms?.filter(room => room.isFree === true) || [];
  }

  /**
   * Get occupied rooms (busy now)
   */
  static getOccupiedRooms(department: Department): Room[] {
    return department.rooms?.filter(room => room.isFree === false) || [];
  }
}
