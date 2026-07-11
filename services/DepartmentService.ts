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
  static async downloadICalData(department: Department, selectedDate?: Date): Promise<Department> {
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

      // Calculate room availability
      this.calculateAvailability(updatedDepartment);

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
   * Calculate room availability based on current time and events
   */
  static calculateAvailability(department: Department): void {
    if (!department.rooms) {
      return;
    }

    const now = new Date();

    department.rooms.forEach(room => {
      // Find if there's an event happening RIGHT NOW
      const currentEvent = room.roomEvents.find(event => {
        const start = new Date(event.start);
        const end = new Date(event.end);
        return start <= now && now < end;
      });

      if (currentEvent) {
        room.isFree = false;
        room.timeData = currentEvent.end;
      } else {
        room.isFree = true;
        // Find the next event (if any)
        const nextEvent = room.roomEvents
          .filter(event => new Date(event.start) > now)
          .sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime())[0];
        if (nextEvent) {
          room.timeData = nextEvent.start;
        } else {
          // Free for rest of day
          const endOfDay = new Date(now);
          endOfDay.setHours(23, 59, 59, 999);
          room.timeData = endOfDay.toISOString();
        }
      }
    });
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
