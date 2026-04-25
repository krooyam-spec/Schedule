import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { useAppState } from '../AppContext';
import { BookOpen, Layers, Clock } from 'lucide-react';

export const SubjectManager: React.FC = () => {
  const { teacherLoads } = useAppState();

  // Group subjects by Level then by Subject Code (to avoid duplicates across rooms)
  const groupedSubjects = useMemo(() => {
    const groups: Record<string, any[]> = {};
    
    teacherLoads.forEach(load => {
      if (!groups[load.level]) groups[load.level] = [];
      const exists = groups[load.level].find(s => s.code === load.subjectCode);
      if (!exists) {
        groups[load.level].push({
          code: load.subjectCode,
          name: load.subjectName,
          hours: load.hoursPerWeek
        });
      }
    });

    return Object.entries(groups).sort();
  }, [teacherLoads]);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-slate-800 tracking-tight">รายวิชาแยกตามระดับชั้น</h1>
        <p className="text-slate-500 mt-1">ข้อมูลวิชาที่ดึงมาจากภาระงานสอนของคุณครู</p>
      </div>

      <div className="space-y-12 font-sans">
        {groupedSubjects.map(([level, subjects]) => (
          <div key={level} className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-100">
                <Layers size={20} />
              </div>
              <h2 className="text-2xl font-bold text-slate-800">ระดับชั้น {level}</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {subjects.map((subject, idx) => (
                <motion.div
                  key={subject.code + idx}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-all group"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className="bg-slate-50 text-slate-400 text-[10px] font-black tracking-widest px-3 py-1.5 rounded-xl border border-slate-100">
                      {subject.code}
                    </div>
                  </div>
                  <h3 className="text-lg font-bold text-slate-800 mb-4">{subject.name}</h3>
                  <div className="flex items-center gap-2 text-xs font-bold text-blue-600 bg-blue-50 w-fit px-3 py-1.5 rounded-xl">
                    <Clock size={14} />
                    <span>{subject.hours} คาบ/สัปดาห์</span>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        ))}

        {groupedSubjects.length === 0 && (
          <div className="py-24 text-center border-2 border-dashed border-slate-200 rounded-[2.5rem] bg-white text-slate-400">
            <BookOpen className="mx-auto mb-4 opacity-20" size={48} />
            <p className="font-bold uppercase tracking-widest text-xs">ยังไม่มีข้อมูลรายวิชา</p>
            <p className="text-sm mt-1">กรุณากำหนดภาระงานสอนให้คุณครูก่อน</p>
          </div>
        )}
      </div>
    </div>
  );
};
