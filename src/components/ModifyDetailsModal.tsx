import React, { useState, useEffect } from 'react';
import { Booking } from '../types';

interface ModifyDetailsModalProps {
  booking: Booking | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (bookingId: string, updated: Partial<Booking>) => void;
}

const ALL_AMENITIES = [
  'Projector',
  'Video Bar 4K',
  'Enterprise Mesh',
  'Whiteboard',
  'Dual Smart Display',
  'Acoustic Wall Panel',
  'Polycom Studio',
  'Catering Station'
];

export const ModifyDetailsModal: React.FC<ModifyDetailsModalProps> = ({
  booking,
  isOpen,
  onClose,
  onSave
}) => {
  const [purpose, setPurpose] = useState('');
  const [department, setDepartment] = useState('');
  const [notes, setNotes] = useState('');
  const [amenities, setAmenities] = useState<string[]>([]);
  const [attendeesCount, setAttendeesCount] = useState<number>(8);

  useEffect(() => {
    if (booking) {
      setPurpose(booking.purpose);
      setDepartment(booking.department);
      setNotes(booking.notes || '');
      setAmenities(booking.amenities || []);
      setAttendeesCount(booking.attendeesCount || 8);
    }
  }, [booking]);

  if (!isOpen || !booking) return null;

  const toggleAmenity = (item: string) => {
    if (amenities.includes(item)) {
      setAmenities(amenities.filter((a) => a !== item));
    } else {
      setAmenities([...amenities, item]);
    }
  };

  const handleSave = () => {
    if (!purpose.trim()) return;
    onSave(booking.id, {
      purpose,
      department,
      notes,
      amenities,
      attendeesCount
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0b1c30]/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="bg-white w-full max-w-lg rounded-2xl shadow-xl p-6 flex flex-col gap-4 border border-[#e2e8f0]"
        role="dialog"
        aria-modal="true"
      >
        <div className="flex items-center justify-between border-b border-[#e2e8f0] pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-[#eff4ff] flex items-center justify-center text-[#0b1c30]">
              <span className="material-symbols-outlined text-[20px]">edit_note</span>
            </div>
            <div className="flex flex-col">
              <h3 className="font-['Plus_Jakarta_Sans'] text-lg font-bold text-[#0b1c30]">
                Modify Reservation Details
              </h3>
              <span className="text-[12px] text-[#45464d]">
                {booking.roomName} • #{booking.id}
              </span>
            </div>
          </div>
          <button 
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-[#45464d] hover:bg-[#eff4ff] transition-colors"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        <div className="flex flex-col gap-3.5">
          <div className="flex flex-col gap-1.5">
            <label className="text-[13px] font-semibold text-[#0b1c30]">
              Meeting Purpose / Subject
            </label>
            <input 
              type="text"
              value={purpose}
              onChange={(e) => setPurpose(e.target.value)}
              placeholder="e.g. Cross-Department Alignment"
              className="w-full px-3.5 py-2 rounded-lg bg-[#eff4ff] border border-[#dce9ff] text-sm text-[#0b1c30] focus:outline-none focus:bg-white focus:border-[#006a61] transition-all"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <label className="text-[13px] font-semibold text-[#0b1c30]">
                Department / Team
              </label>
              <input 
                type="text"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="w-full px-3.5 py-2 rounded-lg bg-[#eff4ff] border border-[#dce9ff] text-sm text-[#0b1c30] focus:outline-none focus:bg-white focus:border-[#006a61]"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[13px] font-semibold text-[#0b1c30]">
                Estimated Attendees
              </label>
              <input 
                type="number"
                min="1"
                max="30"
                value={attendeesCount}
                onChange={(e) => setAttendeesCount(parseInt(e.target.value, 10) || 1)}
                className="w-full px-3.5 py-2 rounded-lg bg-[#eff4ff] border border-[#dce9ff] text-sm text-[#0b1c30] focus:outline-none focus:bg-white focus:border-[#006a61]"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[13px] font-semibold text-[#0b1c30]">
              Reserved Amenities
            </label>
            <div className="flex flex-wrap gap-2">
              {ALL_AMENITIES.map((item) => {
                const isSelected = amenities.includes(item);
                return (
                  <button
                    key={item}
                    type="button"
                    onClick={() => toggleAmenity(item)}
                    className={`px-2.5 py-1 rounded text-[12px] font-medium transition-colors flex items-center gap-1 ${
                      isSelected
                        ? 'bg-[#006a61] text-white'
                        : 'bg-[#eff4ff] text-[#45464d] hover:bg-[#dce9ff] border border-[#dce9ff]'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[14px]">
                      {isSelected ? 'check' : 'add'}
                    </span>
                    <span>{item}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[13px] font-semibold text-[#0b1c30]">
              Special Requests or AV Notes
            </label>
            <textarea 
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Need video conference credentials setup..."
              className="w-full px-3.5 py-2 rounded-lg bg-[#eff4ff] border border-[#dce9ff] text-sm text-[#0b1c30] focus:outline-none focus:bg-white focus:border-[#006a61] transition-all resize-none"
            />
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-2 border-t border-[#e2e8f0]">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-sm font-medium text-[#0b1c30] hover:bg-[#eff4ff] transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="px-4 py-2 bg-[#000000] text-white hover:bg-[#131b2e] rounded-xl text-sm font-semibold shadow-sm transition-all flex items-center gap-1.5"
          >
            <span className="material-symbols-outlined text-[16px]">save</span>
            <span>Update Details</span>
          </button>
        </div>
      </div>
    </div>
  );
};
