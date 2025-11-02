import React, { useState, useEffect } from 'react';
import { ClockIcon } from 'lucide-react';

// Time slots from 8 AM to 11 PM (8:00 - 23:00)
const TIME_SLOTS = [
  '8:00 AM', '9:00 AM', '10:00 AM', '11:00 AM', '12:00 PM',
  '1:00 PM', '2:00 PM', '3:00 PM', '4:00 PM', '5:00 PM',
  '6:00 PM', '7:00 PM', '8:00 PM', '9:00 PM', '10:00 PM', '11:00 PM'
];

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export interface TimeSlot {
  day: string;
  time: string;
}

interface AvailabilityCalendarProps {
  selectedSlots: TimeSlot[];
  onChange?: (slots: TimeSlot[]) => void;
  editable?: boolean;
}

const AvailabilityCalendar: React.FC<AvailabilityCalendarProps> = ({
  selectedSlots,
  onChange,
  editable = true
}) => {
  const [slots, setSlots] = useState<TimeSlot[]>(selectedSlots);
  const [isDragging, setIsDragging] = useState(false);
  const [dragMode, setDragMode] = useState<'select' | 'deselect'>('select');

  // Update internal state when prop changes
  useEffect(() => {
    setSlots(selectedSlots);
  }, [selectedSlots]);

  const isSlotSelected = (day: string, time: string): boolean => {
    return slots.some(slot => slot.day === day && slot.time === time);
  };

  const toggleSlot = (day: string, time: string) => {
    if (!editable) return;

    const isSelected = isSlotSelected(day, time);
    let newSlots: TimeSlot[];

    if (isSelected) {
      newSlots = slots.filter(slot => !(slot.day === day && slot.time === time));
    } else {
      newSlots = [...slots, { day, time }];
    }

    setSlots(newSlots);
    onChange?.(newSlots);
  };

  const handleMouseDown = (day: string, time: string) => {
    if (!editable) return;

    setIsDragging(true);
    const isSelected = isSlotSelected(day, time);
    setDragMode(isSelected ? 'deselect' : 'select');
    toggleSlot(day, time);
  };

  const handleMouseEnter = (day: string, time: string) => {
    if (!editable || !isDragging) return;

    const isSelected = isSlotSelected(day, time);

    // Only toggle if it matches the drag mode
    if (dragMode === 'select' && !isSelected) {
      toggleSlot(day, time);
    } else if (dragMode === 'deselect' && isSelected) {
      toggleSlot(day, time);
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Calculate total hours per week
  const totalHours = slots.length;

  // Prevent text selection during drag
  useEffect(() => {
    if (isDragging) {
      document.body.style.userSelect = 'none';
    } else {
      document.body.style.userSelect = '';
    }

    return () => {
      document.body.style.userSelect = '';
    };
  }, [isDragging]);

  return (
    <div className="w-full" onMouseUp={handleMouseUp} onMouseLeave={handleMouseUp}>
      {/* Header with total hours */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <ClockIcon className="h-5 w-5 text-orange-500 mr-2" />
          <h3 className="text-lg font-semibold text-slate-700">
            Weekly Availability
          </h3>
        </div>
        <div className="text-sm text-slate-600">
          <span className="font-medium">{totalHours} hours/week</span>
        </div>
      </div>

      {editable && (
        <p className="text-sm text-slate-600 mb-4">
          Click and drag to select your available time slots
        </p>
      )}

      {/* Calendar Grid */}
      <div className="overflow-x-auto">
        <div className="inline-block min-w-full">
          {/* Days Header */}
          <div className="flex border-b border-slate-200">
            <div className="w-24 flex-shrink-0"></div>
            {DAYS.map(day => (
              <div
                key={day}
                className="flex-1 min-w-[60px] text-center py-2 font-medium text-slate-700 text-sm"
              >
                {day}
              </div>
            ))}
          </div>

          {/* Time Slots Grid */}
          <div className="border-l border-slate-200">
            {TIME_SLOTS.map((time, timeIndex) => (
              <div key={time} className="flex border-b border-slate-200">
                {/* Time Label */}
                <div className="w-24 flex-shrink-0 py-2 px-2 text-xs text-slate-600 text-right border-r border-slate-200">
                  {time}
                </div>

                {/* Day Slots */}
                {DAYS.map(day => {
                  const selected = isSlotSelected(day, time);
                  return (
                    <div
                      key={`${day}-${time}`}
                      className={`flex-1 min-w-[60px] p-1 border-r border-slate-200 transition-colors ${
                        editable ? 'cursor-pointer' : 'cursor-default'
                      }`}
                      onMouseDown={() => handleMouseDown(day, time)}
                      onMouseEnter={() => handleMouseEnter(day, time)}
                    >
                      <div
                        className={`h-8 rounded transition-all ${
                          selected
                            ? 'bg-gradient-to-r from-orange-500 to-red-500'
                            : editable
                            ? 'bg-slate-50 hover:bg-slate-100'
                            : 'bg-white'
                        }`}
                      />
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="mt-4 flex items-center justify-center text-sm text-slate-600">
        <div className="flex items-center mr-6">
          <div className="w-4 h-4 bg-gradient-to-r from-orange-500 to-red-500 rounded mr-2"></div>
          <span>Available</span>
        </div>
        <div className="flex items-center">
          <div className="w-4 h-4 bg-slate-50 border border-slate-200 rounded mr-2"></div>
          <span>Unavailable</span>
        </div>
      </div>
    </div>
  );
};

export default AvailabilityCalendar;
