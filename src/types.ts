export enum SubjectCategory {
  THAI = "ภาษาไทย",
  MATH = "คณิตศาสตร์",
  SCIENCE = "วิทยาศาสตร์และเทคโนโลยี",
  SOCIAL = "สังคมศึกษา ศาสนา และวัฒนธรรม",
  HEALTH = "สุขศึกษาและพลศึกษา",
  ARTS = "ศิลปะ",
  OCCUPATION = "การงานอาชีพ",
  FOREIGN = "ภาษาต่างประเทศ",
  ADDITIONAL = "วิชาเพิ่มเติม",
  ACTIVITY = "กิจกรรมพัฒนาผู้เรียน",
}

export type DayOfWeek = "Monday" | "Tuesday" | "Wednesday" | "Thursday" | "Friday";

export interface Subject {
  id: string;
  code: string;
  name: string;
  category: SubjectCategory;
  hoursPerWeek: number;
}

export interface Teacher {
  id: string;
  name: string;
  expertSubjects: string[]; // Subject IDs
  maxHoursPerWeek: number;
}

export interface Classroom {
  id: string;
  name: string; // e.g., "ป.1/1", "ม.3/2"
  level: string; // "Prathom" or "Mattayom"
}

export interface TimeSlot {
  day: DayOfWeek;
  period: number; // 1 to 8 (or more)
}

export interface TimetableEntry {
  id: string;
  classroomId: string;
  subjectId: string;
  teacherId: string;
  day: DayOfWeek;
  period: number;
}

export const THAI_DAYS: Record<DayOfWeek, string> = {
  Monday: "จันทร์",
  Tuesday: "อังคาร",
  Wednesday: "พุธ",
  Thursday: "พฤหัสบดี",
  Friday: "ศุกร์",
};

export const DEFAULT_SUBJECTS: Subject[] = [
  { id: "s1", code: "ท11101", name: "ภาษาไทย", category: SubjectCategory.THAI, hoursPerWeek: 5 },
  { id: "s2", code: "ค11101", name: "คณิตศาสตร์", category: SubjectCategory.MATH, hoursPerWeek: 5 },
  { id: "s3", code: "ว11101", name: "วิทยาศาสตร์", category: SubjectCategory.SCIENCE, hoursPerWeek: 2 },
  { id: "s4", code: "ส11101", name: "สังคมศึกษา", category: SubjectCategory.SOCIAL, hoursPerWeek: 2 },
  { id: "s5", code: "อ11101", name: "ภาษาอังกฤษ", category: SubjectCategory.FOREIGN, hoursPerWeek: 3 },
  { id: "s6", code: "พ11101", name: "สุขศึกษา", category: SubjectCategory.HEALTH, hoursPerWeek: 1 },
  { id: "s7", code: "ศ11101", name: "ศิลปะ", category: SubjectCategory.ARTS, hoursPerWeek: 1 },
];

export interface SchoolSettings {
  schoolName: string;
  academicYear: string;
  semester: string;
  totalPeriods: number;
  periodDuration: number;
  lunchPeriod: number;
  startTime: string; // e.g. "08:30"
}

export interface ActivityPeriod {
  id: string;
  name: string;
  day: DayOfWeek;
  period: number;
}

export interface DbSettings {
  host: string;
  user: string;
  password?: string;
  database: string;
  port: number;
}

export interface AppSettings extends SchoolSettings {
  activities: ActivityPeriod[];
  dbConfig?: DbSettings;
}

export const DEFAULT_SETTINGS: AppSettings = {
  schoolName: "โรงเรียนตัวอย่าง",
  academicYear: "2567",
  semester: "1",
  totalPeriods: 8,
  periodDuration: 50,
  lunchPeriod: 4,
  startTime: "08:30",
  activities: [
    { id: '1', name: 'กิจกรรมชุมนุม', day: 'Wednesday', period: 7 },
    { id: '2', name: 'ลูกเสือ/เนตรนารี', day: 'Thursday', period: 8 },
  ],
  dbConfig: {
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'siamschedule',
    port: 3306
  }
};
