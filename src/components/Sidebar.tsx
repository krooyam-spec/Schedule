import React from 'react';
import { motion } from 'framer-motion';
import { 
  LayoutDashboard, 
  BookOpen, 
  Users, 
  School, 
  CalendarDays, 
  Settings,
  ChevronRight,
  Menu,
  X
} from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab }) => {
  const [isOpen, setIsOpen] = React.useState(true);

  const menuItems = [
    { id: 'dashboard', icon: LayoutDashboard, label: 'แดชบอร์ด' },
    { id: 'subjects', icon: BookOpen, label: 'วิชาเรียน' },
    { id: 'teachers', icon: Users, label: 'ครูผู้สอน' },
    { id: 'classrooms', icon: School, label: 'ห้องเรียน/กลุ่ม' },
    { id: 'timetable', icon: CalendarDays, label: 'ตารางสอน' },
  ];

  return (
    <div className={`h-screen bg-white text-slate-500 border-r border-slate-200 transition-all duration-300 flex flex-col ${isOpen ? 'w-64' : 'w-20'}`}>
      <div className="p-6 flex items-center justify-between border-b border-slate-100">
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="font-bold text-slate-800 text-xl tracking-tight"
          >
            Siam<span className="text-blue-600">Schedule</span>
          </motion.div>
        )}
        <button 
          onClick={() => setIsOpen(!isOpen)}
          className="p-1.5 hover:bg-slate-50 rounded-lg transition-colors text-slate-400 hover:text-slate-600"
        >
          {isOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      <nav className="flex-1 p-4 space-y-2 overflow-y-auto overflow-x-hidden">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`w-full flex items-center gap-3 p-3 rounded-2xl transition-all group relative ${
              activeTab === item.id 
                ? 'bg-blue-50 text-blue-600 font-bold' 
                : 'hover:bg-slate-50 hover:text-slate-800'
            }`}
          >
            <item.icon size={22} className={activeTab === item.id ? 'text-blue-600' : 'group-hover:text-slate-800 transition-colors'} />
            {isOpen && (
              <motion.span
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="whitespace-nowrap"
              >
                {item.label}
              </motion.span>
            )}
          </button>
        ))}
      </nav>

      <div className="p-4 border-t border-slate-100">
        <button className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 transition-all text-slate-400 hover:text-slate-800">
          <Settings size={22} />
          {isOpen && <span className="font-medium">ตั้งค่าระบบ</span>}
        </button>
      </div>
    </div>
  );
};
