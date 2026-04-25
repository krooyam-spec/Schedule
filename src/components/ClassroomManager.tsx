import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useAppState } from '../AppContext';
import { Classroom } from '../types';
import { Plus, Trash2, Edit2, School, GraduationCap } from 'lucide-react';

export const ClassroomManager: React.FC = () => {
  const { classrooms, setClassrooms, syncClassroom, deleteClassroom } = useAppState();
  const [isAdding, setIsAdding] = useState(false);
  
  const [newClassroom, setNewClassroom] = useState<Partial<Classroom>>({
    name: '',
    level: 'Prathom'
  });

  const handleAdd = async () => {
    if (newClassroom.name) {
      const classroomToAdd: Classroom = {
        id: Date.now().toString(),
        name: newClassroom.name as string,
        level: newClassroom.level as string
      };
      setClassrooms([...classrooms, classroomToAdd]);
      await syncClassroom(classroomToAdd);
      setIsAdding(false);
      setNewClassroom({ level: 'Prathom', name: '' });
    }
  };

  const handleDelete = async (id: string) => {
    setClassrooms(classrooms.filter(c => c.id !== id));
    await deleteClassroom(id);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 tracking-tight">จัดการห้องเรียน</h1>
          <p className="text-slate-500 mt-1 font-medium italic">กำหนดชั้นปีและกลุ่มการเรียนให้ครอบคลุมทั้งโรงเรียน</p>
        </div>
        <button 
          onClick={() => setIsAdding(true)}
          className="bg-orange-600 text-white px-6 py-3 rounded-2xl font-bold flex items-center gap-2 hover:bg-orange-700 transition-all shadow-lg shadow-orange-200 active:scale-95"
        >
          <Plus size={20} />
          เพิ่มห้องเรียน
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
        <AnimatePresence>
          {classrooms.map((room, i) => (
            <motion.div
              key={room.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.05 }}
              className="bg-white border border-slate-200 rounded-[2.5rem] p-8 group hover:border-orange-500 transition-all text-center shadow-sm hover:shadow-md"
            >
              <div className="w-20 h-20 bg-slate-50 mx-auto rounded-full flex items-center justify-center text-slate-300 mb-6 group-hover:bg-orange-50 group-hover:text-orange-500 transition-colors">
                <GraduationCap size={40} />
              </div>
              <div className="text-[10px] font-black uppercase text-slate-300 tracking-[0.2em] mb-1">Classroom</div>
              <h3 className="text-3xl font-black text-slate-800 mb-1">{room.name}</h3>
              <p className="text-slate-400 text-xs font-bold mb-8 uppercase tracking-wider">{room.level === 'Prathom' ? 'ประถม' : 'มัธยม'}</p>
              
              <div className="flex gap-2 justify-center pt-6 border-t border-slate-100">
                <button 
                  onClick={() => handleDelete(room.id)}
                  className="p-3 hover:bg-red-50 rounded-2xl text-slate-300 hover:text-red-500 transition-all flex items-center gap-2 text-xs font-bold uppercase tracking-wider"
                >
                  <Trash2 size={16} />
                  Delete
                </button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        
        {classrooms.length === 0 && (
          <div className="col-span-full py-24 text-center border-2 border-dashed border-slate-200 rounded-[2.5rem] bg-white/50">
            <School className="mx-auto text-slate-300 mb-6" size={56} />
            <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">No Classrooms Found</p>
            <p className="text-slate-500 mt-2 text-sm">เริ่มต้นโดยการเพิ่มห้องเรียนชุดแรกของคุณ</p>
          </div>
        )}
      </div>

      {isAdding && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white border border-slate-200 w-full max-w-md rounded-[2.5rem] p-10 shadow-2xl"
          >
            <h2 className="text-2xl font-black text-slate-800 mb-8 tracking-tight">ข้อมูลห้องเรียนใหม่</h2>
            <div className="space-y-8">
              <div className="space-y-3">
                <label className="text-xs font-black text-slate-400 uppercase tracking-wider">ชื่อห้อง / ชั้นปี</label>
                <input 
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 text-slate-800 focus:ring-2 focus:ring-orange-500 outline-none transition-all"
                  placeholder="เช่น ป.1/1 หรือ ม.4/1"
                  value={newClassroom.name}
                  onChange={e => setNewClassroom({...newClassroom, name: e.target.value})}
                />
              </div>
              
              <div className="space-y-3">
                <label className="text-xs font-black text-slate-400 uppercase tracking-wider">ระดับชั้น</label>
                <div className="grid grid-cols-2 gap-3">
                  <button 
                    onClick={() => setNewClassroom({...newClassroom, level: 'Prathom'})}
                    className={`py-4 px-4 rounded-2xl border font-bold transition-all ${
                      newClassroom.level === 'Prathom' 
                        ? 'bg-orange-600 border-orange-600 text-white shadow-lg shadow-orange-100' 
                        : 'bg-slate-50 border-slate-200 text-slate-400 hover:border-slate-300'
                    }`}
                  >
                    ประถม
                  </button>
                  <button 
                    onClick={() => setNewClassroom({...newClassroom, level: 'Mattayom'})}
                    className={`py-4 px-4 rounded-2xl border font-bold transition-all ${
                      newClassroom.level === 'Mattayom' 
                        ? 'bg-orange-600 border-orange-600 text-white shadow-lg shadow-orange-100' 
                        : 'bg-slate-50 border-slate-200 text-slate-400 hover:border-slate-300'
                    }`}
                  >
                    มัธยม
                  </button>
                </div>
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
                className="flex-1 py-4 bg-orange-600 text-white rounded-2xl font-bold hover:bg-orange-700 transition-all shadow-xl shadow-orange-100"
              >
                บันทึกห้องเรียน
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};
