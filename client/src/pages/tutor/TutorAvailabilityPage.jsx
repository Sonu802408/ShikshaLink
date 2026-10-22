import React, { useState, useEffect } from 'react';
import { Calendar, Save, Check, Plus, Clock } from 'lucide-react';
import { apiRequest } from '../../services/api';
import { useToast } from '../../context/ToastContext';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const DEFAULT_SLOTS = [
  { startTime: '16:00', endTime: '17:30' },
  { startTime: '18:00', endTime: '19:30' },
  { startTime: '19:30', endTime: '21:00' }
];

export const TutorAvailabilityPage = () => {
  const { showToast } = useToast();
  const [availability, setAvailability] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchAvailability = async () => {
      try {
        const res = await apiRequest('/tutors/profile/me');
        if (res.success && res.profile) {
          const existing = res.profile.availability || [];
          // Ensure all 7 days are represented
          const fullWeek = DAYS.map((day) => {
            const found = existing.find((d) => d.dayOfWeek === day);
            if (found && found.slots?.length > 0) {
              return found;
            }
            return {
              dayOfWeek: day,
              slots: DEFAULT_SLOTS.map((s) => ({ ...s, isAvailable: day !== 'Sunday' }))
            };
          });
          setAvailability(fullWeek);
        }
      } catch (err) {
        showToast('Failed to load availability', 'error');
      } finally {
        setLoading(false);
      }
    };
    fetchAvailability();
  }, [showToast]);

  const toggleSlot = (dayIdx, slotIdx) => {
    setAvailability((prev) => {
      const copy = JSON.parse(JSON.stringify(prev));
      const slot = copy[dayIdx].slots[slotIdx];
      slot.isAvailable = !slot.isAvailable;
      return copy;
    });
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await apiRequest('/tutors/availability/me', {
        method: 'PUT',
        body: JSON.stringify({ availability })
      });
      if (res.success) {
        showToast('Weekly availability calendar saved!', 'success');
      }
    } catch (err) {
      showToast(err.message || 'Failed to save availability', 'error');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-xs text-slate-400">Loading schedule...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-slate-900">Weekly Availability Schedule</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Click time slots to toggle your availability for parent demo & tuition requests
          </p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="px-6 py-2.5 rounded-2xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-sm flex items-center gap-2 disabled:opacity-50"
        >
          <Save className="w-4 h-4" />
          {saving ? 'Saving...' : 'Save Schedule'}
        </button>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-7 gap-3">
          {availability.map((dayItem, dayIdx) => (
            <div
              key={dayItem.dayOfWeek}
              className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2.5"
            >
              <div className="font-bold text-xs text-slate-900 text-center border-b border-slate-200 pb-2">
                {dayItem.dayOfWeek.slice(0, 3)}
              </div>

              <div className="space-y-2">
                {dayItem.slots?.map((slot, slotIdx) => (
                  <button
                    key={slotIdx}
                    type="button"
                    onClick={() => toggleSlot(dayIdx, slotIdx)}
                    className={`w-full py-2 px-1.5 rounded-xl text-[11px] font-bold text-center transition-all ${
                      slot.isAvailable
                        ? 'bg-teal-600 text-white shadow-2xs'
                        : 'bg-white border border-slate-200 text-slate-400 hover:border-slate-300'
                    }`}
                  >
                    {slot.startTime} - {slot.endTime}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between text-xs text-slate-600">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5">
              <span className="w-3.5 h-3.5 rounded-md bg-teal-600 inline-block"></span>
              Available Slot
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3.5 h-3.5 rounded-md bg-white border border-slate-300 inline-block"></span>
              Unavailable
            </span>
          </div>
          <span className="text-[11px] text-slate-400">Slots auto-synchronize with booking conflict checks</span>
        </div>
      </div>
    </div>
  );
};
