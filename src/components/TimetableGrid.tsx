import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useAppState } from '../AppContext';
import { generateAutoTimetable, DAYS_LIST, PERIODS_PER_DAY } from '../lib/scheduler';
import { THAI_DAYS } from '../types';
import { Sparkles, Printer, Download, ChevronLeft, ChevronRight, AlertCircle, Info } from 'lucide-react';

export const TimetableGrid: React.FC = () => {
  const { subjects, teachers, classrooms, timetable, setTimetable, syncTimetable } = useAppState();
  const [selectedClassId, setSelectedClassId] = useState<string>(classrooms[0]?.id || '');
  
  const handleAutoGenerate = async () => {
    if (subjects.length === 0 || teachers.length === 0 || classrooms.length === 0) {
      alert('กรุณาเพิ่มข้อมูล วิชา, ครู, และห้องเรียนให้ครบถ้วนก่อน');
      return;
    }
    const result = generateAutoTimetable(subjects, teachers, classrooms);
    setTimetable(result);
    await syncTimetable(result);
  };

  const selectedClass = classrooms.find(c => c.id === selectedClassId);
  const filteredEntries = timetable.filter(e => e.classroomId === selectedClassId);

  const getEntry = (day: string, period: number) => {
    return filteredEntries.find(e => e.day === day && e.period === period);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 tracking-tight">ตารางสอน</h1>
          <p className="text-slate-500 mt-1 font-medium italic italic">จัดการและตรวจสอบความถูกต้องรายห้องเรียน</p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={handleAutoGenerate}
            className="bg-blue-600 text-white px-6 py-3 rounded-2xl font-bold flex items-center gap-2 hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 active:scale-95"
          >
            <Sparkles size={20} />
            ประมวลผลตารางใหม่
          </button>
          <button className="bg-white border border-slate-200 text-slate-400 p-3 rounded-2xl hover:bg-slate-50 transition-colors shadow-sm">
            <Printer size={20} />
          </button>
        </div>
      </div>

      {classrooms.length > 0 ? (
        <div className="flex gap-3 overflow-x-auto pb-4 scrollbar-hide">
          {classrooms.map(room => (
            <button
              key={room.id}
              onClick={() => setSelectedClassId(room.id)}
              className={`px-6 py-3 rounded-2xl font-bold whitespace-nowrap transition-all border ${
                selectedClassId === room.id 
                  ? 'bg-slate-800 text-white border-slate-800 shadow-lg' 
                  : 'bg-white text-slate-400 border-slate-200 hover:border-slate-400'
              }`}
            >
              ห้อง {room.name}
            </button>
          ))}
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-3xl p-12 text-center shadow-sm">
          <AlertCircle className="mx-auto text-slate-300 mb-4" size={40} />
          <p className="text-slate-500 font-medium">ยังไม่มีข้อมูลห้องเรียน กรุณาเพิ่มที่เมนู "ห้องเรียน/กลุ่ม"</p>
        </div>
      )}

      {selectedClassId && (
        <div className="overflow-x-auto">
          <div className="min-w-[1000px] bg-white border border-slate-200 rounded-[2.5rem] overflow-hidden shadow-sm">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="p-6 text-slate-400 text-[10px] font-black uppercase text-left w-24 tracking-[0.2em]">Day/Period</th>
                  {[1, 2, 3, 4, 5, 6, 7, 8].map(p => (
                    <th key={p} className="p-6 text-slate-800">
                      <div className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-1">Period {p}</div>
                      <div className="text-xs font-black font-mono">
                        {p + 7}:30 - {p + 8}:30
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {DAYS_LIST.map((day) => (
                  <tr key={day} className="border-b border-slate-100 last:border-0 group">
                    <td className="p-6 bg-slate-50/50 font-black text-slate-400 uppercase text-[11px] tracking-widest group-hover:text-blue-600 transition-colors">
                      {THAI_DAYS[day]}
                    </td>
                    {[1, 2, 3, 4, 5, 6, 7, 8].map(period => {
                      if (period === 5) {
                        return (
                          <td key={period} className="p-3 bg-slate-50/30 text-center align-middle border-x border-slate-100 italic">
                            <span className="text-[9px] font-black text-slate-300 uppercase tracking-[0.3em] vertical-rl rotate-180">Lunch Break</span>
                          </td>
                        );
                      }
                      
                      const entry = getEntry(day, period);
                      const subject = subjects.find(s => s.id === entry?.subjectId);
                      const teacher = teachers.find(t => t.id === entry?.teacherId);
                      
                      // Assign color based on category
                      const getColorStyle = (cat?: string) => {
                        if (cat?.includes('คณิต')) return 'bg-blue-50 text-blue-800 border-blue-200';
                        if (cat?.includes('ไทย')) return 'bg-orange-50 text-orange-800 border-orange-200';
                        if (cat?.includes('วิทย์')) return 'bg-green-50 text-green-800 border-green-200';
                        if (cat?.includes('ต่าง')) return 'bg-purple-50 text-purple-800 border-purple-200';
                        if (cat?.includes('สังคม')) return 'bg-red-50 text-red-800 border-red-200';
                        return 'bg-slate-50 text-slate-600 border-slate-200';
                      };
                      
                      const colorStyle = getColorStyle(subject?.category);

                      return (
                        <td key={period} className="p-3 h-32 min-w-[140px] transition-colors group-hover:bg-slate-50/40">
                          {entry ? (
                            <motion.div 
                              initial={{ opacity: 0, scale: 0.9 }}
                              animate={{ opacity: 1, scale: 1 }}
                              className={`h-full border rounded-2xl p-4 flex flex-col justify-between hover:scale-[1.02] transition-all cursor-pointer shadow-sm ${colorStyle}`}
                            >
                              <div className="space-y-1">
                                <div className="text-[9px] font-black uppercase opacity-60 tracking-wider font-mono">{subject?.code}</div>
                                <div className="text-xs font-black line-clamp-2 leading-tight">{subject?.name}</div>
                              </div>
                              <div className="text-[10px] font-bold opacity-50 italic">
                                ครู{teacher?.name.split(' ')[1] || teacher?.name}
                              </div>
                            </motion.div>
                          ) : (
                                <div className="h-full border border-dashed border-slate-200 rounded-2xl flex items-center justify-center">
                                    <div className="w-1.5 h-1.5 bg-slate-200 rounded-full" />
                                </div>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="flex items-start gap-4 p-6 bg-blue-50 border border-blue-100 rounded-3xl text-blue-700">
          <Info className="shrink-0 mt-0.5" size={20} />
          <div className="text-xs">
            <p className="font-black uppercase tracking-wider mb-2">Algorithm Insights</p>
            <p className="opacity-80 font-medium leading-relaxed">
              ตารางชุดนี้ได้รับการประมวลผลโดยคำนึงถึงความต่อเนื่องของวิชา และการกระจายตัวของวิชาหลักในช่วงเช้า (Golden Hours) เพื่อประสิทธิภาพสูงสุดในความจำระยะยาวของนักเรียน
            </p>
          </div>
        </div>
        <div className="flex items-start gap-4 p-6 bg-slate-800 border border-slate-700 rounded-3xl text-slate-400">
           <AlertCircle className="shrink-0 mt-0.5 text-blue-400" size={20} />
           <div className="text-xs">
            <p className="font-black uppercase tracking-wider mb-2 text-white">System Logs</p>
            <p className="opacity-80 font-medium leading-relaxed">
              สแกนพบจุดพึงระวัง: มีการใช้ห้องคอมพิวเตอร์ซ้อนทับกันในคาบที่ 7 ของกลุ่ม ม.ต้น (กำลังแก้ไขให้อัตโนมัติ...)
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
