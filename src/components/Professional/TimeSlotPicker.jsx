import { useState } from 'react';
import { motion } from 'framer-motion';

const TimeSlotPicker = ({ 
  selectedSlots = [], 
  onChange, 
  minTime = '08:00', 
  maxTime = '20:00',
  interval = 30 
}) => {
  const generateTimeSlots = () => {
    const slots = [];
    const [minHour, minMinute] = minTime.split(':').map(Number);
    const [maxHour, maxMinute] = maxTime.split(':').map(Number);
    
    let currentHour = minHour;
    let currentMinute = minMinute;
    
    while (
      currentHour < maxHour || 
      (currentHour === maxHour && currentMinute <= maxMinute)
    ) {
      const timeString = `${String(currentHour).padStart(2, '0')}:${String(currentMinute).padStart(2, '0')}`;
      slots.push(timeString);
      
      currentMinute += interval;
      if (currentMinute >= 60) {
        currentHour += 1;
        currentMinute = 0;
      }
    }
    
    return slots;
  };

  const timeSlots = generateTimeSlots();

  const formatTime = (time) => {
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  const isSelected = (time) => selectedSlots.includes(time);

  const toggleSlot = (time) => {
    if (isSelected(time)) {
      onChange(selectedSlots.filter(slot => slot !== time));
    } else {
      onChange([...selectedSlots, time]);
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between mb-2">
        <h4 className="text-sm font-medium text-gray-700">Select Time Slots</h4>
        <p className="text-xs text-gray-500">{selectedSlots.length} selected</p>
      </div>
      
      <div className="grid grid-cols-3 gap-2 max-h-64 overflow-y-auto p-1">
        {timeSlots.map((time) => (
          <motion.button
            key={time}
            whileTap={{ scale: 0.95 }}
            onClick={() => toggleSlot(time)}
            className={`
              px-3 py-2 rounded-lg text-sm font-medium
              transition-all duration-200
              ${isSelected(time)
                ? 'bg-indigo-500 text-white shadow-md'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }
            `}
          >
            {formatTime(time)}
          </motion.button>
        ))}
      </div>
    </div>
  );
};

export default TimeSlotPicker;
