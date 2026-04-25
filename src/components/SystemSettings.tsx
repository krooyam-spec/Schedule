import React, { useState } from 'react';
import { useAppState } from '../AppContext';
import { Save, Plus, Trash2, Clock, School, Coffee, Layers, Database, RefreshCw, Server } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { ActivityPeriod, DayOfWeek, THAI_DAYS } from '../types';

export const SystemSettings: React.FC = () => {
  const { settings, setSettings, syncSettings } = useAppState();
  const [localSettings, setLocalSettings] = useState(settings);
  const [activeTab, setActiveTab] = useState<'general' | 'database'>('general');
  const [isSaving, setIsSaving] = useState(false);
  const [isUpdatingDb, setIsUpdatingDb] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      setSettings(localSettings);
      await syncSettings(localSettings);
      alert('บันทึกการตั้งค่าเรียบร้อยแล้ว');
    } catch (error) {
      console.error('Failed to save settings:', error);
      alert('เกิดข้อผิดพลาดในการบันทึก');
    } finally {
      setIsSaving(false);
    }
  };

  const handleUpdateDbSchema = async () => {
    if (!confirm('ยืนยันระบบจะทำการสร้าง Table ในฐานข้อมูล MySQL อัตโนมัติ (ข้อมูลเดิมจะไม่หาย หาก Table มีอยู่แล้ว)')) return;
    
    setIsUpdatingDb(true);
    try {
      const res = await fetch('/api/db/update-schema', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(localSettings.dbConfig)
      });
      const data = await res.json();
      if (data.success) {
        alert('อัพเดทโครงสร้างฐานข้อมูลสำเร็จ');
      } else {
        alert('ผิดพลาด: ' + data.error);
      }
    } catch (error) {
      console.error('DB Update error:', error);
      alert('เกิดข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์');
    } finally {
      setIsUpdatingDb(false);
    }
  };

  const addActivity = () => {
    const newActivity: ActivityPeriod = {
      id: Math.random().toString(36).substr(2, 9),
      name: 'กิจกรรมใหม่',
      day: 'Monday',
      period: 1,
    };
    setLocalSettings({
      ...localSettings,
      activities: [...localSettings.activities, newActivity]
    });
  };

  const removeActivity = (id: string) => {
    setLocalSettings({
      ...localSettings,
      activities: localSettings.activities.filter(a => a.id !== id)
    });
  };

  const updateActivity = (id: string, field: keyof ActivityPeriod, value: any) => {
    setLocalSettings({
      ...localSettings,
      activities: localSettings.activities.map(a => 
        a.id === id ? { ...a, [field]: value } : a
      )
    });
  };

  return (
    <div className="space-y-8 pb-20">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 tracking-tight">ตั้งค่าระบบ</h1>
          <p className="text-slate-500 mt-1">กำหนดโครงสร้างเวลาและข้อมูลโรงเรียน</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white px-6 py-2.5 rounded-2xl font-bold transition-all shadow-lg shadow-blue-200"
          >
            <Save size={20} />
            {isSaving ? 'กำลังบันทึก...' : 'บันทึกการตั้งค่า'}
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 p-1 bg-slate-100 rounded-2xl w-fit">
        <button
          onClick={() => setActiveTab('general')}
          className={`px-6 py-2 rounded-xl text-sm font-bold transition-all ${
            activeTab === 'general' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          ตั้งค่าทั่วไป
        </button>
        <button
          onClick={() => setActiveTab('database')}
          className={`px-6 py-2 rounded-xl text-sm font-bold transition-all ${
            activeTab === 'database' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          จัดการฐานข้อมูล (MySQL)
        </button>
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'general' ? (
          <motion.div
            key="general"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-8"
          >
            {/* Basic Info */}
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 space-y-6">
              <div className="flex items-center gap-3 text-blue-600 font-bold text-lg mb-2">
                <School size={24} />
                <span>ข้อมูลโรงเรียน</span>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">ชื่อโรงเรียน</label>
                  <input
                    type="text"
                    value={localSettings.schoolName}
                    onChange={e => setLocalSettings({ ...localSettings, schoolName: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all"
                    placeholder="ระบุชื่อโรงเรียน"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">ปีการศึกษา</label>
                    <input
                      type="text"
                      value={localSettings.academicYear}
                      onChange={e => setLocalSettings({ ...localSettings, academicYear: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all"
                      placeholder="เช่น 2567"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">ภาคเรียน</label>
                    <select
                      value={localSettings.semester}
                      onChange={e => setLocalSettings({ ...localSettings, semester: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all"
                    >
                      <option value="1">1</option>
                      <option value="2">2</option>
                      <option value="ฤดูร้อน">ฤดูร้อน</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* Time Structure */}
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 space-y-6">
              <div className="flex items-center gap-3 text-blue-600 font-bold text-lg mb-2">
                <Clock size={24} />
                <span>โครงสร้างเวลาเรียน</span>
              </div>
              
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">จำนวนคาบต่อวัน</label>
                    <input
                      type="number"
                      value={localSettings.totalPeriods}
                      onChange={e => setLocalSettings({ ...localSettings, totalPeriods: parseInt(e.target.value) })}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">เวลาที่ใช้ต่อคาบ (นาที)</label>
                    <input
                      type="number"
                      value={localSettings.periodDuration}
                      onChange={e => setLocalSettings({ ...localSettings, periodDuration: parseInt(e.target.value) })}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">เวลาเริ่มเรียน (คาบที่ 1)</label>
                    <input
                      type="time"
                      value={localSettings.startTime}
                      onChange={e => setLocalSettings({ ...localSettings, startTime: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5 flex items-center gap-2">
                      <Coffee size={14} className="text-orange-500" />
                      พักกลางวัน (คาบที่)
                    </label>
                    <input
                      type="number"
                      value={localSettings.lunchPeriod}
                      onChange={e => setLocalSettings({ ...localSettings, lunchPeriod: parseInt(e.target.value) })}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Activity Periods */}
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 space-y-6 md:col-span-2">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3 text-blue-600 font-bold text-lg">
                  <Layers size={24} />
                  <span>คาบกิจกรรมส่วนกลาง (กิจกรรมชุมนุม/ลูกเสือ/พัฒนาผู้เรียน)</span>
                </div>
                <button
                  onClick={addActivity}
                  className="flex items-center gap-2 text-blue-600 hover:bg-blue-50 px-4 py-2 rounded-xl border border-blue-100 transition-all font-bold"
                >
                  <Plus size={20} />
                  เพิ่มกิจกรรม
                </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <AnimatePresence>
                  {localSettings.activities.map((activity) => (
                    <motion.div
                      key={activity.id}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      className="p-4 border border-slate-100 bg-slate-50/50 rounded-2xl relative group"
                    >
                      <button
                        onClick={() => removeActivity(activity.id)}
                        className="absolute -top-2 -right-2 p-1.5 bg-red-100 text-red-500 hover:bg-red-200 rounded-full opacity-0 group-hover:opacity-100 transition-all shadow-sm"
                      >
                        <Trash2 size={14} />
                      </button>
                      
                      <div className="space-y-3">
                        <input
                          type="text"
                          value={activity.name}
                          onChange={e => updateActivity(activity.id, 'name', e.target.value)}
                          className="w-full px-3 py-2 bg-white rounded-lg border border-slate-200 focus:border-blue-500 outline-none text-sm font-bold"
                          placeholder="ชื่อกิจกรรม"
                        />
                        
                        <div className="grid grid-cols-2 gap-2">
                          <select
                            value={activity.day}
                            onChange={e => updateActivity(activity.id, 'day', e.target.value)}
                            className="px-2 py-2 bg-white rounded-lg border border-slate-200 text-xs outline-none"
                          >
                            {Object.entries(THAI_DAYS).map(([eng, thai]) => (
                              <option key={eng} value={eng}>{thai}</option>
                            ))}
                          </select>
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-slate-500">คาบที่:</span>
                            <input
                              type="number"
                              value={activity.period}
                              onChange={e => updateActivity(activity.id, 'period', parseInt(e.target.value))}
                              className="w-full px-2 py-2 bg-white rounded-lg border border-slate-200 text-xs outline-none"
                            />
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="database"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 space-y-8"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 text-blue-600 font-bold text-xl">
                <Server size={28} />
                <span>MySQL Connection Settings</span>
              </div>
              <button
                onClick={handleUpdateDbSchema}
                disabled={isUpdatingDb}
                className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-300 text-white px-6 py-2.5 rounded-2xl font-bold transition-all shadow-lg shadow-emerald-100"
              >
                <RefreshCw size={20} className={isUpdatingDb ? 'animate-spin' : ''} />
                {isUpdatingDb ? 'กำลังอัพเดทโครงสร้าง...' : 'อัพเดทฐานข้อมูลอัตโนมัติ'}
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Host / IP Address</label>
                <input
                  type="text"
                  value={localSettings.dbConfig?.host}
                  onChange={e => setLocalSettings({ ...localSettings, dbConfig: { ...localSettings.dbConfig!, host: e.target.value } })}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all"
                  placeholder="เช่น localhost หรือ 127.0.0.1"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Database Name</label>
                <input
                  type="text"
                  value={localSettings.dbConfig?.database}
                  onChange={e => setLocalSettings({ ...localSettings, dbConfig: { ...localSettings.dbConfig!, database: e.target.value } })}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all"
                  placeholder="ชื่อฐานข้อมูล"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Username</label>
                <input
                  type="text"
                  value={localSettings.dbConfig?.user}
                  onChange={e => setLocalSettings({ ...localSettings, dbConfig: { ...localSettings.dbConfig!, user: e.target.value } })}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all"
                  placeholder="เช่น root"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Password</label>
                <input
                  type="password"
                  value={localSettings.dbConfig?.password}
                  onChange={e => setLocalSettings({ ...localSettings, dbConfig: { ...localSettings.dbConfig!, password: e.target.value } })}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all"
                  placeholder="รหัสผ่านฐานข้อมูล"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Port</label>
                <input
                  type="number"
                  value={localSettings.dbConfig?.port}
                  onChange={e => setLocalSettings({ ...localSettings, dbConfig: { ...localSettings.dbConfig!, port: parseInt(e.target.value) } })}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all"
                />
              </div>
            </div>

            <div className="bg-amber-50 p-4 rounded-2xl border border-amber-100 flex gap-3 text-amber-800">
              <Database size={20} className="shrink-0 mt-0.5" />
              <div className="text-sm">
                <p className="font-bold mb-1">คำแนะนำ:</p>
                <ul className="list-disc ml-4 space-y-1">
                  <li>ระบบจะทำการเชื่อมต่อ MySQL ตามค่าที่ระบุ และทำการตรวจสอบโครงสร้าง Table</li>
                  <li>ปุ่ม "อัพเดทฐานข้อมูลอัตโนมัติ" จะสร้าง Table ที่จำเป็น (subjects, teachers, classrooms, timetable, settings)</li>
                  <li>หากมีการเชื่อมต่อ MySQL ระบบจะสลับไปใช้ฐานข้อมูล MySQL แทนไฟล์ JSON ในโฟลเดอร์ data ทันที</li>
                </ul>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
