import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppState } from '../AppContext';
import { Teacher } from '../types';
import { Plus, Trash2, Edit2, User, Book, Clock, CheckCircle } from 'lucide-react';

export const TeacherManager: React.FC = () => {
  const { teachers, setTeachers, syncTeacher, deleteTeacher, subjects } = useAppState();
  const [isAdding, setIsAdding] = useState(false);
  
  const [newTeacher, setNewTeacher] = useState<Partial<Teacher>>({
    name: '',
    expertSubjects: [],
    maxHoursPerWeek: 20
  });

  const handleAdd = async () => {
    if (newTeacher.name && newTeacher.expertSubjects!.length > 0) {
      const teacherToAdd: Teacher = {
        id: Date.now().toString(),
        name: newTeacher.name as string,
        expertSubjects: newTeacher.expertSubjects as string[],
        maxHoursPerWeek: newTeacher.maxHoursPerWeek || 20
      };
      setTeachers([...teachers, teacherToAdd]);
      await syncTeacher(teacherToAdd);
      setIsAdding(false);
      setNewTeacher({ expertSubjects: [], maxHoursPerWeek: 20 });
    }
  };

  const toggleSubject = (subjectId: string) => {
    const current = [...(newTeacher.expertSubjects || [])];
    if (current.includes(subjectId)) {
      setNewTeacher({ ...newTeacher, expertSubjects: current.filter(id => id !== subjectId) });
    } else {
      setNewTeacher({ ...newTeacher, expertSubjects: [...current, subjectId] });
    }
  };

  const handleDelete = async (id: string) => {
    setTeachers(teachers.filter(t => t.id !== id));
    await deleteTeacher(id);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 tracking-tight">จัดการครูผู้สอน</h1>
          <p className="text-slate-500 mt-1 font-medium italic">ข้อมูลบุคลากรและรายวิชาที่ได้รับมอบหมาย</p>
        </div>
        <button 
          onClick={() => setIsAdding(true)}
          className="bg-purple-600 text-white px-6 py-3 rounded-2xl font-bold flex items-center gap-2 hover:bg-purple-700 transition-all shadow-lg shadow-purple-200 active:scale-95"
        >
          <Plus size={20} />
          เพิ่มครูผู้สอน
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <AnimatePresence>
          {teachers.map((teacher, i) => (
            <motion.div
              key={teacher.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="bg-white border border-slate-200 rounded-3xl p-6 group hover:border-purple-500 transition-all shadow-sm hover:shadow-md"
            >
              <div className="flex items-center gap-4 mb-6">
                <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400 group-hover:bg-purple-50 group-hover:text-purple-500 transition-colors">
                  <User size={28} />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-800">{teacher.name}</h3>
                  <p className="text-slate-500 text-sm font-medium">รับผิดชอบ {teacher.expertSubjects.length} รายวิชา</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-wider">
                  <Clock size={16} className="text-slate-300" />
                  <span>Max {teacher.maxHoursPerWeek} คาบ/สัปดาห์</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {teacher.expertSubjects.map(sid => {
                    const subj = subjects.find(s => s.id === sid);
                    return (
                      <span key={sid} className="px-3 py-1.5 bg-slate-50 text-slate-600 rounded-xl text-xs font-bold border border-slate-100">
                        {subj?.name || sid}
                      </span>
                    );
                  })}
                </div>
              </div>

              <div className="flex gap-2 justify-end mt-6 pt-6 border-t border-slate-100">
                <button className="p-2 hover:bg-slate-50 rounded-xl text-slate-400 hover:text-slate-800 transition-colors">
                  <Edit2 size={16} />
                </button>
                <button 
                  onClick={() => handleDelete(teacher.id)}
                  className="p-2 hover:bg-red-50 rounded-xl text-slate-400 hover:text-red-500 transition-colors"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {isAdding && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white border border-slate-200 w-full max-w-2xl rounded-[2.5rem] p-10 shadow-2xl max-h-[90vh] overflow-y-auto"
          >
            <h2 className="text-3xl font-black text-slate-800 mb-8 tracking-tight">ข้อมูลครูผู้สอนใหม่</h2>
            <div className="space-y-8">
              <div className="space-y-3">
                <label className="text-xs font-black text-slate-400 uppercase tracking-wider">ชื่อ-นามสกุล</label>
                <input 
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 text-slate-800 focus:ring-2 focus:ring-purple-500 outline-none transition-all"
                  placeholder="เช่น นายพรชัย เรียนรู้"
                  value={newTeacher.name}
                  onChange={e => setNewTeacher({...newTeacher, name: e.target.value})}
                />
              </div>
              
              <div className="space-y-3">
                <label className="text-xs font-black text-slate-400 uppercase tracking-wider">วิชาที่รับผิดชอบ</label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-4 bg-slate-50 rounded-[2rem] border border-slate-200">
                  {subjects.map(subject => (
                    <button
                      key={subject.id}
                      onClick={() => toggleSubject(subject.id)}
                      className={`flex items-center justify-between p-4 rounded-2xl border text-left transition-all ${
                        newTeacher.expertSubjects?.includes(subject.id)
                          ? 'bg-purple-600 border-purple-600 text-white shadow-lg shadow-purple-200 scale-105 z-10'
                          : 'bg-white border-slate-200 text-slate-500 hover:border-slate-400'
                      }`}
                    >
                      <span className="text-xs font-bold line-clamp-1">{subject.name}</span>
                      {newTeacher.expertSubjects?.includes(subject.id) && <CheckCircle size={14} />}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-xs font-black text-slate-400 uppercase tracking-wider">ภาระงานสูงสุด (คาบ/สัปดาห์)</label>
                <input 
                  type="number"
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 text-slate-800 focus:ring-2 focus:ring-purple-500 outline-none transition-all"
                  value={newTeacher.maxHoursPerWeek}
                  onChange={e => setNewTeacher({...newTeacher, maxHoursPerWeek: parseInt(e.target.value) || 0})}
                />
              </div>
            </div>

            <div className="flex gap-4 mt-12">
              <button 
                onClick={() => setIsAdding(false)}
                className="flex-1 py-4 bg-slate-100 text-slate-500 rounded-2xl font-bold hover:bg-slate-200 transition-colors"
              >
                ยกเลิก
              </button>
              <button 
                onClick={handleAdd}
                className="flex-1 py-4 bg-purple-600 text-white rounded-2xl font-bold hover:bg-purple-700 transition-all shadow-xl shadow-purple-100"
              >
                บันทึกข้อมูล
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};
