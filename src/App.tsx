/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { AppProvider } from './AppContext';
import { Sidebar } from './components/Sidebar';
import { Dashboard } from './components/Dashboard';
import { SubjectManager } from './components/SubjectManager';
import { TeacherManager } from './components/TeacherManager';
import { ClassroomManager } from './components/ClassroomManager';
import { TeacherLoadManager } from './components/TeacherLoadManager';
import { TimetableGrid } from './components/TimetableGrid';
import { SystemSettings } from './components/SystemSettings';
import { AnimatePresence, motion } from 'framer-motion';

const AppContent: React.FC = () => {
  const [activeTab, setActiveTab] = useState('dashboard');

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard': return <Dashboard />;
      case 'loads': return <TeacherLoadManager />;
      case 'subjects': return <SubjectManager />;
      case 'teachers': return <TeacherManager />;
      case 'classrooms': return <ClassroomManager />;
      case 'timetable': return <TimetableGrid />;
      case 'settings': return <SystemSettings />;
      default: return <Dashboard />;
    }
  };

  return (
    <div className="flex h-screen bg-slate-100 overflow-hidden font-sans selection:bg-blue-500 selection:text-white">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      
      <main className="flex-1 overflow-y-auto bg-slate-100 p-6 md:p-8 relative">
        <div className="max-w-7xl mx-auto relative z-10">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10, filter: 'blur(10px)' }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              exit={{ opacity: 0, y: -10, filter: 'blur(10px)' }}
              transition={{ duration: 0.3, ease: 'circOut' }}
            >
              {renderContent()}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}

