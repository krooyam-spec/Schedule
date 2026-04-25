import React, { useState } from 'react';
import { useAppState } from '../AppContext';
import { Teacher, SubjectCategory } from '../types';
import { Plus, Trash2, User, Award, Table as TableIcon } from 'lucide-react';
import { motion } from 'framer-motion';

export const TeacherManager: React.FC = () => {
  const { teachers, setTeachers, syncTeacher, deleteTeacher } = useAppState();
  const [name, setName] = useState('');
  const [category, setCategory] = useState<SubjectCategory>(SubjectCategory.THAI);
  const [maxHours, setMaxHours] = useState(20);

  const handleAdd = async () => {
    if (!name) return;
    const newTeacher: Teacher = {
      id: Math.random().toString(36).substr(2, 9),
      name,
      expertSubjects: [category],
      maxHoursPerWeek: maxHours
    };
    setTeachers([...teachers, newTeacher]);
    await syncTeacher(newTeacher);
    setName('');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 tracking-tight">ข้อมูลคุณครู</h1>
          <p className="text-slate-500 mt-1">รายชื่อและภาระงานสอนสูงสุดของคุณครู</p>
        </div>
      </div>

      <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex flex-wrap gap-4 items-end">
        <div className="flex-1 min-w-[200px]">
          <label className="block text-sm font-medium text-slate-700 mb-1.5">ชื่อ-นามสกุล</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-4 py-2 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-all font-sans"
            placeholder="เช่น คุณครูภาษาไทย"
          />
        </div>
        <div className="w-[200px]">
          <label className="block text-sm font-medium text-slate-700 mb-1.5">กลุ่มสาระฯ</label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value as SubjectCategory)}
            className="w-full px-4 py-2 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-all font-sans"
          >
            {Object.values(SubjectCategory).map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>
        <div className="w-[120px]">
          <label className="block text-sm font-medium text-slate-700 mb-1.5">คาบ/สัปดาห์</label>
          <input
            type="number"
            value={maxHours}
            onChange={(e) => setMaxHours(parseInt(e.target.value))}
            className="w-full px-4 py-2 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-all font-sans"
          />
        </div>
        <button
          onClick={handleAdd}
          className="bg-blue-600 hover:bg-blue-700 text-white p-2.5 rounded-xl transition-all shadow-lg shadow-blue-100"
        >
          <Plus size={24} />
        </button>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-50 border-b border-slate-100">
            <tr>
              <th className="px-6 py-4 text-sm font-bold text-slate-600">ชื่อ-นามสกุล</th>
              <th className="px-6 py-4 text-sm font-bold text-slate-600">กลุ่มสาระการเรียนรู้</th>
              <th className="px-6 py-4 text-sm font-bold text-slate-600 text-center">คาบสอนสูงสุด</th>
              <th className="px-6 py-4 text-sm font-bold text-slate-600 text-right">จัดการ</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 font-sans">
            {teachers.map((teacher) => (
              <motion.tr 
                layout
                key={teacher.id} 
                className="hover:bg-slate-50/50 transition-all group"
              >
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500">
                      <User size={16} />
                    </div>
                    <span className="font-medium text-slate-800">{teacher.name}</span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className="px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-xs font-bold">
                    {teacher.expertSubjects[0]}
                  </span>
                </td>
                <td className="px-6 py-4 text-center text-slate-600">{teacher.maxHoursPerWeek}</td>
                <td className="px-6 py-4 text-right">
                  <button
                    onClick={() => deleteTeacher(teacher.id)}
                    className="p-2 text-slate-400 hover:text-red-500 transition-all"
                  >
                    <Trash2 size={18} />
                  </button>
                </td>
              </motion.tr>
            ))}
            {teachers.length === 0 && (
              <tr>
                <td colSpan={4} className="px-6 py-12 text-center text-slate-400">ยังไม่มีรายชื่อคุณครู</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
