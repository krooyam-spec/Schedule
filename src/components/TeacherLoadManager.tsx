import React, { useState } from 'react';
import { useAppState } from '../AppContext';
import { TeacherLoad } from '../types';
import { Plus, Trash2, BookOpen, User, Hash, Layers } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const TeacherLoadManager: React.FC = () => {
  const { teachers, teacherLoads, setTeacherLoads, syncTeacherLoad, deleteTeacherLoad, classrooms } = useAppState();
  
  const [teacherId, setTeacherId] = useState('');
  const [subjectCode, setSubjectCode] = useState('');
  const [subjectName, setSubjectName] = useState('');
  const [level, setLevel] = useState('ป.1');
  const [room, setRoom] = useState('');
  const [hours, setHours] = useState(1);
  const [type, setType] = useState<'single' | 'double'>('single');

  const handleAdd = async () => {
    if (!teacherId || !subjectCode || !subjectName || !level) return;
    
    const newLoad: TeacherLoad = {
      id: Math.random().toString(36).substr(2, 9),
      teacherId,
      subjectCode,
      subjectName,
      level,
      room,
      hoursPerWeek: hours,
      periodType: type
    };
    
    setTeacherLoads([...teacherLoads, newLoad]);
    await syncTeacherLoad(newLoad);
    
    // Reset form partially
    setSubjectCode('');
    setSubjectName('');
    setHours(1);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 tracking-tight">กำหนดภาระงานสอน</h1>
          <p className="text-slate-500 mt-1">มอบหมายวิชาและห้องเรียนให้กับคุณครู</p>
        </div>
      </div>

      <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1.5">เลือกคุณครู</label>
            <select
              value={teacherId}
              onChange={e => setTeacherId(e.target.value)}
              className="w-full px-4 py-2 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-all font-sans"
            >
              <option value="">-- เลือกคุณครู --</option>
              {teachers.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1.5">รหัสวิชา</label>
            <input
              type="text"
              value={subjectCode}
              onChange={e => setSubjectCode(e.target.value)}
              className="w-full px-4 py-2 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-all font-sans"
              placeholder="เช่น ท11101"
            />
          </div>
          <div className="lg:col-span-2">
            <label className="block text-sm font-bold text-slate-700 mb-1.5">ชื่อรายวิชา</label>
            <input
              type="text"
              value={subjectName}
              onChange={e => setSubjectName(e.target.value)}
              className="w-full px-4 py-2 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-all font-sans"
              placeholder="เช่น ภาษาไทย"
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1.5">ระดับชั้น</label>
            <select
              value={level}
              onChange={e => setLevel(e.target.value)}
              className="w-full px-4 py-2 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-all font-sans"
            >
              {Array.from(new Set(classrooms.map(c => c.level))).sort().map(l => (
                <option key={l} value={l}>{l}</option>
              ))}
              {classrooms.length === 0 && <option value="ป.1">ป.1</option>}
            </select>
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1.5">ห้องที่สอน (ถ้ามี)</label>
            <input
              type="text"
              value={room}
              onChange={e => setRoom(e.target.value)}
              className="w-full px-4 py-2 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-all font-sans"
              placeholder="เช่น ป.1/1"
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1.5">จำนวนคาบ/สัปดาห์</label>
            <input
              type="number"
              value={hours}
              onChange={e => setHours(parseInt(e.target.value))}
              className="w-full px-4 py-2 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-all font-sans"
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1.5">ประเภทคาบ</label>
            <select
              value={type}
              onChange={e => setType(e.target.value as any)}
              className="w-full px-4 py-2 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-all font-sans"
            >
              <option value="single">คาบเดี่ยว</option>
              <option value="double">คาบคู่</option>
            </select>
          </div>
        </div>
        <button
          onClick={handleAdd}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-2xl font-bold transition-all shadow-lg shadow-blue-100 flex items-center justify-center gap-2 font-sans"
        >
          <Plus size={20} />
          เพิ่มภาระงานสอน
        </button>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-50 border-b border-slate-100">
            <tr>
              <th className="px-6 py-4 text-sm font-bold text-slate-600">คุณครู</th>
              <th className="px-6 py-4 text-sm font-bold text-slate-600">รายวิชา</th>
              <th className="px-6 py-4 text-sm font-bold text-slate-600">ระดับ/ห้อง</th>
              <th className="px-6 py-4 text-sm font-bold text-slate-600 text-center">คาบ</th>
              <th className="px-6 py-4 text-sm font-bold text-slate-600 text-right">จัดการ</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 font-sans">
            {teacherLoads.map((load) => {
              const teacher = teachers.find(t => t.id === load.teacherId);
              return (
                <motion.tr layout key={load.id} className="hover:bg-slate-50/50 transition-all group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <User size={14} className="text-slate-400" />
                      <span className="font-medium text-slate-700">{teacher?.name || 'ไม่พบรายชื่อ'}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <span className="font-bold text-slate-800 text-sm">{load.subjectName}</span>
                      <span className="text-xs text-slate-400">{load.subjectCode}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-1 bg-slate-100 text-slate-600 rounded-lg text-xs font-bold">
                      {load.level} {load.room && `/ ${load.room}`}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <div className="flex flex-col items-center">
                      <span className="font-bold text-blue-600">{load.hoursPerWeek}</span>
                      <span className="text-[10px] text-slate-400 uppercase">{load.periodType === 'double' ? 'คาบคู่' : 'คาบเดี่ยว'}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => deleteTeacherLoad(load.id)}
                      className="p-2 text-slate-400 hover:text-red-500 transition-all"
                    >
                      <Trash2 size={18} />
                    </button>
                  </td>
                </motion.tr>
              );
            })}
            {teacherLoads.length === 0 && (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-slate-400">ยังไม่มีการกำหนดภาระงานสอน</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
