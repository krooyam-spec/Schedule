import { 
  Subject, 
  Teacher, 
  Classroom, 
  DayOfWeek, 
  TimetableEntry 
} from '../types';

export const DAYS_LIST: DayOfWeek[] = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
export const PERIODS_PER_DAY = 8;

export function generateAutoTimetable(
  subjects: Subject[],
  teachers: Teacher[],
  classrooms: Classroom[]
): TimetableEntry[] {
  const timetable: TimetableEntry[] = [];
  
  // Track teacher availability: teacherId -> day -> period -> isBusy
  const teacherSchedule: Record<string, Record<string, Record<number, boolean>>> = {};
  
  // Track classroom availability: classroomId -> day -> period -> isBusy
  const classroomSchedule: Record<string, Record<string, Record<number, boolean>>> = {};

  // Initialize schedules
  teachers.forEach(t => {
    teacherSchedule[t.id] = {};
    DAYS_LIST.forEach(d => {
      teacherSchedule[t.id][d] = {};
    });
  });

  classrooms.forEach(c => {
    classroomSchedule[c.id] = {};
    DAYS_LIST.forEach(d => {
      classroomSchedule[c.id][d] = {};
    });
  });

  // Simple Greedy Schedular
  for (const classroom of classrooms) {
    // Collect all required sessions for this classroom
    const sessionsToSchedule: { subjectId: string; teacherId: string }[] = [];
    
    for (const subject of subjects) {
      // Find a teacher for this subject
      const eligibleTeacher = teachers.find(t => t.expertSubjects.includes(subject.id));
      if (!eligibleTeacher) continue;

      for (let i = 0; i < subject.hoursPerWeek; i++) {
        sessionsToSchedule.push({ subjectId: subject.id, teacherId: eligibleTeacher.id });
      }
    }

    // Attempt to place each session
    for (const session of sessionsToSchedule) {
      let placed = false;
      
      // Try to find a slot
      for (const day of DAYS_LIST) {
        if (placed) break;
        
        for (let period = 1; period <= PERIODS_PER_DAY; period++) {
          // Check if period is lunch (common Thai lunch is period 4 or 5)
          if (period === 5) continue; // Skip lunch for simplicity in this demo

          const isClassBusy = classroomSchedule[classroom.id][day][period];
          const isTeacherBusy = teacherSchedule[session.teacherId][day][period];

          if (!isClassBusy && !isTeacherBusy) {
            // Place it!
            const entry: TimetableEntry = {
              id: Math.random().toString(36).substr(2, 9),
              classroomId: classroom.id,
              subjectId: session.subjectId,
              teacherId: session.teacherId,
              day: day,
              period: period
            };

            timetable.push(entry);
            classroomSchedule[classroom.id][day][period] = true;
            teacherSchedule[session.teacherId][day][period] = true;
            placed = true;
            break;
          }
        }
      }
    }
  }

  return timetable;
}
