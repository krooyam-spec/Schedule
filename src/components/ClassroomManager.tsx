import React, { useState } from 'react';
import { useAppState } from '../AppContext';
import { Classroom } from '../types';
import { Plus, Trash2, Home } from 'lucide-react';
import { motion } from 'framer-motion';

export const ClassroomManager: React.FC = () => {
  const { classrooms, setClassrooms, syncClassroom, deleteClassroom } = useAppState();
  const [name, setName] = useState('');
  const [level, setLevel] = useState('ป.1');

  const handleAdd = async () => {
    if (!name) return;
    const newClassroom: Classroom = {
      id: Math.random().toString(36).substr(2, 9),
      name,
      level
    };
    setClassrooms([...classrooms, newClassroom]);
    await syncClassroom(newClassroom);
    setName('');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 tracking-tight">ข้อมูลห้องเรียน</h1>
          <p className="text-slate-500 mt-1">ชั้นเรียนและระดับชั้นทั้งหมด</p>
        </div>
      </div>

      <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex flex-wrap gap-4 items-end">
        <div className="flex-1 min-w-[200px]">
          <label className="block text-sm font-medium text-slate-700 mb-1.5">ชื่อห้องเรียน</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-4 py-2 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-all font-sans"
            placeholder="เช่น ป.1/1"
          />
        </div>
        <div className="w-[200px]">
          <label className="block text-sm font-medium text-slate-700 mb-1.5">ระดับชั้น</label>
          <select
            value={level}
            onChange={(e) => setLevel(e.target.value)}
            className="w-full px-4 py-2 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-all font-sans"
          >
            <option value="ป.1">ป.1</option>
            <option value="ป.2">ป.2</option>
            <option value="ป.3">ป.3</option>
            <option value="ป.4">ป.4</option>
            <option value="ป.5">ป.5</option>
            <option value="ป.6">ป.6</option>
            <option value="ม.1">ม.1</option>
            <option value="ม.2">ม.2</option>
            <option value="ม.3">ม.3</option>
          </select>
        </div>
        <button
          onClick={handleAdd}
          className="bg-blue-600 hover:bg-blue-700 text-white p-2.5 rounded-xl transition-all shadow-lg shadow-blue-100 font-sans"
        >
          <Plus size={24} />
        </button>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-50 border-b border-slate-100">
            <tr>
              <th className="px-6 py-4 text-sm font-bold text-slate-600">ชื่อห้องเรียน</th>
              <th className="px-6 py-4 text-sm font-bold text-slate-600">ระดับชั้น</th>
              <th className="px-6 py-4 text-sm font-bold text-slate-600 text-right">จัดการ</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 font-sans">
            {classrooms.map((room) => (
              <motion.tr 
                layout
                key={room.id} 
                className="hover:bg-slate-50/50 transition-all group"
              >
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500">
                      <Home size={16} />
                    </div>
                    <span className="font-medium text-slate-800">{room.name}</span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className="px-3 py-1 bg-slate-100 text-slate-600 rounded-full text-xs font-bold">
                    {room.level}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <button
                    onClick={() => deleteClassroom(room.id)}
                    className="p-2 text-slate-400 hover:text-red-500 transition-all"
                  >
                    <Trash2 size={18} />
                  </button>
                </td>
              </motion.tr>
            ))}
            {classrooms.length === 0 && (
              <tr>
                <td colSpan={3} className="px-6 py-12 text-center text-slate-400">ยังไม่มีข้อมูลห้องเรียน</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
