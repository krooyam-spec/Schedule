import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useAppState } from '../AppContext';
import { Subject, SubjectCategory } from '../types';
import { Plus, Trash2, Edit2, Search, BookOpen, Clock, Tag } from 'lucide-react';

export const SubjectManager: React.FC = () => {
  const { subjects, setSubjects, syncSubject, deleteSubject } = useAppState();
  const [isAdding, setIsAdding] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [newSubject, setNewSubject] = useState<Partial<Subject>>({
    id: '',
    code: '',
    name: '',
    category: SubjectCategory.THAI,
    hoursPerWeek: 1
  });

  const handleAdd = async () => {
    if (newSubject.code && newSubject.name) {
      const subjectToAdd: Subject = {
        id: Date.now().toString(),
        code: newSubject.code as string,
        name: newSubject.name as string,
        category: (newSubject.category as SubjectCategory) || SubjectCategory.THAI,
        hoursPerWeek: newSubject.hoursPerWeek || 1
      };
      setSubjects([...subjects, subjectToAdd]);
      await syncSubject(subjectToAdd);
      setIsAdding(false);
      setNewSubject({ category: SubjectCategory.THAI, hoursPerWeek: 1 });
    }
  };

  const handleDelete = async (id: string) => {
    setSubjects(subjects.filter(s => s.id !== id));
    await deleteSubject(id);
  };

  const filteredSubjects = subjects.filter(s => 
    s.name.includes(searchTerm) || s.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 tracking-tight">จัดการรายวิชา</h1>
          <p className="text-slate-500 mt-1 font-medium italic">คลังข้อมูลรายวิชาทั้งหมดในหลักสูตรสถานศึกษา</p>
        </div>
        <button 
          onClick={() => setIsAdding(true)}
          className="bg-blue-600 text-white px-6 py-3 rounded-2xl font-bold flex items-center gap-2 hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 active:scale-95"
        >
          <Plus size={20} />
          เพิ่มวิชาใหม่
        </button>
      </div>

      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
        <input 
          type="text" 
          placeholder="ค้นหาวันวิชาหรือรหัสวิชา..."
          className="w-full bg-white border border-slate-200 rounded-2xl py-4 pl-12 pr-4 text-slate-800 shadow-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        <AnimatePresence>
          {filteredSubjects.map((subject) => (
            <motion.div
              key={subject.id}
              layout
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white border border-slate-200 rounded-3xl p-6 group hover:border-blue-500 transition-all shadow-sm hover:shadow-md"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="bg-slate-100 text-slate-500 text-[10px] font-black tracking-widest px-3 py-1.5 rounded-xl border border-slate-200/50">
                  {subject.code}
                </div>
                <div className="flex gap-1">
                  <button className="p-2 hover:bg-slate-50 rounded-xl text-slate-400 hover:text-slate-800 transition-colors">
                    <Edit2 size={16} />
                  </button>
                  <button 
                    onClick={() => handleDelete(subject.id)}
                    className="p-2 hover:bg-red-50 rounded-xl text-slate-400 hover:text-white transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-4 line-clamp-1">{subject.name}</h3>
              
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm text-slate-500 font-medium">
                  <Tag size={16} className="text-slate-300" />
                  <span>{subject.category}</span>
                </div>
                <div className="flex items-center gap-2 text-xs font-bold text-blue-600 bg-blue-50 w-fit px-3 py-1 rounded-lg">
                  <Clock size={14} />
                  <span>{subject.hoursPerWeek} คาบต่อสัปดาห์</span>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {isAdding && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            className="bg-white border border-slate-200 w-full max-w-lg rounded-[2.5rem] p-10 shadow-2xl"
          >
            <h2 className="text-2xl font-black text-slate-800 mb-8 tracking-tight">ระบุข้อมูลวิชาใหม่</h2>
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-wider">รหัสวิชา</label>
                  <input 
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 text-slate-800 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                    placeholder="เช่น ท11101"
                    value={newSubject.code}
                    onChange={e => setNewSubject({...newSubject, code: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-wider">จำนวนคาบ</label>
                  <input 
                    type="number"
                    min="1"
                    max="10"
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 text-slate-800 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                    value={newSubject.hoursPerWeek}
                    onChange={e => setNewSubject({...newSubject, hoursPerWeek: parseInt(e.target.value) || 1})}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-black text-slate-400 uppercase tracking-wider">ชื่อวิชา</label>
                <input 
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 text-slate-800 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                  placeholder="เช่น ภาษาไทยพื้นฐาน"
                  value={newSubject.name}
                  onChange={e => setNewSubject({...newSubject, name: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-black text-slate-400 uppercase tracking-wider">กลุ่มสาระ</label>
                <select 
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 text-slate-800 focus:ring-2 focus:ring-blue-500 outline-none transition-all appearance-none"
                  value={newSubject.category}
                  onChange={e => setNewSubject({...newSubject, category: e.target.value as SubjectCategory})}
                >
                  {Object.values(SubjectCategory).map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="flex gap-4 mt-10">
              <button 
                onClick={() => setIsAdding(false)}
                className="flex-1 py-4 px-4 bg-slate-100 text-slate-500 rounded-2xl font-bold hover:bg-slate-200 transition-colors"
              >
                ยกเลิก
              </button>
              <button 
                onClick={handleAdd}
                className="flex-1 py-4 px-4 bg-blue-600 text-white rounded-2xl font-bold hover:bg-blue-700 transition-shadow shadow-lg shadow-blue-200"
              >
                บันทึกรายวิชา
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};
