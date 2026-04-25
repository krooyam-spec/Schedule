import React, { createContext, useContext, useState, useEffect } from 'react';
import { Subject, Teacher, Classroom, TimetableEntry, DEFAULT_SUBJECTS, AppSettings, DEFAULT_SETTINGS } from './types';

interface AppState {
  subjects: Subject[];
  teachers: Teacher[];
  classrooms: Classroom[];
  timetable: TimetableEntry[];
  settings: AppSettings;
  setSubjects: React.Dispatch<React.SetStateAction<Subject[]>>;
  setTeachers: React.Dispatch<React.SetStateAction<Teacher[]>>;
  setClassrooms: React.Dispatch<React.SetStateAction<Classroom[]>>;
  setTimetable: React.Dispatch<React.SetStateAction<TimetableEntry[]>>;
  setSettings: React.Dispatch<React.SetStateAction<AppSettings>>;
  syncSubject: (subject: Subject) => Promise<void>;
  syncTeacher: (teacher: Teacher) => Promise<void>;
  syncClassroom: (classroom: Classroom) => Promise<void>;
  syncTimetable: (entries: TimetableEntry[]) => Promise<void>;
  syncSettings: (settings: AppSettings) => Promise<void>;
  deleteSubject: (id: string) => Promise<void>;
  deleteTeacher: (id: string) => Promise<void>;
  deleteClassroom: (id: string) => Promise<void>;
}

const AppContext = createContext<AppState | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [subjects, setSubjects] = useState<Subject[]>(DEFAULT_SUBJECTS);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [classrooms, setClassrooms] = useState<Classroom[]>([]);
  const [timetable, setTimetable] = useState<TimetableEntry[]>([]);
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);

  // Load from API
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [subRes, teachRes, classRes, timeRes, settRes] = await Promise.all([
          fetch('/api/subjects').then(r => r.json()),
          fetch('/api/teachers').then(r => r.json()),
          fetch('/api/classrooms').then(r => r.json()),
          fetch('/api/timetable').then(r => r.json()),
          fetch('/api/settings').then(r => r.json())
        ]);
        
        if (subRes.length > 0) setSubjects(subRes);
        setTeachers(teachRes || []);
        setClassrooms(classRes || []);
        setTimetable(timeRes || []);
        if (settRes && settRes.schoolName) setSettings(settRes);
      } catch (error) {
        console.error('Failed to fetch data:', error);
      }
    };
    fetchData();
  }, []);

  // API sync helpers
  const syncSettings = async (newSettings: AppSettings) => {
    await fetch('/api/settings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newSettings)
    });
  };

  // API sync helpers
  const syncSubject = async (subject: Subject) => {
    await fetch('/api/subjects', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(subject)
    });
  };

  const syncTeacher = async (teacher: Teacher) => {
    await fetch('/api/teachers', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(teacher)
    });
  };

  const syncClassroom = async (classroom: Classroom) => {
    await fetch('/api/classrooms', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(classroom)
    });
  };

  const syncTimetable = async (entries: TimetableEntry[]) => {
    await fetch('/api/timetable/sync', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(entries)
    });
  };

  const deleteSubject = async (id: string) => {
    await fetch(`/api/subjects/${id}`, { method: 'DELETE' });
  };

  const deleteTeacher = async (id: string) => {
    await fetch(`/api/teachers/${id}`, { method: 'DELETE' });
  };

  const deleteClassroom = async (id: string) => {
    await fetch(`/api/classrooms/${id}`, { method: 'DELETE' });
  };

  return (
    <AppContext.Provider value={{
      subjects, teachers, classrooms, timetable, settings,
      setSubjects, setTeachers, setClassrooms, setTimetable, setSettings,
      syncSubject, syncTeacher, syncClassroom, syncTimetable, syncSettings,
      deleteSubject, deleteTeacher, deleteClassroom
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppState = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppState must be used within an AppProvider');
  }
  return context;
};
