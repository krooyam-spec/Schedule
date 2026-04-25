import React from 'react';
import { motion } from 'motion/react';
import { useAppState } from '../AppContext';
import { 
  BookOpen, 
  Users, 
  School, 
  CalendarDays,
  CheckCircle2,
  AlertCircle,
  Plus
} from 'lucide-react';

export const Dashboard: React.FC = () => {
  const { subjects, teachers, classrooms, timetable } = useAppState();

  const stats = [
    { label: 'วิชาทั้งหมด', value: subjects.length, icon: BookOpen, color: 'text-blue-500', bg: 'bg-blue-500/10' },
    { label: 'ครูผู้สอน', value: teachers.length, icon: Users, color: 'text-purple-500', bg: 'bg-purple-500/10' },
    { label: 'จำนวนห้องเรียน', value: classrooms.length, icon: School, color: 'text-orange-500', bg: 'bg-orange-500/10' },
    { label: 'ตารางที่จัดแล้ว', value: timetable.length > 0 ? classrooms.length : 0, icon: CalendarDays, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
  ];

  return (
    <div className="space-y-6">
      <header className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 tracking-tight">ระบบจัดตารางสอนอัตโนมัติ</h1>
          <p className="text-slate-500 font-medium uppercase tracking-wider text-xs mt-1">SiamSchedule Dashboard | ภาคเรียนที่ 1/2567</p>
        </div>
        <div className="flex gap-3">
          <div className="hidden md:flex bg-white px-4 py-2 rounded-xl border border-slate-200 shadow-sm items-center gap-4">
            <div className="flex flex-col">
              <span className="text-[10px] text-slate-400 uppercase font-bold leading-none">สถานะระบบ</span>
              <span className="text-green-500 font-bold flex items-center gap-1.5 text-xs">
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span> พร้อมใช้งาน
              </span>
            </div>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-12 gap-4">
        {/* Quick Stats */}
        {stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.1 }}
            className={`col-span-12 sm:col-span-6 lg:col-span-3 bg-white rounded-3xl border border-slate-200 p-6 flex flex-col justify-center shadow-sm hover:shadow-md transition-shadow group overflow-hidden relative`}
          >
            <div className={`absolute -right-4 -bottom-4 opacity-5 group-hover:opacity-10 transition-opacity`}>
              <stat.icon size={100} />
            </div>
            <span className="text-slate-400 text-xs font-bold uppercase mb-2 block">{stat.label}</span>
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-black text-slate-800">{stat.value}</span>
              <span className="text-slate-400 text-sm italic">
                {stat.label.includes('ครู') ? 'ท่าน' : stat.label.includes('วิชา') ? 'รายวิชา' : 'ห้อง'}
              </span>
            </div>
          </motion.div>
        ))}

        {/* Info/Onboarding Bento Section */}
        <div className="col-span-12 lg:col-span-8 bg-white rounded-3xl border border-slate-200 p-8 shadow-sm flex flex-col min-h-[400px]">
          <h2 className="text-xl font-bold text-slate-800 mb-8 flex items-center gap-3">
            <CheckCircle2 className="text-blue-500" size={24} />
            ขั้นตอนการจัดตารางสอน
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-10">
            {[
              { title: 'เพิ่มรายวิชา', desc: 'กำหนดรหัสวิชา ชื่อวิชา และต้องการตามหลักสูตร', status: subjects.length > 0 ? 'complete' : 'pending' },
              { title: 'เพิ่มข้อมูลครู', desc: 'ระบุรายชื่อครูและวิชาที่เชี่ยวชาญ', status: teachers.length > 0 ? 'complete' : 'pending' },
              { title: 'สร้างห้องเรียน', desc: 'กำหนดชั้นปีและกลุ่มการเรียนที่จัดตาราง', status: classrooms.length > 0 ? 'complete' : 'pending' },
              { title: 'ประมวลผล', desc: 'ระบบจะคำนวณและจัดสรรเวลาให้อัตโนมัติ', status: timetable.length > 0 ? 'complete' : 'pending' },
            ].map((step, i) => (
              <div key={i} className="flex gap-4">
                <div className={`w-10 h-10 shrink-0 rounded-2xl flex items-center justify-center text-sm font-bold shadow-sm ${
                  step.status === 'complete' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-400'
                }`}>
                  {step.status === 'complete' ? <CheckCircle2 size={20} /> : i + 1}
                </div>
                <div>
                  <h3 className={`font-bold ${step.status === 'complete' ? 'text-slate-800' : 'text-slate-400'}`}>{step.title}</h3>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-auto pt-10 border-t border-slate-100 flex items-center justify-between">
            <div className="flex -space-x-3">
              {[1, 2, 3].map(j => (
                <div key={j} className="w-10 h-10 rounded-full border-2 border-white bg-slate-200 flex items-center justify-center text-slate-400">
                  <Users size={16} />
                </div>
              ))}
              <div className="w-10 h-10 rounded-full border-2 border-white bg-blue-50 flex items-center justify-center text-blue-600 font-bold text-xs">
                +12
              </div>
            </div>
            <p className="text-xs text-slate-400">บุคลากรที่เข้าร่วมในระบบปีนี้</p>
          </div>
        </div>

        {/* Action & Constraints Section */}
        <div className="col-span-12 lg:col-span-4 flex flex-col gap-4">
          <div className="bg-slate-800 rounded-3xl border border-slate-700 p-8 shadow-xl flex flex-col text-white relative overflow-hidden h-full">
             <div className="absolute top-0 right-0 p-4 opacity-10">
              <CalendarDays size={180} />
            </div>
            <h2 className="text-2xl font-black uppercase tracking-tighter leading-tight mb-4 relative z-10">
              พร้อมจัดตาราง<br />สอนแล้วหรือยัง?
            </h2>
            <p className="text-slate-400 text-sm mb-8 relative z-10">
              อัลกอริทึมเวอร์ชัน v4.2.0-Alpha พร้อมประมวลผลตามเงื่อนไขที่กำหนด
            </p>
            <div className="space-y-4 mb-8">
              {[
                { label: 'ภาระงานครู', active: true },
                { label: 'วิชาหลักช่วงเช้า', active: true },
                { label: 'สลับห้องปฏิบัติการ', active: false },
              ].map((c, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 bg-slate-700/50 rounded-2xl border border-slate-600/50">
                  <span className="text-slate-300 text-xs font-medium">{c.label}</span>
                  <div className={`w-8 h-4 rounded-full flex items-center px-0.5 ${c.active ? 'bg-blue-500 justify-end' : 'bg-slate-600 justify-start'}`}>
                    <div className="w-3 h-3 bg-white rounded-full shadow-sm" />
                  </div>
                </div>
              ))}
            </div>
            <button className="mt-auto bg-blue-600 text-white py-4 px-6 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-blue-700 transition-all active:scale-95 shadow-xl shadow-blue-900/20">
              <Plus size={20} />
              เริ่มการประมวลผล
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
